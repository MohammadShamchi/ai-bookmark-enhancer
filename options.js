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
      error: 'Audio/mixkit-on-or-off-light-switch-tap-2585.wav',
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
    audio.play().catch((error) => {
      console.warn('Audio playback failed:', error);
    });
  }
}

const soundManager = new SoundManager();

// DOM Elements - Updated selectors for new HTML structure
const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const toggleBtn = document.getElementById('toggleBtn');
const eyeOpen = document.getElementById('eyeOpen');
const eyeClosed = document.getElementById('eyeClosed');
const helpToggle = document.getElementById('helpToggle');
const helpPanel = document.getElementById('helpPanel');
const helpChevron = document.getElementById('helpChevron');
const toastWrap = document.getElementById('toastWrap');

// Toast notification system
function showToast(type, text) {
  const colors = {
    success: {
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/30',
      text: 'text-emerald-200',
    },
    error: {
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
      text: 'text-red-200',
    },
    info: {
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/30',
      text: 'text-cyan-200',
    },
  };
  const c = colors[type] || colors.info;
  const item = document.createElement('div');
  item.className = `pointer-events-auto ${c.bg} ${c.border} border rounded-lg shadow-xl px-4 py-3 text-sm ${c.text} transform transition`;
  item.style.transform = 'translateY(-10px)';
  item.style.opacity = '0';
  item.innerHTML = `
    <div class="flex items-start gap-2">
      <div class="pt-0.5">
        ${
          type === 'success'
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : type === 'error'
            ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 8v5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 16h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
            : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5"/><path d="M12 16v-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 8h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
        }
      </div>
      <div class="flex-1">${text}</div>
      <button class="ml-3 p-1 rounded hover:bg-white/10">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
  `;
  const closeBtn = item.querySelector('button');
  closeBtn.addEventListener('click', () => dismiss());
  toastWrap.appendChild(item);
  requestAnimationFrame(() => {
    item.style.transform = 'translateY(0px)';
    item.style.opacity = '1';
  });
  const dismiss = () => {
    item.style.transform = 'translateY(-10px)';
    item.style.opacity = '0';
    setTimeout(() => item.remove(), 180);
  };
  setTimeout(dismiss, 3800);
}

// Password visibility toggle
toggleBtn.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';

  // Toggle eye icons
  eyeOpen.classList.toggle('hidden', !isPassword);
  eyeClosed.classList.toggle('hidden', isPassword);

  soundManager.playSound('click');
});

// Help accordion functionality
helpToggle.addEventListener('click', () => {
  const isClosed =
    helpPanel.style.maxHeight === '' || helpPanel.style.maxHeight === '0px';
  helpPanel.style.maxHeight = isClosed ? helpPanel.scrollHeight + 'px' : '0px';
  helpChevron.style.transform = isClosed ? 'rotate(180deg)' : '';

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

// API Key validation function
function validateApiKey(apiKey) {
  if (!apiKey || apiKey.length < 16) {
    return {
      valid: false,
      message: 'API key is too short. Please enter a valid key.',
    };
  }
  if (!apiKey.startsWith('sk-')) {
    return {
      valid: false,
      message: 'API key should start with "sk-". Please check your key.',
    };
  }
  return { valid: true };
}

// Save the API key with enhanced validation and toast notifications
saveBtn.addEventListener('click', () => {
  const apiKey = apiKeyInput.value.trim();

  // Validate API key
  const validation = validateApiKey(apiKey);

  if (!validation.valid) {
    showToast('error', validation.message);
    soundManager.playSound('error');
    return;
  }

  // Save to Chrome storage
  chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
    if (chrome.runtime.lastError) {
      showToast('error', 'Failed to save API key. Please try again.');
      soundManager.playSound('error');
    } else {
      showToast('success', 'API key saved successfully!');
      soundManager.playSound('success');
    }
  });
});
