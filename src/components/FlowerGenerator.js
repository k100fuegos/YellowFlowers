import * as THREE from 'three';

/**
 * Generador procedural de texturas para pétalos, hojas y centro del girasol
 */
class TextureFactory {
  static createSunflowerCenterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fondo marrón oscuro cálido
    ctx.fillStyle = '#3d2314';
    ctx.fillRect(0, 0, 512, 512);

    // Patrón de espiral de Fibonacci para semillas
    const cx = 256;
    const cy = 256;
    const goldenAngle = 137.5 * (Math.PI / 180);

    for (let i = 0; i < 600; i++) {
      const r = Math.sqrt(i) * 9.5;
      const theta = i * goldenAngle;
      const x = cx + r * Math.cos(theta);
      const y = cy + r * Math.sin(theta);

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = i < 150 ? '#26150b' : i < 400 ? '#5a381e' : '#eab308';
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  static createPetalGradientTexture(baseHex = '#fbbf24', tipHex = '#fef08a', darkHex = '#d97706') {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 512, 0, 0);
    grad.addColorStop(0, darkHex);
    grad.addColorStop(0.3, baseHex);
    grad.addColorStop(1, tipHex);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 512);

    // Vetita sutil
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 20; i < 110; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 512);
      ctx.quadraticCurveTo(i + (Math.random() * 10 - 5), 256, i, 0);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  static createLeafTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Verde hoja profundo
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    grad.addColorStop(0, '#15803d');
    grad.addColorStop(0.5, '#22c55e');
    grad.addColorStop(1, '#166534');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 512);

    // Nervaduras
    ctx.strokeStyle = '#86efac';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(128, 512);
    ctx.lineTo(128, 0);
    ctx.stroke();

    ctx.lineWidth = 2;
    for (let y = 100; y < 450; y += 60) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.lineTo(30, y - 50);
      ctx.moveTo(128, y);
      ctx.lineTo(226, y - 50);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }
}

// Inicialización de texturas compartidas
const sunflowerCenterTex = TextureFactory.createSunflowerCenterTexture();
const sunflowerPetalTex = TextureFactory.createPetalGradientTexture('#f59e0b', '#fef08a', '#b45309');
const rosePetalTex = TextureFactory.createPetalGradientTexture('#eab308', '#fef9c3', '#ca8a04');
const tulipPetalTex = TextureFactory.createPetalGradientTexture('#fbbf24', '#ffffff', '#d97706');
const leafTex = TextureFactory.createLeafTexture();

/**
 * Generador de Flores 3D
 */
export class FlowerGenerator {
  /**
   * 🌻 Crear Girasol 3D
   */
  static createSunflower() {
    const group = new THREE.Group();
    group.name = 'sunflower';

    // 1. Centro del Girasol
    const centerGeo = new THREE.CylinderGeometry(0.7, 0.6, 0.2, 32);
    const centerMat = new THREE.MeshStandardMaterial({
      map: sunflowerCenterTex,
      roughness: 0.8,
      metalness: 0.1
    });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerMesh.rotation.x = Math.PI / 2;
    centerMesh.castShadow = true;
    centerMesh.receiveShadow = true;
    group.add(centerMesh);

    // 2. Pétalos (2 capas circulares)
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.2, 0.6, 0.25, 1.4);
    petalShape.quadraticCurveTo(0, 1.9, 0, 2.1);
    petalShape.quadraticCurveTo(-0.2, 1.9, -0.25, 1.4);
    petalShape.quadraticCurveTo(-0.2, 0.6, 0, 0);

    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const petalGeo = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
    petalGeo.center();

    const petalMat = new THREE.MeshStandardMaterial({
      map: sunflowerPetalTex,
      roughness: 0.3,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Capa Interna y Externa
    const petalCount = 20;
    for (let layer = 0; layer < 2; layer++) {
      const radius = layer === 0 ? 0.65 : 0.75;
      const count = petalCount + layer * 4;
      const scale = layer === 0 ? 0.9 : 1.05;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (layer * Math.PI) / count;
        const petalMesh = new THREE.Mesh(petalGeo, petalMat);

        petalMesh.position.x = Math.cos(angle) * radius;
        petalMesh.position.y = Math.sin(angle) * radius;
        petalMesh.position.z = layer * -0.05;

        petalMesh.rotation.z = angle - Math.PI / 2;
        petalMesh.rotation.x = 0.15 + (Math.random() * 0.1 - 0.05);
        petalMesh.scale.set(scale, scale * (1 + Math.random() * 0.1), scale);

        petalMesh.castShadow = true;
        group.add(petalMesh);
      }
    }

    // 3. Tallo
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, -0.1),
      new THREE.Vector3(0, -1.5, -0.4),
      new THREE.Vector3(0, -3.5, -0.8)
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.12, 12, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.castShadow = true;
    group.add(stemMesh);

    // 4. Hojas del tallo
    const leaf = this.createLeaf();
    leaf.position.set(0.2, -1.8, -0.4);
    leaf.rotation.set(0.3, 0.5, -0.4);
    group.add(leaf);

    const leaf2 = this.createLeaf();
    leaf2.position.set(-0.25, -2.6, -0.6);
    leaf2.rotation.set(-0.2, -0.6, 0.5);
    group.add(leaf2);

