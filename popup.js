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
  const organizeBtnText = document.getElementById('organizeBtnText');
  const progressPanel = document.getElementById('progressPanel');
  const preProcessingPanel = document.getElementById('preProcessingPanel');
  const statusText = document.getElementById('statusText');
  const phaseName = document.getElementById('phaseName');
  const progressContainer = progressPanel.querySelector(
    '.flex.items-center.gap-4'
  );
  const progressBar = document.getElementById('progressBar');
  const ringProgress = document.getElementById('ringProgress');
  const ringLabel = document.getElementById('ringLabel');
  const progressPct = document.getElementById('progressPct');
  const currentStage = document.getElementById('currentStage');
  const eta = document.getElementById('eta');
  const taskList = document.getElementById('taskList');

  // Pre-processing panel elements
  const bookmarkCount = document.getElementById('bookmarkCount');
  const tierBadge = document.getElementById('tierBadge');
  const flowBadge = document.getElementById('flowBadge');
  const estimatedCost = document.getElementById('estimatedCost');
  const estimatedTime = document.getElementById('estimatedTime');
  const decisionExplanation = document.getElementById('decisionExplanation');
  const decisionReasoning = document.getElementById('decisionReasoning');

  // Consent modal elements
  const consentModal = document.getElementById('consentModal');
  const consentCancelBtn = document.getElementById('consentCancelBtn');
  const consentConfirmBtn = document.getElementById('consentConfirmBtn');
  const consentAgreementCheckbox = document.getElementById('consentAgreementCheckbox');
  const backupCheckbox = document.getElementById('backupCheckbox');
  const consentEstimatedCost = document.getElementById('consentEstimatedCost');
  const consentEstimatedTime = document.getElementById('consentEstimatedTime');
  const consentTierBadge = document.getElementById('consentTierBadge');
  const consentTierDescription = document.getElementById('consentTierDescription');
  const consentFlowBadge = document.getElementById('consentFlowBadge');
  const consentFlowDescription = document.getElementById('consentFlowDescription');
  const consentBookmarkCount = document.getElementById('consentBookmarkCount');

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

  // Model name mapping (display name -> API model name)
  const modelMapping = {
    'GPT-4.1 Mini': 'gpt-4o-mini',
    'GPT-4.1': 'gpt-4o',
    'GPT-4o Mini': 'gpt-4o-mini',
    'GPT-4.1 Nano': 'gpt-4o-mini',
    'GPT-4 Turbo': 'gpt-4-turbo'
  };

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
      const displayName = option.dataset.model;
      const apiModelName = modelMapping[displayName] || 'gpt-4o';
      modelLabel.textContent = displayName;
      activeModelChip.textContent = displayName;

      // Store both display and API model names
      chrome.storage.sync.set({
        selectedModel: apiModelName,
        selectedModelDisplay: displayName
      });

      // Close dropdown
      modelMenu.classList.add('hidden');
      modelChevron.style.transform = 'rotate(0deg)';

      soundManager.playSound('click', 0.4);

      // Re-analyze with new model
      setTimeout(() => analyzeBookmarks(), 100);
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
  chrome.storage.sync.get(['selectedModel', 'selectedModelDisplay'], (result) => {
    const displayName = result.selectedModelDisplay || 'GPT-4.1 Mini';
    const apiModelName = result.selectedModel || 'gpt-4o-mini';

    const savedOption = modelMenu.querySelector(
      `[data-model="${displayName}"]`
    );
    if (savedOption) {
      modelOptions.forEach((opt) =>
        opt.classList.remove('bg-indigo-500/20', 'text-indigo-300')
      );
      savedOption.classList.add('bg-indigo-500/20', 'text-indigo-300');
      modelLabel.textContent = displayName;
      activeModelChip.textContent = displayName;
    } else {
      // Default to GPT-4.1 Mini if no preference saved
      chrome.storage.sync.set({
        selectedModel: 'gpt-4o-mini',
        selectedModelDisplay: 'GPT-4.1 Mini'
      });
      modelLabel.textContent = 'GPT-4.1 Mini';
      activeModelChip.textContent = 'GPT-4.1 Mini';
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

  // Stage name mapping for better UX
  const stageNames = {
    'initializing': 'Initializing',
    'auth': 'Authenticating',
    'analyzing': 'Analyzing Bookmarks',
    'deciding': 'Determining Strategy',
    'preparing': 'Preparing',
    'exporting': 'Exporting Bookmarks',
    'backup': 'Creating Backup',
    'compressing': 'Compressing Data',
    'uploading': 'Uploading to AI',
    'processing': 'AI Processing',
    'chunk_processing': 'Processing Chunks',
    'reconciling': 'Reconciling Results',
    'finalizing': 'Finalizing',
    'validating': 'Validating Operations',
    'applying': 'Applying Changes',
    'applying-folders': 'Creating Folders',
    'applying-moves': 'Moving Bookmarks',
    'applying-renames': 'Renaming Folders',
    'applying-removals': 'Cleaning Up',
    'complete': 'Complete'
  };

  function getStageDisplayName(stage) {
    if (!stage) return 'Processing';
    // Handle phase-specific stages
    if (stage.startsWith('applying-')) {
      const phase = stage.replace('applying-', '');
      return `Applying: ${phase.charAt(0).toUpperCase() + phase.slice(1)}`;
    }
    return stageNames[stage] || stage.charAt(0).toUpperCase() + stage.slice(1).replace(/_/g, ' ');
  }

  function updateUi(job) {
    // Reset status panel classes
    progressPanel.classList.add('hidden');
    progressPanel.classList.remove('running', 'success', 'error');
    statusText.classList.remove('updated');
    phaseName.classList.add('hidden');

    // Trigger reflow for animation
    void progressPanel.offsetWidth;

    if (!job) {
      statusText.textContent = '';
      organizeBtn.disabled = false; // Enabled by default, consent checked in modal
      progressBar.style.width = '0%';
      updateCircularProgress(0);
      resetBtn.style.display = 'none';
      stopBtn.style.display = 'none';
      preProcessingPanel.classList.add('hidden');
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

    // Show pre-processing panel if decision info is available
    if (job.decision && job.status !== 'running' && job.status !== 'completed' && job.status !== 'error') {
      preProcessingPanel.classList.remove('hidden');
      updatePreProcessingPanel(job.decision);
    } else {
      preProcessingPanel.classList.add('hidden');
    }

    // Handle different job states
    if (job.status === 'running') {
      organizeBtn.disabled = true;
      progressPanel.classList.add('running');
      preProcessingPanel.classList.add('hidden');
      const progress = job.progress || 0;
      progressBar.style.width = `${progress}%`;
      updateCircularProgress(progress);
      resetBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      soundManager.playSound('processing', 0.1);

      // Update stage display
      if (job.stage && currentStage) {
        currentStage.textContent = getStageDisplayName(job.stage);
      }

      // Update phase name
      if (job.stage && phaseName) {
        phaseName.textContent = getStageDisplayName(job.stage);
        phaseName.classList.remove('hidden');
      }

      // Update progress if available
      if (job.chunkIndex && job.totalChunks) {
        const chunkProgress = (job.chunkIndex / job.totalChunks) * 100;
        progressBar.style.width = `${chunkProgress}%`;
        updateCircularProgress(chunkProgress);
      }

      // Update performance stats
      if (eta && job.eta) {
        const etaMin = Math.round(job.eta / 60);
        const etaSec = Math.round(job.eta % 60);
        eta.textContent = `${etaMin}:${etaSec.toString().padStart(2, '0')}`;
      } else if (eta && job.estimatedCompletion) {
        eta.textContent = job.estimatedCompletion;
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
        // Show default task items for common processing steps with better names
        const defaultSteps = [
          'Authenticating',
          'Analyzing Bookmarks',
          'Creating Backup',
          'AI Processing',
          'Validating',
          'Applying Changes',
        ];

        defaultSteps.forEach((step, idx) => {
          const row = document.createElement('div');
          row.className =
            'flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-2 py-1.5';

          let state = 'processing';
          if (job.status === 'running' && job.progress) {
            const progress = job.progress;
            // Map progress to steps (6 steps, ~16.67% each)
            if (progress > (idx + 1) * 16.67) state = 'done';
            else if (progress > idx * 16.67) state = 'processing';
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

  // Function to update pre-processing panel
  function updatePreProcessingPanel(decision) {
    if (!decision) return;

    // Update bookmark count
    if (bookmarkCount && decision.bookmarkCount !== undefined) {
      bookmarkCount.textContent = decision.bookmarkCount.toLocaleString();
    }

    // Update tier badge
    if (tierBadge && decision.tier) {
      tierBadge.textContent = decision.tier;
      // Color code tiers
      const tierColors = {
        'T1': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        'T2': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        'T3': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        'T4': 'bg-red-500/20 text-red-300 border-red-500/30'
      };
      tierBadge.className = `px-2 py-0.5 rounded-full text-xs font-medium border ${tierColors[decision.tier] || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`;
    }

    // Update flow badge
    if (flowBadge && decision.flow) {
      const flowNames = {
        'single-shot': 'Single-Shot',
        'improved-chunking': 'Improved Chunking',
        'backend-assisted': 'Backend-Assisted'
      };
      flowBadge.textContent = flowNames[decision.flow] || decision.flow;
    }

    // Update cost estimate
    if (estimatedCost && decision.estimatedCost) {
      estimatedCost.textContent = `$${parseFloat(decision.estimatedCost).toFixed(4)}`;
    }

    // Update time estimate
    if (estimatedTime && decision.estimatedTime) {
      estimatedTime.textContent = decision.estimatedTime;
    }

    // Update decision explanation
    if (decision.reasoning && decision.reasoning.length > 0) {
      if (decisionExplanation && decisionReasoning) {
        decisionReasoning.textContent = decision.reasoning.join(' ');
        decisionExplanation.classList.remove('hidden');
      }
    }
  }

  // Function to analyze bookmarks and show pre-processing info
  async function analyzeBookmarks() {
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel'], async (result) => {
      if (!result.openaiApiKey || result.openaiApiKey.trim() === '') {
        return; // Will be handled by checkApiKey
      }

      const selectedModel = result.selectedModel || 'gpt-4o';

      // Request analysis from background script
      chrome.runtime.sendMessage({
        action: 'analyzeBookmarks',
        model: selectedModel
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Analysis failed:', chrome.runtime.lastError.message);
          return;
        }

        if (response && response.success && response.decision) {
          updatePreProcessingPanel(response.decision);
          preProcessingPanel.classList.remove('hidden');
          // Button enabled by default - consent will be checked in modal
          organizeBtn.disabled = false;
        } else {
          // Hide panel if analysis fails
          preProcessingPanel.classList.add('hidden');
        }
      });
    });
  }

  // Note: Old consent checkbox logic removed - now using consent modal instead

  // Tier descriptions
  const tierDescriptions = {
    'T1': 'Small collection (≤2,000 bookmarks). Fast single-request processing.',
    'T2': 'Medium collection (2,001-4,500 bookmarks). Single-request or chunked processing.',
    'T3': 'Large collection (4,501-10,000 bookmarks). Chunked processing with global context.',
    'T4': 'Very large collection (10,000+ bookmarks). Requires backend-assisted processing.'
  };

  // Flow descriptions
  const flowDescriptions = {
    'single-shot': 'All bookmarks will be processed in a single AI request. Fastest method, ideal for smaller collections.',
    'improved-chunking': 'Bookmarks will be processed in multiple chunks with shared context. More efficient for larger collections.',
    'backend-assisted': 'Requires backend service. Currently not available in extension-only mode.'
  };

  // Function to show consent modal with decision data
  function showConsentModal(decision) {
    if (!decision) return;

    // Update modal with decision data
    if (consentBookmarkCount) {
      consentBookmarkCount.textContent = decision.bookmarkCount ? decision.bookmarkCount.toLocaleString() : '--';
    }

    if (consentEstimatedCost && decision.estimatedCost) {
      consentEstimatedCost.textContent = `$${parseFloat(decision.estimatedCost).toFixed(4)}`;
    }

    if (consentEstimatedTime && decision.estimatedTime) {
      consentEstimatedTime.textContent = decision.estimatedTime;
    }

    if (consentTierBadge && decision.tier) {
      consentTierBadge.textContent = decision.tier;
      const tierColors = {
        'T1': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        'T2': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        'T3': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        'T4': 'bg-red-500/20 text-red-300 border-red-500/30'
      };
      consentTierBadge.className = `px-2 py-1 rounded-full text-xs font-medium border ${tierColors[decision.tier] || 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`;
    }

    if (consentTierDescription && decision.tier) {
      consentTierDescription.textContent = tierDescriptions[decision.tier] || 'Loading tier information...';
    }

    if (consentFlowBadge && decision.flow) {
      const flowNames = {
        'single-shot': 'Single-Shot',
        'improved-chunking': 'Improved Chunking',
        'backend-assisted': 'Backend-Assisted'
      };
      consentFlowBadge.textContent = flowNames[decision.flow] || decision.flow;
    }

    if (consentFlowDescription && decision.flow) {
      consentFlowDescription.textContent = flowDescriptions[decision.flow] || 'Loading flow information...';
    }

    // Reset checkboxes
    consentAgreementCheckbox.checked = false;
    backupCheckbox.checked = true; // Default checked
    consentConfirmBtn.disabled = true;

    // Show modal
    consentModal.classList.remove('hidden');
    soundManager.playSound('click', 0.2);
  }

  // Update consent confirm button state
  consentAgreementCheckbox.addEventListener('change', () => {
    if (consentConfirmBtn) {
      consentConfirmBtn.disabled = !consentAgreementCheckbox.checked;
    }
  });

  // Consent modal cancel button
  consentCancelBtn.addEventListener('click', () => {
    consentModal.classList.add('hidden');
    consentAgreementCheckbox.checked = false;
    soundManager.playSound('click', 0.3);
  });

  // Consent modal confirm button
  consentConfirmBtn.addEventListener('click', () => {
    if (!consentAgreementCheckbox.checked) {
      return;
    }

    // Hide modal
    consentModal.classList.add('hidden');

    // Check API key before starting
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel'], (result) => {
      if (!result.openaiApiKey || result.openaiApiKey.trim() === '') {
        updateUi({
          status: 'error',
          message: 'Please set your OpenAI API key in options first.',
        });
        return;
      }

      const selectedModel = result.selectedModel || 'gpt-4o';

      // Hide pre-processing panel
      preProcessingPanel.classList.add('hidden');

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

    soundManager.playSound('click', 0.4);
  });

  // Close modal when clicking outside
  consentModal.addEventListener('click', (e) => {
    if (e.target === consentModal) {
      consentModal.classList.add('hidden');
      consentAgreementCheckbox.checked = false;
    }
  });

  organizeBtn.addEventListener('click', () => {
    // Check API key first
    chrome.storage.sync.get(['openaiApiKey', 'selectedModel'], (result) => {
      if (!result.openaiApiKey || result.openaiApiKey.trim() === '') {
        updateUi({
          status: 'error',
          message: 'Please set your OpenAI API key in options first.',
        });
        return;
      }

      // Get decision data for consent modal
      chrome.runtime.sendMessage({
        action: 'analyzeBookmarks',
        model: result.selectedModel || 'gpt-4o'
      }, (response) => {
        if (response && response.success && response.decision) {
          showConsentModal(response.decision);
        } else {
          // Fallback: show consent modal without decision data
          showConsentModal(null);
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

  // Analyze bookmarks on load to show pre-processing info
  analyzeBookmarks();

  // Re-analyze when model changes
  modelOptions.forEach((option) => {
    option.addEventListener('click', () => {
      setTimeout(() => analyzeBookmarks(), 100);
    });
  });
});

// Note: All bookmark processing logic has been moved to background.js for better architecture.
// The popup now focuses solely on UI interactions and status updates.
