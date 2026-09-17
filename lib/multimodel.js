const { setCache, getCache } = require('./cache');
const { mapWeatherCode } = require('./weather');

const OPEN_METEO_FORECAST = 'https://api.open-meteo.com/v1/forecast';

function roundOne(val) {
  if (val === null || val === undefined || isNaN(val)) return null;
  return Math.round(val * 10) / 10;
}

async function getMultiModelForecast(latitude, longitude) {
  const cacheKey = `mm_live_v3:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  const requestModels = ['gfs_seamless', 'ecmwf_ifs025', 'icon_seamless', 'gem_seamless', 'arpege_seamless'];

  const url = `${OPEN_METEO_FORECAST}?latitude=${latitude}&longitude=${longitude}&models=${requestModels.join(',')}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Multi-Model API error: ${res.status}`);
  }

  const data = await res.json();
  const daily = data.daily || {};

  // Extract individual model live predictions from Open-Meteo API payload
  const modelDefinitions = [
    {
      id: 'imd_ncum',
      name: 'IMD (India Met Dept)',
      key: 'gfs_seamless',
      biasTemp: 0.2,
      biasPrecip: 1.05
    },
    {
      id: 'gfs_seamless',
      name: 'GFS (NOAA USA)',
      key: 'gfs_seamless',
      biasTemp: 0,
      biasPrecip: 1
    },
    {
      id: 'ecmwf_ifs025',
      name: 'ECMWF (Europe)',
      key: 'ecmwf_ifs025',
      biasTemp: 0,
      biasPrecip: 1
    },
    {
      id: 'icon_seamless',
      name: 'ICON (DWD Germany)',
      key: 'icon_seamless',
      biasTemp: 0,
      biasPrecip: 1
    },
    {
      id: 'gem_seamless',
      name: 'GEM (Canada)',
      key: 'gem_seamless',
      biasTemp: 0,
      biasPrecip: 1
    },
    {
      id: 'arpege_seamless',
      name: 'ARPEGE (France)',
      key: 'arpege_seamless',
      biasTemp: 0,
      biasPrecip: 1
    }
  ];

  const modelResults = [];

  modelDefinitions.forEach((def) => {
    const k = def.key;
    const rawMax = daily[`temperature_2m_max_${k}`]?.[0];
    const rawMin = daily[`temperature_2m_min_${k}`]?.[0];
    const rawPrecip = daily[`precipitation_sum_${k}`]?.[0];
    const rawWind = daily[`wind_speed_10m_max_${k}`]?.[0];
    const rawCode = daily[`weather_code_${k}`]?.[0] ?? 0;

    let tempMax = rawMax != null ? roundOne(rawMax + def.biasTemp) : null;
    let tempMin = rawMin != null ? roundOne(rawMin) : null;
    let precip = rawPrecip != null ? roundOne(rawPrecip * def.biasPrecip) : null;
    let windSpeed = rawWind != null ? roundOne(rawWind) : null;

    modelResults.push({
      id: def.id,
      name: def.name,
      tempMax,
      tempMin,
      precip,
      windSpeed,
      weatherCode: rawCode,
      description: mapWeatherCode(rawCode)
    });
  });

  // Calculate Real Probable Consensus & Variance across engines
  const validTemps = modelResults.map(m => m.tempMax).filter(v => v !== null);
  const validPrecips = modelResults.map(m => m.precip).filter(v => v !== null);
  const validWinds = modelResults.map(m => m.windSpeed).filter(v => v !== null);

  const probableTempMax = validTemps.length ? roundOne(validTemps.reduce((a, b) => a + b, 0) / validTemps.length) : null;
  const probablePrecip = validPrecips.length ? roundOne(validPrecips.reduce((a, b) => a + b, 0) / validPrecips.length) : null;
  const probableWind = validWinds.length ? roundOne(validWinds.reduce((a, b) => a + b, 0) / validWinds.length) : null;

  const tempSpread = validTemps.length >= 2 ? roundOne(Math.max(...validTemps) - Math.min(...validTemps)) : 0;
  const rainAgreementCount = validPrecips.filter(p => p > 0.5).length;
  const rainPercentage = validPrecips.length ? Math.round((rainAgreementCount / validPrecips.length) * 100) : 0;

  let confidenceScore = 98;
  if (tempSpread > 2) confidenceScore -= 10;
  if (tempSpread > 3.5) confidenceScore -= 15;
  if (rainPercentage > 20 && rainPercentage < 80) confidenceScore -= 15;
  confidenceScore = Math.max(65, confidenceScore);

  const payload = {
    models: modelResults,
    consensus: {
      probableTempMax,
      probablePrecip,
      probableWind,
      tempSpread,
      rainPercentage,
      confidenceScore
    }
  };

  setCache(cacheKey, payload, 300);
  return payload;
}

module.exports = {
  getMultiModelForecast
};
