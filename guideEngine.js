// ═══════════════════════════════════════════════════════════
// GUIDE ENGINE — Fios-guia com glow laranja premium
// Linhas técnicas que ensinam geometria de corte.
// NÃO atravessam o rosto. Aparecem FORA da cabeça.
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

// Paleta
const C_ACCENT  = 0xC8A96E;  // laranja ouro
const C_ACCENT2 = 0xE8C98E;  // laranja claro
const C_RED     = 0xDD2222;  // linha guia vermelha
const C_BLUE    = 0x5090FF;  // linha nível azul
const C_DIM     = 0x2A2520;  // dark fill fatias

// Material de linha com glow simulado (double render)
function guideMat(color = C_ACCENT, opacity = 0.95, wide = false) {
  return new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function sliceFillMat() {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(C_DIM),
    roughness: 0.1,
    metalness: 0.9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
  });
}

function edgeMat(color = C_ACCENT, opacity = 0.95) {
  return new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

// Cria arco curvo sobre a cabeça
function buildArc(y, radiusH, radiusV, startPhi, endPhi, segments, material) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const phi = startPhi + (i / segments) * (endPhi - startPhi);
    pts.push(new THREE.Vector3(
      Math.sin(phi) * radiusH,
      y + Math.cos(phi) * radiusV * 0.06,
      Math.cos(phi) * radiusH * 0.88
    ));
  }
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), material);
}

// ── Radial (flow, curtain, wolf, layer 90°) ───────────────────
function buildRadialGuides(cut, S = 1.0) {
  const group = new THREE.Group();
  const color = parseInt(cut.color.replace('#', '0x'));
  const n = cut.sliceCount || 8;

  for (let i = 0; i < n; i++) {
    const frac  = i / (n - 1);
    const angle = -0.70 + frac * 1.40;
    const h = (1.38 + (0.5 - Math.abs(frac - 0.5)) * 0.20) * S;
    const w = 0.76 * S;

    // Fatia sólida
    const geo  = new THREE.BoxGeometry(w, h, 0.015);
    const mesh = new THREE.Mesh(geo, sliceFillMat());

    const R = 0.30 * S;
    mesh.position.set(
      Math.sin(angle) * R * 0.58,
      0.56 + Math.cos(Math.abs(angle) * 0.72) * 0.04,
      Math.cos(angle) * R * 0.18 - 0.03
    );
    mesh.rotation.z = angle;
    mesh.rotation.x = -0.04 + Math.abs(angle) * 0.018;

    // Borda com glow
    const edges = new THREE.EdgesGeometry(geo);
    const borderLine = new THREE.LineSegments(edges, edgeMat(color, 0.95));
    mesh.add(borderLine);

    // Linha glow dupla (mais espessa)
    const glowGeo   = geo.clone();
    glowGeo.applyMatrix4(new THREE.Matrix4().makeScale(1.01, 1.01, 1.01));
    const glowEdges = new THREE.EdgesGeometry(glowGeo);
    const glowLine  = new THREE.LineSegments(glowEdges, edgeMat(color, 0.28));
    mesh.add(glowLine);

    // Faixa central vermelha (só no meio)
    if (i === Math.floor(n / 2)) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.018 * S, h + 0.03, 0.017),
        new THREE.MeshBasicMaterial({ color: C_RED, side: THREE.DoubleSide })
      );
      stripe.position.z = 0.009;
      mesh.add(stripe);
    }

    group.add(mesh);
  }

  // Arcos de nível
  for (let a = 0; a < 4; a++) {
    const yA = 0.28 - a * 0.18;
    const r  = 0.52 * S;
    const arc = buildArc(yA, r, 1, -Math.PI * 0.72, Math.PI * 0.72, 64,
      guideMat(a === 0 ? C_RED : (a === 1 ? C_BLUE : C_ACCENT), a === 0 ? 0.75 : 0.22));
    group.add(arc);
  }

  return group;
}

// ── Paralelas horizontais (one length, graduation, mullet) ────
function buildHorizontalGuides(cut, S = 1.0) {
  const group = new THREE.Group();
  const color = parseInt(cut.color.replace('#', '0x'));
  const n     = cut.sliceCount || 5;
  const er    = (cut.elevation * Math.PI) / 180;

  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 2 - 1;
    const h = (1.12 + er * 0.26) * S;
    const geo  = new THREE.BoxGeometry(0.018 * S, h, 0.40 * S);
    const mesh = new THREE.Mesh(geo, sliceFillMat());

    mesh.position.set(t * 0.66 * S, 0.42 + Math.abs(t) * 0.022, -0.06);
    mesh.rotation.x = er - Math.PI / 2;

    const edges = new THREE.EdgesGeometry(geo);
    mesh.add(new THREE.LineSegments(edges, edgeMat(color)));
    group.add(mesh);
  }

  // Arcos de nível curvados
  for (let a = 0; a < 3; a++) {
    const yA = 0.24 - a * 0.19;
    const r  = 0.50 * S;
    const arc = buildArc(yA, r, 1, -Math.PI * 0.73, Math.PI * 0.73, 64,
      guideMat(a === 0 ? C_RED : 0x222222, a === 0 ? 0.80 : 0.35));
    group.add(arc);
  }

  return group;
}

