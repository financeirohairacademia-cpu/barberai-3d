// ═══════════════════════════════════════════════════════════
// LIGHTING — Estúdio cinematográfico premium
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

export function setupLighting(scene) {
  // Ambiente quente de estúdio
  const ambient = new THREE.AmbientLight(0xFFF8E8, 0.30);
  scene.add(ambient);

  // Key light — spot dourado principal (três quartos)
  const key = new THREE.SpotLight(0xFFF0D0, 3.5);
  key.position.set(2.8, 5.5, 3.8);
  key.angle    = Math.PI / 6;
  key.penumbra = 0.45;
  key.decay    = 1.8;
  key.distance = 18;
  key.castShadow = true;
  key.shadow.mapSize.width  = 2048;
  key.shadow.mapSize.height = 2048;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far  = 20;
  key.shadow.bias        = -0.0004;
  key.shadow.normalBias  = 0.02;
  scene.add(key);
  scene.add(key.target);

  // Fill — azul frio suave
  const fill = new THREE.DirectionalLight(0x8898CC, 0.55);
  fill.position.set(-3.5, 1.5, 2);
  scene.add(fill);

  // Rim — contorno âmbar quente
  const rim = new THREE.DirectionalLight(0xFFE0A0, 1.2);
  rim.position.set(0.8, -1.5, -4);
  scene.add(rim);

  // Top — luz de topo suave
  const top = new THREE.PointLight(0xFFFFFF, 0.8, 12);
  top.position.set(0, 6, 1);
  scene.add(top);

  // Back kicker — separação dourada do fundo
  const back = new THREE.DirectionalLight(0xC8A030, 0.5);
  back.position.set(-1, 3, -5);
  scene.add(back);

  // Under bounce — reflexo suave do chão (estúdio)
  const bounce = new THREE.DirectionalLight(0xFFEED0, 0.25);
  bounce.position.set(0, -4, 2);
  scene.add(bounce);

  // Iluminação volumétrica simulada — point lights estratégicas
  const vol1 = new THREE.PointLight(0xC8A030, 0.35, 6);
  vol1.position.set(-2, 2, -1);
  scene.add(vol1);

  const vol2 = new THREE.PointLight(0x8090C0, 0.22, 5);
  vol2.position.set(2.5, -1, 2);
  scene.add(vol2);

  return { ambient, key, fill, rim, top, back, bounce, vol1, vol2 };
}

// Chão de estúdio com reflexo
export function buildStudioFloor(scene) {
  // Piso escuro reflexivo
  const floorGeo = new THREE.PlaneGeometry(14, 14);
  const floorMat = new THREE.MeshStandardMaterial({
    color:     new THREE.Color(0x080808),
    roughness: 0.35,
    metalness: 0.55,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.92;
  floor.receiveShadow = true;
  scene.add(floor);

  // Grid sutil
  const grid = new THREE.GridHelper(10, 20, 0x181818, 0x101010);
  grid.position.y = -1.90;
  scene.add(grid);

  // Vinheta no chão (disco escuro nas bordas)
  const vigGeo = new THREE.CircleGeometry(5.5, 64);
  const vigMat = new THREE.MeshBasicMaterial({
    color:       0x000000,
    transparent: true,
    opacity:     0.55,
    side:        THREE.DoubleSide,
  });
  const vig = new THREE.Mesh(vigGeo, vigMat);
  vig.rotation.x = -Math.PI / 2;
  vig.position.y = -1.89;
  scene.add(vig);

  return { floor, grid };
}
