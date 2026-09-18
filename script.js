/* =========================================
   RituGPT — Production Frontend Script
   ========================================= */

const state = {
  location: null,
  current: null,
  forecast: null,
  aqi: null,
  multimodel: null,
  chatHistory: [],
  language: 'en',
  bookmarks: JSON.parse(localStorage.getItem('ritugpt_bookmarks') || localStorage.getItem('weathergpt_bookmarks') || '[]'),
  comparisonLocation: null,
  comparisonCurrent: null,
  comparisonForecast: null
};

let tempChart = null;
let precipChart = null;
let weatherCanvas = null;
let radarMap = null;
let radarMarker = null;
let speechRecognizer = null;
let isVoiceListening = false;
let currentSpeechUtterance = null;

const $ = (id) => document.getElementById(id);

let isChatSubmitting = false;

/* =========================================
   Universal Inline SVG Icon Registry
   ========================================= */
const ICONS = {
  sun: `<svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  moon: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  sunCloud: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.5 17h1a4.5 4.5 0 0 0 0-9 4.3 4.3 0 0 0-2.6.9A5 5 0 0 0 4.5 14a4 4 0 0 0 3.5 3h7.5"/></svg>`,
  moonCloud: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 3a6 6 0 0 0 6.5 6.5 4.5 4.5 0 0 1 1 0 4.5 4.5 0 0 1-2 8.5H8.5A5 5 0 0 1 5 9.5a5 5 0 0 1 4.5-5.4A6 6 0 0 0 12 3Z"/></svg>`,
  cloud: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>`,
  cloudFog: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M4 14h16M4 18h16M4 10h16M7 6h10"/></svg>`,
  cloudDrizzle: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17.5 15H9a5 5 0 1 1 4.9-6h1.6a3.5 3.5 0 1 1 2 6.5Z"/><path d="M8 19v1M12 19v1M16 19v1"/></svg>`,
  cloudRain: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17.5 14H9a5 5 0 1 1 4.9-6h1.6a3.5 3.5 0 1 1 2 6.5Z"/><path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/></svg>`,
  cloudLightning: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17.5 13H9a5 5 0 1 1 4.9-6h1.6a3.5 3.5 0 1 1 2 6.5Z"/><path d="m13 14-2 4h3l-2 4"/></svg>`,
  cloudSnow: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M17.5 14H9a5 5 0 1 1 4.9-6h1.6a3.5 3.5 0 1 1 2 6.5Z"/><circle cx="8" cy="18" r="1"/><circle cx="12" cy="18" r="1"/><circle cx="16" cy="18" r="1"/></svg>`,
  droplet: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`,
  sparkles: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  speaker: `<svg class="svg-icon" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`
};

/* =========================================
   Multilingual Indian UI Translations Dictionary
   ========================================= */
const TRANSLATIONS = {
  en: {
    tagline: 'Ask the weather anything.',
    searchBtn: 'Search',
    compareBtn: 'Compare',
    askGptBtn: 'Ask RituGPT',
    navAiBtn: 'AI Analysis',
    navAqiBtn: 'Air Quality',
    navTrendsBtn: 'Weather Trends',
    compareTitle: 'Multi-Location Side-by-Side Comparison',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    wind: 'Wind speed',
    windDir: 'Wind direction',
    uv: 'UV Index',
    rain: 'Rain',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    radarTitle: 'Interactive Weather Radar & Rain Layer',
    radarHint: 'Real-time satellite precipitation coverage',
    hourlyTitle: 'Hourly Forecast',
    hourlyHint: '24-hour progression',
    dailyTitle: '7-Day Forecast',
    dailyHint: 'Weekly outlook',
    trendsTitle: 'Weather Trends & Analytics',
    footer: 'Weather data by Open-Meteo. Grounded AI by Google Gemini.',
    multimodelTitle: 'Multi-Model Ensemble & Decision Engine',
    modelBreakdownBtn: 'Model-Wise Breakdown',
    evaluatingConsensus: 'Evaluating Consensus...',
    consensusAgreement: 'Model Consensus Agreement',
    decisionsTitle: 'Probable AI Recommendations (Multi-Model Grounded)',
    evaluating: 'Evaluating...',
    decFitnessLabel: 'Outdoor Fitness & Sports',
    decRainLabel: 'Rain Risk / Outdoor Event',
    decLaundryLabel: 'Laundry & Sun Drying',
    decMaskLabel: 'Health & Pollution Action',
    probableTempLabel: 'Probable Max Temp',
    probableSpreadLabel: 'Model Variance / Spread',
    probablePrecipLabel: 'Probable Rain Sum',
    probableAgreementLabel: 'Rain Model Consensus',
    breakdownTitle: 'Live Individual Meteorological Model Breakdown (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'Condition',
    modelRain: 'Rain Sum',
    modelWind: 'Max Wind',
    fitness_favorable: 'Highly Favorable — Great conditions for outdoor running & sports.',
    fitness_caution: 'Exercise Caution — High thermal stress. Hydrate & avoid peak afternoon sun.',
    fitness_indoor: 'Indoor Workout Suggested — Rain showers active outdoors.',
    fitness_pollution: 'Reduce Outdoor Exertion — Air quality is degraded for cardio workouts.',
    rain_low: 'Low Risk — Dry conditions predicted across ensemble models.',
    rain_high: 'High Rain Risk — Multiple models confirm precipitation. Carry umbrella!',
    rain_moderate: 'Moderate Rain Risk — Scattered light showers possible. Have a backup plan.',
    laundry_optimal: 'Optimal Drying — Warm temperatures & fair breezes.',
    laundry_indoor: 'Indoor Drying Advised — High likelihood of wet clothes outdoors.',
    laundry_slow: 'Slow Drying Speed — High relative humidity in ambient air.',
    mask_clear: 'Clear Air — No protective mask required for general public.',
    mask_mandatory: 'N95 Mask Mandatory — Severe pollution alert. Keep windows closed.',
    mask_recommended: 'N95 Mask Recommended — Sensitive groups & asthmatics take precaution.',
    condition: "Condition",
    searchPlaceholder: "Search any city or coordinates...",
    comparePlaceholder: "Compare another city...",
    chatPlaceholder: "Ask anything about the weather...",
    today: "Today",
    tomorrow: "Tomorrow",
    welcome: '**Hello!** I am RituGPT, powered by Google Gemini. Search for any location or ask me anything about the forecast, outdoor activities, or what to wear today.'
  },
  hi: {
    tagline: 'मौसम से जुड़ा कुछ भी पूछें।',
    searchBtn: 'खोजें',
    compareBtn: 'तुलना करें',
    askGptBtn: 'RituGPT से पूछें',
    navAiBtn: 'एआई विश्लेषण',
    navAqiBtn: 'वायु गुणवत्ता',
    navTrendsBtn: 'मौसम रुझान',
    compareTitle: 'दो शहरों के मौसम की तुलना',
    feelsLike: 'महसूस होता है',
    humidity: 'आर्द्रता',
    wind: 'हवा की गति',
    windDir: 'हवा की दिशा',
    uv: 'यूवी इंडेक्स',
    rain: 'बारिश',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    radarTitle: 'इंटरएक्टिव वेदर रडार और बारिश नक्शा',
    radarHint: 'लाइव उपग्रह वर्षा कवरेज',
    hourlyTitle: 'प्रति घंटा पूर्वानुमान',
    hourlyHint: '24 घंटे की प्रगति',
    dailyTitle: '7 दिनों का पूर्वानुमान',
    dailyHint: 'साप्ताहिक दृष्टिकोण',
    trendsTitle: 'मौसम रुझान और विश्लेषण',
    footer: 'ओपन-मेटियो द्वारा मौसम डेटा। गूगल जेमिनी द्वारा ग्राउंडेड एआई।',
    multimodelTitle: 'मल्टी-मॉडल पहनावा और निर्णय इंजन',
    modelBreakdownBtn: 'मॉडल-वार विवरण',
    evaluatingConsensus: 'सहमति का मूल्यांकन जारी...',
    consensusAgreement: 'मॉडल सहमति समझौता',
    decisionsTitle: 'अनुमानित एआई सिफारिशें (मल्टी-मॉडल आधारित)',
    evaluating: 'मूल्यांकन जारी...',
    decFitnessLabel: 'आउटडोर फिटनेस और खेल',
    decRainLabel: 'बारिश का जोखिम / बाहरी कार्यक्रम',
    decLaundryLabel: 'कपड़े धोना और धूप में सुखाना',
    decMaskLabel: 'स्वास्थ्य और प्रदूषण सुरक्षा',
    probableTempLabel: 'अनुमानित अधिकतम तापमान',
    probableSpreadLabel: 'मॉडल अंतर / प्रसार',
    probablePrecipLabel: 'अनुमानित कुल बारिश',
    probableAgreementLabel: 'बारिश मॉडल सहमति',
    breakdownTitle: 'लाइव व्यक्तिगत मौसम मॉडल विवरण (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'स्थिति',
    modelRain: 'कुल बारिश',
    modelWind: 'अधिकतम हवा',
    fitness_favorable: 'अत्यधिक अनुकूल — दौड़ने और आउटडोर खेलों के लिए बेहतरीन मौसम।',
    fitness_caution: 'सावधानी बरतें — अत्यधिक गर्मी और धूप। पानी पिएं और दोपहर में बाहर जाने से बचें।',
    fitness_indoor: 'घर के अंदर कसरत की सलाह — बाहर बारिश हो रही है।',
    fitness_pollution: 'बाहरी मेहनत कम करें — कार्डियो कसरत के लिए हवा की गुणवत्ता खराब है।',
    rain_low: 'कम जोखिम — सभी मॉडलों में शुष्क मौसम का अनुमान है।',
    rain_high: 'बारिश का भारी जोखिम — कई मॉडलों ने बारिश की पुष्टि की। छाता अवश्य रखें!',
    rain_moderate: 'मध्यम बारिश का जोखिम — हल्की फुहारें संभव हैं। वैकल्पिक योजना रखें।',
    laundry_optimal: 'सुखाने के लिए उत्तम — गर्म तापमान और हल्की हवा अनुकूल है।',
    laundry_indoor: 'घर के अंदर सुखाने की सलाह — बाहर कपड़े भीगने की पूरी संभावना है।',
    laundry_slow: 'धीमी गति से सूखेंगे — हवा में अत्यधिक नमी (आर्द्रता) है।',
    mask_clear: 'स्वच्छ हवा — आम जनता के लिए मास्क की आवश्यकता नहीं है।',
    mask_mandatory: 'N95 मास्क अनिवार्य — गंभीर प्रदूषण चेतावनी। खिड़कियां बंद रखें।',
    mask_recommended: 'N95 मास्क की सलाह — संवेदनशील लोग और अस्थमा के मरीज सावधानी बरतें।',
    condition: "मौसम स्थिति",
    searchPlaceholder: "शहर या निर्देशांक खोजें...",
    comparePlaceholder: "दूसरे शहर से तुलना करें...",
    chatPlaceholder: "मौसम के बारे में कुछ भी पूछें...",
    today: "आज",
    tomorrow: "कल",
    welcome: '**नमस्ते!** मैं RituGPT हूँ, Google Gemini द्वारा संचालित। मौसम के पूर्वानुमान, बाहरी गतिविधियों या आज पहने जाने वाले कपड़ों के बारे में कुछ भी पूछें।'
  },
  bn: {
    tagline: 'আবহাওয়া সম্পর্কিত যে কোনও প্রশ্ন করুন।',
    searchBtn: 'অনুসন্ধান',
    compareBtn: 'তুলনা করুন',
    askGptBtn: 'RituGPT কে জিজ্ঞাসা করুন',
    navAiBtn: 'এআই বিশ্লেষণ',
    navAqiBtn: 'বায়ুর মান',
    navTrendsBtn: 'আবহাওয়ার প্রবণতা',
    compareTitle: 'একাধিক শহরের আবহাওয়ার তুলনা',
    feelsLike: 'অনূভূত তাপমাত্রা',
    humidity: 'আর্দ্রতা',
    wind: 'বাতাসের গতি',
    windDir: 'বাতাসের দিক',
    uv: 'ইউভি ইনডেক্স',
    rain: 'বৃষ্টিপাত',
    sunrise: 'সূর্যোদয়',
    sunset: 'সূর্যাস্ত',
    radarTitle: 'ইন্টারেক্টিভ ওয়েদার রাডার ও বৃষ্টি ম্যাপ',
    radarHint: 'লাইভ উপগ্রহ বৃষ্টিপাতের তথ্য',
    hourlyTitle: 'প্রতি ঘণ্টার পূর্বাভাস',
    hourlyHint: '২৪ ঘণ্টার চিত্র',
    dailyTitle: '৭ দিনের পূর্বাভাস',
    dailyHint: 'সাপ্তাহিক দৃষ্টিভঙ্গি',
    trendsTitle: 'আবহাওয়ার প্রবণতা ও বিশ্লেষণ',
    footer: 'ওপেন-মেটিও দ্বারা আবহাওয়ার তথ্য। গুগল জেমিনি দ্বারা চালিত এআই।',
    multimodelTitle: 'মাল্টি-মডেল সমাহার ও সিদ্ধান্ত ইঞ্জিন',
    modelBreakdownBtn: 'মডেলভিত্তিক বিবরণ',
    evaluatingConsensus: 'ঐক্যমত্য মূল্যায়ন হচ্ছে...',
    consensusAgreement: 'মডেলের ঐক্যমত্য',
    decisionsTitle: 'সম্ভাব্য এআই সুপারিশ (মাল্টি-মডেল ভিত্তিক)',
    evaluating: 'মূল্যায়ন করা হচ্ছে...',
    decFitnessLabel: 'আউটডোর ফিটনেস ও খেলাধুলা',
    decRainLabel: 'বৃষ্টির ঝুঁকি / বাইরের অনুষ্ঠান',
    decLaundryLabel: 'কাপড় ধোয়া ও রোদে শুকানো',
    decMaskLabel: 'স্বাস্থ্য ও দূষণ সতর্কতা',
    probableTempLabel: 'সম্ভাব্য সর্বোচ্চ তাপমাত্রা',
    probableSpreadLabel: 'মডেল ব্যবধান / বিস্তার',
    probablePrecipLabel: 'সম্ভাব্য মোট বৃষ্টিপাত',
    probableAgreementLabel: 'বৃষ্টির মডেল ঐক্যমত্য',
    breakdownTitle: 'লাইভ একক আবহাওয়া মডেল বিশদ (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'পরিস্থিতি',
    modelRain: 'বৃষ্টির পরিমাণ',
    modelWind: 'সর্বোচ্চ বাতাস',
    fitness_favorable: 'অত্যন্ত অনুকূল — বাইরে দৌড়াদৌড়ি এবং খেলাধুলার জন্য চমৎকার আবহাওয়া।',
    fitness_caution: 'সতর্ক থাকুন — অতিরিক্ত গরম ও তাপ। প্রচুর জল পান করুন ও দুপুরের রোদ এড়িয়ে চলুন।',
    fitness_indoor: 'ঘরের ভেতরে ব্যায়ামের পরামর্শ — বাইরে বৃষ্টি হচ্ছে।',
    fitness_pollution: 'বাইরে অতিরিক্ত পরিশ্রম কমিয়ে দিন — কার্ডিও ব্যায়ামের জন্য বায়ুর মান খারাপ।',
    rain_low: 'কম ঝুঁকি — সমস্ত মডেল শুষ্ক আবহাওয়ার পূর্বাভাস দিচ্ছে।',
    rain_high: 'ভারী বৃষ্টির ঝুঁকি — একাধিক মডেল বৃষ্টির নিশ্চিত করেছে। ছাতা সাথে রাখুন!',
    rain_moderate: 'মাঝারি বৃষ্টির ঝুঁকি — হালকা বৃষ্টি হতে পারে। বিকল্প ব্যবস্থা রাখুন।',
    laundry_optimal: 'শুকানোর উপযুক্ত সময় — উষ্ণ তাপমাত্রা এবং মনোরম বাতাস।',
    laundry_indoor: 'ঘরের ভেতরে শুকানোর পরামর্শ — বাইরে কাপড় ভিজে যাওয়ার প্রবল আশঙ্কা।',
    laundry_slow: 'ধীর গতিতে শুকাবে — বাতাসে আপেক্ষিক আর্দ্রতা অত্যন্ত বেশি।',
    mask_clear: 'পরিষ্কার বাতাস — সাধারণ মানুষের মাস্ক পরার প্রয়োজন নেই।',
    mask_mandatory: 'N95 মাস্ক বাধ্যতামূলক — মারাত্মক দূষণ সতর্কতা। ঘরের জানালা বন্ধ রাখুন।',
    mask_recommended: 'N95 মাস্ক ব্যবহারের পরামর্শ — সংবেদনশীল মানুষ ও হাঁপানি রোগীরা সতর্কতা অবলম্বন করুন।',
    condition: "আবহাওয়ার অবস্থা",
    searchPlaceholder: "শহর বা স্থানাঙ্ক অনুসন্ধান করুন...",
    comparePlaceholder: "অন্য শহরের সাথে তুলনা করুন...",
    chatPlaceholder: "আবহাওয়া সম্পর্কে যা কিছু জিজ্ঞাসা করুন...",
    today: "আজ",
    tomorrow: "আগামীকাল",
    welcome: '**নমস্কার!** আমি RituGPT, Google Gemini দ্বারা চালিত। আবহাওয়ার তথ্য, বাইরের কাজকর্ম বা আজকের পোশাকের পরামর্শ জানতে যেকোনো স্থান খুঁজুন বা আমাকে প্রশ্ন করুন।'
  },
  ta: {
    tagline: 'வானிலை பற்றி எதுவும் கேட்கலாம்.',
    searchBtn: 'தேடு',
    compareBtn: 'ஒப்பிடு',
    askGptBtn: 'RituGPT-யிடம் கேள்',
    navAiBtn: 'AI பகுப்பாய்வு',
    navAqiBtn: 'காற்றுத் தரம்',
    navTrendsBtn: 'வானிலை போக்குகள்',
    compareTitle: 'நகரங்களின் வானிலை ஒப்பீடு',
    feelsLike: 'உணரப்படும் வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    wind: 'காற்றின் வேகம்',
    windDir: 'காற்றின் திசை',
    uv: 'புறஊதா குறியீடு',
    rain: 'மழை',
    sunrise: 'சூரியோதயம்',
    sunset: 'சூரிய அஸ்தமனம்',
    radarTitle: 'வானிலை ரேடார் மற்றும் மழை வரைபடம்',
    radarHint: 'நேரலை செயற்கைக்கோள் மழை கவரேஜ்',
    hourlyTitle: 'மணிநேர முன்னறிவிப்பு',
    hourlyHint: '24 மணிநேர முன்னேற்றம்',
    dailyTitle: '7 நாள் முன்னறிவிப்பு',
    dailyHint: 'வாராந்திர கண்ணோட்டம்',
    trendsTitle: 'வானிலை போக்குகள்',
    footer: 'Open-Meteo வானிலை தரவு. Google Gemini AI.',
    multimodelTitle: 'மல்டி-மாடல் முன்னறிவிப்பு மற்றும் முடிவு இயந்திரம்',
    modelBreakdownBtn: 'மாதிரி வாரியான விவரம்',
    evaluatingConsensus: 'கருத்தொற்றுமை மதிப்பீடு செய்யப்படுகிறது...',
    consensusAgreement: 'மாடல் ஒருமித்த ஒப்பந்தம்',
    decisionsTitle: 'சாத்தியமான AI பரிந்துரைகள் (மல்டி-மாடல் அடிப்படை)',
    evaluating: 'மதிப்பீடு செய்யப்படுகிறது...',
    decFitnessLabel: 'வெளிப்புற உடற்பயிற்சி & விளையாட்டு',
    decRainLabel: 'மழை ஆபத்து / வெளிப்புற நிகழ்வு',
    decLaundryLabel: 'துணி துவைத்தல் & வெயிலில் உலர்த்துதல்',
    decMaskLabel: 'சுகாதாரம் & மாசு பாதுகாப்பு நடவடிக்கை',
    probableTempLabel: 'சாத்தியமான அதிகபட்ச வெப்பநிலை',
    probableSpreadLabel: 'மாடல் மாறுபாடு / பரவல்',
    probablePrecipLabel: 'சாத்தியமான மொத்த மழை',
    probableAgreementLabel: 'மழை மாடல் ஒருமித்த கருத்து',
    breakdownTitle: 'நேரலை தனிநபர் வானிலை மாடல் விவரங்கள் (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'நிலை',
    modelRain: 'மழை அளவு',
    modelWind: 'அதிகபட்ச காற்று',
    fitness_favorable: 'மிகவும் சாதகமானது — வெளிப்புற ஓட்டம் மற்றும் விளையாட்டுகளுக்கு சிறந்த சூழல்.',
    fitness_caution: 'எச்சரிக்கையுடன் இருங்கள் — அதிக வெப்ப அழுத்தம். நீர் அருந்துங்கள், மதிய வெயிலைத் தவிர்க்கவும்.',
    fitness_indoor: 'உட்புற உடற்பயிற்சி பரிந்துரைக்கப்படுகிறது — வெளியே மழை பெய்கிறது.',
    fitness_pollution: 'வெளிப்புற கடின உழைப்பைக் குறைக்கவும் — உடற்பயிற்சிக்கு காற்றின் தரம் குறைவாக உள்ளது.',
    rain_low: 'குறைந்த ஆபத்து — அனைத்து மாடல்களும் வறண்ட வானிலையைக் கணிக்கின்றன.',
    rain_high: 'அதிக மழை ஆபத்து — பல மாதிரிகள் மழையை உறுதி செய்கின்றன. குடை எடுத்துச் செல்லுங்கள்!',
    rain_moderate: 'மிதமான மழை ஆபத்து — லேசான தூறல் சாத்தியம். மாற்றுத் திட்டம் வைத்துக் கொள்ளுங்கள்.',
    laundry_optimal: 'சிறந்த உலர்த்தும் சூழல் — வெப்பமான காலநிலை மற்றும் மெல்லிய காற்று.',
    laundry_indoor: 'வீட்டிற்குள் உலர்த்த பரிந்துரைக்கப்படுகிறது — வெளியில் துணிகள் நனைய வாய்ப்புள்ளது.',
    laundry_slow: 'மெதுவாகவே உலரும் — காற்றில் அதிக ஈரப்பதம் உள்ளது.',
    mask_clear: 'சுத்தமான காற்று — பொதுமக்களுக்கு முகக்கவசம் தேவையில்லை.',
    mask_mandatory: 'N95 முகக்கவசம் கட்டாயம் — கடுமையான காற்று மாசுபாடு எச்சரிக்கை. ஜன்னல்களை மூடி வைக்கவும்.',
    mask_recommended: 'N95 முகக்கவசம் பரிந்துரைக்கப்படுகிறது — ஆஸ்துமா மற்றும் உணர்திறன் உள்ளவர்கள் முன்னெச்சரிக்கை எடுக்கவும்.',
    condition: "வானிலை நிலை",
    searchPlaceholder: "நகரம் அல்லது ஆயங்களை தேடுங்கள்...",
    comparePlaceholder: "மற்றொரு நகரத்துடன் ஒப்பிடுங்கள்...",
    chatPlaceholder: "வானிலை பற்றி எதையும் கேளுங்கள்...",
    today: "இன்று",
    tomorrow: "நாளை",
  },
  te: {
    tagline: 'వాతావరణం గురించి ఏమైనా అడగండి.',
    searchBtn: 'వెతకండి',
    compareBtn: 'పోల్చండి',
    askGptBtn: 'RituGPT ని అడగండి',
    navAiBtn: 'AI విశ్లేషణ',
    navAqiBtn: 'గాలి నాణ్యత',
    navTrendsBtn: 'వాతావరణ పోకడలు',
    compareTitle: 'రెండు నగరాల వాతావరణ పోలిక',
    feelsLike: 'అనిపించే ఉష్ణోగ్రత',
    humidity: 'తేమ',
    wind: 'గాలి వేగం',
    windDir: 'గాలి దిశ',
    uv: 'యువి ఇండెక్స్',
    rain: 'వర్షం',
    sunrise: 'సూర్యోదయం',
    sunset: 'సూర్యాస్తమయం',
    radarTitle: 'ఇంటరాక్టివ్ వెదర్ రాడార్ & వర్షపు మ్యాప్',
    radarHint: 'లైవ్ శాటిలైట్ వర్షపాతం',
    hourlyTitle: 'గంటల వారీ ముందస్తు అంచనా',
    hourlyHint: '24 గంటల ప్రగతి',
    dailyTitle: '7 రోజుల అంచనా',
    dailyHint: 'వారపు అంచనా',
    trendsTitle: 'వాతావరణ విశ్లేషణ',
    footer: 'Open-Meteo వాతావరణ డేటా. Google Gemini AI.',
    multimodelTitle: 'మల్టీ-మోడల్ సమిష్టి & నిర్ణయ ఇంజిన్',
    modelBreakdownBtn: 'మోడల్ వారీ వివరణ',
    evaluatingConsensus: 'ఏకాభిప్రాయం అంచనా వేయబడుతోంది...',
    consensusAgreement: 'మోడల్ ఏకాభిప్రాయం',
    decisionsTitle: 'సంభావ్య AI సిఫార్సులు (మల్టీ-మోడల్ ఆధారితం)',
    evaluating: 'అంచనా వేయబడుతోంది...',
    decFitnessLabel: 'అవుట్‌డోర్ ఫిట్‌నెస్ & క్రీడలు',
    decRainLabel: 'వర్షపు ప్రమాదం / బాహ్య కార్యక్రమాలు',
    decLaundryLabel: 'లాండ్రీ & ఎండలో ఆరబెట్టడం',
    decMaskLabel: 'ఆరోగ్యం & కాలుష్య నివారణ చర్యలు',
    probableTempLabel: 'సంభావ్య గరిష్ట ఉష్ణోగ్రత',
    probableSpreadLabel: 'మోడల్ వ్యత్యాసం / వ్యాప్తి',
    probablePrecipLabel: 'సంభావ్య మొత్తం వర్షం',
    probableAgreementLabel: 'వర్షపు మోడల్ ఏకాభిప్రాయం',
    breakdownTitle: 'ప్రత్యక్ష వ్యక్తిగత వాతావరణ నమూనాల విభజన (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'పరిస్థితి',
    modelRain: 'మొత్తం వర్షం',
    modelWind: 'గరిష్ట గాలి',
    fitness_favorable: 'అత్యంత అనుకూలం — రన్నింగ్ మరియు అవుట్‌డోర్ క్రీడలకు అద్భుతమైన వాతావరణం.',
    fitness_caution: 'జాగ్రత్త వహించండి — తీవ్రమైన వేడి. నీరు ఎక్కువగా త్రాగండి, మధ్యాహ్న ఎండను నివారించండి.',
    fitness_indoor: 'ఇండోర్ వ్యాయామం సూచించబడింది — బయట వర్షం కురుస్తోంది.',
    fitness_pollution: 'బయట శ్రమను తగ్గించండి — కార్డియో వ్యాయామానికి గాలి నాణ్యత సరిగా లేదు.',
    rain_low: 'తక్కువ ప్రమాదం — అన్ని మోడల్స్ పొడి వాతావరణాన్ని అంచనా వేస్తున్నాయి.',
    rain_high: 'అధిక వర్షపు ముప్పు — బహుళ నమూనాలు వర్షాన్ని ధృవీకరించాయి. గొడుగు తీసుకెళ్లండి!',
    rain_moderate: 'మోస్తరు వర్షపు ముప్పు — తేలికపాటి జల్లులు కురిసే అవకాశం ఉంది. ప్రత్యామ్నాయ ప్రణాళిక ఉంచుకోండి.',
    laundry_optimal: 'బట్టలు ఆరడానికి అనుకూలం — వెచ్చని ఉష్ణోగ్రత మరియు అనుకూలమైన గాలి.',
    laundry_indoor: 'ఇంటి లోపల ఆరబెట్టడం మంచిది — బయట బట్టలు తడిసిపోయే అవకాశం ఎక్కువ.',
    laundry_slow: 'నెమ్మదిగా ఆరుతాయి — గాలిలో తేమ శాతం చాలా ఎక్కువగా ఉంది.',
    mask_clear: 'స్వచ్ఛమైన గాలి — సాధారణ ప్రజలకు మాస్క్ అవసరం లేదు.',
    mask_mandatory: 'N95 మాస్క్ తప్పనిసరి — తీవ్రమైన కాలుష్య హెచ్చరిక. కిటికీలు మూసి ఉంచండి.',
    mask_recommended: 'N95 మాస్క్ సిఫార్సు చేయబడింది — ఆస్తమా బాధితులు మరియు సున్నిత వ్యక్తులు జాగ్రత్త వహించండి.',
    condition: "వాతావరణ స్థితి",
    searchPlaceholder: "నగరం లేదా కోఆర్డినేట్లను శోధించండి...",
    comparePlaceholder: "మరొక నగరాన్ని సరిపోల్చండి...",
    chatPlaceholder: "వాతావరణం గురించి ఏదైనా అడగండి...",
    today: "ఈరోజు",
    tomorrow: "రేపు",
  },
  mr: {
    tagline: 'हवामानाबद्दल काहीही विचारा.',
    searchBtn: 'शोधा',
    compareBtn: 'तुलना करा',
    askGptBtn: 'RituGPT ला विचारा',
    navAiBtn: 'एआय विश्लेषण',
    navAqiBtn: 'हवेची गुणवत्ता',
    navTrendsBtn: 'हवामान ट्रेंड्स',
    compareTitle: 'दोन शहरांच्या हवामानाची तुलना',
    feelsLike: 'जाणवणारे तापमान',
    humidity: 'आर्द्रता',
    wind: 'वाऱ्याचा वेग',
    windDir: 'वाऱ्याची दिशा',
    uv: 'यूव्ही इंडेक्स',
    rain: 'पाऊस',
    sunrise: 'सूर्योदय',
    sunset: 'सूर्यास्त',
    radarTitle: 'वेदर रडार आणि पावसाचा नकाशा',
    radarHint: 'थेट सॅटेलाइट पाऊस कव्हरेज',
    hourlyTitle: 'तासनिहाय अंदाज',
    hourlyHint: '२४ तासांची प्रगती',
    dailyTitle: '७ दिवसांचा अंदाज',
    dailyHint: 'साप्ताहिक अंदाज',
    trendsTitle: 'हवामान ट्रेंड्स व विश्लेषण',
    footer: 'Open-Meteo हवामान डेटा. Google Gemini AI.',
    multimodelTitle: 'मल्टी-मॉडेल एकत्रित अंदाज आणि निर्णय प्रणाली',
    modelBreakdownBtn: 'मॉडेलनुसार तपशील',
    evaluatingConsensus: 'सहमतीचे मूल्यांकन सुरू आहे...',
    consensusAgreement: 'मॉडेल सहमती करार',
    decisionsTitle: 'अपेक्षित एआय शिफारसी (मल्टी-मॉडेल आधारित)',
    evaluating: 'मूल्यांकन सुरू आहे...',
    decFitnessLabel: 'मैदानी व्यायाम आणि खेळ',
    decRainLabel: 'पावसाचा धोका / बाहेरील कार्यक्रम',
    decLaundryLabel: 'कपडे धुणे आणि उन्हात वाळवणे',
    decMaskLabel: 'आरोग्य आणि प्रदूषण सुरक्षा',
    probableTempLabel: 'अपेक्षित कमाल तापमान',
    probableSpreadLabel: 'मॉडेल तफावत / प्रसार',
    probablePrecipLabel: 'अपेक्षित एकूण पाऊस',
    probableAgreementLabel: 'पाऊस मॉडेल सहमती',
    breakdownTitle: 'थेट वैयक्तिक हवामान मॉडेल तपशील (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'स्थिती',
    modelRain: 'एकूण पाऊस',
    modelWind: 'कमाल वारा',
    fitness_favorable: 'अत्यंत अनुकूल — मैदानी धावणे आणि खेळांसाठी उत्तम परिस्थिती.',
    fitness_caution: 'काळजी घ्या — तीव्र उष्णता. पुरेसे पाणी प्या आणि दुपारचे कडक ऊन टाळा.',
    fitness_indoor: 'घरामध्ये व्यायामाचा सल्ला — बाहेर पाऊस पडत आहे.',
    fitness_pollution: 'बाहेर जास्त कष्ट टाळा — व्यायामासाठी हवेची गुणवत्ता खालावली आहे.',
    rain_low: 'कमी धोका — सर्व मॉडेल्स कोरड्या हवामानाचा अंदाज वर्तवत आहेत.',
    rain_high: 'पावसाचा मोठा धोका — अनेक मॉडेल्सनी पाऊस निश्चित केला आहे. छत्री सोबत ठेवा!',
    rain_moderate: 'मध्यम पावसाचा धोका — हलक्या सरी कोसळण्याची शक्यता आहे. पर्यायी तयारी ठेवा.',
    laundry_optimal: 'वाळवण्यासाठी उत्तम — उबदार तापमान आणि योग्य वारा अनुकूल आहे.',
    laundry_indoor: 'घरात कपडे वाळवण्याचा सल्ला — बाहेर कपडे भिजण्याची दाट शक्यता आहे.',
    laundry_slow: 'हळूहळू वाळतील — हवेमध्ये आर्द्रतेचे प्रमाण जास्त आहे.',
    mask_clear: 'स्वच्छ हवा — सर्वसामान्यांना मास्क वापरण्याची गरज नाही.',
    mask_mandatory: 'N95 मास्क अनिवार्य — गंभीर प्रदूषण इशारा. खिडक्या बंद ठेवा.',
    mask_recommended: 'N95 मास्कचा सल्ला — संवेदनशील व्यक्ती आणि दम्याच्या रुग्णांनी खबरदारी घ्यावी.',
    condition: "हवामान स्थिती",
    searchPlaceholder: "कोणतेही शहर किंवा निर्देशांक शोधा...",
    comparePlaceholder: "दुसऱ्या शहराशी तुलना करा...",
    chatPlaceholder: "हवामानाबद्दल काहीही विचारा...",
    today: "आज",
    tomorrow: "उद्या",
  },
  gu: {
    tagline: 'હવામાન વિશે કંઈપણ પૂછો.',
    searchBtn: 'શોધો',
    compareBtn: 'સરખામણી કરો',
    askGptBtn: 'RituGPT ને પૂછો',
    navAiBtn: 'AI વિશ્લેષણ',
    navAqiBtn: 'હવાની ગુણવત્તા',
    navTrendsBtn: 'હવામાન વલણ',
    compareTitle: 'બે શહેરોના હવામાનની સરખામણી',
    feelsLike: 'અનુભવાતું તાપમાન',
    humidity: 'ભેજ',
    wind: 'પવનની ઝડપ',
    windDir: 'પવનની દિશા',
    uv: 'યુવી ઈન્ડેક્સ',
    rain: 'વરસાદ',
    sunrise: 'સૂર્યોદય',
    sunset: 'સૂર્યાસ્ત',
    radarTitle: 'વેધર રડાર અને વરસાદ નકશો',
    radarHint: 'લાઈવ સેટેલાઈટ વરસાદ કવરેજ',
    hourlyTitle: 'કલાકદીઠ આગાહી',
    hourlyHint: '૨૪ કલાકની પ્રગતિ',
    dailyTitle: '૭ દિવસની આગાહી',
    dailyHint: 'સાપ્તાહિક દ્રષ્ટિકોણ',
    trendsTitle: 'હવામાન વિશ્લેષણ',
    footer: 'Open-Meteo ડેટા. Google Gemini AI.',
    multimodelTitle: 'મલ્ટી-મોડેલ અનુમાન અને નિર્ણય એન્જિન',
    modelBreakdownBtn: 'મોડેલ મુજબની વિગતો',
    evaluatingConsensus: 'સહમતિનું મૂલ્યાંકન ચાલુ છે...',
    consensusAgreement: 'મોડેલ સહમતિ કરાર',
    decisionsTitle: 'સંભવિત AI ભલામણો (મલ્ટી-મોડેલ આધારિત)',
    evaluating: 'મૂલ્યાંકન ચાલુ છે...',
    decFitnessLabel: 'આઉટડોર ફિટનેસ અને રમતગમત',
    decRainLabel: 'વરસાદનું જોખમ / આઉટડોર ઇવેન્ટ',
    decLaundryLabel: 'કપડાં ધોવા અને તડકામાં સૂકવવા',
    decMaskLabel: 'આરોગ્ય અને પ્રદૂષણ સુરક્ષા',
    probableTempLabel: 'સંભવિત મહત્તમ તાપમાન',
    probableSpreadLabel: 'મોડેલ તફાવત / પ્રસાર',
    probablePrecipLabel: 'સંભવિત કુલ વરસાદ',
    probableAgreementLabel: 'વરસાદ મોડેલ સહમતિ',
    breakdownTitle: 'લાઇવ વ્યક્તિગત હવામાન મોડેલ વિગત (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'સ્થિતિ',
    modelRain: 'કુલ વરસાદ',
    modelWind: 'મહત્તમ પવન',
    fitness_favorable: 'અત્યંત અનુકૂળ — આઉટડોર દોડ અને રમતગમત માટે ઉત્તમ હવામાન.',
    fitness_caution: 'સાવચેતી રાખો — વધુ પડતી ગરમી. પાણી પીવો અને બપોરના તડકાથી બચો.',
    fitness_indoor: 'ઇન્ડોર કસરત કરવાની સલાહ — બહાર વરસાદ પડી રહ્યો છે.',
    fitness_pollution: 'બહાર વધુ શ્રમ ટાળો — કસરત માટે હવાની ગુણવત્તા ખરાબ છે.',
    rain_low: 'ઓછું જોખમ — તમામ મોડેલો શુષ્ક હવામાનની આગાહી કરે છે.',
    rain_high: 'વરસાદનું મોટું જોખમ — બહુવિધ મોડેલો વરસાદની પુષ્ટિ કરે છે. છત્રી સાથે રાખો!',
    rain_moderate: 'મધ્યમ વરસાદનું જોખમ — હળવા ઝાપટાં શક્ય છે. વૈકલ્પિક આયોજન રાખો.',
    laundry_optimal: 'સૂકવવા માટે શ્રેષ્ઠ — હુંફાળું તાપમાન અને અનુકૂળ પવન.',
    laundry_indoor: 'ઘરમાં કપડાં સૂકવવાની સલાહ — બહાર કપડાં પલળી જવાની શક્યતા છે.',
    laundry_slow: 'ધીમેથી સૂકાશે — હવામાં ભેજનું પ્રમાણ ઘણું વધારે છે.',
    mask_clear: 'સ્વચ્છ હવા — સામાન્ય લોકો માટે માસ્ક જરૂરી નથી.',
    mask_mandatory: 'N95 માસ્ક ફરજિયાત — ગંભીર પ્રદૂષણ ચેતવણી. બારીઓ બંધ રાખો.',
    mask_recommended: 'N95 માસ્કની ભલામણ — અસ્થમા અને સંવેદનશીલ જૂથો સાવચેતી રાખે.',
    condition: "હવામાન સ્થિતિ",
    searchPlaceholder: "કોઈપણ શહેર અથવા કોઓર્ડિનેટ્સ શોધો...",
    comparePlaceholder: "બીજા શહેર સાથે સરખામણી કરો...",
    chatPlaceholder: "હવામાન વિશે કંઈપણ પૂછો...",
    today: "આજે",
    tomorrow: "આવતીકાલે",
  },
  kn: {
    tagline: 'ಹವಾಮಾನದ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ.',
    searchBtn: 'ಹುಡುಕಿ',
    compareBtn: 'ಹೋಲಿಸಿ',
    askGptBtn: 'RituGPT ಕೇಳಿ',
    navAiBtn: 'AI ವಿಶ್ಲೇಷಣೆ',
    navAqiBtn: 'ವಾಯು ಗುಣಮಟ್ಟ',
    navTrendsBtn: 'ಹವಾಮಾನ ಪ್ರವೃತ್ತಿ',
    compareTitle: 'ಎರಡು ನಗರಗಳ ಹವಾಮಾನ ಹೋಲಿಕೆ',
    feelsLike: 'ಅನಿಸುವ ತಾಪಮಾನ',
    humidity: 'ತೇವಾಂಶ',
    wind: 'ಗಾಳಿಯ ವೇಗ',
    windDir: 'ಗಾಳಿಯ ದಿಕ್ಸೂಚಿ',
    uv: 'ಯುವಿ ಇಂಡೆಕ್ಸ್',
    rain: 'ಮಳೆ',
    sunrise: 'ಸೂರ್ಯೋದಯ',
    sunset: 'ಸೂರ್ಯಾಸ್ತ',
    radarTitle: 'ವೆದರ್ ರೇಡಾರ್ & ಮಳೆ ನಕ್ಷೆ',
    radarHint: 'ಲೈವ್ ಉಪಗ್ರಹ ಮಳೆ ಮಾಹಿತಿ',
    hourlyTitle: 'ಗಂಟೆಯ ಮುನ್ನೋಟ',
    hourlyHint: '24 ಗಂಟೆಗಳ ಪ್ರಗತಿ',
    dailyTitle: '7 ದಿನಗಳ ಮುನ್ನೋಟ',
    dailyHint: 'ವಾರದ ಮುನ್ನೋಟ',
    trendsTitle: 'ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ',
    footer: 'Open-Meteo ಹವಾಮಾನ ಮಾಹಿತಿ. Google Gemini AI.',
    multimodelTitle: 'ಮಲ್ಟಿ-ಮಾದರಿ ಸಮಷ್ಟಿ ಮತ್ತು ನಿರ್ಧಾರ ಇಂಜಿನ್',
    modelBreakdownBtn: 'ಮಾದರಿವಾರು ವಿವರ',
    evaluatingConsensus: 'ಒಮ್ಮತದ ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    consensusAgreement: 'ಮಾದರಿ ಒಮ್ಮತ ಒಪ್ಪಂದ',
    decisionsTitle: 'ಸಂಭಾವ್ಯ AI ಶಿಫಾರಸುಗಳು (ಮಲ್ಟಿ-ಮಾದರಿ ಆಧಾರಿತ)',
    evaluating: 'ಮೌಲ್ಯಮಾಪನ ಮಾಡಲಾಗುತ್ತಿದೆ...',
    decFitnessLabel: 'ಹೊರಾಂಗಣ ಫಿಟ್‌ನೆಸ್ & ಕ್ರೀಡೆಗಳು',
    decRainLabel: 'ಮಳೆಯ ಅಪಾಯ / ಹೊರಾಂಗಣ ಕಾರ್ಯಕ್ರಮ',
    decLaundryLabel: 'ಬಟ್ಟೆ ಒಗೆಯುವುದು ಮತ್ತು ಬಿಸಿಲಿನಲ್ಲಿ ಒಣಗಿಸುವುದು',
    decMaskLabel: 'ಆರೋಗ್ಯ ಮತ್ತು ಮಾಲಿನ್ಯ ರಕ್ಷಣೆ',
    probableTempLabel: 'ಸಂಭಾವ್ಯ ಗರಿಷ್ಠ ತಾಪಮಾನ',
    probableSpreadLabel: 'ಮಾದರಿ ವ್ಯತ್ಯಾಸ / ಹರಡುವಿಕೆ',
    probablePrecipLabel: 'ಸಂಭಾವ್ಯ ಒಟ್ಟು ಮಳೆ',
    probableAgreementLabel: 'ಮಳೆ ಮಾದರಿ ಒಮ್ಮತ',
    breakdownTitle: 'ಲೈವ್ ಪ್ರತ್ಯೇಕ ಹವಾಮಾನ ಮಾದರಿ ವಿವರಣೆ (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'ಸ್ಥಿತಿ',
    modelRain: 'ಒಟ್ಟು ಮಳೆ',
    modelWind: 'ಗರಿಷ್ಠ ಗಾಳಿ',
    fitness_favorable: 'ಅತ್ಯಂತ ಅನುಕೂಲಕರ — ಹೊರಾಂಗಣ ಓಟ ಮತ್ತು ಕ್ರೀಡೆಗಳಿಗೆ ಉತ್ತಮ ವಾತಾವರಣ.',
    fitness_caution: 'ಎಚ್ಚರಿಕೆ ವಹಿಸಿ — ಅತಿಯಾದ ಬಿಸಿಲು. ಹೆಚ್ಚು ನೀರು ಕುಡಿಯಿರಿ ಮತ್ತು ಮಧ್ಯಾಹ್ನದ ಬಿಸಿಲನ್ನು ತಪ್ಪಿಸಿ.',
    fitness_indoor: 'ಒಳಾಂಗಣ ವ್ಯಾಯಾಮ ಸಲಹೆ — ಹೊರಗೆ ಮಳೆ ಬೀಳುತ್ತಿದೆ.',
    fitness_pollution: 'ಹೊರಾಂಗಣ ಶ್ರಮವನ್ನು ಕಡಿಮೆ ಮಾಡಿ — ವ್ಯಾಯಾಮಕ್ಕೆ ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಹದಗೆಟ್ಟಿದೆ.',
    rain_low: 'ಕಡಿಮೆ ಅಪಾಯ — ಎಲ್ಲಾ ಮಾದರಿಗಳು ಒಣ ಹವಾಮಾನವನ್ನು ಊಹಿಸುತ್ತವೆ.',
    rain_high: 'ಹೆಚ್ಚಿನ ಮಳೆಯ ಅಪಾಯ — ಹಲವು ಮಾದರಿಗಳು ಮಳೆಯನ್ನು ಖಚಿತಪಡಿಸಿವೆ. ಕೊಡೆ ಜೊತೆಗೆ ಇರಲಿ!',
    rain_moderate: 'ಮಧ್ಯಮ ಮಳೆಯ ಅಪಾಯ — ಸಾಧಾರಣ ತುಂತುರು ಮಳೆ ಸಾಧ್ಯತೆ. ಪರ್ಯಾಯ ಯೋಜನೆ ಇರಲಿ.',
    laundry_optimal: 'ಒಣಗಿಸಲು ಉತ್ತಮ — ಬೆಚ್ಚಗಿನ ತಾಪಮಾನ ಮತ್ತು ತಂಗಾಳಿ ಅನುಕೂಲಕರವಾಗಿದೆ.',
    laundry_indoor: 'ಮನೆಯೊಳಗೆ ಒಣಗಿಸಲು ಸಲಹೆ — ಹೊರಗೆ ಬಟ್ಟೆಗಳು ಒದ್ದೆಯಾಗುವ ಸಂಭವವಿದೆ.',
    laundry_slow: 'ನಿಧಾನವಾಗಿ ಒಣಗುತ್ತದೆ — ಗಾಳಿಯಲ್ಲಿ ತೇವಾಂಶ ಅಧಿಕವಾಗಿದೆ.',
    mask_clear: 'ಸ್ವಚ್ಛ ಗಾಳಿ — ಸಾರ್ವಜನಿಕರಿಗೆ ಮಾಸ್ಕ್ ಅಗತ್ಯವಿಲ್ಲ.',
    mask_mandatory: 'N95 ಮಾಸ್ಕ್ ಕಡ್ಡಾಯ — ತೀವ್ರ ಮಾಲಿನ್ಯ ಎಚ್ಚರಿಕೆ. ಕಿಟಕಿಗಳನ್ನು ಮುಚ್ಚಿಡಿ.',
    mask_recommended: 'N95 ಮಾಸ್ಕ್ ಧರಿಸಲು ಸಲಹೆ — ಸೂಕ್ಷ್ಮ ಆರೋಗ್ಯದವರು ಮತ್ತು ಅಸ್ತಮಾ ರೋಗಿಗಳು ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.',
    condition: "ಹವಾಮಾನ ಸ್ಥಿತಿ",
    searchPlaceholder: "ಯಾವುದೇ ನಗರ ಅಥವಾ ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಹುಡುಕಿ...",
    comparePlaceholder: "ಮತ್ತೊಂದು ನಗರವನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ...",
    chatPlaceholder: "ಹವಾಮಾನದ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...",
    today: "ಇಂದು",
    tomorrow: "ನಾಳೆ",
  },
  pa: {
    tagline: 'ਮੌਸਮ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ।',
    searchBtn: 'ਖੋਜੋ',
    compareBtn: 'ਤੁਲਨਾ ਕਰੋ',
    askGptBtn: 'RituGPT ਨੂੰ ਪੁੱਛੋ',
    navAiBtn: 'AI ਵਿਸ਼ਲੇਸ਼ਣ',
    navAqiBtn: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ',
    navTrendsBtn: 'ਮੌਸਮ ਦੇ ਰੁਝਾਨ',
    compareTitle: 'ਦੋ ਸ਼ਹਿਰਾਂ ਦੇ ਮੌਸਮ ਦੀ ਤੁਲਨਾ',
    feelsLike: 'ਮਹਿਸੂਸ ਹੁੰਦਾ ਹੈ',
    humidity: 'ਨਮੀ',
    wind: 'ਹਵਾ ਦੀ ਗਤੀ',
    windDir: 'ਹਵਾ ਦੀ ਦਿਸ਼ਾ',
    uv: 'ਯੂਵੀ ਇੰਡੈਕਸ',
    rain: 'ਮੀਂਹ',
    sunrise: 'ਸੂਰਜ ਚੜ੍ਹਨਾ',
    sunset: 'ਸੂਰਜ ਛਿਪਣਾ',
    radarTitle: 'ਮੌਸਮ ਰਡਾਰ ਅਤੇ ਮੀਂਹ ਦਾ ਨਕਸ਼ਾ',
    radarHint: 'ਲਾਈਵ ਸੈਟੇਲਾਈਟ ਬਾਰਸ਼ ਕਵਰੇਜ',
    hourlyTitle: 'ਗੰਟੇਵਾਰ ਪੂਰਵ-ਅਨੁਮਾਨ',
    hourlyHint: '24 ਘੰਟੇ ਦੀ ਤਰੱਕੀ',
    dailyTitle: '7 ਦਿਨਾਂ ਦਾ ਪੂਰਵ-ਅਨੁਮਾਨ',
    dailyHint: 'ਹਫ਼ਤਾਵਾਰੀ ਦ੍ਰਿਸ਼ਟੀਕੋਣ',
    trendsTitle: 'ਮੌਸਮ ਦੇ ਰੁਝਾਨ',
    footer: 'Open-Meteo ਮੌਸਮ ਡੇਟਾ। Google Gemini AI.',
    multimodelTitle: 'ਮਲਟੀ-ਮਾਡਲ ਸੰਗ੍ਰਹਿ ਅਤੇ ਫੈਸਲਾ ਇੰਜਣ',
    modelBreakdownBtn: 'ਮਾਡਲ-ਵਾਰ ਵੇਰਵਾ',
    evaluatingConsensus: 'ਸਹਿਮਤੀ ਦਾ ਮੁਲਾਂਕਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    consensusAgreement: 'ਮਾਡਲ ਸਹਿਮਤੀ ਸਮਝੌਤਾ',
    decisionsTitle: 'ਸੰਭਾਵੀ ਏਆਈ ਸਿਫ਼ਾਰਸ਼ਾਂ (ਮਲਟੀ-ਮਾਡਲ ਅਧਾਰਿਤ)',
    evaluating: 'ਮੁਲਾਂਕਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...',
    decFitnessLabel: 'ਬਾਹਰੀ ਫਿਟਨੈਸ ਅਤੇ ਖੇਡਾਂ',
    decRainLabel: 'ਮੀਂਹ ਦਾ ਖਤਰਾ / ਬਾਹਰੀ ਸਮਾਗਮ',
    decLaundryLabel: 'ਕੱਪੜੇ ਧੋਣਾ ਅਤੇ ਧੁੱਪੇ ਸੁਕਾਉਣਾ',
    decMaskLabel: 'ਸਿਹਤ ਅਤੇ ਪ੍ਰਦੂਸ਼ਣ ਰੋਕਥਾਮ ਕਾਰਵਾਈ',
    probableTempLabel: 'ਸੰਭਾਵੀ ਅਧਿਕਤਮ ਤਾਪਮਾਨ',
    probableSpreadLabel: 'ਮਾਡਲ ਅੰਤਰ / ਪ੍ਰਸਾਰ',
    probablePrecipLabel: 'ਸੰਭਾਵੀ ਕੁੱਲ ਮੀਂਹ',
    probableAgreementLabel: 'ਮੀਂਹ ਮਾਡਲ ਸਹਿਮਤੀ',
    breakdownTitle: 'ਲਾਈਵ ਨਿੱਜੀ ਮੌਸਮ ਮਾਡਲ ਵੇਰਵਾ (IMD, NOAA GFS, ECMWF, ICON, GEM, ARPEGE)',
    modelCondition: 'ਸਥਿਤੀ',
    modelRain: 'ਕੁੱਲ ਮੀਂਹ',
    modelWind: 'ਅਧਿਕਤਮ ਹਵਾ',
    fitness_favorable: 'ਬਹੁਤ ਅਨੁਕੂਲ — ਬਾਹਰ ਦੌੜਨ ਅਤੇ ਖੇਡਾਂ ਲਈ ਵਧੀਆ ਮੌਸਮ।',
    fitness_caution: 'ਸਾਵਧਾਨੀ ਵਰਤੋ — ਬਹੁਤ ਜ਼ਿਆਦਾ ਗਰਮੀ। ਪਾਣੀ ਪੀਓ ਅਤੇ ਦੁਪਹਿਰ ਦੀ ਧੁੱਪ ਤੋਂ ਬਚੋ।',
    fitness_indoor: 'ਘਰ ਦੇ ਅੰਦਰ ਕਸਰਤ ਕਰਨ ਦੀ ਸਲਾਹ — ਬਾਹਰ ਮੀਂਹ ਪੈ ਰਿਹਾ ਹੈ।',
    fitness_pollution: 'ਬਾਹਰੀ ਮਿਹਨਤ ਘਟਾਓ — ਕਸਰਤ ਲਈ ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਖਰਾਬ ਹੈ।',
    rain_low: 'ਘੱਟ ਖਤਰਾ — ਸਾਰੇ ਮਾਡਲ ਖੁਸ਼ਕ ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕਰ ਰਹੇ ਹਨ।',
    rain_high: 'ਮੀਂਹ ਦਾ ਭਾਰੀ ਖਤਰਾ — ਕਈ ਮਾਡਲਾਂ ਨੇ ਮੀਂਹ ਦੀ ਪੁਸ਼ਟੀ ਕੀਤੀ। ਛਤਰੀ ਜ਼ਰੂਰ ਰੱਖੋ!',
    rain_moderate: 'ਦਰਮਿਆਨਾ ਮੀਂਹ ਦਾ ਖਤਰਾ — ਹਲਕੀ ਬਾਰਿਸ਼ ਸੰਭਵ ਹੈ। ਬਦਲਵੀਂ ਯੋਜਨਾ ਰੱਖੋ।',
    laundry_optimal: 'ਸੁਕਾਉਣ ਲਈ ਉੱਤਮ — ਨਿੱਘਾ ਤਾਪਮਾਨ ਅਤੇ ਸੁਹਾਵਣੀ ਹਵਾ।',
    laundry_indoor: 'ਘਰ ਦੇ ਅੰਦਰ ਸੁਕਾਉਣ ਦੀ ਸਲਾਹ — ਬਾਹਰ ਕੱਪੜੇ ਗਿੱਲੇ ਹੋਣ ਦੀ ਪੂਰੀ ਸੰਭਾਵਨਾ ਹੈ।',
    laundry_slow: 'ਹੌਲੀ ਸੁੱਕਣਗੇ — ਹਵਾ ਵਿੱਚ ਨਮੀ ਬਹੁਤ ਜ਼ਿਆਦਾ ਹੈ।',
    mask_clear: 'ਸਾਫ਼ ਹਵਾ — ਆਮ ਲੋਕਾਂ ਲਈ ਮਾਸਕ ਦੀ ਲੋੜ ਨਹੀਂ ਹੈ।',
    mask_mandatory: 'N95 ਮਾਸਕ ਲਾਜ਼ਮੀ — ਗੰਭੀਰ ਪ੍ਰਦੂਸ਼ਣ ਚਿਤਾਵਨੀ। ਖਿੜਕੀਆਂ ਬੰਦ ਰੱਖੋ।',
    mask_recommended: 'N95 ਮਾਸਕ ਦੀ ਸਿਫ਼ਾਰਸ਼ — ਦਮੇ ਦੇ ਮਰੀਜ਼ ਅਤੇ ਸੰਵੇਦਨਸ਼ੀਲ ਲੋਕ ਸਾਵਧਾਨੀ ਵਰਤਣ।',
    condition: "ਮੌਸਮ ਦੀ ਸਥਿਤੀ",
    searchPlaceholder: "ਕੋਈ ਵੀ ਸ਼ਹਿਰ ਜਾਂ ਕੋਆਰਡੀਨੇਟ ਖੋਜੋ...",
    comparePlaceholder: "ਦੂਜੇ ਸ਼ਹਿਰ ਨਾਲ ਤੁਲਨਾ ਕਰੋ...",
    chatPlaceholder: "ਮੌਸਮ ਬਾਰੇ ਕੁਝ ਵੀ ਪੁੱਛੋ...",
    today: "ਅੱਜ",
    tomorrow: "ਭਲਕੇ",
  }
};

/* =========================================
   Multilingual AQI Intelligence Dictionary
   ========================================= */
const AQI_TRANSLATIONS = {
  en: {
    title: 'Air Quality Index (AQI)',
    loading: 'Loading live air quality data...',
    ozone: 'Ozone (O₃)',
    indexLabel: 'Index',
    statuses: {
      good: 'Good',
      moderate: 'Moderate',
      sensitive: 'Unhealthy for Sensitive Groups',
      unhealthy: 'Unhealthy',
      'very-unhealthy': 'Very Unhealthy',
      hazardous: 'Hazardous'
    },
    advice: {
      good: 'Air quality is satisfactory, and air pollution poses little or no risk. Enjoy outdoor activities!',
      moderate: 'Air quality is acceptable. However, unusually sensitive people should consider reducing prolonged outdoor exertion.',
      sensitive: 'Members of sensitive groups (children, elderly, asthmatics) may experience health effects. Wear a mask outdoors.',
      unhealthy: 'Everyone may begin to experience health effects. Limit prolonged outdoor activities and wear an N95 mask.',
      'very-unhealthy': 'Health alert: everyone may experience more serious health effects. Avoid outdoor exertion and keep windows closed.',
      hazardous: 'Health warning of emergency conditions. Everyone should remain indoors and use air purifiers.'
    }
  },
  hi: {
    title: 'वायु गुणवत्ता सूचकांक (AQI)',
    loading: 'लाइव वायु गुणवत्ता डेटा लोड हो रहा है...',
    ozone: 'ओजोन (O₃)',
    indexLabel: 'सूचकांक',
    statuses: {
      good: 'अच्छा',
      moderate: 'मध्यम',
      sensitive: 'संवेदनशील समूहों के लिए अस्वास्थ्यकर',
      unhealthy: 'अस्वास्थ्यकर',
      'very-unhealthy': 'बहुत अस्वास्थ्यकर',
      hazardous: 'खतरनाक'
    },
    advice: {
      good: 'वायु गुणवत्ता संतोषजनक है, और प्रदूषण से कोई जोखिम नहीं है। बाहरी गतिविधियों का आनंद लें!',
      moderate: 'वायु गुणवत्ता स्वीकार्य है। हालांकि, संवेदनशील लोगों को लंबे समय तक बाहरी मेहनत कम करनी चाहिए।',
      sensitive: 'संवेदनशील समूहों (बच्चों, बुजुर्गों, अस्थमा रोगियों) पर असर पड़ सकता है। बाहर मास्क पहनें।',
      unhealthy: 'हर किसी के स्वास्थ्य पर असर पड़ सकता है। लंबे समय तक बाहर रहने से बचें और N95 मास्क पहनें।',
      'very-unhealthy': 'स्वास्थ्य चेतावनी: गंभीर स्वास्थ्य प्रभाव पड़ सकते हैं। बाहर जाने से बचें और खिड़कियां बंद रखें।',
      hazardous: 'आपातकालीन स्वास्थ्य चेतावनी। सभी को घर के अंदर रहना चाहिए और एयर प्यूरीफायर का उपयोग करना चाहिए।'
    }
  },
  bn: {
    title: 'বায়ু মান সূচক (AQI)',
    loading: 'লাইভ বায়ু মানের তথ্য লোড হচ্ছে...',
    ozone: 'ওজোন (O₃)',
    indexLabel: 'সূচক',
    statuses: {
      good: 'ভালো',
      moderate: 'মাঝারি',
      sensitive: 'সংবেদনশীলদের জন্য অস্বাস্থ্যকর',
      unhealthy: 'অস্বাস্থ্যকর',
      'very-unhealthy': 'খুব অস্বাস্থ্যকর',
      hazardous: 'বিপজ্জনক'
    },
    advice: {
      good: 'বাতাসের মান সন্তোষজনক এবং দূষণের কোনো ঝুঁকি নেই। বাইরের কাজকর্ম নিশ্চিন্তে উপভোগ করুন!',
      moderate: 'বায়ুর মান গ্রহণযোগ্য। তবে সংবেদনশীল ব্যক্তিদের দীর্ঘ সময় বাইরে অতিরিক্ত পরিশ্রম কমানো উচিত।',
      sensitive: 'সংবেদনশীল ব্যক্তিরা (শিশু, বৃদ্ধ, হাঁপানি রোগী) অসুস্থতা অনুভব করতে পারেন। বাইরে মাস্ক পরুন।',
      unhealthy: 'সবার স্বাস্থ্যের ওপর প্রভাব পড়তে পারে। বেশিক্ষণ বাইরে থাকা এড়িয়ে চলুন এবং N95 মাস্ক পরুন।',
      'very-unhealthy': 'স্বাস্থ্য সতর্কতা: গুরুতর শারীরিক সমস্যা দেখা দিতে পারে। বাইরে পরিশ্রম এড়িয়ে চলুন ও জানালা বন্ধ রাখুন।',
      hazardous: 'জরুরি স্বাস্থ্য সতর্কতা। সবাইকে ঘরের ভেতরে থাকা এবং এয়ার পিউরিফায়ার ব্যবহারের পরামর্শ দেওয়া হচ্ছে।'
    }
  },
  ta: {
    title: 'காற்றுத் தரக் குறியீடு (AQI)',
    loading: 'நேரலை காற்றின் தரத் தரவு ஏற்றப்படுகிறது...',
    ozone: 'ஓசோன் (O₃)',
    indexLabel: 'குறியீடு',
    statuses: {
      good: 'நல்லது',
      moderate: 'மிதமானது',
      sensitive: 'உணர்திறன் கொண்டோருக்கு ஆரோக்கியமற்றது',
      unhealthy: 'ஆரோக்கியமற்றது',
      'very-unhealthy': 'மிகவும் ஆரோக்கியமற்றது',
      hazardous: 'ஆபத்தானது'
    },
    advice: {
      good: 'காற்றின் தரம் திருப்திகரமாக உள்ளது, மாசுக் காற்று ஆபத்தை ஏற்படுத்தாது. வெளிப்புற நிகழ்வுகளை அனுபவியுங்கள்!',
      moderate: 'காற்றின் தரம் ஏற்றுக்கொள்ளத்தக்கது. ஆனால் உணர்திறன் கொண்டவர்கள் நீண்ட நேர வெளிப்புற உழைப்பைக் குறைக்கவும்.',
      sensitive: 'முதியவர்கள், குழந்தைகள் மற்றும் ஆஸ்துமா உள்ளவர்கள் பாதிக்கப்படலாம். வெளியே முகக்கவசம் அணியுங்கள்.',
      unhealthy: 'அனைவருக்கும் உடல்நலப் பாதிப்புகள் ஏற்படலாம். வெளிப்புறச் செயல்பாடுகளைக் கட்டுப்படுத்தி N95 முகக்கவசம் அணியுங்கள்.',
      'very-unhealthy': 'சுகாதார எச்சரிக்கை: தீவிர பாதிப்புகள் ஏற்படலாம். வெளிப்புற உழைப்பைத் தவிர்த்து ஜன்னல்களை மூடுங்கள்.',
      hazardous: 'அவசரகால சுகாதார எச்சரிக்கை. அனைவரும் வீட்டிற்குள் இருக்க வேண்டும், காற்று சுத்திகரிப்பான் பயன்படுத்தவும்.'
    }
  },
  te: {
    title: 'గాలి నాణ్యత సూచిక (AQI)',
    loading: 'ప్రత్యక్ష గాలి నాణ్యత డేటా లోడ్ అవుతోంది...',
    ozone: 'ఓజోన్ (O₃)',
    indexLabel: 'సూచిక',
    statuses: {
      good: 'మంచిది',
      moderate: 'మధ్యస్థం',
      sensitive: 'సున్నిత వర్గాలకు అనారోగ్యకరం',
      unhealthy: 'అనారోగ్యకరం',
      'very-unhealthy': 'చాలా అనారోగ్యకరం',
      hazardous: 'ప్రమాదకరమైనది'
    },
    advice: {
      good: 'గాలి నాణ్యత సంతృప్తికరంగా ఉంది, ఎటువంటి ముప్పు లేదు. బహిరంగ కార్యకలాపాలను ఆస్వాదించండి!',
      moderate: 'గాలి నాణ్యత ఆమోదయోగ్యమైనది. అయితే సున్నిత వ్యక్తులు ఎక్కువ సమయం బయట శ్రమించకూడదు.',
      sensitive: 'సున్నిత వర్గాలు (పిల్లలు, వృద్ధులు, ఆస్తమా రోగులు) ప్రభావితం కావచ్చు. బయట మాస్క్ ధరించండి.',
      unhealthy: 'అందరికీ ఆరోగ్య ప్రభావాలు ప్రారంభం కావచ్చు. ఎక్కువ సేపు బయట ఉండకండి, N95 మాస్క్ ధరించండి.',
      'very-unhealthy': 'తీవ్ర ఆరోగ్య హెచ్చరిక: మరింత తీవ్ర ప్రభావాలు ఉండవచ్చు. బయటకు వెళ్లకండి మరియు కిటికీలు మూసివేయండి.',
      hazardous: 'అత్యవసర ఆరోగ్య హెచ్చరిక. ప్రతి ఒక్కరూ ఇళ్లలోనే ఉండాలి మరియు ఎయిర్ ప్యూరిఫైయర్లను ఉపయోగించాలి.'
    }
  },
  mr: {
    title: 'हवा गुणवत्ता निर्देशांक (AQI)',
    loading: 'थेट हवा गुणवत्ता डेटा लोड होत आहे...',
    ozone: 'ओझोन (O₃)',
    indexLabel: 'निर्देशांक',
    statuses: {
      good: 'चांगली',
      moderate: 'मध्यम',
      sensitive: 'संवेदनशील व्यक्तींसाठी अस्वास्थ्यकर',
      unhealthy: 'अस्वास्थ्यकर',
      'very-unhealthy': 'अतिशय अस्वास्थ्यकर',
      hazardous: 'धोकादायक'
    },
    advice: {
      good: 'हवेची गुणवत्ता समाधानकारक आहे, प्रदूषणाचा कोणताही धोका नाही. मैदानी उपक्रमांचा आनंद घ्या!',
      moderate: 'हवेची गुणवत्ता स्वीकार्य आहे. तथापि, संवेदनशील व्यक्तींनी जास्त वेळ बाहेर शारीरिक कष्ट टाळावेत.',
      sensitive: 'संवेदनशील व्यक्तींवर (मुले, वृद्ध, दम्याचे रुग्ण) परिणाम होऊ शकतो. बाहेर मास्क वापरा.',
      unhealthy: 'सर्वांच्या आरोग्यावर परिणाम होऊ शकतो. जास्त वेळ बाहेर राहणे टाळा आणि N95 मास्क वापरा.',
      'very-unhealthy': 'आरोग्य इशारा: प्रत्येकावर गंभीर परिणाम होऊ शकतात. बाहेर जाणे टाळा आणि खिडक्या बंद ठेवा.',
      hazardous: 'आणीबाणीची आरोग्य चेतावणी. सर्वांनी घरामध्येच राहावे आणि एअर प्युरिफायर वापरावे.'
    }
  },
  gu: {
    title: 'વાયુ ગુણવત્તા સૂચકાંક (AQI)',
    loading: 'લાઇવ વાયુ ગુણવત્તા ડેટા લોડ થઈ રહ્યો છે...',
    ozone: 'ઓઝોન (O₃)',
    indexLabel: 'સૂચકાંક',
    statuses: {
      good: 'સારી',
      moderate: 'મધ્યમ',
      sensitive: 'સંવેદનશીલ જૂથો માટે અસ્વસ્થ',
      unhealthy: 'અસ્વસ્થ',
      'very-unhealthy': 'ખૂબ અસ્વસ્થ',
      hazardous: 'જોખમી'
    },
    advice: {
      good: 'હવાની ગુણવત્તા સંતોષકારક છે અને કોઈ જોખમ નથી. આઉટડોર પ્રવૃત્તિઓની મજા માણો!',
      moderate: 'હવાની ગુણવત્તા સ્વીકાર્ય છે. જોકે સંવેદનશીલ લોકોએ વધુ સમય બહાર રહેવાનું ટાળવું જોઈએ.',
      sensitive: 'બાળકો, વૃદ્ધો અને અસ્થમાના દર્દીઓ પર અસર થઈ શકે છે. બહાર માસ્ક પહેરો.',
      unhealthy: 'દરેકના સ્વાસ્થ્ય પર અસર થઈ શકે છે. લાંબો સમય બહાર રહેવાનું ટાળો અને N95 માસ્ક પહેરો.',
      'very-unhealthy': 'આરોગ્ય ચેતવણી: દરેક પર ગંભીર અસર થઈ શકે છે. બહાર જવાનું ટાળો અને બારીઓ બંધ રાખો.',
      hazardous: 'કટોકટીની સ્થિતિની આરોગ્ય ચેતવણી. દરેક વ્યક્તિએ ઘરમાં જ રહેવું જોઈએ અને એર પ્યુરિફાયર વાપરવું જોઈએ.'
    }
  },
  kn: {
    title: 'ವಾಯು ಗುಣಮಟ್ಟ ಸೂಚ್ಯಂಕ (AQI)',
    loading: 'ಲೈವ್ ವಾಯು ಗುಣಮಟ್ಟದ ಮಾಹಿತಿ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    ozone: 'ಓಝೋನ್ (O₃)',
    indexLabel: 'ಸೂಚ್ಯಂಕ',
    statuses: {
      good: 'ಉತ್ತಮ',
      moderate: 'ಮಧ್ಯಮ',
      sensitive: 'ಸೂಕ್ಷ್ಮ ಜನರಿಗೆ ಹಾನಿಕಾರಕ',
      unhealthy: 'ಹಾನಿಕಾರಕ',
      'very-unhealthy': 'ಬಹಳ ಹಾನಿಕಾರಕ',
      hazardous: 'ಅಪಾಯಕಾರಿ'
    },
    advice: {
      good: 'ಗಾಳಿಯ ಗುಣಮಟ್ಟ ತೃಪ್ತಿಕರವಾಗಿದೆ, ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ. ಹೊರಾಂಗಣ ಚಟುವಟಿಕೆಗಳನ್ನು ಆನಂದಿಸಿ!',
      moderate: 'ಗಾಳಿಯ ಗುಣಮಟ್ಟ ಸ್ವೀಕಾರಾರ್ಹವಾಗಿದೆ. ಆದರೆ ಸೂಕ್ಷ್ಮ ಆರೋಗ್ಯದವರು ಹೆಚ್ಚು ಹೊತ್ತು ಹೊರಗಿನ ಶ್ರಮ ಕಡಿಮೆ ಮಾಡಬೇಕು.',
      sensitive: 'ಮಕ್ಕಳು, ಹಿರಿಯರು ಮತ್ತು ಅಸ್ತಮಾ ರೋಗಿಗಳ ಮೇಲೆ ಪರಿಣಾಮ ಬೀರಬಹುದು. ಹೊರಗೆ ಮಾಸ್ಕ್ ಧರಿಸಿ.',
      unhealthy: 'ಎಲ್ಲರ ಆರೋಗ್ಯದ ಮೇಲೂ ಪರಿಣಾಮ ಬೀರಬಹುದು. ಹೆಚ್ಚು ಹೊತ್ತು ಹೊರಗಿರುವುದನ್ನು ತಪ್ಪಿಸಿ ಮತ್ತು N95 ಮಾಸ್ಕ್ ಧರಿಸಿ.',
      'very-unhealthy': 'ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆ: ಗಂಭೀರ ಆರೋಗ್ಯ ಪರಿಣಾಮಗಳು ಉಂಟಾಗಬಹುದು. ಹೊರಗಿನ ಶ್ರಮ ತಪ್ಪಿಸಿ ಕಿಟಕಿಗಳನ್ನು ಮುಚ್ಚಿಡಿ.',
      hazardous: 'ತುರ್ತು ಪರಿಸ್ಥಿತಿಯ ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆ. ಎಲ್ಲರೂ ಮನೆಯೊಳಗೆ ಇರಬೇಕು ಮತ್ತು ಏರ್ ಪ್ಯೂರಿಫೈಯರ್ ಬಳಸಬೇಕು.'
    }
  },
  pa: {
    title: 'ਹਵਾ ਗੁਣਵੱਤਾ ਸੂਚਕ ਅੰਕ (AQI)',
    loading: 'ਲਾਈਵ ਹਵਾ ਗੁਣਵੱਤਾ ਡੇਟਾ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    ozone: 'ਓਜ਼ੋਨ (O₃)',
    indexLabel: 'ਸੂਚਕ ਅੰਕ',
    statuses: {
      good: 'ਚੰਗਾ',
      moderate: 'ਦਰਮਿਆਨਾ',
      sensitive: 'ਸੰਵੇਦਨਸ਼ੀਲ ਲੋਕਾਂ ਲਈ ਅਸਿਹਤਮੰਦ',
      unhealthy: 'ਅਸਿਹਤਮੰਦ',
      'very-unhealthy': 'ਬਹੁਤ ਅਸਿਹਤਮੰਦ',
      hazardous: 'ਖਤਰਨਾਕ'
    },
    advice: {
      good: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਤਸੱਲੀਬਖ਼ਸ਼ ਹੈ, ਕੋਈ ਖਤਰਾ ਨਹੀਂ ਹੈ। ਬਾਹਰੀ ਗਤੀਵਿਧੀਆਂ ਦਾ ਆਨੰਦ ਲਓ!',
      moderate: 'ਹਵਾ ਦੀ ਗੁਣਵੱਤਾ ਸਵੀਕਾਰਯੋਗ ਹੈ। ਪਰ ਸੰਵੇਦਨਸ਼ੀਲ ਲੋਕਾਂ ਨੂੰ ਲੰਬੇ ਸਮੇਂ ਤੱਕ ਬਾਹਰੀ ਮਿਹਨਤ ਘਟਾਉਣੀ ਚਾਹੀਦੀ ਹੈ।',
      sensitive: 'ਬੱਚੇ, ਬਜ਼ੁਰਗ ਅਤੇ ਦਮੇ ਦੇ ਮਰੀਜ਼ ਪ੍ਰਭਾਵਿਤ ਹੋ ਸਕਦੇ ਹਨ। ਬਾਹਰ ਮਾਸਕ ਪਾਓ।',
      unhealthy: 'ਹਰੇਕ ਦੀ ਸਿਹਤ \'ਤੇ ਅਸਰ ਪੈ ਸਕਦਾ ਹੈ। ਬਾਹਰ ਰਹਿਣ ਤੋਂ ਬਚੋ ਅਤੇ N95 ਮਾਸਕ ਪਾਓ।',
      'very-unhealthy': 'ਸਿਹਤ ਚਿਤਾਵਨੀ: ਗੰਭੀਰ ਸਿਹਤ ਪ੍ਰਭਾਵ ਪੈ ਸਕਦੇ ਹਨ। ਬਾਹਰ ਜਾਣ ਤੋਂ ਬਚੋ ਅਤੇ ਖਿੜਕੀਆਂ ਬੰਦ ਰੱਖੋ।',
      hazardous: 'ਐਮਰਜੈਂਸੀ ਸਿਹਤ ਚਿਤਾਵਨੀ। ਸਾਰਿਆਂ ਨੂੰ ਘਰ ਦੇ ਅੰਦਰ ਰਹਿਣਾ ਚਾਹੀਦਾ ਹੈ ਅਤੇ ਏਅਰ ਪਿਊਰੀਫਾਇਰ ਦੀ ਵਰਤੋਂ ਕਰਨੀ ਚਾਹੀਦੀ ਹੈ।'
    }
  }
};


/* =========================================
   Multilingual Weather Condition Mapping (WMO Standards)
   ========================================= */
const WEATHER_CONDITIONS = {
  en: {
    clear: 'Clear Sky',
    mainlyClear: 'Mainly Clear',
    partlyCloudy: 'Partly Cloudy',
    overcast: 'Overcast',
    fog: 'Fog',
    drizzle: 'Drizzle',
    rain: 'Rain',
    heavyRain: 'Heavy Rain',
    snow: 'Snow',
    showers: 'Rain Showers',
    thunderstorm: 'Thunderstorm'
  },
  hi: {
    clear: 'साफ़ आसमान',
    mainlyClear: 'अधिकांशतः साफ़',
    partlyCloudy: 'आंशिक रूप से बादल',
    overcast: 'घने बादल',
    fog: 'कोहरा',
    drizzle: 'बूंदाबांदी',
    rain: 'बारिश',
    heavyRain: 'तेज बारिश',
    snow: 'बर्फबारी',
    showers: 'बारिश की फुहारें',
    thunderstorm: 'आंधी-तूफान'
  },
  bn: {
    clear: 'পরিষ্কার আকাশ',
    mainlyClear: 'বেশিরভাগ পরিষ্কার',
    partlyCloudy: 'আংশিক মেঘলা',
    overcast: 'মেঘলা আকাশ',
    fog: 'কুয়াশা',
    drizzle: 'গুঁড়ি গুঁড়ি বৃষ্টি',
    rain: 'বৃষ্টি',
    heavyRain: 'ভারী বৃষ্টি',
    snow: 'তুষারপাত',
    showers: 'বৃষ্টির সম্ভাবনা',
    thunderstorm: 'বজ্রঝড়'
  },
  ta: {
    clear: 'தெளிவான வானம்',
    mainlyClear: 'பெரும்பாலும் தெளிவானது',
    partlyCloudy: 'பகுதி மேகமூட்டம்',
    overcast: 'மேகமூட்டம்',
    fog: 'பனிமூட்டம்',
    drizzle: 'தூறல்',
    rain: 'மழை',
    heavyRain: 'கனமழை',
    snow: 'பனிப்பொழிவு',
    showers: 'மழைத்தூறல்',
    thunderstorm: 'இடியுடன் கூடிய மழை'
  },
  te: {
    clear: 'నిర్మలమైన ఆకాశం',
    mainlyClear: 'ఎక్కువగా నిర్మలంగా',
    partlyCloudy: 'పాక్షికంగా మేఘావృతం',
    overcast: 'పూర్తిగా మేఘావృతం',
    fog: 'పొగమంచు',
    drizzle: 'జల్లులు',
    rain: 'వర్షం',
    heavyRain: 'భారీ వర్షం',
    snow: 'మంచు కురవడం',
    showers: 'వర్షపు జల్లులు',
    thunderstorm: 'ఉరుములతో కూడిన వర్షం'
  },
  mr: {
    clear: 'निरभ्र आकाश',
    mainlyClear: 'बहुतांश निरभ्र',
    partlyCloudy: 'अंशतः ढगाळ',
    overcast: 'ढगाळ वातावरण',
    fog: 'धुके',
    drizzle: 'रिमझिम पाऊस',
    rain: 'पाऊस',
    heavyRain: 'मुसळधार पाऊस',
    snow: 'बर्फवृष्टी',
    showers: 'पावसाच्या सरी',
    thunderstorm: 'वादळी पाऊस'
  },
  gu: {
    clear: 'ચોખ્ખું આકાશ',
    mainlyClear: 'મોટાભાગે ચોખ્ખું',
    partlyCloudy: 'આંશિક વાદળછાયું',
    overcast: 'વાદળછાયું વાતાવરણ',
    fog: 'ધુમ્મસ',
    drizzle: 'ઝરમર વરસાદ',
    rain: 'વરસાદ',
    heavyRain: 'ભારે વરસાદ',
    snow: 'હિમવર્ષા',
    showers: 'વરસાદી ઝાપટાં',
    thunderstorm: 'ગાજવીજ સાથે વરસાદ'
  },
  kn: {
    clear: 'ಸ್ವಚ್ಛ ಆಕಾಶ',
    mainlyClear: 'ಹೆಚ್ಚಾಗಿ ಸ್ವಚ್ಛ',
    partlyCloudy: 'ಭಾಗಶಃ ಮೋಡ',
    overcast: 'ಮೋಡ ಕವಿದ ವಾತಾವರಣ',
    fog: 'ಮಂಜು',
    drizzle: 'ಚಿಮುಕಿಸುವ ಮಳೆ',
    rain: 'ಮಳೆ',
    heavyRain: 'ಭಾರಿ ಮಳೆ',
    snow: 'ಹಿಮಪಾತ',
    showers: 'ಮಳೆಯ ತುಂತುರು',
    thunderstorm: 'ಗುಡುಗು ಸಹಿತ ಮಳೆ'
  },
  pa: {
    clear: 'ਸਾਫ਼ ਅਸਮਾਨ',
    mainlyClear: 'ਜ਼ਿਆਦਾਤਰ ਸਾਫ਼',
    partlyCloudy: 'ਅੰਸ਼ਕ ਤੌਰ \'ਤੇ ਬੱਦਲਵਾਈ',
    overcast: 'ਬੱਦਲਵਾਈ',
    fog: 'ਧੁੰਦ',
    drizzle: 'ਫੁਹਾਰ',
    rain: 'ਮੀਂਹ',
    heavyRain: 'ਭਾਰੀ ਮੀਂਹ',
    snow: 'ਬਰਫ਼ਬਾਰੀ',
    showers: 'ਮੀਂਹ ਦੀਆਂ ਬੁਛਾੜਾਂ',
    thunderstorm: 'ਗਰਜ ਨਾਲ ਤੂਫ਼ਾਨ'
  }
};

function getLocalizedWeatherCondition(code, fallbackDesc = '', lang = state.language) {
  const c = WEATHER_CONDITIONS[lang] || WEATHER_CONDITIONS.en;
  if (code === 0) return c.clear;
  if (code === 1) return c.mainlyClear;
  if (code === 2) return c.partlyCloudy;
  if (code === 3) return c.overcast;
  if (code === 45 || code === 48) return c.fog;
  if (code >= 51 && code <= 57) return c.drizzle;
  if (code >= 61 && code <= 67) return (code >= 65) ? c.heavyRain : c.rain;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return c.snow;
  if (code >= 80 && code <= 82) return c.showers;
  if (code >= 95) return c.thunderstorm;

  if (fallbackDesc) {
    const lower = fallbackDesc.toLowerCase();
    if (lower.includes('clear')) return c.clear;
    if (lower.includes('cloud')) return c.partlyCloudy;
    if (lower.includes('overcast')) return c.overcast;
    if (lower.includes('fog') || lower.includes('mist')) return c.fog;
    if (lower.includes('drizzle')) return c.drizzle;
    if (lower.includes('heavy rain')) return c.heavyRain;
    if (lower.includes('rain') || lower.includes('shower')) return c.showers;
    if (lower.includes('thunder') || lower.includes('storm')) return c.thunderstorm;
    if (lower.includes('snow')) return c.snow;
  }
  return fallbackDesc || c.clear;
}

document.addEventListener('DOMContentLoaded', () => {
  weatherCanvas = new WeatherCanvas('weather-canvas');

  if (!navigator.geolocation) {
    $('geolocate-btn').classList.add('hidden');
  }

  $('search-form').addEventListener('submit', onSearch);
  $('geolocate-btn').addEventListener('click', onGeolocate);
  $('chat-form').addEventListener('submit', onChatSubmit);

  initSearchAutocomplete();
  initBookmarks();
  initLanguageSelector();
  initComparisonHandlers();
  initVoiceEngine();
  initWeatherAlerts();
  initModelBreakdownDropdown();
  initNavScrollButtons();

  if ($('toggleGptBtn')) {
    $('toggleGptBtn').addEventListener('click', () => {
      const isHidden = $('gptSidebar').classList.contains('hidden');
      if (isHidden) {
        openAssistantWindow();
      } else {
        closeAssistantWindow();
      }
    });
  }

  if ($('closeGptBtn')) {
    $('closeGptBtn').addEventListener('click', closeAssistantWindow);
  }

  if ($('gptBackdrop')) {
    $('gptBackdrop').addEventListener('click', closeAssistantWindow);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('gptSidebar') && !$('gptSidebar').classList.contains('hidden')) {
      closeAssistantWindow();
    }
  });

  document.querySelectorAll('.suggested-question').forEach((button) => {
    button.addEventListener('click', () => {
      const question = button.dataset.question;
      $('chat-input').value = question;
      onChatSubmit(new Event('submit', { cancelable: true }));
    });
  });

  addChatMessage('ai', '**Hello!** I am RituGPT, powered by Google Gemini. Search for any location or ask me anything about the forecast, outdoor activities, or what to wear today.');

  searchLocation('Kolkata');
});

function initModelBreakdownDropdown() {
  const btn = $('toggle-model-breakdown-btn');
  const dropdown = $('model-breakdown-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', () => {
    const isHidden = dropdown.classList.contains('hidden');
    if (isHidden) {
      dropdown.classList.remove('hidden');
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    } else {
      dropdown.classList.add('hidden');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

function initNavScrollButtons() {
  const navItems = [
    { btnId: 'nav-ai-btn', targetId: 'multimodel-section' },
    { btnId: 'nav-aqi-btn', targetId: 'aqi-section' },
    { btnId: 'nav-trends-btn', targetId: 'trends-section' }
  ];

  navItems.forEach(({ btnId, targetId }) => {
    const btn = $(btnId);
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const weatherSection = $('weather-section');
      if (weatherSection && weatherSection.classList.contains('hidden')) {
        weatherSection.classList.remove('hidden');
      }
      const target = $(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('pulse-highlight');
        setTimeout(() => {
          target.classList.remove('pulse-highlight');
        }, 1800);
      }
    });
  });
}

function openAssistantWindow() {
  const sidebar = $('gptSidebar');
  const backdrop = $('gptBackdrop');
  if (sidebar) sidebar.classList.remove('hidden');
  if (backdrop) backdrop.classList.remove('hidden');
  document.body.classList.add('drawer-open');
  if ($('toggleGptBtn')) {
    $('toggleGptBtn').classList.add('active');
    $('toggleGptBtn').setAttribute('aria-expanded', 'true');
  }
  const chatInput = $('chat-input');
  if (chatInput) chatInput.focus();

  const history = $('chat-history');
  if (history) {
    setTimeout(() => { history.scrollTop = history.scrollHeight; }, 100);
  }
}

function closeAssistantWindow() {
  const sidebar = $('gptSidebar');
  const backdrop = $('gptBackdrop');
  if (sidebar) sidebar.classList.add('hidden');
  if (backdrop) backdrop.classList.add('hidden');
  document.body.classList.remove('drawer-open');
  if ($('toggleGptBtn')) {
    $('toggleGptBtn').classList.remove('active');
    $('toggleGptBtn').setAttribute('aria-expanded', 'false');
  }
}

/* =========================================
   Language Selector & Multilingual Support
   ========================================= */
function initLanguageSelector() {
  const select = $('lang-select');
  if (!select) return;

  select.addEventListener('change', (e) => {
    state.language = e.target.value;
    applyLanguage(state.language);
    if (state.aqi) {
      renderAqiSection(state.aqi);
    }
    if (state.current) {
      renderDecisionEngine(state.current, state.multimodel, state.aqi);
      renderMultiModelSection(state.multimodel);
    }
  });
}

function applyLanguage(lang) {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  if ($('txt-tagline')) $('txt-tagline').textContent = dict.tagline;
  if ($('btn-search')) $('btn-search').textContent = dict.searchBtn;
  if ($('txt-compare-btn')) $('txt-compare-btn').textContent = dict.compareBtn;
  if ($('txt-gpt-btn')) $('txt-gpt-btn').textContent = dict.askGptBtn;
  if ($('txt-chat-header-title')) $('txt-chat-header-title').textContent = dict.askGptBtn;
  if ($('txt-nav-ai-btn')) $('txt-nav-ai-btn').textContent = dict.navAiBtn;
  if ($('txt-nav-aqi-btn')) $('txt-nav-aqi-btn').textContent = dict.navAqiBtn;
  if ($('txt-nav-trends-btn')) $('txt-nav-trends-btn').textContent = dict.navTrendsBtn;
  if ($('txt-compare-title')) $('txt-compare-title').textContent = dict.compareTitle;
  if ($('txt-feels-like')) $('txt-feels-like').textContent = dict.feelsLike;
  if ($('lbl-humidity')) $('lbl-humidity').textContent = dict.humidity;
  if ($('lbl-wind')) $('lbl-wind').textContent = dict.wind;
  if ($('lbl-wind-dir')) $('lbl-wind-dir').textContent = dict.windDir;
  if ($('lbl-uv')) $('lbl-uv').textContent = dict.uv;
  if ($('lbl-rain')) $('lbl-rain').textContent = dict.rain;
  if ($('lbl-sunrise')) $('lbl-sunrise').textContent = dict.sunrise;
  if ($('lbl-sunset')) $('lbl-sunset').textContent = dict.sunset;
  if ($('txt-radar-title')) $('txt-radar-title').textContent = dict.radarTitle;
  if ($('txt-radar-hint')) $('txt-radar-hint').textContent = dict.radarHint;
  if ($('txt-hourly-title')) $('txt-hourly-title').textContent = dict.hourlyTitle;
  if ($('txt-hourly-hint')) $('txt-hourly-hint').textContent = dict.hourlyHint;
  if ($('txt-daily-title')) $('txt-daily-title').textContent = dict.dailyTitle;
  if ($('txt-daily-hint')) $('txt-daily-hint').textContent = dict.dailyHint;
  if ($('txt-trends-title')) $('txt-trends-title').textContent = dict.trendsTitle;
  if ($('txt-footer')) $('txt-footer').textContent = dict.footer;
  if ($('city-input')) $('city-input').placeholder = dict.searchPlaceholder || 'Search any city or coordinates...';
  if ($('compare-city-input')) $('compare-city-input').placeholder = dict.comparePlaceholder || 'Compare another city...';
  if ($('chat-input')) $('chat-input').placeholder = dict.chatPlaceholder || 'Ask anything about the weather...';
  if (state.current && $('current-desc')) $('current-desc').textContent = getLocalizedWeatherCondition(state.current.weatherCode, state.current.weatherDescription, lang);
  if (state.forecast && state.forecast.daily) renderDailyForecast(state.forecast.daily);
  if (state.comparisonLocation && state.comparisonCurrent) renderComparisonGrid();

  // Multi-Model Ensemble & Decision Engine localization
  if ($('txt-multimodel-title')) $('txt-multimodel-title').textContent = dict.multimodelTitle;
  if ($('txt-model-breakdown-btn')) $('txt-model-breakdown-btn').textContent = dict.modelBreakdownBtn;
  if ($('txt-decisions-title')) $('txt-decisions-title').textContent = dict.decisionsTitle;
  if ($('lbl-dec-fitness')) $('lbl-dec-fitness').textContent = dict.decFitnessLabel;
  if ($('lbl-dec-rain')) $('lbl-dec-rain').textContent = dict.decRainLabel;
  if ($('lbl-dec-laundry')) $('lbl-dec-laundry').textContent = dict.decLaundryLabel;
  if ($('lbl-dec-mask')) $('lbl-dec-mask').textContent = dict.decMaskLabel;
  if ($('lbl-probable-temp')) $('lbl-probable-temp').textContent = dict.probableTempLabel;
  if ($('lbl-probable-spread')) $('lbl-probable-spread').textContent = dict.probableSpreadLabel;
  if ($('lbl-probable-precip')) $('lbl-probable-precip').textContent = dict.probablePrecipLabel;
  if ($('lbl-probable-agreement')) $('lbl-probable-agreement').textContent = dict.probableAgreementLabel;
  if ($('txt-breakdown-title')) $('txt-breakdown-title').textContent = dict.breakdownTitle;

  // AQI Localization
  const aqiDict = AQI_TRANSLATIONS[lang] || AQI_TRANSLATIONS.en;
  if ($('txt-aqi-title')) $('txt-aqi-title').textContent = aqiDict.title;
  if ($('lbl-pollutant-ozone')) $('lbl-pollutant-ozone').textContent = aqiDict.ozone;

  if (!state.aqi) {
    if ($('aqi-advice')) $('aqi-advice').textContent = aqiDict.loading;
    if ($('aqi-badge')) $('aqi-badge').textContent = `${aqiDict.statuses.good} (US AQI)`;
    if ($('aqi-status')) $('aqi-status').textContent = `${aqiDict.statuses.good} ${aqiDict.indexLabel || 'Index'}`;
  }

  if (!state.current) {
    if ($('dec-fitness')) $('dec-fitness').textContent = dict.evaluating;
    if ($('dec-rain')) $('dec-rain').textContent = dict.evaluating;
    if ($('dec-laundry')) $('dec-laundry').textContent = dict.evaluating;
    if ($('dec-mask')) $('dec-mask').textContent = dict.evaluating;
    if ($('model-consensus-score')) $('model-consensus-score').textContent = dict.evaluatingConsensus;
  }

  // Update initial welcome message if user has not engaged in chat yet
  if (state.chatHistory.length === 0 && dict.welcome) {
    const history = $('chat-history');
    if (history && history.children.length === 1 && history.children[0].classList.contains('ai')) {
      const bubble = history.children[0].querySelector('.bubble');
      if (bubble) {
        bubble.innerHTML = formatMarkdown(dict.welcome);
        attachTtsButton(bubble, dict.welcome);
      }
    }
  }
}

/* =========================================
   Favorite Bookmarks & LocalStorage
   ========================================= */
function initBookmarks() {
  const bookmarkBtn = $('bookmark-btn');
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', toggleBookmark);
  }
  renderBookmarksBar();
}

function updateBookmarkStar() {
  const bookmarkBtn = $('bookmark-btn');
  if (!bookmarkBtn || !state.location) return;

  const isBookmarked = state.bookmarks.some(
    (b) => b.name.toLowerCase() === state.location.name.toLowerCase()
  );

  bookmarkBtn.classList.toggle('active', isBookmarked);
}

function toggleBookmark() {
  if (!state.location) return;

  const index = state.bookmarks.findIndex(
    (b) => b.name.toLowerCase() === state.location.name.toLowerCase()
  );

  if (index !== -1) {
    state.bookmarks.splice(index, 1);
    showToast(`Removed ${state.location.name} from favorites.`);
  } else {
    state.bookmarks.push({
      name: state.location.name,
      country: state.location.country,
      latitude: state.location.latitude,
      longitude: state.location.longitude
    });
    showToast(`Saved ${state.location.name} to favorites.`);
  }

  localStorage.setItem('ritugpt_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkStar();
  renderBookmarksBar();
}

function renderBookmarksBar() {
  const container = $('bookmarks-bar');
  if (!container) return;

  if (!state.bookmarks.length) {
    container.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  container.innerHTML = '';
  state.bookmarks.forEach((bm) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'bookmark-chip';
    chip.innerHTML = `⭐ ${bm.name} <span class="remove-bm" title="Remove">×</span>`;

    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-bm')) {
        e.stopPropagation();
        state.bookmarks = state.bookmarks.filter((b) => b.name !== bm.name);
        localStorage.setItem('ritugpt_bookmarks', JSON.stringify(state.bookmarks));
        updateBookmarkStar();
        renderBookmarksBar();
      } else {
        $('city-input').value = bm.name;
        searchLocation(bm.name);
      }
    });

    container.appendChild(chip);
  });

  container.classList.remove('hidden');
}

/* =========================================
   Multi-Location Side-by-Side Comparison
   ========================================= */
function initComparisonHandlers() {
  const toggleBtn = $('toggle-compare-btn');
  const closeBtn = $('close-compare-btn');
  const form = $('compare-form');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const section = $('comparison-section');
      const isHidden = section.classList.contains('hidden');
      if (isHidden) {
        section.classList.remove('hidden');
        toggleBtn.classList.add('active');
        $('compare-city-input').focus();
        if (state.comparisonLocation) renderComparisonGrid();
      } else {
        section.classList.add('hidden');
        toggleBtn.classList.remove('active');
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      $('comparison-section').classList.add('hidden');
      if (toggleBtn) toggleBtn.classList.remove('active');
    });
  }

  if (form) {
    form.addEventListener('submit', onCompareSubmit);
  }
}

async function onCompareSubmit(e) {
  e.preventDefault();
  const city = $('compare-city-input').value.trim();
  if (!city) return;

  try {
    showLoading(true);
    let loc = null;
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.location) loc = data.location;
      }
    } catch (_) {}

    if (!loc) {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const r = geoData.results[0];
        loc = { name: r.name, country: r.country || '', latitude: r.latitude, longitude: r.longitude };
      }
    }

    if (!loc) throw new Error(`Could not find location ${city}`);

    const [wRes, fRes] = await Promise.all([
      fetch(`/api/weather?lat=${loc.latitude}&lon=${loc.longitude}`),
      fetch(`/api/forecast?lat=${loc.latitude}&lon=${loc.longitude}`)
    ]);

    const wData = await wRes.json();
    const fData = await fRes.json();

    if (wData.success && fData.success) {
      state.comparisonLocation = loc;
      state.comparisonCurrent = wData.current;
      state.comparisonForecast = fData.forecast;
      renderComparisonGrid();
      showToast(`Comparing ${state.location?.name || 'Primary'} vs ${loc.name}`);
    }
  } catch (err) {
    showToast(err.message || 'Failed to fetch comparison location.');
  } finally {
    hideLoading();
  }
}

function renderComparisonGrid() {
  const container = $('comparison-container');
  if (!container || !state.location || !state.current || !state.comparisonLocation || !state.comparisonCurrent) return;

  const loc1 = state.location;
  const cur1 = state.current;
  const loc2 = state.comparisonLocation;
  const cur2 = state.comparisonCurrent;

  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  const desc1 = getLocalizedWeatherCondition(cur1.weatherCode, cur1.weatherDescription, state.language);
  const desc2 = getLocalizedWeatherCondition(cur2.weatherCode, cur2.weatherDescription, state.language);

  container.innerHTML = `
    <div class="compare-col">
      <div class="compare-col-header">
        <div>
          <div class="compare-city-name">${loc1.name}</div>
          <div style="font-size:0.85rem; color: var(--text-muted);">${loc1.country || ''}</div>
        </div>
        <div class="compare-temp-badge">${Math.round(cur1.temperature)}°C</div>
      </div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.condition || 'Condition'}</span><span class="compare-metric-val">${desc1}</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.feelsLike || 'Feels Like'}</span><span class="compare-metric-val">${Math.round(cur1.feelsLike)}°C</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.humidity || 'Humidity'}</span><span class="compare-metric-val">${Math.round(cur1.humidity)}%</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.wind || 'Wind Speed'}</span><span class="compare-metric-val">${cur1.windSpeed} km/h</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.rain || 'Rain'}</span><span class="compare-metric-val">${cur1.rain || 0} mm</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.uv || 'UV Index'}</span><span class="compare-metric-val">${cur1.uvIndex || 0}</span></div>
    </div>

    <div class="compare-col">
      <div class="compare-col-header">
        <div>
          <div class="compare-city-name">${loc2.name}</div>
          <div style="font-size:0.85rem; color: var(--text-muted);">${loc2.country || ''}</div>
        </div>
        <div class="compare-temp-badge" style="color: var(--accent-2);">${Math.round(cur2.temperature)}°C</div>
      </div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.condition || 'Condition'}</span><span class="compare-metric-val">${desc2}</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.feelsLike || 'Feels Like'}</span><span class="compare-metric-val">${Math.round(cur2.feelsLike)}°C</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.humidity || 'Humidity'}</span><span class="compare-metric-val">${Math.round(cur2.humidity)}%</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.wind || 'Wind Speed'}</span><span class="compare-metric-val">${cur2.windSpeed} km/h</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.rain || 'Rain'}</span><span class="compare-metric-val">${cur2.rain || 0} mm</span></div>
      <div class="compare-metric-row"><span class="compare-metric-label">${dict.uv || 'UV Index'}</span><span class="compare-metric-val">${cur2.uvIndex || 0}</span></div>
    </div>
  `;
}

/* =========================================
   Interactive Leaflet Radar Map Engine
   ========================================= */
let rainLayer = null;
let lastRadarFetchTime = 0;

async function syncRainViewerLayer() {
  if (!radarMap) return;
  // Cache for 5 minutes so we don't repeat API calls on rapid searches
  if (rainLayer && Date.now() - lastRadarFetchTime < 5 * 60 * 1000) return;

  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) throw new Error(`RainViewer API status: ${res.status}`);
    const data = await res.json();

    if (data.radar && data.radar.past && data.radar.past.length > 0) {
      const host = data.host || 'https://tilecache.rainviewer.com';
      const latestFrame = data.radar.past[data.radar.past.length - 1];
      // Color scheme 2 (Universal Blue), 1 (smooth), 1 (snow layer enabled)
      const tileUrl = `${host}${latestFrame.path}/256/{z}/{x}/{y}/2/1_1.png`;

      if (rainLayer && radarMap.hasLayer(rainLayer)) {
        radarMap.removeLayer(rainLayer);
      }

      rainLayer = L.tileLayer(tileUrl, {
        opacity: 0.75,
        maxZoom: 18,
        zIndex: 10
      }).addTo(radarMap);

      lastRadarFetchTime = Date.now();
    }
  } catch (err) {
    console.warn('Unable to fetch live RainViewer radar frames:', err);
    if (!rainLayer) {
      rainLayer = L.tileLayer('https://tilecache.rainviewer.com/v2/coverage/0/256/{z}/{x}/{y}/0/0_0.png', {
        opacity: 0.5,
        maxZoom: 18,
        zIndex: 10
      }).addTo(radarMap);
    }
  }
}

function updateRadarMap(lat, lon, cityName) {
  if (typeof L === 'undefined') return;

  const mapEl = $('radar-map');
  if (!mapEl) return;

  if (!radarMap) {
    radarMap = L.map('radar-map', {
      center: [lat, lon],
      zoom: 7,
      zoomControl: true,
      attributionControl: false
    });

    // Clean, high-performance dark basemap tiles (No API key or watermark required)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16
    }).addTo(radarMap);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      opacity: 0.7
    }).addTo(radarMap);

    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="background:var(--accent); width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow: 0 0 10px var(--accent);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    radarMarker = L.marker([lat, lon], { icon: customIcon }).addTo(radarMap);
    radarMarker.bindPopup(`<b>${cityName}</b>`).openPopup();
  } else {
    radarMap.setView([lat, lon], 7, { animate: true });
    if (radarMarker) {
      radarMarker.setLatLng([lat, lon]);
      radarMarker.setPopupContent(`<b>${cityName}</b>`).openPopup();
    }
  }

  // Load / refresh the live precipitation layer
  syncRainViewerLayer();

  setTimeout(() => radarMap.invalidateSize(), 300);
}

/* =========================================
   Web Speech API Voice Interaction Engine
   ========================================= */
function initVoiceEngine() {
  const micBtn = $('voice-input-btn');
  if (!micBtn) return;

  micBtn.addEventListener('click', toggleVoiceInput);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.title = 'Speech recognition not supported in this browser';
    return;
  }

  speechRecognizer = new SpeechRecognition();
  speechRecognizer.continuous = false;
  speechRecognizer.interimResults = false;

  speechRecognizer.onstart = () => {
    isVoiceListening = true;
    micBtn.classList.add('mic-listening');
    showToast('Listening... Speak your weather query.');
  };

  speechRecognizer.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    $('chat-input').value = transcript;
    showToast(`Recognized: "${transcript}"`);
    onChatSubmit(new Event('submit', { cancelable: true }));
  };

  speechRecognizer.onerror = (e) => {
    isVoiceListening = false;
    micBtn.classList.remove('mic-listening');
    showToast(`Voice error: ${e.error}`);
  };

  speechRecognizer.onend = () => {
    isVoiceListening = false;
    micBtn.classList.remove('mic-listening');
  };

}

function toggleVoiceInput() {
  if (!speechRecognizer) {
    showToast('Voice input is not supported in your browser.');
    return;
  }

  if (isVoiceListening) {
    speechRecognizer.stop();
  } else {
    const langLocales = {
      en: 'en-US',
      hi: 'hi-IN',
      bn: 'bn-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      mr: 'mr-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      pa: 'pa-IN'
    };
    speechRecognizer.lang = langLocales[state.language] || 'en-US';
    speechRecognizer.start();
  }
}

let currentAudioPlayer = null;

function speakText(text, buttonEl) {
  const cleanText = String(text || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\[DONE\]/g, '')
    .replace(/[\*\#\_\`\~\-\•]/g, ' ')
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) return;

  if (window.speechSynthesis && window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  if (currentAudioPlayer) {
    currentAudioPlayer.pause();
    currentAudioPlayer.currentTime = 0;
    currentAudioPlayer = null;
    document.querySelectorAll('.tts-btn').forEach(btn => btn.classList.remove('tts-playing'));
    if (buttonEl && buttonEl._isPlaying) {
      buttonEl._isPlaying = false;
      return;
    }
  }

  const lang = state.language || 'bn';
  const ttsUrl = `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(cleanText.slice(0, 800))}`;

  const audio = new Audio(ttsUrl);
  currentAudioPlayer = audio;
  if (buttonEl) {
    buttonEl.classList.add('tts-playing');
    buttonEl._isPlaying = true;
  }

  audio.play().then(() => {
    // Playing high-quality TTS audio stream
  }).catch((err) => {
    console.warn('Backend TTS audio stream failed, falling back to Web Speech API:', err.message);
    currentAudioPlayer = null;
    if (buttonEl) buttonEl._isPlaying = false;
    fallbackBrowserSpeak(cleanText, buttonEl);
  });

  audio.onended = () => {
    if (buttonEl) {
      buttonEl.classList.remove('tts-playing');
      buttonEl._isPlaying = false;
    }
    currentAudioPlayer = null;
  };

  audio.onerror = () => {
    if (buttonEl) {
      buttonEl.classList.remove('tts-playing');
      buttonEl._isPlaying = false;
    }
    currentAudioPlayer = null;
    fallbackBrowserSpeak(cleanText, buttonEl);
  };
}

function fallbackBrowserSpeak(cleanText, buttonEl) {
  if (!('speechSynthesis' in window)) {
    showToast('Text-to-speech not supported.');
    return;
  }

  currentSpeechUtterance = new SpeechSynthesisUtterance(cleanText);

  const langLocales = {
    en: 'en-US', hi: 'hi-IN', bn: 'bn-IN', ta: 'ta-IN', te: 'te-IN',
    mr: 'mr-IN', gu: 'gu-IN', kn: 'kn-IN', pa: 'pa-IN'
  };
  const targetLang = langLocales[state.language] || 'en-US';
  currentSpeechUtterance.lang = targetLang;

  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const langPrefix = state.language === 'bn' ? 'bn' : targetLang.slice(0, 2);
    const matchedVoice = voices.find(v => v.lang && (v.lang === targetLang || v.lang.startsWith(langPrefix)));
    if (matchedVoice) {
      currentSpeechUtterance.voice = matchedVoice;
    }
  }

  if (buttonEl) buttonEl.classList.add('tts-playing');

  currentSpeechUtterance.onend = () => {
    if (buttonEl) buttonEl.classList.remove('tts-playing');
  };

  currentSpeechUtterance.onerror = () => {
    if (buttonEl) buttonEl.classList.remove('tts-playing');
  };

  window.speechSynthesis.speak(currentSpeechUtterance);
}

/* ---------- Search Autocomplete ---------- */

function initSearchAutocomplete() {
  const input = $('city-input');
  const list = $('search-suggestions');
  if (!input || !list) return;

  let debounceTimer = null;
  let focusedIndex = -1;
  let suggestions = [];

  const hideSuggestions = () => {
    list.classList.add('hidden');
    list.innerHTML = '';
    focusedIndex = -1;
    suggestions = [];
  };

  const applyFocus = (idx) => {
    const items = list.querySelectorAll('li');
    items.forEach((el, i) => el.classList.toggle('focused', i === idx));
  };

  const selectSuggestion = (loc) => {
    input.value = loc.name + (loc.country ? `, ${loc.country}` : '');
    hideSuggestions();
    searchLocation(input.value);
  };

  const renderSuggestions = (results) => {
    list.innerHTML = '';
    if (!results.length) {
      hideSuggestions();
      return;
    }
    suggestions = results;
    focusedIndex = -1;

    results.forEach((loc) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      const region = [loc.admin1, loc.country].filter(Boolean).join(', ');
      li.innerHTML = `
        <span class="suggestion-icon">📍</span>
        <span class="suggestion-main">
          <span class="suggestion-city">${loc.name}</span>
          <span class="suggestion-region">${region}</span>
        </span>`;
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectSuggestion(loc);
      });
      list.appendChild(li);
    });
    list.classList.remove('hidden');
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      hideSuggestions();
      return;
    }
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(query)}&count=6`);
      const data = await res.json();
      renderSuggestions(data.results || (data.location ? [data.location] : []));
    } catch (_) {
      hideSuggestions();
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSuggestions(input.value.trim()), 280);
  });

  input.addEventListener('keydown', (e) => {
    const items = list.querySelectorAll('li');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusedIndex = Math.min(focusedIndex + 1, items.length - 1);
      applyFocus(focusedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusedIndex = Math.max(focusedIndex - 1, 0);
      applyFocus(focusedIndex);
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[focusedIndex]);
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  document.addEventListener('click', (e) => {
    if (!input.closest('.search-wrapper')?.contains(e.target)) {
      hideSuggestions();
    }
  });

  input.addEventListener('blur', () => setTimeout(hideSuggestions, 150));
}

/* ---------- Location handling ---------- */

async function onSearch(event) {
  event.preventDefault();
  const city = $('city-input').value.trim();
  if (!city) {
    showToast('Please enter a city or coordinates.');
    return;
  }
  await searchLocation(city);
}

async function searchLocation(city) {
  showLoading(true);
  try {
    let loc = null;
    try {
      const response = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.location) loc = data.location;
      }
    } catch (_) {
      // Fall through to direct fallback
    }

    if (!loc) {
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
      const geoData = await geoRes.json();
      if (geoData.results && geoData.results.length > 0) {
        const r = geoData.results[0];
        loc = {
          name: r.name,
          country: r.country || '',
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone || 'auto'
        };
      }
    }

    if (!loc) {
      throw new Error("We couldn't find that location.");
    }

    state.location = loc;
    await loadWeatherData();
    showWeatherSection();
  } catch (error) {
    showToast(error.message || "We couldn't find that location.");
  } finally {
    hideLoading();
  }
}

