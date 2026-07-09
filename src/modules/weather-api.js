/**
 * WeatherAPI Module
 * Fetches live weather data from Open-Meteo (no API key required)
 * and geocoding from Open-Meteo + Nominatim.
 */

export class WeatherAPI {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5-minute cache TTL
    this.lastRequestTime = 0;
    this.minRequestInterval = 300; // 300ms minimum between requests
  }

  /**
   * Throttle requests to avoid hammering APIs.
   */
  async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Get a cached result or null if expired/missing.
   */
  getCached(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheTTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Store a result in cache.
   */
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Fetch current weather data for given coordinates.
   * Uses Open-Meteo free API (no key needed).
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Normalized weather object
   */
  async fetchWeather(lat, lon) {
    const cacheKey = `weather_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    await this.throttle();

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,is_day&hourly=temperature_2m,weather_code,is_day&daily=sunrise,sunset,uv_index_max,weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Weather API responded with status ${response.status}`);
      }

      const data = await response.json();
      const current = data.current;
      const daily = data.daily;
      const hourly = data.hourly;
      const timezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      const sunrise = daily.sunrise?.[0] || '';
      const sunset = daily.sunset?.[0] || '';
      const isDay = current.is_day === 1;

      const weatherCode = current.weather_code;
      const condition = this.mapWeatherCode(weatherCode, isDay, sunrise, sunset);
      const description = this.getWeatherDescription(weatherCode);

      // Process hourly data (next 24 hours starting from current hour)
      const currentHourStr = current.time ? current.time.slice(0, 13) : '';
      let startIndex = 0;
      if (currentHourStr && hourly.time) {
         const idx = hourly.time.findIndex(t => t.startsWith(currentHourStr));
         if (idx !== -1) startIndex = idx;
      }
      
      const hourlyForecast = [];
      for (let i = startIndex; i < startIndex + 24; i++) {
        if (!hourly.time[i]) break;
        hourlyForecast.push({
          time: hourly.time[i],
          temp: hourly.temperature_2m[i],
          weatherCode: hourly.weather_code[i],
          isDay: hourly.is_day[i] === 1
        });
      }

      // Process daily data (next 5 days)
      const dailyForecast = [];
      for (let i = 0; i < 5; i++) {
        if (!daily.time[i]) break;
        dailyForecast.push({
          time: daily.time[i],
          weatherCode: daily.weather_code[i],
          maxTemp: daily.temperature_2m_max[i],
          minTemp: daily.temperature_2m_min[i]
        });
      }

      const result = {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        windDirection: current.wind_direction_10m,
        pressure: current.surface_pressure,
        weatherCode,
        isDay,
        description,
        condition,
        sunrise,
        sunset,
        uvIndex: daily.uv_index_max?.[0] ?? 0,
        timezone,
        visibility: 10000,
        lat,
        lon,
        hourly: hourlyForecast,
        daily: dailyForecast
      };

      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('WeatherAPI.fetchWeather error:', error);
      return this.getFallbackWeather(lat, lon);
    }
  }

  /**
   * Return a sensible fallback weather object when the API fails.
   */
  getFallbackWeather(lat, lon) {
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 20;
    return {
      temp: 22,
      feelsLike: 22,
      humidity: 50,
      windSpeed: 10,
      windDirection: 180,
      pressure: 1013,
      weatherCode: 0,
      isDay,
      description: 'Clear Sky',
      condition: isDay ? 'sunny' : 'night',
      sunrise: '',
      sunset: '',
      uvIndex: 5,
      lat,
      lon
    };
  }

  /**
   * Search for cities using Open-Meteo geocoding API.
   * @param {string} query - City name to search
   * @returns {Promise<Array>} Array of matching locations
   */
  async searchCity(query) {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = `search_${query.toLowerCase().trim()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    await this.throttle();

    const encodedQuery = encodeURIComponent(query.trim());
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodedQuery}&count=6&language=en&format=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        return [];
      }

      const results = data.results.map(r => ({
        name: r.name,
        country: r.country || '',
        countryCode: r.country_code || '',
        lat: r.latitude,
        lon: r.longitude,
        admin1: r.admin1 || ''
      }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('WeatherAPI.searchCity error:', error);
      return [];
    }
  }

  /**
   * Reverse geocode coordinates to a city/country name.
   * Uses OpenStreetMap Nominatim.
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} { city, country, countryCode }
   */
  async reverseGeocode(lat, lon) {
    const cacheKey = `reverse_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    await this.throttle();

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;

    try {
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'WeatherExperience/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Nominatim responded with status ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      const city = address.city
        || address.town
        || address.village
        || address.municipality
        || address.county
        || data.name
        || 'Unknown';

      const country = address.country || 'Unknown';
      const countryCode = address.country_code?.toUpperCase() || '';

      const result = { city, country, countryCode };
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('WeatherAPI.reverseGeocode error:', error);
      return { city: 'Unknown', country: 'Unknown', countryCode: '' };
    }
  }

  /**
   * Map WMO weather code to an internal atmosphere type.
   * @param {number} code - WMO weather code
   * @param {boolean} isDay - Whether it's daytime
   * @param {string} sunrise - ISO sunrise time string
   * @param {string} sunset - ISO sunset time string
   * @returns {string} Atmosphere type
   */
  mapWeatherCode(code, isDay, sunrise, sunset) {
    // Thunderstorm codes take precedence
    if (code >= 95 && code <= 99) return 'thunderstorm';

    // Snow codes
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';

    // Rain and drizzle codes
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';

    // Fog/mist codes
    if (code === 45 || code === 48) return 'mist';

    // Night check for clear/cloudy conditions
    if (!isDay) return 'night';

    // Golden hour check for clear conditions (code 0 or 1)
    if ((code === 0 || code === 1) && sunrise && sunset) {
      try {
        const now = new Date();
        const sunriseTime = new Date(sunrise);
        const sunsetTime = new Date(sunset);
        const thirtyMin = 30 * 60 * 1000;

        const nearSunrise = Math.abs(now.getTime() - sunriseTime.getTime()) < thirtyMin;
        const nearSunset = Math.abs(now.getTime() - sunsetTime.getTime()) < thirtyMin;

        if (nearSunrise || nearSunset) return 'golden';
      } catch {
        // If date parsing fails, skip golden hour detection
      }
    }

    // Clear sky
    if (code === 0) return 'sunny';

    // Cloudy variants (codes 1-3)
    if (code >= 1 && code <= 3) return 'cloudy';

    // Default fallback
    return 'sunny';
  }

  /**
   * Map WMO weather code to a human-readable description.
   * @param {number} code - WMO weather code
   * @returns {string} Human-readable weather description
   */
  getWeatherDescription(code) {
    const descriptions = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      56: 'Light Freezing Drizzle',
      57: 'Dense Freezing Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      66: 'Light Freezing Rain',
      67: 'Heavy Freezing Rain',
      71: 'Slight Snowfall',
      73: 'Moderate Snowfall',
      75: 'Heavy Snowfall',
      77: 'Snow Grains',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      85: 'Slight Snow Showers',
      86: 'Heavy Snow Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Slight Hail',
      99: 'Thunderstorm with Heavy Hail'
    };

    return descriptions[code] || 'Unknown';
  }

  /**
   * Get a time-appropriate greeting string.
   * @param {string} timezone - IANA timezone string (e.g. 'Asia/Tokyo')
   * @returns {string} Greeting string
   */
  getGreeting(timezone) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone
      });
      const hour = parseInt(formatter.format(now), 10);

      if (hour >= 5 && hour < 12) return 'Good Morning';
      if (hour >= 12 && hour < 17) return 'Good Afternoon';
      if (hour >= 17 && hour < 22) return 'Good Evening';
      return 'Good Evening';
    } catch {
      // If timezone is invalid, use local time
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'Good Morning';
      if (hour >= 12 && hour < 17) return 'Good Afternoon';
      if (hour >= 17 && hour < 22) return 'Good Evening';
      return 'Hello';
    }
  }
}
