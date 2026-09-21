import * as THREE from 'three';
import confetti from 'canvas-confetti';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particleGroup = new THREE.Group();
    this.scene.add(this.particleGroup);

    this.ambientParticles = null;
    this.activeSparks = [];

    this.initAmbientParticles();
  }

  /**
   * Partículas doradas flotantes de fondo (Luciérnagas / Polvo de Hadas)
   */
  initAmbientParticles() {
    const count = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 22;
      positions[i + 1] = (Math.random() - 0.5) * 22;
      positions[i + 2] = (Math.random() - 0.5) * 15 - 2;
      scales[i / 3] = Math.random() * 0.15 + 0.05;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Textura de destello brillante circular
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(251, 191, 36, 0.8)');
    grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.ambientParticles = new THREE.Points(geometry, material);
    this.particleGroup.add(this.ambientParticles);
  }

  /**
   * ✨ Ráfaga Mágica de Brillitos (Confetti + Partículas 3D)
   */
  triggerMagicSparkles() {
    // 1. Confetti de alta calidad en pantalla 2D
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ffffff', '#eab308'],
      shapes: ['star', 'circle'],
      scalar: 1.2
    });

    // 2. Ráfaga 3D adicional alrededor del ramo
    const count = 60;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5;
      positions[i * 3 + 1] = Math.random() * 2 + 0.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;

      velocities.push(
        (Math.random() - 0.5) * 0.08,
        Math.random() * 0.12 + 0.05,
        (Math.random() - 0.5) * 0.08
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.45,
      color: 0xfef08a,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });

    const sparkMesh = new THREE.Points(geometry, material);
    this.particleGroup.add(sparkMesh);
    this.activeSparks.push({ mesh: sparkMesh, velocities, life: 1.0 });
  }

  /**
   * 🌸 Destello de partículas desde una flor específica al tocarla
   */
  triggerFlowerSparks(worldPos) {
    const count = 25;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = worldPos.x;
      positions[i * 3 + 1] = worldPos.y;
      positions[i * 3 + 2] = worldPos.z;

      velocities.push(
        (Math.random() - 0.5) * 0.1,
        Math.random() * 0.1 + 0.04,
        (Math.random() - 0.5) * 0.1
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.35,
      color: 0xfbbf24,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending
    });

    const sparkMesh = new THREE.Points(geometry, material);
    this.particleGroup.add(sparkMesh);
    this.activeSparks.push({ mesh: sparkMesh, velocities, life: 1.0 });
  }

  /**
   * Actualización por Frame
   */
  update(time) {
    // Rotar y flotar luciérnagas de fondo
    if (this.ambientParticles) {
      this.ambientParticles.rotation.y = time * 0.03;
      const positions = this.ambientParticles.geometry.attributes.position.array;

      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + i) * 0.005;
      }
      this.ambientParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Animar chispas de ráfaga 3D activas
    for (let i = this.activeSparks.length - 1; i >= 0; i--) {
      const spark = this.activeSparks[i];
      spark.life -= 0.025;
      spark.mesh.material.opacity = spark.life;

      const positions = spark.mesh.geometry.attributes.position.array;
      for (let j = 0; j < spark.velocities.length / 3; j++) {
        positions[j * 3] += spark.velocities[j * 3];
        positions[j * 3 + 1] += spark.velocities[j * 3 + 1];
        positions[j * 3 + 2] += spark.velocities[j * 3 + 2];
      }
      spark.mesh.geometry.attributes.position.needsUpdate = true;

      if (spark.life <= 0) {
        this.particleGroup.remove(spark.mesh);
        spark.mesh.geometry.dispose();
        spark.mesh.material.dispose();
        this.activeSparks.splice(i, 1);
      }
    }
  }
}
