/**
 * Chunking Processor
 * Handles chunked bookmark organization for large datasets
 */

import { getAllBookmarks } from './bookmark-operations.js';
import { generateGlobalContext, updateContextWithFolders } from './context-generator.js';
import { sendChatCompletion, withRetry } from '../api/openai-client.js';
import { getSystemPromptChunking } from '../config/prompts.js';
import { exportAndDownload } from '../utils/html-export.js';
import modelsConfig from '../config/models.js';

/**
 * Process bookmarks using chunked flow
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model name
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Results
 */
export async function processChunked(apiKey, model, onProgress) {
  const startTime = Date.now();

  try {
    // Step 1: Create HTML backup
    onProgress({ stage: 'backup', progress: 0, message: 'Creating backup...' });
    await exportAndDownload();

    // Step 2: Generate global context
    onProgress({ stage: 'context', progress: 5, message: 'Analyzing bookmark structure...' });
    const globalContext = await generateGlobalContext();

    // Step 3: Get all bookmarks
    onProgress({ stage: 'fetching', progress: 10, message: 'Fetching bookmarks...' });
    const allBookmarks = await getAllBookmarks();

    // Step 4: Create chunks
    const chunkSize = modelsConfig.thresholds.chunkSize;
    const chunks = createChunks(allBookmarks, chunkSize);
    const totalChunks = chunks.length;

    onProgress({
      stage: 'chunking',
      progress: 15,
      message: `Processing ${totalChunks} chunks...`
    });

    // Step 5: Process each chunk
    const allOperations = [];
    const pendingFolders = new Map(); // handle -> folder definition

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkNum = i + 1;

      onProgress({
        stage: 'processing',
        progress: 15 + (70 * (i / totalChunks)),
        message: `Processing chunk ${chunkNum}/${totalChunks}...`
      });

      try {
        const result = await processChunk(
          chunk,
          chunkNum,
          globalContext,
          apiKey,
          model
        );

        // Collect operations
        if (result.operations) {
          allOperations.push(...result.operations);
        }

        // Collect pending folder definitions
        if (result.pendingFolders) {
          for (const folder of result.pendingFolders) {
            if (!pendingFolders.has(folder.handle)) {
              pendingFolders.set(folder.handle, folder);
            }
          }
        }

        // Update context with newly created folders
        if (result.pendingFolders) {
          updateContextWithFolders(globalContext, result.pendingFolders);
        }

        // Rate limiting delay
        if (i < chunks.length - 1) {
          const delay = calculateDelay(i, totalChunks);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

      } catch (error) {
        console.error(`Chunk ${chunkNum} failed:`, error);
        // Continue with next chunk
      }
    }

    // Step 6: Reconciliation pass
    onProgress({ stage: 'reconciling', progress: 85, message: 'Reconciling folders...' });
    const reconciledOperations = await reconcileOperations(
      allOperations,
      pendingFolders,
      globalContext
    );

    // Step 7: Convert handle-based operations to path-based operations
    onProgress({ stage: 'finalizing', progress: 95, message: 'Finalizing operations...' });
    const finalOperations = convertToPathOperations(reconciledOperations, pendingFolders);

    const duration = (Date.now() - startTime) / 1000;

    return {
      success: true,
      operations: finalOperations,
      metadata: {
        chunksProcessed: totalChunks,
        foldersCreated: pendingFolders.size
      },
      warnings: [],
      stats: {
        duration,
        bookmarksProcessed: allBookmarks.length,
        operationsGenerated: finalOperations.length
      }
    };

  } catch (error) {
    throw error;
  }
}

/**
 * Create chunks from bookmarks array
 * @param {Array} bookmarks - All bookmarks
 * @param {number} chunkSize - Size of each chunk
 * @returns {Array} Array of chunks
 */
