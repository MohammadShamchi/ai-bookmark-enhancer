/**
 * Operation Executor
 * Applies bookmark operations in phases
 */

import {
  createFolderPath,
  findFolderByPath,
  moveBookmark,
  renameNode,
  removeNode,
  isFolderEmpty,
  getBookmarkById
} from './bookmark-operations.js';

/**
 * Execute operations from AI response
 * @param {Array} operations - Operations array
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Execution results
 */
export async function executeOperations(operations, onProgress) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [],
    phases: {
      folders: { successful: 0, failed: 0 },
      moves: { successful: 0, failed: 0 },
      renames: { successful: 0, failed: 0 },
      removals: { successful: 0, failed: 0 }
    }
  };

  // Phase 1: Create folders
  const folderOps = operations.filter(op => op.type === 'create_folder');
  if (folderOps.length > 0) {
    onProgress({ phase: 'folders', current: 0, total: folderOps.length });

    for (let i = 0; i < folderOps.length; i++) {
      try {
        await executeCreateFolder(folderOps[i]);
        results.phases.folders.successful++;
        results.successful++;
      } catch (error) {
        results.phases.folders.failed++;
        results.failed++;
        results.errors.push({
          operation: folderOps[i],
          error: error.message
        });
      }

      onProgress({ phase: 'folders', current: i + 1, total: folderOps.length });
    }
  }

  // Phase 2: Move bookmarks
  const moveOps = operations.filter(op => op.type === 'move');
  if (moveOps.length > 0) {
    onProgress({ phase: 'moves', current: 0, total: moveOps.length });

    for (let i = 0; i < moveOps.length; i++) {
      try {
        await executeMove(moveOps[i]);
        results.phases.moves.successful++;
        results.successful++;
      } catch (error) {
        results.phases.moves.failed++;
        results.failed++;
        results.errors.push({
          operation: moveOps[i],
          error: error.message
        });
      }

      onProgress({ phase: 'moves', current: i + 1, total: moveOps.length });

      // Rate limiting: small delay every 50 operations
      if (i > 0 && i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }

  // Phase 3: Rename folders
  const renameOps = operations.filter(op => op.type === 'rename_folder');
  if (renameOps.length > 0) {
    onProgress({ phase: 'renames', current: 0, total: renameOps.length });

    for (let i = 0; i < renameOps.length; i++) {
      try {
        await executeRename(renameOps[i]);
        results.phases.renames.successful++;
        results.successful++;
      } catch (error) {
        results.phases.renames.failed++;
        results.failed++;
        results.errors.push({
          operation: renameOps[i],
          error: error.message
        });
      }

      onProgress({ phase: 'renames', current: i + 1, total: renameOps.length });
    }
  }

  // Phase 4: Remove empty folders (optional)
  const removeOps = operations.filter(op => op.type === 'remove_empty_folder');
  if (removeOps.length > 0) {
    onProgress({ phase: 'removals', current: 0, total: removeOps.length });

    for (let i = 0; i < removeOps.length; i++) {
      try {
        await executeRemoveEmpty(removeOps[i]);
        results.phases.removals.successful++;
        results.successful++;
      } catch (error) {
        results.phases.removals.failed++;
        results.failed++;
        results.errors.push({
          operation: removeOps[i],
          error: error.message
        });
      }

      onProgress({ phase: 'removals', current: i + 1, total: removeOps.length });
    }
  }

  return results;
}

/**
 * Execute create_folder operation
 * @param {Object} op - Operation
 */
async function executeCreateFolder(op) {
  const fullPath = [...op.path, op.title];
  await createFolderPath(fullPath);
}

/**
 * Execute move operation
 * @param {Object} op - Operation
 */
async function executeMove(op) {
  // Find target folder
  const targetFolder = await findFolderByPath(op.targetPath);

  if (!targetFolder) {
    // Create path if it doesn't exist
    const folderId = await createFolderPath(op.targetPath);
    await moveBookmark(op.bookmarkId, folderId);
  } else {
    await moveBookmark(op.bookmarkId, targetFolder.id);
  }
}

/**
 * Execute rename_folder operation
 * @param {Object} op - Operation
 */
async function executeRename(op) {
  const folder = await findFolderByPath(op.path);

  if (!folder) {
    throw new Error(`Folder not found: ${op.path.join(' > ')}`);
  }

  await renameNode(folder.id, op.newTitle);
}

/**
 * Execute remove_empty_folder operation
 * @param {Object} op - Operation
 */
async function executeRemoveEmpty(op) {
  const folder = await findFolderByPath(op.path);

  if (!folder) {
    // Folder doesn't exist, consider success
    return;
  }

  const empty = await isFolderEmpty(folder.id);

  if (empty) {
    await removeNode(folder.id);
  } else {
    throw new Error(`Folder not empty: ${op.path.join(' > ')}`);
  }
}

/**
 * Dry-run operations (validation without execution)
 * @param {Array} operations - Operations array
 * @returns {Promise<Object>} Validation results
 */
export async function dryRunOperations(operations) {
  const results = {
    valid: 0,
    invalid: 0,
    warnings: [],
    errors: []
  };

  for (const op of operations) {
    try {
      await validateOperation(op);
      results.valid++;
    } catch (error) {
      results.invalid++;
      results.errors.push({
        operation: op,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * Validate single operation
 * @param {Object} op - Operation
 */
async function validateOperation(op) {
  switch (op.type) {
    case 'create_folder':
      if (!op.path || !Array.isArray(op.path)) {
        throw new Error('Invalid path');
      }
      if (!op.title || typeof op.title !== 'string') {
        throw new Error('Invalid title');
      }
      break;

    case 'move':
      if (!op.bookmarkId) {
        throw new Error('Missing bookmarkId');
      }
      if (!op.targetPath || !Array.isArray(op.targetPath)) {
        throw new Error('Invalid targetPath');
      }
      // Check if bookmark exists
      try {
        await getBookmarkById(op.bookmarkId);
      } catch (e) {
        throw new Error(`Bookmark not found: ${op.bookmarkId}`);
      }
      break;

    case 'rename_folder':
      if (!op.path || !Array.isArray(op.path)) {
        throw new Error('Invalid path');
      }
      if (!op.newTitle || typeof op.newTitle !== 'string') {
        throw new Error('Invalid newTitle');
      }
      const folder = await findFolderByPath(op.path);
      if (!folder) {
        throw new Error(`Folder not found: ${op.path.join(' > ')}`);
      }
      break;

    case 'remove_empty_folder':
      if (!op.path || !Array.isArray(op.path)) {
        throw new Error('Invalid path');
      }
      // Optional validation - folder might not exist
      break;

    default:
      throw new Error(`Unknown operation type: ${op.type}`);
  }
}
