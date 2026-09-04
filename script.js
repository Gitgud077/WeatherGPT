/* =========================================
   WeatherGPT — Production Frontend Script
   ========================================= */

const state = {
  location: null,
  current: null,
  forecast: null,
  chatHistory: []
};

let tempChart = null;
let precipChart = null;
let weatherCanvas = null;

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
  sparkles: `<svg class="svg-icon" viewBox="0 0 24 24"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
  weatherCanvas = new WeatherCanvas('weather-canvas');

  if (!navigator.geolocation) {
    $('geolocate-btn').classList.add('hidden');
  }

  $('search-form').addEventListener('submit', onSearch);
  $('geolocate-btn').addEventListener('click', onGeolocate);
  $('chat-form').addEventListener('submit', onChatSubmit);

  document.querySelectorAll('.suggested-question').forEach((button) => {
    button.addEventListener('click', () => {
      const question = button.dataset.question;
      $('chat-input').value = question;
      onChatSubmit(new Event('submit', { cancelable: true }));
    });
  });

  addChatMessage('ai', '**Hello!** I am WeatherGPT, powered by Google Gemini. Search for any location or ask me anything about the forecast, outdoor activities, or what to wear today.');

  searchLocation('Kolkata');
});

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
    const response = await fetch(`/api/geocode?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!data.success || !data.location) {
      throw new Error(data.error || "We couldn't find that location.");
    }

    state.location = data.location;
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
        state.location = {
          name: 'My Location',
          country: '',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: 'auto'
        };

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

  const [weatherResponse, forecastResponse] = await Promise.all([
    fetch(`/api/weather?lat=${latitude}&lon=${longitude}`),
    fetch(`/api/forecast?lat=${latitude}&lon=${longitude}`)
  ]);

  const weatherData = await weatherResponse.json();
  const forecastData = await forecastResponse.json();

  if (!weatherData.success || !weatherData.current) {
    throw new Error(weatherData.error || 'Weather data is temporarily unavailable.');
  }

  if (!forecastData.success || !forecastData.forecast) {
    throw new Error(forecastData.error || 'Forecast data is temporarily unavailable.');
  }

  state.current = weatherData.current;
  state.forecast = forecastData.forecast;

  renderCurrentWeather(state.current);
  renderHourlyForecast(state.forecast.hourly);
  renderDailyForecast(state.forecast.daily);
  renderCharts(state.forecast);
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
  $('current-desc').textContent = current.weatherDescription;
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

/* ---------- Chat with Real-Time SSE Token Streaming ---------- */

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

  // Hide suggested questions after the first question is asked
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
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        location: {
          name: state.location.name,
          country: state.location.country,
          latitude: state.location.latitude,
          longitude: state.location.longitude,
          timezone: state.location.timezone
        },
        conversation: state.chatHistory.slice(0, -1)
      })
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
        buffer = lines.pop(); // keep uncompleted line

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

      // Finalize message
      streamingBubble.innerHTML = formatMarkdown(accumulatedText || 'No response generated.');
      history.scrollTop = history.scrollHeight;

      if (accumulatedText) {
        state.chatHistory.push({ role: 'assistant', content: accumulatedText });
        if (state.chatHistory.length > 10) state.chatHistory = state.chatHistory.slice(-10);
      }
    } else {
      // Fallback non-streaming response
      const data = await response.json();
      removeTypingIndicator();
      if (!data.success || !data.answer) {
        throw new Error(data.error || 'WeatherGPT is having trouble responding right now.');
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
      addChatMessage('ai', error.message || 'WeatherGPT is having trouble responding right now.');
    }
    showToast(error.message || 'WeatherGPT is having trouble responding right now.');
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
  } else {
    bubble.textContent = text;
  }

  messageDiv.appendChild(bubble);
  history.appendChild(messageDiv);
  history.scrollTop = history.scrollHeight;
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
    searchBtn.textContent = show ? 'Searching...' : 'Search';
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

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

  return date.toLocaleDateString([], { weekday: 'short' });
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
      if (!this.reducedMotion && this.isActive) this.loop();
    });

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    document.addEventListener('visibilitychange', () => {
      this.isActive = !document.hidden;
      if (this.isActive && !this.reducedMotion) this.loop();
    });

    this.createParticles();
    this.loop();
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
    const count = Math.floor((this.width * this.height) / 10000);

    if (this.weatherType === 'clear-day') {
      for (let i = 0; i < Math.min(count + 25, 60); i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 4.5 + 1.2,
          speedY: -(Math.random() * 0.5 + 0.15),
          speedX: (Math.random() - 0.5) * 0.4,
          alpha: Math.random() * 0.7 + 0.2,
          pulseSpeed: Math.random() * 0.025 + 0.01,
          pulse: Math.random() * Math.PI * 2,
          hue: Math.random() > 0.4 ? 'rgba(254, 240, 138, ' : 'rgba(251, 191, 36, '
        });
      }
    } else if (this.weatherType === 'clear-night') {
      for (let i = 0; i < Math.min(count * 2 + 50, 160); i++) {
        const starType = Math.random();
        let color = 'rgba(255, 255, 255, ';
        if (starType > 0.7) color = 'rgba(165, 180, 252, ';
        else if (starType > 0.85) color = 'rgba(254, 240, 138, ';

        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 2.2 + 0.5,
          alpha: Math.random() * 0.85 + 0.15,
          twinkleSpeed: Math.random() * 0.035 + 0.008,
          phase: Math.random() * Math.PI * 2,
          color
        });
      }
    } else if (this.weatherType === 'rain' || this.weatherType === 'thunderstorm') {
      const rainCount = this.weatherType === 'thunderstorm' ? 150 : 100;
      for (let i = 0; i < rainCount; i++) {
        this.particles.push({
          x: Math.random() * (this.width + 200) - 100,
          y: Math.random() * this.height,
          length: Math.random() * 28 + 16,
          speedY: Math.random() * 14 + 18,
          speedX: -(Math.random() * 3 + 2),
          thickness: Math.random() * 1.6 + 0.8,
          alpha: Math.random() * 0.5 + 0.25
        });
      }
    } else if (this.weatherType === 'snow') {
      for (let i = 0; i < 90; i++) {
        this.particles.push({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          radius: Math.random() * 3.5 + 1,
          speedY: Math.random() * 1.4 + 0.5,
          speedX: Math.random() * 0.6 - 0.3,
          swing: Math.random() * 2.5 + 1.2,
          swingSpeed: Math.random() * 0.02 + 0.01,
          angle: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.75 + 0.25
        });
      }
    } else if (this.weatherType === 'clouds') {
      for (let i = 0; i < 18; i++) {
        this.clouds.push({
          x: Math.random() * (this.width + 600) - 300,
          y: Math.random() * (this.height * 0.8),
          radius: Math.random() * 220 + 140,
          speedX: Math.random() * 0.35 + 0.1,
          alpha: Math.random() * 0.1 + 0.04
        });
      }
    }
  }

  loop() {
    if (!this.isActive) return;

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
      this.animationFrame = requestAnimationFrame(() => this.loop());
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