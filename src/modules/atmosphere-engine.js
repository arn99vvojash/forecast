/**
 * AtmosphereEngine Module
 * Controls the visual atmosphere of the weather experience by setting
 * data attributes on <html> that trigger CSS custom property themes.
 * Uses GSAP for cinematic crossfade transitions.
 */

import gsap from 'gsap';

export class AtmosphereEngine {
  constructor() {
    this.currentWeather = null;
    this.currentTime = null;
    this.isTransitioning = false;
    this.transitionOverlay = null;
  }

  /**
   * Set the weather atmosphere type on the <html> element.
   * This triggers CSS variable theme changes via [data-weather] selectors.
   * @param {string} weatherType - One of: 'sunny','cloudy','rain','snow','thunderstorm','night','mist','golden'
   */
  setWeather(weatherType) {
    const validTypes = ['sunny', 'cloudy', 'rain', 'snow', 'thunderstorm', 'night', 'mist', 'golden'];
    if (!validTypes.includes(weatherType)) {
      console.warn(`AtmosphereEngine: invalid weather type "${weatherType}", defaulting to "sunny"`);
      weatherType = 'sunny';
    }

    document.documentElement.setAttribute('data-weather', weatherType);
    this.currentWeather = weatherType;

    this.updateAmbientOverlay(weatherType);
  }

  /**
   * Set the time-of-day attribute on the <html> element.
   * @param {string} time - One of: 'morning','afternoon','evening','night'
   */
  setTimeOfDay(time) {
    const validTimes = ['morning', 'afternoon', 'evening', 'night'];
    if (!validTimes.includes(time)) {
      console.warn(`AtmosphereEngine: invalid time "${time}", defaulting to "afternoon"`);
      time = 'afternoon';
    }

    document.documentElement.setAttribute('data-time', time);
    this.currentTime = time;
  }

  /**
   * Perform a cinematic crossfade transition between two weather states.
   * Fades to a dark overlay, switches the weather, then fades back in.
   * @param {string} fromWeather - Current weather type
   * @param {string} toWeather - Target weather type
   * @param {number} duration - Total transition duration in seconds
   * @returns {Promise<void>} Resolves when transition completes
   */
  async transition(fromWeather, toWeather, duration = 1.2) {
    if (this.isTransitioning) return;
    if (fromWeather === toWeather) return;

    this.isTransitioning = true;

    // Create transition overlay element
    const overlay = document.createElement('div');
    overlay.className = 'atmosphere-transition-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0a0a1a',
      opacity: '0',
      zIndex: '9999',
      pointerEvents: 'none'
    });
    document.body.appendChild(overlay);
    this.transitionOverlay = overlay;

    const fadeOutDuration = duration * 0.35;
    const holdDuration = duration * 0.1;
    const fadeInDuration = duration * 0.55;

    try {
      // Phase 1: Fade to dark
      await gsap.to(overlay, {
        opacity: 1,
        duration: fadeOutDuration,
        ease: 'power2.in'
      });

      // Phase 2: Switch weather behind the dark overlay
      this.setWeather(toWeather);

      // Brief hold at full opacity
      await new Promise(resolve => setTimeout(resolve, holdDuration * 1000));

      // Phase 3: Fade back in to reveal new weather
      await gsap.to(overlay, {
        opacity: 0,
        duration: fadeInDuration,
        ease: 'power2.out'
      });
    } catch (error) {
      console.error('AtmosphereEngine.transition error:', error);
      // Still switch weather even if animation fails
      this.setWeather(toWeather);
    } finally {
      // Cleanup
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      this.transitionOverlay = null;
      this.isTransitioning = false;
    }
  }

  /**
   * Calculate the time of day based on current time relative to sunrise/sunset.
   * @param {string|Date} currentTime - Current time (ISO string or Date)
   * @param {string|Date} sunrise - Sunrise time (ISO string or Date)
   * @param {string|Date} sunset - Sunset time (ISO string or Date)
   * @returns {string} 'morning' | 'afternoon' | 'golden' | 'night'
   */
  getTimeOfDay(currentTime, sunrise, sunset) {
    try {
      const now = currentTime instanceof Date ? currentTime : new Date(currentTime);
      const sunriseDate = sunrise instanceof Date ? sunrise : new Date(sunrise);
      const sunsetDate = sunset instanceof Date ? sunset : new Date(sunset);

      const nowMs = now.getTime();
      const sunriseMs = sunriseDate.getTime();
      const sunsetMs = sunsetDate.getTime();

      // Before sunrise → night
      if (nowMs < sunriseMs) return 'night';

      // After sunset → night
      if (nowMs > sunsetMs) return 'night';

      // Calculate noon as midpoint between sunrise and sunset
      const noonMs = sunriseMs + (sunsetMs - sunriseMs) / 2;
      const oneHourMs = 60 * 60 * 1000;
      const goldenStart = sunsetMs - oneHourMs;

      // Sunrise to noon → morning
      if (nowMs >= sunriseMs && nowMs < noonMs) return 'morning';

      // Noon to 1 hour before sunset → afternoon
      if (nowMs >= noonMs && nowMs < goldenStart) return 'afternoon';

      // 1 hour before sunset to sunset → golden
      if (nowMs >= goldenStart && nowMs <= sunsetMs) return 'golden';

      return 'afternoon';
    } catch (error) {
      console.error('AtmosphereEngine.getTimeOfDay error:', error);
      // Fallback: use hour-based estimation
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 20) return 'golden';
      return 'night';
    }
  }

  /**
   * Update the ambient overlay gradient based on weather type.
   * Adjusts the #ambient-overlay element's background for atmospheric depth.
   * @param {string} weatherType - Current weather type
   */
  updateAmbientOverlay(weatherType) {
    const overlay = document.getElementById('ambient-overlay');
    if (!overlay) return;

    const gradients = {
      sunny: 'linear-gradient(180deg, rgba(135, 206, 250, 0.05) 0%, rgba(255, 223, 100, 0.03) 100%)',
      cloudy: 'linear-gradient(180deg, rgba(120, 130, 145, 0.12) 0%, rgba(90, 100, 115, 0.08) 100%)',
      rain: 'linear-gradient(180deg, rgba(50, 60, 80, 0.18) 0%, rgba(30, 40, 60, 0.12) 100%)',
      snow: 'linear-gradient(180deg, rgba(200, 210, 230, 0.1) 0%, rgba(180, 195, 220, 0.06) 100%)',
      thunderstorm: 'linear-gradient(180deg, rgba(20, 20, 35, 0.25) 0%, rgba(40, 30, 50, 0.15) 100%)',
      night: 'linear-gradient(180deg, rgba(10, 10, 30, 0.2) 0%, rgba(5, 5, 20, 0.15) 100%)',
      mist: 'linear-gradient(180deg, rgba(180, 190, 200, 0.15) 0%, rgba(160, 170, 180, 0.1) 100%)',
      golden: 'linear-gradient(180deg, rgba(255, 165, 0, 0.06) 0%, rgba(255, 100, 50, 0.04) 100%)'
    };

    const targetGradient = gradients[weatherType] || gradients.sunny;

    gsap.to(overlay, {
      background: targetGradient,
      duration: 0.8,
      ease: 'power1.inOut',
      onStart: () => {
        overlay.style.background = targetGradient;
      }
    });
  }
}
