# WeatherGPT

Conversational weather assistant using Open-Meteo for weather data and Google Gemini for chat.

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Install dependencies:

	```bash
	npm install
	```

3. Create a local `.env` file from `.env.example` and set `GEMINI_API_KEY` to your API key. (Never commit `.env`).
4. Start the local development server:

	```bash
	npm run dev
	```

5. Open `http://localhost:3000` in your browser.

## Vercel Deployment (Step-by-Step)

1. Push your changes to your GitHub repository (`main` branch).
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **"Add New..."** → **"Project"**.
3. Import your GitHub repository (`WeatherGPT`).
4. In **Project Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
5. Expand **Environment Variables** and add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key
   - `GEMINI_MODEL`: `gemini-3.6-flash` (optional, defaults to `gemini-3.6-flash`)
6. Click **Deploy**.

## Directory Layout

```text
index.html        # Main dashboard UI
script.js         # Frontend logic & Chart.js rendering
style.css         # Modern dark-mode styling
vercel.json       # Vercel deployment configuration
api/
  chat.js         # Conversational AI endpoint (Gemini + Open-Meteo context)
  weather.js      # Current weather endpoint
  forecast.js     # 7-day & hourly forecast endpoint
  geocode.js      # City geocoding endpoint
lib/
  http.js         # HTTP and CORS helpers
  weather.js      # Open-Meteo client & data parser
package.json
```