import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export class AnimationSystem {
  constructor() {
    this.scrollTriggers = [];
  }

  // Initialize all scroll-based animations
  init() {
    this.initHeroAnimations();
    this.initSectionReveals();
    this.initForecastAnimations();
  }

  // Hero section entry animations
  initHeroAnimations() {
    const tl = gsap.timeline({ delay: 0.5 });
    
    const headline = document.querySelector('.hero-headline');
    const subtitle = document.querySelector('.hero-subtitle');
    const searchBar = document.querySelector('.hero-search-bar');
    const weatherCard = document.querySelector('.weather-card');
    
    if (headline) {
        tl.fromTo(headline, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
        );
    }
    
    if (subtitle) {
        tl.fromTo(subtitle, 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
            "-=0.6"
        );
    }
    
    if (searchBar) {
        tl.fromTo(searchBar, 
            { opacity: 0, y: 20, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' },
            "-=0.5"
        );
    }
    
    if (weatherCard) {
        tl.fromTo(weatherCard, 
            { opacity: 0, x: 40, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: 'power4.out' },
            "-=0.8"
        );
    }
  }

  // Animate greeting text dynamically (when searching)
  animateGreeting(greetingText, cityName) {
    const greetingEl = document.getElementById('greeting-line');
    const cityEl = document.getElementById('city-name');
    if (!greetingEl || !cityEl) return;

    greetingEl.textContent = greetingText;
    cityEl.textContent = cityName;

    gsap.fromTo([greetingEl, cityEl], 
        { opacity: 0, x: 10 }, 
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
  }

  // Play transition for cinematic city change
  playTransition() {
    return new Promise((resolve) => {
      const weatherCard = document.querySelector('.weather-card');
      const headline = document.querySelector('.hero-headline');
      const subtitle = document.querySelector('.hero-subtitle');
      
      gsap.to([weatherCard, headline, subtitle], {
        opacity: 0,
        y: -10,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.in',
        onComplete: resolve
      });
    });
  }

  // Animate weather data update (when searching)
  animateWeatherData() {
    const weatherCard = document.querySelector('.weather-card');
    const headline = document.querySelector('.hero-headline');
    const subtitle = document.querySelector('.hero-subtitle');
    
    if (headline && subtitle) {
        gsap.fromTo([headline, subtitle],
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
        );
    }

    if (!weatherCard) return;
    
    gsap.fromTo(weatherCard, { opacity: 0 }, { opacity: 1, duration: 0.8 });

    const elementsToAnimate = weatherCard.querySelectorAll('.wc-main, .wc-condition-row, .wc-stats-grid, .wc-sun-row');
    
    gsap.fromTo(elementsToAnimate,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' }
    );
  }

  // Initialize general section reveals on scroll
  initSectionReveals() {
    const sections = document.querySelectorAll('#forecast-section, #exploration, #atmosphere-section');

    sections.forEach((section) => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo(section, 
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
          );
        },
      });
      this.scrollTriggers.push(st);
    });
  }

  // Animate forecast panels when they scroll into view
  initForecastAnimations() {
    const panels = document.querySelectorAll('.forecast-panel');
    
    panels.forEach((panel, i) => {
        const st = ScrollTrigger.create({
            trigger: panel,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.fromTo(panel,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.8, delay: i * 0.2, ease: 'power3.out' }
                );
            }
        });
        this.scrollTriggers.push(st);
    });
  }

  // Refresh all scroll triggers (called after dynamic DOM changes)
  refresh() {
    ScrollTrigger.refresh();
  }
}
