document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('llm-provider');
  const apiKeyInput = document.getElementById('api-key');
  const searchKeyInput = document.getElementById('search-key');
  const saveBtn = document.getElementById('save-btn');
  const statusMsg = document.getElementById('status-msg');

  // Load saved settings
  chrome.storage.sync.get(['llmProvider', 'apiKey', 'searchKey'], (result) => {
    if (result.llmProvider) providerSelect.value = result.llmProvider;
    if (result.apiKey) apiKeyInput.value = result.apiKey;
    if (result.searchKey) searchKeyInput.value = result.searchKey;
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const settings = {
      llmProvider: providerSelect.value,
      apiKey: apiKeyInput.value,
      searchKey: searchKeyInput.value
    };

    chrome.storage.sync.set(settings, () => {
      statusMsg.className = 'status-visible';
      setTimeout(() => {
        statusMsg.className = 'status-hidden';
      }, 2000);
    });
  });
});
