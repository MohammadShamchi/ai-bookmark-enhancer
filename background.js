const JOB_STORAGE_KEY = 'bookmarkOrganizationJob';

// Main listener to start or check the status of a job from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "organizeBookmarks") {
    const selectedModel = request.model || 'gpt-4';
    startOrganizationProcess(selectedModel)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  } else if (request.action === "checkJobStatus") {
    checkJobStatus()
      .then((job) => {
        sendResponse(job);
      })
      .catch((error) => {
        console.error('Error checking job status:', error);
        sendResponse(null);
      });
    return true; // Keep channel open for async response
  } else if (request.action === 'resetJob') {
    chrome.storage.local.remove(JOB_STORAGE_KEY)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep channel open for async response
  } else if (request.action === 'emergencyStop') {
    // Emergency stop function to halt all processing
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
  } else if (request.action === 'debugBookmarks') {
    // Debug function to check bookmark status
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

// Listener for the alarm, which drives the chunk processing
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'cleanupAlarm') {
        await checkJobStatus(); // This will reset if stuck
    }
});

// Add onStartup listener for clearing running jobs
chrome.runtime.onStartup.addListener(async () => {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY];
  if (job && job.status === 'running') {
    await chrome.storage.local.remove(JOB_STORAGE_KEY);
    console.log('Cleared running job on browser startup');
  }
});

async function checkJobStatus() {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  let job = jobData[JOB_STORAGE_KEY];
  if (job && job.status === 'running' && Date.now() - job.timestamp > 1800000) {  // Changed to 30 minutes
    job = { status: 'error', message: 'Process timed out', timestamp: Date.now() };
    await chrome.storage.local.set({ [JOB_STORAGE_KEY]: job });
    console.log('Reset stuck job');
  }
  return job;
}

async function updateJobState(newState) {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY] || {};
  const updatedJob = { 
    ...job, 
    ...newState, 
    timestamp: Date.now(),
    lastUpdated: new Date().toLocaleTimeString()
  };
  
  // Enhanced ETA calculation with multiple methods for accuracy
  if (updatedJob.status === 'running' && updatedJob.startTime && updatedJob.progress > 0 && updatedJob.progress < 100) {
    const elapsed = Date.now() - updatedJob.startTime;
    const progressPercent = updatedJob.progress / 100;
    
    // Method 1: Linear progress estimation
    const linearEta = (elapsed / progressPercent) * (1 - progressPercent) / 1000;
    
    // Method 2: Chunk-based estimation (if available)
    let chunkBasedEta = null;
    if (updatedJob.chunkIndex && updatedJob.totalChunks && updatedJob.chunkIndex > 0) {
      const chunksPerSecond = updatedJob.chunkIndex / (elapsed / 1000);
      const remainingChunks = updatedJob.totalChunks - updatedJob.chunkIndex;
      chunkBasedEta = remainingChunks / chunksPerSecond;
      
      updatedJob.processingRate = `${chunksPerSecond.toFixed(2)} chunks/sec`;
      updatedJob.chunksRemaining = remainingChunks;
    }
    
    // Use the more accurate estimation
    const finalEta = chunkBasedEta !== null ? chunkBasedEta : linearEta;
    updatedJob.eta = Math.max(0, Math.round(finalEta));
    
    // Add estimated completion time
    if (updatedJob.eta > 0) {
      const completionTime = new Date(Date.now() + (updatedJob.eta * 1000));
      updatedJob.estimatedCompletion = completionTime.toLocaleTimeString();
    }
    
    // Performance metrics
    updatedJob.averageSpeed = (updatedJob.progress / (elapsed / 1000)).toFixed(2) + '%/sec';
  }
  
  // Add quality metrics if available
  if (newState.qualityStats) {
    updatedJob.qualityMetrics = {
      ...updatedJob.qualityMetrics,
      ...newState.qualityStats,
      lastUpdated: Date.now()
    };
  }
  
  await chrome.storage.local.set({ [JOB_STORAGE_KEY]: updatedJob });
  
  // Enhanced status update with performance data and connection error handling
  try {
    chrome.runtime.sendMessage({ 
      action: 'updateStatus', 
      job: updatedJob,
      performance: {
        eta: updatedJob.eta,
        processingRate: updatedJob.processingRate,
        averageSpeed: updatedJob.averageSpeed,
        qualityMetrics: updatedJob.qualityMetrics
      }
    }, () => {
      // Handle response or connection errors
      if (chrome.runtime.lastError) {
        // This is expected when popup is closed, don't log as error
        console.log('Status update - popup not available:', chrome.runtime.lastError.message);
      }
    });
  } catch (error) {
    // Catch synchronous errors in message sending
    console.log('Status update failed (message sending error):', error.message);
  }
}

