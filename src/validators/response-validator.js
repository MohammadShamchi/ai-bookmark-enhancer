/**
 * Response Validator
 * Validates AI responses and repairs common issues
 */

/**
 * Validate AI response structure
 * @param {Object} response - AI response object
 * @param {Array} inputBookmarks - Original bookmark input
 * @returns {Object} Validation result
 */
export function validateAIResponse(response, inputBookmarks) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalCategories: 0,
      totalURLs: 0,
      duplicateURLs: 0,
      invalidURLs: 0,
      coverage: 0
    }
  };

  // Check structure
  if (!response || typeof response !== 'object') {
    result.isValid = false;
    result.errors.push('Response is not a valid object');
    return result;
  }

  // Check version (for new format)
  if (response.version) {
    return validateNewFormat(response, inputBookmarks);
  }

  // Legacy format validation
  if (!response.categories || !Array.isArray(response.categories)) {
    result.isValid = false;
    result.errors.push('Missing or invalid categories array');
    return result;
  }

  // Create URL set for input validation
  const inputUrls = new Set(inputBookmarks.map(b => b.url));
  const processedUrls = new Set();

  for (const category of response.categories) {
    if (!category || typeof category !== 'object') {
      result.isValid = false;
      result.errors.push('Invalid category object');
      continue;
    }

    if (!category.category || typeof category.category !== 'string') {
      result.isValid = false;
      result.errors.push('Category is missing name');
      continue;
    }

    if (!Array.isArray(category.urls)) {
      result.isValid = false;
      result.errors.push(`Category "${category.category}" has invalid URLs array`);
      continue;
    }

    const validUrls = [];
    for (const url of category.urls) {
      if (typeof url !== 'string' || url.trim().length === 0) {
        result.warnings.push(`Category "${category.category}" contains invalid URL`);
        continue;
      }

      if (!inputUrls.has(url)) {
        result.warnings.push(`URL "${url}" not found in input bookmarks`);
        continue;
      }

      if (processedUrls.has(url)) {
        result.warnings.push(`Duplicate URL detected: ${url}`);
        result.stats.duplicateURLs++;
        continue;
      }

      processedUrls.add(url);
      validUrls.push(url);
    }

    if (validUrls.length === 0) {
      result.warnings.push(`Category "${category.category}" has no valid URLs`);
    }

    result.stats.totalCategories++;
    result.stats.totalURLs += validUrls.length;
  }

  // Coverage calculation
  const totalInputUrls = inputBookmarks.length;
  result.stats.coverage = totalInputUrls > 0
    ? (result.stats.totalURLs / totalInputUrls) * 100
    : 0;

  if (result.stats.coverage < 80 && totalInputUrls > 0) {
    result.warnings.push(`Low coverage: ${(result.stats.coverage).toFixed(1)}% of bookmarks categorized`);
  }

  return result;
}

/**
 * Validate new response format (operations-based)
 * @param {Object} response - AI response object with version
 * @param {Array} inputBookmarks - Original bookmark input
 * @returns {Object} Validation result
 */
export function validateNewFormat(response, inputBookmarks) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalFolders: 0,
      totalOperations: 0,
      riskyOperations: 0,
      coverage: 0
    }
  };

  if (!response.version || typeof response.version !== 'string') {
    result.isValid = false;
    result.errors.push('Missing or invalid version');
  }

  if (!Array.isArray(response.operations)) {
    result.isValid = false;
    result.errors.push('Missing or invalid operations array');
    return result;
  }

  const validOperationTypes = new Set([
    'create_folder',
    'move',
    'rename_folder',
    'remove_empty_folder'
  ]);

  const bookmarkIds = new Set(inputBookmarks.map(b => b.id));

  for (const operation of response.operations) {
    if (!operation || typeof operation !== 'object') {
      result.isValid = false;
      result.errors.push('Invalid operation object');
      continue;
    }

    if (!validOperationTypes.has(operation.type)) {
      result.isValid = false;
      result.errors.push(`Unsupported operation type: ${operation.type}`);
      continue;
    }

    if (!Array.isArray(operation.path) || operation.path.length === 0) {
      result.isValid = false;
      result.errors.push(`Operation ${operation.type} has invalid path`);
      continue;
    }

    switch (operation.type) {
      case 'create_folder': {
        if (!operation.title || typeof operation.title !== 'string') {
          result.isValid = false;
          result.errors.push('create_folder missing title');
        }
        break;
      }
      case 'move': {
        if (!operation.bookmarkId || typeof operation.bookmarkId !== 'string') {
          result.isValid = false;
          result.errors.push('move operation missing bookmarkId');
        } else if (!bookmarkIds.has(operation.bookmarkId)) {
          result.warnings.push(`Bookmark ID not found: ${operation.bookmarkId}`);
        }
        break;
      }
      case 'rename_folder': {
        if (!operation.newTitle || typeof operation.newTitle !== 'string') {
          result.isValid = false;
          result.errors.push('rename_folder missing newTitle');
        }
        break;
      }
      case 'remove_empty_folder': {
        result.stats.riskyOperations++;
        break;
      }
      default:
        break;
    }

    result.stats.totalOperations++;
  }

  // Validate folders array if present
  if (Array.isArray(response.folders)) {
    for (const folder of response.folders) {
      if (!Array.isArray(folder.path) || folder.path.length === 0) {
        result.warnings.push('Folder entry has invalid path');
        continue;
      }

      if (folder.description && typeof folder.description !== 'string') {
        result.warnings.push('Folder description must be a string');
      }

      result.stats.totalFolders++;
    }
  }

  return result;
}

/**
 * Attempt to repair AI response
 * @param {Object} response - Original response
 * @param {Array} inputBookmarks - Original bookmark input
 * @param {Object} validation - Validation result
 * @returns {Object} Repaired response (legacy format only)
 */
export function repairAIResponse(response, inputBookmarks, validation) {
  if (!response || typeof response !== 'object') {
    return response;
  }

  if (response.version) {
    // New format is not automatically repairable
    return response;
  }

  if (!Array.isArray(response.categories)) {
    return response;
  }

  const inputUrls = new Set(inputBookmarks.map(b => b.url));
  const processedUrls = new Set();
  const repairedCategories = [];

  for (const category of response.categories) {
    if (!category || !Array.isArray(category.urls)) continue;

    const sanitizedCategory = sanitizeCategoryName(category.category || 'Untitled');
    const validUrls = [];

    for (const url of category.urls) {
      if (typeof url !== 'string') continue;
      if (!inputUrls.has(url)) continue;
      if (processedUrls.has(url)) continue;

      validUrls.push(url);
      processedUrls.add(url);
    }

    if (validUrls.length > 0) {
      repairedCategories.push({
        category: sanitizedCategory,
        urls: validUrls
      });
    }
  }

  // Add uncategorized bookmarks
  const uncategorized = inputBookmarks
    .filter(b => !processedUrls.has(b.url))
    .map(b => b.url);

  if (uncategorized.length > 0) {
    repairedCategories.push({
      category: 'Miscellaneous',
      urls: uncategorized
    });
  }

  return {
    categories: repairedCategories
  };
}

/**
 * Sanitize category name
 * @param {string} name - Category name
 * @returns {string} Sanitized name
 */
export function sanitizeCategoryName(name) {
  if (!name || typeof name !== 'string') {
    return 'Untitled';
  }

  return name
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 60)
    .trim() || 'Untitled';
}
