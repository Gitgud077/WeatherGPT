const { sendJson, handleOptions, setCorsHeaders } = require('../lib/http');
const { validateCoordinates } = require('../lib/weather');
const { getAirQualityData } = require('../lib/aqi');

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
    return sendJson(res, 400, { success: false, error: 'Invalid latitude or longitude.' });
  }

  try {
    const aqi = await getAirQualityData(coordinates.latitude, coordinates.longitude);
    return sendJson(res, 200, { success: true, aqi });
  } catch (err) {
    console.error('AQI API error:', err);
    return sendJson(res, 502, { success: false, error: 'Air quality data is temporarily unavailable.' });
  }
};
