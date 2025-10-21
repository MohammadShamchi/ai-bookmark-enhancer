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
      processing: 'Audio/mixkit-sparkle-hybrid-transition-3060.wav',
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

document.addEventListener('DOMContentLoaded', () => {
  // Debug: Check if buttons exist
  console.log('🔍 Debug button exists:', !!document.getElementById('debugBtn'));

  const organizeBtn = document.getElementById('organizeBtn');
  const progressPanel = document.getElementById('progressPanel');
  const statusText = document.getElementById('statusText');
  const progressContainer = progressPanel.querySelector(
    '.flex.items-center.gap-4'
  );
  const progressBar = document.getElementById('progressBar');
  const ringProgress = document.getElementById('ringProgress');
  const ringLabel = document.getElementById('ringLabel');
  const progressPct = document.getElementById('progressPct');
  const chunksRate = document.getElementById('chunksRate');
  const eta = document.getElementById('eta');
  const taskList = document.getElementById('taskList');

  // Model selection functionality
  const modelBtn = document.getElementById('modelBtn');
  const modelMenu = document.getElementById('modelMenu');
  const modelLabel = document.getElementById('modelLabel');
  const activeModelChip = document.getElementById('activeModelChip');
  const modelChevron = document.getElementById('modelChevron');
  const modelOptions = modelMenu.querySelectorAll('button[data-model]');

  // Settings functionality
  const openSettings = document.getElementById('openSettings');
  const openSettingsTop = document.getElementById('openSettingsTop');

  // Debug and utility buttons
  const debugBtn = document.getElementById('debugBtn');
  const debugPanel = document.getElementById('debugPanel');
  const closeDebug = document.getElementById('closeDebug');
  const stopBtn = document.getElementById('stopBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Add sound effects to button interactions
  organizeBtn.addEventListener('mouseenter', () => {
    soundManager.playSound('hover', 0.2);
  });

  organizeBtn.addEventListener('click', () => {
    soundManager.playSound('click');
  });

  // Model dropdown toggle
  modelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    modelMenu.classList.toggle('hidden');
    modelChevron.style.transform = modelMenu.classList.contains('hidden')
      ? 'rotate(0deg)'
      : 'rotate(180deg)';
    soundManager.playSound('click', 0.3);
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!modelBtn.contains(e.target) && !modelMenu.contains(e.target)) {
      modelMenu.classList.add('hidden');
      modelChevron.style.transform = 'rotate(0deg)';
    }
  });

  // Model selection
  modelOptions.forEach((option) => {
    option.addEventListener('click', (e) => {
      e.stopPropagation();

      // Remove selected class from all options
      modelOptions.forEach((opt) =>
        opt.classList.remove('bg-indigo-500/20', 'text-indigo-300')
      );

      // Add selected class to clicked option
      option.classList.add('bg-indigo-500/20', 'text-indigo-300');

      // Update displayed model
      const modelName = option.dataset.model;
      modelLabel.textContent = modelName;
      activeModelChip.textContent = modelName;

      // Store selected model
      chrome.storage.sync.set({ selectedModel: modelName });

      // Close dropdown
      modelMenu.classList.add('hidden');
      modelChevron.style.transform = 'rotate(0deg)';

      soundManager.playSound('click', 0.4);
    });
  });

  // Settings navigation
  openSettings.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    soundManager.playSound('click', 0.4);
  });

  openSettingsTop.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    soundManager.playSound('click', 0.4);
  });

  // Load saved model preference
  chrome.storage.sync.get(['selectedModel'], (result) => {
    if (result.selectedModel) {
      const savedOption = modelMenu.querySelector(
        `[data-model="${result.selectedModel}"]`
      );
      if (savedOption) {
        modelOptions.forEach((opt) =>
          opt.classList.remove('bg-indigo-500/20', 'text-indigo-300')
        );
        savedOption.classList.add('bg-indigo-500/20', 'text-indigo-300');
        modelLabel.textContent = result.selectedModel;
        activeModelChip.textContent = result.selectedModel;
      }
    } else {
      // Default to GPT-4.1 Mini if no preference saved
      chrome.storage.sync.set({ selectedModel: 'GPT-4.1 Mini' });
    }
  });

  function updateCircularProgress(percentage) {
    const circumference = 2 * Math.PI * 50; // radius = 50 (from SVG)
    const offset = circumference * (1 - percentage / 100);

    if (ringProgress) {
      ringProgress.setAttribute('stroke-dashoffset', offset);
    }
    if (ringLabel) {
      ringLabel.textContent = `${Math.round(percentage)}%`;
    }
    if (progressPct) {
      progressPct.textContent = `${Math.round(percentage)}%`;
    }
  }

  function updateUi(job) {
    // Reset status panel classes
    progressPanel.classList.add('hidden');
    progressPanel.classList.remove('running', 'success', 'error');
    statusText.classList.remove('updated');

    // Trigger reflow for animation
    void progressPanel.offsetWidth;

    if (!job) {
      statusText.textContent = '';
      organizeBtn.disabled = false;
      progressBar.style.width = '0%';
      updateCircularProgress(0);
      resetBtn.style.display = 'none';
      stopBtn.style.display = 'none';
      checkApiKey();
      return;
    }

    // Show progress panel
    progressPanel.classList.remove('hidden');

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
      progressPanel.classList.add('running');
      const progress = job.progress || 0;
      progressBar.style.width = `${progress}%`;
      updateCircularProgress(progress);
      resetBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      soundManager.playSound('processing', 0.1);

      // Update progress if available
      if (job.chunkIndex && job.totalChunks) {
        const chunkProgress = (job.chunkIndex / job.totalChunks) * 100;
        progressBar.style.width = `${chunkProgress}%`;
        updateCircularProgress(chunkProgress);
      }

      // Update performance stats
      if (chunksRate && job.chunksPerSecond) {
        chunksRate.textContent = job.chunksPerSecond.toFixed(1);
      }
      if (eta && job.eta) {
        const etaMin = Math.round(job.eta / 60);
        const etaSec = Math.round(job.eta % 60);
        eta.textContent = `${etaMin}:${etaSec.toString().padStart(2, '0')}`;
      }
    } else if (job.status === 'complete') {
      organizeBtn.disabled = false;
      progressPanel.classList.add('success');
      progressBar.style.width = '100%';
      updateCircularProgress(100);
      resetBtn.style.display = 'none';
      stopBtn.style.display = 'none';
      soundManager.playSound('success');

      // Auto-hide after success
      setTimeout(() => {
        progressPanel.classList.add('hidden');
      }, 3000);
    } else if (job.status === 'error') {
      organizeBtn.disabled = false;
      progressPanel.classList.add('error');
      progressBar.style.width = '0%';
      updateCircularProgress(0);
      resetBtn.style.display = 'block';
      stopBtn.style.display = 'none';
      soundManager.playSound('error');
      if (job.errorCount > 1) {
        statusText.innerHTML +=
          '<br>Suggestion: Check your API key or network connection.';
      }
    } else {
      organizeBtn.disabled = false;
      resetBtn.style.display = 'none';
    }

    // Update task list with new Tailwind classes
    if (taskList) {
      taskList.innerHTML = '';

      // Create task items if tasks exist
      if (job.tasks && job.tasks.length > 0) {
        job.tasks.forEach((task, idx) => {
          const row = document.createElement('div');
          row.className =
            'flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2 py-1.5';

          const state = task.status === 'complete' ? 'done' : 'processing';

          row.innerHTML = `
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full ${
                state === 'done'
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400 animate-pulse'
              }"></div>
              <span class="text-xs text-slate-200">${task.name}</span>
            </div>
            <div class="text-xs ${
              state === 'done' ? 'text-emerald-300' : 'text-slate-400'
            } flex items-center gap-1">
              ${
                state === 'done'
                  ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg> Done'
                  : 'Processing'
              }
            </div>
          `;
          taskList.appendChild(row);
        });
      } else {
        // Show default task items for common processing steps
        const defaultSteps = [
          'API Validation',
          'Bookmark Analysis',
          'AI Processing',
          'Organization',
        ];

        defaultSteps.forEach((step, idx) => {
          const row = document.createElement('div');
          row.className =
            'flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2 py-1.5';

          let state = 'processing';
          if (job.status === 'running' && job.progress) {
            const progress = job.progress;
            if (progress > idx * 25) state = 'done';
          }

          row.innerHTML = `
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full ${
                state === 'done'
                  ? 'bg-emerald-400'
                  : 'bg-indigo-400 animate-pulse'
              }"></div>
              <span class="text-xs text-slate-200">${step}</span>
            </div>
            <div class="text-xs ${
              state === 'done' ? 'text-emerald-300' : 'text-slate-400'
            } flex items-center gap-1">
              ${
                state === 'done'
                  ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg> Done'
                  : 'Processing'
              }
            </div>
          `;
          taskList.appendChild(row);
        });
      }
    }
  }

  function checkApiKey() {
    chrome.storage.sync.get(['openaiApiKey'], (result) => {
      if (!result.openaiApiKey) {
        progressPanel.classList.remove('hidden');
        statusText.classList.remove('updated');
        void statusText.offsetWidth;
        statusText.innerHTML =
          'API Key not set. Please <a href="options.html" target="_blank">configure it</a>.';
        statusText.classList.add('updated');
        organizeBtn.disabled = true;
      }
    });
  }

  // When popup opens, check for job status and force reset if stuck
  chrome.runtime.sendMessage({ action: 'checkJobStatus' }, (job) => {
    if (chrome.runtime.lastError) {
      console.warn(
        'Could not check job status:',
        chrome.runtime.lastError.message
      );
      // If we can't check status, assume no job and enable button
      updateUi(null);
      return;
    }

    // Check if job is stuck (older than 10 minutes)
    if (job && job.status === 'running' && job.startTime) {
      const elapsed = Date.now() - job.startTime;
      const tenMinutes = 10 * 60 * 1000;

      if (elapsed > tenMinutes) {
        console.warn(
          '🚨 Detected stuck job older than 10 minutes, force resetting...'
        );
        chrome.runtime.sendMessage({ action: 'emergencyStop' }, (response) => {
          console.log('Force reset result:', response);
          updateUi(null);
          statusText.textContent =
            '⚠️ Stuck job cleared - you can now organize bookmarks';
          progressPanel.classList.remove('hidden');
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
        updateUi({
          status: 'error',
          message: 'Please set your OpenAI API key in options first.',
        });
        return;
      }

      const selectedModel = result.selectedModel || 'GPT-4.1 Mini';

      // This message starts the whole process in the background script
      chrome.runtime.sendMessage(
        {
          action: 'organizeBookmarks',
          model: selectedModel,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              'Failed to start organization:',
              chrome.runtime.lastError.message
            );
            updateUi({
              status: 'error',
              message: 'Failed to start organization process.',
            });
            return;
          }

          if (!response || !response.success) {
            updateUi({
              status: 'error',
              message:
                response?.error || 'Failed to start organization process.',
            });
          }
        }
      );
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

  // Debug panel functionality
  if (debugBtn) {
    debugBtn.addEventListener('click', () => {
      debugPanel.classList.toggle('hidden');
      soundManager.playSound('click', 0.3);
    });
  }

  if (closeDebug) {
    closeDebug.addEventListener('click', () => {
      debugPanel.classList.add('hidden');
      soundManager.playSound('click', 0.3);
    });
  }

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'resetJob' });
      updateUi(null);
      soundManager.playSound('click', 0.3);
    });
  }

  // Emergency stop button
  if (stopBtn) {
    stopBtn.addEventListener('click', () => {
      console.log('🚨 Emergency stop requested by user');
      chrome.runtime.sendMessage({ action: 'emergencyStop' }, (response) => {
        if (response && response.success) {
          console.log('✅ Emergency stop successful:', response.message);
          updateUi(null);
          statusText.textContent = '🚨 Processing stopped by user';
          progressPanel.classList.remove('hidden');
        } else {
          console.error('❌ Emergency stop failed:', response?.error);
        }
      });
      soundManager.playSound('click', 0.3);
    });
  }

  // Debug button event listener
  if (debugBtn) {
    debugBtn.addEventListener('click', () => {
      console.log('🔍 Debug bookmarks requested');
      chrome.runtime.sendMessage({ action: 'debugBookmarks' }, (response) => {
        if (response && response.success) {
          console.log('📊 Bookmark Debug Results:', response);
          statusText.innerHTML = `
            📊 Total bookmarks: ${response.totalBookmarks}<br>
            📁 AI organized folders: ${response.organizedFolders}<br>
            ${response.folders.map((f) => `📁 "${f.title}"`).join('<br>')}
          `;
          progressPanel.classList.remove('hidden');
        } else {
          console.error('❌ Debug failed:', response?.error);
          statusText.textContent =
            '❌ Debug failed: ' + (response?.error || 'Unknown error');
          progressPanel.classList.remove('hidden');
        }
      });
      soundManager.playSound('click', 0.3);
    });
  }

  checkApiKey(); // Initial check
});

// Note: All bookmark processing logic has been moved to background.js for better architecture.
// The popup now focuses solely on UI interactions and status updates.
