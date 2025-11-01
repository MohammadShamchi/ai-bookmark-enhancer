/**
 * AI Bookmark Organizer - Background Service Worker
 * Version 2.0 - Refactored with modular architecture
 *
 * This service worker orchestrates the bookmark organization workflow:
 *
 * ARCHITECTURE:
 * - Uses modular ES6 imports for all business logic
 * - Decision engine automatically selects processing flow (single-shot vs chunking)
 * - Progress callbacks update UI in real-time
 * - Job state management persists across service worker restarts
 *
 * PROCESSING FLOWS:
 * 1. Single-shot: For datasets ≤4.5k bookmarks (uses OpenAI Files API)
 * 2. Improved chunking: For larger datasets (processes in chunks with global context)
 * 3. Backend-assisted: For very large datasets (not yet implemented)
 *
 * MODULE DEPENDENCIES:
 * - bookmark-operations.js: Chrome bookmarks API wrapper
 * - decision-engine.js: Flow selection based on metrics
 * - single-shot-processor.js: Single-request processing flow
 * - chunking-processor.js: Multi-chunk processing with reconciliation
 * - operation-executor.js: Applies AI-generated operations to bookmarks
 */

// Import all new modules
import { getBookmarkTree, getAllBookmarks } from './src/core/bookmark-operations.js';
import { decideProcessingFlow, validateDecision, explainDecision } from './src/core/decision-engine.js';
import { processSingleShot } from './src/core/single-shot-processor.js';
import { processChunked } from './src/core/chunking-processor.js';
import { executeOperations, dryRunOperations } from './src/core/operation-executor.js';

// Constants
const JOB_STORAGE_KEY = 'bookmarkOrganizationJob';
const TIMEOUT_MS = 1800000; // 30 minutes

// Handle extension icon click - open organizer in new tab
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
});

