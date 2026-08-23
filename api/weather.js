const { sendJson, handleOptions, setCorsHeaders } = require('../lib/http');
const { validateCoordinates, getCurrentWeather } = require('../lib/weather');

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const lat = (req.query && req.query.lat) || url.searchParams.get('lat');
  const lon = (req.query && req.query.lon) || url.searchParams.get('lon');

  const coordinates = validateCoordinates(lat, lon);

  if (!coordinates) {
    return sendJson(res, 400, {
      success: false,
      error: 'Invalid latitude or longitude.'
    });
  }

  try {
    const current = await getCurrentWeather(coordinates.latitude, coordinates.longitude);
    return sendJson(res, 200, { success: true, current });
  } catch (error) {
    console.error('Current weather error:', error);
    return sendJson(res, 502, {
      success: false,
      error: 'Weather data is temporarily unavailable.'
    });
  }
};