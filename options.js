const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');
const messageEl = document.getElementById('message');

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
  if (apiKey) {
    chrome.storage.sync.set({ openaiApiKey: apiKey }, () => {
      messageEl.textContent = 'API Key saved successfully!';
      setTimeout(() => { messageEl.textContent = ''; }, 3000);
    });
  } else {
    messageEl.textContent = 'Please enter a valid API key.';
    messageEl.style.color = 'red';
  }
}); 