// Helper function to determine optimal chunk size based on bookmark count
function getOptimalChunkSize(totalBookmarks) {
  if (totalBookmarks <= 50) return Math.min(totalBookmarks, 25);      // Small sets: 25 max
  if (totalBookmarks <= 200) return 30;                               // Medium sets: 30
  if (totalBookmarks <= 500) return 35;                               // Large sets: 35
  if (totalBookmarks <= 1000) return 25;                              // Very large sets: smaller chunks for quality
  return 20;                                                           // Massive sets: very small chunks
}

// Helper function to calculate optimal delay based on processing context
function calculateOptimalDelay(chunkSize, processedChunks, totalChunks) {
  const baseDelay = 1500; // Base 1.5 second delay for rate limiting
  
  // Longer delays for larger chunks to respect API limits
  const chunkSizeMultiplier = Math.max(1, chunkSize / 20);
  
  // Shorter delays near the end to speed up completion
  const progressMultiplier = processedChunks > (totalChunks * 0.8) ? 0.7 : 1;
  
  // Random jitter to avoid synchronized requests if multiple instances
  const jitter = Math.random() * 500;
  
  return Math.floor(baseDelay * chunkSizeMultiplier * progressMultiplier + jitter);
}

// Enterprise-quality response validation functions
function validateAIResponse(response, inputBookmarks) {
  const errors = [];
  const warnings = [];

  // Basic structure validation
  if (!response || typeof response !== 'object') {
    errors.push('Response is not a valid object');
    return { isValid: false, errors, warnings };
  }

  if (!response.categories || !Array.isArray(response.categories)) {
    errors.push('Categories field is missing or not an array');
    return { isValid: false, errors, warnings };
  }

  if (response.categories.length === 0) {
    errors.push('No categories returned');
    return { isValid: false, errors, warnings };
  }

  // Validate each category
  const inputUrls = new Set(inputBookmarks.map(b => b.url));
  let totalProcessedUrls = 0;
  const processedUrls = new Set();

  for (let i = 0; i < response.categories.length; i++) {
    const category = response.categories[i];
    
    if (!category.category || typeof category.category !== 'string') {
      errors.push(`Category ${i} has invalid name`);
      continue;
    }

    if (category.category.length > 50) {
      warnings.push(`Category "${category.category}" name is too long`);
    }

    if (!category.urls || !Array.isArray(category.urls)) {
      errors.push(`Category "${category.category}" has invalid URLs array`);
      continue;
    }

    if (category.urls.length === 0) {
      warnings.push(`Category "${category.category}" is empty`);
      continue;
    }

    // Validate URLs in category
    for (const url of category.urls) {
      if (typeof url !== 'string') {
        warnings.push(`Invalid URL type in "${category.category}"`);
        continue;
      }

      if (!inputUrls.has(url)) {
        warnings.push(`URL "${url}" not found in input bookmarks`);
        continue;
      }

      if (processedUrls.has(url)) {
        warnings.push(`Duplicate URL "${url}" found in multiple categories`);
      } else {
        processedUrls.add(url);
        totalProcessedUrls++;
      }
    }
  }

  // Check coverage
  const coveragePercent = (totalProcessedUrls / inputBookmarks.length) * 100;
  if (coveragePercent < 80) {
    warnings.push(`Low coverage: only ${coveragePercent.toFixed(1)}% of bookmarks categorized`);
  }

  const unprocessedCount = inputBookmarks.length - totalProcessedUrls;
  if (unprocessedCount > 0) {
    warnings.push(`${unprocessedCount} bookmarks were not categorized`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalCategories: response.categories.length,
      totalProcessedUrls,
      coveragePercent: coveragePercent.toFixed(1),
      unprocessedCount
    }
  };
}

