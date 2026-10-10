/**
 * Spiritual Ambient Audio & Talbiyah Synthesizer using Web Audio API
 * Operates entirely offline with zero external asset dependencies.
 */

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private masterGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private talbiyahInterval: number | null = null;
  private isTalbiyahActive: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Start peaceful sacred drone ambience (representing the spiritual aura of Masjid al-Haram)
   */
  public startAmbient() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.ambientGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.ambientGain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + 3.0);
    this.ambientGain.connect(this.masterGain);

    // Subtle warm harmonic frequencies (D minor / Bayati spiritual mode)
    const frequencies = [146.83, 220.00, 293.66, 440.00]; // D3, A3, D4, A4

    frequencies.forEach((freq, i) => {
      if (!this.ctx || !this.ambientGain) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Gentle LFO detune
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.04, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      oscGain.gain.setValueAtTime(0.08 / (i + 1), this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(this.ambientGain);
      osc.start();

      this.ambientOscillators.push(osc);
    });
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
      setTimeout(() => {
        this.ambientOscillators.forEach(osc => {
          try { osc.stop(); } catch {}
        });
        this.ambientOscillators = [];
        this.ambientGain?.disconnect();
        this.ambientGain = null;
      }, 1050);
    }
  }

  /**
   * Play the melodious Talbiyah chant melody
   * (Labbayk Allahumma Labbayk, Labbayk la sharika laka labbayk...)
   */
  public startTalbiyah() {
    this.initContext();
    this.isTalbiyahActive = true;
    this.playTalbiyahPhrase();

    // Repeat every 14 seconds
    this.talbiyahInterval = window.setInterval(() => {
      if (this.isTalbiyahActive) {
        this.playTalbiyahPhrase();
      }
    }, 14000);
  }

  public stopTalbiyah() {
    this.isTalbiyahActive = false;
    if (this.talbiyahInterval) {
      clearInterval(this.talbiyahInterval);
      this.talbiyahInterval = null;
    }
  }

  private playTalbiyahPhrase() {
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    // Traditional Maqam Bayati vocal cadence notes
    // "Lab-bay-ka Al-la-hum-ma Lab-bayk"
    const notes = [
      { f: 293.66, d: 0.5 }, // D4 - Lab
      { f: 329.63, d: 0.6 }, // E4 - bay
      { f: 349.23, d: 0.8 }, // F4 - ka
      { f: 392.00, d: 0.5 }, // G4 - Al-
      { f: 349.23, d: 0.5 }, // F4 - la-
      { f: 329.63, d: 0.6 }, // E4 - hum-
      { f: 293.66, d: 1.2 }, // D4 - ma
      { f: 261.63, d: 0.6 }, // C4 - Lab-
      { f: 293.66, d: 1.5 }  // D4 - bayk
    ];

    let startTime = this.ctx.currentTime + 0.1;

    notes.forEach((note) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, startTime);

      // Vocal formant filter simulation
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(note.f * 1.5, startTime);
      filter.Q.setValueAtTime(2.5, startTime);

      // Soft envelope
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + note.d);

      startTime += note.d * 0.95;
    });
  }

  /**
   * Sound effect when performing Istilam at Hajar al-Aswad (Sacred Chime)
   */
  public playIstilamChime() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chimeFrequencies = [587.33, 880.00, 1174.66]; // D5, A5, D6
    chimeFrequencies.forEach((f, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.05);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime + idx * 0.05);
      osc.stop(this.ctx.currentTime + idx * 0.05 + 1.9);
    });
  }

  /**
   * Sound effect when completing 7 rounds of Tawaf
   */
  public playTawafCompleteSound() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chords = [
      [293.66, 369.99, 440.00], // D major
      [329.63, 415.30, 493.88], // E major
      [369.99, 440.00, 554.37], // F# minor
      [587.33, 739.99, 880.00]  // D high
    ];

    chords.forEach((chord, i) => {
      const time = (this.ctx?.currentTime || 0) + i * 0.45;
      chord.forEach(freq => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 1.2);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 1.25);
      });
    });
  }
}

export const soundManager = new SoundController();
