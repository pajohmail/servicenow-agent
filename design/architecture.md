# ServiceNow Agent Architecture

```mermaid
graph TD
    subgraph Chrome Extension
        CS[Content Script] <--> BSW[Background Service Worker]
        POP[Popup / Settings] <--> BSW
        SIDE[Sidebar / UI Overlay] <--> CS
    end

    subgraph External Services
        BSW <--> LLM[LLM Provider - OpenAI/Anthropic/Local]
        BSW <--> WS[Web Search API - Brave]
        BSW <--> RAG[OpenClaw RAG Service]
    end

    subgraph ServiceNow
        SN_DOM[ServiceNow Incident Page] <--> CS
    end

    CS -- Extracts --> IncidentData[Incident ID, Short Desc, Description]
    BSW -- Processes --> Analysis[Solution Suggestions, Similar Incidents]
    Analysis -- Displays --> SIDE
```

## Component Breakdown

1. **Content Script**:
   - Detects ServiceNow incident forms.
   - Extracts fields: `number`, `short_description`, `description`.
   - Injects an "AI Analysis" button or sidebar.

2. **Background Service Worker**:
   - Manages state and API keys.
   - Routes requests to LLM, Web Search, and RAG.
   - Handles OAuth or API Key authentication securely.

3. **Popup / Options**:
   - UI for configuring API keys (OpenAI, Anthropic).
   - Toggle features (Enable RAG, Enable Web Search).

4. **Integration Layer**:
   - Generic LLM wrapper.
   - Search utility.
   - RAG client.
```
