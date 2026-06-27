// ═══════════════════════════════════════════════════════════
// CAMERA — Cinegrafista virtual com inércia e easing premium
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

const VIEWS = {
  front:      { pos: new THREE.Vector3(0,    0.10,  3.9),  target: new THREE.Vector3(0, 0.05, 0) },
  left:       { pos: new THREE.Vector3(-3.6, 0.10,  1.3),  target: new THREE.Vector3(0, 0.05, 0) },
  right:      { pos: new THREE.Vector3( 3.6, 0.10,  1.3),  target: new THREE.Vector3(0, 0.05, 0) },
  back:       { pos: new THREE.Vector3(0,    0.10, -3.9),  target: new THREE.Vector3(0, 0.05, 0) },
  top:        { pos: new THREE.Vector3(0,    4.4,   0.6),  target: new THREE.Vector3(0, 0.05, 0) },
  'side-right': { pos: new THREE.Vector3(3.2, 0.2,   1.9),  target: new THREE.Vector3(0, 0.05, 0) },
};

// Easing cinematográfico — aceleração e desaceleração suave
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export class CameraController {
  constructor(camera) {
    this.camera   = camera;
    this.headGroup = null;

    // Estado de rotação livre
    this.rotY = 0;  this.rotX = 0.08;
    this.tRotY = 0; this.tRotX = 0.08;
    this.velY = 0;  this.velX = 0;  // inércia
    this.isDragging = false;
    this.prevX = 0; this.prevY = 0;
    this.freeMode = true;

    // Estado de fly
    this.flyActive = false;
    this.flyStart  = null;
    this.flyDuration = 800; // ms
    this.flyFromPos    = new THREE.Vector3();
    this.flyToPos      = new THREE.Vector3();
    this.flyFromTarget = new THREE.Vector3();
    this.flyToTarget   = new THREE.Vector3();
    this.curTarget = new THREE.Vector3(0, 0.05, 0);

    // Posição inicial
    this.camera.position.copy(VIEWS.front.pos);
    this.camera.lookAt(VIEWS.front.target);
  }

  flyTo(viewId) {
    const v = VIEWS[viewId] || VIEWS.front;
    this.flyFromPos.copy(this.camera.position);
    this.flyFromTarget.copy(this.curTarget);
    this.flyToPos.copy(v.pos);
    this.flyToTarget.copy(v.target);
    this.flyStart  = performance.now();
    this.flyActive = true;
    this.freeMode  = false;
  }

  onPointerDown(x, y) {
    this.isDragging = true;
    this.prevX = x; this.prevY = y;
    this.velY  = 0; this.velX  = 0;
    this.freeMode = true;
    this.flyActive = false;
  }

  onPointerMove(x, y) {
    if (!this.isDragging) return;
    const dx = x - this.prevX;
    const dy = y - this.prevY;
    this.velY  = dx * 0.012;
    this.velX  = dy * 0.006;
    this.tRotY += this.velY;
    this.tRotX  = Math.max(-1.1, Math.min(1.1, this.tRotX + this.velX));
    this.prevX = x; this.prevY = y;
  }

  onPointerUp() {
    this.isDragging = false;
    // Inércia — continua girando ao soltar
  }

  update(headGroup) {
    this.headGroup = headGroup;

    if (this.flyActive) {
      const now     = performance.now();
      const elapsed = now - this.flyStart;
      const t       = Math.min(elapsed / this.flyDuration, 1);
      const e       = easeInOutCubic(t);

      this.camera.position.lerpVectors(this.flyFromPos, this.flyToPos, e);
      this.curTarget.lerpVectors(this.flyFromTarget, this.flyToTarget, e);
      this.camera.lookAt(this.curTarget);

      if (t >= 1) { this.flyActive = false; }
      return;
    }

    if (this.freeMode && headGroup) {
      // Inércia ao soltar
      if (!this.isDragging) {
        this.velY *= 0.88;
        this.velX *= 0.88;
        this.tRotY += this.velY;
        this.tRotX  = Math.max(-1.1, Math.min(1.1, this.tRotX + this.velX));
      }

      // Lerp suave
      headGroup.rotation.y += (this.tRotY - headGroup.rotation.y) * 0.10;
      headGroup.rotation.x += (this.tRotX - headGroup.rotation.x) * 0.10;

      // Leve movimento de "respiração" da câmera
      const t = performance.now() * 0.0006;
      this.camera.position.y = 0.10 + Math.sin(t) * 0.004;
      this.camera.lookAt(this.curTarget);
    }
  }
}
