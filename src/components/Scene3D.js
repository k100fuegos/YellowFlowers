import * as THREE from 'three';

export class Scene3D {
  constructor(container) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });

    this.initScene();
    this.initLights();
    this.initResize();
  }

  initScene() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.updateCameraDistance();
  }

  updateCameraDistance() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // Ajuste dinámico de distancia de cámara según el aspect ratio de pantalla
    // En celulares (aspect < 0.75), la cámara retrocede para encuadrar todo el ramo sin cortes
    if (aspect < 0.6) {
      this.camera.position.set(0, 0.1, 11.2);
    } else if (aspect < 0.8) {
      this.camera.position.set(0, 0.1, 9.2);
    } else if (aspect < 1.1) {
      this.camera.position.set(0, 0.1, 7.8);
    } else {
      this.camera.position.set(0, 0.1, 6.2);
    }
    this.camera.lookAt(0, -0.2, 0);
  }

  initLights() {
    // 1. Luz Hemisférica (Cielo dorado y tierra cálida)
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0x451a03, 0.95);
    this.scene.add(hemiLight);

    // 2. Luz Principal (Golden Hour Sun)
    const mainLight = new THREE.DirectionalLight(0xfff7ed, 2.5);
    mainLight.position.set(4, 6, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.bias = -0.0005;
    this.scene.add(mainLight);

    // 3. Luz de Relleno Cálida
    const fillLight = new THREE.DirectionalLight(0xfbbf24, 1.2);
    fillLight.position.set(-4, 2, -3);
    this.scene.add(fillLight);

    // 4. Luz Trasera (Rim light) para resaltar contornos de pétalos
    const rimLight = new THREE.PointLight(0xf59e0b, 2.0, 12);
    rimLight.position.set(0, 3, -4);
    this.scene.add(rimLight);
  }

  initResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      this.camera.aspect = width / height;
      this.updateCameraDistance();
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
