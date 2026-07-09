import gsap from 'gsap';

export class MicroInteractions {
  constructor() {
    this.tiltCards = [];
    this.magneticBtns = [];
  }

  // Initialize all micro-interactions
  init() {
    this.initMagneticButtons();
    this.initTiltCards();
    this.initRippleEffect();
    this.initSearchBarEffects();
  }

  // Magnetic button hover — button follows cursor within a radius
  initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic-btn');
    this.magneticBtns = Array.from(buttons);

    this.magneticBtns.forEach((btn) => {
      const boundMoveHandler = (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = e.clientX - centerX;
        const distY = e.clientY - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        const radius = 60;

        if (distance < radius) {
          const maxX = 8;
          const maxY = 6;
          const moveX = (distX / radius) * maxX;
          const moveY = (distY / radius) * maxY;
          gsap.to(btn, {
            x: moveX,
            y: moveY,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      };

      const boundLeaveHandler = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'elastic.out(1, 0.3)',
        });
      };

      btn.addEventListener('mousemove', boundMoveHandler);
      btn.addEventListener('mouseleave', boundLeaveHandler);

      btn._magneticMoveHandler = boundMoveHandler;
      btn._magneticLeaveHandler = boundLeaveHandler;
    });
  }

  // 3D tilt cards — cards rotate based on mouse position
  initTiltCards() {
    const cards = document.querySelectorAll('.tilt-card');
    this.tiltCards = Array.from(cards);

    this.tiltCards.forEach((card) => {
      // Remove old listeners if re-initializing
      if (card._tiltMoveHandler) {
        card.removeEventListener('mousemove', card._tiltMoveHandler);
        card.removeEventListener('mouseleave', card._tiltLeaveHandler);
        card.removeEventListener('mouseenter', card._tiltEnterHandler);
      }

      const moveHandler = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        const shineX = (x / rect.width) * 100;
        const shineY = (y / rect.height) * 100;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.setProperty('--shine-x', `${shineX}%`);
        card.style.setProperty('--shine-y', `${shineY}%`);
      };

      const leaveHandler = () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      };

      const enterHandler = () => {
        card.style.transition = 'none';
      };

      card.addEventListener('mousemove', moveHandler);
      card.addEventListener('mouseleave', leaveHandler);
      card.addEventListener('mouseenter', enterHandler);

      card._tiltMoveHandler = moveHandler;
      card._tiltLeaveHandler = leaveHandler;
      card._tiltEnterHandler = enterHandler;
    });
  }

  // Ripple effect on click for buttons
  initRippleEffect() {
    const buttons = document.querySelectorAll('.magnetic-btn');

    buttons.forEach((btn) => {
      // Ensure button has relative positioning for the ripple
      const computedPos = window.getComputedStyle(btn).position;
      if (computedPos === 'static') {
        btn.style.position = 'relative';
      }
      btn.style.overflow = 'hidden';

      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = Math.max(rect.width, rect.height) * 2;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
          position: absolute;
          left: ${x - size / 2}px;
          top: ${y - size / 2}px;
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%);
          transform: scale(0);
          animation: rippleAnim 0.6s ease-out forwards;
          pointer-events: none;
        `;

        btn.appendChild(ripple);

        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 600);
      });
    });

    // Inject ripple keyframe animation if not already present
    if (!document.getElementById('ripple-keyframes')) {
      const style = document.createElement('style');
      style.id = 'ripple-keyframes';
      style.textContent = `
        @keyframes rippleAnim {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Search bar glow and focus effects
  initSearchBarEffects() {
    const searchInput = document.getElementById('city-search');
    if (!searchInput) return;

    const wrapper = searchInput.closest('.hero-search-bar');
    const searchIcon = wrapper ? wrapper.querySelector('.search-icon') : null;

    searchInput.addEventListener('focus', () => {
      if (wrapper) {
        wrapper.classList.add('focused');
      }
      if (searchIcon) {
        gsap.to(searchIcon, {
          color: 'var(--accent, #60a5fa)',
          scale: 1.1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      if (wrapper) {
        gsap.to(wrapper, {
          boxShadow: '0 0 20px rgba(96, 165, 250, 0.3), 0 0 40px rgba(96, 165, 250, 0.1)',
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    });

    searchInput.addEventListener('blur', () => {
      if (wrapper) {
        wrapper.classList.remove('focused');
      }
      if (searchIcon) {
        gsap.to(searchIcon, {
          color: 'var(--text-secondary, #94a3b8)',
          scale: 1,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
      if (wrapper) {
        gsap.to(wrapper, {
          boxShadow: '0 0 0px rgba(96, 165, 250, 0)',
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    });
  }

  // Re-initialize tilt cards (called when new cards are added dynamically)
  refreshTiltCards() {
    this.initTiltCards();
  }

  // Animated counter — smoothly counts from 0 to target value
  static animateValue(element, target, duration = 1200, decimals = 0, suffix = '') {
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: duration / 1000,
      ease: 'expo.out',
      onUpdate: () => {
        element.textContent = obj.value.toFixed(decimals) + suffix;
      },
    });
  }
}