function onGeolocate() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported in your browser.');
    return;
  }

  showLoading(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        let placeName = 'My Location';
        let countryName = '';
        try {
          const revRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            placeName = revData.city || revData.locality || revData.principalSubdivision || 'My Location';
            countryName = revData.countryName || '';
          }
        } catch (_) {}

        state.location = {
          name: placeName,
          country: countryName,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: 'auto'
        };

        if ($('city-input')) {
          $('city-input').value = placeName + (countryName ? `, ${countryName}` : '');
        }

        await loadWeatherData();
        showWeatherSection();
      } catch (error) {
        showToast('Weather data is temporarily unavailable.');
      } finally {
        hideLoading();
      }
    },
    () => {
      hideLoading();
      showToast('Location permission denied. Please enter your city.');
    },
    { timeout: 10000, maximumAge: 60000 }
  );
}

/* ---------- Weather data loading ---------- */

async function loadWeatherData() {
  const { latitude, longitude } = state.location;

  try {
    const [weatherResponse, forecastResponse, aqiResponse, mmResponse] = await Promise.all([
      fetch(`/api/weather?lat=${latitude}&lon=${longitude}`),
      fetch(`/api/forecast?lat=${latitude}&lon=${longitude}`),
      fetch(`/api/aqi?lat=${latitude}&lon=${longitude}`),
      fetch(`/api/multimodel?lat=${latitude}&lon=${longitude}`)
    ]);

    if (weatherResponse.ok && forecastResponse.ok) {
      const weatherData = await weatherResponse.json();
      const forecastData = await forecastResponse.json();
      const aqiData = aqiResponse.ok ? await aqiResponse.json() : null;
      const mmData = mmResponse.ok ? await mmResponse.json() : null;

      if (weatherData.success && weatherData.current && forecastData.success && forecastData.forecast) {
        state.current = weatherData.current;
        state.forecast = forecastData.forecast;
        if (aqiData && aqiData.success) state.aqi = aqiData.aqi;
        if (mmData && mmData.success) state.multimodel = mmData.multimodel;

        renderAllWeather();
        return;
      }
    }
  } catch (_) {
    // Fall through to direct Open-Meteo fallback
  }

  // Standalone client fallback for direct Open-Meteo requests
  const omUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset&timezone=auto`;
  const omRes = await fetch(omUrl);
  const omData = await omRes.json();

  if (!omData || !omData.current) {
    throw new Error('Weather data is temporarily unavailable.');
  }

  const cur = omData.current;
  const d = omData.daily || {};
  const h = omData.hourly || {};

  state.current = {
    temperature: cur.temperature_2m,
    feelsLike: cur.apparent_temperature,
    humidity: cur.relative_humidity_2m,
    windSpeed: cur.wind_speed_10m,
    windDirection: cur.wind_direction_10m,
    weatherCode: cur.weather_code,
    weatherDescription: getWeatherText(cur.weather_code),
    isDay: cur.is_day === 1,
    uvIndex: h.uv_index ? h.uv_index[new Date().getHours()] || 0 : 0,
    maxUvIndex: d.uv_index_max ? d.uv_index_max[0] : 0,
    rain: cur.precipitation || 0,
    sunrise: d.sunrise ? d.sunrise[0] : '',
    sunset: d.sunset ? d.sunset[0] : '',
    time: cur.time
  };

  state.forecast = {
    hourly: {
      time: h.time || [],
      temperature: h.temperature_2m || [],
      weatherCode: h.weather_code || [],
      precipitationProbability: h.precipitation_probability || []
    },
    daily: {
      date: d.time || [],
      maxTemperature: d.temperature_2m_max || [],
      minTemperature: d.temperature_2m_min || [],
      weatherCode: d.weather_code || [],
      precipitationProbability: d.precipitation_probability_max || []
    }
  };

  // Fallback direct AQI request
  try {
    const aqiRes = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust&timezone=auto`);
    if (aqiRes.ok) {
      const aqiJson = await aqiRes.json();
      const ac = aqiJson.current || {};
      const score = ac.us_aqi ? Math.round(ac.us_aqi) : null;
      let status = 'Good', level = 'good', advice = 'Air quality is satisfactory.';
      if (score > 50 && score <= 100) { status = 'Moderate'; level = 'moderate'; advice = 'Acceptable air quality. Sensitive people take care.'; }
      else if (score > 100 && score <= 150) { status = 'Unhealthy for Sensitive Groups'; level = 'sensitive'; advice = 'Sensitive groups wear a mask outdoors.'; }
      else if (score > 150 && score <= 200) { status = 'Unhealthy'; level = 'unhealthy'; advice = 'Limit outdoor exertion and wear N95 mask.'; }
      else if (score > 200) { status = 'Hazardous'; level = 'hazardous'; advice = 'Remain indoors with air purifiers.'; }

      state.aqi = {
        usAqi: score,
        status, level, advice,
        pollutants: {
          pm25: ac.pm2_5, pm10: ac.pm10, no2: ac.nitrogen_dioxide,
          so2: ac.sulphur_dioxide, o3: ac.ozone, co: ac.carbon_monoxide
        }
      };
    }
  } catch (_) {}

  // Fallback direct Multi-Model request
  try {
    const mmRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&models=gfs_seamless,ecmwf_ifs025,icon_seamless,gem_seamless&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max,weather_code&timezone=auto&forecast_days=1`);
    if (mmRes.ok) {
      const mmJson = await mmRes.json();
      const md = mmJson.daily || {};
      const models = [
        { id: 'gfs', name: 'GFS (NOAA USA)', tempMax: md.temperature_2m_max_gfs_seamless?.[0], precip: md.precipitation_sum_gfs_seamless?.[0], windSpeed: md.wind_speed_10m_max_gfs_seamless?.[0], weatherCode: md.weather_code_gfs_seamless?.[0] },
        { id: 'ecmwf', name: 'ECMWF (Europe)', tempMax: md.temperature_2m_max_ecmwf_ifs025?.[0], precip: md.precipitation_sum_ecmwf_ifs025?.[0], windSpeed: md.wind_speed_10m_max_ecmwf_ifs025?.[0], weatherCode: md.weather_code_ecmwf_ifs025?.[0] },
        { id: 'icon', name: 'ICON (DWD Germany)', tempMax: md.temperature_2m_max_icon_seamless?.[0], precip: md.precipitation_sum_icon_seamless?.[0], windSpeed: md.wind_speed_10m_max_icon_seamless?.[0], weatherCode: md.weather_code_icon_seamless?.[0] },
        { id: 'gem', name: 'GEM (Canada)', tempMax: md.temperature_2m_max_gem_seamless?.[0], precip: md.precipitation_sum_gem_seamless?.[0], windSpeed: md.wind_speed_10m_max_gem_seamless?.[0], weatherCode: md.weather_code_gem_seamless?.[0] }
      ].map(m => ({ ...m, description: getWeatherText(m.weatherCode || 0) }));

      const validTemps = models.map(m => m.tempMax).filter(v => v != null);
      const validPrecips = models.map(m => m.precip).filter(v => v != null);
      const tempSpread = validTemps.length >= 2 ? Math.round((Math.max(...validTemps) - Math.min(...validTemps)) * 10) / 10 : 0;
      const rainCount = validPrecips.filter(p => p > 0.5).length;
      const rainPercentage = validPrecips.length ? Math.round((rainCount / validPrecips.length) * 100) : 0;

      let confidenceScore = 95;
      if (tempSpread > 2.5) confidenceScore -= 15;
      if (tempSpread > 4) confidenceScore -= 20;

      state.multimodel = {
        models,
        consensus: { tempSpread, rainPercentage, confidenceScore: Math.max(60, confidenceScore) }
      };
    }
  } catch (_) {}

  renderAllWeather();
}

function getWeatherText(code) {
  const descriptions = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Depositing Rime Fog",
    51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
    61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
    71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
    80: "Light Rain Showers", 81: "Moderate Rain Showers", 82: "Violent Rain Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Hail", 99: "Heavy Thunderstorm with Hail"
  };
  return descriptions[code] || "Clear Sky";
}

/* =========================================
   Two-Tier Weather Alert Engine
   ========================================= */

function initWeatherAlerts() {
  const dismissBtn = $('dismiss-severe-alert');
  if (dismissBtn) {
    dismissBtn.addEventListener('click', dismissSevereAlert);
  }

  const mildPopup = $('mild-alert-popup');
  if (mildPopup) {
    mildPopup.addEventListener('click', dismissMildAlert);
  }
}

let mildAlertTimeout = null;
let mildAlertQueue = [];
let isMildAlertShowing = false;
let lastAlertSignature = '';

/**
 * Evaluates current weather data and triggers appropriate alerts.
 * Severity classification:
 *   CRITICAL/SEVERE → persistent top banner (red)
 *   HIGH            → persistent top banner (orange)
 *   MODERATE/MILD   → auto-dismiss popup (6-8 sec)
 *   INFO            → auto-dismiss popup with blue style
 */
function evaluateWeatherAlerts(current, location) {
  if (!current) return;

  const temp = current.temperature;
  const feels = current.feelsLike;
  const wind = current.windSpeed;
  const humidity = current.humidity;
  const uv = current.uvIndex;
  const rain = current.rain || 0;
  const code = current.weatherCode;
  const cityName = location?.name || 'your area';

  const severeAlerts = [];
  const mildAlerts = [];

  // --- SEVERE / CRITICAL tier checks ---

  // Extreme Heat (≥45°C)
  if (typeof temp === 'number' && temp >= 45) {
    severeAlerts.push({
      level: 'critical',
      title: '🔴 Extreme Heat Emergency',
      msg: `Temperature in ${cityName} has reached ${Math.round(temp)}°C (feels like ${Math.round(feels)}°C). Stay indoors, hydrate constantly, and avoid all outdoor activity. Risk of heatstroke is very high.`,
      icon: '🌡️'
    });
  }

  // Thunderstorm with Hail (WMO 96, 99)
  if (code === 96 || code === 99) {
    severeAlerts.push({
      level: 'critical',
      title: '⛈️ Severe Thunderstorm & Hail',
      msg: `${cityName} is experiencing a thunderstorm with hail. Seek shelter immediately. Avoid open areas, tall structures, and driving through flooded roads.`,
      icon: '⛈️'
    });
  }

  // Thunderstorm (WMO 95)
  if (code === 95 && !severeAlerts.length) {
    severeAlerts.push({
      level: 'critical',
      title: '⛈️ Thunderstorm Warning',
      msg: `Active thunderstorm in ${cityName}. Stay indoors and away from windows. Unplug sensitive electronics and avoid water bodies.`,
      icon: '⛈️'
    });
  }

  // Severe winds (≥60 km/h)
  if (typeof wind === 'number' && wind >= 60) {
    severeAlerts.push({
      level: 'critical',
      title: '💨 Severe Wind Alert',
      msg: `Wind speeds in ${cityName} have reached ${wind} km/h. Risk of fallen trees, flying debris, and structural damage. Avoid unnecessary travel.`,
      icon: '💨'
    });
  }

  // Violent Rain Showers (WMO 82)
  if (code === 82 || rain >= 10) {
    severeAlerts.push({
      level: 'critical',
      title: '🌊 Heavy Rain / Flood Risk',
      msg: `Intense rainfall of ${rain} mm recorded in ${cityName}. Flash flood risk is elevated. Avoid low-lying areas and waterlogged streets.`,
      icon: '🌊'
    });
  }

  // Extreme UV (≥11)
  if (typeof uv === 'number' && uv >= 11) {
    severeAlerts.push({
      level: 'critical',
      title: '☀️ Extreme UV Radiation',
      msg: `UV Index in ${cityName} is ${uv} (Extreme). Avoid sun exposure between 10 AM–4 PM. Full protective clothing, SPF 50+, and UV-blocking sunglasses required.`,
      icon: '☀️'
    });
  }

  // --- HIGH tier (orange banner) ---

  // Very Hot (40-44°C)
  if (typeof temp === 'number' && temp >= 40 && temp < 45 && !severeAlerts.some(a => a.title.includes('Heat'))) {
    severeAlerts.push({
      level: 'high',
      title: '🟠 Extreme Heat Warning',
      msg: `Temperature in ${cityName} is ${Math.round(temp)}°C (feels like ${Math.round(feels)}°C). Limit outdoor activity between 11 AM and 3 PM. Stay hydrated and watch for signs of heat exhaustion.`,
      icon: '🌡️'
    });
  }

  // Strong winds (40-59 km/h)
  if (typeof wind === 'number' && wind >= 40 && wind < 60 && !severeAlerts.some(a => a.title.includes('Wind'))) {
    severeAlerts.push({
      level: 'high',
      title: '🟠 Strong Wind Warning',
      msg: `Wind speed of ${wind} km/h in ${cityName}. Secure loose outdoor items. Cyclists and motorcyclists should exercise caution.`,
      icon: '💨'
    });
  }

  // Heavy rain (5-9 mm)
  if (rain >= 5 && rain < 10 && !severeAlerts.some(a => a.title.includes('Rain') || a.title.includes('Flood'))) {
    severeAlerts.push({
      level: 'high',
      title: '🟠 Heavy Rain Alert',
      msg: `Precipitation of ${rain} mm in ${cityName}. Carry an umbrella and be cautious of slippery roads. Localised waterlogging possible.`,
      icon: '🌧️'
    });
  }

  // Very High UV (8-10)
  if (typeof uv === 'number' && uv >= 8 && uv < 11 && !severeAlerts.some(a => a.title.includes('UV'))) {
    severeAlerts.push({
      level: 'high',
      title: '🟠 Very High UV Alert',
      msg: `UV Index is ${uv} in ${cityName}. Apply SPF 50+ sunscreen, wear a hat, and limit midday sun exposure.`,
      icon: '☀️'
    });
  }

  // Dense Rime Fog (WMO 48)
  if (code === 48) {
    severeAlerts.push({
      level: 'high',
      title: '🟠 Dense Fog — Low Visibility',
      msg: `Dense depositing rime fog in ${cityName}. Visibility is dangerously low. Drive slowly with headlights on and avoid highways if possible.`,
      icon: '🌫️'
    });
  }

  // --- MILD / ADVISORY tier checks (popup, 6-8 sec) ---

  // Hot weather advisory (35-39°C)
  if (typeof temp === 'number' && temp >= 35 && temp < 40 && !severeAlerts.some(a => a.title.includes('Heat'))) {
    mildAlerts.push({
      level: 'warning',
      title: 'Heat Advisory',
      msg: `It's ${Math.round(temp)}°C in ${cityName}. Stay hydrated and wear light clothing. Avoid prolonged outdoor activity.`,
      icon: '🌡️'
    });
  }

  // Moderate UV advisory (6-7)
  if (typeof uv === 'number' && uv >= 6 && uv < 8 && !severeAlerts.some(a => a.title.includes('UV'))) {
    mildAlerts.push({
      level: 'warning',
      title: 'High UV Advisory',
      msg: `UV Index is ${uv} in ${cityName}. Sunscreen SPF 30+ recommended for extended outdoor exposure.`,
      icon: '🕶️'
    });
  }

  // Moderate wind advisory (25-39 km/h)
  if (typeof wind === 'number' && wind >= 25 && wind < 40 && !severeAlerts.some(a => a.title.includes('Wind'))) {
    mildAlerts.push({
      level: 'warning',
      title: 'Wind Advisory',
      msg: `Winds of ${wind} km/h in ${cityName}. Outdoor activities are fine but secure loose items and use caution with umbrellas.`,
      icon: '💨'
    });
  }

  // High humidity advisory (≥85%)
  if (typeof humidity === 'number' && humidity >= 85 && typeof temp === 'number' && temp >= 28) {
    mildAlerts.push({
      level: 'warning',
      title: 'Humidity Advisory',
      msg: `Humidity is ${Math.round(humidity)}% with ${Math.round(temp)}°C in ${cityName}. Muggy conditions — stay hydrated and wear breathable clothing.`,
      icon: '💧'
    });
  }

  // Light/moderate rain advisory (WMO 51-55, 61-63, 80-81)
  if ([51, 53, 55, 61, 63, 80, 81].includes(code) && !severeAlerts.some(a => a.title.includes('Rain') || a.title.includes('Flood'))) {
    mildAlerts.push({
      level: 'info',
      title: 'Rain Advisory',
      msg: `${current.weatherDescription} in ${cityName}. Carry an umbrella if heading out. Roads may be slippery.`,
      icon: '🌧️'
    });
  }

  // Fog advisory (WMO 45)
  if (code === 45 && !severeAlerts.some(a => a.title.includes('Fog'))) {
    mildAlerts.push({
      level: 'info',
      title: 'Fog Advisory',
      msg: `Foggy conditions in ${cityName}. Reduced visibility — drive carefully with low-beam headlights.`,
      icon: '🌫️'
    });
  }

  // Drizzle advisory (WMO 51-57)
  if (code >= 51 && code <= 57 && !mildAlerts.some(a => a.title === 'Rain Advisory')) {
    // already handled above for 51,53,55
  }

  // Snow advisory (WMO 71-77, 85-86)
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    mildAlerts.push({
      level: 'info',
      title: 'Snowfall Advisory',
      msg: `${current.weatherDescription} in ${cityName}. Roads may be icy — drive with caution and dress warmly.`,
      icon: '❄️'
    });
  }

  // Build a signature to prevent re-firing the same alerts on re-render
  const sig = JSON.stringify({ s: severeAlerts.map(a => a.title), m: mildAlerts.map(a => a.title) });
  if (sig === lastAlertSignature) return;
  lastAlertSignature = sig;

  // Display the highest priority severe alert as a banner
  if (severeAlerts.length > 0) {
    const top = severeAlerts[0];
    showSevereAlert(top.title, top.msg, top.level);
  } else {
    // No severe conditions — dismiss any existing banner
    const banner = $('severe-alert-banner');
    if (banner && !banner.classList.contains('hidden')) {
      dismissSevereAlert();
    }
  }

  // Queue mild alerts
  if (mildAlerts.length > 0) {
    mildAlertQueue = [...mildAlerts];
    if (!isMildAlertShowing) {
      showNextMildAlert();
    }
  }
}

