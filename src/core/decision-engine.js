/**
 * Decision Engine
 * Determines which processing flow to use based on bookmark metrics
 */

import { calculateBookmarkMetrics, canUseSingleShot } from '../utils/metrics.js';
import modelsConfig from '../config/models.js';

/**
 * Decide which processing flow to use
 * @param {Object} bookmarkTree - Full bookmark tree
 * @param {string} selectedModel - User-selected model
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Decision object
 */
export async function decideProcessingFlow(bookmarkTree, selectedModel, options = {}) {
  // Calculate metrics
  const metrics = await calculateBookmarkMetrics(bookmarkTree);

  // Get model capabilities
  const model = modelsConfig.models[selectedModel];
  if (!model) {
    throw new Error(`Unknown model: ${selectedModel}`);
  }

  // Decision logic
  const decision = {
    flow: null,
    metrics,
    model: selectedModel,
    modelCapabilities: model,
    reasoning: [],
    warnings: [],
    estimatedCost: null,
    estimatedTime: null
  };

  // Check tier
  const tier = metrics.tier;
  decision.tier = tier;

  // T4 - Backend required
  if (tier === 'T4') {
    decision.flow = 'backend-assisted';
    decision.reasoning.push('Dataset exceeds extension limits (T4 tier)');
    decision.warnings.push('This requires backend service. Extension-only mode cannot handle this dataset.');
    return decision;
  }

  // Check if single-shot is viable
  const singleShotViable = canUseSingleShot(metrics, selectedModel);

  if (singleShotViable) {
    decision.flow = 'single-shot';
    decision.reasoning.push(`Dataset fits in single request (${metrics.bookmarkCount} bookmarks, ${metrics.gzipKB} KB gzipped)`);
    decision.reasoning.push(`Model ${selectedModel} has ${model.contextWindow} token context window`);

    // Estimate cost
    const inputTokens = metrics.estimatedTokens;
    const outputTokens = Math.ceil(metrics.bookmarkCount * 10); // Rough estimate
    decision.estimatedCost = (
      (inputTokens / 1000) * model.costPer1kInput +
      (outputTokens / 1000) * model.costPer1kOutput
    ).toFixed(4);

    // Estimate time (single request)
    decision.estimatedTime = '30-60 seconds';

  } else {
    decision.flow = 'improved-chunking';
    decision.reasoning.push(`Dataset exceeds single-shot thresholds (${metrics.bookmarkCount} bookmarks)`);
    decision.reasoning.push(`Falling back to improved chunking with global context`);

    // Estimate chunks
    const chunkSize = modelsConfig.thresholds.chunkSize;
    const numChunks = Math.ceil(metrics.bookmarkCount / chunkSize);
    decision.numChunks = numChunks;

    // Estimate cost (multiple requests)
    const tokensPerChunk = Math.ceil(metrics.estimatedTokens / numChunks);
    const outputTokensPerChunk = Math.ceil((metrics.bookmarkCount / numChunks) * 10);
    decision.estimatedCost = (
      numChunks * (
        (tokensPerChunk / 1000) * model.costPer1kInput +
        (outputTokensPerChunk / 1000) * model.costPer1kOutput
      )
    ).toFixed(4);

    // Estimate time (multiple requests with delays)
    const timePerChunk = 5; // seconds
    const delayBetweenChunks = 2; // seconds
    decision.estimatedTime = `${Math.ceil(numChunks * (timePerChunk + delayBetweenChunks) / 60)} minutes`;
  }

  // Add warnings based on metrics
  if (metrics.bookmarkCount > 5000) {
    decision.warnings.push('Large dataset may take several minutes to process');
  }

  if (metrics.estimatedTokens > model.contextWindow * 0.8) {
    decision.warnings.push('Dataset approaching model context limit');
  }

  // Force mode override (if specified)
  if (options.forceFlow) {
    decision.flow = options.forceFlow;
    decision.reasoning.push(`Flow overridden by user: ${options.forceFlow}`);
  }

  return decision;
}

/**
 * Validate decision before execution
 * @param {Object} decision - Decision object from decideProcessingFlow
 * @returns {Object} Validation result
 */
export function validateDecision(decision) {
  const validation = {
    valid: true,
    errors: [],
    canProceed: true
  };

  // Check if flow is supported
  const supportedFlows = ['single-shot', 'improved-chunking', 'backend-assisted'];
  if (!supportedFlows.includes(decision.flow)) {
    validation.valid = false;
    validation.errors.push(`Unsupported flow: ${decision.flow}`);
  }

  // Check if model exists
  if (!modelsConfig.models[decision.model]) {
    validation.valid = false;
    validation.errors.push(`Unknown model: ${decision.model}`);
  }

  // Check if backend is required but not available
  if (decision.flow === 'backend-assisted') {
    validation.canProceed = false;
    validation.errors.push('Backend service required but not configured');
  }

  // Check if dataset is too large for extension
  if (decision.metrics.rawBytes > 10 * 1024 * 1024) { // 10MB
    validation.canProceed = false;
    validation.errors.push('Dataset exceeds 10MB extension memory limit');
  }

  return validation;
}

/**
 * Get human-readable explanation of decision
 * @param {Object} decision - Decision object
 * @returns {string} Explanation text
 */
export function explainDecision(decision) {
  const parts = [];

  parts.push(`📊 **Analysis Results:**`);
  parts.push(`- Bookmarks: ${decision.metrics.bookmarkCount.toLocaleString()}`);
  parts.push(`- Size: ${decision.metrics.rawKB} KB (${decision.metrics.gzipKB} KB compressed)`);
  parts.push(`- Estimated tokens: ${decision.metrics.estimatedTokens.toLocaleString()}`);
  parts.push(`- Tier: ${decision.tier}`);
  parts.push(``);

  parts.push(`🎯 **Selected Flow:** ${decision.flow.toUpperCase()}`);
  parts.push(``);

  parts.push(`💡 **Reasoning:**`);
  decision.reasoning.forEach(reason => {
    parts.push(`- ${reason}`);
  });
  parts.push(``);

  parts.push(`💰 **Estimated Cost:** $${decision.estimatedCost}`);
  parts.push(`⏱️ **Estimated Time:** ${decision.estimatedTime}`);

  if (decision.warnings.length > 0) {
    parts.push(``);
    parts.push(`⚠️ **Warnings:**`);
    decision.warnings.forEach(warning => {
      parts.push(`- ${warning}`);
    });
  }

  return parts.join('\n');
}
