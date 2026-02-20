/**
 * ServiceNow Agent - Content Script
 * Extracts incident data and provides UI integration.
 */

console.log('ServiceNow Agent: Content script loaded.');

let sidebar = null;

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
 * Creates and injects the sidebar into the DOM.
 */
function createSidebar() {
  if (sidebar) return;

  sidebar = document.createElement('div');
  sidebar.className = 'sn-agent-sidebar';
  sidebar.innerHTML = `
    <div class="sn-agent-sidebar-header">
      <h2>CASE ANALYSIS</h2>
      <button class="sn-agent-sidebar-close">&times;</button>
    </div>
    <div class="sn-agent-sidebar-content">
      <div class="sn-agent-loader">
        <div class="sn-agent-spinner"></div>
        <p>Digging through the files...</p>
      </div>
      <div class="sn-agent-results" style="display: none;">
        <div class="sn-agent-result-section">
          <h3>Findings</h3>
          <div class="sn-agent-suggestion"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(sidebar);

  sidebar.querySelector('.sn-agent-sidebar-close').addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
}

function showLoader() {
  createSidebar();
  sidebar.classList.add('open');
  sidebar.querySelector('.sn-agent-loader').classList.add('active');
  sidebar.querySelector('.sn-agent-results').style.display = 'none';
}

function hideLoader() {
  if (sidebar) {
    sidebar.querySelector('.sn-agent-loader').classList.remove('active');
  }
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
    
    showLoader();

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
  console.log('ServiceNow Agent: Received result:', result);
  createSidebar();
  hideLoader();
  
  const resultsDiv = sidebar.querySelector('.sn-agent-results');
  const suggestionDiv = sidebar.querySelector('.sn-agent-suggestion');
  
  suggestionDiv.innerText = result.suggestion || 'No specific findings. The trail went cold.';
  resultsDiv.style.display = 'block';
  sidebar.classList.add('open');
}
