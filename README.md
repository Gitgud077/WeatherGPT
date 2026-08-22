# WeatherGPT

Conversational weather assistant using Open-Meteo for weather data and Google Gemini for chat.

## Setup

1. Revoke any Gemini key that has been shared publicly and create a replacement in [Google AI Studio](https://aistudio.google.com/apikey).
2. Install dependencies:

	```bash
	npm install
	```

3. Create a local `.env` file from `.env.example` and set `GEMINI_API_KEY` to your replacement key. Never commit `.env`.
4. Start the local Vercel server:

	```bash
	npm run dev
	```

5. Open the URL printed by Vercel, usually `http://localhost:3000`.

## Deployment

Import the repository into Vercel, set `GEMINI_API_KEY` in the project Environment Variables, and deploy. The free Gemini API has rate limits, so production use should add rate limiting before sharing the app publicly.

`GEMINI_MODEL` defaults to `gemini-2.5-flash`; change it only to a model available to your Google AI Studio project.