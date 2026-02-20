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
    if (!settings.apiKey && settings.llmProvider !== 'local') {
      chrome.tabs.sendMessage(tabId, {
        type: 'ANALYSIS_RESULT',
        payload: { suggestion: 'Error: API Key missing. Please configure it in the extension popup.' }
      });
      return;
    }

    // 2. Perform Web Search if error code is present
    let searchContext = '';
    const errorCodeMatch = (incidentData.shortDescription + " " + incidentData.description).match(/(?:[^\w]|^)([A-Z]{2,}-\d+|0x[0-9A-Fa-f]+)(?:[^\w]|$)/);
    if (errorCodeMatch && settings.searchKey) {
      const errorCode = errorCodeMatch[1];
      console.log('ServiceNow Agent: Detected error code:', errorCode);
      searchContext = await performWebSearch(errorCode, settings.searchKey);
    }

    // 3. Call LLM with incident data and search context
    const suggestion = await callLLM(incidentData, settings, searchContext);

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
    chrome.storage.sync.get(['llmProvider', 'apiKey', 'searchKey', 'azureEndpoint'], (result) => {
      resolve(result);
    });
  });
}

/**
 * Perform a web search for error codes using Brave Search API.
 */
async function performWebSearch(query, apiKey) {
  try {
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': apiKey
      }
    });

    if (!response.ok) return '';

    const data = await response.json();
    const snippets = data.web?.results?.slice(0, 3).map(r => r.description).join('\n') || '';
    return snippets ? `\n\nWeb Search Results for ${query}:\n${snippets}` : '';
  } catch (err) {
    console.error('Search failed:', err);
    return '';
  }
}

/**
 * Call the selected LLM provider.
 */
async function callLLM(data, settings, searchContext) {
  const prompt = `You are a ServiceNow expert assistant. Analyze the following incident and provide a concise solution suggestion including:
1. Likely root cause.
2. Recommended troubleshooting steps.
3. Relevant Knowledge Base search terms.

Incident Details:
Number: ${data.number}
Short Description: ${data.shortDescription}
Description: ${data.description}${searchContext}

Please format your response clearly.`;

  switch (settings.llmProvider) {
    case 'anthropic':
      return await callAnthropic(prompt, settings.apiKey);
    case 'azure':
      return await callAzure(prompt, settings.apiKey, settings.azureEndpoint);
    case 'local':
      return await callLocalRAG(prompt);
    case 'openai':
    default:
      return await callOpenAI(prompt, settings.apiKey);
  }
}

async function callOpenAI(prompt, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a helpful IT support assistant specialized in ServiceNow.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

async function callAzure(prompt, apiKey, endpoint) {
  // Assuming a standard Azure OpenAI chat completion URL format
  // Endpoint example: https://YOUR_RESOURCE.openai.azure.com/
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a helpful IT support assistant specialized in ServiceNow.' },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Azure OpenAI API error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

async function callAnthropic(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`);
  }

  const result = await response.json();
  return result.content[0].text;
}

async function callLocalRAG(prompt) {
  // Prepared connection to OpenClaw RAG or local proxy
  try {
    const response = await fetch('http://localhost:8000/v1/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: prompt })
    });
    
    if (!response.ok) {
       return "The local RAG endpoint is silent. Maybe the connection is dead. (Error: " + response.status + ")";
    }
    
    const result = await response.json();
    return result.answer || result.content || "The RAG system returned an empty lead.";
  } catch (err) {
    return "Could not reach the local RAG office. The streets are empty. (Connection Refused)";
  }
}
