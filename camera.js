// ═══════════════════════════════════════════════════════════
// CAMERA — Câmera inteligente com transições suaves
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

const POSITIONS = {
  'front':      { pos: new THREE.Vector3(0,  0.12, 3.8),  target: new THREE.Vector3(0, 0.05, 0) },
  'left':       { pos: new THREE.Vector3(-3.5, 0.12, 1.2), target: new THREE.Vector3(0, 0.05, 0) },
  'right':      { pos: new THREE.Vector3( 3.5, 0.12, 1.2), target: new THREE.Vector3(0, 0.05, 0) },
  'back':       { pos: new THREE.Vector3(0,  0.12,-3.8),  target: new THREE.Vector3(0, 0.05, 0) },
  'top':        { pos: new THREE.Vector3(0,  4.2,  0.5),  target: new THREE.Vector3(0, 0.05, 0) },
  'side-right': { pos: new THREE.Vector3( 3.2, 0.2, 1.8), target: new THREE.Vector3(0, 0.05, 0) },
};

export class CameraController {
  constructor(camera) {
    this.camera   = camera;
    this.target   = new THREE.Vector3(0, 0.05, 0);
    this.tPos     = new THREE.Vector3().copy(POSITIONS.front.pos);
    this.tTarget  = new THREE.Vector3().copy(POSITIONS.front.target);
    this.rotating = false;
    this.isDragging = false;
    this.prevX = 0;
    this.prevY = 0;
    this.rotY  = 0;
    this.rotX  = 0.08;
    this.tRotY = 0;
    this.tRotX = 0.08;
    this.basePos = new THREE.Vector3().copy(POSITIONS.front.pos);
    this.freeMode = true;

    // Set initial camera position
    this.camera.position.copy(this.tPos);
    this.camera.lookAt(this.tTarget);
  }

  flyTo(viewId) {
    const v = POSITIONS[viewId] || POSITIONS.front;
    this.tPos.copy(v.pos);
    this.tTarget.copy(v.target);
    this.freeMode = false;
    this.rotating = true;
    setTimeout(() => { this.rotating = false; }, 800);
  }

  onPointerDown(x, y) {
    this.isDragging = true;
    this.prevX = x; this.prevY = y;
    this.freeMode = true;
  }

  onPointerMove(x, y) {
    if (!this.isDragging) return;
    const dx = x - this.prevX;
    const dy = y - this.prevY;
    this.tRotY += dx * 0.013;
    this.tRotX  = Math.max(-1.1, Math.min(1.1, this.tRotX + dy * 0.006));
    this.prevX = x; this.prevY = y;
  }

  onPointerUp() { this.isDragging = false; }

  update(headGroup) {
    if (this.freeMode && headGroup) {
      // Free rotation mode — rotates the head
      headGroup.rotation.y += (this.tRotY - headGroup.rotation.y) * 0.1;
      headGroup.rotation.x += (this.tRotX - headGroup.rotation.x) * 0.1;
    } else {
      // Camera fly mode
      this.camera.position.lerp(this.tPos, 0.08);
      const curTarget = new THREE.Vector3();
      curTarget.copy(this.tTarget);
      this.camera.lookAt(curTarget);
    }
  }
}
