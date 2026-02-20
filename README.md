# ServiceNow Agent - Chrome Extension

AI-powered assistant for ServiceNow Service Desk personnel.

## Features
- **Incident Analysis**: Extracts data from ServiceNow incident forms and provides AI-driven suggestions.
- **RAG Integration**: (Planned) Connects to OpenClaw RAG for internal knowledge base lookup.
- **Web Search**: (Planned) Search for error codes and external solutions.
- **Multi-LLM Support**: Supports OpenAI, Anthropic, and local models.

## Development Setup

### Prerequisites
- Google Chrome browser.

### Installation
1. Clone this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** (toggle in the top right).
4. Click **Load unpacked** and select the project folder (`/home/paj/dev/servicenow-agent/`).

### Configuration
1. Click on the extension icon in the toolbar.
2. Select your LLM provider and enter your API key.
3. Save settings.

## Architecture
See [Architecture Design](design/architecture.md) for details.

## Project Structure
- `src/background/`: Background service worker (logic hub).
- `src/content/`: Content scripts (DOM interaction).
- `src/popup/`: Extension popup UI (settings).
- `src/lib/`: Shared utilities (LLM, Search, RAG).
- `design/`: Architectural diagrams and documentation.
