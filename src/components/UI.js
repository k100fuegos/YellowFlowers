import { DEDICATION_CONFIG } from '../config.js';
import { soundEngine } from '../audio/SoundEngine.js';
import gsap from 'gsap';

export class UIManager {
  constructor(onSparkleClick) {
    this.onSparkleClick = onSparkleClick;
    this.modal = document.getElementById('card-modal');
    this.rippleCanvas = document.getElementById('ripple-canvas');
    this.ctx = this.rippleCanvas ? this.rippleCanvas.getContext('2d') : null;
    this.ripples = [];

    this.initUI();
    this.initRippleCanvas();
  }

  initUI() {
    // 1. Cargar datos del config.js en la carta
    document.getElementById('card-title').textContent = DEDICATION_CONFIG.title;
    document.getElementById('card-subtitle').textContent = DEDICATION_CONFIG.subtitle;
    document.getElementById('card-message').innerText = DEDICATION_CONFIG.message;
    document.getElementById('card-signature').textContent = DEDICATION_CONFIG.signature;
    document.getElementById('card-sender').textContent = DEDICATION_CONFIG.sender;
    document.getElementById('card-date').textContent = DEDICATION_CONFIG.date;

    // 2. Escuchar clicks en botones
    document.getElementById('btn-sparkles').addEventListener('click', () => {
      soundEngine.playSparkleSFX();
      if (this.onSparkleClick) this.onSparkleClick();
    });

    document.getElementById('btn-card').addEventListener('click', () => {
      this.openCardModal();
    });

    document.getElementById('btn-close-card').addEventListener('click', () => {
      this.closeCardModal();
    });

    // Cerrar carta al hacer click fuera del contenedor
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.closeCardModal();
      }
    });

    // Botón Música
    const btnMusic = document.getElementById('btn-music');
    btnMusic.addEventListener('click', () => {
      const isPlaying = soundEngine.toggleMusic();
      btnMusic.classList.toggle('active', isPlaying);
      btnMusic.querySelector('.btn-icon').textContent = isPlaying ? '🎵' : '🔇';
    });

    // Botón SFX
    const btnSfx = document.getElementById('btn-sfx');
    btnSfx.addEventListener('click', () => {
      const isEnabled = soundEngine.toggleSFX();
      btnSfx.classList.toggle('active', isEnabled);
      btnSfx.querySelector('.btn-icon').textContent = isEnabled ? '🔊' : '🔇';
    });
  }

  openCardModal() {
    soundEngine.playCardOpenSFX();
    this.modal.classList.add('visible');

    const cardContent = this.modal.querySelector('.glass-card');
    gsap.fromTo(cardContent,
      { scale: 0.7, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.7)" }
    );
  }

  closeCardModal() {
    const cardContent = this.modal.querySelector('.glass-card');
    gsap.to(cardContent, {
      scale: 0.8,
      opacity: 0,
      y: 30,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        this.modal.classList.remove('visible');
      }
    });
  }

  /**
   * Configurar Canvas 2D para ondas expansivas en el fondo
   */
  initRippleCanvas() {
    if (!this.rippleCanvas) return;
    this.resizeRippleCanvas();
    window.addEventListener('resize', () => this.resizeRippleCanvas());
    this.animateRipples();
  }

  resizeRippleCanvas() {
    this.rippleCanvas.width = window.innerWidth;
    this.rippleCanvas.height = window.innerHeight;
  }

  triggerBackgroundRipple(x, y) {
    soundEngine.playBackgroundTouchSFX();
    this.ripples.push({
      x,
      y,
      radius: 10,
      maxRadius: Math.min(window.innerWidth, window.innerHeight) * 0.35,
      alpha: 1.0
    });
  }

  animateRipples() {
    requestAnimationFrame(() => this.animateRipples());
    if (!this.ctx) return;

    this.ctx.clearRect(0, 0, this.rippleCanvas.width, this.rippleCanvas.height);

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.radius += 6;
      r.alpha -= 0.025;

      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(251, 191, 36, ${r.alpha})`;
      this.ctx.lineWidth = 3;
      this.ctx.stroke();

      // Aura dorada central
      this.ctx.beginPath();
      this.ctx.arc(r.x, r.y, r.radius * 0.4, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(254, 240, 138, ${r.alpha * 0.3})`;
      this.ctx.fill();

      if (r.alpha <= 0) {
        this.ripples.splice(i, 1);
      }
    }
  }
}
