/**
 * Global Context Generator
 * Creates context summary for chunked processing
 */

import { getBookmarkTree } from './bookmark-operations.js';
import { extractBookmarkStatistics } from '../utils/metrics.js';

/**
 * Generate global context for chunked processing
 * @returns {Promise<Object>} Global context
 */
export async function generateGlobalContext() {
  const tree = await getBookmarkTree();
  const stats = extractBookmarkStatistics(tree);

  // Extract existing folder structure
  const existingFolders = extractFolderNames(tree);

  // Extract keyword clusters from titles
  const keywords = extractKeywords(tree);

  // Build context object
  const context = {
    totalBookmarks: stats.totalBookmarks,
    totalFolders: stats.totalFolders,
    maxDepth: stats.maxDepth,
    existingFolders,
    createdFolders: [],  // Will be populated during processing
    topDomains: stats.topDomains.slice(0, 20),
    keywordClusters: keywords.slice(0, 50),
    folderSizes: stats.folderSizes,
    emptyFolders: stats.emptyFolders,
    namingPolicy: {
      maxLength: 50,
      separator: ' - ',
      allowSpecialChars: false
    }
  };

  return context;
}

/**
 * Extract folder names from tree
 * @param {Array} tree - Bookmark tree
 * @returns {Array} Folder names with paths
 */
function extractFolderNames(tree) {
  const folders = [];

  function traverse(nodes, path = []) {
    for (const node of nodes) {
      if (node.children !== undefined && !node.url) {
        const currentPath = [...path, node.title || 'Untitled'];
        folders.push({
          name: node.title || 'Untitled',
          path: currentPath,
          id: node.id
        });

        traverse(node.children, currentPath);
      }
    }
  }

  traverse(tree);
  return folders;
}

/**
 * Extract keywords from bookmark titles
 * @param {Array} tree - Bookmark tree
 * @returns {Array} Keyword frequency
 */
function extractKeywords(tree) {
  const wordFreq = {};
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
  ]);

  function processNode(nodes) {
    for (const node of nodes) {
      if (node.title) {
        const words = node.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 3 && !stopWords.has(w));

        for (const word of words) {
          wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
      }

      if (node.children) {
        processNode(node.children);
      }
    }
  }

  processNode(tree);

  // Sort by frequency
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .map(([word, count]) => ({ word, count }));
}

/**
 * Update global context with created folders
 * @param {Object} context - Context object
 * @param {Array} newFolders - New folders created
 */
export function updateContextWithFolders(context, newFolders) {
  for (const folder of newFolders) {
    if (!context.createdFolders.find(f => f.handle === folder.handle)) {
      context.createdFolders.push(folder);
    }
  }
}
