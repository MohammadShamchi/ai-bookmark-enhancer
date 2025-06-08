document.addEventListener('DOMContentLoaded', () => {
  const organizeBtn = document.getElementById('organizeBtn');
  const statusDiv = document.getElementById('status');

  function updateUi(job) {
    if (!job) {
      statusDiv.textContent = '';
      organizeBtn.disabled = false;
      checkApiKey(); // Check if key is set to disable button
      return;
    }

    statusDiv.textContent = job.message || '';
    if (job.status === 'running') {
      organizeBtn.disabled = true;
    } else { // 'complete', 'error', or undefined
      organizeBtn.disabled = false;
    }
  }

  function checkApiKey() {
      chrome.storage.sync.get(['openaiApiKey'], (result) => {
        if (!result.openaiApiKey) {
          statusDiv.innerHTML = 'API Key not set. Please <a href="options.html" target="_blank">set it</a>.';
          organizeBtn.disabled = true;
        }
      });
  }

  // When popup opens, immediately check for an ongoing job
  chrome.runtime.sendMessage({ action: "checkJobStatus" }, (job) => {
    if (chrome.runtime.lastError) {
        console.warn("Could not check job status:", chrome.runtime.lastError.message);
    }
    updateUi(job);
  });

  organizeBtn.addEventListener('click', () => {
    // This message starts the whole process in the background script
    chrome.runtime.sendMessage({ action: "organizeBookmarks" });
  });

  // Listen for status updates from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStatus') {
        updateUi(request.job);
    }
    return true;
  });

  checkApiKey(); // Initial check
});

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

  // This prompt is CRITICAL. It instructs the AI to return a specific JSON format.
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
      model: 'gpt-3.5-turbo-1106', // This model is good at following JSON format instructions
      messages: [{ role: 'user', content: prompt }],
      response_format: { "type": "json_object" } // Enforce JSON mode
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`AI API Error: ${errorData.error.message}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content.categories; // Directly return the array of categories
}


// 3. Function to create folders and move bookmarks
async function applyOrganization(categories) {
  // Create one main folder to hold all the organized bookmarks
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
    
    // Create a new folder for this category inside our main folder
    const categoryFolder = await chrome.bookmarks.create({
      parentId: parentFolder.id,
      title: categoryName
    });

    for (const url of urls) {
      const bookmarkId = urlToIdMap.get(url);
      if (bookmarkId) {
        // Move the bookmark into the new category folder
        await chrome.bookmarks.move(bookmarkId, { parentId: categoryFolder.id });
      }
    }
  }
} 
