/**
 * AudioEngine Module
 * Procedural ambient sound generation using the Web Audio API.
 * All sounds are synthesized — no external audio files required.
 * Sounds: rain, thunder, wind, snow, sunny, night, forest, ocean.
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentSounds = [];
    this.isMuted = true;
    this.currentType = null;
    this.isInitialized = false;
    this.noiseBuffer = null;
    this.thunderTimer = null;
    this.cricketTimer = null;
  }

  /**
   * Initialize the AudioContext. MUST be called from a user gesture (click/tap).
   */
  init() {
    if (this.isInitialized) return;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.ctx.destination);
      this.noiseBuffer = this.createNoiseBuffer(4);
      this.isInitialized = true;
    } catch (error) {
      console.error('AudioEngine.init failed:', error);
    }
  }

  /**
   * Create a reusable stereo white noise buffer.
   * @param {number} seconds - Duration of the buffer in seconds
   * @returns {AudioBuffer} White noise buffer
   */
  createNoiseBuffer(seconds) {
    const size = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(2, size, this.ctx.sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < size; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    return buffer;
  }

  /**
   * Create a looping noise source from the shared noise buffer.
   * @returns {AudioBufferSourceNode}
   */
  createNoiseSource() {
    const source = this.ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    return source;
  }

  /**
   * Set the ambient sound type with crossfade transition.
   * @param {string} type - 'rain'|'thunder'|'wind'|'ocean'|'forest'|'night'|'snow'|'sunny'
   * @param {boolean} force - Force restart even if type is same
   */
  async setType(type, force = false) {
    if (!this.isInitialized) return;
    if (type === this.currentType && !force) return;

    // Resume context if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        // Ignore resume failures
      }
    }

    await this.fadeOut(0.8);
    this.stopAll();
    this.currentType = type;

    if (type && type !== 'none') {
      this.startSound(type);
    }

    if (!this.isMuted) {
      await this.fadeIn(0.8);
    }
  }

  /**
   * Route to the correct sound generator.
   * @param {string} type
   */
  startSound(type) {
    switch (type) {
      case 'rain':
        this.startRain();
        break;
      case 'thunder':
        this.startRain();
        this.startWind();
        this.scheduleThunder();
        break;
      case 'wind':
        this.startWind();
        break;
      case 'snow':
        this.startSnowAmbience();
        break;
      case 'sunny':
        this.startBreeze();
        break;
      case 'night':
        this.startNightAmbience();
        break;
      case 'forest':
        this.startForest();
        break;
      case 'ocean':
        this.startOcean();
        break;
    }
  }

  /**
   * Rain: bandpass-filtered noise at ~800Hz for a window-rain sound.
   */
  startRain() {
    const noise = this.createNoiseSource();

    // Primary rain band
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 800;
    bandpass.Q.value = 0.5;

    // Secondary high-frequency shimmer
    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 4000;
    highpass.Q.value = 0.3;

    const gainLow = this.ctx.createGain();
    gainLow.gain.value = 0.35;

    const gainHigh = this.ctx.createGain();
    gainHigh.gain.value = 0.08;

    // Low rain layer
    noise.connect(bandpass);
    bandpass.connect(gainLow);
    gainLow.connect(this.masterGain);

    // High shimmer layer (use a second noise source)
    const noise2 = this.createNoiseSource();
    noise2.connect(highpass);
    highpass.connect(gainHigh);
    gainHigh.connect(this.masterGain);

    noise.start();
    noise2.start();

    this.currentSounds.push(
      { source: noise, nodes: [bandpass, gainLow] },
      { source: noise2, nodes: [highpass, gainHigh] }
    );
  }

  /**
   * Wind: lowpass-filtered noise at ~400Hz with slow LFO modulation
   * for a gentle howling effect.
   */
  startWind() {
    const noise = this.createNoiseSource();

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;
    lowpass.Q.value = 1.0;

    // LFO to modulate filter frequency for howling effect
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // Very slow oscillation

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 200; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.2;

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.currentSounds.push(
      { source: noise, nodes: [lowpass, gain] },
      { source: lfo, nodes: [lfoGain] }
    );
  }

  /**
   * Snow ambience: very quiet, high-filtered wind for that still,
   * muffled silence of a snowy landscape.
   */
  startSnowAmbience() {
    const noise = this.createNoiseSource();

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 250;
    lowpass.Q.value = 0.3;

    // Very subtle LFO
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.05;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 80;

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.08;

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.currentSounds.push(
      { source: noise, nodes: [lowpass, gain] },
      { source: lfo, nodes: [lfoGain] }
    );
  }

  /**
   * Sunny breeze: very gentle, high-frequency filtered noise
   * for a light, airy outdoor feeling.
   */
  startBreeze() {
    const noise = this.createNoiseSource();

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 2000;
    highpass.Q.value = 0.2;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 5000;
    lowpass.Q.value = 0.2;

    // Very slow modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 1000;

    lfo.connect(lfoGain);
    lfoGain.connect(highpass.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.04;

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.currentSounds.push(
      { source: noise, nodes: [highpass, lowpass, gain] },
      { source: lfo, nodes: [lfoGain] }
    );
  }

  /**
   * Night ambience: filtered low-frequency noise base
   * with periodic cricket-like chirps from high-freq oscillators.
   */
  startNightAmbience() {
    // Base: very low, dark noise
    const noise = this.createNoiseSource();

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 300;
    lowpass.Q.value = 0.5;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.06;

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();

    this.currentSounds.push(
      { source: noise, nodes: [lowpass, gain] }
    );

    // Cricket chirps: periodic high-frequency pings
    this.scheduleCrickets();
  }

  /**
   * Schedule periodic cricket chirps for night ambience.
   */
  scheduleCrickets() {
    if (this.currentType !== 'night') return;

    const chirp = () => {
      if (this.currentType !== 'night') return;
      this.playCricketChirp();
      const nextDelay = 800 + Math.random() * 2200;
      this.cricketTimer = setTimeout(chirp, nextDelay);
    };

    this.cricketTimer = setTimeout(chirp, 500);
  }

  /**
   * Play a single cricket chirp: rapid high-frequency oscillator burst.
   */
  playCricketChirp() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const freq = 4500 + Math.random() * 1500; // 4500-6000 Hz

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);

    // Rapid chirp pattern: 2-4 quick pulses
    const pulseCount = 2 + Math.floor(Math.random() * 3);
    const pulseLen = 0.03;
    const gapLen = 0.04;

    for (let i = 0; i < pulseCount; i++) {
      const t = now + i * (pulseLen + gapLen);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.01, t + 0.005);
      gain.gain.linearRampToValueAtTime(0, t + pulseLen);
    }

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + pulseCount * (pulseLen + gapLen) + 0.05);
  }

  /**
   * Forest: layered noise with bird-like chirps and gentle wind.
   */
  startForest() {
    // Gentle wind layer
    const noise = this.createNoiseSource();

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 500;
    bandpass.Q.value = 0.3;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 150;

    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.07;

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    lfo.start();

    this.currentSounds.push(
      { source: noise, nodes: [bandpass, gain] },
      { source: lfo, nodes: [lfoGain] }
    );

    // Periodic bird-like chirps
    this.scheduleBirdChirps();
  }

  /**
   * Schedule periodic bird chirps for forest ambience.
   */
  scheduleBirdChirps() {
    if (this.currentType !== 'forest') return;

    const chirp = () => {
      if (this.currentType !== 'forest') return;
      this.playBirdChirp();
      const nextDelay = 2000 + Math.random() * 5000;
      this.cricketTimer = setTimeout(chirp, nextDelay);
    };

    this.cricketTimer = setTimeout(chirp, 1000);
  }

  /**
   * Play a single bird chirp: frequency-swept oscillator.
   */
  playBirdChirp() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;
    const baseFreq = 2000 + Math.random() * 2000;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.02, now + 0.01);
    gain.gain.setValueAtTime(0.02, now + 0.15);
    gain.gain.linearRampToValueAtTime(0, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Ocean: layered filtered noise with slow amplitude modulation
   * simulating rolling waves.
   */
  startOcean() {
    const noise = this.createNoiseSource();

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 600;
    lowpass.Q.value = 0.3;

    // Wave-like amplitude modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08; // Very slow rolling

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.12;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.2;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    noise.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Higher-frequency surf layer
    const noise2 = this.createNoiseSource();
    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2000;
    bandpass.Q.value = 0.4;

    const lfo2 = this.ctx.createOscillator();
    lfo2.type = 'sine';
    lfo2.frequency.value = 0.12;

    const lfoGain2 = this.ctx.createGain();
    lfoGain2.gain.value = 0.04;

    const gainNode2 = this.ctx.createGain();
    gainNode2.gain.value = 0.06;

    lfo2.connect(lfoGain2);
    lfoGain2.connect(gainNode2.gain);

    noise2.connect(bandpass);
    bandpass.connect(gainNode2);
    gainNode2.connect(this.masterGain);

    noise.start();
    noise2.start();
    lfo.start();
    lfo2.start();

    this.currentSounds.push(
      { source: noise, nodes: [lowpass, gainNode] },
      { source: lfo, nodes: [lfoGain] },
      { source: noise2, nodes: [bandpass, gainNode2] },
      { source: lfo2, nodes: [lfoGain2] }
    );
  }

  /**
   * Schedule periodic thunder claps for thunderstorm ambience.
   */
  scheduleThunder() {
    if (this.currentType !== 'thunder') return;

    const thunder = () => {
      if (this.currentType !== 'thunder') return;
      this.playThunderClap();
      const nextDelay = 5000 + Math.random() * 10000; // 5-15 seconds
      this.thunderTimer = setTimeout(thunder, nextDelay);
    };

    this.thunderTimer = setTimeout(thunder, 2000 + Math.random() * 3000);
  }

  /**
   * Play a single thunder clap: noise burst through a low-pass filter
   * with a fast attack and slow decay envelope.
   */
  playThunderClap() {
    if (!this.ctx || this.ctx.state !== 'running') return;

    const now = this.ctx.currentTime;

    const noise = this.createNoiseSource();

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 150;
    lowpass.Q.value = 0.5;

    const gain = this.ctx.createGain();
    // Fast attack, slow decay envelope
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.03, now + 1.2);
    gain.gain.linearRampToValueAtTime(0, now + 2.0);

    noise.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 2.5);
  }

  /**
   * Smoothly fade master gain to target volume.
   * @param {number} duration - Fade duration in seconds
   * @returns {Promise<void>}
   */
  async fadeIn(duration = 0.8) {
    if (!this.isInitialized || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.25, now + duration);

    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  /**
   * Smoothly fade master gain to zero.
   * @param {number} duration - Fade duration in seconds
   * @returns {Promise<void>}
   */
  async fadeOut(duration = 0.8) {
    if (!this.isInitialized || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + duration);

    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  /**
   * Toggle mute/unmute with smooth fade.
   * @returns {boolean} New muted state
   */
  toggle() {
    if (!this.isInitialized) {
      this.init();
    }

    this.isMuted = !this.isMuted;

    if (this.isMuted) {
      this.fadeOut(0.5);
    } else {
      // Resume context if needed (browser autoplay policy)
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.fadeIn(0.5);
    }

    return this.isMuted;
  }

  /**
   * Stop all currently playing sound nodes and clear timers.
   */
  stopAll() {
    // Stop all audio sources
    for (const sound of this.currentSounds) {
      try {
        sound.source.stop();
      } catch {
        // Source may already be stopped
      }
      try {
        sound.source.disconnect();
      } catch {
        // Already disconnected
      }
      if (sound.nodes) {
        for (const node of sound.nodes) {
          try {
            node.disconnect();
          } catch {
            // Already disconnected
          }
        }
      }
    }
    this.currentSounds = [];

    // Clear scheduled timers
    if (this.thunderTimer) {
      clearTimeout(this.thunderTimer);
      this.thunderTimer = null;
    }
    if (this.cricketTimer) {
      clearTimeout(this.cricketTimer);
      this.cricketTimer = null;
    }
  }
}