function createChunks(bookmarks, chunkSize) {
  const chunks = [];
  for (let i = 0; i < bookmarks.length; i += chunkSize) {
    chunks.push(bookmarks.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Process a single chunk
 * @param {Array} chunk - Bookmarks in this chunk
 * @param {number} chunkNum - Chunk number
 * @param {Object} globalContext - Global context
 * @param {string} apiKey - API key
 * @param {string} model - Model name
 * @returns {Promise<Object>} Chunk result
 */
async function processChunk(chunk, chunkNum, globalContext, apiKey, model) {
  const systemPrompt = getSystemPromptChunking(globalContext);

  const userPrompt = `Process this chunk of bookmarks:

**Chunk Info:**
- Chunk number: ${chunkNum}
- Bookmarks in chunk: ${chunk.length}

**Instructions:**
1. Analyze each bookmark
2. Assign to existing folders using their handles (e.g., "h-work", "h-dev")
3. If no suitable folder exists, suggest new folders with handles
4. Maintain consistency with global context

**Bookmarks:**
${JSON.stringify(chunk.map(b => ({ id: b.id, title: b.title, url: b.url })), null, 2)}

Return JSON with operations and pendingFolders.`;

  const response = await withRetry(() =>
    sendChatCompletion(apiKey, model, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      jsonMode: true,
      temperature: 0.3,
      maxTokens: 4000
    })
  );

  return JSON.parse(response.choices[0].message.content);
}

/**
 * Reconcile operations from all chunks
 * @param {Array} allOperations - All operations from chunks
 * @param {Map} pendingFolders - Pending folder definitions
 * @param {Object} globalContext - Global context
 * @returns {Promise<Array>} Reconciled operations
 */
async function reconcileOperations(allOperations, pendingFolders, globalContext) {
  // Deduplicate folder creation by handle
  const uniqueFolders = new Map();
  for (const [handle, folder] of pendingFolders) {
    // Merge similar folders by title
    const similarHandle = findSimilarFolder(folder, uniqueFolders);
    if (similarHandle) {
      // Use existing handle
      allOperations = allOperations.map(op =>
        op.folderHandle === handle ? { ...op, folderHandle: similarHandle } : op
      );
    } else {
      uniqueFolders.set(handle, folder);
    }
  }

  // Update pending folders with reconciled set
  pendingFolders.clear();
  for (const [handle, folder] of uniqueFolders) {
    pendingFolders.set(handle, folder);
  }

  return allOperations;
}

/**
 * Find similar folder by title
 * @param {Object} folder - Folder to check
 * @param {Map} existingFolders - Existing folders
 * @returns {string|null} Similar folder handle or null
 */
function findSimilarFolder(folder, existingFolders) {
  for (const [handle, existing] of existingFolders) {
    if (isSimilarTitle(folder.title, existing.title)) {
      return handle;
    }
  }
  return null;
}

/**
 * Check if titles are similar
 * @param {string} title1 - First title
 * @param {string} title2 - Second title
 * @returns {boolean} True if similar
 */
function isSimilarTitle(title1, title2) {
  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  return normalize(title1) === normalize(title2);
}

/**
 * Convert handle-based operations to path-based operations
 * @param {Array} operations - Handle-based operations
 * @param {Map} pendingFolders - Folder definitions
 * @returns {Array} Path-based operations
 */
function convertToPathOperations(operations, pendingFolders) {
  const pathOperations = [];

  // First, create all folders
  for (const [handle, folder] of pendingFolders) {
    pathOperations.push({
      type: 'create_folder',
      path: folder.path,
      title: folder.title
    });
  }

  // Then, convert assign operations to move operations
  for (const op of operations) {
    if (op.type === 'assign' && op.folderHandle) {
      const folder = pendingFolders.get(op.folderHandle);
      if (folder) {
        pathOperations.push({
          type: 'move',
          bookmarkId: op.bookmarkId,
          targetPath: [...folder.path, folder.title]
        });
      }
    } else {
      // Pass through other operations
      pathOperations.push(op);
    }
  }

  return pathOperations;
}

/**
 * Calculate delay between chunks
 * @param {number} chunkIndex - Current chunk index
 * @param {number} totalChunks - Total number of chunks
 * @returns {number} Delay in milliseconds
 */
function calculateDelay(chunkIndex, totalChunks) {
  const baseDelay = 2000; // 2 seconds
  const jitter = Math.random() * 1000; // 0-1 second

  // Shorter delays near the end
  const progressMultiplier = chunkIndex > (totalChunks * 0.8) ? 0.7 : 1;

  return Math.floor(baseDelay * progressMultiplier + jitter);
}
