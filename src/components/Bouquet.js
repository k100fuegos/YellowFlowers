import * as THREE from 'three';
import { FlowerGenerator } from './FlowerGenerator.js';
import gsap from 'gsap';

export class Bouquet {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'full_bouquet';
    this.flowers = [];

    this.initBouquet();
  }

  initBouquet() {
    // 1. Agregar el envoltorio cónico y lazo dorado
    const wrapping = FlowerGenerator.createBouquetWrapping();
    this.group.add(wrapping);

    // 2. Definición de la disposición del Ramo
    // (X, Y, Z, RotX, RotY, RotZ, Scale, Tipo)
    const flowerConfigs = [
      // Centro principal (Girasol Grande)
      { type: 'sunflower', pos: [0, 0.9, 0.4], rot: [-0.1, 0, 0], scale: 1.15 },

      // Girasoles secundarios
      { type: 'sunflower', pos: [-0.85, 0.6, 0.1], rot: [0.1, -0.35, 0.2], scale: 0.95 },
      { type: 'sunflower', pos: [0.85, 0.65, 0.1], rot: [0.1, 0.35, -0.2], scale: 0.95 },

      // Rosas Amarillas
      { type: 'rose', pos: [-0.45, 1.25, 0.35], rot: [-0.15, -0.2, 0.1], scale: 1.0 },
      { type: 'rose', pos: [0.45, 1.25, 0.35], rot: [-0.15, 0.2, -0.1], scale: 1.0 },
      { type: 'rose', pos: [0, 1.45, -0.15], rot: [-0.25, 0, 0], scale: 1.05 },
      { type: 'rose', pos: [-0.9, 0.15, 0.55], rot: [0.25, -0.4, 0.2], scale: 0.9 },
      { type: 'rose', pos: [0.9, 0.15, 0.55], rot: [0.25, 0.4, -0.2], scale: 0.9 },

      // Tulipanes Amarillos
      { type: 'tulip', pos: [-0.45, 0.25, 0.7], rot: [0.3, -0.25, 0.15], scale: 1.0 },
      { type: 'tulip', pos: [0.45, 0.25, 0.7], rot: [0.3, 0.25, -0.15], scale: 1.0 },
      { type: 'tulip', pos: [-1.1, 0.95, -0.2], rot: [0, -0.6, 0.3], scale: 0.95 },
      { type: 'tulip', pos: [1.1, 0.95, -0.2], rot: [0, 0.6, -0.3], scale: 0.95 }
    ];

    flowerConfigs.forEach((config, idx) => {
      let flowerMesh;
      if (config.type === 'sunflower') {
        flowerMesh = FlowerGenerator.createSunflower();
      } else if (config.type === 'rose') {
        flowerMesh = FlowerGenerator.createYellowRose();
      } else {
        flowerMesh = FlowerGenerator.createYellowTulip();
      }

      flowerMesh.position.set(...config.pos);
      flowerMesh.rotation.set(...config.rot);
      flowerMesh.scale.set(config.scale, config.scale, config.scale);

      // Guardar información para animaciones individuales
      flowerMesh.userData.originalPos = flowerMesh.position.clone();
      flowerMesh.userData.originalRot = flowerMesh.rotation.clone();
      flowerMesh.userData.index = idx;

      this.flowers.push(flowerMesh);
      this.group.add(flowerMesh);
    });

    // Inclinación y posición inicial estética del ramo completo
    const isMobile = window.innerWidth < 600;
    this.group.position.set(0, isMobile ? -0.9 : -0.6, 0);

    if (isMobile) {
      this.group.scale.set(0.82, 0.82, 0.82);
    }
  }

  /**
   * Actualizar física de viento sutil en vivo
   */
  update(time) {
    this.flowers.forEach((flower, i) => {
      const windOffset = Math.sin(time * 1.5 + i * 0.8) * 0.03;
      const rotOffset = Math.cos(time * 1.2 + i * 0.5) * 0.02;

      flower.position.y = flower.userData.originalPos.y + windOffset;
      flower.rotation.z = flower.userData.originalRot.z + rotOffset;
    });

    // Bamboleo suave del ramo completo
    this.group.rotation.z = Math.sin(time * 0.8) * 0.015;
    this.group.rotation.x = Math.cos(time * 0.6) * 0.01;
  }

  /**
   * Animación de rebote / latido al tocar una flor individual
   */
  bounceFlower(flowerGroup) {
    if (!flowerGroup) return;

    gsap.killTweensOf(flowerGroup.scale);
    gsap.killTweensOf(flowerGroup.position);

    const baseScale = flowerGroup.userData.scale || 1.0;

    gsap.timeline()
      .to(flowerGroup.scale, {
        x: baseScale * 1.3,
        y: baseScale * 1.3,
        z: baseScale * 1.3,
        duration: 0.18,
        ease: "back.out(2)"
      })
      .to(flowerGroup.scale, {
        x: baseScale,
        y: baseScale,
        z: baseScale,
        duration: 0.4,
        ease: "bounce.out"
      });

    gsap.to(flowerGroup.position, {
      y: flowerGroup.userData.originalPos.y + 0.35,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
  }

  /**
   * Ráfaga de brisa sobre todo el ramo (evento de 10s)
   */
  triggerBreezeAnimation() {
    gsap.to(this.group.rotation, {
      z: 0.12,
      x: -0.08,
      duration: 0.6,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut"
    });

    this.flowers.forEach((flower, i) => {
      gsap.to(flower.rotation, {
        z: flower.userData.originalRot.z + 0.15,
        duration: 0.5 + i * 0.05,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut"
      });
    });
  }
}
