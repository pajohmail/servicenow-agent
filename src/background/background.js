/**
 * ServiceNow Agent - Background Service Worker
 * Handles API communication and coordination.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('ServiceNow Agent: Extension installed.');
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYZE_INCIDENT') {
    handleAnalysis(message.payload, sender.tab.id);
  }
  return true; // Keep channel open for async response
});

/**
 * Orchestrates the analysis process.
 */
async function handleAnalysis(incidentData, tabId) {
  try {
    console.log('ServiceNow Agent: Starting analysis for', incidentData.number);
    
    // 1. Get settings
    const settings = await getSettings();
    if (!settings.apiKey) {
      chrome.tabs.sendMessage(tabId, {
        type: 'ANALYSIS_RESULT',
        payload: { suggestion: 'Error: API Key missing. Please configure it in the extension popup.' }
      });
      return;
    }

    // 2. (Optional) Perform Web Search or RAG
    // let searchResults = await performSearch(incidentData.shortDescription, settings.searchKey);
    
    // 3. Call LLM
    const suggestion = await callLLM(incidentData, settings);

    // 4. Send result back to content script
    chrome.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_RESULT',
      payload: { suggestion }
    });

  } catch (error) {
    console.error('ServiceNow Agent: Analysis error:', error);
    chrome.tabs.sendMessage(tabId, {
      type: 'ANALYSIS_RESULT',
      payload: { suggestion: 'Error: ' + error.message }
    });
  }
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['llmProvider', 'apiKey', 'searchKey'], (result) => {
      resolve(result);
    });
  });
}

/**
 * Placeholder for LLM API call.
 */
async function callLLM(data, settings) {
  // This is a stub. Implementation for OpenAI/Anthropic will be added later.
  return `This is a mock suggestion for incident ${data.number}:
1. Check the server logs for timeout errors.
2. Verify if the user has correct permissions.
3. Reference KB001234 for similar issues.`;
}
