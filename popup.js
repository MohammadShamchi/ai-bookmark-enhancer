// Sound system
class SoundManager {
  constructor() {
    this.context = null;
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    this.initAudio();
  }

  async initAudio() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      await this.loadSounds();
    } catch (error) {
      console.warn('Audio context not available:', error);
      this.enabled = false;
    }
  }

  async loadSounds() {
    const soundConfigs = {
      click: { frequency: 800, duration: 0.1, type: 'sine' },
      hover: { frequency: 600, duration: 0.05, type: 'sine' },
      success: { frequency: [523, 659, 784], duration: 0.2, type: 'sine' },
      error: { frequency: [400, 300], duration: 0.3, type: 'square' },
      processing: { frequency: 440, duration: 0.1, type: 'triangle' }
    };

    for (const [name, config] of Object.entries(soundConfigs)) {
      this.sounds[name] = config;
    }
  }

  playSound(soundName, volume = this.volume) {
    if (!this.enabled || !this.context || !this.sounds[soundName]) return;

    const config = this.sounds[soundName];
    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    if (Array.isArray(config.frequency)) {
      // Multi-tone sound
      config.frequency.forEach((freq, index) => {
        setTimeout(() => {
          const osc = this.context.createOscillator();
          const gain = this.context.createGain();
          osc.connect(gain);
          gain.connect(this.context.destination);
          
          osc.frequency.setValueAtTime(freq, this.context.currentTime);
          osc.type = config.type;
          gain.gain.setValueAtTime(volume * 0.5, this.context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + config.duration);
          
          osc.start();
          osc.stop(this.context.currentTime + config.duration);
        }, index * 100);
      });
    } else {
      oscillator.frequency.setValueAtTime(config.frequency, this.context.currentTime);
      oscillator.type = config.type;
      gainNode.gain.setValueAtTime(volume, this.context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + config.duration);
      
      oscillator.start();
      oscillator.stop(this.context.currentTime + config.duration);
    }
  }
}

const soundManager = new SoundManager();

document.addEventListener('DOMContentLoaded', () => {
  const organizeBtn = document.getElementById('organizeBtn');
  const statusContainer = document.getElementById('status');
  const statusText = statusContainer.querySelector('.status-text');
  const progressBar = statusContainer.querySelector('.progress-bar');
  const progressFill = statusContainer.querySelector('.progress-fill');

  // Add sound effects to button interactions
  organizeBtn.addEventListener('mouseenter', () => {
    soundManager.playSound('hover', 0.2);
  });

  organizeBtn.addEventListener('click', () => {
    soundManager.playSound('click');
  });

  function updateUi(job) {
    // Reset status container classes
    statusContainer.classList.remove('visible', 'running', 'success', 'error');
    statusText.classList.remove('updated');
    progressBar.classList.remove('visible');
    
    // Trigger reflow for animation
    void statusContainer.offsetWidth;

    if (!job) {
      statusText.textContent = '';
      organizeBtn.disabled = false;
      progressFill.style.width = '0%';
      checkApiKey();
      return;
    }

    // Show status container
    statusContainer.classList.add('visible');
    
    // Update status text with animation
    statusText.textContent = job.message || '';
    statusText.classList.add('updated');

    // Handle different job states
    if (job.status === 'running') {
      organizeBtn.disabled = true;
      statusContainer.classList.add('running');
      progressBar.classList.add('visible');
      soundManager.playSound('processing', 0.1);
      
      // Update progress if available
      if (job.chunkIndex && job.totalChunks) {
        const progress = (job.chunkIndex / job.totalChunks) * 100;
        progressFill.style.width = `${progress}%`;
      }
    } else if (job.status === 'complete') {
      organizeBtn.disabled = false;
      statusContainer.classList.add('success');
      progressFill.style.width = '100%';
      soundManager.playSound('success');
      
      // Auto-hide after success
      setTimeout(() => {
        statusContainer.classList.remove('visible');
      }, 3000);
    } else if (job.status === 'error') {
      organizeBtn.disabled = false;
      statusContainer.classList.add('error');
      soundManager.playSound('error');
    } else {
      organizeBtn.disabled = false;
    }
  }

  function checkApiKey() {
      chrome.storage.sync.get(['openaiApiKey'], (result) => {
        if (!result.openaiApiKey) {
          statusContainer.classList.add('visible');
          statusText.classList.remove('updated');
          void statusText.offsetWidth;
          statusText.innerHTML = 'API Key not set. Please <a href="options.html" target="_blank">configure it</a>.';
          statusText.classList.add('updated');
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
    // Check API key before starting
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
      if (!result.openaiApiKey || result.openaiApiKey.trim() === '') {
        updateUi({ status: 'error', message: 'Please set your OpenAI API key in options first.' });
        return;
      }
      
      // This message starts the whole process in the background script
      chrome.runtime.sendMessage({ action: "organizeBookmarks" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to start organization:', chrome.runtime.lastError.message);
          updateUi({ status: 'error', message: 'Failed to start organization process.' });
        }
      });
    });
  });

  // Listen for status updates from the background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateStatus') {
        updateUi(request.job);
        sendResponse({ received: true });
    }
    // Don't return true unless we're handling async response
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
