/**
 * Compression Utilities
 * Handles gzip compression and decompression
 */

/**
 * Compress data to gzip
 * @param {string|Object} data - Data to compress
 * @returns {Promise<Blob>} Compressed blob
 */
export async function compressToGzip(data) {
  // Convert to string if object
  const str = typeof data === 'string' ? data : JSON.stringify(data);

  // Convert to blob
  const blob = new Blob([str], { type: 'application/json' });

  // Create compression stream
  const stream = blob.stream();
  const compressedStream = stream.pipeThrough(
    new CompressionStream('gzip')
  );

  // Read compressed data
  const chunks = [];
  const reader = compressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Return as blob
  return new Blob(chunks, { type: 'application/gzip' });
}

/**
 * Decompress gzip data
 * @param {Blob} compressedBlob - Compressed blob
 * @returns {Promise<string>} Decompressed string
 */
export async function decompressGzip(compressedBlob) {
  const stream = compressedBlob.stream();
  const decompressedStream = stream.pipeThrough(
    new DecompressionStream('gzip')
  );

  const chunks = [];
  const reader = decompressedStream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Convert chunks to string
  const decoder = new TextDecoder();
  let result = '';
  for (const chunk of chunks) {
    result += decoder.decode(chunk, { stream: true });
  }
  result += decoder.decode(); // Final flush

  return result;
}

/**
 * Calculate compression ratio
 * @param {string|Object} data - Original data
 * @param {Blob} compressedBlob - Compressed blob
 * @returns {number} Compression ratio (0-1)
 */
export async function getCompressionRatio(data, compressedBlob) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  const originalSize = new TextEncoder().encode(str).length;
  const compressedSize = compressedBlob.size;

  return compressedSize / originalSize;
}