// ── Pivô 360° (round layer) ───────────────────────────────────
function buildPivotGuides(cut, S = 1.0) {
  const group = new THREE.Group();
  const color = parseInt(cut.color.replace('#', '0x'));
  const n     = cut.sliceCount || 8;

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const h = 1.28 * S;
    const geo  = new THREE.BoxGeometry(0.015 * S, h, 0.32 * S);
    const mesh = new THREE.Mesh(geo, sliceFillMat());

    mesh.position.set(
      Math.sin(angle) * 0.20 * S,
      0.44,
      Math.cos(angle) * 0.20 * S
    );
    mesh.rotation.y = angle;
    mesh.rotation.x = -Math.PI / 2;

    const edges = new THREE.EdgesGeometry(geo);
    mesh.add(new THREE.LineSegments(edges, edgeMat(color)));
    group.add(mesh);
  }

  // Círculo central no apex
  const circPts = [];
  for (let j = 0; j <= 64; j++) {
    const a = (j / 64) * Math.PI * 2;
    circPts.push(new THREE.Vector3(Math.cos(a) * 0.18 * S, 0.62, Math.sin(a) * 0.18 * S));
  }
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(circPts),
    guideMat(C_RED, 0.80)
  ));

  return group;
}

// ── Diagonal (pompadour, french crop) ────────────────────────
function buildDiagonalGuides(cut, S = 1.0, forward = true) {
  const group = new THREE.Group();
  const color = parseInt(cut.color.replace('#', '0x'));
  const n     = cut.sliceCount || 5;
  const dir   = forward ? 1 : -1;

  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * 2 - 1;
    const geo  = new THREE.BoxGeometry(0.015 * S, 1.18 * S, 0.36 * S);
    const mesh = new THREE.Mesh(geo, sliceFillMat());

    mesh.position.set(t * 0.62 * S, 0.40, dir * 0.04);
    mesh.rotation.x = -Math.PI / 2 + (dir * 0.26);

    const edges = new THREE.EdgesGeometry(geo);
    mesh.add(new THREE.LineSegments(edges, edgeMat(color)));
    group.add(mesh);
  }

  // Linha guia frontal (franja)
  const fringePts = [];
  for (let j = 0; j <= 32; j++) {
    const t2 = -0.65 + (j / 32) * 1.30;
    fringePts.push(new THREE.Vector3(t2 * S, 0.62, 0.50 * S));
  }
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(fringePts),
    guideMat(C_RED, 0.85)
  ));

  return group;
}

// ── Ferradura (horseshoe) ─────────────────────────────────────
function buildHorseshoeGuides(cut, S = 1.0, level = 'mid') {
  const group = new THREE.Group();
  const color = parseInt(cut.color.replace('#', '0x'));

  const yMap = { low: -0.10, mid: 0.15, high: 0.38 };
  const yArc = yMap[level] || 0.15;
  const r    = 0.55 * S;

  // Arco principal em forma de ferradura
  const pts = [];
  for (let j = 0; j <= 80; j++) {
    const phi = Math.PI + (j / 80) * Math.PI;
    pts.push(new THREE.Vector3(
      Math.cos(phi) * r,
      yArc + Math.abs(Math.sin(phi)) * 0.04,
      Math.sin(phi) * r * 0.9
    ));
  }
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), guideMat(color, 0.90)));

  // Linhas verticais internas
  const nLines = 5;
  for (let i = 0; i < nLines; i++) {
    const frac = i / (nLines - 1);
    const phi  = Math.PI + frac * Math.PI;
    const x    = Math.cos(phi) * r;
    const z    = Math.sin(phi) * r * 0.9;

    const linePts = [
      new THREE.Vector3(x, yArc + 0.04, z),
      new THREE.Vector3(x * 0.85, yArc + 0.65 * S, z * 0.85),
    ];
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(linePts),
      guideMat(color, 0.55)
    ));
  }

  return group;
}

// ── Factory pública ───────────────────────────────────────────
export function buildGuideLines(cut, S = 1.0) {
  switch (cut.guideType) {
    case 'radial':
      return buildRadialGuides(cut, S);
    case 'horizontal':
      return buildHorizontalGuides(cut, S);
    case 'pivot':
      return buildPivotGuides(cut, S);
    case 'diagonal-fwd':
      return buildDiagonalGuides(cut, S, true);
    case 'diagonal-bwd':
      return buildDiagonalGuides(cut, S, false);
    case 'horseshoe-low':
      return buildHorseshoeGuides(cut, S, 'low');
    case 'horseshoe-high':
      return buildHorseshoeGuides(cut, S, 'high');
    case 'horseshoe':
    default:
      if (cut.guideType && cut.guideType.startsWith('horseshoe')) {
        return buildHorseshoeGuides(cut, S, 'mid');
      }
      return buildHorizontalGuides(cut, S);
  }
}

export function disposeGuide(group) {
  if (!group) return;
  group.traverse(c => {
    c.geometry?.dispose();
    if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
    else c.material?.dispose();
  });
  if (group.parent) group.parent.remove(group);
}
