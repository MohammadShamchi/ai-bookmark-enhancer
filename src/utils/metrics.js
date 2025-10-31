/**
 * Bookmark Metrics Calculator
 * Calculates size, token estimates, and compression metrics for bookmark data
 */

import modelsConfig from '../config/models.json' assert { type: 'json' };

/**
 * Calculate comprehensive metrics for bookmark data
 * @param {Object} bookmarkTree - Full bookmark tree from chrome.bookmarks.getTree()
 * @returns {Promise<Object>} Metrics object
 */
export async function calculateBookmarkMetrics(bookmarkTree) {
  const startTime = performance.now();

  // Extract all bookmarks
  const bookmarks = flattenBookmarks(bookmarkTree);
  const bookmarkCount = bookmarks.length;

  // Calculate raw JSON size
  const jsonString = JSON.stringify(bookmarkTree);
  const rawBytes = new TextEncoder().encode(jsonString).length;
  const rawKB = (rawBytes / 1024).toFixed(2);

  // Estimate tokens (rough approximation: 1 token ≈ 4 characters)
  const estimatedTokens = Math.ceil(rawBytes / 4);

  // Calculate gzipped size
  const gzipBytes = await calculateGzipSize(jsonString);
  const gzipKB = (gzipBytes / 1024).toFixed(2);

  // Determine tier
  const tier = determineTier(bookmarkCount, estimatedTokens, gzipBytes);

  // Calculate average bookmark size
  const avgBytesPerBookmark = bookmarkCount > 0 ? rawBytes / bookmarkCount : 0;

  // Calculate execution time
  const calculationTime = performance.now() - startTime;

  return {
    bookmarkCount,
    rawBytes,
    rawKB,
    estimatedTokens,
    gzipBytes,
    gzipKB,
    compressionRatio: (gzipBytes / rawBytes).toFixed(2),
    avgBytesPerBookmark: avgBytesPerBookmark.toFixed(2),
    tier,
    recommendedFlow: modelsConfig.tiers[tier].flow,
    recommendedModel: modelsConfig.tiers[tier].recommendedModel,
    calculationTime: calculationTime.toFixed(2),
    timestamp: Date.now()
  };
}

/**
 * Flatten bookmark tree into array of bookmarks
 * @param {Array} nodes - Bookmark tree nodes
 * @returns {Array} Flat array of bookmarks
 */
function flattenBookmarks(nodes) {
  const bookmarks = [];

  function traverse(nodes) {
    for (const node of nodes) {
      if (node.url) {
        bookmarks.push({
          id: node.id,
          title: node.title || 'Untitled',
          url: node.url,
          dateAdded: node.dateAdded,
          parentId: node.parentId
        });
      }
      if (node.children) {
        traverse(node.children);
      }
    }
  }

  traverse(nodes);
  return bookmarks;
}

/**
 * Calculate gzipped size of data
 * @param {string} data - Data to compress
 * @returns {Promise<number>} Compressed size in bytes
 */
async function calculateGzipSize(data) {
  try {
    const blob = new Blob([data]);
    const stream = blob.stream();
    const compressedStream = stream.pipeThrough(
      new CompressionStream('gzip')
    );

    const chunks = [];
    const reader = compressedStream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Calculate total size
    const totalSize = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    return totalSize;
  } catch (error) {
    console.error('Gzip calculation failed:', error);
    // Fallback: estimate as 30% of original size
    return Math.ceil(new TextEncoder().encode(data).length * 0.3);
  }
}

/**
 * Determine tier based on metrics
 * @param {number} bookmarkCount - Number of bookmarks
 * @param {number} estimatedTokens - Estimated token count
 * @param {number} gzipBytes - Compressed size in bytes
 * @returns {string} Tier name (T1, T2, T3, T4)
 */
function determineTier(bookmarkCount, estimatedTokens, gzipBytes) {
  const tiers = modelsConfig.tiers;

  if (
    bookmarkCount <= tiers.T1.maxBookmarks &&
    estimatedTokens <= tiers.T1.maxTokens &&
    gzipBytes <= tiers.T1.maxGzipBytes
  ) {
    return 'T1';
  }

  if (
    bookmarkCount <= tiers.T2.maxBookmarks &&
    estimatedTokens <= tiers.T2.maxTokens &&
    gzipBytes <= tiers.T2.maxGzipBytes
  ) {
    return 'T2';
  }

  if (
    bookmarkCount <= tiers.T3.maxBookmarks &&
    estimatedTokens <= tiers.T3.maxTokens &&
    gzipBytes <= tiers.T3.maxGzipBytes
  ) {
    return 'T3';
  }

  return 'T4';
}

/**
 * Check if single-shot flow is viable
 * @param {Object} metrics - Metrics from calculateBookmarkMetrics
 * @param {string} selectedModel - Selected model name
 * @returns {boolean} True if single-shot is viable
 */
export function canUseSingleShot(metrics, selectedModel) {
  const thresholds = modelsConfig.thresholds;
  const model = modelsConfig.models[selectedModel];

  if (!model) return false;

  // Check if under thresholds
  const underGzipThreshold = metrics.gzipBytes <= thresholds.singleShotMaxGzipBytes;
  const underTokenThreshold = metrics.estimatedTokens <= (model.contextWindow * thresholds.safetyMargin);

  return underGzipThreshold && underTokenThreshold;
}

/**
 * Extract detailed bookmark statistics
 * @param {Array} nodes - Bookmark tree nodes
 * @returns {Object} Statistics
 */
export function extractBookmarkStatistics(nodes) {
  const stats = {
    totalFolders: 0,
    totalBookmarks: 0,
    maxDepth: 0,
    domainFrequency: {},
    folderSizes: {},
    emptyFolders: [],
    topDomains: []
  };

  function traverse(nodes, depth = 0, folderPath = []) {
    stats.maxDepth = Math.max(stats.maxDepth, depth);

    for (const node of nodes) {
      if (node.url) {
        // Bookmark
        stats.totalBookmarks++;

        // Extract domain
        try {
          const domain = new URL(node.url).hostname;
          stats.domainFrequency[domain] = (stats.domainFrequency[domain] || 0) + 1;
        } catch (e) {
          // Invalid URL, skip
        }
      } else if (node.children !== undefined) {
        // Folder
        stats.totalFolders++;
        const currentPath = [...folderPath, node.title || 'Untitled'];
        const pathKey = currentPath.join(' > ');

        // Count bookmarks in this folder
        const bookmarksInFolder = countBookmarksInNode(node);
        stats.folderSizes[pathKey] = bookmarksInFolder;

        if (bookmarksInFolder === 0) {
          stats.emptyFolders.push(pathKey);
        }

        traverse(node.children, depth + 1, currentPath);
      }
    }
  }

  traverse(nodes);

  // Calculate top domains
  stats.topDomains = Object.entries(stats.domainFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([domain, count]) => ({ domain, count }));

  return stats;
}

/**
 * Count total bookmarks in a node (recursive)
 * @param {Object} node - Bookmark node
 * @returns {number} Total bookmarks
 */
function countBookmarksInNode(node) {
  let count = 0;

  if (node.url) {
    return 1;
  }

  if (node.children) {
    for (const child of node.children) {
      count += countBookmarksInNode(child);
    }
  }

  return count;
}
