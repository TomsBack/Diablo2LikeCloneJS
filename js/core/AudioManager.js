export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
  }

  _ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  _playTone(frequency, duration, type = 'square', gainVal = null) {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    gain.gain.value = (gainVal ?? this.volume) * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  _playNoise(duration, filterFreq = 1000, gainVal = null) {
    if (!this.enabled) return;
    const ctx = this._ensureContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;

    const gain = ctx.createGain();
    gain.gain.value = (gainVal ?? this.volume) * 0.3;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  }

  playHit() {
    this._playNoise(0.15, 300);
    this._playTone(150, 0.1, 'square', 0.15);
  }

  playCritical() {
    this._playNoise(0.2, 400, 0.4);
    this._playTone(200, 0.15, 'sawtooth', 0.25);
  }

  playMonsterDeath() {
    this._playTone(200, 0.3, 'sawtooth', 0.2);
    setTimeout(() => this._playTone(120, 0.2, 'sawtooth', 0.15), 100);
  }

  playPlayerHit() {
    this._playNoise(0.1, 500, 0.3);
    this._playTone(300, 0.1, 'sine', 0.2);
  }

  playItemPickup() {
    this._playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => this._playTone(800, 0.1, 'sine', 0.2), 80);
  }

  playGoldPickup() {
    this._playTone(800, 0.08, 'sine', 0.15);
    setTimeout(() => this._playTone(1000, 0.08, 'sine', 0.15), 60);
    setTimeout(() => this._playTone(1200, 0.1, 'sine', 0.15), 120);
  }

  playLevelUp() {
    const notes = [400, 500, 600, 800];
    notes.forEach((freq, i) => {
      setTimeout(() => this._playTone(freq, 0.2, 'sine', 0.25), i * 100);
    });
  }

  playFireball() {
    this._playNoise(0.3, 200, 0.2);
    this._playTone(100, 0.3, 'sawtooth', 0.15);
  }

  playIceBolt() {
    this._playTone(1200, 0.15, 'sine', 0.15);
    this._playNoise(0.1, 2000, 0.1);
  }

  playLightning() {
    this._playNoise(0.15, 3000, 0.3);
    this._playTone(800, 0.1, 'square', 0.2);
  }

  playTeleport() {
    this._playTone(400, 0.15, 'sine', 0.15);
    setTimeout(() => this._playTone(800, 0.15, 'sine', 0.15), 50);
  }

  playPotionUse() {
    this._playTone(500, 0.15, 'sine', 0.15);
    this._playNoise(0.1, 1500, 0.08);
  }

  playStairs() {
    this._playTone(300, 0.2, 'sine', 0.2);
    setTimeout(() => this._playTone(400, 0.2, 'sine', 0.2), 150);
    setTimeout(() => this._playTone(500, 0.3, 'sine', 0.2), 300);
  }

  playUIOpen() {
    this._playTone(600, 0.08, 'sine', 0.1);
  }

  playUIClose() {
    this._playTone(400, 0.08, 'sine', 0.1);
  }

  playFootstep() {
    this._playNoise(0.05, 200, 0.05);
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}
