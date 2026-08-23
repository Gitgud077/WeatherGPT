const { sendJson, handleOptions, setCorsHeaders } = require('../lib/http');
const { geocodeCity } = require('../lib/weather');

module.exports = async function handler(req, res) {
  if (handleOptions(req, res)) return;
  setCorsHeaders(res);

  if (req.method !== 'GET') {
    return sendJson(res, 405, { success: false, error: 'Method not allowed.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const city = (req.query && req.query.city) || url.searchParams.get('city');

  if (!city || city.trim().length < 2) {
    return sendJson(res, 400, {
      success: false,
      error: 'Please provide a valid city name.'
    });
  }

  try {
    const location = await geocodeCity(city.trim());

    if (!location) {
      return sendJson(res, 404, {
        success: false,
        error: "We couldn't find that location."
      });
    }

    return sendJson(res, 200, { success: true, location });
  } catch (error) {
    console.error('Geocode error:', error);
    return sendJson(res, 502, {
      success: false,
      error: 'Weather data is temporarily unavailable.'
    });
  }
};