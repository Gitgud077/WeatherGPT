const { setCache, getCache } = require('./cache');

const OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';

const weatherCodeMap = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Light snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

function mapWeatherCode(code) {
  return weatherCodeMap[code] || 'Unknown weather condition';
}

function roundOne(value) {
  if (value === null || value === undefined) return null;
  return Math.round(value * 10) / 10;
}

function validateCoordinates(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;

  return { latitude, longitude };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }
  return response.json();
}

function mapGeocodeResult(result) {
  return {
    name: result.name,
    country: result.country || '',
    admin1: result.admin1 || '',
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone || 'auto'
  };
}

async function geocodeCity(city, count = 1) {
  const cacheKey = `geo:${city.toLowerCase().trim()}:${count}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const limited = Math.min(Math.max(Number(count) || 1, 1), 10);
  const url = `${OPEN_METEO_GEOCODING}?name=${encodeURIComponent(city)}&count=${limited}&language=en&format=json`;
  const data = await fetchJson(url);
  const results = (data.results || []).map(mapGeocodeResult);

  if (!results.length) return null;

  const payload = {
    location: results[0],
    results
  };

  setCache(cacheKey, payload, 3600); // 1 hour TTL for geocoding
  return payload;
}

async function getCurrentWeather(latitude, longitude) {
  const cacheKey = `cur:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${OPEN_METEO_FORECAST}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,uv_index,surface_pressure,visibility&hourly=uv_index,visibility&daily=sunrise,sunset,uv_index_max&timezone=auto&forecast_days=1`;

  const data = await fetchJson(url);

  if (!data.current) {
    throw new Error('Invalid current weather data');
  }

  const current = data.current;
  const daily = data.daily || {};

  const payload = {
    time: current.time,
    temperature: roundOne(current.temperature_2m),
    feelsLike: roundOne(current.apparent_temperature),
    humidity: roundOne(current.relative_humidity_2m),
    windSpeed: roundOne(current.wind_speed_10m),
    windDirection: roundOne(current.wind_direction_10m),
    precipitation: roundOne(current.precipitation),
    rain: roundOne(current.rain),
    uvIndex: roundOne(current.uv_index ?? data.hourly?.uv_index?.[0]),
    weatherCode: current.weather_code,
    weatherDescription: mapWeatherCode(current.weather_code),
    isDay: current.is_day === 1,
    pressure: roundOne(current.surface_pressure),
    visibility: roundOne(current.visibility ?? data.hourly?.visibility?.[0]),
    sunrise: daily.sunrise?.[0] || null,
    sunset: daily.sunset?.[0] || null,
    maxUvIndex: roundOne(daily.uv_index_max?.[0]),
    timezone: data.timezone || 'auto'
  };

  setCache(cacheKey, payload, 300); // 5 minutes TTL for current weather
  return payload;
}

async function getForecastData(latitude, longitude) {
  const cacheKey = `fc:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${OPEN_METEO_FORECAST}?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,apparent_temperature,precipitation_probability,rain,weather_code,wind_speed_10m,wind_direction_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,rain_sum,sunrise,sunset,uv_index_max&timezone=auto&forecast_days=7`;

  const data = await fetchJson(url);
  const hourly = data.hourly || {};
  const daily = data.daily || {};

  const payload = {
    timezone: data.timezone || 'auto',
    hourly: {
      time: hourly.time || [],
      temperature: (hourly.temperature_2m || []).map(roundOne),
      apparentTemperature: (hourly.apparent_temperature || []).map(roundOne),
      precipitationProbability: (hourly.precipitation_probability || []).map(roundOne),
      rain: (hourly.rain || []).map(roundOne),
      uvIndex: (hourly.uv_index || []).map(roundOne),
      weatherCode: hourly.weather_code || [],
      windSpeed: (hourly.wind_speed_10m || []).map(roundOne),
      windDirection: (hourly.wind_direction_10m || []).map(roundOne)
    },
    daily: {
      date: daily.time || [],
      weatherCode: daily.weather_code || [],
      maxTemperature: (daily.temperature_2m_max || []).map(roundOne),
      minTemperature: (daily.temperature_2m_min || []).map(roundOne),
      precipitationProbability: (daily.precipitation_probability_max || []).map(roundOne),
      rain: (daily.rain_sum || []).map(roundOne),
      maxUvIndex: (daily.uv_index_max || []).map(roundOne),
      sunrise: daily.sunrise || [],
      sunset: daily.sunset || []
    }
  };

  setCache(cacheKey, payload, 300); // 5 minutes TTL for forecast
  return payload;
}

module.exports = {
  mapWeatherCode,
  validateCoordinates,
  geocodeCity,
  getCurrentWeather,
  getForecastData
};