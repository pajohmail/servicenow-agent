console.log("ServiceNow Agent: Content script loaded.");

/**
 * Extracts incident data from the DOM.
 * ServiceNow often uses 'sys_display.incident.number' or similar IDs.
 */
function extractIncidentData() {
  const data = {
    number: document.getElementById('sys_readonly.incident.number')?.value || 
            document.getElementById('incident.number')?.value || "N/A",
    short_description: document.getElementById('incident.short_description')?.value || "N/A",
    description: document.getElementById('incident.description')?.value || "N/A"
  };
  
  console.log("ServiceNow Agent: Extracted data:", data);
  return data;
}

/**
 * Injects the "Analyze" button into the ServiceNow header or form.
 */
function injectAnalyzeButton() {
  // Try to find a good place to put the button. 
  // 'incident_breather' or 'form_action_container' are common.
  const header = document.querySelector('.form_action_container');
  
  if (header && !document.getElementById('sn-agent-analyze-btn')) {
    const btn = document.createElement('button');
    btn.id = 'sn-agent-analyze-btn';
    btn.innerText = '🤖 Analyze Incident';
    btn.className = 'form_action_button header  action_context btn btn-default'; // Try to match SN styles
    btn.style.marginLeft = '10px';
    btn.style.backgroundColor = '#e6f7ff';
    btn.style.borderColor = '#91d5ff';

    btn.onclick = (e) => {
      e.preventDefault();
      const data = extractIncidentData();
      chrome.runtime.sendMessage({ action: "analyze_incident", data: data }, (response) => {
        console.log("ServiceNow Agent: Analysis requested", response);
      });
    };

    header.appendChild(btn);
  }
}

// Periodically check for the header (ServiceNow uses a lot of dynamic loading)
const observer = new MutationObserver(() => {
  injectAnalyzeButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectAnalyzeButton();