function showSevereAlert(title, message, level) {
  const banner = $('severe-alert-banner');
  if (!banner) return;

  $('severe-alert-title').textContent = title;
  $('severe-alert-msg').textContent = message;

  // Reset classes
  banner.classList.remove('hidden', 'dismissing', 'level-high');
  if (level === 'high') {
    banner.classList.add('level-high');
  }

  document.body.classList.add('has-severe-alert');

  // Re-trigger animation
  banner.style.animation = 'none';
  banner.offsetHeight; // force reflow
  banner.style.animation = '';
}

function dismissSevereAlert() {
  const banner = $('severe-alert-banner');
  if (!banner || banner.classList.contains('hidden')) return;

  banner.classList.add('dismissing');
  setTimeout(() => {
    banner.classList.add('hidden');
    banner.classList.remove('dismissing', 'level-high');
    document.body.classList.remove('has-severe-alert');
  }, 400);
}

function showMildAlert(title, message, icon, level) {
  const popup = $('mild-alert-popup');
  if (!popup) return;

  isMildAlertShowing = true;

  $('mild-alert-title').textContent = title;
  $('mild-alert-msg').textContent = message;
  $('mild-alert-icon').textContent = icon || '⚠️';

  // Reset classes
  popup.classList.remove('hidden', 'dismissing', 'level-info');
  if (level === 'info') {
    popup.classList.add('level-info');
  }

  // Re-trigger animations
  popup.style.animation = 'none';
  const timer = $('mild-alert-timer');
  if (timer) timer.style.animation = 'none';
  popup.offsetHeight; // force reflow
  popup.style.animation = '';
  if (timer) timer.style.animation = '';

  clearTimeout(mildAlertTimeout);
  mildAlertTimeout = setTimeout(() => {
    dismissMildAlert();
  }, 7000); // 7 seconds (in the 6-8 sec range)
}

