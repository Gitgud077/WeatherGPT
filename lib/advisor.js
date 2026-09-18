function buildLocalAdvisory(message, location, weather, language = 'en') {
  const cityName = location?.name || 'your location';
  const q = String(message || '').toLowerCase();

  const temp = weather?.temperature;
  const feels = weather?.feelsLike;
  const humidity = weather?.humidity;
  const wind = weather?.windSpeed;
  const uv = weather?.uvIndex;
  const desc = weather?.weatherDescription || 'Clear';
  const rainMm = weather?.rain ?? weather?.precipitation ?? 0;
  const pressure = weather?.pressure;
  const vis = weather?.visibility;
  const rainProb = weather?.rainProbability ?? 0;

  const forecast = weather?.forecast || {};
  const todayFc = forecast.today || {};
  const tomorrowFc = forecast.tomorrow || {};
  const next7Days = forecast.next7Days || [];
  const next24Hours = forecast.next24Hours || [];

  // Helper to get coolest and warmest hour from 24h forecast
  let coolestHour = null;
  let warmestHour = null;

  if (next24Hours.length > 0) {
    let minTemp = Infinity;
    let maxTemp = -Infinity;

    for (const h of next24Hours) {
      if (typeof h.temperature === 'number') {
        if (h.temperature < minTemp) {
          minTemp = h.temperature;
          coolestHour = h;
        }
        if (h.temperature > maxTemp) {
          maxTemp = h.temperature;
          warmestHour = h;
        }
      }
    }
  }

  // --- 1. Tomorrow / Daily Forecast Queries ---
  if (['tomorrow', 'कल', 'আগামীকাল'].some((k) => q.includes(k))) {
    const tWeather = tomorrowFc.weather || desc;
    const tMax = tomorrowFc.maxTemperature != null ? Math.round(tomorrowFc.maxTemperature) : '--';
    const tMin = tomorrowFc.minTemperature != null ? Math.round(tomorrowFc.minTemperature) : '--';
    const tPrecip = tomorrowFc.precipitationProbability != null ? tomorrowFc.precipitationProbability : 0;
    const tRain = tomorrowFc.rain != null ? tomorrowFc.rain : 0;

    let tempCompEn = '';
    let tempCompHi = '';
    let tempCompBn = '';

    if (typeof temp === 'number' && typeof tomorrowFc.maxTemperature === 'number') {
      const diff = Math.round(tomorrowFc.maxTemperature - temp);
      if (diff > 2) {
        tempCompEn = `📈 Tomorrow will be warmer than today by ~${diff}°C.`;
        tempCompHi = `📈 कल का तापमान आज से लगभग ${diff}°C अधिक रहेगा।`;
        tempCompBn = `📈 আগামীকালের তাপমাত্রা আজকের চেয়ে প্রায় ${diff}°C বেশি থাকবে।`;
      } else if (diff < -2) {
        tempCompEn = `📉 Tomorrow will be cooler than today by ~${Math.abs(diff)}°C.`;
        tempCompHi = `📉 कल का तापमान आज से लगभग ${Math.abs(diff)}°C कम रहेगा।`;
        tempCompBn = `📉 আগামীকালের তাপমাত্রা আজকের চেয়ে প্রায় ${Math.abs(diff)}°C কম থাকবে।`;
      } else {
        tempCompEn = `🌡️ Tomorrow will have similar temperatures to today.`;
        tempCompHi = `🌡️ कल का तापमान आज के समान रहने की संभावना है।`;
        tempCompBn = `🌡️ আগামীকালের তাপমাত্রা আজকের মতো প্রায় একই থাকবে।`;
      }
    }

    if (language === 'hi') {
      return (
        `📅 **${cityName} के लिए कल का मौसम पूर्वावलोकन:**\n\n` +
        `कल की स्थिति: **${tWeather}**\n` +
        `🌡️ अधिकतम तापमान: **${tMax}°C** · न्यूनतम: **${tMin}°C**\n` +
        `🌧️ बारिश की संभावना: **${tPrecip}%** ${tRain > 0 ? `(${tRain} mm)` : ''}\n\n` +
        `${tempCompHi}\n\n` +
        `${tPrecip >= 50 ? '⚠️ कल बारिश की संभावना है — बाहर निकलते समय छाता साथ रखें।' : '✅ कल बारिश का कोई बड़ा खतरा नहीं दिख रहा है।'}`
      );
    }

    if (language === 'bn') {
      return (
        `📅 **${cityName}-এর জন্য আগামীকালের আবহাওয়ার পূর্বাভাস:**\n\n` +
        `আগামীকালের অবস্থা: **${tWeather}**\n` +
        `🌡️ সর্বোচ্চ তাপমাত্রা: **${tMax}°C** · সর্বনিম্ন: **${tMin}°C**\n` +
        `🌧️ বৃষ্টির সম্ভাবনা: **${tPrecip}%** ${tRain > 0 ? `(${tRain} mm)` : ''}\n\n` +
        `${tempCompBn}\n\n` +
        `${tPrecip >= 50 ? '⚠️ আগামীকাল বৃষ্টির প্রবল সম্ভাবনা রয়েছে — বাইরে বেরোলে ছাতা সাথে রাখুন।' : '✅ আগামীকাল ভারী বৃষ্টির সম্ভাবনা কম।'}`
      );
    }

    return (
      `📅 **Tomorrow's Weather Outlook for ${cityName}:**\n\n` +
      `Expected Condition: **${tWeather}**\n` +
      `🌡️ High: **${tMax}°C** · Low: **${tMin}°C**\n` +
      `🌧️ Rain Chance: **${tPrecip}%** ${tRain > 0 ? `(${tRain} mm)` : ''}\n\n` +
      `${tempCompEn}\n\n` +
      `${tPrecip >= 50 ? '⚠️ Rain is likely tomorrow — keep an umbrella handy.' : '✅ No significant rain expected tomorrow, ideal for outdoor plans.'}`
    );
  }

  // --- 2. Hourly Trends (Coolest / Warmest Hours) ---
  if (['coolest', 'coldest', 'hottest', 'warmest', 'peak temp', 'lowest temp', 'समय', 'সময়'].some((k) => q.includes(k))) {
    const coolTime = coolestHour ? `${coolestHour.time} (${Math.round(coolestHour.temperature)}°C)` : 'early morning';
    const warmTime = warmestHour ? `${warmestHour.time} (${Math.round(warmestHour.temperature)}°C)` : 'afternoon';

    if (language === 'hi') {
      return (
        `⏱️ **${cityName} के लिए तापमान का समय चक्र:**\n\n` +
        `❄️ सबसे ठंडा समय: **${coolTime}**\n` +
        `🔥 सबसे गर्म समय: **${warmTime}**\n\n` +
        `वर्तमान तापमान **${temp}°C** (महसूस: ${feels}°C) है। ठंडे समय में टहलना या कसरत करना आरामदायक रहेगा।`
      );
    }

    if (language === 'bn') {
      return (
        `⏱️ **${cityName}-এর জন্য তাপমাত্রার সময়সূচী:**\n\n` +
        `❄️ সবচেয়ে শীতল সময়: **${coolTime}**\n` +
        `🔥 সবচেয়ে উষ্ণ সময়: **${warmTime}**\n\n` +
        `বর্তমান তাপমাত্রা **${temp}°C** (অনুভূত: ${feels}°C)। সবচেয়ে শীতল সময়ে আউটডোর কাজ করা আরামদায়ক হবে।`
      );
    }

    return (
      `⏱️ **Hourly Temperature Progression for ${cityName}:**\n\n` +
      `❄️ **Coolest Time Today:** ~**${coolTime}**\n` +
      `🔥 **Peak Warmth Today:** ~**${warmTime}**\n\n` +
      `Current temperature is **${temp}°C** (feels like **${feels}°C**). Early morning or evening is best for outdoor exercises.`
    );
  }

  // --- 3. Weekend & Weekly Outlook ---
  if (['weekend', 'saturday', 'sunday', 'week', '7-day', '7 day', 'सप्ताह', 'সপ্তাহ'].some((k) => q.includes(k))) {
    let weekSummary = '';
    if (next7Days.length >= 2) {
      weekSummary = next7Days.slice(0, 5).map((d) => `• **${d.date}**: ${d.weather || 'Clear'}, ${Math.round(d.maxTemperature)}°/${Math.round(d.minTemperature)}°C (Rain: ${d.precipitationProbability || 0}%)`).join('\n');
    } else {
      weekSummary = `Upcoming days show steady conditions around ${temp}°C with ${desc}.`;
    }

    if (language === 'hi') {
      return (
        `🗓️ **${cityName} के लिए 7-दिवसीय पूर्वानुमान सारांश:**\n\n` +
        `${weekSummary}\n\n` +
        `सप्ताहांत की योजनाओं के लिए मौसम अनुकूल लग रहा है। जाने से पहले दैनिक अपडेट जरूर देखें।`
      );
    }

    if (language === 'bn') {
      return (
        `🗓️ **${cityName}-এর জন্য ৭ দিনের আবহাওয়ার আউটলুক:**\n\n` +
        `${weekSummary}\n\n` +
        `সাপ্তাহিক ছুটির দিনের জন্য আবহাওয়া পূর্বাভাস দেখে আপনার পরিকল্পনা করুন।`
      );
    }

    return (
      `🗓️ **7-Day Weather Forecast Overview for ${cityName}:**\n\n` +
      `${weekSummary}\n\n` +
      `Weekend outlook remains pleasant overall. Check back daily for updated precipitation trends.`
    );
  }

  // --- 4. Rain Duration / How long will rain last / When will rain stop ---
  if (['how long', 'how much long', 'last', 'stop', 'end', 'duration', 'कब तक', 'रुकना', 'थमेगी', 'কতক্ষণ', 'কখন থামবে'].some((k) => q.includes(k)) && ['rain', 'shower', 'drizzle', 'बारिश', 'बरसात', 'বৃষ্টি'].some((k) => q.includes(k))) {
    let stopTime = null;
    let resumeTime = null;
    let isRainingNow = rainMm > 0 || rainProb > 30 || /rain|drizzle|shower/i.test(desc);

    if (next24Hours.length > 0) {
      let rainActive = isRainingNow;
      for (const h of next24Hours) {
        const hPrecip = h.precipitationProbability || 0;
        const hRain = hPrecip >= 35 || /rain|drizzle|shower/i.test(h.weather || '');
        if (rainActive && !hRain && !stopTime) {
          stopTime = h.time;
          rainActive = false;
        } else if (!rainActive && hRain && stopTime && !resumeTime) {
          resumeTime = h.time;
        }
      }
    }

    if (isRainingNow) {
      const stopStr = stopTime ? `tapering off by around **${stopTime}** today` : 'continuing intermittently for the next several hours';
      const resumeStr = resumeTime ? `However, rain and showers are expected to return around **${resumeTime}**.` : 'Afterward, conditions will stay mostly overcast with lower chances of rain through the night.';

      if (language === 'hi') {
        const stopStrHi = stopTime ? `आज लगभग **${stopTime}** बजे तक कम होने की संभावना है` : 'अगले कुछ घंटों तक रुक-रुक कर जारी रहने की संभावना है';
        const resumeStrHi = resumeTime ? `हालांकि, लगभग **${resumeTime}** बजे फिर से बारिश लौटने का अनुमान है।` : 'इसके बाद रात भर हल्की फुहारों के साथ बादल छाए रहने की संभावना है।';
        return (
          `**${cityName}** में वर्तमान बारिश और बूंदाबांदी ${stopStrHi}।\n\n` +
          `${resumeStrHi}\n\n` +
          `यदि आप बाहर जा रहे हैं तो छाता साथ रखना बेहतर रहेगा!`
        );
      }

      if (language === 'bn') {
        const stopStrBn = stopTime ? `আজ প্রায় **${stopTime}** নাগাদ কমে আসার সম্ভাবনা রয়েছে` : 'পরবর্তী কয়েক ঘন্টা ধরে থেমে থেমে চলতে পারে';
        const resumeStrBn = resumeTime ? `তবে প্রায় **${resumeTime}** নাগাদ আবার বৃষ্টি হতে পারে।` : 'এরপর রাত পর্যন্ত আকাশ মেঘলা থাকতে পারে।';
        return (
          `**${cityName}**-এ বর্তমান বৃষ্টি এবং গুঁড়ি গুঁড়ি বৃষ্টি ${stopStrBn}।\n\n` +
          `${resumeStrBn}\n\n` +
          `বাইরে বের হলে ছাতা সঙ্গে রাখা ভালো!`
        );
      }

      return (
        `In **${cityName}**, the current rain and drizzle are expected to continue for the next few hours, ${stopStr}.\n\n` +
        `${resumeStr}\n\n` +
        `You might want to keep an umbrella close by if you're heading out!`
      );
    } else {
      let nextStart = null;
      if (next24Hours.length > 0) {
        const found = next24Hours.find(h => (h.precipitationProbability || 0) >= 35 || /rain|drizzle|shower/i.test(h.weather || ''));
        if (found) nextStart = found.time;
      }
      if (language === 'hi') {
        return (
          `**${cityName}** में फ़िलहाल बारिश नहीं हो रही है। ${nextStart ? `आज लगभग **${nextStart}** बजे बारिश शुरू होने की संभावना है।` : 'आज शेष दिन बारिश की संभावना बहुत कम है।'}\n\n` +
          `कल बारिश की संभावना **${tomorrowFc.precipitationProbability || 0}%** है।`
        );
      }
      if (language === 'bn') {
        return (
          `**${cityName}**-এ বর্তমানে বৃষ্টি হচ্ছে না। ${nextStart ? `আজ প্রায় **${nextStart}** নাগাদ বৃষ্টি শুরু হতে পারে।` : 'আজকের বাকি সময়ে বৃষ্টির সম্ভাবনা খুবই কম।'}\n\n` +
          `আগামীকাল বৃষ্টির সম্ভাবনা **${tomorrowFc.precipitationProbability || 0}%**।`
        );
      }
      return (
        `In **${cityName}**, it is not currently raining. ${nextStart ? `Showers are expected to start around **${nextStart}** today.` : 'Chances of rain remain very low for the remainder of today.'}\n\n` +
        `Tomorrow's rain chance is **${tomorrowFc.precipitationProbability || 0}%**.`
      );
    }
  }

  // --- 5. Rain & Umbrella Queries ---
  if (['rain', 'umbrella', 'wet', 'drizzle', 'shower', 'बारिश', 'छाता', 'बरसात', 'বৃষ্টি', 'ছাতা'].some((k) => q.includes(k))) {
    const raining = rainMm > 0 || rainProb > 40 || /rain|drizzle|shower/i.test(desc);
    const tRainProb = tomorrowFc.precipitationProbability || 0;

    if (language === 'hi') {
      return (
        `🌧️ **${cityName} के लिए बारिश का विस्तृत विवरण:**\n\n` +
        `वर्तमान स्थिति: **${desc}** · वर्षा: **${rainMm} mm** · आज संभावना: **${rainProb}%** · कल संभावना: **${tRainProb}%**\n\n` +
        `${raining ? '⚠️ बारिश की पूरी संभावना है — बाहर निकलते समय छाता साथ रखें।' : '✅ अभी तेज बारिश की संभावना कम है, पर शाम के समय हल्का बादलाव हो सकता है।'}\n\n` +
        `हवा की गति **${wind} km/h** है।`
      );
    }

    if (language === 'bn') {
      return (
        `🌧️ **${cityName}-এর জন্য বৃষ্টির পূর্বাভাস:**\n\n` +
        `বর্তমান অবস্থা: **${desc}** · বৃষ্টিপাত: **${rainMm} mm** · আজ সম্ভাবনা: **${rainProb}%** · আগামীকাল সম্ভাবনা: **${tRainProb}%**\n\n` +
        `${raining ? '⚠️ বৃষ্টির প্রবল সম্ভাবনা রয়েছে — সাথে ছাতা রাখুন।' : '✅ আপাতত ভারী বৃষ্টির সম্ভাবনা কম।'}\n\n` +
        `বাতাসের গতি **${wind} km/h**।`
      );
    }

    return (
      `🌧️ **Rain & Umbrella Forecast for ${cityName}:**\n\n` +
      `Current Condition: **${desc}** · Rainfall: **${rainMm} mm**\n` +
      `Today Rain Chance: **${rainProb}%** · Tomorrow Rain Chance: **${tRainProb}%**\n\n` +
      `${raining ? '⚠️ Rain is likely today — carrying a portable umbrella is highly recommended.' : '✅ No heavy rain expected right now. Great conditions for heading outdoors.'}\n\n` +
      `Wind speed is **${wind} km/h**.`
    );
  }

  // --- 5. Outfit / Clothing Advice ---
  if (['wear', 'outfit', 'clothes', 'dress', 'jacket', 'कपड़े', 'पहन', 'पोশাক'].some((k) => q.includes(k))) {
    let advice = 'Check the current temperature in the dashboard for the best clothing recommendation.';
    if (typeof temp === 'number') {
      if (temp >= 35) advice = '☀️ **Very Hot:** Wear light, loose-fitting cotton or linen clothing. Prefer light shades and drink plenty of water.';
      else if (temp >= 28) advice = '🌤️ **Warm:** A light T-shirt, shorts, or summer dress is ideal. Sunglasses recommended.';
      else if (temp >= 20) advice = '🌱 **Comfortable:** A cotton shirt or light blouse with jeans/trousers will feel great.';
      else if (temp >= 12) advice = '🧥 **Cool:** Layer up with a light hoodie, cardigan, or denim jacket.';
      else advice = '❄️ **Cold:** Wear thermal layers, a heavy coat, and warm socks.';
    }
    const uvNote = typeof uv === 'number' && uv >= 3 ? '🕶️ Don\'t forget SPF 30+ sunscreen and sunglasses!' : 'UV levels are low.';

    if (language === 'hi') {
      return (
        `👔 **${cityName} के लिए कपड़ों का सुझाव:**\n\n` +
        `वर्तमान तापमान: **${temp}°C** (महसूस: **${feels}°C**) · स्थिति: **${desc}**\n\n` +
        `${advice}\n\n` +
        `यूवी इंडेक्स: **${uv}** — ${uvNote}`
      );
    }

    if (language === 'bn') {
      return (
        `👔 **${cityName}-এর জন্য পোশাকের পরামর্শ:**\n\n` +
        `বর্তমান তাপমাত্রা: **${temp}°C** (অনুভূত: **${feels}°C**) · অবস্থা: **${desc}**\n\n` +
        `${advice}\n\n` +
        `ইউভি ইনডেক্স: **${uv}** — ${uvNote}`
      );
    }

    return (
      `👔 **Outfit & Style Advisory for ${cityName}:**\n\n` +
      `Current Temp: **${temp}°C** (feels like **${feels}°C**) · Condition: **${desc}**\n\n` +
      `${advice}\n\n` +
      `UV Index: **${uv}** — ${uvNote}`
    );
  }

  // --- 6. Agriculture & Spraying ---
  if (['farm', 'crop', 'agriculture', 'pesticide', 'irrigat', 'plant', 'harvest', 'spray', 'खेती', 'कीटनाशक', 'कृषि', 'কীটনাশক'].some((k) => q.includes(k))) {
    const windSafe = typeof wind === 'number' && wind <= 15;
    const fungalRisk = typeof humidity === 'number' && humidity > 80;

    if (language === 'hi') {
      return (
        `🌾 **${cityName} के लिए कृषि एवं फसल सलाह:**\n\n` +
        `मौसम: **${desc}** · तापमान: **${temp}°C** · आर्द्रता: **${humidity}%** · हवा: **${wind} km/h**\n\n` +
        `• **कीटनाशक छिड़काव:** ${windSafe ? '✅ हवा की गति सुरक्षित सीमा (<15 km/h) में है। छिड़काव किया जा सकता है।' : '⚠️ हवा तेज है (>15 km/h) — छिड़काव से बचें ताकि दवा नष्ट न हो।'}\n` +
        `• **फफूंद जोखिम:** ${fungalRisk ? '🔴 उच्च आर्द्रता के कारण फफूंद जनित रोगों का जोखिम अधिक है।' : '🟢 आर्द्रता सामान्य सीमा में है।'}\n` +
        `• **सिंचाई आवश्यकता:** ${rainMm > 0 ? '💧 बारिश दर्ज की गई है — सिंचाई रोक दें।' : '🚿 खेत में नमी जांचें और आवश्यकतानुसार सिंचाई करें।'}`
      );
    }

    if (language === 'bn') {
      return (
        `🌾 **${cityName}-এর জন্য কৃষি পরামর্শ:**\n\n` +
        `আবহাওয়া: **${desc}** · তাপমাত্রা: **${temp}°C** · আর্দ্রতা: **${humidity}%** · বাতাস: **${wind} km/h**\n\n` +
        `• **কীটনাশক স্প্রে:** ${windSafe ? '✅ বাতাসের গতি স্বাভাবিক (<15 km/h)। স্প্রে করার জন্য উপযুক্ত।' : '⚠️ বাতাস বেশি (>15 km/h) — স্প্রে এড়িয়ে চলুন।'}\n` +
        `• **ছত্রাক ঝুঁকি:** ${fungalRisk ? '🔴 আর্দ্রতা বেশি হওয়ায় ছত্রাক রোগের আশঙ্কা রয়েছে।' : '🟢 আর্দ্রতা স্বাভাবিক।'}\n` +
        `• **সেচ পরামর্শ:** ${rainMm > 0 ? '💧 বৃষ্টি হয়েছে — সেচ দেওয়ার প্রয়োজন নেই।' : '🚿 মাটি পরীক্ষা করে সেচ দিন।'}`
      );
    }

    return (
      `🌾 **Agricultural Advisory for ${cityName}:**\n\n` +
      `Current: **${desc}** · Temp: **${temp}°C** · Humidity: **${humidity}%** · Wind: **${wind} km/h**\n\n` +
      `• **Pesticide Spraying:** ${windSafe ? '✅ Wind speed is safe (<15 km/h) for uniform spraying.' : '⚠️ Wind speed exceeds 15 km/h. Avoid spraying to prevent chemical drift.'}\n` +
      `• **Fungal Risk:** ${fungalRisk ? '🔴 Humidity >80% raises fungal disease risk. Consider preventive fungicide.' : '🟢 Humidity is optimal for crop foliage.'}\n` +
      `• **Irrigation:** ${rainMm > 0 ? '💧 Rainfall recorded — pause irrigation.' : '🚿 No recent rain — irrigate crops based on soil moisture.'}`
    );
  }

  // --- 7. UV & Sun Exposure ---
  if (['uv', 'sun', 'sunscreen', 'sunburn', 'घाम', 'धूप', 'সূর্য'].some((k) => q.includes(k))) {
    let uvAdvice = 'UV data is unavailable.';
    if (typeof uv === 'number') {
      if (uv <= 2) uvAdvice = '🟢 **Low (0-2):** Minimal sun hazard. Safe to enjoy outdoors.';
      else if (uv <= 5) uvAdvice = '🟡 **Moderate (3-5):** Sun protection recommended. Wear SPF 30+ sunscreen if out >30 mins.';
      else if (uv <= 7) uvAdvice = '🟠 **High (6-7):** Protective clothes, wide-brim hat, SPF 50+, and sunglasses required.';
      else if (uv <= 10) uvAdvice = '🔴 **Very High (8-10):** Minimize sun exposure between 10 AM and 4 PM.';
      else uvAdvice = '🟣 **Extreme (11+):** Stay in shade. Skin can burn in minutes without full coverage.';
    }

    return `☀️ **UV & Solar Advisory for ${cityName}:**\n\nCurrent UV Index: **${uv}** · Condition: **${desc}**\n\n${uvAdvice}`;
  }

  // --- 8. Wind & Storm ---
  if (['wind', 'storm', 'gust', 'cyclone', 'hurricane', 'हवा', 'आंधी', 'ঝড়', 'বাতাস'].some((k) => q.includes(k))) {
    let windAdvice = 'Wind data is unavailable.';
    if (typeof wind === 'number') {
      if (wind < 20) windAdvice = '✅ Gentle breeze — no wind hazards expected.';
      else if (wind < 40) windAdvice = '🟡 Moderate wind — secure lightweight outdoor items.';
      else if (wind < 60) windAdvice = '🟠 Strong wind — caution for high-profile vehicles and cyclists.';
      else windAdvice = '🔴 Severe wind — risk of falling branches and power interruptions.';
    }
    return `💨 **Wind Advisory for ${cityName}:**\n\nCurrent Wind Speed: **${wind} km/h** · Condition: **${desc}**\n\n${windAdvice}`;
  }

  // --- 9. Humidity & Comfort ---
  if (['humidity', 'humid', 'dry', 'muggy', 'उमस', 'नमी', 'আর্দ্রতা'].some((k) => q.includes(k))) {
    let hAdvice = '';
    if (typeof humidity === 'number') {
      if (humidity < 30) hAdvice = '🏜️ Air is dry — keep water handy and use skin moisturiser.';
      else if (humidity < 65) hAdvice = '✅ Humidity is balanced and comfortable.';
      else hAdvice = '🔴 High humidity — muggy conditions may make it feel warmer than actual temperature.';
    }
    return `💧 **Humidity Overview for ${cityName}:**\n\nRelative Humidity: **${humidity}%** · Feels Like: **${feels}°C**\n\n${hAdvice}`;
  }

  // --- 10. Fog & Visibility ---
  if (['visibility', 'fog', 'mist', 'haze', 'smog', 'कोहरा', 'धुंध', 'কুয়াশা'].some((k) => q.includes(k))) {
    const visKm = typeof vis === 'number' ? Math.round((vis / 1000) * 10) / 10 : vis;
    const visNote = typeof vis === 'number' && vis < 2000
      ? '⚠️ Low visibility — drive with low-beam headlights and maintain safe distance.'
      : '✅ Visibility is clear for travel and outdoor plans.';
    return `👁️ **Visibility & Fog Report for ${cityName}:**\n\nVisibility: **${visKm} km** · Condition: **${desc}**\n\n${visNote}`;
  }

  // --- 11. General Weather Fallback ---
  if (language === 'hi') {
    return (
      `🌦️ **${cityName} के लिए मौसम का सारांश:**\n\n` +
      `**${desc}** · तापमान: **${temp}°C** (महसूस: ${feels}°C)\n` +
      `💧 आर्द्रता: **${humidity}%** · 💨 हवा: **${wind} km/h** · ☀️ यूवी इंडेक्स: **${uv}**\n\n` +
      `आप मुझसे बारिश, कपड़ों के चयन, सप्ताहांत, कल का मौसम या खेती के बारे में पूछ सकते हैं।`
    );
  }

  if (language === 'bn') {
    return (
      `🌦️ **${cityName}-এর আবহাওয়ার সারসংক্ষেপ:**\n\n` +
      `**${desc}** · তাপমাত্রা: **${temp}°C** (অনুভূত: ${feels}°C)\n` +
      `💧 আর্দ্রতা: **${humidity}%** · 💨 বাতাস: **${wind} km/h** · ☀️ ইউভি: **${uv}**\n\n` +
      `আপনি আমাকে বৃষ্টি, জামাকাপড়, আগামীকালের আবহাওয়া বা কৃষি সম্পর্কে প্রশ্ন করতে পারেন।`
    );
  }

  return (
    `🌦️ **Weather Overview for ${cityName}:**\n\n` +
    `Condition: **${desc}** · Temperature: **${temp}°C** (feels like **${feels}°C**)\n` +
    `💧 Humidity: **${humidity}%** · 💨 Wind: **${wind} km/h** · ☀️ UV Index: **${uv}**\n\n` +
    `Feel free to ask me about tomorrow's forecast, hourly trends, weekend outlook, outfit advice, or farming tips.`
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
