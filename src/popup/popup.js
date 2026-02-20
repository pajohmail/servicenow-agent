document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('llm-provider');
  const apiKeyInput = document.getElementById('api-key');
  const saveBtn = document.getElementById('save-btn');
  const statusDiv = document.getElementById('status');

  // Load existing settings
  chrome.storage.local.get(['llmProvider', 'apiKey'], (result) => {
    if (result.llmProvider) providerSelect.value = result.llmProvider;
    if (result.apiKey) apiKeyInput.value = result.apiKey;
  });

  saveBtn.addEventListener('click', () => {
    const llmProvider = providerSelect.value;
    const apiKey = apiKeyInput.value;

    chrome.storage.local.set({ llmProvider, apiKey }, () => {
      statusDiv.textContent = 'Settings saved!';
      statusDiv.style.color = 'green';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 2000);
    });
  });
});
