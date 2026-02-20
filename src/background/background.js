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

    // 2. Call LLM
    const suggestion = await callLLM(incidentData, settings);

    // 3. Send result back to content script
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
    chrome.storage.sync.get(['llmProvider', 'apiKey'], (result) => {
      resolve(result);
    });
  });
}

/**
 * Call the selected LLM provider.
 */
async function callLLM(data, settings) {
  const prompt = `You are a ServiceNow expert assistant. Analyze the following incident and provide a concise solution suggestion including:
1. Likely root cause.
2. Recommended troubleshooting steps.
3. Relevant Knowledge Base search terms.

Incident Details:
Number: ${data.number}
Short Description: ${data.shortDescription}
Description: ${data.description}

Please format your response clearly.`;

  if (settings.llmProvider === 'anthropic') {
    return await callAnthropic(prompt, settings.apiKey);
  } else {
    // Default to OpenAI
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

async function callAnthropic(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'dangerously-allow-browser': 'true' // In a chrome extension background script, fetch is fine.
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
