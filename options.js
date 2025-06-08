// Sound system (simplified for options page)
class SoundManager {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.volume = 0.2;
    this.initAudio();
  }

  async initAudio() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      this.enabled = false;
    }
  }

  playSound(frequency = 600, duration = 0.1, type = 'sine') {
    if (!this.enabled || !this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
    oscillator.type = type;
    gainNode.gain.setValueAtTime(this.volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.context.currentTime + duration);
  }
}

const soundManager = new SoundManager();

const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const toggleBtn = document.getElementById('toggleBtn');
const messageContainer = document.getElementById('message');
const messageText = messageContainer.querySelector('.message-text');

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  
  // Update icon (you could add different icons for show/hide)
  toggleBtn.style.transform = isPassword ? 'rotate(180deg)' : 'rotate(0deg)';
  
  soundManager.playSound(400, 0.05);
});

// Add hover sound to button
saveBtn.addEventListener('mouseenter', () => {
  soundManager.playSound(600, 0.05);
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
  messageContainer.classList.remove('visible', 'success', 'error');
  
  if (apiKey) {
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      // Show success message
      messageText.textContent = 'API Key saved successfully!';
      messageContainer.classList.add('visible', 'success');
      
      // Play success sound
      soundManager.playSound(523, 0.1);
      setTimeout(() => soundManager.playSound(659, 0.1), 100);
      setTimeout(() => soundManager.playSound(784, 0.1), 200);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        messageContainer.classList.remove('visible');
      }, 3000);
    });
  } else {
    // Show error message
    messageText.textContent = 'Please enter a valid API key.';
    messageContainer.classList.add('visible', 'error');
    
    // Play error sound
    soundManager.playSound(400, 0.2, 'square');
    setTimeout(() => soundManager.playSound(300, 0.2, 'square'), 150);
  }
}); 
