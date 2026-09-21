import './style.css';
import { Scene3D } from './components/Scene3D.js';
import { Bouquet } from './components/Bouquet.js';
import { ParticleSystem } from './components/Particles.js';
import { GestureControls } from './components/Controls.js';
import { AutoEvents } from './components/AutoEvents.js';
import { UIManager } from './components/UI.js';
import { soundEngine } from './audio/SoundEngine.js';
import { DEDICATION_CONFIG } from './config.js';

class App {
  constructor() {
    this.canvas3D = document.getElementById('webgl-canvas');
    this.init();
  }

  init() {
    // 1. Iniciar Escena 3D
    this.sceneManager = new Scene3D(this.canvas3D);

    // 2. Crear y agregar el Ramo de Flores Amarillas 3D
    this.bouquet = new Bouquet();
    this.sceneManager.scene.add(this.bouquet.group);

    // 3. Sistema de Partículas y Brillitos
    this.particleSystem = new ParticleSystem(this.sceneManager.scene);

    // 4. Gestores de UI y Ondas en el fondo
    this.uiManager = new UIManager(() => {
      this.particleSystem.triggerMagicSparkles();
    });

    // 5. Gestos táctiles y de ratón (Mobile & PC)
    this.controls = new GestureControls(
      this.sceneManager.camera,
      this.canvas3D,
      this.bouquet.group,
      // Al tocar una flor individual
      (flowerMesh, worldPoint) => {
        soundEngine.playFlowerTapSFX();
        this.bouquet.bounceFlower(flowerMesh);
        this.particleSystem.triggerFlowerSparks(worldPoint);
      },
      // Al tocar el fondo
      (screenX, screenY) => {
        this.uiManager.triggerBackgroundRipple(screenX, screenY);
      }
    );

    // 6. Eventos automáticos cada 10 segundos
    this.autoEvents = new AutoEvents(
      this.sceneManager.scene,
      this.bouquet,
      this.particleSystem,
      DEDICATION_CONFIG.autoEventIntervalMs
    );

    // Unlock Audio Context al primer toque en la pantalla
    const unlockAudio = () => {
      soundEngine.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // 7. Bucle de animación de alto rendimiento
    this.animate();
  }

  animate(time = 0) {
    requestAnimationFrame((t) => this.animate(t));

    const seconds = time * 0.001;

    // Actualizar física del ramo, controles y partículas
    this.bouquet.update(seconds);
    this.controls.update();
    this.particleSystem.update(seconds);

    // Renderizar escena Three.js
    this.sceneManager.render();
  }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
