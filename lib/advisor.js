function buildLocalAdvisory(message, location, weather) {
  const cityName = location?.name || 'your location';
  const q = String(message || '').toLowerCase();
  const temp = weather?.temperature;
  const feels = weather?.feelsLike;
  const humidity = weather?.humidity;
  const wind = weather?.windSpeed;
  const uv = weather?.uvIndex;
  const desc = weather?.weatherDescription || '';
  const rainMm = weather?.rain ?? weather?.precipitation ?? 0;
  const pressure = weather?.pressure;
  const vis = weather?.visibility;
  const rainProb = weather?.rainProbability ?? 0;

  if (['rain', 'umbrella', 'wet', 'drizzle', 'shower'].some((k) => q.includes(k))) {
    const raining = rainMm > 0 || rainProb > 50 || /rain|drizzle|shower/i.test(desc);
    return (
      `🌧️ **Rain Forecast for ${cityName}:**\n\n` +
      `Current conditions: **${desc}** · Precipitation: **${rainMm} mm** · Chance: **${rainProb}%**.\n\n` +
      `${raining ? '⚠️ Rain is likely — carry an umbrella.' : '✅ No significant rain expected right now, but check the 24-hour forecast for changes.'}\n\n` +
      `Wind speed is **${wind} km/h** — a compact foldable umbrella is best in gusty conditions.`
    );
  }

  if (['wear', 'outfit', 'clothes', 'dress', 'jacket'].some((k) => q.includes(k))) {
    let advice = 'Check the current temperature in the dashboard for the best clothing recommendation.';
    if (typeof temp === 'number') {
      if (temp >= 35) advice = 'Very hot — wear light, breathable cotton or linen. Stay hydrated and avoid dark colours.';
      else if (temp >= 28) advice = 'Warm — a light t-shirt and shorts or a summer dress work great.';
      else if (temp >= 20) advice = 'Comfortable — a light shirt or blouse with trousers is ideal.';
      else if (temp >= 12) advice = 'Cool — layer up with a light jacket or hoodie.';
      else advice = "Cold — wear warm layers, a coat, and don't forget gloves if it's windy.";
    }
    const uvNote = typeof uv === 'number' && uv >= 3 ? '🕶️ Sunscreen recommended!' : 'UV levels are low today.';
    return (
      `👔 **Outfit Advice for ${cityName}:**\n\n` +
      `Temperature: **${temp}°C** (feels like **${feels}°C**) · ${desc}\n\n` +
      `${advice}\n\n` +
      `UV Index: **${uv}** — ${uvNote}`
    );
  }

  if (['farm', 'crop', 'agriculture', 'pesticide', 'irrigat', 'plant', 'harvest', 'spray'].some((k) => q.includes(k))) {
    return (
      `🌾 **Agricultural Advisory for ${cityName}:**\n\n` +
      `Current: **${desc}** · Temp: **${temp}°C** · Humidity: **${humidity}%** · Wind: **${wind} km/h**\n\n` +
      `**Pesticide/Spraying:** ${typeof wind === 'number' && wind > 15 ? '⚠️ Wind speed exceeds a safe threshold (>15 km/h). Avoid spraying to prevent drift.' : '✅ Wind speed is suitable for spraying operations.'}\n\n` +
      `**Fungal Risk:** ${typeof humidity === 'number' && humidity > 80 ? '🔴 High humidity raises fungal disease risk. Consider preventive fungicide.' : '🟢 Humidity is within acceptable range for most crops.'}\n\n` +
      `**Irrigation:** ${typeof rainMm === 'number' && rainMm > 0 ? '💧 Rainfall recorded — reduce irrigation accordingly.' : '🚿 No rain recorded — check soil moisture and irrigate as needed.'}`
    );
  }

  if (['uv', 'sun', 'sunscreen', 'sunburn'].some((k) => q.includes(k))) {
    let uvAdvice = 'UV data is unavailable for a detailed advisory.';
    if (typeof uv === 'number') {
      if (uv <= 2) uvAdvice = '🟢 UV is **Low** — minimal protection needed.';
      else if (uv <= 5) uvAdvice = '🟡 UV is **Moderate** — wear sunscreen SPF 30+ if outdoors for extended periods.';
      else if (uv <= 7) uvAdvice = '🟠 UV is **High** — sunscreen SPF 50+, hat, and UV-blocking sunglasses recommended.';
      else if (uv <= 10) uvAdvice = '🔴 UV is **Very High** — limit midday sun exposure, use full protection.';
      else uvAdvice = '🟣 UV is **Extreme** — avoid outdoor exposure between 10 AM–4 PM. Full protection required.';
    }
    return `☀️ **UV & Sun Advisory for ${cityName}:**\n\nCurrent UV Index: **${uv}** · Conditions: **${desc}**\n\n${uvAdvice}`;
  }

  if (['wind', 'storm', 'gust', 'cyclone', 'hurricane'].some((k) => q.includes(k))) {
    let windAdvice = 'Wind data is unavailable.';
    if (typeof wind === 'number') {
      if (wind < 20) windAdvice = '✅ Light breeze — no wind hazards expected.';
      else if (wind < 40) windAdvice = '🟡 Moderate winds — outdoor activities are fine but secure loose items.';
      else if (wind < 60) windAdvice = '🟠 Strong winds — avoid setting up temporary structures. Cyclists and motorcyclists should be cautious.';
      else windAdvice = '🔴 Severe winds — avoid unnecessary travel. Risk of fallen trees and structural damage.';
    }
    return `💨 **Wind Advisory for ${cityName}:**\n\nCurrent wind speed: **${wind} km/h** · Conditions: **${desc}**\n\n${windAdvice}`;
  }

  if (['humidity', 'humid', 'dry', 'muggy'].some((k) => q.includes(k))) {
    let humidityAdvice = 'Humidity data is unavailable.';
    if (typeof humidity === 'number') {
      if (humidity < 30) humidityAdvice = '🏜️ Very dry air — stay hydrated, use a humidifier indoors, and apply moisturiser.';
      else if (humidity < 60) humidityAdvice = '✅ Comfortable humidity — ideal conditions for most activities.';
      else if (humidity < 80) humidityAdvice = '🟡 Moderately humid — you may feel sticky outdoors. Light breathable clothing helps.';
      else humidityAdvice = '🔴 Very high humidity — expect muggy conditions. Risk of heat exhaustion if combined with high temperatures.';
    }
    return `💧 **Humidity Report for ${cityName}:**\n\nRelative Humidity: **${humidity}%** · Feels Like: **${feels}°C**\n\n${humidityAdvice}`;
  }

  if (['pressure', 'barometric'].some((k) => q.includes(k))) {
    const pressureNote = typeof pressure === 'number' && pressure < 1009
      ? '🔽 Low pressure — often associated with unsettled or stormy weather ahead.'
      : '🔼 Normal to high pressure — generally indicates stable, fair weather.';
    return `🌡️ **Pressure Reading for ${cityName}:**\n\nSurface Pressure: **${pressure} hPa** · Conditions: **${desc}**\n\n${pressureNote}`;
  }

  if (['visibility', 'fog', 'mist', 'haze', 'smog'].some((k) => q.includes(k))) {
    const visKm = typeof vis === 'number' ? Math.round((vis / 1000) * 10) / 10 : vis;
    const visNote = typeof vis === 'number' && vis < 2000
      ? '⚠️ Poor visibility — drive slowly with headlights on. Avoid high-speed roads in fog.'
      : '✅ Good visibility — safe for driving and outdoor activities.';
    return `👁️ **Visibility Report for ${cityName}:**\n\nVisibility: **${visKm} km** · Conditions: **${desc}**\n\n${visNote}`;
  }

  if (['temperature', 'temp', 'hot', 'cold', 'heat', 'freeze'].some((k) => q.includes(k))) {
    let tempAdvice = '';
    if (typeof temp === 'number') {
      if (temp >= 40) tempAdvice = '🔴 **Extreme Heat** — stay indoors during peak hours, drink plenty of water, and check on elderly neighbours.';
      else if (temp >= 35) tempAdvice = '🟠 **Very Hot** — limit strenuous outdoor activity between 11 AM and 3 PM.';
      else if (temp >= 25) tempAdvice = '🟡 **Warm** — pleasant conditions. Stay hydrated if active outdoors.';
      else if (temp >= 15) tempAdvice = '✅ **Comfortable** — ideal weather for outdoor activities.';
      else if (temp >= 5) tempAdvice = '🔵 **Cool** — layer up, especially in the morning and evening.';
      else tempAdvice = '❄️ **Cold/Freezing** — risk of frost. Protect pipes, plants, and dress in thermal layers.';
    }
    return `🌡️ **Temperature Summary for ${cityName}:**\n\nCurrent: **${temp}°C** · Feels Like: **${feels}°C** · ${desc}\n\n${tempAdvice}`;
  }

  return (
    `🌦️ **Weather Summary for ${cityName}:**\n\n` +
    `**${desc}** · ${temp}°C (feels like ${feels}°C)\n` +
    `💧 Humidity: ${humidity}% · 💨 Wind: ${wind} km/h · ☀️ UV: ${uv}\n\n` +
    'You can ask me about rain, outfits, farming, UV, wind, fog, or temperature safety.'
  );
}

function streamText(res, text) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  const tokens = String(text).split(' ');
  for (const token of tokens) {
    res.write(`data: ${JSON.stringify({ text: `${token} ` })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
}

module.exports = { buildLocalAdvisory, streamText };
