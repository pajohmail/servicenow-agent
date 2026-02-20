/**
 * ServiceNow Agent - Content Script
 * Extracts incident data and provides UI integration.
 */

console.log('ServiceNow Agent: Content script loaded.');

/**
 * Extracts data from the current ServiceNow incident form.
 */
function extractIncidentData() {
  const data = {
    number: getValueById('sys_display.incident.number') || getValueById('incident.number'),
    shortDescription: getValueById('incident.short_description'),
    description: getValueById('incident.description'),
    url: window.location.href
  };

  console.log('ServiceNow Agent: Extracted data:', data);
  return data;
}

function getValueById(id) {
  const el = document.getElementById(id);
  return el ? el.value : null;
}

/**
 * Injects the "Analyze with AI" button into the ServiceNow header.
 */
function injectActionButton() {
  // Try to find the header bar where buttons usually live
  const header = document.querySelector('.navbar-right') || document.querySelector('.header-container');
  
  if (!header || document.getElementById('sn-agent-analyze-btn')) return;

  const btn = document.createElement('button');
  btn.id = 'sn-agent-analyze-btn';
  btn.innerText = 'Analyze with AI';
  btn.className = 'btn btn-primary'; // Use SN classes if possible
  btn.style.marginLeft = '10px';
  btn.style.backgroundColor = '#273239';
  btn.style.color = 'white';
  
  btn.addEventListener('click', () => {
    const incidentData = extractIncidentData();
    if (!incidentData.number) {
      alert('Could not find incident data on this page.');
      return;
    }
    
    // Send message to background script to start analysis
    chrome.runtime.sendMessage({
      type: 'ANALYZE_INCIDENT',
      payload: incidentData
    });
  });

  header.prepend(btn);
}

// Watch for DOM changes to inject button if it's a single-page app style navigation
const observer = new MutationObserver(() => {
  injectActionButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectActionButton();

// Listen for messages from background (e.g., results)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'ANALYSIS_RESULT') {
    displayResult(message.payload);
  }
});

function displayResult(result) {
  // Placeholder for result display logic (sidebar/modal)
  console.log('ServiceNow Agent: Received result:', result);
  alert('AI Suggestion:\n\n' + result.suggestion);
}