// Main message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle organize bookmarks request
  if (request.action === "organizeBookmarks") {
    const selectedModel = request.model || 'gpt-4o';

    startOrganizationProcess(selectedModel)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Organization failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep channel open for async response
  }

  // Handle check job status request
  else if (request.action === "checkJobStatus") {
    checkJobStatus()
      .then((job) => {
        sendResponse(job);
      })
      .catch((error) => {
        console.error('Error checking job status:', error);
        sendResponse(null);
      });

    return true;
  }

  // Handle reset job request
  else if (request.action === 'resetJob') {
    chrome.storage.local.remove(JOB_STORAGE_KEY)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  // Handle emergency stop request
  else if (request.action === 'emergencyStop') {
    console.log('🚨 EMERGENCY STOP TRIGGERED');

    chrome.storage.local.remove(JOB_STORAGE_KEY)
      .then(() => {
        chrome.alarms.clearAll();
        sendResponse({ success: true, message: 'Processing stopped and job cleared' });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  // Handle analyze bookmarks request (for pre-processing display)
  else if (request.action === 'analyzeBookmarks') {
    const selectedModel = request.model || 'gpt-4o';

    getBookmarkTree()
      .then((bookmarkTree) => {
        return decideProcessingFlow(bookmarkTree, selectedModel);
      })
      .then((decision) => {
        sendResponse({
          success: true,
          decision: {
            flow: decision.flow,
            tier: decision.tier,
            estimatedCost: decision.estimatedCost,
            estimatedTime: decision.estimatedTime,
            bookmarkCount: decision.metrics.bookmarkCount,
            reasoning: decision.reasoning,
            warnings: decision.warnings
          }
        });
      })
      .catch((error) => {
        console.error('Analysis failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }

  // Handle debug bookmarks request
  else if (request.action === 'debugBookmarks') {
    console.log('🔍 DEBUGGING BOOKMARKS');

    getAllBookmarks()
      .then((bookmarks) => {
        console.log(`📊 Total bookmarks found: ${bookmarks.length}`);

        // Check for organized folders
        chrome.bookmarks.getChildren('1', (bookmarkBarItems) => {
          const organizedFolders = bookmarkBarItems.filter(item =>
            !item.url && item.title.includes('AI Organized Bookmarks')
          );

          console.log(`📁 AI Organized folders found: ${organizedFolders.length}`);
          organizedFolders.forEach((folder, index) => {
            console.log(`📁 Folder ${index + 1}: "${folder.title}" (ID: ${folder.id})`);
          });

          sendResponse({
            success: true,
            totalBookmarks: bookmarks.length,
            organizedFolders: organizedFolders.length,
            folders: organizedFolders.map(f => ({ title: f.title, id: f.id }))
          });
        });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});

// Alarm listener for cleanup
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'cleanupAlarm') {
    await checkJobStatus(); // This will reset if stuck
  }
});

// Startup listener for clearing running jobs
chrome.runtime.onStartup.addListener(async () => {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY];

  if (job && job.status === 'running') {
    await chrome.storage.local.remove(JOB_STORAGE_KEY);
    console.log('Cleared running job on browser startup');
  }
});

/**
 * Main organization process
 *
 * Orchestrates the complete bookmark organization workflow:
 * 1. Authentication & validation
 * 2. Bookmark analysis & metrics calculation
 * 3. Decision engine selects optimal processing flow
 * 4. Process bookmarks (single-shot or chunking)
 * 5. Validate AI response
 * 6. Execute operations in phases
 * 7. Report results
 *
 * @param {string} selectedModel - AI model to use (e.g., 'gpt-4o')
 * @throws {Error} If any step fails, with detailed error message
 */
async function startOrganizationProcess(selectedModel) {
  console.log(`🚀 Starting organization with model: ${selectedModel}`);

  try {
    // Step 1: Initialize job state
    await updateJobState({
      status: 'running',
      stage: 'initializing',
      progress: 0,
      message: 'Starting bookmark organization...',
      startTime: Date.now()
    });

    // Step 2: Get API key
    await updateJobState({
      stage: 'auth',
      progress: 5,
      message: 'Checking API key...'
    });

    let apiKey;
    try {
      apiKey = await getAPIKey();
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set it in the options page.');
      }
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }

    // Step 3: Get bookmark tree for decision
    await updateJobState({
      stage: 'analyzing',
      progress: 10,
      message: 'Analyzing your bookmarks...'
    });

    let bookmarkTree;
    try {
      bookmarkTree = await getBookmarkTree();
      if (!bookmarkTree || bookmarkTree.length === 0) {
        throw new Error('No bookmarks found. Please ensure you have bookmarks to organize.');
      }
    } catch (error) {
      throw new Error(`Failed to retrieve bookmarks: ${error.message}`);
    }

    // Step 4: Make decision about processing flow
    await updateJobState({
      stage: 'deciding',
      progress: 15,
      message: 'Determining optimal processing strategy...'
    });

    let decision, validation;
    try {
      decision = await decideProcessingFlow(bookmarkTree, selectedModel);
      validation = validateDecision(decision);

      if (!validation.valid || !validation.canProceed) {
        const errorMsg = validation.errors.join('; ');
        throw new Error(`Processing decision invalid: ${errorMsg}`);
      }
    } catch (error) {
      if (error.message.includes('Unknown model')) {
        throw new Error(`Invalid model selected: ${selectedModel}. Please choose a valid model.`);
      }
      throw new Error(`Decision engine failed: ${error.message}`);
    }

    console.log('📊 Processing decision:', decision.flow);
    console.log(explainDecision(decision));

    // Step 5: Update job with decision info
    await updateJobState({
      stage: 'preparing',
      progress: 20,
      message: `Using ${decision.flow} flow...`,
      decision: {
        flow: decision.flow,
        tier: decision.tier,
        estimatedCost: decision.estimatedCost,
        estimatedTime: decision.estimatedTime,
        bookmarkCount: decision.metrics.bookmarkCount
      }
    });

    // Step 6: Process bookmarks based on decision
    let result;

    try {
      if (decision.flow === 'single-shot') {
        console.log('📦 Using single-shot processing');

        result = await processSingleShot(apiKey, selectedModel, (progress) => {
          updateJobState({
            stage: progress.stage,
            progress: 20 + (progress.progress * 0.6), // Map 0-100 to 20-80
            message: progress.message
          });
        });

      } else if (decision.flow === 'improved-chunking') {
        console.log('🔄 Using improved chunking processing');
        // Note: Chunking processor handles multiple chunks internally and returns
        // a unified result with all operations after reconciliation

        result = await processChunked(apiKey, selectedModel, (progress) => {
          updateJobState({
            stage: progress.stage,
            progress: 20 + (progress.progress * 0.6), // Map 0-100 to 20-80
            message: progress.message
          });
        });

      } else if (decision.flow === 'backend-assisted') {
        throw new Error('Backend-assisted flow is not yet implemented. Please use a smaller bookmark set or wait for future updates.');

      } else {
        throw new Error(`Unsupported flow: ${decision.flow}`);
      }
    } catch (error) {
      // Provide user-friendly error messages for common API errors
      if (error.message.includes('API') || error.message.includes('OpenAI')) {
        if (error.message.includes('401') || error.message.includes('invalid')) {
          throw new Error('Invalid API key. Please check your OpenAI API key in the options page.');
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a few minutes and try again.');
        } else if (error.message.includes('quota') || error.message.includes('insufficient')) {
          throw new Error('API quota exceeded. Please check your OpenAI account billing.');
        }
      }
      throw new Error(`Processing failed: ${error.message}`);
    }

    // Step 7: Validate result
    if (!result || !result.success) {
      const errorMsg = result?.message || 'Unknown processing error';
      throw new Error(`AI processing failed: ${errorMsg}`);
    }

    if (!result.operations || result.operations.length === 0) {
      throw new Error('No operations generated by AI. The bookmarks may already be well-organized, or the AI was unable to create a reorganization plan.');
    }

    console.log(`✅ Generated ${result.operations.length} operations`);

    // Step 8: Dry-run validation
    await updateJobState({
      stage: 'validating',
      progress: 80,
      message: 'Validating operations...'
    });

    let dryRun;
    try {
      dryRun = await dryRunOperations(result.operations);
      console.log(`✓ Dry-run: ${dryRun.valid} valid, ${dryRun.invalid} invalid`);

      if (dryRun.invalid > 0) {
        console.warn('⚠️ Some operations are invalid:', dryRun.errors);
        // Filter out invalid operations
        const originalCount = result.operations.length;
        result.operations = result.operations.filter((op) => {
          const isInvalid = dryRun.errors.some(err =>
            JSON.stringify(err.operation) === JSON.stringify(op)
          );
          return !isInvalid;
        });

        if (result.operations.length === 0) {
          throw new Error('All operations failed validation. Cannot proceed with organization.');
        }

        console.warn(`Filtered out ${originalCount - result.operations.length} invalid operations`);
      }
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }

    // Step 9: Execute operations
    await updateJobState({
      stage: 'applying',
      progress: 85,
      message: 'Applying bookmark organization...'
    });

    let executionResult;
    try {
      executionResult = await executeOperations(result.operations, (progress) => {
        const phaseProgress = {
          folders: 0.25,
          moves: 0.60,
          renames: 0.10,
          removals: 0.05
        };

        const phaseWeight = phaseProgress[progress.phase] || 0.25;
        const phasePercent = (progress.current / progress.total) * phaseWeight * 100;

        updateJobState({
          stage: `applying-${progress.phase}`,
          progress: 85 + (phasePercent * 0.15), // Map to 85-100
          message: `${progress.phase}: ${progress.current}/${progress.total}...`
        });
      });
    } catch (error) {
      throw new Error(`Failed to apply operations: ${error.message}. Some bookmarks may have been moved.`);
    }

    console.log(`✅ Execution complete:`, executionResult);
    console.log(`   - Successful: ${executionResult.successful}`);
    console.log(`   - Failed: ${executionResult.failed}`);

    // Step 10: Complete
    await updateJobState({
      status: 'completed',
      stage: 'complete',
      progress: 100,
      message: 'Organization complete!',
      result: {
        bookmarksProcessed: result.stats?.bookmarksProcessed || 0,
        operationsGenerated: result.stats?.operationsGenerated || result.operations.length,
        operationsApplied: executionResult.successful,
        operationsFailed: executionResult.failed,
        duration: result.stats?.duration || 0,
        warnings: result.warnings || [],
        errors: executionResult.errors || []
      }
    });

    console.log('🎉 Organization process completed successfully!');

  } catch (error) {
    console.error('❌ Organization process failed:', error);

    // Create user-friendly error message
    let userMessage = error.message;
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    await updateJobState({
      status: 'error',
      progress: 0,
      message: userMessage,
      error: {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      }
    });

    throw error;
  }
}

/**
 * Check job status and reset if stuck
 *
 * Verifies if a running job has exceeded the timeout threshold.
 * If so, marks it as errored to prevent indefinite "running" state.
 *
 * @returns {Promise<Object|null>} Current job state or null if none exists
 */
async function checkJobStatus() {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  let job = jobData[JOB_STORAGE_KEY];

  if (job && job.status === 'running' && Date.now() - job.timestamp > TIMEOUT_MS) {
    job = {
      status: 'error',
      message: 'Process timed out',
      timestamp: Date.now()
    };
    await chrome.storage.local.set({ [JOB_STORAGE_KEY]: job });
    console.log('Reset stuck job');
  }

  return job;
}

/**
 * Update job state in storage and send to UI
 *
 * Maintains job state in chrome.storage.local and broadcasts updates
 * to any listening popup windows. Calculates ETA and progress metrics.
 *
 * @param {Object} newState - Partial job state to merge with existing state
 * @param {string} newState.status - Job status: 'running' | 'completed' | 'error'
 * @param {string} newState.stage - Current processing stage
 * @param {number} newState.progress - Progress percentage (0-100)
 * @param {string} newState.message - Human-readable status message
 */
async function updateJobState(newState) {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY] || {};

  const updatedJob = {
    ...job,
    ...newState,
    timestamp: Date.now(),
    lastUpdated: new Date().toLocaleTimeString()
  };

  // Calculate ETA if running
  if (updatedJob.status === 'running' && updatedJob.startTime && updatedJob.progress > 0 && updatedJob.progress < 100) {
    const elapsed = Date.now() - updatedJob.startTime;
    const progressPercent = updatedJob.progress / 100;
    const linearEta = (elapsed / progressPercent) * (1 - progressPercent) / 1000;

    updatedJob.eta = Math.max(0, Math.round(linearEta));

    if (updatedJob.eta > 0) {
      const completionTime = new Date(Date.now() + (updatedJob.eta * 1000));
      updatedJob.estimatedCompletion = completionTime.toLocaleTimeString();
    }

    updatedJob.averageSpeed = (updatedJob.progress / (elapsed / 1000)).toFixed(2) + '%/sec';
  }

  await chrome.storage.local.set({ [JOB_STORAGE_KEY]: updatedJob });

  // Send status update to popup
  try {
    chrome.runtime.sendMessage({
      action: 'updateStatus',
      job: updatedJob
    }, () => {
      if (chrome.runtime.lastError) {
        // Popup not available, ignore
        console.log('Status update - popup not available');
      }
    });
  } catch (error) {
    // Ignore message sending errors
    console.log('Status update failed:', error.message);
  }
}

/**
 * Get API key from storage
 *
 * Retrieves the OpenAI API key from chrome.storage.sync.
 * Returns null if not set, which triggers authentication error.
 *
 * @returns {Promise<string|null>} API key or null if not configured
 */
async function getAPIKey() {
  const data = await chrome.storage.sync.get('openaiApiKey');
  return data.openaiApiKey;
}
