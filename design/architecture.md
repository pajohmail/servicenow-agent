# ServiceNow Agent Architecture

## Overview
The ServiceNow Agent is a Chrome Extension designed to assist Service Desk personnel by analyzing incidents using AI. It integrates with LLMs, Web Search, and local RAG systems.

## Component Diagram
```mermaid
graph TD
    subgraph Browser Context
        SN[ServiceNow Incident Page]
        CS[Content Script]
        P[Popup UI]
        BS[Background Service Worker]
        ST[(Chrome Storage)]
    end

    subgraph External / Local Services
        LLM[AI Provider / OpenAI / Anthropic]
        WS[Brave Search API]
        RAG[OpenClaw RAG]
    end

    %% Interactions
    SN <-->|DOM Manipulation & Extraction| CS
    CS <-->|Message Passing| BS
    P <-->|Settings & Manual Trigger| BS
    P <-->|Read/Write| ST
    BS <-->|API Keys & History| ST
    
    BS <-->|Analyze Incident| LLM
    BS <-->|Search for Error Codes| WS
    BS <-->|Retrieve Internal Docs| RAG
```

## Functional Flow
1. **Extraction**: Content Script detects an incident page and extracts the Incident Number, Short Description, and Description.
2. **Action**: The user clicks "Analyze with AI" (injected button or popup).
3. **Processing**: The Service Worker gathers context, performs optional Web Search or RAG lookup, and sends the prompt to the LLM.
4. **Presentation**: The solution suggestion is displayed in a sidebar or overlay on the ServiceNow page.

## File Structure Plan
- `manifest.json`: Extension configuration (V3).
- `src/popup/`: Settings UI.
  - `popup.html`
  - `popup.js`
  - `popup.css`
- `src/content/`: Logic running on ServiceNow pages.
  - `content.js`: Extraction and UI injection.
  - `content.css`: Styling for injected elements.
- `src/background/`: Service worker for background tasks.
  - `background.js`: API handling, search, and RAG logic.
- `icons/`: Extension icons.
- `src/lib/`: Shared utilities (API clients, formatting).
