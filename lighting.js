// ═══════════════════════════════════════════════════════════
// LIGHTING — Iluminação cinematográfica
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';

export function setupLighting(scene) {
  // Ambiente suave
  const ambient = new THREE.AmbientLight(0xFFF5E0, 0.38);
  scene.add(ambient);

  // Key light — principal dourada quente
  const key = new THREE.DirectionalLight(0xFFF4D0, 2.8);
  key.position.set(2.5, 5, 3.5);
  key.castShadow = true;
  key.shadow.mapSize.width  = 2048;
  key.shadow.mapSize.height = 2048;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far  = 20;
  key.shadow.camera.left   = -3;
  key.shadow.camera.right  =  3;
  key.shadow.camera.top    =  4;
  key.shadow.camera.bottom = -4;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  scene.add(key);

  // Fill light — azul frio contraluz
  const fill = new THREE.DirectionalLight(0x8898CC, 0.7);
  fill.position.set(-3, 1.5, 2);
  scene.add(fill);

  // Rim light — contorno âmbar
  const rim = new THREE.DirectionalLight(0xFFE5AA, 1.1);
  rim.position.set(0.5, -2, -3.5);
  scene.add(rim);

  // Top light — ponto superior
  const top = new THREE.PointLight(0xFFFFFF, 0.9, 10);
  top.position.set(0, 5, 0.5);
  scene.add(top);

  // Back fill — separação de fundo
  const back = new THREE.DirectionalLight(0x334466, 0.45);
  back.position.set(0, 2, -4);
  scene.add(back);

  // Under fill — suave de baixo
  const under = new THREE.DirectionalLight(0x221A10, 0.3);
  under.position.set(0, -4, 1);
  scene.add(under);

  return { ambient, key, fill, rim, top, back, under };
}
