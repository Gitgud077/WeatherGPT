function translateWeatherDesc(desc, lang) {
  if (!desc) return '';
  if (lang === 'bn') {
    const lower = String(desc).toLowerCase();
    if (lower.includes('clear sky') || lower === 'clear') return 'পরিষ্কার আকাশ';
    if (lower.includes('mainly clear')) return 'বেশিরভাগ পরিষ্কার';
    if (lower.includes('partly cloudy')) return 'আংশিক মেঘলা';
    if (lower.includes('overcast')) return 'মেঘলা আকাশ';
    if (lower.includes('fog') || lower.includes('rime')) return 'কুয়াশা';
    if (lower.includes('drizzle')) return 'গুঁড়ি গুঁড়ি বৃষ্টি';
    if (lower.includes('heavy rain')) return 'ভারী বৃষ্টি';
    if (lower.includes('rain') || lower.includes('shower')) return 'বৃষ্টি';
    if (lower.includes('thunder') || lower.includes('storm')) return 'বজ্রঝড়';
    if (lower.includes('snow')) return 'তুষারপাত';
    return desc;
  }
  if (lang === 'hi') {
    const lower = String(desc).toLowerCase();
    if (lower.includes('clear sky') || lower === 'clear') return 'साफ़ आसमान';
    if (lower.includes('mainly clear')) return 'अधिकांशतः साफ़';
    if (lower.includes('partly cloudy')) return 'आंशिक रूप से बादल';
    if (lower.includes('overcast')) return 'घने बादल';
    if (lower.includes('fog') || lower.includes('rime')) return 'कोहरा';
    if (lower.includes('drizzle')) return 'बूंदाबांदी';
    if (lower.includes('heavy rain')) return 'तेज बारिश';
    if (lower.includes('rain') || lower.includes('shower')) return 'बारिश';
    if (lower.includes('thunder') || lower.includes('storm')) return 'आंधी-तूफान';
    if (lower.includes('snow')) return 'बर्फबारी';
    return desc;
  }
  return desc;
}

