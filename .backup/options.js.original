// Sound system (simplified for options page)
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.2;
    this.loadSounds();
  }

  async loadSounds() {
    const soundFiles = {
      hover: 'Audio/mixkit-sparkle-hybrid-transition-3060.wav',
      click: 'Audio/mixkit-on-or-off-light-switch-tap-2585.wav',
      success: 'Audio/mixkit-magical-light-sweep-2586.wav',
      error: 'Audio/mixkit-on-or-off-light-switch-tap-2585.wav'
    };

    for (const [name, path] of Object.entries(soundFiles)) {
      try {
        const audio = new Audio(path);
        await new Promise((resolve, reject) => {
          audio.addEventListener('loadeddata', resolve);
          audio.addEventListener('error', reject);
          audio.load();
        });
        this.sounds[name] = audio;
      } catch (error) {
        console.warn(`Failed to load sound ${name}:`, error);
      }
    }
  }

  playSound(soundName, volume = this.volume) {
    if (!this.enabled || !this.sounds[soundName]) return;
    const audio = this.sounds[soundName].cloneNode();
    audio.volume = volume;
    audio.play().catch(error => {
      console.warn('Audio playback failed:', error);
    });
  }
}

const soundManager = new SoundManager();

const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const toggleBtn = document.getElementById('toggleBtn');
const messagePanel = document.getElementById('message');
const messageText = messagePanel.querySelector('.message-text');

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  
  // Update icon (you could add different icons for show/hide)
  toggleBtn.style.transform = isPassword ? 'rotate(180deg)' : 'rotate(0deg)';
  
  soundManager.playSound('click');
});

// Add hover sound to button
saveBtn.addEventListener('mouseenter', () => {
  soundManager.playSound('hover');
});

// Load the saved API key when the page opens
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
    }
  });
});

// Save the API key
saveBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();
  
  // Reset message state
  messagePanel.classList.remove('visible', 'success', 'error');
  
  if (apiKey) {
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      // Show success message
      messageText.textContent = 'API Key saved successfully!';
      messagePanel.classList.add('visible', 'success');
      
      // Play success sound
      soundManager.playSound('success');
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        messagePanel.classList.remove('visible');
      }, 3000);
    });
  } else {
    // Show error message
    messageText.textContent = 'Please enter a valid API key.';
    messagePanel.classList.add('visible', 'error');
    
    // Play error sound
    soundManager.playSound('error');
  }
}); 