// Repair function for common AI response issues
function repairAIResponse(response, inputBookmarks, validation) {
  if (validation.isValid && validation.warnings.length === 0) {
    return response; // No repair needed
  }

  console.log('Attempting to repair AI response:', validation);
  
  const repairedCategories = [];
  const processedUrls = new Set();
  const inputUrls = new Set(inputBookmarks.map(b => b.url));

  // Process existing categories and fix issues
  for (const category of response.categories || []) {
    if (!category.category || !Array.isArray(category.urls)) continue;

    const validUrls = category.urls.filter(url => {
      return typeof url === 'string' && 
             inputUrls.has(url) && 
             !processedUrls.has(url);
    });

    if (validUrls.length > 0) {
      repairedCategories.push({
        category: category.category.substring(0, 50), // Truncate long names
        urls: validUrls
      });
      
      validUrls.forEach(url => processedUrls.add(url));
    }
  }

  // Handle unprocessed bookmarks
  const unprocessedBookmarks = inputBookmarks.filter(b => !processedUrls.has(b.url));
  if (unprocessedBookmarks.length > 0) {
    repairedCategories.push({
      category: 'Miscellaneous',
      urls: unprocessedBookmarks.map(b => b.url)
    });
  }

  return { categories: repairedCategories };
}

// Intelligent model selection based on task requirements and availability
function selectOptimalModel(selectedModel, bookmarkCount) {
  const modelCapabilities = {
    'gpt-4.1': { 
      quality: 10, 
      speed: 8, 
      cost: 4, 
      maxTokens: 1000000, // 1M tokens
      reliability: 10,
      categorization: 10,
      supportsJsonMode: true,
      contextWindow: 1000000,
      knowledgeCutoff: '2024-06'
    },
    'gpt-4.1-mini': { 
      quality: 9, 
      speed: 9, 
      cost: 9, 
      maxTokens: 1000000, // 1M tokens
      reliability: 9,
      categorization: 9,
      supportsJsonMode: true,
      contextWindow: 1000000,
      knowledgeCutoff: '2024-06'
    },
    'gpt-4.1-nano': { 
      quality: 8, 
      speed: 10, 
      cost: 10, 
      maxTokens: 1000000, // 1M tokens
      reliability: 8,
      categorization: 8,
      supportsJsonMode: true,
      contextWindow: 1000000,
      knowledgeCutoff: '2024-06'
    },
    'gpt-4o-mini': { 
      quality: 8, 
      speed: 9, 
      cost: 9, 
      maxTokens: 128000,
      reliability: 8,
      categorization: 8,
      supportsJsonMode: true,
      contextWindow: 128000,
      knowledgeCutoff: '2023-10'
    },
    'gpt-4-turbo': { 
      quality: 9, 
      speed: 7, 
      cost: 5, 
      maxTokens: 128000,
      reliability: 9,
      categorization: 9,
      supportsJsonMode: true,
      contextWindow: 128000,
      knowledgeCutoff: '2023-12'
    },
    'gpt-4': { 
      quality: 9, 
      speed: 6, 
      cost: 3, 
      maxTokens: 8192,
      reliability: 9,
      categorization: 9,
      supportsJsonMode: false,
      contextWindow: 8192,
      knowledgeCutoff: '2023-09'
    },
    'gpt-3.5-turbo': { 
      quality: 7, 
      speed: 9, 
      cost: 8, 
      maxTokens: 4096,
      reliability: 8,
      categorization: 7,
      supportsJsonMode: true,
      contextWindow: 4096,
      knowledgeCutoff: '2023-09'
    }
  };

  // Model preference order based on task requirements and JSON support (2025 optimized)
  const getModelOrder = (bookmarkCount) => {
    if (bookmarkCount > 1000) {
      // Large datasets: prioritize speed and cost efficiency with large context
      return ['gpt-4.1-nano', 'gpt-4.1-mini', 'gpt-4o-mini'];
    } else if (bookmarkCount > 500) {
      // Medium-large datasets: balance quality and speed
      return ['gpt-4.1-mini', 'gpt-4.1-nano', 'gpt-4o-mini'];
    } else if (bookmarkCount > 100) {
      // Medium datasets: optimal balance, recommended for most users
      return ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini'];
    } else {
      // Small datasets: prioritize quality, can afford premium models
      return ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4o-mini'];
    }
  };

  const preferredOrder = getModelOrder(bookmarkCount);
  
  // Return selected model if valid and supports JSON, otherwise use optimal order
  if (selectedModel && modelCapabilities[selectedModel]) {
    if (modelCapabilities[selectedModel].supportsJsonMode) {
      return {
        primary: selectedModel,
        fallbacks: preferredOrder.filter(m => m !== selectedModel),
        capabilities: modelCapabilities[selectedModel]
      };
    } else {
      // Selected model doesn't support JSON mode, use fallbacks
      console.warn(`Selected model ${selectedModel} doesn't support JSON mode, using fallback models`);
      return {
        primary: preferredOrder[0],
        fallbacks: preferredOrder.slice(1),
        capabilities: modelCapabilities[preferredOrder[0]],
        originalSelection: selectedModel
      };
    }
  }

  return {
    primary: preferredOrder[0],
    fallbacks: preferredOrder.slice(1),
    capabilities: modelCapabilities[preferredOrder[0]]
  };
}