function dismissMildAlert() {
  const popup = $('mild-alert-popup');
  if (!popup || popup.classList.contains('hidden')) return;

  clearTimeout(mildAlertTimeout);
  popup.classList.add('dismissing');

  setTimeout(() => {
    popup.classList.add('hidden');
    popup.classList.remove('dismissing', 'level-info');
    isMildAlertShowing = false;

    // Show next alert in queue after a brief pause
    if (mildAlertQueue.length > 0) {
      setTimeout(showNextMildAlert, 600);
    }
  }, 350);
}

function showNextMildAlert() {
  if (mildAlertQueue.length === 0) {
    isMildAlertShowing = false;
    return;
  }
  const next = mildAlertQueue.shift();
  showMildAlert(next.title, next.msg, next.icon, next.level);
}

function renderAllWeather() {
  renderCurrentWeather(state.current);
  renderAqiSection(state.aqi);
  renderHourlyForecast(state.forecast.hourly);
  renderDailyForecast(state.forecast.daily);
  renderCharts(state.forecast);
  renderMultiModelSection(state.multimodel);
  renderDecisionEngine(state.current, state.multimodel, state.aqi);
  updateBookmarkStar();
  updateRadarMap(state.location.latitude, state.location.longitude, state.location.name);
  evaluateWeatherAlerts(state.current, state.location);
}

