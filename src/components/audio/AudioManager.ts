/**
 * AudioManager - Handles all game sounds using Web Audio API
 * Generates procedural sounds for gunshot, quack, hit, UI clicks, and game over
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    // Defer AudioContext creation until user interaction
  }

  /**
   * Initialize audio context on first user interaction
   */
  public init(): void {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.masterGain.gain.value = 0.7;
      this.sfxGain.gain.value = 1.0;
      this.musicGain.gain.value = 0.3;

      this.initialized = true;
    } catch (e) {
      console.warn('AudioManager: Web Audio API not supported');
      this.enabled = false;
    }
  }

  /**
   * Resume audio context if suspended (required for some browsers)
   */
  public async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  /**
   * Play gunshot sound with slight variation
   */
  public playGunshot(): void {
    if (!this.canPlay()) return;

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Create noise for gunshot
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate noise with decay
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (ctx.sampleRate * 0.03));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Lowpass filter for punch
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000 + Math.random() * 500, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    // Envelope
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    noise.start(now);
    noise.stop(now + 0.15);

    // Add a low frequency "thump"
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * Play duck quack sound
   */
  public playQuack(): void {
    if (!this.canPlay()) return;

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Create quack with oscillator
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';

    // Quack frequency modulation
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(250, now + 0.2);

    // Formant filter for "quacky" sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.value = 5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Play hit/impact sound
   */
  public playHit(): void {
    if (!this.canPlay()) return;

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Impact thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.15);

    // Add some "feathery" noise
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 2000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain!);

    noise.start(now);
    noise.stop(now + 0.1);
  }

  /**
   * Play UI click sound
   */
  public playClick(): void {
    if (!this.canPlay()) return;

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Play game over sound
   */
  public playGameOver(): void {
    if (!this.canPlay()) return;

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    // Descending tones
    const frequencies = [400, 350, 300, 200];
    const duration = 0.2;

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * duration);
      gain.gain.linearRampToValueAtTime(0.3, now + i * duration + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * duration + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + i * duration);
      osc.stop(now + i * duration + duration);
    });
  }

  /**
   * Play miss sound (empty chamber click)
   */
  public playMiss(): void {
    if (!this.canPlay()) return;

    const ctx = this.audioContext!;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(100, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  /**
   * Toggle audio on/off
   */
  public toggle(): void {
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? 0.7 : 0;
    }
  }

  /**
   * Check if audio is enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set master volume (0-1)
   */
  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Check if audio can play
   */
  private canPlay(): boolean {
    return this.initialized && this.enabled && this.audioContext !== null;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
