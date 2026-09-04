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
  if (req.body) {
    if (typeof req.body === 'object') return req.body;
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch (err) {
        throw new Error('Invalid JSON string in body');
      }
    }
  }

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
  const daily = forecast.daily || {};
  const dailyDates = daily.date || [];
  const todayDate = current.time ? current.time.slice(0, 10) : null;

  const next7Days = dailyDates.slice(0, 7).map((date, i) => ({
    date,
    weather: mapWeatherCode(daily.weatherCode?.[i]),
    maxTemperature: daily.maxTemperature?.[i],
    minTemperature: daily.minTemperature?.[i],
    precipitationProbability: daily.precipitationProbability?.[i],
    rain: daily.rain?.[i],
    sunrise: daily.sunrise?.[i] || null,
    sunset: daily.sunset?.[i] || null
  }));

  let today = null;
  let tomorrow = null;

  if (todayDate) {
    const index = dailyDates.indexOf(todayDate);
    if (index !== -1) today = next7Days[index];
    if (index !== -1 && index + 1 < next7Days.length) {
      tomorrow = next7Days[index + 1];
    }
  }

  const hourlyTimes = forecast.hourly?.time || [];
  const currentHourPrefix = current.time ? current.time.slice(0, 13) : '';
  const foundHourIndex = hourlyTimes.findIndex((time) => time >= currentHourPrefix);
  const firstHour = foundHourIndex >= 0 ? foundHourIndex : 0;

  const next24Hours = hourlyTimes
    .slice(firstHour, firstHour + 24)
    .map((time, i) => {
      const sourceIndex = firstHour + i;
      return {
        time: time.slice(11, 16),
        temperature: forecast.hourly?.temperature?.[sourceIndex],
        precipitationProbability: forecast.hourly?.precipitationProbability?.[sourceIndex],
        weather: mapWeatherCode(forecast.hourly?.weatherCode?.[sourceIndex])
      };
    });

  return {
    location: {
      name: location.name,
      country: location.country || '',
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
      uvIndex: current.uvIndex,
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

async function streamGemini(apiKey, userMessage, conversation, weatherContext, res) {
  // Build sanitized conversation history with alternating roles
  const contents = [];
  let lastRole = null;

  for (const entry of conversation) {
    const role = entry.role === 'assistant' ? 'model' : 'user';
    const text = String(entry.content || '').trim();
    if (!text) continue;

    if (role === lastRole && contents.length > 0) {
      contents[contents.length - 1].parts[0].text += `\n${text}`;
    } else {
      contents.push({ role, parts: [{ text }] });
      lastRole = role;
    }
  }

  // Ensure last message is from user
  if (lastRole === 'user') {
    contents[contents.length - 1].parts[0].text += `\n${userMessage}`;
  } else {
    contents.push({ role: 'user', parts: [{ text: userMessage }] });
  }

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const fallbackModels = [primaryModel, 'gemini-3.7-flash', 'gemini-flash-latest'].filter(
    (m, idx, arr) => arr.indexOf(m) === idx
  );

  let lastError = null;

  for (const model of fallbackModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
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
        console.warn(`Gemini streaming error on model ${model}:`, response.status, errorText);
        lastError = new Error(`Gemini request failed (${response.status})`);
        continue;
      }

      // Start SSE stream to client
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
        'Access-Control-Allow-Origin': '*'
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const parts = parsed.candidates?.[0]?.content?.parts || [];
            for (const part of parts) {
              if (!part.thought && part.text) {
                res.write(`data: ${JSON.stringify({ text: part.text })}\n\n`);
              }
            }
          } catch (e) {
            // Partial JSON chunk
          }
        }
      }

      res.write(`data: [DONE]\n\n`);
      res.end();
      return;
    } catch (err) {
      console.warn(`Gemini streaming error on model ${model}:`, err.message);
      lastError = err;
    }
  }

  if (!res.headersSent) {
    throw lastError || new Error('All Gemini models failed to respond.');
  } else {
    res.write(`data: ${JSON.stringify({ error: lastError?.message || 'Streaming interrupted' })}\n\n`);
    res.end();
  }
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
      error: 'WeatherGPT is not configured with a Gemini API key.'
    });
  }

  try {
    const current = await getCurrentWeather(coordinates.latitude, coordinates.longitude);
    const forecast = await getForecastData(coordinates.latitude, coordinates.longitude);
    const weatherContext = buildWeatherContext(location, current, forecast);

    await streamGemini(apiKey, message, conversation, weatherContext, res);
  } catch (error) {
    console.error('Chat handler error:', error);
    if (!res.headersSent) {
      return sendJson(res, 502, {
        success: false,
        error: 'WeatherGPT is having trouble responding right now. Please try again shortly.'
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'WeatherGPT encountered an error while streaming.' })}\n\n`);
      res.end();
    }
  }
};