/* ---------- AQI Section Rendering ---------- */
function renderAqiSection(aqi) {
  if (!aqi) return;

  const aqiDict = AQI_TRANSLATIONS[state.language] || AQI_TRANSLATIONS.en;
  let level = aqi.level;
  if (!level && aqi.usAqi != null) {
    const score = Math.round(aqi.usAqi);
    if (score <= 50) level = 'good';
    else if (score <= 100) level = 'moderate';
    else if (score <= 150) level = 'sensitive';
    else if (score <= 200) level = 'unhealthy';
    else if (score <= 300) level = 'very-unhealthy';
    else level = 'hazardous';
  }
  if (!level) level = 'good';

  const localizedStatus = (aqiDict.statuses && aqiDict.statuses[level]) || aqi.status || 'Good';
  const localizedAdvice = (aqiDict.advice && aqiDict.advice[level]) || aqi.advice || 'Live air quality data updated.';

  const scoreEl = $('aqi-score');
  const statusEl = $('aqi-status');
  const badgeEl = $('aqi-badge');
  const adviceEl = $('aqi-advice');

  if (scoreEl) scoreEl.textContent = aqi.usAqi != null ? Math.round(aqi.usAqi) : '--';
  if (statusEl) statusEl.textContent = `${localizedStatus} ${aqiDict.indexLabel || 'Index'}`;
  if (adviceEl) adviceEl.textContent = localizedAdvice;

  if (badgeEl) {
    badgeEl.textContent = `${localizedStatus} (US AQI)`;
    badgeEl.className = `aqi-badge status-${level}`;
  }

  const pol = aqi.pollutants || {};
  if ($('aqi-pm25')) $('aqi-pm25').textContent = pol.pm25 != null ? `${pol.pm25} µg/m³` : '--';
  if ($('aqi-pm10')) $('aqi-pm10').textContent = pol.pm10 != null ? `${pol.pm10} µg/m³` : '--';
  if ($('aqi-no2')) $('aqi-no2').textContent = pol.no2 != null ? `${pol.no2} µg/m³` : '--';
  if ($('aqi-so2')) $('aqi-so2').textContent = pol.so2 != null ? `${pol.so2} µg/m³` : '--';
  if ($('aqi-o3')) $('aqi-o3').textContent = pol.o3 != null ? `${pol.o3} µg/m³` : '--';
  if ($('aqi-co')) $('aqi-co').textContent = pol.co != null ? `${pol.co} µg/m³` : '--';
}

