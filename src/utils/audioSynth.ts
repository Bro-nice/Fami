/**
 * Web Audio procedural sound synthesizer for creature responses,
 * UI interactions, and ambient musical atmosphere.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play an interactive soft UI chime or bubble pop
  public playClick(pitch: number = 440) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Play creature fantasy chirp / acknowledgement vocalization
  public playCreatureChirp(mood: string = 'playful_chirps') {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (mood === 'gentle_lullaby') {
        // Soft warm music-box chimes
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.2);

          gain.gain.setValueAtTime(0, now + idx * 0.2);
          gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.2 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.2);
          osc.stop(now + idx * 0.2 + 0.85);
        });
        return;
      }

      if (mood === 'cheerful_bounce' || mood === 'melodic_groove') {
        // Rhythmic upbeat chirps and playful bass bounce
        const freqs = [330, 440, 554, 659];
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + idx * 0.1 + 0.08);

          gain.gain.setValueAtTime(0.1, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.18);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.2);
        });
        return;
      }

      if (mood === 'curious_warble') {
        // Inquisitive two-tone slide (like a creature asking a question)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.22);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.3);
        return;
      }

      // Default playful friendly chirp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.linearRampToValueAtTime(740, now + 0.06);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  // Soft tap when interacting directly on screen
  public playScreenTap() {
    this.playClick(620);
  }
}

export const sound = new SoundEngine();
