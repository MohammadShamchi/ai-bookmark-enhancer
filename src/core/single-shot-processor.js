/**
 * Single-Shot Processor
 * Handles single-request bookmark organization flow
 */

import { getBookmarkTree } from './bookmark-operations.js';
import { extractBookmarkStatistics } from '../utils/metrics.js';
import { compressToGzip } from '../utils/compression.js';
import { uploadFile, sendChatCompletion, deleteFile, withRetry } from '../api/openai-client.js';
import { getSystemPromptSingleShot, getUserPromptSingleShot } from '../config/prompts.js';
import { validateAIResponse } from '../validators/response-validator.js';
import { exportAndDownload } from '../utils/html-export.js';

/**
 * Process bookmarks using single-shot flow
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model name
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Results
 */
export async function processSingleShot(apiKey, model, onProgress) {
  const startTime = Date.now();
  let uploadedFileId = null;

  try {
    // Step 1: Export bookmarks
    onProgress({ stage: 'exporting', progress: 0, message: 'Exporting bookmarks...' });
    const bookmarkTree = await getBookmarkTree();
    const stats = extractBookmarkStatistics(bookmarkTree);

    // Step 2: Create HTML backup
    onProgress({ stage: 'backup', progress: 10, message: 'Creating backup...' });
    await exportAndDownload();

    // Step 3: Compress data
    onProgress({ stage: 'compressing', progress: 20, message: 'Compressing data...' });
    const compressedBlob = await compressToGzip(bookmarkTree);

    // Step 4: Upload to OpenAI
    onProgress({ stage: 'uploading', progress: 30, message: 'Uploading to AI...' });
    const fileResult = await withRetry(() =>
      uploadFile(apiKey, compressedBlob, 'assistants')
    );
    uploadedFileId = fileResult.id;

    // Step 5: Send processing request
    onProgress({ stage: 'processing', progress: 50, message: 'AI analyzing bookmarks...' });

    const systemPrompt = getSystemPromptSingleShot({ maxFolders: 20 });
    const userPrompt = getUserPromptSingleShot({ fileId: uploadedFileId }, stats);

    const response = await withRetry(() =>
      sendChatCompletion(apiKey, model, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], {
        jsonMode: true,
        temperature: 0.3,
        maxTokens: 8000
      })
    );

    // Step 6: Parse and validate response
    onProgress({ stage: 'validating', progress: 70, message: 'Validating AI response...' });

    const aiResponse = JSON.parse(response.choices[0].message.content);
    const validation = validateAIResponse(aiResponse, bookmarkTree);

    if (!validation.isValid) {
      throw new Error(`AI response validation failed: ${validation.errors.join(', ')}`);
    }

    // Step 7: Return results (operations will be applied separately)
    onProgress({ stage: 'complete', progress: 100, message: 'Analysis complete!' });

    // Cleanup: Delete uploaded file
    if (uploadedFileId) {
      try {
        await deleteFile(apiKey, uploadedFileId);
      } catch (cleanupError) {
        console.warn('Failed to delete uploaded file:', cleanupError);
      }
    }

    const duration = (Date.now() - startTime) / 1000;

    return {
      success: true,
      operations: aiResponse.operations || [],
      metadata: aiResponse.metadata || {},
      warnings: aiResponse.warnings || [],
      validation,
      stats: {
        duration,
        bookmarksProcessed: stats.totalBookmarks,
        operationsGenerated: (aiResponse.operations || []).length
      }
    };

  } catch (error) {
    // Cleanup on error
    if (uploadedFileId) {
      try {
        await deleteFile(apiKey, uploadedFileId);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    throw error;
  }
}