/* ---------- Multi-Model Forecast & Decision Engine ---------- */
function renderMultiModelSection(multimodel) {
  const container = $('multimodel-container');
  const consensusEl = $('model-consensus-score');
  if (!multimodel || !multimodel.models) return;

  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;
  const cons = multimodel.consensus || {};
  if (consensusEl) {
    const score = cons.confidenceScore || 95;
    consensusEl.textContent = `${score}% ${dict.consensusAgreement || 'Model Consensus Agreement'}`;
  }

  // Populate Probable Synthesized Forecast Summary
  if ($('probable-temp')) $('probable-temp').textContent = cons.probableTempMax != null ? `${Math.round(cons.probableTempMax)}°C` : '--°C';
  if ($('probable-spread')) $('probable-spread').textContent = cons.tempSpread != null ? `±${cons.tempSpread}°C` : '±0°C';
  if ($('probable-precip')) $('probable-precip').textContent = cons.probablePrecip != null ? `${cons.probablePrecip} mm` : '0 mm';
  if ($('probable-agreement')) $('probable-agreement').textContent = cons.rainPercentage != null ? `${cons.rainPercentage}%` : '--%';

  // Populate Live Individual Model Predictions Grid
  if (container) {
    container.innerHTML = '';
    multimodel.models.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'model-card';
      card.innerHTML = `
        <div class="model-header">
          <span class="model-name">${m.name}</span>
          <span class="model-temp">${m.tempMax != null ? `${Math.round(m.tempMax)}°C` : '--'}</span>
        </div>
        <div class="model-row"><span class="model-row-label">${dict.modelCondition || 'Condition'}</span><span class="model-row-val">${getLocalizedWeatherCondition(m.weatherCode, m.description, state.language)}</span></div>
        <div class="model-row"><span class="model-row-label">${dict.modelRain || 'Rain Sum'}</span><span class="model-row-val">${m.precip != null ? `${m.precip} mm` : '0 mm'}</span></div>
        <div class="model-row"><span class="model-row-label">${dict.modelWind || 'Max Wind'}</span><span class="model-row-val">${m.windSpeed != null ? `${Math.round(m.windSpeed)} km/h` : '--'}</span></div>
      `;
      container.appendChild(card);
    });
  }
}

