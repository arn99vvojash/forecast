export class SearchController {
  // Constructor receives references to other modules
  constructor({
    weatherAPI,
    atmosphereEngine,
    particleSystem,
    audioEngine,
    animationSystem,
    explorationManager,
    onWeatherUpdate,
  }) {
    this.weatherAPI = weatherAPI;
    this.atmosphere = atmosphereEngine;
    this.particles = particleSystem;
    this.audio = audioEngine;
    this.animations = animationSystem;
    this.exploration = explorationManager;
    this.onWeatherUpdate = onWeatherUpdate; // callback to update UI

    this.searchInput = document.getElementById('city-search');
    this.suggestionsEl = document.getElementById('search-suggestions');
    this.debounceTimer = null;
    this.isSearching = false;
  }

  init() {
    if (!this.searchInput) return;
    this.searchInput.addEventListener('input', (e) => this.handleInput(e));
    this.searchInput.addEventListener('focus', () => this.onFocus());
    this.searchInput.addEventListener('blur', () =>
      setTimeout(() => this.hideSuggestions(), 200)
    );
    this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));

    // Search submit button
    const submitBtn = document.querySelector('.search-submit-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitSearch());
    }

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
      if (
        !this.searchInput.contains(e.target) &&
        this.suggestionsEl &&
        !this.suggestionsEl.contains(e.target) &&
        (!submitBtn || !submitBtn.contains(e.target))
      ) {
        this.hideSuggestions();
      }
    });
  }

  // Handle manual submit via button or Enter
  submitSearch() {
    const query = this.searchInput.value.trim();
    if (query.length < 2) return;
    
    // If suggestions are visible, pick the first one
    if (this.suggestionsEl && this.suggestionsEl.classList.contains('active')) {
       const firstItem = this.suggestionsEl.querySelector('.suggestion-item');
       if (firstItem) {
           this.selectCity(firstItem);
           return;
       }
    }
    
    // Otherwise fetch and pick first
    this.weatherAPI.searchCity(query).then(results => {
       if (results && results.length > 0) {
           this.renderSuggestions(results);
           const firstItem = this.suggestionsEl.querySelector('.suggestion-item');
           if (firstItem) this.selectCity(firstItem);
       }
    });
  }

  // Debounced input handler
  handleInput(e) {
    clearTimeout(this.debounceTimer);
    const query = e.target.value.trim();
    if (query.length < 2) {
      this.hideSuggestions();
      return;
    }
    this.debounceTimer = setTimeout(() => this.fetchSuggestions(query), 300);
  }

  // Fetch city suggestions
  async fetchSuggestions(query) {
    try {
      const results = await this.weatherAPI.searchCity(query);
      this.renderSuggestions(results);
    } catch (err) {
      console.error('Search error:', err);
    }
  }

  // Render suggestion dropdown items
  renderSuggestions(results) {
    if (!results || results.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestionsEl.innerHTML = results
      .map(
        (r, i) => `
      <div class="suggestion-item" data-index="${i}" data-lat="${r.lat}" data-lon="${r.lon}" data-city="${r.name}" data-country="${r.country}" data-country-code="${r.countryCode || ''}">
        <span class="city-name">${r.name}</span>
        ${r.admin1 ? `<span class="region-name">${r.admin1},</span>` : ''}
        <span class="country-name">${r.country}</span>
      </div>
    `
      )
      .join('');

    // Add click handlers
    this.suggestionsEl.querySelectorAll('.suggestion-item').forEach((item) => {
      item.addEventListener('click', () => this.selectCity(item));
    });

    this.showSuggestions();
  }

  // Handle city selection — the CINEMATIC TRANSITION
  async selectCity(item) {
    if (this.isSearching) return;
    this.isSearching = true;

    const lat = parseFloat(item.dataset.lat);
    const lon = parseFloat(item.dataset.lon);
    const cityName = item.dataset.city;
    const country = item.dataset.country;

    this.searchInput.value = cityName;
    this.hideSuggestions();
    this.searchInput.blur();

    try {
      // 1. Start fade-out transition
      const fadePromise = this.animations.playTransition();

      // 2. Fetch weather data in parallel
      const weatherData = await this.weatherAPI.fetchWeather(lat, lon);

      // 3. Wait for fade-out to complete
      await fadePromise;

      // 4. Determine new atmosphere
      const weatherType = this.weatherAPI.mapWeatherCode(
        weatherData.weatherCode,
        weatherData.isDay,
        weatherData.sunrise,
        weatherData.sunset
      );

      // 5. Transition atmosphere (particles dissolve → new particles)
      if (this.atmosphere && this.atmosphere.transition) {
        await this.atmosphere.transition(
          this.atmosphere.currentWeather,
          weatherType
        );
      }

      // 6. Update particle system
      if (this.particles && this.particles.setType) {
        const particleType = this.getParticleType(weatherType);
        this.particles.setType(particleType);
      }

      // 7. Update audio
      if (this.audio && this.audio.setType) {
        const audioType = this.getAudioType(weatherType);
        this.audio.init();
        this.audio.isMuted = false;
        this.audio.setType(audioType, true);
        
        if (window.searchAudioTimer) clearTimeout(window.searchAudioTimer);
        window.searchAudioTimer = setTimeout(() => {
            this.audio.fadeOut(2).then(() => {
                this.audio.stopAll();
                this.audio.isMuted = true;
            });
        }, 8000);
      }

      // 8. Call the UI update callback
      if (this.onWeatherUpdate) {
        this.onWeatherUpdate(weatherData, cityName, country, weatherType);
      }

      // 9. Update exploration section
      if (this.exploration && this.exploration.loadDestinations) {
        this.exploration.loadDestinations(country);
      }
    } catch (err) {
      console.error('City selection error:', err);
    } finally {
      this.isSearching = false;
    }
  }

  // Map weather type to particle type
  getParticleType(weatherType) {
    const map = {
      sunny: 'dust',
      cloudy: 'dust',
      rain: 'rain',
      snow: 'snow',
      thunderstorm: 'rain',
      night: 'stars',
      mist: 'mist',
      golden: 'dust',
    };
    return map[weatherType] || 'dust';
  }

  // Map weather type to audio type
  getAudioType(weatherType) {
    const map = {
      sunny: 'sunny',
      cloudy: 'wind',
      rain: 'rain',
      snow: 'snow',
      thunderstorm: 'thunder',
      night: 'night',
      mist: 'wind',
      golden: 'sunny',
    };
    return map[weatherType] || 'sunny';
  }

  // Keyboard navigation
  handleKeydown(e) {
    const items = this.suggestionsEl.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;

    const active = this.suggestionsEl.querySelector('.suggestion-item.active');
    let index = Array.from(items).indexOf(active);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      index = Math.min(index + 1, items.length - 1);
      items.forEach((i) => i.classList.remove('active'));
      if (items[index]) {
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      index = Math.max(index - 1, 0);
      items.forEach((i) => i.classList.remove('active'));
      if (items[index]) {
        items[index].classList.add('active');
        items[index].scrollIntoView({ block: 'nearest' });
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active) {
        this.selectCity(active);
      } else {
        this.submitSearch();
      }
    } else if (e.key === 'Escape') {
      this.hideSuggestions();
      this.searchInput.blur();
    }
  }

  showSuggestions() {
    if (this.suggestionsEl) {
      this.suggestionsEl.classList.add('active');
    }
  }

  hideSuggestions() {
    if (this.suggestionsEl) {
      this.suggestionsEl.classList.remove('active');
    }
  }

  onFocus() {
    if (this.suggestionsEl && this.suggestionsEl.children.length > 0) {
      this.showSuggestions();
    }
  }
}
