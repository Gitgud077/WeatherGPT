const { sendJson, handleOptions, setCorsHeaders } = require('../lib/http');
const {
  validateCoordinates,
  getCurrentWeather,
  getForecastData,
  mapWeatherCode
} = require('../lib/weather');

const SYSTEM_PROMPT = `You are WeatherGPT, a conversational weather assistant.
You must NEVER invent, guess, or assume weather information.
Use only the provided Weather Data to answer weather questions.
If required data is missing or unavailable, say you cannot reliably answer.
You can give practical suggestions like carrying an umbrella, but do not provide medical, safety, or legal guarantees.
Be concise, warm, and helpful. Use Celsius by default.`;

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 1_000_000) {
      throw new Error('Request too large');
    }
  }
  if (!body) return {};
  return JSON.parse(body);
}

function buildWeatherContext(location, current, forecast) {
  const daily = forecast.daily;
  const todayDate = current.time ? current.time.slice(0, 10) : null;

  const next7Days = daily.date.slice(0, 7).map((date, i) => ({
    date,
    weather: mapWeatherCode(daily.weatherCode[i]),
    maxTemperature: daily.maxTemperature[i],
    minTemperature: daily.minTemperature[i],
    precipitationProbability: daily.precipitationProbability[i],
    rain: daily.rain[i],
    sunrise: daily.sunrise[i] || null,
    sunset: daily.sunset[i] || null
  }));

  let today = null;
  let tomorrow = null;

  if (todayDate) {
    const index = daily.date.indexOf(todayDate);
    if (index !== -1) today = next7Days[index];
    if (index !== -1 && index + 1 < next7Days.length) {
      tomorrow = next7Days[index + 1];
    }
  }

  const currentHour = forecast.hourly.time.findIndex((time) => time >= current.time?.slice(0, 13));
  const firstHour = currentHour >= 0 ? currentHour : 0;
  const next24Hours = forecast.hourly.time
    .slice(firstHour, firstHour + 24)
    .map((time, i) => {
      const sourceIndex = firstHour + i;
      return {
        time: time.slice(11, 16),
        temperature: forecast.hourly.temperature[sourceIndex],
        precipitationProbability: forecast.hourly.precipitationProbability[sourceIndex],
        weather: mapWeatherCode(forecast.hourly.weatherCode[sourceIndex])
      };
    });

  return {
    location: {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: current.timezone || location.timezone || 'auto'
    },
    current: {
      time: current.time,
      temperature: current.temperature,
      feelsLike: current.feelsLike,
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      windDirection: current.windDirection,
      precipitation: current.precipitation,
      rain: current.rain,
      weather: current.weatherDescription,
      isDay: current.isDay,
      sunrise: current.sunrise,
      sunset: current.sunset
    },
    forecast: {
      today,
      tomorrow,
      next7Days,
      next24Hours
    }
  };
}

async function callGemini(apiKey, userMessage, conversation, weatherContext) {
  const contents = [
    ...conversation.map((entry) => ({
      role: entry.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: entry.content }]
    })),
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: `${SYSTEM_PROMPT}\n\nWeather data (source of truth):\n${JSON.stringify(weatherContext, null, 2)}`
        }]
      },
      contents,
      generationConfig: { temperature: 0.4 }
    })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error:', response.status, errorText);
    throw new Error('Gemini request failed');
  }

  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!answer) {
    throw new Error('Gemini returned an empty response');
  }

  return answer;
}

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed.' });
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    return sendJson(res, 400, { success: false, error: 'Invalid JSON body.' });
  }

  const message = typeof payload.message === 'string' ? payload.message.trim() : '';
  if (!message || message.length > 500) {
    return sendJson(res, 400, {
      success: false,
      error: 'Please provide a valid message.'
    });
  }

  const location = payload.location;
  if (!location || !location.name || location.latitude == null || location.longitude == null) {
    return sendJson(res, 400, {
      success: false,
      error: 'Location information is required.'
    });
  }

  const coordinates = validateCoordinates(location.latitude, location.longitude);
  if (!coordinates) {
    return sendJson(res, 400, {
      success: false,
      error: 'Invalid location coordinates.'
    });
  }

  const rawConversation = Array.isArray(payload.conversation)
    ? payload.conversation.slice(-10)
    : [];

  const conversation = rawConversation
    .map((entry) => ({
      role: entry?.role === 'assistant' ? 'assistant' : 'user',
      content: String(entry?.content || '').slice(0, 1000)
    }))
    .filter((entry) => entry.content);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      success: false,
      error: 'WeatherGPT is having trouble responding right now.'
    });
  }

  try {
    const current = await getCurrentWeather(coordinates.latitude, coordinates.longitude);
    const forecast = await getForecastData(coordinates.latitude, coordinates.longitude);
    const weatherContext = buildWeatherContext(location, current, forecast);

    const answer = await callGemini(apiKey, message, conversation, weatherContext);

    return sendJson(res, 200, { success: true, answer });
  } catch (error) {
    console.error('Chat error:', error);
    return sendJson(res, 502, {
      success: false,
      error: 'WeatherGPT is having trouble responding right now.'
    });
  }
};