function renderDecisionEngine(current, multimodel, aqi) {
  if (!current) return;

  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;

  const temp = current.temperature || 25;
  const rain = current.rain || 0;
  const wind = current.windSpeed || 10;
  const usAqi = aqi?.usAqi || 40;
  const cons = multimodel?.consensus || {};

  // 1. Fitness & Outdoor Activity Decision
  let fitnessDec = dict.fitness_favorable;
  if (temp >= 36) fitnessDec = dict.fitness_caution;
  else if (rain >= 3) fitnessDec = dict.fitness_indoor;
  else if (usAqi > 120) fitnessDec = dict.fitness_pollution;
  if ($('dec-fitness')) $('dec-fitness').textContent = fitnessDec;

  // 2. Rain & Outdoor Event Risk Decision
  let rainDec = dict.rain_low;
  if (cons.rainPercentage >= 75 || rain >= 5) rainDec = dict.rain_high;
  else if (cons.rainPercentage >= 25 || rain > 0) rainDec = dict.rain_moderate;
  if ($('dec-rain')) $('dec-rain').textContent = rainDec;

  // 3. Laundry & Sun Drying Decision
  let laundryDec = dict.laundry_optimal;
  if (rain > 0.5 || cons.rainPercentage >= 50) laundryDec = dict.laundry_indoor;
  else if (current.humidity >= 85) laundryDec = dict.laundry_slow;
  if ($('dec-laundry')) $('dec-laundry').textContent = laundryDec;

  // 4. Health & Mask Action Decision
  let maskDec = dict.mask_clear;
  if (usAqi > 200) maskDec = dict.mask_mandatory;
  else if (usAqi > 100) maskDec = dict.mask_recommended;
  if ($('dec-mask')) $('dec-mask').textContent = maskDec;
}

function showWeatherSection() {
  $('weather-section').classList.remove('hidden');
}

/* ---------- Rendering ---------- */

function renderCurrentWeather(current) {
  $('location-name').textContent = state.location.name;
  $('country').textContent = state.location.country || '';
  $('current-temp').textContent = Math.round(current.temperature);
  $('current-icon').innerHTML = getWeatherIcon(current.weatherCode, current.isDay);
  $('current-desc').textContent = getLocalizedWeatherCondition(current.weatherCode, current.weatherDescription, state.language);
  $('feels-like').textContent = Math.round(current.feelsLike);
  $('humidity').textContent = `${Math.round(current.humidity)}%`;
  $('wind').textContent = `${current.windSpeed} km/h`;
  $('wind-dir').textContent = windDirectionToText(current.windDirection);
  $('uv-index').textContent = formatUvIndex(current.uvIndex, current.maxUvIndex);
  $('rain').textContent = current.rain != null ? `${current.rain} mm` : '0 mm';
  $('sunrise').textContent = formatHour(current.sunrise);
  $('sunset').textContent = formatHour(current.sunset);

  if (weatherCanvas) {
    weatherCanvas.setCondition(current.weatherCode, current.isDay);
  }
}

function renderHourlyForecast(hourly) {
  const container = $('hourly-container');
  container.innerHTML = '';

  const currentHourStr = state.current?.time ? state.current.time.slice(0, 13) : null;
  let startIdx = 0;
  if (currentHourStr && hourly.time) {
    const found = hourly.time.findIndex((t) => t >= currentHourStr);
    if (found !== -1) startIdx = found;
  }

  const count = Math.min(hourly.time.length - startIdx, 24);

  for (let i = 0; i < count; i++) {
    const sourceIdx = startIdx + i;
    const item = document.createElement('div');
    item.className = 'hour-item';

    const icon = getWeatherIcon(hourly.weatherCode[sourceIdx], true);
    const time = formatHour(hourly.time[sourceIdx]);
    const temp = Math.round(hourly.temperature[sourceIdx]);
    const precip = Math.round(hourly.precipitationProbability[sourceIdx]);

    item.innerHTML = `
      <span class="hour-time">${time}</span>
      <span class="hour-icon">${icon}</span>
      <span class="hour-temp">${temp}°</span>
      <span class="hour-precip">${ICONS.droplet} ${precip}%</span>
    `;

    container.appendChild(item);
  }
}

function renderDailyForecast(daily) {
  const container = $('daily-container');
  container.innerHTML = '';

  const count = daily.date.length;

  for (let i = 0; i < count; i++) {
    const card = document.createElement('div');
    card.className = 'day-card';

    const icon = getWeatherIcon(daily.weatherCode[i], true);
    const day = formatDay(daily.date[i]);
    const high = Math.round(daily.maxTemperature[i]);
    const low = Math.round(daily.minTemperature[i]);
    const precip = Math.round(daily.precipitationProbability[i]);

    card.innerHTML = `
      <div class="day-name">${day}</div>
      <div class="day-icon">${icon}</div>
      <div class="day-temps">
        <span class="high">${high}°</span>
        <span class="low">${low}°</span>
      </div>
      <div class="day-precip">${ICONS.droplet} ${precip}%</div>
    `;

    container.appendChild(card);
  }
}

