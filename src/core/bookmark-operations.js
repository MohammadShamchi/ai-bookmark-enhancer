/**
 * Bookmark Operations
 * Chrome bookmarks API wrapper with enhanced functionality
 */

/**
 * Get all bookmarks as flat array
 * @returns {Promise<Array>} Array of bookmarks
 */
export async function getAllBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarks = [];
      function flatten(nodes) {
        for (const node of nodes) {
          if (node.url) {
            bookmarks.push({
              id: node.id,
              title: node.title,
              url: node.url,
              dateAdded: node.dateAdded,
              parentId: node.parentId
            });
          }
          if (node.children) {
            flatten(node.children);
          }
        }
      }
      flatten(bookmarkTreeNodes);
      resolve(bookmarks);
    });
  });
}

/**
 * Get full bookmark tree
 * @returns {Promise<Array>} Bookmark tree
 */
export async function getBookmarkTree() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((tree) => {
      resolve(tree);
    });
  });
}

/**
 * Create bookmark folder
 * @param {string} parentId - Parent folder ID
 * @param {string} title - Folder title
 * @returns {Promise<Object>} Created folder node
 */
export async function createFolder(parentId, title) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.create(
      {
        parentId: parentId,
        title: title
      },
      (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Move bookmark to new location
 * @param {string} bookmarkId - Bookmark ID
 * @param {string} parentId - New parent folder ID
 * @returns {Promise<Object>} Updated bookmark
 */
export async function moveBookmark(bookmarkId, parentId) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.move(
      bookmarkId,
      { parentId: parentId },
      (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Rename bookmark or folder
 * @param {string} id - Bookmark/folder ID
 * @param {string} newTitle - New title
 * @returns {Promise<Object>} Updated node
 */
export async function renameNode(id, newTitle) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.update(
      id,
      { title: newTitle },
      (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      }
    );
  });
}

/**
 * Remove bookmark or empty folder
 * @param {string} id - Node ID
 * @returns {Promise<void>}
 */
export async function removeNode(id) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.remove(id, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove folder tree (recursive)
 * @param {string} id - Folder ID
 * @returns {Promise<void>}
 */
export async function removeTree(id) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.removeTree(id, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Get bookmark by ID
 * @param {string} id - Bookmark ID
 * @returns {Promise<Object>} Bookmark node
 */
export async function getBookmarkById(id) {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.get(id, (results) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(results[0]);
      }
    });
  });
}

/**
 * Find folder by path
 * @param {Array<string>} path - Folder path (e.g., ['Bookmarks Bar', 'Work'])
 * @returns {Promise<Object|null>} Folder node or null if not found
 */
export async function findFolderByPath(path) {
  const tree = await getBookmarkTree();

  function searchPath(nodes, pathSegments, currentDepth = 0) {
    if (currentDepth === pathSegments.length) {
      return nodes[0] || null;
    }

    for (const node of nodes) {
      if (!node.url && node.title === pathSegments[currentDepth]) {
        if (currentDepth === pathSegments.length - 1) {
          return node;
        }
        if (node.children) {
          const found = searchPath(node.children, pathSegments, currentDepth + 1);
          if (found) return found;
        }
      }

      if (node.children) {
        const found = searchPath(node.children, pathSegments, currentDepth);
        if (found) return found;
      }
    }

    return null;
  }

  return searchPath(tree, path);
}

/**
 * Create folder path (creates intermediate folders if needed)
 * @param {Array<string>} path - Full path to create
 * @returns {Promise<string>} ID of final folder
 */
export async function createFolderPath(path) {
  let currentParentId = '1'; // Root folder ID

  for (let i = 0; i < path.length; i++) {
    const folderName = path[i];

    // Check if folder exists
    const existingFolder = await findFolderByPath(path.slice(0, i + 1));

    if (existingFolder) {
      currentParentId = existingFolder.id;
    } else {
      // Create folder
      const newFolder = await createFolder(currentParentId, folderName);
      currentParentId = newFolder.id;
    }
  }

  return currentParentId;
}

/**
 * Check if folder is empty
 * @param {string} folderId - Folder ID
 * @returns {Promise<boolean>} True if empty
 */
export async function isFolderEmpty(folderId) {
  return new Promise((resolve) => {
    chrome.bookmarks.getChildren(folderId, (children) => {
      resolve(children.length === 0);
    });
  });
}

/**
 * Batch move bookmarks (with progress callback)
 * @param {Array<Object>} moves - Array of {bookmarkId, parentId}
 * @param {Function} onProgress - Progress callback (current, total)
 * @returns {Promise<Object>} Results
 */
export async function batchMoveBookmarks(moves, onProgress) {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < moves.length; i++) {
    try {
      await moveBookmark(moves[i].bookmarkId, moves[i].parentId);
      results.successful++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        bookmarkId: moves[i].bookmarkId,
        error: error.message
      });
    }

    if (onProgress) {
      onProgress(i + 1, moves.length);
    }
  }

  return results;
}