function buildLocalAdvisory(message, location, weather, language = 'en') {
  const cityName = location?.name || 'your location';
  const q = String(message || '').toLowerCase();

  const temp = weather?.temperature;
  const feels = weather?.feelsLike;
  const humidity = weather?.humidity;
  const wind = weather?.windSpeed;
  const uv = weather?.uvIndex;
  const rawDesc = weather?.weatherDescription || 'Clear';
  const desc = translateWeatherDesc(rawDesc, language);
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
    const tWeather = translateWeatherDesc(tomorrowFc.weather || rawDesc, language);
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
  if (['coolest', 'coldest', 'hottest', 'warmest', 'peak temp', 'lowest temp', 'समय', 'समय', 'সময়'].some((k) => q.includes(k))) {
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
      weekSummary = next7Days.slice(0, 5).map((d) => `• **${d.date}**: ${translateWeatherDesc(d.weather, language) || desc}, ${Math.round(d.maxTemperature)}°/${Math.round(d.minTemperature)}°C (${language === 'bn' ? 'বৃষ্টি' : language === 'hi' ? 'बारिश' : 'Rain'}: ${d.precipitationProbability || 0}%)`).join('\n');
    } else {
      weekSummary = language === 'bn'
        ? `আসন্ন দিনগুলিতে ${desc} সহ তাপমাত্রা ${temp}°C এর কাছাকাছি থাকবে।`
        : language === 'hi'
        ? `आगामी दिनों में ${desc} के साथ तापमान ${temp}°C के आसपास रहेगा।`
        : `Upcoming days show steady conditions around ${temp}°C with ${desc}.`;
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
    let isRainingNow = rainMm > 0 || rainProb > 30 || /rain|drizzle|shower/i.test(rawDesc);

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
    const raining = rainMm > 0 || rainProb > 40 || /rain|drizzle|shower/i.test(rawDesc);
    const tRainProb = tomorrowFc.precipitationProbability || 0;

    if (language === 'hi') {
      return (
        `🌧️ **${cityName} के लिए बारिश का विस्तृत विवरण:**\n\n` +
        `वर्तमान स्थिति: **${desc}** · वर्षा: **${rainMm} mm** · आज संभावना: **${rainProb}%** · कल संभावना: **${tRainProb}%**\n\n` +
        `${raining ? '⚠️ बारिश की पूरी संभावना है — बाहर निकलते समय छाता साथ रखें।' : '✅ अभी तेज बारिश की संभावना कम है, पर शाम के समय हल्का बदलाव हो सकता है।'}\n\n` +
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
  if (['wear', 'outfit', 'clothes', 'dress', 'jacket', 'कपड़े', 'पहन', 'पोশাক', 'পড়ব'].some((k) => q.includes(k))) {
    let adviceEn = 'Check the current temperature in the dashboard for the best clothing recommendation.';
    let adviceHi = 'कपड़ों के बेहतर चयन के लिए डैशबोर्ड में वर्तमान तापमान देखें।';
    let adviceBn = 'উপযুক্ত পোশাকের পরামর্শের জন্য ড্যাশবোর্ডে বর্তমান তাপমাত্রা দেখুন।';

    if (typeof temp === 'number') {
      if (temp >= 35) {
        adviceEn = '☀️ **Very Hot:** Wear light, loose-fitting cotton or linen clothing. Prefer light shades and drink plenty of water.';
        adviceHi = '☀️ **अत्यधिक गर्मी:** सूती या ढीले कपड़े पहनें। हल्के रंगों का चयन करें और पर्याप्त पानी पिएं।';
        adviceBn = '☀️ **প্রচণ্ড গরম:** হালকা, সুতির ঢিলেঢালা পোশাক পরুন। প্রচুর জল পান করুন।';
      } else if (temp >= 28) {
        adviceEn = '🌤️ **Warm:** A light T-shirt, shorts, or summer dress is ideal. Sunglasses recommended.';
        adviceHi = '🌤️ **गर्म:** सूती टी-शर्ट या हल्के कपड़े आदर्श हैं। धूप का चश्मा इस्तेमाल करें।';
        adviceBn = '🌤️ **উষ্ণ:** হালকা সুতির পোশাক বা টি-শার্ট চমৎকার হবে। রোদচশমা ব্যবহার করুন।';
      } else if (temp >= 20) {
        adviceEn = '🌱 **Comfortable:** A cotton shirt or light blouse with jeans/trousers will feel great.';
        adviceHi = '🌱 **आरामदायक:** सूती कमीज़ या हल्की पोशाक आरामदायक रहेगी।';
        adviceBn = '🌱 **মনোরম:** হালকা সুতির জামা বা সাধারণ পোশাক আরামদায়ক হবে।';
      } else if (temp >= 12) {
        adviceEn = '🧥 **Cool:** Layer up with a light hoodie, cardigan, or denim jacket.';
        adviceHi = '🧥 **ठंडा:** हल्की स्वेटर, हुडी या जैकेट पहनें।';
        adviceBn = '🧥 **ঠাণ্ডা:** হালকা সোয়েটার, হুডি বা জ্যাকেট পরুন।';
      } else {
        adviceEn = '❄️ **Cold:** Wear thermal layers, a heavy coat, and warm socks.';
        adviceHi = '❄️ **अत्यधिक ठंडा:** गर्म कपड़े, भारी कोट और जुराबें पहनें।';
        adviceBn = '❄️ **শীতল:** ভারী শীতের পোশাক, জ্যাকেট এবং গরম মোজা পরিধান করুন।';
      }
    }

    const uvNoteEn = typeof uv === 'number' && uv >= 3 ? '🕶️ Don\'t forget SPF 30+ sunscreen and sunglasses!' : 'UV levels are low.';
    const uvNoteHi = typeof uv === 'number' && uv >= 3 ? '🕶️ SPF 30+ सनस्क्रीन और धूप का चश्मा साथ रखें!' : 'यूवी स्तर सामान्य है।';
    const uvNoteBn = typeof uv === 'number' && uv >= 3 ? '🕶️ SPF 30+ সানস্ক্রিন এবং সানগ্লাস সাথে রাখুন!' : 'ইউভি মাত্রা স্বাভাবিক।';

    if (language === 'hi') {
      return (
        `👔 **${cityName} के लिए कपड़ों का सुझाव:**\n\n` +
        `वर्तमान तापमान: **${temp}°C** (महसूस: **${feels}°C**) · स्थिति: **${desc}**\n\n` +
        `${adviceHi}\n\n` +
        `यूवी इंडेक्स: **${uv}** — ${uvNoteHi}`
      );
    }

    if (language === 'bn') {
      return (
        `👔 **${cityName}-এর জন্য পোশাকের পরামর্শ:**\n\n` +
        `বর্তমান তাপমাত্রা: **${temp}°C** (অনুভূত: **${feels}°C**) · অবস্থা: **${desc}**\n\n` +
        `${adviceBn}\n\n` +
        `ইউভি ইনডেক্স: **${uv}** — ${uvNoteBn}`
      );
    }

    return (
      `👔 **Outfit & Style Advisory for ${cityName}:**\n\n` +
      `Current Temp: **${temp}°C** (feels like **${feels}°C**) · Condition: **${desc}**\n\n` +
      `${adviceEn}\n\n` +
      `UV Index: **${uv}** — ${uvNoteEn}`
    );
  }

  // --- 6. Agriculture & Spraying ---
  if (['farm', 'crop', 'agriculture', 'pesticide', 'irrigat', 'plant', 'harvest', 'spray', 'खेती', 'कीटनाशक', 'कृषि', 'কীটনাশক', 'ফসল'].some((k) => q.includes(k))) {
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
  if (['uv', 'sun', 'sunscreen', 'sunburn', 'घाम', 'धूप', 'সূর্য', 'রোদ'].some((k) => q.includes(k))) {
    let uvAdviceEn = 'UV data is unavailable.';
    let uvAdviceHi = 'यूवी डेटा उपलब्ध नहीं है।';
    let uvAdviceBn = 'ইউভি তথ্য উপলব্ধ নয়।';

    if (typeof uv === 'number') {
      if (uv <= 2) {
        uvAdviceEn = '🟢 **Low (0-2):** Minimal sun hazard. Safe to enjoy outdoors.';
        uvAdviceHi = '🟢 **कम (0-2):** धूप का कोई खतरा नहीं। बाहर घूमना सुरक्षित है।';
        uvAdviceBn = '🟢 **কম (0-2):** রোদের ঝুঁকি খুবই কম। বাইরে থাকা নিরাপদ।';
      } else if (uv <= 5) {
        uvAdviceEn = '🟡 **Moderate (3-5):** Sun protection recommended. Wear SPF 30+ sunscreen if out >30 mins.';
        uvAdviceHi = '🟡 **मध्यम (3-5):** धूप सुरक्षा की सलाह। बाहर जाने पर SPF 30+ सनस्क्रीन लगाएं।';
        uvAdviceBn = '🟡 **মাঝারি (3-5):** রোদ থেকে সুরক্ষা পরামর্শযোগ্য। বাইরে ৩০ মিনিটের বেশি থাকলে SPF 30+ ব্যবহার করুন।';
      } else if (uv <= 7) {
        uvAdviceEn = '🟠 **High (6-7):** Protective clothes, wide-brim hat, SPF 50+, and sunglasses required.';
        uvAdviceHi = '🟠 **उच्च (6-7):** सुरक्षात्मक कपड़े, टोपी, SPF 50+ और चश्मा पहनें।';
        uvAdviceBn = '🟠 **উচ্চ (6-7):** ফুল হাতা পোশাক, সানগ্লাস এবং SPF 50+ সানস্ক্রিন ব্যবহার আবশ্যক।';
      } else if (uv <= 10) {
        uvAdviceEn = '🔴 **Very High (8-10):** Minimize sun exposure between 10 AM and 4 PM.';
        uvAdviceHi = '🔴 **अत्यधिक उच्च (8-10):** सुबह 10 से शाम 4 बजे के बीच धूप से बचें।';
        uvAdviceBn = '🔴 **খুব উচ্চ (8-10):** সকাল ১০টা থেকে বিকেল ৪টার মধ্যে রোদ এড়িয়ে চলুন।';
      } else {
        uvAdviceEn = '🟣 **Extreme (11+):** Stay in shade. Skin can burn in minutes without full coverage.';
        uvAdviceHi = '🟣 **गंभीर (11+):** छांव में रहें। बिना सुरक्षा के त्वचा झुलस सकती है।';
        uvAdviceBn = '🟣 **চরম (11+):** ছায়ায় থাকুন। সানস্ক্রিন ছাড়া সরাসরি রোদে ত্বক পুড়ে যেতে পারে।';
      }
    }

    if (language === 'hi') {
      return `☀️ **${cityName} के लिए यूवी और धूप सलाह:**\n\nवर्तमान यूवी इंडेक्स: **${uv}** · स्थिति: **${desc}**\n\n${uvAdviceHi}`;
    }
    if (language === 'bn') {
      return `☀️ **${cityName}-এর জন্য ইউভি ও রোদ সংক্রান্ত পরামর্শ:**\n\nবর্তমান ইউভি ইনডেক্স: **${uv}** · অবস্থা: **${desc}**\n\n${uvAdviceBn}`;
    }

    return `☀️ **UV & Solar Advisory for ${cityName}:**\n\nCurrent UV Index: **${uv}** · Condition: **${desc}**\n\n${uvAdviceEn}`;
  }

  // --- 8. Wind & Storm ---
  if (['wind', 'storm', 'gust', 'cyclone', 'hurricane', 'हवा', 'आंधी', 'ঝড়', 'বাতাস'].some((k) => q.includes(k))) {
    let windAdviceEn = 'Wind data is unavailable.';
    let windAdviceHi = 'हवा का डेटा उपलब्ध नहीं है।';
    let windAdviceBn = 'বাতাসের তথ্য উপলব্ধ নয়।';

    if (typeof wind === 'number') {
      if (wind < 20) {
        windAdviceEn = '✅ Gentle breeze — no wind hazards expected.';
        windAdviceHi = '✅ हल्की हवा — कोई खतरा नहीं है।';
        windAdviceBn = '✅ মায়াবী হাওয়া — বাতাসের কোনো বিপদের আশঙ্কা নেই।';
      } else if (wind < 40) {
        windAdviceEn = '🟡 Moderate wind — secure lightweight outdoor items.';
        windAdviceHi = '🟡 मध्यम हवा — बाहर रखी हल्की चीजें संभाल कर रखें।';
        windAdviceBn = '🟡 মাঝারি বাতাস — বাইরের হালকা জিনিসপত্র সামলে রাখুন।';
      } else if (wind < 60) {
        windAdviceEn = '🟠 Strong wind — caution for high-profile vehicles and cyclists.';
        windAdviceHi = '🟠 तेज हवा — वाहन चालकों को सावधानी बरतनी चाहिए।';
        windAdviceBn = '🟠 প্রবল বাতাস — গাড়ি ও সাইকেল চালানোর সময় সাবধানতা অবলম্বন করুন।';
      } else {
        windAdviceEn = '🔴 Severe wind — risk of falling branches and power interruptions.';
        windAdviceHi = '🔴 खतरनाक आंधी — पेड़ की शाखाएं गिरने और बिजली बाधित होने का खतरा।';
        windAdviceBn = '🔴 ভয়ানক ঝড় — গাছের ডালপালা ভাঙা ও বিদ্যুৎ বিচ্ছিন্ন হওয়ার আশঙ্কা রয়েছে।';
      }
    }

    if (language === 'hi') {
      return `💨 **${cityName} के लिए हवा की सलाह:**\n\nवर्तमान हवा की गति: **${wind} km/h** · स्थिति: **${desc}**\n\n${windAdviceHi}`;
    }
    if (language === 'bn') {
      return `💨 **${cityName}-এর জন্য বাতাসের পূর্বাভাস:**\n\nবর্তমান বাতাসের গতি: **${wind} km/h** · অবস্থা: **${desc}**\n\n${windAdviceBn}`;
    }

    return `💨 **Wind Advisory for ${cityName}:**\n\nCurrent Wind Speed: **${wind} km/h** · Condition: **${desc}**\n\n${windAdviceEn}`;
  }

  // --- 9. Humidity & Comfort ---
  if (['humidity', 'humid', 'dry', 'muggy', 'उमस', 'नमी', 'আর্দ্রতা'].some((k) => q.includes(k))) {
    let hAdviceEn = '';
    let hAdviceHi = '';
    let hAdviceBn = '';

    if (typeof humidity === 'number') {
      if (humidity < 30) {
        hAdviceEn = '🏜️ Air is dry — keep water handy and use skin moisturiser.';
        hAdviceHi = '🏜️ हवा शुष्क है — पानी पीते रहें और मॉइस्चराइजर का उपयोग करें।';
        hAdviceBn = '🏜️ বাতাস শুষ্ক — প্রচুর জল পান করুন এবং ত্বকের যত্ন নিন।';
      } else if (humidity < 65) {
        hAdviceEn = '✅ Humidity is balanced and comfortable.';
        hAdviceHi = '✅ आर्द्रता संतुलित और आरामदायक है।';
        hAdviceBn = '✅ বাতাসের আর্দ্রতা স্বাভাবিক এবং আরামদায়ক।';
      } else {
        hAdviceEn = '🔴 High humidity — muggy conditions may make it feel warmer than actual temperature.';
        hAdviceHi = '🔴 उच्च आर्द्रता — उमस के कारण तापमान से अधिक गर्मी महसूस हो सकती है।';
        hAdviceBn = '🔴 উচ্চ আর্দ্রতা — স্যাঁতসেঁতে আবহাওয়ার কারণে প্রকৃত তাপমাত্রার চেয়ে বেশি গরম অনুভূত হতে পারে।';
      }
    }

    if (language === 'hi') {
      return `💧 **${cityName} के लिए आर्द्रता विवरण:**\n\nआपेक्षित आर्द्रता: **${humidity}%** · महसूस: **${feels}°C**\n\n${hAdviceHi}`;
    }
    if (language === 'bn') {
      return `💧 **${cityName}-এর আর্দ্রতার বিবরণ:**\n\nআপেক্ষিক আর্দ্রতা: **${humidity}%** · অনুভূত: **${feels}°C**\n\n${hAdviceBn}`;
    }

    return `💧 **Humidity Overview for ${cityName}:**\n\nRelative Humidity: **${humidity}%** · Feels Like: **${feels}°C**\n\n${hAdviceEn}`;
  }

  // --- 10. Fog & Visibility ---
  if (['visibility', 'fog', 'mist', 'haze', 'smog', 'कोहरा', 'धुंध', 'কুয়াশা'].some((k) => q.includes(k))) {
    const visKm = typeof vis === 'number' ? Math.round((vis / 1000) * 10) / 10 : vis;
    const visNoteEn = typeof vis === 'number' && vis < 2000
      ? '⚠️ Low visibility — drive with low-beam headlights and maintain safe distance.'
      : '✅ Visibility is clear for travel and outdoor plans.';
    const visNoteHi = typeof vis === 'number' && vis < 2000
      ? '⚠️ कम दृश्यता — फॉग लाइट का उपयोग करें और धीमी गति से गाड़ी चलाएं।'
      : '✅ यात्रा और बाहरी योजनाओं के लिए दृश्यता साफ़ है।';
    const visNoteBn = typeof vis === 'number' && vis < 2000
      ? '⚠️ কম দৃশ্যমানতা — হেডলাইট জ্বালিয়ে সাবধানে গাড়ি চালান।'
      : '✅ চলাচলের জন্য দৃশ্যমানতা সম্পূর্ণ পরিষ্কার।';

    if (language === 'hi') {
      return `👁️ **${cityName} के लिए दृश्यता एवं कोहरा रिपोर्ट:**\n\nदृश्यता: **${visKm} km** · स्थिति: **${desc}**\n\n${visNoteHi}`;
    }
    if (language === 'bn') {
      return `👁️ **${cityName}-এর জন্য দৃশ্যমানতা ও কুয়াশা রিপোর্ট:**\n\nদৃশ্যমানতা: **${visKm} km** · অবস্থা: **${desc}**\n\n${visNoteBn}`;
    }

    return `👁️ **Visibility & Fog Report for ${cityName}:**\n\nVisibility: **${visKm} km** · Condition: **${desc}**\n\n${visNoteEn}`;
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
