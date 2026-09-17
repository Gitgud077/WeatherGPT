const { setCache, getCache } = require('./cache');

const OPEN_METEO_AIR_QUALITY = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function roundOne(val) {
  if (val === null || val === undefined) return null;
  return Math.round(val * 10) / 10;
}

function getAqiCategory(usAqi) {
  if (usAqi == null) return { status: 'Unknown', color: '#94a3b8', level: 'unknown', advice: 'Air quality data is currently unavailable.' };
  const score = Math.round(usAqi);
  if (score <= 50) {
    return {
      status: 'Good',
      color: '#22c55e',
      level: 'good',
      advice: 'Air quality is satisfactory, and air pollution poses little or no risk. Enjoy outdoor activities!'
    };
  }
  if (score <= 100) {
    return {
      status: 'Moderate',
      color: '#eab308',
      level: 'moderate',
      advice: 'Air quality is acceptable. However, unusually sensitive people should consider reducing prolonged outdoor exertion.'
    };
  }
  if (score <= 150) {
    return {
      status: 'Unhealthy for Sensitive Groups',
      color: '#f97316',
      level: 'sensitive',
      advice: 'Members of sensitive groups (children, elderly, asthmatics) may experience health effects. Wear a mask outdoors.'
    };
  }
  if (score <= 200) {
    return {
      status: 'Unhealthy',
      color: '#ef4444',
      level: 'unhealthy',
      advice: 'Everyone may begin to experience health effects. Limit prolonged outdoor activities and wear an N95 mask.'
    };
  }
  if (score <= 300) {
    return {
      status: 'Very Unhealthy',
      color: '#a855f7',
      level: 'very-unhealthy',
      advice: 'Health alert: everyone may experience more serious health effects. Avoid outdoor exertion and keep windows closed.'
    };
  }
  return {
    status: 'Hazardous',
    color: '#881337',
    level: 'hazardous',
    advice: 'Health warning of emergency conditions. Everyone should remain indoors and use air purifiers.'
  };
}

async function getAirQualityData(latitude, longitude) {
  const cacheKey = `aqi:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const url = `${OPEN_METEO_AIR_QUALITY}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Air Quality API error: ${res.status}`);
  }
  const data = await res.json();
  const cur = data.current || {};

  const usAqi = roundOne(cur.us_aqi);
  const categoryInfo = getAqiCategory(usAqi);

  const payload = {
    usAqi,
    status: categoryInfo.status,
    color: categoryInfo.color,
    level: categoryInfo.level,
    advice: categoryInfo.advice,
    pollutants: {
      pm25: roundOne(cur.pm2_5),
      pm10: roundOne(cur.pm10),
      no2: roundOne(cur.nitrogen_dioxide),
      so2: roundOne(cur.sulphur_dioxide),
      o3: roundOne(cur.ozone),
      co: roundOne(cur.carbon_monoxide),
      dust: roundOne(cur.dust)
    },
    time: cur.time
  };

  setCache(cacheKey, payload, 300); // 5 minutes TTL
  return payload;
}

module.exports = {
  getAirQualityData,
  getAqiCategory
};
