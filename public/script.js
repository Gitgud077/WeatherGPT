/* =========================================
   WeatherGPT — Frontend Script
   ========================================= */

const state = {
  location: null,
  current: null,
  forecast: null,
  chatHistory: []
};

let tempChart = null;
let precipChart = null;

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  // Hide geolocate button if unsupported
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
});

/* ---------- Location handling ---------- */

async function onSearch(event) {
  event.preventDefault();
  const city = $('city-input').value.trim();
  if (!city) {
    showToast('Please enter a city.');
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
  $('current-icon').textContent = getWeatherIcon(current.weatherCode, current.isDay);
  $('current-desc').textContent = current.weatherDescription;
  $('feels-like').textContent = Math.round(current.feelsLike);
  $('humidity').textContent = `${Math.round(current.humidity)}%`;
  $('wind').textContent = `${current.windSpeed} km/h`;
  $('wind-dir').textContent = windDirectionToText(current.windDirection);
  $('precip').textContent = current.precipitation != null ? `${current.precipitation} mm` : '--';
  $('rain').textContent = current.rain != null ? `${current.rain} mm` : '--';
  $('sunrise').textContent = formatHour(current.sunrise);
  $('sunset').textContent = formatHour(current.sunset);
}

function renderHourlyForecast(hourly) {
  const container = $('hourly-container');
  container.innerHTML = '';

  const count = Math.min(hourly.time.length, 24);

  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'hour-item';

    const icon = getWeatherIcon(hourly.weatherCode[i], true);
    const time = formatHour(hourly.time[i]);
    const temp = Math.round(hourly.temperature[i]);
    const precip = Math.round(hourly.precipitationProbability[i]);

    item.innerHTML = `
      <span class="hour-time">${time}</span>
      <span class="hour-icon">${icon}</span>
      <span class="hour-temp">${temp}°</span>
      <span class="hour-precip">💧${precip}%</span>
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
      <div class="day-precip">💧 ${precip}%</div>
    `;

    container.appendChild(card);
  }
}

function renderCharts(forecast) {
  if (typeof Chart === 'undefined') {
    showToast('Charts could not be loaded.');
    return;
  }

  const hourlyLabels = forecast.hourly.time.slice(0, 48).map(formatHour);
  const hourlyTemps = forecast.hourly.temperature.slice(0, 48);
  const hourlyPrecip = forecast.hourly.precipitationProbability.slice(0, 48);

  const tempCtx = $('temp-chart').getContext('2d');
  const precipCtx = $('precip-chart').getContext('2d');

  // Destroy previous charts if they exist
  if (tempChart) tempChart.destroy();
  if (precipChart) precipChart.destroy();

  tempChart = new Chart(tempCtx, {
    type: 'line',
    data: {
      labels: hourlyLabels,
      datasets: [{
        label: 'Temperature (°C)',
        data: hourlyTemps,
        borderColor: '#4ea1ff',
        backgroundColor: 'rgba(78, 161, 255, 0.15)',
        fill: true,
        tension: 0.4,
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
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#9aa7b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9aa7b8' }
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
        backgroundColor: 'rgba(101, 214, 255, 0.6)',
        borderColor: '#65d6ff',
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
          grid: { color: 'rgba(255,255,255,0.1)' },
          ticks: { color: '#9aa7b8' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9aa7b8' }
        }
      }
    }
  });
}

/* ---------- Chat ---------- */

async function onChatSubmit(event) {
  event.preventDefault();
  const input = $('chat-input');
  const message = input.value.trim();

  if (!message) return;
  if (!state.location) {
    showToast('Please search for a city first.');
    return;
  }

  // Add user message
  addChatMessage('user', message);
  input.value = '';

  // Add message to history
  state.chatHistory.push({ role: 'user', content: message });
  if (state.chatHistory.length > 10) {
    state.chatHistory = state.chatHistory.slice(-10);
  }

  // Show typing indicator
  showTypingIndicator();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        location: {
          name: state.location.name,
          latitude: state.location.latitude,
          longitude: state.location.longitude,
          timezone: state.location.timezone
        },
        conversation: state.chatHistory.slice(0, -1) // exclude current message
      })
    });

    const data = await response.json();

    if (!data.success || !data.answer) {
      throw new Error(data.error || 'WeatherGPT is having trouble responding right now.');
    }

    // Remove typing indicator
    removeTypingIndicator();

    // Add AI message
    addChatMessage('ai', data.answer);
    state.chatHistory.push({ role: 'assistant', content: data.answer });
    if (state.chatHistory.length > 10) {
      state.chatHistory = state.chatHistory.slice(-10);
    }
  } catch (error) {
    removeTypingIndicator();
    addChatMessage('ai', error.message || 'WeatherGPT is having trouble responding right now.');
    showToast(error.message || 'WeatherGPT is having trouble responding right now.');
  }
}

function addChatMessage(role, text) {
  const history = $('chat-history');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  history.appendChild(messageDiv);
  history.scrollTop = history.scrollHeight;
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
  $('loading-overlay').classList.toggle('hidden', !show);
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

function getWeatherIcon(code, isDay) {
  // Map weather codes to emoji icons
  const iconMap = {
    0: isDay ? '☀️' : '🌙',
    1: isDay ? '🌤️' : '🌙',
    2: '⛅',
    3: '☁️',
    45: '🌫️',
    48: '🌫️',
    51: '🌦️',
    53: '🌦️',
    55: '🌧️',
    56: '🌧️',
    57: '🌧️',
    61: '🌧️',
    63: '🌧️',
    65: '🌧️',
    66: '🌧️',
    67: '🌧️',
    71: '❄️',
    73: '❄️',
    75: '❄️',
    77: '❄️',
    80: '🌦️',
    81: '🌧️',
    82: '🌧️',
    85: '🌨️',
    86: '🌨️',
    95: '⛈️',
    96: '⛈️',
    99: '⛈️'
  };

  return iconMap[code] || '❓';
}

function windDirectionToText(degrees) {
  if (degrees == null || isNaN(degrees)) return '--';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
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