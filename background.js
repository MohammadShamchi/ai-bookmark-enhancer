const JOB_STORAGE_KEY = 'bookmarkOrganizationJob';
const ALARM_NAME = 'processNextChunkAlarm';

// Main listener to start or check the status of a job from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "organizeBookmarks") {
    startOrganizationProcess();
    return true;
  } else if (request.action === "checkJobStatus") {
    checkJobStatus().then(sendResponse);
    return true;
  }
});

// Listener for the alarm, which drives the chunk processing
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        processNextChunk();
    }
});

async function checkJobStatus() {
  const job = await chrome.storage.local.get(JOB_STORAGE_KEY);
  return job[JOB_STORAGE_KEY];
}

async function updateJobState(newState) {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY] || {};
  const updatedJob = { ...job, ...newState };
  await chrome.storage.local.set({ [JOB_STORAGE_KEY]: updatedJob });
  
  // Also update the popup if it's open
  chrome.runtime.sendMessage({ action: 'updateStatus', job: updatedJob }).catch(e => {}); // Ignore errors if popup isn't open
}

async function startOrganizationProcess() {
  const apiKey = await getApiKey();
  if (!apiKey) {
    await updateJobState({ status: 'error', message: 'API Key not set.' });
    return;
  }
  
  await updateJobState({ status: 'running', message: 'Gathering bookmarks...', bookmarks: [], categories: [], chunkIndex: 0 });

  const bookmarks = await getAllBookmarks();
  if (bookmarks.length === 0) {
    await updateJobState({ status: 'complete', message: 'No bookmarks to organize.' });
    return;
  }

  const CHUNK_SIZE = 200;
  await updateJobState({ 
    message: `Found ${bookmarks.length} bookmarks.`, 
    bookmarks,
    totalChunks: Math.ceil(bookmarks.length / CHUNK_SIZE)
  });

  // Kick off the first chunk by setting an alarm
  chrome.alarms.create(ALARM_NAME, { delayInMinutes: 0.02 }); // ~1 second delay
}

async function processNextChunk() {
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY];
  if (!job || job.status !== 'running') return;

  const { bookmarks, chunkIndex, totalChunks, categories } = job;
  const CHUNK_SIZE = 200;

  if (chunkIndex >= totalChunks) {
    await finalizeOrganization();
    return;
  }
  
  const chunk = bookmarks.slice(chunkIndex * CHUNK_SIZE, (chunkIndex + 1) * CHUNK_SIZE);
  
  await updateJobState({ message: `Sending chunk ${chunkIndex + 1} of ${totalChunks} to AI...` });
  
  try {
    const apiKey = await getApiKey();
    const categoriesFromChunk = await getCategoriesFromAI(chunk, apiKey);
    
    const newCategories = [...categories, ...(categoriesFromChunk || [])];
    await updateJobState({ categories: newCategories, chunkIndex: chunkIndex + 1 });

    // Trigger the next chunk with another alarm
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: 0.02 });

  } catch (error) {
    console.error('Chunk Processing Error:', error);
    await updateJobState({ status: 'error', message: `Error on chunk ${chunkIndex + 1}: ${error.message}` });
  }
}

async function finalizeOrganization() {
  await updateJobState({ message: 'All chunks processed. Merging and applying...' });
  
  const jobData = await chrome.storage.local.get(JOB_STORAGE_KEY);
  const job = jobData[JOB_STORAGE_KEY];
  const mergedCategories = mergeCategories(job.categories);

  await applyOrganization(mergedCategories);
  
  await updateJobState({ status: 'complete', message: 'Success! Bookmarks organized.' });
  
  // Clean up storage and alarm after a short delay
  setTimeout(() => {
      chrome.storage.local.remove(JOB_STORAGE_KEY);
      chrome.alarms.clear(ALARM_NAME);
  }, 5000);
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

// 2. Function to send data to OpenAI API
async function getCategoriesFromAI(bookmarks, apiKey) {
  const simplifiedBookmarks = bookmarks.map(({ title, url }) => ({ title, url }));

  const prompt = `
    You are an expert bookmark organizer. I will provide you with a list of my bookmarks in JSON format.
    Your task is to categorize them into a few, sensible, top-level folders.
    Common categories could be "Programming", "News & Articles", "Shopping", "Social Media", "Tools & Utilities", "Entertainment", "Finance", "Travel", etc. Try to use a small, efficient set of categories.
    
    IMPORTANT: Your response MUST be a valid JSON object. It should be a single object with one key: "categories".
    The value of "categories" should be an array of objects, where each object has a "category" name and a "urls" array containing the original URLs that belong to that category.
    
    Example response format:
    {
      "categories": [
        {
          "category": "Programming",
          "urls": ["https://stackoverflow.com/questions/123", "https://www.freecodecamp.org/"]
        },
        {
          "category": "Shopping",
          "urls": ["https://www.amazon.com/"]
        }
      ]
    }

    Do not include any other text, explanations, or markdown formatting in your response. Only the JSON object.

    Here are the bookmarks:
    ${JSON.stringify(simplifiedBookmarks)}
  `;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo-1106',
      messages: [{ role: 'user', content: prompt }],
      response_format: { "type": "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`AI API Error: ${errorData.error.message}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content.categories;
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
    parentId: '1', // '1' is the ID for the Bookmarks Bar
    title: `AI Organized Bookmarks (${new Date().toLocaleDateString()})`
  });

  const urlToIdMap = new Map();
  const allBookmarks = await getAllBookmarks();
  allBookmarks.forEach(bm => urlToIdMap.set(bm.url, bm.id));

  for (const item of categories) {
    const categoryName = item.category;
    const urls = item.urls;
    
    const categoryFolder = await chrome.bookmarks.create({
      parentId: parentFolder.id,
      title: categoryName
    });

    for (const url of urls) {
      const bookmarkId = urlToIdMap.get(url);
      if (bookmarkId) {
        await chrome.bookmarks.move(bookmarkId, { parentId: categoryFolder.id });
      }
    }
  }
} 
