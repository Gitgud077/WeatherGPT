# WeatherGPT

Standalone Node.js weather app for Vercel: Open-Meteo for weather, Google Gemini for chat (with a local advisory fallback).

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey) (optional; chat still works with the local advisor).
2. Install dependencies:

	```bash
	npm install
	```

3. Create a local `.env` file from `.env.example` and set `GEMINI_API_KEY`. Never commit `.env`.
4. Start the local development server:

	```bash
	npm run dev
	```

5. Open `http://localhost:3000` in your browser.

## Vercel Deployment

1. Push the repo to GitHub.
2. Import the project in the [Vercel Dashboard](https://vercel.com/dashboard).
3. Framework Preset: Other. Root Directory: `./`.
4. Add environment variables:
   - `GEMINI_API_KEY`: Google AI Studio key
   - `GEMINI_MODEL`: `gemini-3.6-flash` (optional)
5. Deploy.

## Directory Layout

```text
index.html        # Dashboard UI
script.js         # Frontend logic, autocomplete, assistant drawer
style.css         # Dark glass styling
logo.png          # Brand asset
server.js         # Local static + API server
vercel.json       # Vercel config
api/
  chat.js         # Gemini chat + local advisory fallback
  weather.js      # Current weather
  forecast.js     # Hourly + 7-day forecast
  geocode.js      # City search / autocomplete
lib/
  http.js         # CORS helpers
  weather.js      # Open-Meteo client
  advisor.js      # Keyword weather advisories (no Gemini required)
```
