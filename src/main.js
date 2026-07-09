/**
 * Main Application Orchestrator
 * Initializes all modules and manages the first-visit flow,
 * location permission, weather loading, and module wiring.
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { WeatherAPI } from './modules/weather-api.js';
import { AtmosphereEngine } from './modules/atmosphere-engine.js';
import { ParticleSystem } from './modules/particle-system.js';
import { AudioEngine } from './modules/audio-engine.js';
import { AnimationSystem } from './modules/animation-system.js';
import { MicroInteractions } from './modules/micro-interactions.js';
import { SearchController } from './modules/search-controller.js';
import { ExplorationManager } from './modules/exploration-manager.js';

// ─── Register GSAP Plugins ────────────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ─── Module Instances ─────────────────────────────────────────────────
const weatherAPI = new WeatherAPI();
const atmosphere = new AtmosphereEngine();
const particles = new ParticleSystem('particle-canvas');
const audio = new AudioEngine();
const animations = new AnimationSystem();
const microInteractions = new MicroInteractions();
const exploration = new ExplorationManager(weatherAPI);

// ─── Lenis Smooth Scroll ──────────────────────────────────────────────
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5,
});

// Integrate Lenis with GSAP ticker
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// ─── State ────────────────────────────────────────────────────────────
let currentWeatherData = null;
let currentCity = null;
let currentCountry = null;
let hasLoadedWeather = false;
let autoAtmosphere = true; // Tracks if atmosphere is auto-synced with weather

// ─── DOM Elements ─────────────────────────────────────────────────────
const firstVisitCard = document.getElementById('first-visit-card');
const firstVisitBtn = document.getElementById('first-visit-btn');
const useLocationBtn = document.getElementById('use-location');
const audioToggleBtn = document.getElementById('audio-toggle');
const atmosPlayBtn = document.getElementById('atmos-play-btn');

const greetingLine = document.getElementById('greeting-line');
const cityNameEl = document.getElementById('city-name');
const wcTimeEl = document.getElementById('wc-time');
const wcDateEl = document.getElementById('wc-date');
const currentTempEl = document.getElementById('current-temp');
const weatherDescEl = document.getElementById('weather-desc');
const feelsLikeEl = document.getElementById('feels-like');
const sunriseEl = document.getElementById('wc-sunrise');
const sunsetEl = document.getElementById('wc-sunset');

const hourlyScroll = document.getElementById('hourly-scroll');
const dailyList = document.getElementById('daily-list');
const atmosModes = document.querySelectorAll('.atmos-mode');

// ─── Weather Update Handler ───────────────────────────────────────────
function updateWeatherUI(weatherData, cityName, country, weatherType) {
  currentWeatherData = weatherData;
  currentCity = cityName;
  currentCountry = country;

  // Update greeting and location
  const greeting = weatherAPI.getGreeting(weatherData.timezone || undefined);
  if (greetingLine) greetingLine.textContent = greeting;
  if (cityNameEl) cityNameEl.textContent = `${cityName}${country ? ', ' + country : ''}`;

  // Update Time and Date based on location's timezone
  updateTimeAndDate(weatherData.timezone);

  // Update temperature with count-up animation
  if (currentTempEl) {
    MicroInteractions.animateValue(currentTempEl, Math.round(weatherData.temp), 1200, 0, '');
  }

  // Update large weather icon
  const iconContainer = document.getElementById('weather-icon-container');
  if (iconContainer) {
      iconContainer.innerHTML = getLargeWeatherSVG(weatherData.weatherCode, weatherData.isDay);
  }

  // Update description
  if (weatherDescEl) {
    weatherDescEl.textContent = weatherData.description || weatherAPI.getWeatherDescription(weatherData.weatherCode);
  }

  // Update feels like
  if (feelsLikeEl) {
    feelsLikeEl.textContent = `Feels like ${Math.round(weatherData.feelsLike)}°`;
  }

  // Sunrise/Sunset formatting
  if (sunriseEl && weatherData.sunrise) {
      sunriseEl.textContent = formatTimeShort(weatherData.sunrise, weatherData.timezone);
  }
  if (sunsetEl && weatherData.sunset) {
      sunsetEl.textContent = formatTimeShort(weatherData.sunset, weatherData.timezone);
  }

  // Update detail cards with count-up animations
  updateDetailCards(weatherData);

  // Render Forecast
  renderHourlyForecast(weatherData.hourly, weatherData.timezone);
  renderDailyForecast(weatherData.daily, weatherData.timezone);

  // Animate elements in if they were faded out by search transition
  if (animations && typeof animations.animateWeatherData === 'function') {
      animations.animateWeatherData();
  }

  // Refresh scroll triggers and tilt cards
  setTimeout(() => {
    animations.refresh();
    microInteractions.refreshTiltCards();
  }, 600);
}

// ─── Detail Cards Update ──────────────────────────────────────────────
function updateDetailCards(data) {
  const cards = {
    humidity: { el: '#detail-humidity .wc-stat-value', value: data.humidity, suffix: '%' },
    wind: { el: '#detail-wind .wc-stat-value', value: data.windSpeed, suffix: ' km/h', decimals: 1 },
    pressure: { el: '#detail-pressure .wc-stat-value', value: data.pressure, suffix: ' hPa' },
    visibility: { el: '#detail-visibility .wc-stat-value', value: data.visibility ? data.visibility / 1000 : 10, suffix: ' km', decimals: 1 },
    uv: { el: '#detail-uv .wc-stat-value', value: data.uvIndex || 0, suffix: '', decimals: 1 },
    feelslike: { el: '#detail-feelslike .wc-stat-value', value: data.feelsLike, suffix: '°', decimals: 0 },
  };

  Object.values(cards).forEach(card => {
    const el = document.querySelector(card.el);
    if (el) {
      MicroInteractions.animateValue(el, card.value, 1500, card.decimals || 0, card.suffix);
    }
  });
}

// ─── Forecast Rendering ───────────────────────────────────────────────
function renderHourlyForecast(hourlyData, timezone) {
  if (!hourlyScroll || !hourlyData) return;
  
  let html = '';
  hourlyData.forEach((hour, idx) => {
    const timeStr = formatTimeShort(hour.time, timezone);
    const temp = Math.round(hour.temp);
    const activeClass = idx === 0 ? 'active' : '';
    const label = idx === 0 ? 'Now' : timeStr;
    const icon = getWeatherEmoji(hour.weatherCode, hour.isDay);

    html += `
      <div class="hourly-item ${activeClass}">
        <span class="hourly-time">${label}</span>
        <span class="hourly-icon">${icon}</span>
        <span class="hourly-temp">${temp}°</span>
      </div>
    `;
  });
  
  hourlyScroll.innerHTML = html;
}

function renderDailyForecast(dailyData, timezone) {
  if (!dailyList || !dailyData) return;
  
  let html = '';
  // Skip today (index 0) and show next 4 days
  for(let i = 1; i < dailyData.length; i++) {
    const day = dailyData[i];
    const dayName = getDayName(day.time, timezone);
    const minTemp = Math.round(day.minTemp);
    const maxTemp = Math.round(day.maxTemp);
    const icon = getWeatherEmoji(day.weatherCode);
    
    html += `
      <div class="daily-item">
        <span class="daily-day">${dayName}</span>
        <span class="daily-icon">${icon}</span>
        <div class="daily-range">
          <span class="daily-low">${minTemp}°</span>
          <div class="daily-bar-track">
            <div class="daily-bar-fill" style="width: ${Math.max(10, (maxTemp - minTemp) * 5)}%; margin-left: ${Math.max(0, minTemp)}%"></div>
          </div>
          <span class="daily-high">${maxTemp}°</span>
        </div>
      </div>
    `;
  }
  
  dailyList.innerHTML = html;
}

// ─── Format Helpers ───────────────────────────────────────────────────
function formatTimeShort(dateString, timezone) {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: timezone });
    } catch(e) {
        return '';
    }
}

function getDayName(dateString, timezone) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: timezone });
    } catch(e) {
        return '';
    }
}

function updateTimeAndDate(timezone) {
    try {
        const now = new Date();
        const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: timezone });
        const dateFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'short', timeZone: timezone });
        
        if (wcTimeEl) wcTimeEl.textContent = timeFormatter.format(now);
        if (wcDateEl) wcDateEl.textContent = dateFormatter.format(now);
    } catch(e) {}
}

function getWeatherEmoji(code, isDay = true) {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code >= 1 && code <= 3) return isDay ? '⛅' : '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 85 && code <= 86) return '🌨️';
    if (code >= 95 && code <= 99) return '⛈️';
    return isDay ? '☀️' : '🌙';
}

function getLargeWeatherSVG(code, isDay = true) {
    const svgBase = `<svg width="80%" height="80%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));">`;
    // Clear/Sunny (0)
    if (code === 0) {
        return !isDay 
            ? `${svgBase}<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>` // Moon
            : `${svgBase}<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`; // Sun
    }
    // Cloudy (1-3)
    if (code >= 1 && code <= 3) return `${svgBase}<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>`;
    // Fog/Mist (45-48)
    if (code >= 45 && code <= 48) return `${svgBase}<line x1="3" y1="8" x2="21" y2="8"></line><line x1="5" y1="12" x2="19" y2="12"></line><line x1="7" y1="16" x2="17" y2="16"></line><line x1="3" y1="20" x2="21" y2="20"></line></svg>`;
    // Rain (51-67, 80-82)
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return `${svgBase}<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8" y2="20"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="16" y1="16" x2="16" y2="20"></line></svg>`;
    // Snow (71-77, 85-86)
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return `${svgBase}<path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8.01" y2="20"></line><line x1="12" y1="18" x2="12.01" y2="22"></line><line x1="16" y1="16" x2="16.01" y2="20"></line></svg>`;
    // Thunderstorm (95-99)
    if (code >= 95 && code <= 99) return `${svgBase}<path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 9"></path><polyline points="13 11 9 17 15 17 11 23"></polyline></svg>`;
    
    return `${svgBase}<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
}

// ─── Weather Type Helpers ─────────────────────────────────────────────
function getParticleType(weatherType) {
  const map = {
    sunny: 'dust', cloudy: 'dust', rain: 'rain', snow: 'snow',
    thunderstorm: 'rain', night: 'stars', mist: 'mist', golden: 'dust',
  };
  return map[weatherType] || 'dust';
}

function getAudioType(weatherType) {
  const map = {
    sunny: 'sunny', cloudy: 'wind', rain: 'rain', snow: 'snow',
    thunderstorm: 'thunder', night: 'night', mist: 'wind', golden: 'sunny',
  };
  return map[weatherType] || 'sunny';
}

function getAtmosphereDetails(weatherType) {
    const map = {
        sunny: { title: 'Clear Sky', desc: 'Warm light, calm air and beautiful moments.' },
        cloudy: { title: 'Cloudy', desc: 'Soft diffused light and a gentle cool breeze.' },
        rain: { title: 'Rainy', desc: 'Moody atmosphere with the soothing sound of rain.' },
        snow: { title: 'Snowy', desc: 'Crisp, cold air and a blanket of serene white snow.' },
        thunderstorm: { title: 'Thunderstorm', desc: 'Electric, dramatic, and intensely moody.' },
        night: { title: 'Night Sky', desc: 'Calm, quiet, and filled with twinkling stars.' },
        mist: { title: 'Misty', desc: 'Ethereal fog blanketing the surroundings quietly.' },
        golden: { title: 'Golden Hour', desc: 'Cinematic warm sunlight casting long beautiful shadows.' }
    };
    return map[weatherType] || map.sunny;
}

function updateAtmosphereSelectorUI(weatherType) {
    // Update active button
    atmosModes.forEach(btn => {
        if (btn.dataset.weather === weatherType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Update text
    const details = getAtmosphereDetails(weatherType);
    const titleEl = document.getElementById('atmos-title');
    const descEl = document.getElementById('atmos-desc');
    
    if (titleEl) titleEl.textContent = details.title;
    if (descEl) descEl.textContent = details.desc;
}

// ─── Load Weather for Coordinates ─────────────────────────────────────
async function loadWeatherForLocation(lat, lon) {
  try {
    // Fetch weather and city name in parallel
    const [weatherData, geoData] = await Promise.all([
      weatherAPI.fetchWeather(lat, lon),
      weatherAPI.reverseGeocode(lat, lon),
    ]);

    const cityName = geoData.city || 'Your Location';
    const country = geoData.country || '';

    // Determine weather type
    const weatherType = weatherAPI.mapWeatherCode(
      weatherData.weatherCode,
      weatherData.isDay,
      weatherData.sunrise,
      weatherData.sunset
    );

    if (autoAtmosphere) {
        setAtmosphereState(weatherType);
    }

    // Update UI
    updateWeatherUI(weatherData, cityName, country, weatherType);

    // Load exploration destinations
    if (country) {
      exploration.loadDestinations(country);
    }

    hasLoadedWeather = true;
  } catch (error) {
    console.error('Failed to load weather:', error);
  }
}

let audioStopTimer = null;

function setAtmosphereState(weatherType) {
    // Set atmosphere
    atmosphere.setWeather(weatherType);

    // Update ambient overlay
    atmosphere.updateAmbientOverlay(weatherType);

    // Start particles
    const particleType = getParticleType(weatherType);
    particles.setType(particleType);

    // Automatic 8-second audio
    audio.init();
    audio.isMuted = false;
    audio.setType(getAudioType(weatherType), true);
    
    if (audioStopTimer) clearTimeout(audioStopTimer);
    audioStopTimer = setTimeout(() => {
        audio.fadeOut(2).then(() => {
            audio.stopAll();
            audio.isMuted = true;
        });
    }, 8000);

    updateAtmosphereSelectorUI(weatherType);
}



// ─── Search Controller Setup ──────────────────────────────────────────
const searchController = new SearchController({
  weatherAPI,
  atmosphereEngine: atmosphere,
  particleSystem: particles,
  audioEngine: audio,
  animationSystem: animations,
  explorationManager: exploration,
  onWeatherUpdate: (weatherData, cityName, country, weatherType) => {
    autoAtmosphere = true; // Searching resets to auto atmosphere
    updateWeatherUI(weatherData, cityName, country, weatherType);
    updateAtmosphereSelectorUI(weatherType);
    
    // Refresh tilt cards after exploration loads
    setTimeout(() => {
      microInteractions.refreshTiltCards();
    }, 1000);
  },
});

// ─── Initialize Application ───────────────────────────────────────────
function init() {
  particles.start();
  animations.init();
  microInteractions.init();
  searchController.init();


  
  // Atmosphere override buttons
  atmosModes.forEach(btn => {
      btn.addEventListener('click', () => {
          autoAtmosphere = false;
          setAtmosphereState(btn.dataset.weather);
      });
  });
  


  // Set initial time
  updateTimeAndDate(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Setup clock interval
  setInterval(() => {
      if (currentWeatherData && currentWeatherData.timezone) {
          updateTimeAndDate(currentWeatherData.timezone);
      }
  }, 10000);

  // Default atmosphere: sunny
  setAtmosphereState('sunny');


  
  // Load New York by default as background
  loadWeatherForLocation(40.7128, -74.0060);
}

// ─── Boot ─────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
