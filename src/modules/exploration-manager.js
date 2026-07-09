import gsap from 'gsap';
import { destinations } from '../data/destinations.js';

export class ExplorationManager {
  constructor(weatherAPI) {
    this.weatherAPI = weatherAPI;
    this.container = document.getElementById('exploration');
    this.titleEl = document.getElementById('exploration-title');
    this.subtitleEl = document.getElementById('exploration-subtitle');
    this.gridEl = document.getElementById('destination-grid');
    this.currentCountry = null;
  }

  // Load destinations for a country
  async loadDestinations(countryName) {
    // Normalize country name to key (lowercase)
    const key = this.findCountryKey(countryName);
    if (!key || key === this.currentCountry) return;
    this.currentCountry = key;

    const countryDests = destinations[key];
    if (!countryDests || countryDests.length === 0) {
      this.hide();
      return;
    }

    // Update title
    const displayName = countryDests[0]?.country || countryName;
    if (this.titleEl) {
      this.titleEl.textContent = `Explore ${displayName}`;
    }
    if (this.subtitleEl) {
      this.subtitleEl.textContent = `Discover beautiful destinations in ${displayName}`;
    }

    // Clear grid and render cards
    if (this.gridEl) {
      this.gridEl.innerHTML = '';

      // Create cards
      countryDests.forEach((dest, i) => {
        const card = this.createCard(dest, i);
        this.gridEl.appendChild(card);
      });
      
      this.setupCarouselDots(countryDests.length);
    }

    // Show section
    this.show();

    // Animate cards in with stagger
    if (this.gridEl && this.gridEl.children.length > 0) {
      gsap.from(this.gridEl.children, {
        opacity: 0,
        x: 60,
        scale: 0.95,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        delay: 0.3,
      });
    }

    // Fetch live weather for each destination (with delays to respect rate limits)
    this.fetchDestinationWeather(countryDests);
  }

  setupCarouselDots(count) {
    const dotsContainer = document.getElementById('carousel-dots');
    if (!dotsContainer || !this.gridEl) return;
    
    dotsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => {
            const card = this.gridEl.children[i];
            if (card) {
                this.gridEl.scrollTo({
                    left: card.offsetLeft - this.gridEl.offsetLeft,
                    behavior: 'smooth'
                });
            }
        });
        dotsContainer.appendChild(dot);
    }
    
    // Sync dots on scroll
    this.gridEl.addEventListener('scroll', () => {
        const scrollLeft = this.gridEl.scrollLeft;
        const cardWidth = this.gridEl.children[0]?.offsetWidth || 260;
        const gap = 20;
        const index = Math.round(scrollLeft / (cardWidth + gap));
        
        Array.from(dotsContainer.children).forEach((dot, i) => {
            if (i === index) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    });
  }

  // Create a destination card DOM element
  createCard(dest, index) {
    const card = document.createElement('div');
    card.className = 'destination-card tilt-card';
    card.innerHTML = `
      <div class="destination-image" style="background-image: url('${dest.imageUrl}')"></div>
      <div class="destination-overlay"></div>
      
      <div class="destination-info">
        <div class="destination-country">${dest.country}</div>
        <h3 class="destination-name">${dest.name}</h3>
        
        <div class="destination-weather-badge" id="dest-weather-${index}">
          <span class="destination-temp">--°</span>
          <span class="destination-condition">Loading...</span>
        </div>
        
        <p class="destination-description">${dest.description}</p>
      </div>
      
      <div class="destination-arrow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </div>
    `;

    // Add click handler to search for this destination
    card.addEventListener('click', () => {
      const searchInput = document.getElementById('city-search');
      if (searchInput) {
        searchInput.value = dest.name;
        searchInput.dispatchEvent(new Event('input'));
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    return card;
  }

  // Fetch weather for destinations with rate limiting
  async fetchDestinationWeather(dests) {
    for (let i = 0; i < dests.length; i++) {
      try {
        // Small delay between requests to respect rate limits
        if (i > 0) await this.delay(400);

        const weather = await this.weatherAPI.fetchWeather(
          dests[i].lat,
          dests[i].lon
        );
        const weatherEl = document.getElementById(`dest-weather-${i}`);
        if (weatherEl) {
          const tempEl = weatherEl.querySelector('.destination-temp');
          const condEl = weatherEl.querySelector('.destination-condition');
          if (tempEl) {
            tempEl.textContent = `${Math.round(weather.temp)}°`;
          }
          if (condEl) {
            condEl.textContent = weather.description;
          }

          // Subtle fade-in for the weather data
          gsap.fromTo(
            weatherEl,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' }
          );
        }
      } catch (err) {
        console.error(`Weather fetch failed for ${dests[i].name}:`, err);
        const weatherEl = document.getElementById(`dest-weather-${i}`);
        if (weatherEl) {
          const condEl = weatherEl.querySelector('.destination-condition');
          if (condEl) {
            condEl.textContent = 'Unavailable';
          }
        }
      }
    }
  }

  // Find country key from country name (fuzzy match)
  findCountryKey(name) {
    if (!name) return null;
    const lower = name.toLowerCase().trim();

    // Direct match
    if (destinations[lower]) return lower;

    // Check if any country's destinations match
    for (const [key, dests] of Object.entries(destinations)) {
      if (!dests || dests.length === 0) continue;

      // Country name match
      if (dests[0]?.country?.toLowerCase() === lower) return key;

      // Partial match (key includes name or name includes key)
      if (key.includes(lower) || lower.includes(key)) return key;

      // Country code match
      if (dests[0]?.countryCode?.toLowerCase() === lower) return key;
    }

    return null;
  }

  show() {
    if (this.container) {
      this.container.classList.add('visible');
      this.container.style.display = 'block';
    }
  }

  hide() {
    if (this.container) {
      this.container.classList.remove('visible');
    }
  }

  delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
