document.addEventListener('DOMContentLoaded', () => {
  const providerSelect = document.getElementById('llm-provider');
  const apiKeyInput = document.getElementById('api-key');
  const searchKeyInput = document.getElementById('search-key');
  const azureEndpointInput = document.getElementById('azure-endpoint');
  const azureEndpointGroup = document.getElementById('azure-endpoint-group');
  const saveBtn = document.getElementById('save-btn');
  const statusMsg = document.getElementById('status-msg');

  function toggleAzureFields() {
    if (providerSelect.value === 'azure') {
      azureEndpointGroup.style.display = 'block';
    } else {
      azureEndpointGroup.style.display = 'none';
    }
  }

  providerSelect.addEventListener('change', toggleAzureFields);

  // Load saved settings
  chrome.storage.sync.get(['llmProvider', 'apiKey', 'searchKey', 'azureEndpoint'], (result) => {
    if (result.llmProvider) providerSelect.value = result.llmProvider;
    if (result.apiKey) apiKeyInput.value = result.apiKey;
    if (result.searchKey) searchKeyInput.value = result.searchKey;
    if (result.azureEndpoint) azureEndpointInput.value = result.azureEndpoint;
    toggleAzureFields();
  });

  // Save settings
  saveBtn.addEventListener('click', () => {
    const settings = {
      llmProvider: providerSelect.value,
      apiKey: apiKeyInput.value,
      searchKey: searchKeyInput.value,
      azureEndpoint: azureEndpointInput.value
    };

    chrome.storage.sync.set(settings, () => {
      statusMsg.className = 'status-visible';
      setTimeout(() => {
        statusMsg.className = 'status-hidden';
      }, 2000);
    });
  });
});
