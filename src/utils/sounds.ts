// Sound effect utilities for Matchmatch Battle
// All sounds are generated using Web Audio API for lightweight, license‑free SFX

type SoundType = 
  | 'correct'
  | 'wrong'
  | 'attack'
  | 'heal'
  | 'shield'
  | 'tick'
  | 'gameOver'
  | 'combo'
  | 'speedBonus'
  | 'button';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.3; // Global volume
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', gain = 0.3): void {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.masterGain!);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  private playNoise(duration: number, gain = 0.2, filterFreq?: number): void {
    const ctx = this.getContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    if (filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);
      source.connect(filter);
      filter.connect(gainNode);
    } else {
      source.connect(gainNode);
    }

    gainNode.connect(this.masterGain!);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + duration);
  }

  public play(type: SoundType): void {
    // Resume context if suspended (browser autoplay policy)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (type) {
      case 'correct':
        this.playTone(523.25, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 0.15), 50); // E5
        setTimeout(() => this.playTone(783.99, 0.2), 100); // G5
        break;

      case 'wrong':
        this.playTone(220, 0.15, 'sawtooth', 0.25);
        setTimeout(() => this.playTone(165, 0.2, 'sawtooth', 0.3), 100);
        break;

      case 'attack':
        this.playNoise(0.12, 0.25, 2000);
        setTimeout(() => this.playTone(150, 0.2, 'square', 0.2), 30);
        break;

      case 'heal':
        this.playTone(440, 0.1);
        setTimeout(() => this.playTone(554.37, 0.15), 60);
        setTimeout(() => this.playTone(659.25, 0.2), 120);
        break;

      case 'shield':
        this.playTone(880, 0.08, 'triangle');
        setTimeout(() => this.playTone(1108.73, 0.12, 'triangle'), 40);
        this.playNoise(0.15, 0.15, 3000);
        break;

      case 'tick':
        this.playTone(800, 0.04, 'square', 0.12);
        break;

      case 'gameOver':
        this.playTone(349.23, 0.3); // F4
        setTimeout(() => this.playTone(293.66, 0.4), 200); // D4
        setTimeout(() => this.playTone(261.63, 0.5), 450); // C4
        break;

      case 'combo':
        this.playTone(523.25, 0.08);
        setTimeout(() => this.playTone(659.25, 0.08), 70);
        setTimeout(() => this.playTone(783.99, 0.08), 140);
        setTimeout(() => this.playTone(1046.5, 0.12), 210);
        break;

      case 'speedBonus':
        this.playTone(1046.5, 0.1, 'square', 0.2);
        setTimeout(() => this.playTone(1318.5, 0.15, 'square', 0.25), 60);
        break;

      case 'button':
        this.playTone(600, 0.05, 'sine', 0.15);
        break;

      default:
        break;
    }
  }

  public setVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public stopAll(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}

export const soundManager = new SoundManager();

export default soundManager;
