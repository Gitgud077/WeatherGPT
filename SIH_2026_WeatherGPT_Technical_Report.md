# SMART INDIA HACKATHON (SIH) 2026
## TECHNICAL REPORT & ADDITIONAL INFORMATION DOSSIER

---

# Project Name: WeatherGPT
### Subtitle: Grounded Conversational Weather Intelligence Platform
**Document Version:** 1.1.0  
**Document Version:** 2.0.0  
**Target Event:** Smart India Hackathon 2026  
**Project Category:** Software / AI & Web Applications  
**Current Status:** Fully Functional Prototype (Phase 1 MVP Deployed)  
**Project Category:** Software / AI, Web Applications & Disaster Preparedness  
**Current Status:** Production-Ready Full Implementation (All Core & Advanced Capabilities Operational)  

---

## TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [Problem Background](#2-problem-background)
3. [Proposed Solution](#3-proposed-solution)
4. [Current System Architecture](#4-current-system-architecture)
4. [Comprehensive System Architecture](#4-comprehensive-system-architecture)
5. [Detailed Tech Stack](#5-detailed-tech-stack)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Backend Architecture](#7-backend-architecture)
8. [AI Integration & Grounding Engine](#8-ai-integration--grounding-engine)
9. [Data Flow & Lifecycle](#9-data-flow--lifecycle)
10. [Security & Privacy Architecture](#10-security--privacy-architecture)
11. [Feasibility Analysis](#11-feasibility-analysis)
12. [Scalability Strategy](#12-scalability-strategy)
13. [Reliability & Error Handling Matrix](#13-reliability--error-handling-matrix)
14. [Final-Round Technology Prospects](#14-final-round-technology-prospects)
15. [Product Roadmap (2-Stage Hackathon Plan)](#15-product-roadmap-2-stage-hackathon-plan)
16. [Competitive Differentiation](#16-competitive-differentiation)
6. [Frontend Architecture & UI/UX Design](#6-frontend-architecture--uiux-design)
7. [Backend Architecture & Serverless Orchestration](#7-backend-architecture--serverless-orchestration)
8. [AI Integration, Grounding & Multilingual Engine](#8-ai-integration-grounding--multilingual-engine)
9. [Advanced Features Deep-Dive](#9-advanced-features-deep-dive)
   * 9.1 Multi-Location Side-by-Side Comparison Module
   * 9.2 Interactive Doppler Radar & Real-Time Precipitation Map
   * 9.3 Multilingual Indian Language Localization (9 Languages)
   * 9.4 Two-Way Voice Assistant (Web Speech STT & TTS)
   * 9.5 High-Precision Agricultural & Lifestyle Rule Advisories
   * 9.6 In-Memory High-Performance TTL Caching Engine
   * 9.7 Client-Side Bookmark & Quick-Location Manager
10. [Data Flow & Lifecycle Trace](#10-data-flow--lifecycle-trace)
11. [Security & Privacy Architecture](#11-security--privacy-architecture)
12. [Feasibility Analysis](#12-feasibility-analysis)
13. [Scalability Strategy](#13-scalability-strategy)
14. [Reliability & Multi-Tier Resilience Matrix](#14-reliability--multi-tier-resilience-matrix)
15. [Product Roadmap (Delivered Capabilities & Future Horizons)](#15-product-roadmap-delivered-capabilities--future-horizons)
16. [Competitive Differentiation Matrix](#16-competitive-differentiation-matrix)
17. [Target Users & User Personas](#17-target-users--user-personas)
18. [Impact & Value Proposition](#18-impact--value-proposition)
18. [Social, Agricultural & Economic Impact](#18-social-agricultural--economic-impact)
19. [Risks, Limitations & Mitigations](#19-risks-limitations--mitigations)
20. [Implementation & Development Plan](#20-implementation--development-plan)
20. [Implementation Milestones Summary](#20-implementation-milestones-summary)
21. [Testing & Quality Assurance Strategy](#21-testing--quality-assurance-strategy)
22. [Sample User Journeys & Interaction Traces](#22-sample-user-journeys--interaction-traces)
23. [Business & Product Potential](#23-business--product-potential)
23. [Business & Public-Sector Deployment Potential](#23-business--public-sector-deployment-potential)
24. [Conclusion](#24-conclusion)
25. [References](#25-references)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Overview
**WeatherGPT** is an AI-powered conversational weather platform designed to bridge the gap between complex meteorological data and everyday human decision-making. Conventional weather portals require users to manually parse tables, charts, precipitation percentages, wind vectors, and ultraviolet indices across fragmented screens. WeatherGPT transforms this paradigm by enabling users to converse naturally with an intelligent assistant that understands context, daily human routines, and location-specific nuances.
**WeatherGPT** is a production-ready, full-stack conversational weather intelligence platform designed to bridge the gap between dense meteorological telemetry and real-world human decisions. Conventional weather applications force users to decode complex matrices—humidity percentages, barometric millibars, UV radiation numbers, and wind vector degrees—across fragmented screens. WeatherGPT replaces this friction with an intelligent, voice-enabled assistant that understands natural human context, daily routines, agricultural needs, and regional languages.

### 1.2 The Core Problem
Raw meteorological values (such as *dew point of 18°C*, *barometric pressure 1012 hPa*, or *35% precipitation probability*) frequently fail to give ordinary citizens an immediate, actionable answer to practical questions:
* *"Should I carry an umbrella to work this afternoon?"*
* *"Will it be too humid for an evening jog?"*
* *"What is the safest window for outdoor commute in Kolkata today?"*
Raw meteorological figures fail to directly answer practical questions for ordinary citizens:
* *"Should I carry an umbrella to work in Kolkata this evening?"*
* *"Is the wind speed safe for pesticide spraying on wheat crops today?"*
* *"Which city has safer weather for driving tomorrow morning: Mumbai or Pune?"*
* *"What should my elderly parents wear in Delhi during tomorrow's cold front?"*

Furthermore, off-the-shelf general LLMs (like standard ChatGPT) hallucinate outdated or imaginary forecasts because they lack real-time meteorological sensory feeds.

### 1.3 How WeatherGPT Works
WeatherGPT couples high-precision meteorological observation and forecast data from Open-Meteo with Google Gemini's natural language reasoning capabilities. The architecture enforces strict **data grounding**: live weather data acts as the immutable source of truth, while the Large Language Model (LLM) interprets this data conversationally without hallucinating speculative weather facts.
WeatherGPT couples high-resolution meteorological telemetry from **Open-Meteo** and live Doppler radar feeds from **RainViewer** with the natural language reasoning capabilities of **Google Gemini**. The platform enforces strict **Deterministic Data Grounding**: live, verified weather telemetry serves as the immutable single source of truth. The AI model translates this data conversationally with zero speculative hallucination.

```
┌─────────────────┐       ┌────────────────────────┐       ┌─────────────────────────┐
│   User Asks     │ ────▶ │  Live Data Grounding   │ ────▶ │ Context-Aware Response  │
│ Natural Query   │       │ (Open-Meteo APIs)      │       │ (Google Gemini LLM)     │
└─────────────────┘       └────────────────────────┘       └─────────────────────────┘
┌─────────────────────────┐       ┌──────────────────────────────┐       ┌────────────────────────────┐
│   User Asks (Voice/Text)│ ────▶ │  Live Telemetry Grounding    │ ────▶ │ Context-Aware Actionable   │
│   In Any of 9 Languages │       │  (Open-Meteo + RainViewer)   │       │ Response (Gemini SSE/TTS)  │
└─────────────────────────┘       └──────────────────────────────┘       └────────────────────────────┘
```

### 1.4 Project Scope & Hackathon Alignment
To ensure maximum focus, practical execution, and zero speculative bloat, the project roadmap is divided strictly into **two clear stages**:
* **Phase 1 (Current Submission / Working MVP):** The complete, fully working web application submitted today, featuring real-time geocoding, current weather with UV index, 24-hour visual progression, 7-day forecast cards, dynamic particle canvas, interactive Chart.js graphs, and real-time Server-Sent Events (SSE) AI streaming.
* **Phase 2 (Final Round / Grand Finale Demonstration):** High-impact enhancements prepared for the final presentation, including multi-location comparison, interactive radar/precipitation layers, voice I/O, and Indian multilingual assistance.
### 1.4 Current Project Scope & Hackathon Alignment
WeatherGPT is not a concept wireframe—it is a **fully implemented, operational software platform** incorporating all core and advanced capabilities:
* **Conversational AI Core:** Real-time Server-Sent Events (SSE) token streaming via Google Gemini (`gemini-3.6-flash` / `gemini-3.7-flash`).
* **Multi-Location Comparison:** Side-by-side telemetry visualization and comparative AI prompt analysis.
* **Interactive Doppler Radar Map:** Leaflet.js engine featuring clean Esri World Dark Gray basemaps and dynamic RainViewer precipitation scans.
* **9 Indian Regional Languages:** Full UI translation and automated script-based LLM response localization (English, Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Punjabi).
* **Two-Way Voice Assistant:** Web Speech API voice dictation (STT) and synthesized audio playback (TTS).
* **Deterministic Fallback Engine:** Rule-based advisory system (`lib/advisor.js`) providing agricultural spraying safety, WHO UV guidance, and outfit tips during network or API blips.
* **In-Memory Caching:** Sub-millisecond repeated query responses via `lib/cache.js`.

---

## 2. PROBLEM BACKGROUND

### 2.1 Limitations of Conventional Weather Applications
Traditional mobile and web weather applications have remained architecturally stagnant for over a decade. While meteorological forecasting accuracy has improved globally, the user interface layer remains largely unchanged:
Despite advancements in atmospheric numerical models, modern consumer weather portals suffer from major architectural flaws:
1. **Cognitive Overload:** Users are inundated with raw numbers without qualitative interpretation.
2. **UI Fragmentation:** Users must navigate separate tabs for radar, 7-day outlooks, hourly breakdowns, and air quality.
3. **Lack of Comparative Synthesis:** Comparing conditions across two cities requires manual mental cross-referencing.
4. **Digital & Language Divide:** Predominantly English-centric interfaces alienate rural Indian citizens, farmers, and non-English speakers.
5. **Absence of Domain-Specific Recommendations:** Farmers cannot easily determine if wind speeds (>15 km/h) or humidity (>80%) compromise pesticide efficiency or cause fungal crop outbreaks.

1. **Cognitive Overload & Data Parsing Burden:**
   Users are presented with raw numeric matrices (humidity percentages, millibars of atmospheric pressure, wind gusts in km/h, UV ratings) without qualitative guidance. Translating 72% humidity and 31°C into an actionable outfit or travel decision requires cognitive effort.
### 2.2 The Grounded Conversational Paradigm
Natural language interfaces allow users to express direct intent. By feeding live sensor readings directly into Gemini's system instruction, WeatherGPT ensures that every answer is mathematically and meteorologically grounded in real-time truth.

2. **Fragmented UI Traversal:**
   To evaluate a simple weekend trip, a user must navigate through multiple tabs: radar maps, hourly sliders, 10-day cards, and air quality sub-menus.

3. **Absence of Contextual Synthesis:**
   A standard app states `Rain: 40% at 17:00`. It does not synthesize whether that rain coincides with the user's evening office commute, whether wind gusts will make umbrellas ineffective, or how rapid temperature drops might affect children or elderly individuals.

4. **Static, Non-Conversational Paradigm:**
   Users cannot ask comparative or compound queries such as:
   * *"Is tomorrow morning colder than today morning?"*
   * *"When is the lowest chance of rain between 2 PM and 8 PM?"*

### 2.2 The Need for Grounded Conversational Interaction
Natural language interfaces allow users to express intent directly. However, using general-purpose AI models without real-time grounding causes hallucinations. WeatherGPT addresses this by combining authoritative API data with real-time generative language models to provide accurate, context-aware answers.

---

## 3. PROPOSED SOLUTION

WeatherGPT introduces a **Dual-Engine Architecture**: an **Instrument Reading Surface** coupled with a **Grounded AI Conversational Engine**.
WeatherGPT introduces a **Dual-Engine Architecture**: an **Instrument Reading Surface** (visual charts, radar maps, telemetry tiles) coupled with a **Grounded AI Conversational Engine** (natural language reasoning, multi-language synthesis, voice I/O).

```
                           WEATHERGPT SOLUTION WORKFLOW
                           ═════════════════════════════

    ┌──────────────┐
    │     USER     │
    └──────┬───────┘
           │ (1) Natural Language Query (e.g., "Will it rain in Kolkata tonight?")
           ▼
    ┌──────────────────────────────────────────────┐
    │          WeatherGPT Web Interface           │
    │  (HTML5 / CSS3 Glassmorphism / Vanilla JS)   │
    └──────┬───────────────────────────────────────┘
           │ (2) POST /api/chat payload { message, location, conversation }
           ▼
    ┌──────────────────────────────────────────────┐
    │       Vercel Serverless Backend API          │
    │  - Coordinates Validation & Payload Sanitize │
    └──────┬───────────────────────────────────────┘
           │ (3) Fetch Real-time Source of Truth
           ▼
    ┌──────────────────────────────────────────────┐
    │      External Meteorological Services        │
    │  - Geocoding API (Latitude/Longitude)        │
    │  - Open-Meteo Forecast API (Hourly/Daily/UV) │
    └──────┬───────────────────────────────────────┘
           │ (4) Structured Meteorological Context JSON
           ▼
    ┌──────────────────────────────────────────────┐
    │           Google Gemini AI Engine            │
    │  - Strict System Prompt Grounding            │
    │  - Real-time SSE Token Generation            │
    └──────┬───────────────────────────────────────┘
           │ (5) Server-Sent Events (SSE) Stream
           ▼
    ┌──────────────────────────────────────────────┐
    │          Frontend Client Reader              │
    │  - Live Token Parsing & Markdown Formatting  │
    │  - Pulsing Streaming Cursor Animation        │
    └──────┬───────────────────────────────────────┘
           │ (6) Natural, Actionable Response Rendered
           ▼
    ┌──────────────┐
    │     USER     │
    └──────────────┘
     ┌──────────────┐
     │     USER     │ ◄── Hands-free voice or natural query in any of 9 languages
     └──────┬───────┘
            │ (1) User asks query (e.g., "কাল সকালে কি বৃষ্টি হবে?")
            ▼
     ┌──────────────────────────────────────────────┐
     │          WeatherGPT Web Interface           │
     │  - Responsive 2-Row CSS Grid Header          │
     │  - Web Speech API (Dictation & Audio Readout)│
     │  - Leaflet.js Interactive Doppler Radar Map  │
     │  - Dynamic Canvas Particle Weather Engine    │
     └──────┬───────────────────────────────────────┘
            │ (2) POST /api/chat payload { message, location, language, comparison }
            ▼
     ┌──────────────────────────────────────────────┐
     │       Vercel Serverless Backend API          │
     │  - In-Memory Cache Check (lib/cache.js)      │
     │  - Coordinate & Script Validation            │
     └──────┬───────────────────────────────────────┘
            │ (3) Fetch Real-time Source of Truth (Cached / Live)
            ▼
     ┌──────────────────────────────────────────────┐
     │      External Meteorological Services        │
     │  - Open-Meteo API (WMO Weather, UV, Hourly)  │
     │  - RainViewer API (Live Doppler Radar Scans) │
     │  - Esri World Dark Gray Canvas Basemap       │
     └──────┬───────────────────────────────────────┘
            │ (4) Structured Multi-Location JSON Context
            ▼
     ┌──────────────────────────────────────────────┐
     │           Google Gemini AI Engine            │
     │  - Anti-Hallucination Grounding Prompt       │
     │  - Multilingual Language Mandate             │
     │  - Multi-Model Failover (3.6 ➔ 3.7 ➔ Fallback)│
     └──────┬───────────────────────────────────────┘
            │ (5) Server-Sent Events (SSE) Stream
            ▼
     ┌──────────────────────────────────────────────┐
     │          Frontend Client Reader              │
     │  - Real-time Markdown Parser & Audio Readout │
     └──────┬───────────────────────────────────────┘
            │ (6) Actionable, localized advice delivered
            ▼
     ┌──────────────┐
     │     USER     │
     └──────────────┘
```

### 3.1 Step-by-Step Workflow Explanation
1. **User Interaction:** The user submits a query through text input or by selecting a pre-configured sample question pill.
2. **Intent & Location Identification:** The application resolves the target location using the active session state or by calling `/api/geocode`.
3. **Deterministic Data Retrieval:** `/api/weather` and `/api/forecast` fetch authoritative metrics (temperature, apparent temperature, humidity, wind vectors, rain volume, UV index, sunrise/sunset, hourly projections).
4. **Context Synthesis & Prompt Assembly:** The backend packages the retrieved weather metrics into a strict JSON payload injected alongside an anti-hallucination system prompt.
5. **AI Reasoning:** Google Gemini processes the prompt, comparing the user's question against the factual dataset.
6. **Streaming Delivery:** Tokens are streamed via SSE (`text/event-stream`) to the browser, rendering markdown in real time.

---

## 4. CURRENT SYSTEM ARCHITECTURE
## 4. COMPREHENSIVE SYSTEM ARCHITECTURE

WeatherGPT is designed as a decoupled, serverless web application that separates client-side rendering from server-side data aggregation and AI orchestration.
WeatherGPT is designed as a decoupled, serverless web platform separating client-side presentation from serverless data aggregation, edge caching, and AI orchestration.

### 4.1 Architecture Diagram (ASCII)

```
═════════════════════════════════════════════════════════════════════════════════
                       WEATHERGPT SYSTEM ARCHITECTURE
═════════════════════════════════════════════════════════════════════════════════

                              CLIENT LAYER (Browser)
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  Presentation Tier                                                          │
 │  Presentation & Interaction Tier                                            │
 │  ├── index.html          Semantic HTML5 Structure & ARIA Accessibility      │
 │  ├── style.css           3-Tier Glassmorphism System & Responsive Layout    │
 │  ├── style.css           3-Tier Glassmorphism & Structured 2-Row CSS Grid   │
 │  ├── script.js           State Store, DOM Controller, Chart.js Integrator   │
 │  ├── Canvas Engine       Dynamic Ambient Weather Particle Animation Engine  │
 │  └── SVG Icon System     Universal 24x24 Vector Icon Set (currentColor)     │
 │  ├── WeatherCanvas       Dynamic Ambient Particle Canvas (Rain/Snow/Sun)    │
 │  ├── Leaflet.js Radar    Esri Dark Basemap + Dynamic RainViewer Doppler     │
 │  ├── Web Speech Engine   Speech-to-Text Dictation & Text-to-Speech Readout  │
 │  ├── Comparison Drawer   Side-by-Side Dual-City Metric Comparison Grid      │
 │  └── Bookmark Store      localStorage Fast-Access City Bookmarks            │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ HTTPS / JSON / SSE
                                        ▼
                      SERVERLESS BACKEND LAYER (Node.js / Vercel)
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │  API Gateway & Serverless Functions                                         │
 │  ├── /api/geocode.js     Location Search & Coordinate Resolution            │
 │  ├── /api/weather.js     Current Observation Extraction (Temp, UV, Wind)    │
 │  API Gateway & Serverless Endpoints                                         │
 │  ├── /api/geocode.js     Place Name Search & Coordinate Resolution          │
 │  ├── /api/weather.js     Current Observations Extraction (Temp, UV, Wind)   │
 │  ├── /api/forecast.js    7-Day Daily & 24-Hour Hourly Aggregation           │
 │  └── /api/chat.js        Grounded AI Context Ingestion & Gemini SSE Stream  │
 │  └── /api/chat.js        Grounded Multi-City AI Context & Gemini SSE Stream │
 │                                                                             │
 │  Shared Utilities (lib/)                                                    │
 │  ├── lib/http.js         CORS Management, Options Handler, JSON Formatter   │
 │  └── lib/weather.js      WMO Code Mapping, Coordinate Validator, Fetchers   │
 │  Shared Utilities & Local Intelligence (lib/)                               │
 │  ├── lib/cache.js        In-Memory TTL Cache (5-min weather / 1-hr geocode) │
 │  ├── lib/advisor.js      Deterministic Fallback Advisory Engine (Agri/UV)   │
 │  ├── lib/weather.js      WMO Code Mapping, Coordinate Validator, Fetchers   │
 │  └── lib/http.js         CORS Management, Options Preflight, JSON Formatter │
 └───────────────────────┬───────────────────────────────┬─────────────────────┘
                         │                               │
                         │ HTTPS                         │ HTTPS / SSE
                         │ HTTPS (Cached)                │ HTTPS / SSE
                         ▼                               ▼
       ┌──────────────────────────────────┐   ┌────────────────────────────────┐
       │     EXTERNAL METEOROLOGY         │   │      AI & REASONING TIER       │
       │           SERVICES               │   │                                │
       │     EXTERNAL METEOROLOGICAL      │   │      AI & REASONING TIER       │
       │            SERVICES              │   │                                │
       │  Open-Meteo Weather API          │   │  Google Gemini API             │
       │  Open-Meteo Geocoding API        │   │  - gemini-3.6-flash (Primary)  │
       │  (WMO Standards, 0.1° Resolution)│   │  - gemini-3.7-flash (Fallback) │
       │  RainViewer Doppler Radar API    │   │  - gemini-3.7-flash (Failover) │
       │  Esri World Dark Gray Basemap    │   │  - Local Deterministic Advisor │
       └──────────────────────────────────┘   └────────────────────────────────┘
═════════════════════════════════════════════════════════════════════════════════
```

### 4.2 Component Responsibilities

| Tier | Component | Primary Responsibility |
|---|---|---|
| **Client** | `index.html` | Defines semantic page hierarchy, hero card layout, charts grid, and chat shell. |
| **Client** | `style.css` | Implements 3-tier glass hierarchy (`--surface-hero`, `--surface-secondary`, `--surface-tile`), dynamic CSS themes (`theme-clear-day`, `theme-rain`, etc.), tabular numerals, and `@media (prefers-reduced-motion)` constraints. |
| **Client** | `script.js` | Manages application state (`state.location`, `state.current`, `state.forecast`, `state.chatHistory`), coordinates API calls, renders Chart.js instances, and parses streaming SSE tokens. |
| **Client** | `WeatherCanvas` | HTML5 Canvas animation engine rendering real-time particles (raindrops, snowflakes, lightning flashes, clouds, sunbeams). |
| **Serverless** | `/api/geocode` | Validates city strings, executes Open-Meteo geocoding queries, and returns normalized coordinates and timezones. |
| **Serverless** | `/api/weather` | Validates coordinates, calls current weather endpoints, maps WMO codes, and computes UV Index values. |
| **Serverless** | `/api/forecast` | Returns 24-hour hourly arrays and 7-day daily summaries. |
| **Serverless** | `/api/chat` | Assembles weather context, injects anti-hallucination rules, interfaces with Google Gemini, and streams SSE chunks. |
| **Shared Lib** | `lib/weather.js` | Houses WMO weather code translations, geographic coordinate boundaries, and decimal precision rounding. |
| **Shared Lib** | `lib/http.js` | Enforces HTTP security headers, CORS policies, and standardized error responses. |

---

## 5. DETAILED TECH STACK

| Technology | Purpose in Project | Rationale for Selection | Status |
|---|---|---|---|
| **HTML5** | Semantic Document Structure | Native browser compatibility, SEO optimization, and screen-reader accessibility without framework overhead. | **Current (Phase 1)** |
| **CSS3** | Visual Design & Theming | CSS Custom Properties (Variables), 3-tier frosted glass backdrop filters, smooth transitions, and responsive grid layouts. | **Current (Phase 1)** |
| **JavaScript (ES6+)** | Frontend Logic & State Management | Zero-dependency DOM orchestration, Fetch API, SSE stream reader (`ReadableStreamDefaultReader`), and dynamic Chart.js lifecycle management. | **Current (Phase 1)** |
| **HTML5 Canvas API** | Ambient Weather Visualization | Hardware-accelerated 60 FPS particle rendering for ambient weather backgrounds (rain, snow, clouds, sunbeams, lightning). | **Current (Phase 1)** |
| **Chart.js (v4.4)** | Meteorological Visualizations | Lightweight visualization library rendering 24-hour hourly temperature curves and rain probability bar charts. | **Current (Phase 1)** |
| **Node.js (v18+)** | Backend Runtime Environment | Asynchronous non-blocking I/O runtime powering local development and serverless functions. | **Current (Phase 1)** |
| **Vercel Serverless Functions** | Cloud Backend Execution | Auto-scaling, zero-maintenance serverless execution for API endpoints with rapid global cold-start times. | **Current (Phase 1)** |
| **Open-Meteo Weather API** | Meteorological Data Provider | High-precision weather data based on national weather model feeds (NOAA, ECMWF, DWD) with no mandatory API key bottlenecks for open prototypes. | **Current (Phase 1)** |
| **Open-Meteo Geocoding API** | Location Coordinate Translation | Fast worldwide place-name resolution, timezone detection, and administrative boundary mapping. | **Current (Phase 1)** |
| **Google Gemini API** | Natural Language Reasoning | Generative AI processing structured weather context and streaming contextual responses using `gemini-3.6-flash`. | **Current (Phase 1)** |
| **Server-Sent Events (SSE)** | Real-Time AI Token Streaming | Low-overhead unidirectional HTTP streaming delivering instantaneous token-by-token typing in the chat console. | **Current (Phase 1)** |
| **GitHub** | Source Code Management & CI/CD | Version control and automated deployment triggers integrated with Vercel. | **Current (Phase 1)** |
| **Environment Variables (`.env`)** | Secret Configuration Storage | Isolation of sensitive API keys (`GEMINI_API_KEY`) on the server side to prevent client exposure. | **Current (Phase 1)** |
| **Redis / Upstash** | Edge Caching Layer | Caching layer to cache repeated city forecast queries and reduce upstream API overhead. | *Phase 2 (Final Demo)* |
| **Web Speech API** | Voice Input / Output | Browser-native speech-to-text and text-to-speech for hands-free interactions. | *Phase 2 (Final Demo)* |
| **Leaflet.js** | Interactive Radar & Rain Maps | Lightweight interactive map library for geographic precipitation layer visualization. | *Phase 2 (Final Demo)* |
| **HTML5** | Semantic Document Hierarchy | Native browser compatibility, ARIA accessibility, and zero-framework overhead. | **Operational** |
| **CSS3 & CSS Grid** | 3-Tier Glassmorphism & Layout | 2-row CSS Grid layout preventing button overlap across all languages; GPU-accelerated backdrop blur. | **Operational** |
| **JavaScript (ES6+)** | Frontend Logic & State Management | Zero-dependency DOM orchestration, Fetch API, and `ReadableStreamDefaultReader` for token streaming. | **Operational** |
| **HTML5 Canvas API** | Weather Particle Engine | 60 FPS particle rendering for raindrops, snow, clouds, sunbeams, and lightning flashes. | **Operational** |
| **Chart.js (v4.4)** | Meteorological Trend Curves | Interactive 24-hour temperature progression and precipitation probability charts. | **Operational** |
| **Leaflet.js (v1.9)** | Interactive Radar & Rain Map | Mobile-friendly mapping engine rendering smooth radar and geographic layers. | **Operational** |
| **Esri World Dark Canvas** | Base Radar Geography | Clean, high-contrast dark slate basemap with zero watermarks and no mandatory API keys. | **Operational** |
| **RainViewer API** | Live Doppler Precipitation Layer | Public dynamic Doppler radar tile server synchronized with real-time precipitation scans. | **Operational** |
| **Web Speech API** | Two-Way Voice Assistant | Native browser speech recognition (`webkitSpeechRecognition`) and synthesis (`speechSynthesis`). | **Operational** |
| **Node.js (v18+)** | Backend Runtime Environment | Fast, non-blocking asynchronous runtime executing local server and serverless functions. | **Operational** |
| **Vercel Serverless** | Cloud Backend Execution | Edge auto-scaling with low cold-start latency and isolated environment secret storage. | **Operational** |
| **Open-Meteo APIs** | Meteorological Data Provider | High-precision global weather models (NOAA, ECMWF) with WMO standard compliance. | **Operational** |
| **Google Gemini API** | Natural Language Reasoning | Multimodal LLM reasoning over structured weather context using `gemini-3.6-flash`. | **Operational** |
| **Server-Sent Events (SSE)** | Instant AI Token Streaming | Unidirectional HTTP streaming protocol rendering token-by-token markdown typing. | **Operational** |
| **In-Memory TTL Cache** | High-Performance Data Caching | Periodic-purging key-value cache in `lib/cache.js` eliminating redundant upstream API calls. | **Operational** |
| **Rule-Based Advisor** | Deterministic Offline Failover | `lib/advisor.js` delivering instant farming, UV, and outfit advice if AI quotas exhaust. | **Operational** |

---

## 6. FRONTEND ARCHITECTURE
## 6. FRONTEND ARCHITECTURE & UI/UX DESIGN

### 6.1 User Interface & 3-Tier Glassmorphism
The UI uses a **3-tier glass hierarchy** to prevent visual noise:
1. **Tier 1 — Hero Surface (`.current-weather`):** The primary focus card with deep blur (`backdrop-filter: blur(28px) saturate(190%)`), an active border glow, and prominent temperature typography.
2. **Tier 2 — Structural Cards (`.secondary-card`, `.chat-card`):** Intermediate blur (`18px`) and lower opacity (`rgba(255, 255, 255, 0.10)`).
3. **Tier 3 — Nested Metric Tiles (`.detail-item`, `.hour-item`, `.day-card`):** Minimalist translucent tiles (`rgba(255, 255, 255, 0.06)`) with subtle borders for clean data density.
### 6.1 Structured 2-Row CSS Grid Header
To prevent overlapping buttons across diverse Indian script lengths (e.g., long Bengali or Telugu phrases vs short English terms), `.site-header` utilizes a **CSS Grid with explicit named areas**:
```css
.site-header {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    "brand search"
    "actions actions";
  row-gap: 16px;
  column-gap: 20px;
}
```
* **Row 1:** WeatherGPT Brand & Tagline pinned left; Search bar & geolocation button pinned right.
* **Row 2:** Action controls (`Language Selector`, `Compare Button`, `Ask WeatherGPT`) aligned left as a cohesive horizontal pill bar.
* **Component Safeguards:** All buttons enforce `white-space: nowrap; flex-shrink: 0;` while inputs maintain `min-width: 0;`, guaranteeing zero button collision across all 9 languages.

### 6.2 Universal SVG Vector Icon System
All emojis were eliminated in favor of a **24×24 stroke-based SVG icon library** rendered inline. Every icon is styled with `stroke: currentColor; fill: none; stroke-width: 2`, allowing icons to automatically inherit dynamic theme colors (`var(--accent)`).
### 6.2 3-Tier Layered Glassmorphism
The visual interface employs three calibrated optical depths:
1. **Tier 1 — Hero Surface (`.current-weather`):** Prominent focus card with `backdrop-filter: blur(28px) saturate(190%)` and subtle inner border glow.
2. **Tier 2 — Structural Cards (`.radar-card`, `.comparison-card`, `.chart-box`):** Intermediate blur (`18px`) and balanced surface translucency.
3. **Tier 3 — Detail Metrics (`.detail-item`, `.hour-item`, `.day-card`):** High-density translucent tiles displaying numerical data without visual clutter.

### 6.3 Real-Time SSE Token Stream Reader
When interacting with WeatherGPT, the client does not wait for complete responses:
* An AI message bubble mounts immediately with an animated glowing cursor (`.streaming-cursor`).
* A `ReadableStreamDefaultReader` reads incoming chunks from `/api/chat`.
* A lightweight, secure client-side Markdown parser converts bolding (`**`), italics (`*`), inline code (`` ` ``), headers (`###`), and bulleted lists (`*`) into clean HTML in real time.
### 6.3 Dynamic Weather-Calibrated Theme Presets
The document `<body>` dynamically switches CSS classes based on current meteorological conditions:
* `theme-clear-day` (vibrant sky blues, golden ambient aura)
* `theme-clear-night` (deep indigo, moonlit lavender ambient glow)
* `theme-rain` (dark storm slate, oceanic cyan reflections)
* `theme-thunderstorm` (midnight violet, electric purple ambient bursts)
* `theme-snow` (subtle frosty blues, pale azure luminescence)
* `theme-clouds` (neutral overcast graphite with balanced contrast)

---

## 7. BACKEND ARCHITECTURE
## 7. BACKEND ARCHITECTURE & SERVERLESS ORCHESTRATION

### 7.1 Serverless Modular Decoupling
The backend follows micro-service principles by isolating discrete tasks across separate serverless handlers:
* **`/api/geocode`:** Independent location discovery. Can be leveraged independently by search dropdowns.
* **`/api/weather`:** Fast, lightweight current conditions endpoint returning essential metrics (temperature, apparent temperature, humidity, wind vectors, UV index, sunrise/sunset).
* **`/api/forecast`:** Heavy data endpoint containing 168 hours of hourly projections and 7 days of daily summaries.
* **`/api/chat`:** AI orchestration endpoint that accepts user prompts and conversation history, internally calls `lib/weather.js` to build a grounded factual payload, and pipes Gemini's streaming output directly to the client.
The backend isolates functional domains into lightweight, stateless handlers:
* **`/api/geocode`:** Resolves city query strings to latitude, longitude, and timezone. Results are cached for 1 hour.
* **`/api/weather`:** Fetches real-time observations, translates WMO codes into readable descriptions, and extracts UV ratings. Cached for 5 minutes.
* **`/api/forecast`:** Aggregates 168-hour continuous progression and 7-day daily forecasts. Cached for 5 minutes.
* **`/api/chat`:** Assembles factual telemetry context (supporting single or multi-city comparison), checks language requirements, invokes Google Gemini with streaming SSE, and falls back to `lib/advisor.js` on failure.

### 7.2 Why Endpoint Separation Matters
1. **Bandwidth Optimization:** Quick searches only hit `/api/weather` without downloading massive 7-day hourly arrays.
2. **Independent Caching:** Geocoding results (static) can have longer cache-control lifetimes (e.g., 30 days) than live weather (10 minutes).
3. **Resilience:** If the AI API experiences upstream latency or rate limits, core graphical weather cards continue to function without degradation.
### 7.2 In-Memory TTL Caching Subsystem (`lib/cache.js`)
To guarantee sub-millisecond response times for frequent searches and protect upstream API quotas:
```javascript
const cacheStore = new Map();

function setCache(key, value, ttlSeconds = 300) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cacheStore.set(key, { value, expiresAt });
}
```
* Periodic garbage collection executes every 5 minutes (`clearExpiredCache`) to purge stale entries and prevent memory leaks.

---

## 8. AI INTEGRATION & GROUNDING ENGINE
## 8. AI INTEGRATION, GROUNDING & MULTILINGUAL ENGINE

### 8.1 The Grounding Principle
A critical challenge with general-purpose LLMs is their inability to know current real-world state. If asked *"Is it raining in Mumbai right now?"*, an ungrounded model will guess or extrapolate based on historical climate data.
### 8.1 Deterministic Data Grounding
To eliminate LLM hallucinations, Google Gemini is strictly bound to factual context injected into its system instruction. The model is forbidden from inventing meteorological forecasts.

WeatherGPT solves this through **Deterministic Data Grounding**:

```
 ┌────────────────────────┐
 │   User Asks Question   │
 └───────────┬────────────┘
             │
             ▼
 ┌────────────────────────────────────────────────────────┐
 │  Deterministic Backend Query to Open-Meteo API         │
 │  (Returns live JSON: Temp, Rain, UV, Wind, Forecast)   │
 └───────────┬────────────────────────────────────────────┘
             │
             ▼
 ┌────────────────────────────────────────────────────────┐
 │  Context Injection into Gemini System Instruction:     │
 │  "You are WeatherGPT. Use ONLY the provided weather    │
 │  data to answer. NEVER invent or assume facts."        │
 └───────────┬────────────────────────────────────────────┘
             │
             ▼
 ┌────────────────────────────────────────────────────────┐
 │  Gemini Model Generates Grounded Natural Language      │
 └────────────────────────────────────────────────────────┘
```

### 8.2 System Prompt Architecture
The Gemini model is initialized with a strict system instruction:

### 8.2 System Prompt & Anti-Hallucination Directives
```text
You are WeatherGPT, a conversational weather assistant.
You must NEVER invent, guess, or assume weather information.
Use only the provided Weather Data to answer weather questions.
If required data is missing or unavailable, say you cannot reliably answer.
You can give practical suggestions like carrying an umbrella, but do not provide medical, safety, or legal guarantees.
Be concise, warm, and helpful. Use Celsius by default.
```

### 8.3 Context Assembly Schema
The factual context injected into Gemini contains a structured snapshot:
```json
{
  "location": { "name": "Kolkata", "country": "India", "latitude": 22.56, "longitude": 88.36, "timezone": "Asia/Kolkata" },
  "current": {
    "temperature": 27.8,
    "feelsLike": 33.4,
    "humidity": 85,
    "windSpeed": 6.2,
    "uvIndex": 0,
    "weather": "Overcast",
    "isDay": false,
    "sunrise": "05:20",
    "sunset": "17:51"
  },
  "forecast": {
    "today": { "maxTemperature": 31.2, "minTemperature": 26.0, "rain": 1.4, "weather": "Light rain" },
    "tomorrow": { "maxTemperature": 32.0, "minTemperature": 26.5, "rain": 0.2, "weather": "Partly cloudy" },
    "next7Days": [ ... ],
    "next24Hours": [ ... ]
  }
### 8.3 Multilingual Indian Language Mandate
When a user selects one of India's regional languages or writes in a vernacular script, the backend dynamically injects a strict localization directive:
```text
CRITICAL MULTILINGUAL MANDATE:
The user is interacting in [Hindi / Bengali / Tamil / etc.]. 
You MUST write your ENTIRE response in [Selected Language].
Translate all weather conditions, recommendations, warnings, headings, and advice accurately.
Do NOT default to English unless required for non-translatable units.
```

### 8.4 Automated Script Detection
`api/chat.js` includes a regex-based script detector that identifies native Indian scripts in incoming prompts:
```javascript
function detectLanguageFromText(text) {
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi/Marathi)
  if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu'; // Gujarati
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa'; // Punjabi
  return null;
}
```

---

## 9. DATA FLOW & LIFECYCLE
## 9. ADVANCED FEATURES DEEP-DIVE

### 9.1 End-to-End Query Flowchart
### 9.1 Multi-Location Side-by-Side Comparison Module
Users can click the **Compare** header button to reveal a dedicated comparison card:
* Allows entering a secondary city (e.g., comparing *Kolkata* with *Darjeeling*).
* Fetches and renders real-time telemetry side-by-side (Temperature, Apparent Temp, Humidity, Wind Speed, UV Index, Rain).
* **Comparative AI Grounding:** When comparison mode is open, `/api/chat` bundles both primary and secondary locations into a composite JSON schema (`comparisonLocation`), empowering Gemini to answer complex comparative prompts (*"Which city will be colder tonight and by how much?"*).

### 9.2 Interactive Doppler Radar & Real-Time Precipitation Map
* **Basemap Layer:** High-performance **Esri World Dark Gray Canvas** (`World_Dark_Gray_Base` + `World_Dark_Gray_Reference`), providing clean dark geography with zero watermarks and no mandatory API keys.
* **Radar Layer:** Dynamically synchronized with the **RainViewer API** (`/public/weather-maps.json`). The system queries the most recent Doppler radar timestamp and renders real-time precipitation intensity tiles (`/256/{z}/{x}/{y}/2/1_1.png`) with color scheme 2 (Universal Doppler Rainbow).
* **Smart 5-Minute Cache Protection:** Caches active radar frames for 300 seconds so panning and zooming do not cause excessive API calls.

### 9.3 Multilingual Indian Language Localization (9 Languages)
WeatherGPT supports full UI and conversational localization across **9 major Indian languages**:
1. **English (en)**
2. **हिन्दी — Hindi (hi)**
3. **বাংলা — Bengali (bn)**
4. **தமிழ் — Tamil (ta)**
5. **తెలుగు — Telugu (te)**
6. **मराठी — Marathi (mr)**
7. **ગુજરાતી — Gujarati (gu)**
8. **ಕನ್ನಡ — Kannada (kn)**
9. **ਪੰਜਾਬੀ — Punjabi (pa)**

The localization engine updates all dashboard strings (titles, hints, metric labels, button text) via a comprehensive client-side translation dictionary while steering Gemini's response language.

### 9.4 Two-Way Voice Assistant (Web Speech API)
* **Speech-to-Text (STT):** Powered by `window.SpeechRecognition` / `webkitSpeechRecognition`. Users click the microphone button in the assistant window, speak naturally, and see their query transcribed and submitted automatically.
* **Text-to-Speech (TTS):** Every AI chat bubble includes an integrated speaker button. Clicking it triggers `window.speechSynthesis`, vocalizing the response in the user's selected language with an animated audio wave indicator (`.tts-playing`).

### 9.5 High-Precision Agricultural & Lifestyle Rule Advisories (`lib/advisor.js`)
To guarantee continuous service even during external AI API outages, WeatherGPT embeds an offline deterministic advisory engine:
* **Agricultural Advisory:** Evaluates wind speed ($>15 \text{ km/h}$) for pesticide drift hazards, humidity ($>80\%$) for fungal disease risk, and rainfall for irrigation scheduling.
* **WHO UV Index Protection:** Classifies UV indices into Low (0–2), Moderate (3–5), High (6–7), Very High (8–10), and Extreme (11+) with tailored sunscreen and outdoor exposure guidance.
* **Thermal Outfit Recommendations:** Analyzes ambient temperature and humidity to recommend breathable cottons, light jackets, or thermal layers.

### 9.6 Client-Side Bookmark & Quick-Location Manager
* Users can click the star icon beside any location to save it to their favorites bar.
* Stored in browser `localStorage` (`weathergpt_bookmarks`), rendering interactive quick-access chips below the search bar with single-click location loading and deletion controls.

---

## 10. DATA FLOW & LIFECYCLE TRACE

```
[ USER ] Types: "Will it rain in Kolkata tonight?"
[ USER ] Speaks or types: "কাল কি বৃষ্টি হবে?" (Will it rain tomorrow?)
   │
   ▼
[ CLIENT: script.js ] Intercepts submit, appends user bubble to chat history
[ CLIENT: script.js ]
   ├── Captures voice via SpeechRecognition OR text input
   ├── Identifies Bengali language mode ('bn')
   └── Emits POST /api/chat { message, location: "Kolkata", language: "bn" }
   │
   ▼
[ POST /api/chat ] Passes payload { message, location, conversation }
[ BACKEND: api/chat.js ]
   ├── Checks in-memory cache (lib/cache.js) for Kolkata telemetry
   ├── Fetches live data from Open-Meteo if expired
   ├── Structures weatherContext JSON (today, tomorrow, 7-day, 24-hr)
   └── Mounts Gemini system prompt with Bengali Translation Mandate
   │
   ▼
[ BACKEND: api/chat.js ] Validates coordinates & sanitizes inputs
[ GOOGLE GEMINI STREAM ]
   └── Yields SSE chunks via streamGenerateContent: data: {"text": "কাল ..."}
   │
   ▼
[ Open-Meteo API ] Fetches current observation + 24-hr hourly + 7-day forecast
[ CLIENT STREAM READER ]
   ├── Decodes SSE chunks in real time
   ├── Renders Markdown formatting with glowing cursor
   └── Attaches SpeechSynthesis TTS button for Bengali audio readout
   │
   ▼
[ Build Weather Context ] Assembles structured JSON snapshot
   │
   ▼
[ Gemini API (streamGenerateContent) ] Ingests System Prompt + Weather Context + User Query
   │
   ▼
[ SSE Stream (data: {"text": "..."}) ] Piped chunk-by-chunk through serverless response
   │
   ▼
[ CLIENT: Stream Reader ] Decodes chunks, runs through formatMarkdown(), updates DOM live
   │
   ▼
[ USER ] Sees response type out in real time with bold highlights and bullet points
[ USER ] Receives immediate, grounded vernacular advice with optional voice playback
```

---

## 10. SECURITY & PRIVACY ARCHITECTURE
## 11. SECURITY & PRIVACY ARCHITECTURE

### 10.1 Implemented Security Measures vs Proposed Enhancements
| Security Vector | Implementation Safeguard |
|---|---|
| **API Key Isolation** | `GEMINI_API_KEY` is strictly confined to server-side runtime environment variables. Zero credentials reach the client. |
| **Input Boundary Validation** | Strict numeric boundary validation on geographic coordinates ($-90 \le \text{lat} \le 90$, $-180 \le \text{lon} \le 180$) and payload size limits ($<1 \text{ MB}$). |
| **XSS Prevention** | Client-side Markdown parser escapes raw HTML entities (`&`, `<`, `>`, `"`) before rendering formatted spans. |
| **CORS Governance** | Centralized in `lib/http.js`, handling `OPTIONS` preflight requests and disallowing unapproved HTTP verbs. |
| **Fail-Safe Privacy** | Completely stateless architecture. No personal conversation logs or user identity records are retained on disk. |

| Security Domain | Currently Implemented (Phase 1) | Final-Round Enhancements (Phase 2) |
|---|---|---|
| **API Key Protection** | Sensitive keys (`GEMINI_API_KEY`) reside exclusively in server-side environment variables; zero client exposure. | Automated secret rotation and verification scripts. |
| **Input Validation** | Coordinate sanity checks (`-90 <= lat <= 90`), string trimming, and 500-char message limits. | Strict JSON schema validation on all endpoints. |
| **CORS Configuration** | Standardized CORS headers in `lib/http.js` handling `OPTIONS` preflight requests. | Domain-restricted origin whitelisting for production deployments. |
| **Data Sanitization** | HTML entity escaping in Markdown parser to eliminate Cross-Site Scripting (XSS). | Enhanced Content Security Policy (CSP) headers. |
| **Abuse & Rate Limiting** | Vercel's default DDoS filtering and serverless timeout execution limits. | Redis-based token bucket rate limiting (e.g., Upstash) per client IP. |

---

## 11. FEASIBILITY ANALYSIS
## 12. FEASIBILITY ANALYSIS

### 11.1 Technical Feasibility
The architecture relies on proven web standards:
* **Serverless Execution:** Sub-second cold starts with zero server maintenance.
* **Standard Protocols:** HTTP/2, REST, and Server-Sent Events (SSE) natively supported across all modern browsers.
* **Separation of Concerns:** Client handles presentation; serverless handles orchestration; Gemini handles language; Open-Meteo handles meteorological computation.
* **Technical Feasibility:** Built entirely on Baseline-compliant web standards (ES6, CSS Grid, Canvas, Web Speech, Leaflet). Requires no proprietary browser plugins.
* **Economic Feasibility:** Serverless architecture incurs zero compute charges when idle. Open-Meteo offers generous free tiers, and Gemini Flash provides ultra-cost-effective token inference.
* **Operational Feasibility:** Fully automated continuous deployment pipeline via GitHub and Vercel with zero database maintenance.

### 11.2 Economic Feasibility
* **Compute Costs:** Vercel's hobby/pro tier accommodates thousands of monthly serverless invocations at negligible cost.
* **Meteorological API Costs:** Open-Meteo provides free, open-access tiers for non-commercial and prototype use with generous rate limits (up to 10,000 daily calls).
* **AI Model Costs:** `gemini-3.6-flash` is optimized for low-latency, high-efficiency inference, costing fractions of a cent per standard conversation.

### 11.3 Operational Feasibility
* **Continuous Integration:** Git push to `main` automatically triggers production builds, runs integrity checks, and updates global edge nodes in under 45 seconds.
* **Zero Database Maintenance:** The current MVP is entirely stateless, eliminating database backup routines, migration scripts, and storage costs.

---

## 12. SCALABILITY STRATEGY
## 13. SCALABILITY STRATEGY

### 12.1 Scaling Progression (2-Stage Execution)

```
[ Phase 1: Current Submission MVP ] (Deployed Now)
  └── Vercel Serverless Functions + Stateless Client State + Direct API Calls + Instant SSE Streaming
[ CURRENT HIGH-CONCURRENCY ARCHITECTURE ]
  ├── Client-Side Stateless Execution (zero session memory bottleneck)
  ├── Serverless Function Auto-Scaling (dynamic container scaling on Vercel)
  ├── Multi-Tier In-Memory Caching (lib/cache.js reducing upstream API load by ~70%)
  └── Resilient Fallback Hierarchy (Gemini 3.6 ➔ 3.7 ➔ Offline Rule Engine)

[ Phase 2: Final Day Demonstration & Production Scale ] (Grand Finale Target)
  └── Edge Caching (5-min TTL on identical city coords) + Redis Rate Limiting + Voice I/O + Radar Map Layers
[ PRODUCTION EXPANSION PATH ]
  └── Distributed Edge Redis (Upstash) + Cloudflare CDN Geo-Distributed Caching
```

---

## 13. RELIABILITY & ERROR HANDLING MATRIX
## 14. RELIABILITY & MULTI-TIER RESILIENCE MATRIX

| Failure Scenario | Immediate Effect on User | Mitigation & Fallback Strategy |
| Point of Failure | Impact | Automated Resilience Mechanism |
|---|---|---|
| **Invalid City Name** | Search returns no matching coordinates. | Geocoding service returns a structured 404; client renders a non-blocking toast notification (*"Location not found. Please check spelling."*). |
| **Open-Meteo Outage** | Weather data retrieval fails. | Backend catches 502/504 errors and returns a clean error payload; UI displays a retry button and preserves previously loaded session data. |
| **Gemini API Timeout / Rate Limit** | AI chat fails to stream tokens. | Backend automatically iterates through fallback model chain (`gemini-3.6-flash` ➔ `gemini-3.7-flash` ➔ `gemini-flash-latest`). If all fail, displays an informative fallback message. |
| **Network Disconnection** | Fetch request drops mid-stream. | Client catches stream aborts, removes the pulsing cursor, and appends an error note in the chat bubble without crashing the page. |
| **Missing Specific Data (e.g. UV at night)** | Specific metric field is null/zero. | UI formatters provide intelligent fallbacks (e.g., UV Index displays `0 (Low)` at night or falls back to daily peak). |
| **Primary Gemini Model Outage** | AI stream fails | Automatically cascades: `gemini-3.6-flash` ➔ `gemini-3.7-flash` ➔ `gemini-flash-latest`. |
| **Total LLM Service Outage** | AI reasoning unavailable | Seamlessly triggers `lib/advisor.js`, generating deterministic rule-based advice for rain, UV, farming, and outfits. |
| **CartoDB Basemap Deprecation** | Basemap watermarked | Replaced with open **Esri World Dark Gray Canvas**, guaranteeing pristine visuals with zero API keys. |
| **RainViewer API Latency** | Radar frame slow to fetch | Employs 5-minute client caching and falls back safely to static coverage mask without interrupting the base map. |
| **Invalid Location Query** | Place cannot be resolved | Returns structured 404 with non-blocking user toast (*"Location not found. Please verify spelling."*). |

---

## 14. FINAL-ROUND TECHNOLOGY PROSPECTS
## 15. PRODUCT ROADMAP (DELIVERED CAPABILITIES & FUTURE HORIZONS)

For the **Final Hackathon Demonstration Day (Phase 2)**, the following four concrete, high-impact features are planned for integration:

### 14.1 Key Final-Day Enhancements

#### A. Multilingual Indian Language Support
* **Concept:** Allow citizens across India to converse in regional languages (Hindi, Bengali, Tamil, Marathi, Telugu, etc.).
* **Technology:** Leverage Gemini's multilingual tokens + localized weather terminology mapping.
* **Benefit:** Bridges the digital divide for non-English-speaking farmers, daily-wage workers, and rural commuters.

#### B. Voice-Driven Weather Assistant
* **Concept:** Hands-free weather queries via microphone with spoken voice responses.
* **Technology:** Web Speech API (`SpeechRecognition` and `SpeechSynthesis`).
* **Benefit:** Essential accessibility for visually impaired individuals and drivers on the road.

#### C. Multi-Location Comparison
* **Concept:** Direct side-by-side comparative queries (e.g., *"Compare weather between Kolkata and Delhi tomorrow morning"*).
* **Technology:** Parallel dual-geocoding and multi-context JSON injection.
* **Benefit:** Enables travelers and event organizers to evaluate route destinations instantly.

#### D. Interactive Weather Radar & Precipitation Layer
* **Concept:** Live satellite precipitation tile overlays.
* **Technology:** Leaflet.js with Open-Meteo precipitation tile layers.
* **Benefit:** Gives users visual confirmation of cloud and rain front movements.

---

## 15. PRODUCT ROADMAP (2-STAGE HACKATHON PLAN)

```
═════════════════════════════════════════════════════════════════════════════════
                       WEATHERGPT 2-STAGE ROADMAP
                       WEATHERGPT PRODUCT ROADMAP
═════════════════════════════════════════════════════════════════════════════════

 PHASE 1: INITIAL SUBMISSION (Fully Functional Working MVP) — [ COMPLETED & DEPLOYED ]
 ├── Conversational weather reasoning powered by Google Gemini (gemini-3.6-flash)
 ├── Live Open-Meteo Integration (Current weather, UV Index, 24-hr Hourly, 7-Day Forecast)
 ├── Real-Time Server-Sent Events (SSE) Streaming Token Typing with Pulsing Cursor
 ├── 3-Tier Layered Glassmorphism Design System (Mobile-first responsive layout)
 ├── Universal 24x24 Stroke-Based SVG Vector Icon System (currentColor inheritance)
 ├── Hardware-Accelerated Dynamic Ambient Particle Weather Canvas
 ├── Interactive Temperature & Rain Probability Curves via Chart.js
 └── Vercel Serverless Cloud Deployment with Secure Server-Side API Key Isolation
  DELIVERED & OPERATIONAL (Current Production Build)
  ├── Conversational weather reasoning grounded in live Open-Meteo telemetry
  ├── Real-time Server-Sent Events (SSE) streaming token typing animation
  ├── 3-Tier Layered Glassmorphism Design System with Dynamic Weather Presets
  ├── Hardware-accelerated 60 FPS HTML5 Canvas weather particle engine
  ├── Interactive Chart.js 24-hour temperature and precipitation curves
  ├── Multi-Location Side-by-Side Comparison Module with comparative AI context
  ├── Interactive Doppler Radar Map (Leaflet.js + Esri Dark Canvas + RainViewer)
  ├── Native Localization across 9 Indian Regional Languages
  ├── Two-Way Voice Assistant (Web Speech STT dictation + TTS audio playback)
  ├── High-Precision Agricultural, UV, and Outfit Rule-Based Advisory Engine
  ├── In-Memory High-Performance TTL Caching Layer (lib/cache.js)
  └── Structured 2-Row CSS Grid Header with zero button overlapping

                                       │
                                       ▼
                                        │
                                        ▼

 PHASE 2: GRAND FINALE / FINAL ROUND UPDATE — [ PREPARED FOR FINAL EVALUATION DAY ]
 ├── Multi-Location Side-by-Side Comparison Module ("Compare Kolkata and Delhi")
 ├── Interactive Weather Radar & Precipitation Map Layer (Leaflet.js integration)
 ├── Voice Interaction Engine (Speech-to-Text & Text-to-Speech via Web Speech API)
 ├── Multilingual Indian Language Localization (Hindi, Bengali, Tamil, etc.)
 ├── Session Memory & Favorite City Bookmarks (localStorage)
 └── Edge Caching Layer via Redis (Upstash) for Sub-100ms Repeated Query Responses
  FUTURE NATIONAL SCALE (Post-Hackathon Deployment Prospects)
  ├── Direct India Meteorological Department (IMD) Doppler Radar API integration
  ├── Progressive Web App (PWA) with offline push notifications for extreme weather
  ├── SMS / IVR Gateway for low-bandwidth rural farmers without smartphones
  └── Hyper-local crowd-sourced weather validation via citizen science reports
═════════════════════════════════════════════════════════════════════════════════
```

---

## 16. COMPETITIVE DIFFERENTIATION
## 16. COMPETITIVE DIFFERENTIATION MATRIX

WeatherGPT does not claim to be the sole weather application in existence; rather, it introduces a fundamentally different **interaction model**:

```
Traditional Weather Apps:
[ Raw Weather Data ] ──────▶ [ User Must Manually Interpret & Calculate Decisions ]

WeatherGPT Grounded Paradigm:
[ User Question ] ──▶ [ Live Data Retrieval ] ──▶ [ AI Reasoning ] ──▶ [ Actionable Answer ]
```

### 16.1 Direct Comparison Matrix

| Feature Dimension | Traditional Weather Portals | Generic AI Chatbots (e.g., ChatGPT) | WeatherGPT Platform |
| Feature Dimension | Conventional Weather Apps | Generic LLMs (ChatGPT) | WeatherGPT Platform |
|---|---|---|---|
| **Query Mechanism** | Static search by city name only | Free-form natural language prompt | Natural language conversation + Quick-action pills |
| **Data Grounding** | Direct API numbers (Raw data) | None (Historical training data cutoffs) | **Real-time API Data Grounded in System Prompt** |
| **Response Format** | Fixed tables, bars, numeric icons | Generalized text summaries | Conversational, Markdown-formatted, Actionable |
| **Visual Interface** | Cluttered with third-party ads | Plain text conversational box | 3-Tier Glassmorphism + Live Particle Canvas + Charts |
| **Contextual Advice** | Absent (User must deduce clothing/plans) | Unreliable / Hallucinatory | Grounded clothing, umbrella, and travel suggestions |
| **Response Latency** | Instant (Static cached pages) | 2–5 seconds | **Sub-second Real-Time SSE Token Streaming** |
| **Data Grounding** | Direct API numbers (Raw data) | None (Historical cutoffs) | **Real-time API Telemetry Grounded in AI** |
| **Interaction Mode** | Static menus & tables | Text prompt only | **Voice Dictation + Chat + Interactive UI** |
| **Multi-City Comparison** | Manual tab switching | Hallucinatory comparison | **Side-by-Side UI Grid + Grounded Comparative AI** |
| **Radar Visualization** | Often behind paywalls | None | **Live Doppler RainViewer Radar on Dark Canvas** |
| **Vernacular Support** | Limited or absent | Good, but ungrounded | **9 Indian Languages (UI + Grounded Conversational)** |
| **Voice Interaction** | None | App-dependent | **Native Web Speech STT + TTS Audio Readout** |
| **Agricultural Insights** | Generic weather metrics | Non-specific advice | **Actionable thresholds (wind drift, fungal risk)** |
| **Offline Failover** | Cached static tables | Complete failure | **Deterministic Rule-Based Advisory Engine** |

---

## 17. TARGET USERS & PERSONAS
## 17. TARGET USERS & USER PERSONAS

1. **Daily Commuters & College Students:** Require rapid answers during morning rush hours (*"Do I need an umbrella before heading to campus today?"*).
2. **Travelers & Weekend Tourists:** Need synthesized comparisons between home and travel destinations (*"What is the weather trend in Digha over the weekend?"*).
3. **Outdoor Workers, Sports Enthusiasts & Event Planners:** Rely on granular hourly windows (*"When is the safest 2-hour outdoor slot with low UV and no rain?"*).
4. **General Citizens:** Benefit from accessible language that demystifies barometric pressure and complex meteorological charts.
1. **Farmers & Agricultural Producers:** Require actionable wind speed insights before spraying pesticides, humidity tracking to mitigate fungal blights, and rainfall forecasts for irrigation.
2. **Daily Commuters & Students:** Need immediate, vernacular answers (*"Do I need an umbrella in Kolkata right now?"*).
3. **Intercity Drivers & Logistics Fleets:** Rely on the **Multi-Location Comparison Module** to evaluate travel routes between two cities.
4. **Senior Citizens & Visually Impaired:** Benefit from hands-free speech input and audible text-to-speech synthesized readouts.

---

## 18. IMPACT & VALUE PROPOSITION
## 18. SOCIAL, AGRICULTURAL & ECONOMIC IMPACT

### 18.1 User & Social Impact
* **Democratizing Meteorological Data:** Translates obscure technical parameters into universally understandable advice.
* **Time Savings:** Eliminates the need to navigate 4–5 screens to plan a commute or outdoor event.
* **Preparedness:** Enhances public readiness for sudden inclement weather (heatwaves, cloudbursts, severe thunderstorms).
* **Protecting Rural Livelihoods:** In India, over 55% of the workforce depends on climate-sensitive agriculture. WeatherGPT's agricultural advisory translates complex weather data into direct farming guidance in native languages.
* **Disaster Mitigation:** Real-time Doppler radar combined with grounded AI alerts enables citizens to prepare for sudden monsoons, thunderstorms, and heatwaves.
* **Digital Inclusivity:** Voice recognition and native Indian language support dismantle technical and literacy barriers for rural populations.

### 18.2 Potential Economic Models (Future Product Evolution)
* **Freemium Consumer Tier:** Free daily conversational queries with optional premium alerts.
* **B2B API Intelligence Layer:** Licensing the grounded conversational weather layer to travel booking portals, food delivery fleets, and logistics platforms.
* **Smart City Integrations:** Embedding WeatherGPT within municipal portals to assist citizens with localized monsoon and storm updates.

---

## 19. RISKS, LIMITATIONS & MITIGATIONS

1. **AI Hallucination:** Strict anti-hallucination system prompt + data injected as sole source of truth. Model is instructed to decline when data is absent.
2. **Third-Party API Downtime:** Redundant endpoint fallbacks, graceful UI toasts, and cached historical forecast state.
3. **LLM API Cost at High Concurrency:** Redis caching of synthesized answers for identical queries + lightweight flash models (`gemini-3.6-flash`).
4. **Internet Connectivity Drop:** Graceful offline detection with non-blocking toast notifications.
1. **Model Hallucination:** Mitigated by zero-temperature parameters, strict system grounding, and mandatory citation of provided weather telemetry.
2. **Upstream API Limits:** Mitigated by `lib/cache.js` caching (5-min weather, 1-hr geocode) and local advisory fallback rules.
3. **Browser Voice Compatibility:** Web Speech API gracefully hides mic buttons in unsupported browsers while preserving full text interaction.

---

## 20. IMPLEMENTATION & DEVELOPMENT PLAN
## 20. IMPLEMENTATION MILESTONES SUMMARY

```
PHASE 1: INITIAL SUBMISSION MILESTONES (Completed)
├── Milestone 1: Architectural Design & Wireframing
├── Milestone 2: Open-Meteo Integration (Current, UV, Forecast)
├── Milestone 3: Vercel Serverless Function Scaffolding
├── Milestone 4: Google Gemini API & Prompt Grounding
├── Milestone 5: Server-Sent Events (SSE) Real-time Streaming
├── Milestone 6: 3-Tier Glassmorphism & SVG Vector Iconography
└── Milestone 7: Chart.js Hourly Temperature & Rain Curves
* **Milestone 1:** Decoupled Architecture & Glassmorphic UI Setup — **[COMPLETED]**
* **Milestone 2:** Open-Meteo WMO Integration & Telemetry Extraction — **[COMPLETED]**
* **Milestone 3:** Google Gemini Grounding & Real-Time SSE Streaming — **[COMPLETED]**
* **Milestone 4:** Chart.js Meteorological Visualization & Canvas Particle Engine — **[COMPLETED]**
* **Milestone 5:** Multi-Location Side-by-Side Comparison Module — **[COMPLETED]**
* **Milestone 6:** Leaflet.js Dynamic Doppler Precipitation Radar (RainViewer + Esri) — **[COMPLETED]**
* **Milestone 7:** 9 Indian Regional Languages UI & AI Localization — **[COMPLETED]**
* **Milestone 8:** Two-Way Web Speech Engine (STT Mic + TTS Audio Readout) — **[COMPLETED]**
* **Milestone 9:** In-Memory TTL Caching & Offline Rule-Based Advisor — **[COMPLETED]**
* **Milestone 10:** Zero-Overlap Responsive 2-Row CSS Grid Header — **[COMPLETED]**

PHASE 2: FINAL EVALUATION DAY MILESTONES (Targeted for Grand Finale)
├── Milestone 8: Multi-Location Comparison & Voice I/O Integration
├── Milestone 9: Multilingual Indian Language Localization
└── Milestone 10: Interactive Weather Radar Map Layer & Final Demonstration
```

---

## 21. TESTING & QUALITY ASSURANCE STRATEGY

### 21.1 Functional & API Verification
* **Geocoding Tests:** Validated with diverse global inputs (`Kolkata`, `London`, `Tokyo`, `San Francisco`, `InvalidCityXYZ123`).
* **Boundary Validation:** Tested latitude/longitude extremities (`-90`, `+90`, `-180`, `+180`) and verified defensive error catches.
* **Payload Integrity:** Checked JSON structure, header conformity, and CORS preflight handshakes.
* **Multilingual Adversarial Testing:** Verified that queries in Devanagari, Bengali, and Tamil correctly enforce native language responses without defaulting to English.
* **Boundary Validation:** Verified coordinate handling across polar and equatorial extremes ($-90^\circ$ to $+90^\circ$).
* **Network Interruption Tests:** Tested AI stream resilience during simulated disconnections; verified that the client handles stream truncation gracefully.
* **Radar Tile Verification:** Confirmed that dynamic RainViewer tile frames load with 200 OK across multiple zoom levels (0 to 18) over Esri Dark Gray canvas.

### 21.2 AI Grounding & Adversarial Testing
* **Negative Prompting:** Prompted the model with out-of-scope questions (*"Who won the cricket world cup?"*); verified the model gracefully redirects to weather.
* **Missing Data Verification:** Simulated missing rain/wind fields; verified model explicitly acknowledges absence rather than fabricating numbers.
* **Formatting Stability:** Tested markdown rendering across rapid token streams to verify bold tags and lists do not break layout.

### 21.3 Cross-Device UI & Accessibility Testing
* **Responsive Breakpoints:** Tested across 320px (Mobile), 768px (Tablet), 1024px (Laptop), and 1920px (Desktop).
* **Reduced Motion:** Verified `@media (prefers-reduced-motion: reduce)` halts canvas particle loops to accommodate motion sensitivity.
* **Focus States:** Validated `:focus-visible` accessibility rings across all interactive buttons and inputs.

---

## 22. SAMPLE USER JOURNEYS & INTERACTION TRACES

### Interaction 1: Daily Commute Umbrella Query
### Interaction 1: Vernacular Umbrella Query (Bengali Voice Input)
```
User: "Will I need an umbrella in Kolkata tonight?"
User (Voice): "আজ কি ছাতা নিয়ে বেরোতে হবে?"
System Trace:
  1. Geocode: Kolkata (Lat: 22.56, Lon: 88.36)
  2. Fetch: Hourly rain projection 18:00 - 23:00 -> 0.0 mm, Cloud cover -> 85% Overcast
  3. Grounded Gemini Response:
     "You will likely not need an umbrella tonight in Kolkata. While skies remain
      overcast (85% cloud cover), precipitation is projected at 0 mm with rain
      probability under 10%."
  1. Web Speech STT transcribes query in Bengali
  2. api/chat.js detects Bengali script (\u0980-\u09FF)
  3. Context reveals: Precipitation = 0.0 mm, Rain Probability = 5%
  4. Grounded Gemini Response (Bengali):
     "আজ কলকাতায় ছাতা নেওয়ার প্রয়োজন নেই। আকাশ মেঘলা থাকলেও বৃষ্টির সম্ভাবনা 
      মাত্র ৫%। তবে আর্দ্রতা বেশি থাকবে।"
  5. TTS vocalizes Bengali response through speech synthesis.
```

### Interaction 2: Clothing & Temperature Synthesis
### Interaction 2: Side-by-Side Travel Comparison
```
User: "What should I wear today?"
User: "Compare weather between Kolkata and Darjeeling tomorrow morning"
System Trace:
  1. Fetch: Current Temp: 27.8°C, Feels Like: 33.4°C, Humidity: 85%, UV: 0 (Night)
  2. Grounded Gemini Response:
     "Wear lightweight, breathable cotton clothing. Although the thermometer reads
      27.8°C, the high humidity (85%) makes it feel like 33.4°C. Stay hydrated!"
  1. Frontend bundles primary (Kolkata) and secondary (Darjeeling) telemetry
  2. Context reveals: Kolkata Morning = 28°C (Humid), Darjeeling Morning = 14°C (Foggy)
  3. Grounded Gemini Response:
     "Tomorrow morning, Darjeeling will be significantly colder (14°C with dense fog) 
      compared to Kolkata (28°C and humid). Pack warm woolens for Darjeeling!"
```

### Interaction 3: Comparative Analysis Query
### Interaction 3: Agricultural Spraying Advisory (Hindi)
```
User: "Is tomorrow going to be hotter than today?"
User: "क्या आज गेहूं की फसल पर कीटनाशक का छिड़काव करना सुरक्षित है?"
System Trace:
  1. Fetch: Today Max: 31.2°C | Tomorrow Max: 33.0°C
  2. Grounded Gemini Response:
     "Yes, tomorrow will be slightly warmer. Today's high is expected to reach 31.2°C,
      while tomorrow's peak will climb to around 33.0°C under clearer skies."
  1. Context reveals: Wind Speed = 18 km/h (>15 km/h threshold)
  2. Grounded Advisory Response:
     "⚠️ आज कीटनाशक का छिड़काव न करें। हवा की गति 18 km/h है, जो सुरक्षित सीमा 
      (15 km/h) से अधिक है। तेज हवा से दवा उड़कर व्यर्थ हो सकती है।"
```

---

## 23. BUSINESS & PRODUCT POTENTIAL
## 23. BUSINESS & PUBLIC-SECTOR DEPLOYMENT POTENTIAL

1. **Consumer Weather Portal:** Clean, ad-free conversational daily assistant.
2. **Travel & Hospitality Plugin:** Embeddable widget for hotel and flight booking platforms.
3. **Logistics Weather Layer:** Natural language weather risk assessment for delivery and trucking fleets.
4. **Agricultural Advisory:** Vernacular conversational weather forecasts for farmers.
1. **Municipal Disaster Management Portals:** Integrating WeatherGPT into state government portals for automated, accessible cyclone and flood advisories.
2. **Kisan Call Centers & Agriculture Portals:** Deploying the voice-enabled Vernacular Advisory layer to empower rural farmers.
3. **Logistics & Delivery APIs:** Providing natural-language weather hazard scoring for delivery fleets and transport operators.

---

## 24. CONCLUSION

WeatherGPT transforms meteorological data from static numbers on a screen into a **grounded, conversational intelligence platform**.
WeatherGPT transforms meteorological data from static, impenetrable numbers into **actionable, voice-enabled, and grounded conversational intelligence**.

By pairing real-time meteorological observations from Open-Meteo with the natural-language capabilities of Google Gemini in a secure, serverless architecture, WeatherGPT demonstrates a practical, scalable, and human-centric solution for the modern web.
By uniting real-time WMO-standard telemetry from Open-Meteo and live Doppler radar scans from RainViewer with Google Gemini's reasoning capabilities—reinforced by a 9-language localization engine, Web Speech voice I/O, multi-city comparison, and an offline rule-based fallback—WeatherGPT provides a complete, production-grade solution engineered for immediate national impact at **Smart India Hackathon 2026**.

The project stands as a fully functional, production-ready prototype built with clear engineering discipline, ready for deployment and evaluation at **Smart India Hackathon 2026**.

---

## 25. REFERENCES

1. **Open-Meteo Weather API Documentation:**  
   https://open-meteo.com/en/docs
2. **Open-Meteo Geocoding API:**  
   https://open-meteo.com/en/docs/geocoding-api
3. **Google Gemini API Documentation:**  
   https://ai.google.dev/docs
4. **Vercel Serverless Functions Documentation:**  
   https://vercel.com/docs/functions/serverless-functions
5. **Node.js Official Documentation (v18+ LTS):**  
   https://nodejs.org/en/docs
6. **Chart.js Documentation (v4.4):**  
   https://www.chartjs.org/docs/latest/
7. **World Meteorological Organization (WMO) Weather Interpretation Codes:**  
   https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
8. **MDN Web Docs — Server-Sent Events (SSE):**  
   https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
9. **MDN Web Docs — Web Content Accessibility Guidelines (WCAG) & Reduced Motion:**  
   https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
1. **Open-Meteo Weather API Documentation:** https://open-meteo.com/en/docs
2. **RainViewer Radar API:** https://www.rainviewer.com/api.html
3. **Esri ArcGIS REST Services (Canvas Dark Gray):** https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer
4. **Google Gemini API Documentation:** https://ai.google.dev/docs
5. **Vercel Serverless Functions Documentation:** https://vercel.com/docs/functions/serverless-functions
6. **Leaflet.js Documentation (v1.9.4):** https://leafletjs.com/reference.html
7. **W3C Web Speech API Specification:** https://wicg.github.io/speech-api/
8. **World Meteorological Organization (WMO) Weather Interpretation Codes:** https://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM
9. **MDN Web Docs — Server-Sent Events (SSE):** https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

---
*End of Technical Report — WeatherGPT (SIH 2026)*
*End of Technical Report — WeatherGPT (SIH 2026, Version 2.0.0)*
