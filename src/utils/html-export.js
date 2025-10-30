/**
 * HTML Export Module
 * Generates Netscape Bookmark File Format (HTML)
 */

/**
 * Export bookmark tree to HTML format
 * @param {Array} bookmarkTree - Bookmark tree from chrome.bookmarks.getTree()
 * @returns {string} HTML string
 */
export function exportToHTML(bookmarkTree) {
  const html = [];

  html.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>');
  html.push('<!-- This is an automatically generated file.');
  html.push('     It will be read and overwritten.');
  html.push('     DO NOT EDIT! -->');
  html.push('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">');
  html.push('<TITLE>Bookmarks</TITLE>');
  html.push('<H1>Bookmarks</H1>');
  html.push('<DL><p>');

  // Process tree
  if (bookmarkTree && bookmarkTree.length > 0) {
    processNodes(bookmarkTree, html, 1);
  }

  html.push('</DL><p>');

  return html.join('\n');
}

/**
 * Process bookmark nodes recursively
 * @param {Array} nodes - Bookmark nodes
 * @param {Array} html - HTML array
 * @param {number} depth - Current depth
 */
function processNodes(nodes, html, depth) {
  const indent = '    '.repeat(depth);

  for (const node of nodes) {
    // Skip root node
    if (!node.title && !node.url) {
      if (node.children) {
        processNodes(node.children, html, depth);
      }
      continue;
    }

    if (node.url) {
      // Bookmark
      const addDate = node.dateAdded ? Math.floor(node.dateAdded / 1000) : '';
      const title = escapeHTML(node.title || '');
      const url = escapeHTML(node.url);

      html.push(`${indent}<DT><A HREF="${url}" ADD_DATE="${addDate}">${title}</A>`);

    } else if (node.children !== undefined) {
      // Folder
      const addDate = node.dateAdded ? Math.floor(node.dateAdded / 1000) : '';
      const lastModified = node.dateGroupModified ? Math.floor(node.dateGroupModified / 1000) : '';
      const title = escapeHTML(node.title || 'Untitled Folder');

      html.push(`${indent}<DT><H3 ADD_DATE="${addDate}" LAST_MODIFIED="${lastModified}">${title}</H3>`);
      html.push(`${indent}<DL><p>`);

      if (node.children.length > 0) {
        processNodes(node.children, html, depth + 1);
      }

      html.push(`${indent}</DL><p>`);
    }
  }
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
  if (!str) return '';

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Download HTML as file
 * @param {string} html - HTML content
 * @param {string} filename - Filename (optional)
 */
export function downloadHTML(html, filename) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = filename || `bookmarks-backup-${Date.now()}.html`;

  chrome.downloads.download({
    url: url,
    filename: defaultFilename,
    saveAs: true
  }, () => {
    // Revoke URL after download starts
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

/**
 * Export bookmarks and trigger download
 * @returns {Promise<string>} Filename
 */
export async function exportAndDownload() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree((tree) => {
      try {
        const html = exportToHTML(tree);
        const filename = `bookmarks-backup-${new Date().toISOString().split('T')[0]}.html`;
        downloadHTML(html, filename);
        resolve(filename);
      } catch (error) {
        reject(error);
      }
    });
  });
}
