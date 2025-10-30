/**
 * OpenAI API Client
 * Handles communication with OpenAI API
 */

import modelsConfig from '../config/models.json';

/**
 * Send chat completion request
 * @param {string} apiKey - OpenAI API key
 * @param {string} model - Model name
 * @param {Array} messages - Chat messages
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} API response
 */
export async function sendChatCompletion(apiKey, model, messages, options = {}) {
  const modelConfig = modelsConfig.models[model];

  if (!modelConfig) {
    throw new Error(`Unknown model: ${model}`);
  }

  const apiParams = {
    model: model,
    messages: messages,
    temperature: options.temperature || 0.3,
    max_tokens: options.maxTokens || 4000,
    top_p: options.topP || 0.9,
    presence_penalty: options.presencePenalty || 0.1,
    frequency_penalty: options.frequencyPenalty || 0.1
  };

  // Add JSON mode if supported
  if (modelConfig.supportsJsonMode && options.jsonMode !== false) {
    apiParams.response_format = { type: 'json_object' };
  }

  // Add seed for consistency (if provided)
  if (options.seed) {
    apiParams.seed = options.seed;
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(apiParams)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new OpenAIAPIError(
      response.status,
      errorData.error?.message || response.statusText,
      errorData.error?.type || 'unknown_error'
    );
  }

  return await response.json();
}

/**
 * Upload file to OpenAI Files API
 * @param {string} apiKey - OpenAI API key
 * @param {Blob} fileBlob - File blob
 * @param {string} purpose - Purpose ('assistants' or 'fine-tune')
 * @returns {Promise<Object>} File object with ID
 */
export async function uploadFile(apiKey, fileBlob, purpose = 'assistants') {
  const formData = new FormData();
  formData.append('file', fileBlob, 'bookmarks.json.gz');
  formData.append('purpose', purpose);

  const response = await fetch('https://api.openai.com/v1/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new OpenAIAPIError(
      response.status,
      errorData.error?.message || 'File upload failed',
      errorData.error?.type || 'upload_error'
    );
  }

  return await response.json();
}

/**
 * Delete file from OpenAI
 * @param {string} apiKey - OpenAI API key
 * @param {string} fileId - File ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFile(apiKey, fileId) {
  const response = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new OpenAIAPIError(
      response.status,
      errorData.error?.message || 'File deletion failed',
      errorData.error?.type || 'deletion_error'
    );
  }

  return await response.json();
}

/**
 * Validate API key
 * @param {string} apiKey - API key to validate
 * @returns {Promise<boolean>} True if valid
 */
export async function validateAPIKey(apiKey) {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * OpenAI API Error class
 */
export class OpenAIAPIError extends Error {
  constructor(status, message, type) {
    super(message);
    this.name = 'OpenAIAPIError';
    this.status = status;
    this.type = type;
    this.timestamp = Date.now();
    this.recoverable = this.isRecoverable();
  }

  isRecoverable() {
    if (this.status === 401 || this.status === 403) return false;
    if (this.type === 'insufficient_quota') return false;
    return true;
  }

  getCategory() {
    if (this.status === 401) return 'authentication';
    if (this.status === 403) return 'permission';
    if (this.status === 429) return 'rate_limit';
    if (this.status >= 500) return 'server';
    if (this.type === 'insufficient_quota') return 'quota';
    return 'unknown';
  }
}

/**
 * Retry wrapper with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} baseDelay - Base delay in ms
 * @returns {Promise<any>} Function result
 */
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry non-recoverable errors
      if (error instanceof OpenAIAPIError && !error.recoverable) {
        throw error;
      }

      // Last attempt, throw error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate backoff delay
      const delay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000;

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay + jitter));
    }
  }

  throw lastError;
}