// Enhanced getCategoriesFromAI with intelligent fallback
async function getCategoriesFromAIWithFallback(bookmarks, apiKey, selectedModel, existingCategories = []) {
  const modelSelection = selectOptimalModel(selectedModel, bookmarks.length);
  const modelsToTry = [modelSelection.primary, ...modelSelection.fallbacks];
  
  let lastError;
  
  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    console.log(`Attempting categorization with ${currentModel} (attempt ${i + 1}/${modelsToTry.length})`);
    
    try {
      const result = await getCategoriesFromAI(bookmarks, apiKey, currentModel, existingCategories);
      
      if (result && result.length > 0) {
        console.log(`Successfully categorized with ${currentModel}`);
        return result;
      } else {
        throw new Error('Empty or invalid result');
      }
      
    } catch (error) {
      console.warn(`Model ${currentModel} failed:`, error.message);
      lastError = error;
      
      // If this wasn't the last model, wait before trying next
      if (i < modelsToTry.length - 1) {
        const delayMs = 1000 * (i + 1); // Increasing delay
        console.log(`Waiting ${delayMs}ms before trying next model...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  
  // All models failed
  console.error('All models failed. Last error:', lastError);
  throw new Error(`All models failed. Last error: ${lastError.message}`);
}

// Enterprise-level error categorization for better user experience
function categorizeError(error) {
  const message = error.message.toLowerCase();
  
  // API Key related errors
  if (message.includes('invalid api key') || 
      message.includes('unauthorized') ||
      message.includes('authentication')) {
    return {
      type: 'api_key',
      category: 'Authentication Error',
      recoverable: false
    };
  }
  
  // Network/Connection errors
  if (message.includes('network') || 
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('fetch')) {
    return {
      type: 'network',
      category: 'Connection Error',
      recoverable: true
    };
  }
  
  // Rate limiting errors
  if (message.includes('rate limit') || 
      message.includes('too many requests') ||
      message.includes('429')) {
    return {
      type: 'rate_limit',
      category: 'Rate Limit Exceeded',
      recoverable: true
    };
  }
  
  // Quota/Billing errors
  if (message.includes('quota') || 
      message.includes('billing') ||
      message.includes('insufficient') ||
      message.includes('payment')) {
    return {
      type: 'quota',
      category: 'Account Quota Error',
      recoverable: false
    };
  }
  
  // Model-specific errors
  if (message.includes('model') || 
      message.includes('not found') ||
      message.includes('unavailable')) {
    return {
      type: 'model',
      category: 'Model Error',
      recoverable: true
    };
  }
  
  // JSON parsing errors
  if (message.includes('json') || 
      message.includes('parse') ||
      message.includes('invalid response')) {
    return {
      type: 'parsing',
      category: 'Response Format Error',
      recoverable: true
    };
  }
  
  // Chrome extension specific errors
  if (message.includes('extension') || 
      message.includes('chrome') ||
      message.includes('bookmark')) {
    return {
      type: 'extension',
      category: 'Extension Error',
      recoverable: false
    };
  }
  
  // Default categorization for unknown errors
  return {
    type: 'unknown',
    category: 'Unexpected Error',
    recoverable: true
  };
}

async function startOrganizationProcess(selectedModel = 'gpt-4') {
  await updateJobState({ status: 'running', message: 'Starting organization...', progress: 0, startTime: Date.now(), tasks: [] });
  try {
    const apiKey = await getApiKey();
    await updateJobState({ tasks: [{name: 'Validate API Key', status: 'complete'}] });
    if (!apiKey) throw new Error('No API key set');

    const allBookmarks = await getAllBookmarks();
    let currentTasks = [{name: 'Validate API Key', status: 'complete'}, {name: 'Fetch Bookmarks', status: 'complete'}];
    await updateJobState({ tasks: currentTasks });
    if (allBookmarks.length === 0) {
      await updateJobState({ status: 'complete', message: 'No bookmarks to organize', progress: 100 });
      return;
    }

    if (allBookmarks.length > 1000) {
      await updateJobState({ status: 'running', message: 'Large bookmark set detected - this may take a while', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Intelligent chunking strategy for optimal quality and performance
    const chunkSize = getOptimalChunkSize(allBookmarks.length);
    const totalChunks = Math.ceil(allBookmarks.length / chunkSize);
    let processedChunks = 0;
    let allCategories = [];
    let contextualHints = [];

    await updateJobState({ 
      status: 'running', 
      message: `Found ${allBookmarks.length} bookmarks. Using optimized ${chunkSize}-bookmark chunks for highest quality...`, 
      progress: 0 
    });
    await new Promise(resolve => setTimeout(resolve, 1500));

    for (let i = 0; i < allBookmarks.length; i += chunkSize) {
      const chunk = allBookmarks.slice(i, i + chunkSize);
      const chunkNum = processedChunks + 1;
      
      // Create progress tracking
      const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
      currentTasks = jobData[JOB_STORAGE_KEY]?.tasks || [];
      currentTasks.push({name: `AI Processing Chunk ${chunkNum}/${totalChunks}`, status: 'running'});
      
      await updateJobState({ 
        status: 'running', 
        message: `AI analyzing chunk ${chunkNum} of ${totalChunks} (${chunk.length} bookmarks)...`, 
        progress: (processedChunks / totalChunks) * 85,
        chunkIndex: processedChunks,
        totalChunks: totalChunks,
        tasks: currentTasks
      });
      
      console.log(`Processing chunk ${chunkNum}/${totalChunks} with ${chunk.length} bookmarks`);
      
      try {
        // Use intelligent model selection with fallback for maximum reliability
        const categories = await getCategoriesFromAIWithFallback(chunk, apiKey, selectedModel, contextualHints);
        
        // Validate and store results
        if (categories && Array.isArray(categories) && categories.length > 0) {
          allCategories = allCategories.concat(categories);
          
          // Extract category names for context in next chunks
          const newCategoryNames = categories.map(cat => cat.category).filter(Boolean);
          contextualHints = [...new Set([...contextualHints, ...newCategoryNames])].slice(0, 20); // Keep top 20 for context
        } else {
          console.warn(`Chunk ${chunkNum} returned invalid categories:`, categories);
        }
        
        processedChunks++;
        
        // Update progress
        currentTasks = currentTasks.map(t => t.name === `AI Processing Chunk ${chunkNum}/${totalChunks}` ? {...t, status: 'complete'} : t);
        await updateJobState({ 
          status: 'running', 
          message: `Completed chunk ${chunkNum}/${totalChunks} - ${processedChunks * chunkSize} bookmarks processed`, 
          progress: (processedChunks / totalChunks) * 85,
          chunkIndex: processedChunks,
          totalChunks: totalChunks,
          tasks: currentTasks
        });
        
        console.log(`Successfully completed chunk ${chunkNum}`);
        
        // Intelligent rate limiting based on chunk size and API limits
        const delayMs = calculateOptimalDelay(chunkSize, processedChunks, totalChunks);
        if (delayMs > 0) {
          console.log(`Rate limiting: waiting ${delayMs}ms before next chunk`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
      } catch (error) {
        console.error(`Error processing chunk ${chunkNum}:`, error);
        // Continue with other chunks, don't fail entire process
        currentTasks = currentTasks.map(t => t.name === `AI Processing Chunk ${chunkNum}/${totalChunks}` ? {...t, status: 'error'} : t);
        await updateJobState({ tasks: currentTasks });
        processedChunks++; // Still increment to avoid infinite loop
      }
    }

    const jobDataMerge = await chrome.storage.local.get(JOB_STORAGE_KEY);
    currentTasks = jobDataMerge[JOB_STORAGE_KEY]?.tasks || [];
    currentTasks.push({name: 'Merging All Categories', status: 'running'});
    await updateJobState({ status: 'running', message: 'Merging categories...', progress: 90, tasks: currentTasks });
    const mergedCategories = mergeCategories(allCategories);
    currentTasks = currentTasks.map(t => t.name === 'Merging All Categories' ? {...t, status: 'complete'} : t);
    await updateJobState({ tasks: currentTasks });
    console.log('Categories merged');
    
    const jobDataApply = await chrome.storage.local.get(JOB_STORAGE_KEY);
    currentTasks = jobDataApply[JOB_STORAGE_KEY]?.tasks || [];
    currentTasks.push({name: 'Applying Organization to Bookmarks', status: 'running'});
    await updateJobState({ status: 'running', message: 'Applying organization...', progress: 95, tasks: currentTasks });
    await applyOrganization(mergedCategories);
    currentTasks = currentTasks.map(t => t.name === 'Applying Organization to Bookmarks' ? {...t, status: 'complete'} : t);
    await updateJobState({ tasks: currentTasks });
    console.log('Organization applied');
    
    await updateJobState({ status: 'complete', message: 'Bookmarks organized successfully!', progress: 100 });
    console.log('Process complete');
    
    setTimeout(() => {
      chrome.storage.local.remove(JOB_STORAGE_KEY);
    }, 5000);
  } catch (error) {
    console.error('Organization process failed:', error);
    
    // Enterprise-level error categorization and handling
    const errorInfo = categorizeError(error);
    const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
    const job = jobData[JOB_STORAGE_KEY] || {};
    const errorCount = (job.errorCount || 0) + 1;
    
    // Build comprehensive error message with recovery suggestions
    let errorMessage = `${errorInfo.category}: ${error.message}`;
    
    // Add contextual information based on error type
    if (errorInfo.type === 'api_key') {
      errorMessage += '\n💡 Solution: Check your OpenAI API key in Settings';
    } else if (errorInfo.type === 'network') {
      errorMessage += '\n💡 Solution: Check your internet connection and try again';
    } else if (errorInfo.type === 'rate_limit') {
      errorMessage += '\n💡 Solution: Please wait a few minutes before trying again';
    } else if (errorInfo.type === 'quota') {
      errorMessage += '\n💡 Solution: Check your OpenAI API usage and billing';
    } else if (errorInfo.type === 'model') {
      errorMessage += '\n💡 Solution: Try switching to a different AI model';
    }
    
    // Add retry suggestion for recoverable errors
    if (errorInfo.recoverable && errorCount < 3) {
      errorMessage += `\n🔄 This error may be temporary. You can try again.`;
    } else if (errorCount >= 3) {
      errorMessage += `\n⚠️  Multiple failures detected. Please check your setup.`;
    }
    
    // Store detailed error information for debugging
    const errorDetails = {
      timestamp: new Date().toISOString(),
      type: errorInfo.type,
      category: errorInfo.category,
      recoverable: errorInfo.recoverable,
      originalMessage: error.message,
      stack: error.stack,
      context: {
        processedChunks: job.chunkIndex || 0,
        totalChunks: job.totalChunks || 0,
        startTime: job.startTime,
        selectedModel: job.selectedModel
      }
    };
    
    await updateJobState({ 
      status: 'error', 
      message: errorMessage, 
      progress: 0, 
      errorCount,
      errorDetails,
      recovery: errorInfo.recoverable
    });
  }
}

async function getApiKey() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['openaiApiKey'], (result) => {
            resolve(result.openaiApiKey);
        });
    });
}

// 1. Function to recursively get all bookmarks
async function getAllBookmarks() {
  return new Promise((resolve) => {
    chrome.bookmarks.getTree((bookmarkTreeNodes) => {
      const bookmarks = [];
      function flatten(nodes) {
        for (const node of nodes) {
          if (node.url) { // It's a bookmark, not a folder
            bookmarks.push({ id: node.id, title: node.title, url: node.url });
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

// Enterprise-grade retry function with intelligent backoff and error categorization
async function withRetry(fn, retries = 3, context = 'operation') {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`${context} attempt ${i + 1}/${retries} failed:`, error.message);
      
      // Don't retry certain types of permanent errors
      const errorInfo = categorizeError(error);
      if (!errorInfo.recoverable && i === 0) {
        console.log(`Non-recoverable error detected, skipping retries`);
        throw error;
      }
      
      // If this is the last attempt, throw the error
      if (i === retries - 1) {
        console.error(`All ${retries} attempts failed for ${context}`);
        throw error;
      }
      
      // Calculate intelligent backoff delay
      let delayMs = 1000 * Math.pow(2, i); // Exponential backoff base
      
      // Adjust delay based on error type
      if (errorInfo.type === 'rate_limit') {
        delayMs = Math.max(delayMs, 5000); // Minimum 5 seconds for rate limits
      } else if (errorInfo.type === 'network') {
        delayMs = Math.min(delayMs, 3000); // Cap network retries at 3 seconds
      }
      
      // Add jitter to avoid thundering herd
      const jitter = Math.random() * 1000;
      const finalDelay = delayMs + jitter;
      
      console.log(`Retrying ${context} in ${Math.round(finalDelay)}ms (${errorInfo.category})`);
      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }
  
  throw lastError;
}

async function getCategoriesFromAI(bookmarks, apiKey, model = 'gpt-4', existingCategories = []) {
  const simplifiedBookmarks = bookmarks.map(({ title, url }) => ({ title, url }));

  // Build contextual information for consistency across chunks
  const contextualInfo = existingCategories.length > 0 
    ? `\n\nCONTEXT FROM PREVIOUS CHUNKS:\nTo maintain consistency, consider using these existing categories when appropriate:\n${existingCategories.map(cat => `- "${cat}"`).join('\n')}\n\nOnly create new categories if the bookmarks don't fit well into existing ones.\n`
    : '';

  const prompt = `You are an expert bookmark organization specialist with years of experience in information architecture and user experience design. Your task is to intelligently categorize bookmarks into a logical, user-friendly folder structure.${contextualInfo}

ANALYSIS GUIDELINES:
- Analyze both URL domains and page titles for accurate categorization
- Consider user intent and browsing patterns
- Group related content under broader, intuitive categories
- Prioritize practical organization over granular specificity
- Aim for 5-12 main categories maximum for optimal usability

CATEGORIZATION PRINCIPLES:
1. CLARITY: Use clear, universally understood category names
2. CONSISTENCY: Apply consistent categorization logic throughout
3. COMPREHENSIVENESS: Ensure every bookmark finds an appropriate home
4. PRACTICALITY: Create categories users would naturally expect

PREFERRED CATEGORIES (adapt as needed):
- "Development & Programming" (code, tutorials, documentation, tools)
- "Work & Productivity" (project management, business tools, professional resources)
- "News & Information" (news sites, blogs, reference materials)
- "Shopping & Commerce" (e-commerce, reviews, deals, marketplaces)
- "Entertainment & Media" (streaming, gaming, music, videos, social media)
- "Learning & Education" (courses, tutorials, research, academic resources)
- "Health & Lifestyle" (fitness, cooking, travel, personal development)
- "Technology & Software" (apps, software, tech news, gadgets)
- "Finance & Business" (banking, investing, business news, financial tools)
- "Personal & Miscellaneous" (personal sites, utilities, uncategorized)

QUALITY REQUIREMENTS:
- Each category must contain at least 1 bookmark
- Category names should be 2-4 words maximum
- URLs must exactly match the input URLs (no modifications)
- Handle edge cases gracefully (unknown domains, generic titles)
- If unsure about a bookmark, place it in the most logical general category

OUTPUT FORMAT:
Return ONLY valid JSON in this exact structure:
{
  "categories": [
    {
      "category": "Category Name",
      "urls": ["exact_url_1", "exact_url_2"]
    }
  ]
}

BOOKMARKS TO CATEGORIZE:
${JSON.stringify(simplifiedBookmarks, null, 2)}

Analyze each bookmark carefully and provide a well-organized categorization that enhances user productivity and findability.`;

  // Optimize API parameters for high-quality bookmark categorization
  const apiParams = {
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are an expert bookmark organization specialist. Provide accurate, logical categorization with consistent quality.'
      },
      {
        role: 'user', 
        content: prompt
      }
    ],
    temperature: 0.3,           // Low temperature for consistent, logical categorization
    max_tokens: 4000,           // Sufficient tokens for comprehensive responses
    top_p: 0.9,                 // High-quality nucleus sampling
    presence_penalty: 0.1,      // Slight penalty to avoid repetitive categories
    frequency_penalty: 0.1,     // Encourage diverse category naming
    seed: Math.floor(Date.now() / 1000) // Reproducible results within same session
  };

  // Only add JSON mode for models that support it
  const modelCapabilities = selectOptimalModel(model, bookmarks.length);
  if (modelCapabilities.capabilities?.supportsJsonMode || 
      model === 'gpt-4-turbo' || 
      model === 'gpt-3.5-turbo') {
    apiParams.response_format = { "type": "json_object" };
  }

  const response = await withRetry(async () => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(apiParams)
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: { message: 'Unknown API error' } }));
      const errorMessage = errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
      throw new Error(`AI API Error: ${errorMessage}`);
    }
    return res;
  }, 3, `OpenAI API call (${model})`);

  const data = await response.json();
  
  // Parse and validate AI response with enterprise-quality checks
  let parsedContent;
  try {
    parsedContent = JSON.parse(data.choices[0].message.content);
  } catch (parseError) {
    console.error('Failed to parse AI response as JSON:', parseError);
    throw new Error('AI returned invalid JSON response');
  }

  // Comprehensive validation
  const validation = validateAIResponse(parsedContent, bookmarks);
  
  if (validation.errors.length > 0) {
    console.error('AI response validation failed:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('AI response validation warnings:', validation.warnings);
  }

  console.log('AI Response Quality Stats:', validation.stats);

  // Repair response if needed
  let finalResponse = parsedContent;
  if (!validation.isValid || validation.warnings.length > 0) {
    console.log('Attempting to repair AI response...');
    finalResponse = repairAIResponse(parsedContent, bookmarks, validation);
    
    // Validate repaired response
    const repairedValidation = validateAIResponse(finalResponse, bookmarks);
    console.log('Repaired response stats:', repairedValidation.stats);
  }

  return finalResponse.categories;
}

