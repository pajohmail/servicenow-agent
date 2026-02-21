# ServiceNow Agent - Chrome Extension 🤖📁

En kraftfull AI-assistent i form av ett Chrome-plugin, speciellt framtagen för att hjälpa Service Desk-personal att snabbt analysera och lösa incidenter i ServiceNow. Genom att använda moderna språkmodeller (LLM) ger denna agent intelligenta lösningsförslag direkt i webbläsaren.

## ✨ Huvudfunktioner

- **Automatisk Dataextraktion**: Läser automatiskt av incidentnummer, kort beskrivning och detaljerade beskrivningar direkt från ServiceNow-formulär.
- **AI-Analys**: Skickar incidentdata till valfri LLM (OpenAI, Anthropic eller Azure OpenAI/Copilot) för att generera träffsäkra lösningsförslag.
- **Web Search**: Söker automatiskt på nätet efter kända felkoder och lösningar i realtid via integrerade sök-API:er.
- **Sömlös Integration**: Injekterar en snygg sidopanel direkt i ServiceNows gränssnitt för ett smidigt arbetsflöde.

## 🛠️ Teknisk Stack

- **Chrome Extension Manifest V3**: Den senaste standarden för tillägg i webbläsaren.
- **JavaScript**: För snabb och effektiv hantering av webbsidans DOM och bakgrundsprocesser.
- **Tailwind CSS**: För ett modernt och responsivt gränssnitt i popup-menyn och sidopanelen.

## 🚀 Installation (Utvecklarläge)

1. Klona repot: `git clone https://github.com/pajohmail/servicenow-agent.git`
2. Öppna Chrome och gå till `chrome://extensions/`.
3. Aktivera **Utvecklarläge** (Developer mode) uppe till höger.
4. Klicka på **Ladda obepackat** (Load unpacked) och välj mappen där du klonade projektet.
5. Konfigurera din API-nyckel i pluginets popup-meny.

## 🗺️ Roadmap

Projektet är under aktiv utveckling. Följande milstolpar är planerade:

- [x] Grundläggande arkitektur och Manifest V3-struktur.
- [x] Dataextraktion från ServiceNow-formulär.
- [x] Integration med OpenAI, Anthropic och Azure OpenAI (Copilot).
- [x] Implementering av sidopanel (Sidebar) för analysresultat.
- [x] Automatiserad webbsökning för felkodsanalys.
- [ ] **Nästa version:** Integration med RAG (Retrieval-Augmented Generation) för sökning i lokal dokumentation.

---

*Detta projekt är en del av ett ekosystem av AI-verktyg för proffs.*
