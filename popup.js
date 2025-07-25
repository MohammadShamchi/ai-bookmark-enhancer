// Sound system
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.3;
    this.loadSounds();
  }

  async loadSounds() {
    const soundFiles = {
      hover: 'Audio/mixkit-sparkle-hybrid-transition-3060.wav',
      click: 'Audio/mixkit-on-or-off-light-switch-tap-2585.wav',
      success: 'Audio/mixkit-magical-light-sweep-2586.wav',
      error: 'Audio/mixkit-on-or-off-light-switch-tap-2585.wav',
      processing: 'Audio/mixkit-sparkle-hybrid-transition-3060.wav'
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

document.addEventListener('DOMContentLoaded', () => {
  // Debug: Check if buttons exist
  console.log('🔍 Debug button exists:', !!document.getElementById('debugBtn'));
  console.log('🔓 Force unlock button exists:', !!document.getElementById('forceUnlockBtn'));
  console.log('📋 All elements in footer:', document.querySelector('.card-footer').innerHTML);
  
  const organizeBtn = document.getElementById('organizeBtn');
  const statusPanel = document.getElementById('status');
  const statusText = statusPanel.querySelector('.status-text');
  const progressContainer = statusPanel.querySelector('.progress-container');
  const progressFill = statusPanel.querySelector('.progress-fill');
  const circularProgress = statusPanel.querySelector('.circular-progress .progress-circle');
  const progressText = statusPanel.querySelector('.progress-text');
  
  // Model selection functionality
  const modelBadge = document.getElementById('modelBadge');
  const modelDropdown = document.getElementById('modelDropdown');
  const selectedModel = document.getElementById('selectedModel');
  const modelOptions = modelDropdown.querySelectorAll('.model-option');
  
  // Settings icon functionality
  const settingsIcon = document.getElementById('settingsIcon');
  
  // Debug and utility buttons
  const debugBtn = document.getElementById('debugBtn');
  const forceUnlockBtn = document.getElementById('forceUnlockBtn');

  // Add sound effects to button interactions
  organizeBtn.addEventListener('mouseenter', () => {
    soundManager.playSound('hover', 0.2);
  });

  organizeBtn.addEventListener('click', () => {
    soundManager.playSound('click');
  });

  // Model dropdown positioning function
  function positionDropdown() {
    const badge = document.getElementById('modelBadge');
    const dropdown = document.getElementById('modelDropdown');
    if (!badge || !dropdown) return;
    
    // Move dropdown to body if not already there (escape stacking context)
    if (dropdown.parentElement !== document.body) {
      document.body.appendChild(dropdown);
    }
    
    const rect = badge.getBoundingClientRect();
    
    // Calculate position relative to viewport with scroll offsets
    const top = rect.bottom + window.scrollY + 4;
    const left = rect.right + window.scrollX - 160; // 160px is min-width of dropdown
    
    // Boundary checking - ensure dropdown stays within popup bounds
    const dropdownHeight = dropdown.offsetHeight || 200; // fallback height
    const dropdownWidth = dropdown.offsetWidth || 160;
    const popupHeight = window.innerHeight;
    const popupWidth = window.innerWidth;
    
    // Adjust if would overflow bottom
    const adjustedTop = top + dropdownHeight > popupHeight ? 
      rect.top + window.scrollY - dropdownHeight - 4 : top;
    
    // Adjust if would overflow right
    const adjustedLeft = left + dropdownWidth > popupWidth ? 
      popupWidth - dropdownWidth - 8 : left;
    
    dropdown.style.top = `${adjustedTop}px`;
    dropdown.style.left = `${adjustedLeft}px`;
  }

  // Model dropdown toggle
  modelBadge.addEventListener('click', (e) => {
    e.stopPropagation();
    if (modelDropdown.classList.contains('show')) {
      originalCloseDropdown();
    } else {
      positionDropdown(); // Position before showing
      modelDropdown.classList.add('show');
    }
    soundManager.playSound('click', 0.3);
  });
  
  // Reposition on window resize and ensure proper cleanup
  window.addEventListener('resize', () => {
    if (modelDropdown.classList.contains('show')) {
      positionDropdown();
    }
  });
  
  // Cleanup: Move dropdown back to original parent when hidden
  const originalDropdownParent = modelDropdown.parentElement;
  const originalDropdownNextSibling = modelDropdown.nextSibling;
  
  // Override the existing close logic to restore DOM position
  const originalCloseDropdown = () => {
    modelDropdown.classList.remove('show');
    // Move back to original position if it was moved to body
    if (modelDropdown.parentElement === document.body && originalDropdownParent) {
      if (originalDropdownNextSibling) {
        originalDropdownParent.insertBefore(modelDropdown, originalDropdownNextSibling);
      } else {
        originalDropdownParent.appendChild(modelDropdown);
      }
    }
  };

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!modelBadge.contains(e.target) && !modelDropdown.contains(e.target)) {
      originalCloseDropdown();
    }
  });

  // Model selection
  modelOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Remove selected class from all options
      modelOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selected class to clicked option
      option.classList.add('selected');
      
      // Update displayed model
      const modelName = option.dataset.model;
      selectedModel.textContent = option.querySelector('.model-name').textContent;
      
      // Store selected model
      chrome.storage.sync.set({ selectedModel: modelName });
      
      // Close dropdown
      originalCloseDropdown();
      
      soundManager.playSound('click', 0.4);
    });
  });

  // Settings icon click
  settingsIcon.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    soundManager.playSound('click', 0.4);
  });

  // Load saved model preference
  chrome.storage.sync.get(['selectedModel'], (result) => {
    if (result.selectedModel) {
      const savedOption = modelDropdown.querySelector(`[data-model="${result.selectedModel}"]`);
      if (savedOption) {
        modelOptions.forEach(opt => opt.classList.remove('selected'));
        savedOption.classList.add('selected');
        selectedModel.textContent = savedOption.querySelector('.model-name').textContent;
      }
    } else {
      // Default to GPT-4.1 Mini if no preference saved
      chrome.storage.sync.set({ selectedModel: 'gpt-4.1-mini' });
    }
  });

  function updateCircularProgress(percentage) {
    const circumference = 2 * Math.PI * 40; // radius = 40
    const offset = circumference - (percentage / 100) * circumference;
    
    if (circularProgress) {
      circularProgress.style.strokeDashoffset = offset;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(percentage)}%`;
    }
  }

  function updateUi(job) {
    // Reset status panel classes
    statusPanel.classList.remove('visible', 'running', 'success', 'error');
    statusText.classList.remove('updated');
    progressContainer.classList.remove('visible');
    progressFill.classList.remove('animating');
    
    // Trigger reflow for animation
    void statusPanel.offsetWidth;

    if (!job) {
      statusText.textContent = '';
      organizeBtn.disabled = false;
      progressFill.style.width = '0%';
      updateCircularProgress(0);
      resetBtn.style.display = 'none';
      emergencyStopBtn.style.display = 'none'; // Hide emergency stop when no job
      checkApiKey();
      return;
    }

    // Show status panel
    statusPanel.classList.add('visible');
    
    // Update status text with animation
    let message = job.message || '';
    if (job.progress !== undefined) {
      message += ` (${Math.round(job.progress)}%)`;
    }
    if (job.eta) {
      const etaMin = Math.round(job.eta / 60);
      message += ` (ETA: ${etaMin} min)`;
    }
    statusText.textContent = message;
    statusText.classList.add('updated');

    // Handle different job states
    if (job.status === 'running') {
      organizeBtn.disabled = true;
      statusPanel.classList.add('running');
      progressContainer.classList.add('visible');
      const progress = job.progress || 0;
      progressFill.style.width = `${progress}%`;
      updateCircularProgress(progress);
      resetBtn.style.display = 'none';
      emergencyStopBtn.style.display = 'block'; // Show emergency stop during processing
      soundManager.playSound('processing', 0.1);
      
      // Update progress if available
      if (job.chunkIndex && job.totalChunks) {
        const chunkProgress = (job.chunkIndex / job.totalChunks) * 100;
        progressFill.style.width = `${chunkProgress}%`;
        updateCircularProgress(chunkProgress);
      }
      if (job.message && job.message.includes('Processing')) {
        progressFill.classList.add('animating');
      } else {
        progressFill.classList.remove('animating');
      }
    } else if (job.status === 'complete') {
      organizeBtn.disabled = false;
      statusPanel.classList.add('success');
      progressFill.style.width = '100%';
      updateCircularProgress(100);
      resetBtn.style.display = 'none';
      emergencyStopBtn.style.display = 'none'; // Hide emergency stop when complete
      soundManager.playSound('success');
      
      // Auto-hide after success
      setTimeout(() => {
        statusPanel.classList.remove('visible');
      }, 3000);
    } else if (job.status === 'error') {
      organizeBtn.disabled = false;
      statusPanel.classList.add('error');
      progressFill.style.width = '0%';
      updateCircularProgress(0);
      resetBtn.style.display = 'block';
      emergencyStopBtn.style.display = 'none'; // Hide emergency stop on error
      soundManager.playSound('error');
      if (job.errorCount > 1) {
        statusText.innerHTML += '<br>Suggestion: Check your API key or network connection.';
      }
    } else {
      organizeBtn.disabled = false;
      progressFill.classList.remove('animating');
      resetBtn.style.display = 'none';
    }

    const statusCards = document.getElementById('statusCards');
    statusCards.innerHTML = '';
    
    // Create premium status cards if tasks exist
    if (job.tasks && job.tasks.length > 0) {
      job.tasks.forEach(task => {
        const statusCard = document.createElement('div');
        statusCard.className = `status-card ${task.status}`;
        
        // Determine icon based on task type and status
        let icon = '●';
        if (task.status === 'complete') icon = '✓';
        else if (task.status === 'running') icon = '⚡';
        else if (task.status === 'error') icon = '⚠';
        
        // Determine description based on status
        let description = 'Pending';
        if (task.status === 'running') description = 'In progress...';
        else if (task.status === 'complete') description = 'Completed successfully';
        else if (task.status === 'error') description = 'Failed - retrying';
        
        statusCard.innerHTML = `
          <div class="status-card-icon">${icon}</div>
          <div class="status-card-content">
            <div class="status-card-title">${task.name}</div>
            <div class="status-card-description">${description}</div>
          </div>
          <svg class="status-card-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        `;
        statusCards.appendChild(statusCard);
      });
    } else {
      // Show default status cards for common processing steps
      const defaultSteps = [
        { name: 'API Validation', status: job.status === 'running' ? 'complete' : 'pending' },
        { name: 'Bookmark Analysis', status: job.status === 'running' ? 'running' : 'pending' },
        { name: 'AI Processing', status: 'pending' },
        { name: 'Organization', status: 'pending' }
      ];
      
      defaultSteps.forEach((step, index) => {
        const statusCard = document.createElement('div');
        let cardStatus = step.status;
        
        // Update status based on job progress
        if (job.status === 'running' && job.progress) {
          const progress = job.progress;
          if (progress > index * 25) cardStatus = 'complete';
          else if (progress > (index - 1) * 25) cardStatus = 'running';
        }
        
        statusCard.className = `status-card ${cardStatus}`;
        
        let icon = '●';
        if (cardStatus === 'complete') icon = '✓';
        else if (cardStatus === 'running') icon = '⚡';
        
        let description = 'Pending';
        if (cardStatus === 'running') description = 'In progress...';
        else if (cardStatus === 'complete') description = 'Completed successfully';
        
        statusCard.innerHTML = `
          <div class="status-card-icon">${icon}</div>
          <div class="status-card-content">
            <div class="status-card-title">${step.name}</div>
            <div class="status-card-description">${description}</div>
          </div>
          <svg class="status-card-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        `;
        statusCards.appendChild(statusCard);
      });
    }
  }

  function checkApiKey() {
      chrome.storage.sync.get(['openaiApiKey'], (result) => {
        if (!result.openaiApiKey) {
          statusPanel.classList.add('visible');
          statusText.classList.remove('updated');
          void statusText.offsetWidth;
          statusText.innerHTML = 'API Key not set. Please <a href="options.html" target="_blank">configure it</a>.';
          statusText.classList.add('updated');
          organizeBtn.disabled = true;
        }
      });
  }

  // When popup opens, check for job status and force reset if stuck
  chrome.runtime.sendMessage({ action: "checkJobStatus" }, (job) => {
    if (chrome.runtime.lastError) {
      console.warn("Could not check job status:", chrome.runtime.lastError.message);
      // If we can't check status, assume no job and enable button
      updateUi(null);
      return;
    }
    
    // Check if job is stuck (older than 10 minutes)
    if (job && job.status === 'running' && job.startTime) {
      const elapsed = Date.now() - job.startTime;
      const tenMinutes = 10 * 60 * 1000;
      
      if (elapsed > tenMinutes) {
        console.warn('🚨 Detected stuck job older than 10 minutes, force resetting...');
        chrome.runtime.sendMessage({ action: 'emergencyStop' }, (response) => {
          console.log('Force reset result:', response);
          updateUi(null);
          statusText.textContent = '⚠️ Stuck job cleared - you can now organize bookmarks';
          statusPanel.classList.add('visible');
        });
        return;
      }
    }
    
    updateUi(job);
  });

  organizeBtn.addEventListener('click', () => {
    // Check API key before starting
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel'], (result) => {
      if (!result.openaiApiKey || result.openaiApiKey.trim() === '') {
        updateUi({ status: 'error', message: 'Please set your OpenAI API key in options first.' });
        return;
      }
      
      const selectedModel = result.selectedModel || 'gpt-4.1-mini';
      
      // This message starts the whole process in the background script
      chrome.runtime.sendMessage({ 
        action: "organizeBookmarks", 
        model: selectedModel 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to start organization:', chrome.runtime.lastError.message);
          updateUi({ status: 'error', message: 'Failed to start organization process.' });
          return;
        }
        
        if (!response || !response.success) {
          updateUi({ status: 'error', message: response?.error || 'Failed to start organization process.' });
        }
      });
    });
  });

  // Listen for status updates from the background script
  chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === 'updateStatus') {
        updateUi(request.job);
        sendResponse({ received: true });
    }
    // Don't return true unless we're handling async response
  });

  // Force show debug buttons if they exist but are hidden
  if (debugBtn) {
    debugBtn.style.display = 'block';
    debugBtn.style.visibility = 'visible';
    console.log('✅ Debug button forced visible');
  }
  
  if (forceUnlockBtn) {
    forceUnlockBtn.style.display = 'block';
    forceUnlockBtn.style.visibility = 'visible';
    console.log('✅ Force unlock button forced visible');
  }

  checkApiKey(); // Initial check

  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'resetJob' });
    updateUi(null);
  });

  // Emergency stop button
  const emergencyStopBtn = document.getElementById('emergencyStopBtn');
  emergencyStopBtn.addEventListener('click', () => {
    console.log('🚨 Emergency stop requested by user');
    chrome.runtime.sendMessage({ action: 'emergencyStop' }, (response) => {
      if (response && response.success) {
        console.log('✅ Emergency stop successful:', response.message);
        updateUi(null);
        statusText.textContent = '🚨 Processing stopped by user';
        statusPanel.classList.add('visible');
      } else {
        console.error('❌ Emergency stop failed:', response?.error);
      }
    });
  });

  // Debug button event listener
  debugBtn.addEventListener('click', () => {
    console.log('🔍 Debug bookmarks requested');
    chrome.runtime.sendMessage({ action: 'debugBookmarks' }, (response) => {
      if (response && response.success) {
        console.log('📊 Bookmark Debug Results:', response);
        statusText.innerHTML = `
          📊 Total bookmarks: ${response.totalBookmarks}<br>
          📁 AI organized folders: ${response.organizedFolders}<br>
          ${response.folders.map(f => `📁 "${f.title}"`).join('<br>')}
        `;
        statusPanel.classList.add('visible');
      } else {
        console.error('❌ Debug failed:', response?.error);
        statusText.textContent = '❌ Debug failed: ' + (response?.error || 'Unknown error');
        statusPanel.classList.add('visible');
      }
    });
  });

  // Force unlock button event listener
  forceUnlockBtn.addEventListener('click', () => {
    console.log('🔓 Force unlock requested');
    
    // Force clear everything
    chrome.runtime.sendMessage({ action: 'emergencyStop' }, (response) => {
      console.log('Emergency stop result:', response);
      
      // Clear storage manually
      chrome.storage.local.clear(() => {
        console.log('✅ All local storage cleared');
        
        // Reset UI
        organizeBtn.disabled = false;
        statusText.textContent = '🔓 Extension unlocked - ready to organize bookmarks';
        statusPanel.classList.add('visible');
        statusPanel.classList.remove('running', 'error');
        resetBtn.style.display = 'none';
        emergencyStopBtn.style.display = 'none';
        progressContainer.classList.remove('visible');
        
        console.log('✅ UI reset complete');
      });
    });
  });
});

// Note: All bookmark processing logic has been moved to background.js for better architecture.
// The popup now focuses solely on UI interactions and status updates. 
