chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyze_incident") {
    console.log("Background: Received analysis request", request.data);
    
    // For now, return a mock response
    // In next steps, we will implement the actual LLM call
    handleAnalysis(request.data).then(result => {
      sendResponse({ status: "success", result: result });
    }).catch(err => {
      sendResponse({ status: "error", message: err.message });
    });

    return true; // Keep the message channel open for async response
  }
});

async function handleAnalysis(incidentData) {
  // Placeholder for RAG and LLM logic
  // 1. Check RAG for similar incidents
  // 2. Search web for error codes if any
  // 3. Prompt LLM with all context
  
  return `Analyzing incident ${incidentData.number}...\n\n` + 
         `This appears to be a ${incidentData.short_description}.\n` +
         `Recommendation: Check the logs and verify connectivity.`;
}