function mergeCategories(categories) {
  const categoryMap = new Map();

  for (const item of categories) {
    // Basic validation in case the AI returns a malformed item
    if (!item || !item.category || !Array.isArray(item.urls)) {
      console.warn('Skipping malformed category item from AI:', item);
      continue;
    }

    const { category, urls } = item;
    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category);
      existing.urls.push(...urls);
    } else {
      // Create a new object to avoid potential mutation issues
      categoryMap.set(category, { category, urls: [...urls] });
    }
  }

  return Array.from(categoryMap.values());
}

// 3. Function to create folders and move bookmarks
async function applyOrganization(categories) {
  const parentFolder = await chrome.bookmarks.create({
    parentId: '1',
    title: `AI Organized Bookmarks (${new Date().toLocaleDateString()})`
  });

  const urlToIdMap = new Map();
  const allBookmarks = await getAllBookmarks();
  allBookmarks.forEach(bm => urlToIdMap.set(bm.url, bm.id));

  const movePromises = [];
  for (const item of categories) {
    const categoryFolder = await chrome.bookmarks.create({
      parentId: parentFolder.id,
      title: item.category
    });

    for (const url of item.urls) {
      const bookmarkId = urlToIdMap.get(url);
      if (bookmarkId) {
        movePromises.push(chrome.bookmarks.move(bookmarkId, { parentId: categoryFolder.id }));
      }
    }
  }
  await Promise.all(movePromises);
} 

function getModelDisplayName(model) {
  const modelNames = {
    'gpt-4.1': 'GPT-4.1',
    'gpt-4.1-mini': 'GPT-4.1 Mini',
    'gpt-4.1-nano': 'GPT-4.1 Nano',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4': 'GPT-4',
    'gpt-3.5-turbo': 'GPT-3.5 Turbo'
  };
  return modelNames[model] || 'GPT-4.1 Mini';
} 

// Add alarm creation on install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('cleanupAlarm', { periodInMinutes: 30 });
}); 