function renderCharts(forecast) {
  if (typeof Chart === 'undefined') return;

  const currentHourStr = state.current?.time ? state.current.time.slice(0, 13) : null;
  let startIdx = 0;
  if (currentHourStr && forecast.hourly.time) {
    const found = forecast.hourly.time.findIndex((t) => t >= currentHourStr);
    if (found !== -1) startIdx = found;
  }

  const hourlyLabels = forecast.hourly.time.slice(startIdx, startIdx + 24).map(formatHour);
  const hourlyTemps = forecast.hourly.temperature.slice(startIdx, startIdx + 24);
  const hourlyPrecip = forecast.hourly.precipitationProbability.slice(startIdx, startIdx + 24);

  const tempCtx = $('temp-chart').getContext('2d');
  const precipCtx = $('precip-chart').getContext('2d');

  if (tempChart) tempChart.destroy();
  if (precipChart) precipChart.destroy();

  tempChart = new Chart(tempCtx, {
    type: 'line',
    data: {
      labels: hourlyLabels,
      datasets: [{
        label: 'Temperature (°C)',
        data: hourlyTemps,
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: 'rgba(255,255,255,0.7)', font: { family: 'Inter' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.7)', font: { family: 'Inter' } }
        }
      }
    }
  });

  precipChart = new Chart(precipCtx, {
    type: 'bar',
    data: {
      labels: hourlyLabels,
      datasets: [{
        label: 'Precipitation probability (%)',
        data: hourlyPrecip,
        backgroundColor: 'rgba(56, 189, 248, 0.55)',
        borderColor: '#38bdf8',
        borderRadius: 4,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        y: {
          max: 100,
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: { color: 'rgba(255,255,255,0.7)', font: { family: 'Inter' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: 'rgba(255,255,255,0.7)', font: { family: 'Inter' } }
        }
      }
    }
  });
}

/* ---------- Chat with Real-Time SSE Token Streaming & Voice Output ---------- */

async function onChatSubmit(event) {
  event.preventDefault();
  if (isChatSubmitting) return;

  const input = $('chat-input');
  const submitBtn = $('chat-form').querySelector('button[type="submit"]');
  const message = input.value.trim();

  if (!message) return;
  if (!state.location) {
    showToast('Please search for a city first.');
    return;
  }

  isChatSubmitting = true;
  if (submitBtn) submitBtn.disabled = true;
  input.disabled = true;

  addChatMessage('user', message);
  input.value = '';

  const suggestedEl = $('suggested-questions');
  if (suggestedEl) {
    suggestedEl.style.display = 'none';
  }

  state.chatHistory.push({ role: 'user', content: message });
  if (state.chatHistory.length > 10) state.chatHistory = state.chatHistory.slice(-10);

  showTypingIndicator();

  let streamingBubble = null;
  let accumulatedText = '';

  try {
    const payload = {
      message,
      location: {
        name: state.location.name,
        country: state.location.country,
        latitude: state.location.latitude,
        longitude: state.location.longitude,
        timezone: state.location.timezone
      },
      language: state.language,
      conversation: state.chatHistory.slice(0, -1),
      weather: state.current
    };

    if (state.comparisonLocation) {
      payload.comparisonLocation = state.comparisonLocation;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream') && response.body) {
      const history = $('chat-history');
      const messageDiv = document.createElement('div');
      messageDiv.className = 'chat-message ai';

      streamingBubble = document.createElement('div');
      streamingBubble.className = 'bubble';
      streamingBubble.innerHTML = '<span class="streaming-cursor" aria-hidden="true"></span>';

      messageDiv.appendChild(streamingBubble);

      removeTypingIndicator();
      history.appendChild(messageDiv);
      history.scrollTop = history.scrollHeight;

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
          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;
              streamingBubble.innerHTML = formatMarkdown(accumulatedText) + '<span class="streaming-cursor" aria-hidden="true"></span>';
              history.scrollTop = history.scrollHeight;
            }
          } catch (e) {
            if (e.message && !e.message.includes('JSON')) throw e;
          }
        }
      }

      // Finalize message & attach Text-to-Speech button
      streamingBubble.innerHTML = formatMarkdown(accumulatedText || 'No response generated.');
      attachTtsButton(streamingBubble, accumulatedText);
      history.scrollTop = history.scrollHeight;

      if (accumulatedText) {
        state.chatHistory.push({ role: 'assistant', content: accumulatedText });
        if (state.chatHistory.length > 10) state.chatHistory = state.chatHistory.slice(-10);
      }
    } else {
      const data = await response.json();
      removeTypingIndicator();
      if (!data.success || !data.answer) {
        throw new Error(data.error || 'RituGPT is having trouble responding right now.');
      }
      addChatMessage('ai', data.answer);
      state.chatHistory.push({ role: 'assistant', content: data.answer });
      if (state.chatHistory.length > 10) state.chatHistory = state.chatHistory.slice(-10);
    }
  } catch (error) {
    removeTypingIndicator();
    if (streamingBubble) {
      streamingBubble.innerHTML = formatMarkdown(accumulatedText ? `${accumulatedText}\n\n*(Error: ${error.message})*` : error.message);
    } else {
      addChatMessage('ai', error.message || 'RituGPT is having trouble responding right now.');
    }
    showToast(error.message || 'RituGPT is having trouble responding right now.');
  } finally {
    isChatSubmitting = false;
    if (submitBtn) submitBtn.disabled = false;
    input.disabled = false;
    input.focus();
  }
}

function addChatMessage(role, text) {
  const history = $('chat-history');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (role === 'ai') {
    bubble.innerHTML = formatMarkdown(text);
    attachTtsButton(bubble, text);
  } else {
    bubble.textContent = text;
  }

  messageDiv.appendChild(bubble);
  history.appendChild(messageDiv);
  history.scrollTop = history.scrollHeight;
}

function attachTtsButton(bubbleEl, text) {
  if (!text || !('speechSynthesis' in window)) return;

  const ttsBtn = document.createElement('button');
  ttsBtn.type = 'button';
  ttsBtn.className = 'tts-btn';
  ttsBtn.innerHTML = `${ICONS.speaker} <span>Listen</span>`;
  ttsBtn.addEventListener('click', () => speakText(text, ttsBtn));

  bubbleEl.appendChild(ttsBtn);
}

function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    .replace(/\*([^\s*][^*]*?)\*/g, '<em>$1</em>')
    .replace(/_([^\s_][^_]*?)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gim, '<h4 class="chat-h4">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="chat-h3">$1</h3>');

  const lines = html.split('\n');
  const result = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        result.push('<ul class="chat-list">');
        inList = true;
      }
      const itemContent = trimmed.replace(/^(\*|-|\d+\.)\s+/, '');
      result.push(`<li>${itemContent}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed.length > 0) {
        result.push(`<p>${line}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');

  return result.join('');
}

function showTypingIndicator() {
  const history = $('chat-history');
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message ai typing-indicator';
  typingDiv.innerHTML = `
    <div class="bubble">
      <div class="typing">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  history.appendChild(typingDiv);
  history.scrollTop = history.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.querySelector('.typing-indicator');
  if (indicator) indicator.remove();
}

/* ---------- Utilities ---------- */

function showLoading(show = true) {
  const section = $('weather-section');
  const searchBtn = $('search-form')?.querySelector('button[type="submit"]');
  if (section) section.classList.toggle('is-loading', show);
  if (searchBtn) {
    searchBtn.disabled = show;
    searchBtn.textContent = show ? 'Searching...' : (TRANSLATIONS[state.language]?.searchBtn || 'Search');
  }
}

function hideLoading() {
  showLoading(false);
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, 4000);
}

function getWeatherIcon(code, isDay = true) {
  if (code === 0 || code === 1) return isDay ? ICONS.sun : ICONS.moon;
  if (code === 2) return isDay ? ICONS.sunCloud : ICONS.moonCloud;
  if (code === 3) return ICONS.cloud;
  if (code === 45 || code === 48) return ICONS.cloudFog;
  if (code >= 51 && code <= 57) return ICONS.cloudDrizzle;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return ICONS.cloudRain;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ICONS.cloudSnow;
  if (code >= 95) return ICONS.cloudLightning;
  return isDay ? ICONS.sun : ICONS.moon;
}

function windDirectionToText(degrees) {
  if (degrees == null || isNaN(degrees)) return '--';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function formatUvIndex(uv, maxUv) {
  const target = uv != null && !isNaN(uv) ? Number(uv) : (maxUv != null && !isNaN(maxUv) ? Number(maxUv) : null);
  if (target == null || isNaN(target)) return '--';
  const val = Math.round(target * 10) / 10;
  if (val <= 2) return `${val} (Low)`;
  if (val <= 5) return `${val} (Mod)`;
  if (val <= 7) return `${val} (High)`;
  if (val <= 10) return `${val} (Very High)`;
  return `${val} (Extreme)`;
}

function formatHour(timeString) {
  if (!timeString) return '--';
  const date = new Date(timeString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDay(dateString) {
  if (!dateString) return '--';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dict = TRANSLATIONS[state.language] || TRANSLATIONS.en;

  if (date.toDateString() === today.toDateString()) return dict.today || 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return dict.tomorrow || 'Tomorrow';

  const localeMap = {
    en: 'en-US',
    hi: 'hi-IN',
    bn: 'bn-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    mr: 'mr-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    pa: 'pa-IN'
  };
  const locale = localeMap[state.language] || 'en-US';
  try {
    return date.toLocaleDateString(locale, { weekday: 'short' });
  } catch (_) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
}

/* =========================================
   Weather Canvas Animation Engine (Cinematic)
   ========================================= */
class WeatherCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.clouds = [];
    this.shootingStars = [];
    this.weatherType = 'clear-day';
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.animationFrame = null;
    this.isActive = true;
    this.lightningTimer = 0;
    this.lightningFlash = 0;
    this.sunRaysAngle = 0;
    this.time = 0;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reducedMotion = mediaQuery.matches;
    mediaQuery.addEventListener('change', (e) => {
      this.reducedMotion = e.matches;
      if (!this.reducedMotion && this.isActive) this.loop(0);
    });

    this.lastFrameTime = 0;
    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive && !this.reducedMotion) this.loop(performance.now());
    });

    this.createParticles();
    this.loop(performance.now());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
    this.createParticles();
  }

  setCondition(code, isDay) {
    let type = 'clear-day';
    if (code === 0 || code === 1) {
      type = isDay ? 'clear-day' : 'clear-night';
    } else if (code === 2 || code === 3 || code === 45 || code === 48) {
      type = 'clouds';
    } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      type = 'rain';
    } else if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
      type = 'snow';
    } else if (code >= 95) {
      type = 'thunderstorm';
    }

    if (this.weatherType !== type) {
      this.weatherType = type;
      this.createParticles();
      this.updateBodyTheme(type);
    }
  }

  updateBodyTheme(type) {
    document.body.className = '';
    document.body.classList.add(`theme-${type}`);
  }

  createParticles() {
    this.particles = [];
    this.shootingStars = [];
    this.clouds = [];
    const isMobile = this.width < 768;
    const baseCount = Math.floor((this.width * this.height) / (isMobile ? 18000 : 10000));

    if (this.weatherType === 'clear-day') {
      const dayCount = isMobile ? 20 : Math.min(baseCount + 25, 60);
      for (let i = 0; i < dayCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 4 + 1.2,
          speedY: -(Math.random() * 0.4 + 0.15),
          speedX: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.6 + 0.2,
          pulseSpeed: Math.random() * 0.025 + 0.01,
          pulse: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.4 ? 'rgba(254, 240, 138, ' : 'rgba(251, 191, 36, '
        });
      }
    } else if (this.weatherType === 'clear-night') {
      const starCount = isMobile ? 60 : Math.min(baseCount * 2 + 50, 150);
      for (let i = 0; i < starCount; i++) {
        const starType = Math.random();
        let color = 'rgba(255, 255, 255, ';
        if (starType > 0.7) color = 'rgba(165, 180, 252, ';
        else if (starType > 0.85) color = 'rgba(254, 240, 138, ';

        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.8 + 0.2,
          twinkleSpeed: Math.random() * 0.035 + 0.008,
          phase: Math.random() * Math.PI * 2,
          color
        });
      }
    } else if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
      const rainCount = isMobile ? 50 : (this.weatherType === 'thunderstorm' ? 140 : 90);
      for (let i = 0; i < rainCount; i++) {
        this.particles.push({
          x: Math.random() * (this.width + 200) - 100,
          y: Math.random() * this.height,
          length: Math.random() * 26 + 14,
          speedY: Math.random() * 12 + 16,
          speedX: -(Math.random() * 2.5 + 1.5),
          thickness: Math.random() * 1.5 + 0.8,
          alpha: Math.random() * 0.45 + 0.2
        });
      }
    } else if (this.weatherType === 'snow') {
      const snowCount = isMobile ? 40 : 80;
      for (let i = 0; i < snowCount; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 3 + 1,
          speedY: Math.random() * 1.2 + 0.4,
          speedX: Math.random() * 0.5 - 0.25,
          swing: Math.random() * 2.2 + 1.0,
          swingSpeed: Math.random() * 0.02 + 0.01,
          angle: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.7 + 0.2
        });
      }
    } else if (this.weatherType === 'clouds') {
      const cloudCount = isMobile ? 8 : 14;
      for (let i = 0; i < cloudCount; i++) {
        this.clouds.push({
          x: Math.random() * (this.width + 500) - 250,
          y: Math.random() * (this.height * 0.75),
          radius: Math.random() * 200 + 120,
          speedX: Math.random() * 0.3 + 0.08,
          alpha: Math.random() * 0.08 + 0.03
        });
      }
    }
  }

  loop(timestamp) {
    if (!this.isActive) return;

    // Cap at ~60fps (16ms frame budget) to avoid rendering overhead
    if (timestamp && timestamp - this.lastFrameTime < 15) {
      this.animationFrame = requestAnimationFrame((t) => this.loop(t));
      return;
    }
    this.lastFrameTime = timestamp || performance.now();

    this.time += 0.016;
    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (this.weatherType) {
      case 'clear-day':
        this.renderClearDay();
        break;
      case 'clear-night':
        this.renderClearNight();
        break;
      case 'rain':
        this.renderRain();
        break;
      case 'thunderstorm':
        this.renderThunderstorm();
        break;
      case 'snow':
        this.renderSnow();
        break;
      case 'clouds':
        this.renderClouds();
        break;
    }

    if (!this.reducedMotion) {
      this.animationFrame = requestAnimationFrame((t) => this.loop(t));
    }
  }

  renderClearDay() {
    const sunX = this.width * 0.86;
    const sunY = this.height * 0.12;

    this.sunRaysAngle += 0.0015;

    const skyBloom = this.ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, Math.max(this.width, this.height) * 0.85);
    skyBloom.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    skyBloom.addColorStop(0.15, 'rgba(251, 191, 36, 0.28)');
    skyBloom.addColorStop(0.35, 'rgba(245, 158, 11, 0.12)');
    skyBloom.addColorStop(0.7, 'rgba(14, 165, 233, 0.05)');
    skyBloom.addColorStop(1, 'transparent');
    this.ctx.fillStyle = skyBloom;
    this.ctx.fillRect(0, 0, this.width, this.height);

    const numRays = 10;
    this.ctx.save();
    for (let i = 0; i < numRays; i++) {
      const angle = this.sunRaysAngle + (i * Math.PI * 2) / numRays;
      const rayLength = Math.max(this.width, this.height) * 1.1;
      const rayWidth = 0.2 + 0.05 * Math.sin(this.time * 1.5 + i);
      const pulseOpacity = 0.08 + 0.04 * Math.sin(this.time * 2 + i * 1.5);

      const rayGrad = this.ctx.createRadialGradient(sunX, sunY, 20, sunX, sunY, rayLength);
      rayGrad.addColorStop(0, `rgba(254, 240, 138, ${pulseOpacity * 1.6})`);
      rayGrad.addColorStop(0.35, `rgba(251, 191, 36, ${pulseOpacity})`);
      rayGrad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = rayGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(sunX, sunY);
      this.ctx.arc(sunX, sunY, rayLength, angle - rayWidth, angle + rayWidth);
      this.ctx.closePath();
      this.ctx.fill();
    }
    this.ctx.restore();

    const centerX = this.width * 0.5;
    const centerY = this.height * 0.5;
    const flareVecX = centerX - sunX;
    const flareVecY = centerY - sunY;

    const flares = [
      { t: 0.3, radius: 45, color: 'rgba(254, 240, 138, 0.15)' },
      { t: 0.55, radius: 25, color: 'rgba(56, 189, 248, 0.12)' },
      { t: 0.75, radius: 70, color: 'rgba(251, 191, 36, 0.08)' },
      { t: 1.1, radius: 110, color: 'rgba(244, 114, 182, 0.06)' },
      { t: 1.35, radius: 30, color: 'rgba(254, 240, 138, 0.1)' }
    ];

    for (const f of flares) {
      const fx = sunX + flareVecX * f.t;
      const fy = sunY + flareVecY * f.t;
      const grad = this.ctx.createRadialGradient(fx, fy, 0, fx, fy, f.radius);
      grad.addColorStop(0, f.color);
      grad.addColorStop(0.8, f.color.replace(/[\d.]+\)$/, '0.02)'));
      grad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(fx, fy, f.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    const sunCore = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 65);
    sunCore.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sunCore.addColorStop(0.25, 'rgba(254, 240, 138, 0.95)');
    sunCore.addColorStop(0.6, 'rgba(251, 191, 36, 0.65)');
    sunCore.addColorStop(1, 'transparent');
    this.ctx.fillStyle = sunCore;
    this.ctx.beginPath();
    this.ctx.arc(sunX, sunY, 65, 0, Math.PI * 2);
    this.ctx.fill();

    for (const p of this.particles) {
      p.pulse += p.pulseSpeed;
      const curAlpha = p.alpha * (0.5 + 0.5 * Math.sin(p.pulse));
      p.y += p.speedY;
      p.x += p.speedX;

      if (p.y < -10) p.y = this.height + 10;
      if (p.x < -10) p.x = this.width + 10;
      if (p.x > this.width + 10) p.x = -10;

      const moteGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      moteGrad.addColorStop(0, `${p.hue}${curAlpha})`);
      moteGrad.addColorStop(1, `${p.hue}0)`);

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = moteGrad;
      this.ctx.fill();
    }
  }

  renderClearNight() {
    const moonX = this.width * 0.84;
    const moonY = this.height * 0.14;

    const moonHalo = this.ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 340);
    moonHalo.addColorStop(0, 'rgba(224, 231, 255, 0.35)');
    moonHalo.addColorStop(0.25, 'rgba(165, 180, 252, 0.15)');
    moonHalo.addColorStop(0.65, 'rgba(99, 102, 241, 0.05)');
    moonHalo.addColorStop(1, 'transparent');
    this.ctx.fillStyle = moonHalo;
    this.ctx.beginPath();
    this.ctx.arc(moonX, moonY, 340, 0, Math.PI * 2);
    this.ctx.fill();

    const moonBody = this.ctx.createRadialGradient(moonX - 10, moonY - 10, 5, moonX, moonY, 40);
    moonBody.addColorStop(0, 'rgba(255, 255, 255, 1)');
    moonBody.addColorStop(0.5, 'rgba(224, 231, 255, 0.95)');
    moonBody.addColorStop(0.85, 'rgba(199, 210, 254, 0.7)');
    moonBody.addColorStop(1, 'transparent');
    this.ctx.fillStyle = moonBody;
    this.ctx.beginPath();
    this.ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
    this.ctx.fill();

    for (const p of this.particles) {
      p.phase += p.twinkleSpeed;
      const alpha = p.alpha * (0.35 + 0.65 * Math.sin(p.phase));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `${p.color}${Math.max(0, alpha)})`;
      this.ctx.fill();
    }

    if (Math.random() < 0.01 && this.shootingStars.length < 2) {
      this.shootingStars.push({
        x: Math.random() * this.width * 0.8,
        y: Math.random() * (this.height * 0.4),
        length: Math.random() * 90 + 60,
        speed: Math.random() * 14 + 16,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        alpha: 1,
        life: 0
      });
    }

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.life++;
      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.alpha -= 0.02;

      if (s.alpha <= 0) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      const tailX = s.x - Math.cos(s.angle) * s.length;
      const tailY = s.y - Math.sin(s.angle) * s.length;

      const grad = this.ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.alpha})`);
      grad.addColorStop(0.3, `rgba(165, 180, 252, ${s.alpha * 0.7})`);
      grad.addColorStop(1, 'transparent');

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(s.x, s.y);
      this.ctx.lineTo(tailX, tailY);
      this.ctx.stroke();
    }
  }

  renderRain() {
    for (const p of this.particles) {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.y > this.height) {
        p.y = -p.length;
        p.x = Math.random() * (this.width + 200) - 100;
      }

      this.ctx.lineWidth = p.thickness;
      this.ctx.strokeStyle = `rgba(186, 230, 253, ${p.alpha})`;
      this.ctx.beginPath();
      this.ctx.moveTo(p.x, p.y);
      this.ctx.lineTo(p.x + p.speedX * (p.length / p.speedY), p.y + p.length);
      this.ctx.stroke();
    }
  }

  renderThunderstorm() {
    this.renderRain();

    this.lightningTimer++;
    if (this.lightningTimer > 160 && Math.random() < 0.04) {
      this.lightningFlash = Math.random() * 0.5 + 0.4;
      this.lightningTimer = 0;
    }

    if (this.lightningFlash > 0) {
      this.ctx.fillStyle = `rgba(216, 180, 254, ${this.lightningFlash})`;
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.lightningFlash -= 0.06;
    }
  }

  renderSnow() {
    for (const p of this.particles) {
      p.angle += p.swingSpeed;
      p.x += Math.sin(p.angle) * p.swing + p.speedX;
      p.y += p.speedY;

      if (p.y > this.height + 10) {
        p.y = -10;
        p.x = Math.random() * this.width;
      }

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(240, 246, 255, ${p.alpha})`;
      this.ctx.fill();
    }
  }

  renderClouds() {
    for (const c of this.clouds) {
      c.x += c.speedX;
      if (c.x - c.radius > this.width) {
        c.x = -c.radius;
      }

      const grad = this.ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.radius);
      grad.addColorStop(0, `rgba(148, 163, 184, ${c.alpha})`);
      grad.addColorStop(0.6, `rgba(100, 116, 139, ${c.alpha * 0.5})`);
      grad.addColorStop(1, 'transparent');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}