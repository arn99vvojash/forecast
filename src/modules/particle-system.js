/**
 * ParticleSystem Module
 * Renders weather-themed particles on a full-viewport <canvas>.
 * Supports: rain, snow, dust, stars, mist.
 * Performance: object pooling, batched draw calls, integer coordinates.
 */

export class ParticleSystem {
  constructor(canvasId = 'particle-canvas') {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.currentType = null;
    this.nextType = null;
    this.isRunning = false;
    this.targetCount = 0;
    this.frameCount = 0;
    this.dpr = 1;
    this.width = 0;
    this.height = 0;
    this.lightningTimer = null;
    this.lightningActive = false;

    // Object pool for recycling particles
    this.pool = [];
    this.maxPoolSize = 500;

    if (this.canvas) {
      this.resize();
      this.boundResize = () => this.resize();
      window.addEventListener('resize', this.boundResize);
    }
  }

  /**
   * Match canvas dimensions to window size, accounting for device pixel ratio.
   */
  resize() {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = (this.width * this.dpr) | 0;
    this.canvas.height = (this.height * this.dpr) | 0;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Get a particle from the pool or create a new object.
   */
  acquireParticle() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return {};
  }

  /**
   * Return a particle to the pool for reuse.
   */
  releaseParticle(p) {
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(p);
    }
  }

  /**
   * Switch particle type with a smooth dissolve.
   * Existing particles fade out while new ones spawn.
   * @param {string} type - 'rain' | 'snow' | 'dust' | 'stars' | 'mist' | 'none'
   */
  setType(type) {
    if (type === this.currentType) return;

    // Mark existing particles for fade-out
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].dying = true;
    }

    this.currentType = type;
    this.frameCount = 0;

    // Stop lightning if switching away from thunderstorm-related types
    if (type !== 'rain') {
      this.stopLightning();
    }

    // Configure target counts per type
    switch (type) {
      case 'rain':
        this.targetCount = 300;
        break;
      case 'snow':
        this.targetCount = 150;
        break;
      case 'dust':
        this.targetCount = 80;
        break;
      case 'stars':
        this.targetCount = 200;
        this.spawnAllStars();
        break;
      case 'mist':
        this.targetCount = 30;
        this.spawnAllMist();
        break;
      case 'none':
        this.targetCount = 0;
        break;
      default:
        this.targetCount = 0;
    }

    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Start the animation loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  /**
   * Stop the animation loop.
   */
  stop() {
    this.isRunning = false;
    this.stopLightning();
  }

  /**
   * Main animation loop.
   */
  animate() {
    if (!this.isRunning) return;
    this.update();
    this.draw();
    this.frameCount++;
    requestAnimationFrame(() => this.animate());
  }

  /**
   * Update all particles: move, spawn new ones, recycle dead ones.
   */
  update() {
    const type = this.currentType;
    const w = this.width;
    const h = this.height;

    // Count active (non-dying) particles
    let activeCount = 0;
    for (let i = 0; i < this.particles.length; i++) {
      if (!this.particles[i].dying) activeCount++;
    }

    // Spawn new particles based on type
    if (type === 'rain' && activeCount < this.targetCount) {
      const spawnCount = Math.min(6, this.targetCount - activeCount);
      for (let i = 0; i < spawnCount; i++) {
        this.particles.push(this.spawnRain());
      }
    } else if (type === 'snow' && activeCount < this.targetCount) {
      const spawnCount = Math.min(2, this.targetCount - activeCount);
      for (let i = 0; i < spawnCount; i++) {
        this.particles.push(this.spawnSnow());
      }
    } else if (type === 'dust' && activeCount < this.targetCount && this.frameCount % 3 === 0) {
      this.particles.push(this.spawnDust());
    }

    // Update each particle
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      // Handle dying particles (fade out)
      if (p.dying) {
        p.opacity -= 0.02;
        if (p.opacity <= 0) {
          this.releaseParticle(this.particles.splice(i, 1)[0]);
          continue;
        }
      }

      // Type-specific movement
      switch (p.type) {
        case 'rain':
          p.x += p.vx;
          p.y += p.vy;
          // Recycle if off-screen
          if (p.y > h + 20 || p.x < -20) {
            if (p.dying || type !== 'rain') {
              this.releaseParticle(this.particles.splice(i, 1)[0]);
            } else {
              p.x = Math.random() * (w + 100) - 50;
              p.y = -10 - Math.random() * 40;
            }
          }
          break;

        case 'snow':
          p.phase += p.phaseSpeed;
          p.x += Math.sin(p.phase) * p.wobble + p.vx;
          p.y += p.vy;
          // Recycle if off-screen
          if (p.y > h + 10) {
            if (p.dying || type !== 'snow') {
              this.releaseParticle(this.particles.splice(i, 1)[0]);
            } else {
              p.x = Math.random() * w;
              p.y = -10;
              p.phase = Math.random() * Math.PI * 2;
            }
          }
          break;

        case 'dust':
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.002;
          p.opacity = p.baseOpacity * p.life;
          if (p.life <= 0 || p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
            if (p.dying || type !== 'dust') {
              this.releaseParticle(this.particles.splice(i, 1)[0]);
            } else {
              Object.assign(p, this.spawnDust());
            }
          }
          break;

        case 'star':
          p.twinklePhase += p.twinkleSpeed;
          p.opacity = p.baseOpacity * (0.5 + 0.5 * Math.sin(p.twinklePhase));
          if (p.dying && p.opacity <= 0.01) {
            this.releaseParticle(this.particles.splice(i, 1)[0]);
          }
          break;

        case 'mist':
          p.x += p.vx;
          p.phase += 0.003;
          p.y += Math.sin(p.phase) * 0.15;
          p.opacity = p.baseOpacity * (0.6 + 0.4 * Math.sin(p.phase * 0.7));
          // Wrap horizontally
          if (p.x > w + p.size) {
            p.x = -p.size;
          } else if (p.x < -p.size) {
            p.x = w + p.size;
          }
          if (p.dying && p.opacity <= 0.005) {
            this.releaseParticle(this.particles.splice(i, 1)[0]);
          }
          break;
      }
    }
  }

  /**
   * Clear canvas and draw all particles, batching draw calls by type.
   */
  draw() {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);

    // Sort by type to batch draw calls
    const rain = [];
    const snow = [];
    const dust = [];
    const stars = [];
    const mist = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      switch (p.type) {
        case 'rain': rain.push(p); break;
        case 'snow': snow.push(p); break;
        case 'dust': dust.push(p); break;
        case 'star': stars.push(p); break;
        case 'mist': mist.push(p); break;
      }
    }

    // Draw each type in batch
    if (mist.length > 0) this.drawMist(ctx, mist);
    if (rain.length > 0) this.drawRain(ctx, rain);
    if (snow.length > 0) this.drawSnow(ctx, snow);
    if (dust.length > 0) this.drawDust(ctx, dust);
    if (stars.length > 0) this.drawStars(ctx, stars);
  }

  // ─── Spawn Functions ──────────────────────────────────────────

  /**
   * Create a raindrop particle.
   */
  spawnRain() {
    const p = this.acquireParticle();
    p.type = 'rain';
    p.x = Math.random() * (this.width + 100) - 50;
    p.y = -10 - Math.random() * this.height * 0.5;
    p.vy = 15 + Math.random() * 10; // 15-25
    p.vx = -1 - Math.random() * 2;   // -1 to -3 (wind)
    p.length = 15 + Math.random() * 10; // 15-25
    p.opacity = 0.2 + Math.random() * 0.4; // 0.2-0.6
    p.dying = false;
    return p;
  }

  /**
   * Create a snowflake particle.
   */
  spawnSnow() {
    const p = this.acquireParticle();
    p.type = 'snow';
    p.x = Math.random() * this.width;
    p.y = -10 - Math.random() * 40;
    p.vy = 0.5 + Math.random() * 1.5; // 0.5-2
    p.vx = (Math.random() - 0.5) * 0.3;
    p.size = 2 + Math.random() * 3; // 2-5
    p.opacity = 0.4 + Math.random() * 0.5; // 0.4-0.9
    p.phase = Math.random() * Math.PI * 2;
    p.phaseSpeed = 0.01 + Math.random() * 0.02;
    p.wobble = 0.3 + Math.random() * 0.7;
    p.dying = false;
    return p;
  }

  /**
   * Create a dust mote particle.
   */
  spawnDust() {
    const p = this.acquireParticle();
    p.type = 'dust';
    p.x = Math.random() * this.width;
    p.y = Math.random() * this.height;
    p.vy = (Math.random() - 0.5) * 0.4; // -0.2 to 0.2
    p.vx = (Math.random() - 0.5) * 0.6; // -0.3 to 0.3
    p.size = 1 + Math.random() * 2; // 1-3
    p.baseOpacity = 0.1 + Math.random() * 0.2; // 0.1-0.3
    p.opacity = p.baseOpacity;
    p.life = 1.0;
    p.hue = 35 + Math.random() * 15; // Warm golden range
    p.dying = false;
    return p;
  }

  /**
   * Create a star particle.
   */
  spawnStar() {
    const p = this.acquireParticle();
    p.type = 'star';
    p.x = Math.random() * this.width;
    p.y = Math.random() * this.height * 0.7; // Stars mostly in upper 70%
    p.size = 0.5 + Math.random() * 2; // 0.5-2.5
    p.baseOpacity = 0.3 + Math.random() * 0.7; // 0.3-1.0
    p.opacity = p.baseOpacity;
    p.twinklePhase = Math.random() * Math.PI * 2;
    p.twinkleSpeed = 0.015 + Math.random() * 0.035;
    p.dying = false;
    return p;
  }

  /**
   * Create a mist blob particle.
   */
  spawnMistParticle() {
    const p = this.acquireParticle();
    p.type = 'mist';
    p.x = Math.random() * (this.width + 200) - 100;
    p.y = Math.random() * this.height;
    p.size = 80 + Math.random() * 120; // 80-200
    p.baseOpacity = 0.02 + Math.random() * 0.04; // 0.02-0.06
    p.opacity = p.baseOpacity;
    p.vx = 0.1 + Math.random() * 0.3; // Very slow drift
    p.phase = Math.random() * Math.PI * 2;
    p.dying = false;
    return p;
  }

  /**
   * Spawn all stars at once (fixed positions).
   */
  spawnAllStars() {
    for (let i = 0; i < 200; i++) {
      this.particles.push(this.spawnStar());
    }
  }

  /**
   * Spawn all mist blobs at once.
   */
  spawnAllMist() {
    for (let i = 0; i < 30; i++) {
      this.particles.push(this.spawnMistParticle());
    }
  }

  // ─── Draw Functions ───────────────────────────────────────────

  /**
   * Draw rain particles as thin angled lines with a blue tint.
   */
  drawRain(ctx, particles) {
    ctx.lineCap = 'round';
    ctx.lineWidth = 1.5;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const x = p.x | 0;
      const y = p.y | 0;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
      ctx.moveTo(x, y);
      ctx.lineTo((x + p.vx * 0.8) | 0, (y + p.length) | 0);
      ctx.stroke();
    }
  }

  /**
   * Draw snowflakes as small white circles with soft edges.
   */
  drawSnow(ctx, particles) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const x = p.x | 0;
      const y = p.y | 0;

      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow for larger flakes
      if (p.size > 3) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.2})`;
        ctx.arc(x, y, p.size * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /**
   * Draw dust motes as tiny golden/warm circles.
   */
  drawDust(ctx, particles) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const x = p.x | 0;
      const y = p.y | 0;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Subtle warm glow
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${p.opacity * 0.3})`;
      ctx.arc(x, y, p.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draw stars as small bright dots with twinkle animation.
   */
  drawStars(ctx, particles) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const x = p.x | 0;
      const y = p.y | 0;

      // Core dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 255, 240, ${p.opacity})`;
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Cross-shaped twinkle for brighter stars
      if (p.opacity > 0.6 && p.size > 1.2) {
        const len = p.size * 2.5 * p.opacity;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 255, 240, ${p.opacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(x - len, y);
        ctx.lineTo(x + len, y);
        ctx.moveTo(x, y - len);
        ctx.lineTo(x, y + len);
        ctx.stroke();
      }
    }
  }

  /**
   * Draw mist as large semi-transparent circles with soft blur effect.
   */
  drawMist(ctx, particles) {
    ctx.save();
    // Use globalCompositeOperation for layered fog effect
    ctx.globalCompositeOperation = 'screen';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const x = p.x | 0;
      const y = p.y | 0;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, p.size);
      gradient.addColorStop(0, `rgba(200, 210, 220, ${p.opacity})`);
      gradient.addColorStop(0.5, `rgba(190, 200, 215, ${p.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(180, 195, 210, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ─── Lightning ────────────────────────────────────────────────

  /**
   * Start periodic lightning flashes (for thunderstorm weather).
   */
  startLightning() {
    if (this.lightningActive) return;
    this.lightningActive = true;
    this.scheduleLightning();
  }

  /**
   * Stop lightning flashes.
   */
  stopLightning() {
    this.lightningActive = false;
    if (this.lightningTimer) {
      clearTimeout(this.lightningTimer);
      this.lightningTimer = null;
    }
  }

  /**
   * Schedule the next lightning flash at a random interval.
   */
  scheduleLightning() {
    if (!this.lightningActive) return;
    const delay = 3000 + Math.random() * 7000; // 3-10 seconds
    this.lightningTimer = setTimeout(() => {
      this.triggerLightning();
      this.scheduleLightning();
    }, delay);
  }

  /**
   * Trigger a lightning flash effect using the #lightning-overlay element.
   * Creates a rapid double-flash pattern.
   */
  triggerLightning() {
    const overlay = document.getElementById('lightning-overlay');
    if (!overlay) return;

    // First flash: bright
    overlay.style.opacity = '0.7';

    setTimeout(() => {
      overlay.style.opacity = '0';
    }, 80);

    // Second flash: dimmer, after brief dark gap
    setTimeout(() => {
      overlay.style.opacity = '0.3';
    }, 160);

    setTimeout(() => {
      overlay.style.opacity = '0';
    }, 260);
  }

  /**
   * Destroy the particle system and clean up resources.
   */
  destroy() {
    this.stop();
    this.particles = [];
    this.pool = [];
    if (this.boundResize) {
      window.removeEventListener('resize', this.boundResize);
    }
  }
}
