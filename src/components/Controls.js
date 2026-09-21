import * as THREE from 'three';

export class GestureControls {
  constructor(camera, domElement, bouquetGroup, onFlowerTap, onBackgroundTap) {
    this.camera = camera;
    this.domElement = domElement;
    this.targetGroup = bouquetGroup;
    this.onFlowerTap = onFlowerTap;
    this.onBackgroundTap = onBackgroundTap;

    // Estado de interacción
    this.isDragging = false;
    this.previousMousePos = { x: 0, y: 0 };
    this.targetRotation = { x: 0, y: 0 };
    this.currentRotation = { x: 0, y: 0 };

    // Pinch-to-zoom táctil adaptativo
    this.touchStartDist = 0;
    this.targetZoom = camera.position.z;

    // Raycaster para detección de toques
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();
    this.touchStartTime = 0;
    this.touchStartPos = { x: 0, y: 0 };

    this.hasHiddenHint = false;

    this.initEvents();
  }

  hideHint() {
    if (this.hasHiddenHint) return;
    this.hasHiddenHint = true;
    const hint = document.getElementById('interaction-hint');
    if (hint) {
      hint.classList.add('hidden');
    }
  }

  initEvents() {
    // --- EVENTOS DE RATÓN (PC) ---
    this.domElement.addEventListener('mousedown', (e) => {
      this.hideHint();
      this.onPointerDown(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', (e) => this.onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', (e) => this.onPointerUp(e.clientX, e.clientY));
    this.domElement.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // --- EVENTOS TÁCTILES (MÓVIL) ---
    this.domElement.addEventListener('touchstart', (e) => {
      this.hideHint();
      if (e.touches.length === 1) {
        this.onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        this.touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    }, { passive: true });

    this.domElement.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        this.onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = (this.touchStartDist - dist) * 0.015;
        this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + delta, 4.0, 16.0);
        this.touchStartDist = dist;
      }
    }, { passive: true });

    this.domElement.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        const touch = e.changedTouches[0];
        this.onPointerUp(touch ? touch.clientX : 0, touch ? touch.clientY : 0);
      }
    });

    // --- GIROSCÓPIO MÓVIL (OPCIONAL) ---
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (e.gamma !== null && e.beta !== null) {
          const tiltX = (e.gamma / 45) * 0.15;
          const tiltY = ((e.beta - 45) / 45) * 0.15;
          this.targetRotation.y += tiltX * 0.05;
          this.targetRotation.x += tiltY * 0.05;
        }
      });
    }
  }

  onPointerDown(x, y) {
    this.isDragging = true;
    this.previousMousePos = { x, y };
    this.touchStartPos = { x, y };
    this.touchStartTime = performance.now();
  }

  onPointerMove(x, y) {
    if (!this.isDragging) return;

    const deltaX = x - this.previousMousePos.x;
    const deltaY = y - this.previousMousePos.y;

    this.targetRotation.y += deltaX * 0.008;
    this.targetRotation.x += deltaY * 0.008;

    // Limitar inclinación vertical (pitch)
    this.targetRotation.x = THREE.MathUtils.clamp(this.targetRotation.x, -0.4, 0.5);

    this.previousMousePos = { x, y };
  }

  onPointerUp(x, y) {
    const timeDiff = performance.now() - this.touchStartTime;
    const distDiff = Math.hypot(x - this.touchStartPos.x, y - this.touchStartPos.y);

    this.isDragging = false;

    // Detectar si fue un Tap / Click rápido en lugar de arrastre
    if (timeDiff < 300 && distDiff < 10) {
      this.handleTap(this.touchStartPos.x, this.touchStartPos.y);
    }
  }

  onWheel(e) {
    e.preventDefault();
    this.hideHint();
    this.targetZoom = THREE.MathUtils.clamp(this.targetZoom + e.deltaY * 0.005, 4.0, 16.0);
  }

  /**
   * Raycasting para tocar flores o el fondo
   */
  handleTap(screenX, screenY) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouseVec.x = ((screenX - rect.left) / rect.width) * 2 - 1;
    this.mouseVec.y = -((screenY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseVec, this.camera);
    const intersects = this.raycaster.intersectObjects(this.targetGroup.children, true);

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj.parent && !obj.userData.interactive && obj.parent !== this.targetGroup) {
        obj = obj.parent;
      }

      if (obj && obj.userData.interactive) {
        if (this.onFlowerTap) {
          this.onFlowerTap(obj, intersects[0].point);
        }
        return;
      }
    }

    // Si no se tocó ninguna flor, es un toque al fondo
    if (this.onBackgroundTap) {
      this.onBackgroundTap(screenX, screenY);
    }
  }

  update() {
    // Inercia y suavizado de rotación (Damping)
    this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
    this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

    this.targetGroup.rotation.x = this.currentRotation.x;
    this.targetGroup.rotation.y = this.currentRotation.y;

    // Suavizado de Zoom
    this.camera.position.z += (this.targetZoom - this.camera.position.z) * 0.08;
  }
}
