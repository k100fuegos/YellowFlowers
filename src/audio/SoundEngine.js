/**
 * 🎵 SoundEngine - Sintetizador de efectos de sonido y música ambiental con Web Audio API
 * Funciona nativamente en iOS, Android y PC sin depender de archivos de audio externos.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMutedSFX = false;
    this.isMutedMusic = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.currentChordIndex = 0;

    // Chords para la melodía ambiental romántica (frecuencias en Hz)
    this.ambientChords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9 (C4, E4, G4, B4, D5)
      [196.00, 246.94, 293.66, 392.00, 440.00], // Gmaj7 (G3, B3, D4, G4, A4)
      [220.00, 261.63, 329.63, 392.00, 523.25], // Am9   (A3, C4, E4, G4, C5)
      [174.61, 220.00, 261.63, 329.63, 440.00]  // Fmaj7 (F3, A3, C4, E4, A4)
    ];
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Encender / Apagar Efectos de Sonido
   */
  toggleSFX() {
    this.isMutedSFX = !this.isMutedSFX;
    return !this.isMutedSFX;
  }

  /**
   * Encender / Apagar Música de Fondo
   */
  toggleMusic() {
    this.init();
    this.isMutedMusic = !this.isMutedMusic;

    if (!this.isMutedMusic) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return !this.isMutedMusic;
  }

  /**
   * Reproductores de Música Sintetizada Ambiental
   */
  startMusic() {
    if (this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;
    this.playNextAmbientPad();

    // Cambia de acorde ambiental cada 4.5 segundos
    this.musicTimer = setInterval(() => {
      if (this.isMusicPlaying && !this.isMutedMusic) {
        this.playNextAmbientPad();
      }
    }, 4500);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  playNextAmbientPad() {
    if (!this.ctx || this.isMutedMusic) return;

    const chord = this.ambientChords[this.currentChordIndex];
    this.currentChordIndex = (this.currentChordIndex + 1) % this.ambientChords.length;

    const now = this.ctx.currentTime;
    const duration = 4.8;

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq * (1 + (Math.random() * 0.002 - 0.001)), now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + idx * 200, now);

      // Envolvente suave estilo Pad
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.025, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    });
  }

  /**
   * ✨ SFX 1: Lluvia Mágica (Chime / Arpegio Mágico)
   */
  playSparkleSFX() {
    if (this.isMutedSFX) return;
    this.init();

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // C5 to C7
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.04);

      gain.gain.setValueAtTime(0, now + i * 0.04);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.04 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.4);
    });
  }

  /**
   * 🌸 SFX 2: Toque en Flor (Marimba / Kalimba warm pop)
   */
  playFlowerTapSFX() {
    if (this.isMutedSFX) return;
    this.init();

    const baseNotes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    const freq = baseNotes[Math.floor(Math.random() * baseNotes.length)];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * 💧 SFX 3: Onda en Fondo (Shimmer / Glass Ripple)
   */
  playBackgroundTouchSFX() {
    if (this.isMutedSFX) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.25);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * 🔔 SFX 4: Abrir Carta Dedicatoria
   */
  playCardOpenSFX() {
    if (this.isMutedSFX) return;
    this.init();

    const now = this.ctx.currentTime;
    const freqs = [587.33, 880, 1174.66]; // D5, A5, D6

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.1, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.8);
    });
  }

  /**
   * 🌬️ SFX 5: Brisa de Viento y Evento Automático
   */
  playWindBreezeSFX() {
    if (this.isMutedSFX) return;
    this.init();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(450, now + 0.6);
    osc.frequency.linearRampToValueAtTime(250, now + 1.2);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.3);
  }
}

export const soundEngine = new SoundEngine();
