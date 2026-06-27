// ═══════════════════════════════════════════════════════════
// HAIR ENGINE — Simulação visual de fios de cabelo
// Fios aparecem FORA da cabeça, nunca atravessam o rosto.
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

const HAIR_COLOR   = new THREE.Color(0x1A1410);
const HAIR_LIGHT   = new THREE.Color(0x3A2E24);
const STRAND_COUNT = 180;

export class HairEngine {
  constructor() {
    this.group   = new THREE.Group();
    this.strands = [];
  }

  // Gera fios de cabelo baseado no corte
  buildHair(cut, headRadius = 1.0) {
    this._dispose();
    this.group = new THREE.Group();

    const elevation = cut.elevation;
    const isRadial  = cut.guideType === 'radial' || cut.guideType === 'pivot';

    // Define a distribuição dos fios baseado no tipo de corte
    const zones = this._getZones(cut);

    zones.forEach(zone => {
      this._buildZoneStrands(zone, elevation, headRadius);
    });

    return this.group;
  }

  _getZones(cut) {
    const base = [
      { name: 'top',      theta: [0, Math.PI * 0.35],    phi: [0, Math.PI * 2],       density: 0.5, length: this._topLength(cut) },
      { name: 'sides',    theta: [Math.PI * 0.3, Math.PI * 0.65], phi: [-1.2, 1.2],  density: 0.35, length: this._sideLength(cut) },
      { name: 'back',     theta: [Math.PI * 0.3, Math.PI * 0.7],  phi: [Math.PI * 0.6, Math.PI * 1.4], density: 0.3, length: this._backLength(cut) },
    ];
    return base;
  }

  _topLength(cut) {
    if (cut.elevation >= 90) return 0.55;
    if (cut.elevation >= 45) return 0.42;
    return 0.30;
  }

  _sideLength(cut) {
    if (cut.id === 'disconnected' || cut.id === 'pompadour') return 0.06;
    if (cut.elevation >= 90) return 0.38;
    if (cut.elevation >= 45) return 0.28;
    return 0.18;
  }

  _backLength(cut) {
    if (cut.id === 'mullet' || cut.id === 'long-layer' || cut.id === 'bro-flow') return 0.70;
    if (cut.elevation >= 90) return 0.44;
    return 0.32;
  }

  _buildZoneStrands(zone, elevation, R) {
    const count = Math.floor(STRAND_COUNT * zone.density);

    for (let i = 0; i < count; i++) {
      // Ponto de origem na superfície do crânio
      const theta = zone.theta[0] + Math.random() * (zone.theta[1] - zone.theta[0]);
      const phi   = zone.phi[0]   + Math.random() * (zone.phi[1]   - zone.phi[0]);

      const origin = new THREE.Vector3(
        R * Math.sin(theta) * Math.cos(phi),
        R * Math.cos(theta),
        R * Math.sin(theta) * Math.sin(phi)
      );

      // Direção do fio baseada na elevação e zona
      const normal  = origin.clone().normalize();
      const length  = zone.length * (0.85 + Math.random() * 0.3);
      const jitter  = new THREE.Vector3(
        (Math.random() - 0.5) * 0.08,
        0,
        (Math.random() - 0.5) * 0.08
      );

      // Curvatura do fio (simulação de queda pela gravidade)
      const segments = 6;
      const points   = [];
      let   current  = origin.clone();
      const stepLen  = length / segments;

      for (let s = 0; s <= segments; s++) {
        points.push(current.clone());
        const gravity = new THREE.Vector3(0, -stepLen * 0.3 * (s / segments), 0);
        const dir = normal.clone().multiplyScalar(stepLen).add(gravity).add(jitter.clone().multiplyScalar(s * 0.01));
        current.add(dir);
      }

      const geo  = new THREE.BufferGeometry().setFromPoints(points);
      const mat  = new THREE.LineBasicMaterial({
        color:       Math.random() > 0.7 ? HAIR_LIGHT : HAIR_COLOR,
        transparent: true,
        opacity:     0.55 + Math.random() * 0.25,
      });
      const strand = new THREE.Line(geo, mat);
      this.group.add(strand);
      this.strands.push(strand);
    }
  }

  setVisible(visible) {
    this.group.visible = visible;
  }

  _dispose() {
    this.strands.forEach(s => {
      s.geometry?.dispose();
      s.material?.dispose();
    });
    this.strands = [];
    if (this.group.parent) this.group.parent.remove(this.group);
  }

  dispose() { this._dispose(); }
}
