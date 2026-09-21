import * as THREE from 'three';
import gsap from 'gsap';
import { soundEngine } from '../audio/SoundEngine.js';

export class AutoEvents {
  constructor(scene, bouquet, particleSystem, intervalMs = 10000) {
    this.scene = scene;
    this.bouquet = bouquet;
    this.particleSystem = particleSystem;
    this.intervalMs = intervalMs;
    this.timer = null;
    this.activeButterflies = [];

    this.startAutoEvents();
  }

  startAutoEvents() {
    this.timer = setInterval(() => {
      this.triggerRandomEvent();
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Ejecutar uno de los 3 eventos aleatorios
   */
  triggerRandomEvent() {
    const eventType = Math.floor(Math.random() * 3);

    switch (eventType) {
      case 0:
        this.spawnMagicalButterflies();
        break;
      case 1:
        this.triggerGoldenBreeze();
        break;
      case 2:
        this.triggerGlowPulse();
        break;
    }
  }

  /**
   * 🦋 Evento 1: Mariposas Mágicas revoloteando
   */
  spawnMagicalButterflies() {
    soundEngine.playWindBreezeSFX();

    const butterflyCount = 3;
    for (let i = 0; i < butterflyCount; i++) {
      const butterfly = this.createButterflyMesh();
      const radius = 2.5 + Math.random() * 0.8;
      const startAngle = Math.random() * Math.PI * 2;

      butterfly.position.set(
        Math.cos(startAngle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(startAngle) * radius
      );

      this.scene.add(butterfly);
      this.activeButterflies.push(butterfly);

      // Animar vuelo en espiral alrededor del ramo
      const animObj = { progress: 0 };
      gsap.to(animObj, {
        progress: Math.PI * 2,
        duration: 4.5 + i * 0.5,
        ease: "none",
        onUpdate: () => {
          const angle = startAngle + animObj.progress;
          butterfly.position.x = Math.cos(angle) * (radius - animObj.progress * 0.2);
          butterfly.position.z = Math.sin(angle) * (radius - animObj.progress * 0.2);
          butterfly.position.y += Math.sin(animObj.progress * 3) * 0.02;

          // Aleteo de alas
          butterfly.userData.wingLeft.rotation.y = Math.sin(performance.now() * 0.02) * 0.7;
          butterfly.userData.wingRight.rotation.y = -Math.sin(performance.now() * 0.02) * 0.7;
        },
        onComplete: () => {
          this.scene.remove(butterfly);
          butterfly.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
          });
        }
      });
    }
  }

  /**
   * 🌬️ Evento 2: Brisa Dorada sobre el ramo
   */
  triggerGoldenBreeze() {
    soundEngine.playWindBreezeSFX();
    this.bouquet.triggerBreezeAnimation();
    this.particleSystem.triggerMagicSparkles();
  }

  /**
   * 🌟 Evento 3: Destello de Luz y Pulso de Brillo
   */
  triggerGlowPulse() {
    soundEngine.playSparkleSFX();
    this.particleSystem.triggerMagicSparkles();
  }

  /**
   * Crear Mesh de Mariposa Mágica 3D
   */
  createButterflyMesh() {
    const group = new THREE.Group();

    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.quadraticCurveTo(0.3, 0.4, 0.5, 0.2);
    wingShape.quadraticCurveTo(0.4, -0.2, 0, 0);

    const wingGeo = new THREE.ShapeGeometry(wingShape);
    const wingMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });

    const wingLeft = new THREE.Mesh(wingGeo, wingMat);
    const wingRight = new THREE.Mesh(wingGeo, wingMat);
    wingRight.scale.x = -1;

    group.add(wingLeft);
    group.add(wingRight);

    group.userData = { wingLeft, wingRight };
    group.scale.set(0.6, 0.6, 0.6);
    return group;
  }
}