    group.userData = { type: 'sunflower', interactive: true };
    return group;
  }

  /**
   * 🌹 Crear Rosa Amarilla 3D
   */
  static createYellowRose() {
    const group = new THREE.Group();
    group.name = 'rose';

    const roseMat = new THREE.MeshStandardMaterial({
      map: rosePetalTex,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // Pétalos en espiral (de adentro hacia afuera)
    const layers = [
      { count: 4, radius: 0.15, size: 0.4, angleOffset: 0 },
      { count: 5, radius: 0.28, size: 0.6, angleOffset: 0.3 },
      { count: 6, radius: 0.45, size: 0.8, angleOffset: 0.6 },
      { count: 8, radius: 0.62, size: 0.95, angleOffset: 0.2 }
    ];

    layers.forEach((layer, lIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + layer.angleOffset;
        const petalGeo = new THREE.SphereGeometry(
          layer.size * 0.5,
          16,
          16,
          0,
          Math.PI * 1.2,
          0,
          Math.PI * 0.7
        );
        const petal = new THREE.Mesh(petalGeo, roseMat);

        petal.position.x = Math.cos(angle) * layer.radius;
        petal.position.z = Math.sin(angle) * layer.radius;
        petal.position.y = (3 - lIdx) * 0.08;

        petal.rotation.y = -angle + Math.PI / 2;
        petal.rotation.x = 0.3 + lIdx * 0.15;
        petal.rotation.z = (Math.random() - 0.5) * 0.1;

        petal.castShadow = true;
        group.add(petal);
      }
    });

    // Tallo de la rosa
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -1.8, -0.2),
      new THREE.Vector3(0, -3.4, -0.5)
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.09, 10, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.5 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    group.add(stemMesh);

    // Hojas
    const leaf = this.createLeaf(0.6);
    leaf.position.set(0.2, -1.5, -0.1);
    leaf.rotation.set(0.4, 0.8, -0.2);
    group.add(leaf);

    group.userData = { type: 'rose', interactive: true };
    return group;
  }

  /**
   * 🌷 Crear Tulipán Amarillo 3D
   */
  static createYellowTulip() {
    const group = new THREE.Group();
    group.name = 'tulip';

    const tulipMat = new THREE.MeshStandardMaterial({
      map: tulipPetalTex,
      roughness: 0.25,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    // 6 Pétalos acopados estilo tulipán
    const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const isInner = i % 2 === 0;
      const radius = isInner ? 0.25 : 0.32;

      const petalGeo = new THREE.SphereGeometry(
        0.55,
        16,
        16,
        0,
        Math.PI * 0.9,
        0,
        Math.PI * 0.8
      );
      const petal = new THREE.Mesh(petalGeo, tulipMat);

      petal.position.x = Math.cos(angle) * radius;
      petal.position.z = Math.sin(angle) * radius;
      petal.position.y = 0.4;

      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = isInner ? 0.15 : 0.28;

      petal.castShadow = true;
      group.add(petal);
    }

    // Tallo de tulipán elegante
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -1.6, 0.1),
      new THREE.Vector3(0, -3.2, 0.3)
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.08, 10, false);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    group.add(stemMesh);

    // Hoja larga curvada de tulipán
    const leafGeo = new THREE.CylinderGeometry(0.01, 0.18, 2.2, 8, 1, true);
    const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, side: THREE.DoubleSide });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(-0.2, -1.2, 0.1);
    leaf.rotation.set(0.3, -0.4, 0.3);
    group.add(leaf);

    group.userData = { type: 'tulip', interactive: true };
    return group;
  }

  /**
   * 🍃 Generar Hoja Verde
   */
  static createLeaf(scale = 1.0) {
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.3, 0.5, 0.35, 1.0);
    leafShape.quadraticCurveTo(0.2, 1.5, 0, 2.0);
    leafShape.quadraticCurveTo(-0.2, 1.5, -0.35, 1.0);
    leafShape.quadraticCurveTo(-0.3, 0.5, 0, 0);

    const leafGeo = new THREE.ExtrudeGeometry(leafShape, { depth: 0.02, bevelEnabled: true, bevelSize: 0.01 });
    const leafMat = new THREE.MeshStandardMaterial({ map: leafTex, roughness: 0.4, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(leafGeo, leafMat);
    mesh.scale.set(scale, scale, scale);
    mesh.castShadow = true;
    return mesh;
  }

  /**
   * 🎀 Envoltorio Elegante y Lazo Dorado del Ramo
   */
  static createBouquetWrapping() {
    const wrapperGroup = new THREE.Group();

    // Papel de envolver cónico satinado blanco/crema
    const coneGeo = new THREE.ConeGeometry(2.6, 4.2, 32, 1, true);
    const coneMat = new THREE.MeshStandardMaterial({
      color: 0xfefac9,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide
    });
    const wrapperMesh = new THREE.Mesh(coneGeo, coneMat);
    wrapperMesh.position.y = -2.8;
    wrapperMesh.rotation.x = Math.PI;
    wrapperMesh.receiveShadow = true;
    wrapperGroup.add(wrapperMesh);

    // Lazo dorado atado al ramo
    const ribbonGeo = new THREE.TorusGeometry(0.9, 0.12, 16, 32);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.8,
      roughness: 0.2
    });
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.position.y = -2.2;
    ribbonMesh.rotation.x = Math.PI / 2;
    wrapperGroup.add(ribbonMesh);

    // Moño decorativo
    const bowShape = new THREE.TorusGeometry(0.4, 0.08, 12, 24);
    const bowLeft = new THREE.Mesh(bowShape, ribbonMat);
    bowLeft.position.set(-0.4, -2.2, 0.85);
    bowLeft.rotation.set(0.3, 0.6, 0);
    wrapperGroup.add(bowLeft);

    const bowRight = new THREE.Mesh(bowShape, ribbonMat);
    bowRight.position.set(0.4, -2.2, 0.85);
    bowRight.rotation.set(0.3, -0.6, 0);
    wrapperGroup.add(bowRight);

    return wrapperGroup;
  }
}
