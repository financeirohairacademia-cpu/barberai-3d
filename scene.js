// ═══════════════════════════════════════════════════════════
// SCENE — Setup da cena Three.js + carregamento do modelo GLB
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupLighting } from './lighting.js';

const MODEL_URL = 'https://eshufnkarfwvqibecyzr.supabase.co/storage/v1/object/public/models/head.glb';

export class Scene {
  constructor(canvas, onProgress, onLoaded, onError) {
    this.canvas    = canvas;
    this.headGroup = null;
    this.guideGroup = null;

    this._initRenderer();
    this._initScene();
    this._initCamera();
    this._initEnvironment();
    this._loadModel(onProgress, onLoaded, onError);
    this._startLoop();
    this._onResize();
    window.addEventListener('resize', () => this._onResize());
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas:    this.canvas,
      antialias: true,
      alpha:     false,
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060606);
    this.scene.fog = new THREE.FogExp2(0x060606, 0.045);
  }

  _initCamera() {
    const W = this.canvas.clientWidth  || 400;
    const H = this.canvas.clientHeight || 300;
    this.camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 50);
    this.camera.position.set(0, 0.12, 3.8);
    this.camera.lookAt(0, 0.05, 0);
  }

  _initEnvironment() {
    setupLighting(this.scene);

    // Chão sutil com reflexo
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 12),
      new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.95, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.9;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Grid sutil
    const grid = new THREE.GridHelper(10, 20, 0x111111, 0x0D0D0D);
    grid.position.y = -1.88;
    this.scene.add(grid);
  }

  _loadModel(onProgress, onLoaded, onError) {
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        // Auto-centraliza e escala
        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const scale  = 1.88 / Math.max(size.x, size.y, size.z);

        model.position.sub(center);
        model.scale.setScalar(scale);
        model.position.y += 0.02;

        // Aplica material de pele se não tiver textura
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
            if (!child.material?.map) {
              child.material = new THREE.MeshStandardMaterial({
                color:     new THREE.Color(0xC4A882),
                roughness: 0.65,
                metalness: 0.02,
              });
            }
          }
        });

        this.headGroup = new THREE.Group();
        this.headGroup.add(model);
        this.scene.add(this.headGroup);

        onLoaded?.(this.headGroup);
      },
      (xhr) => {
        const pct = xhr.total > 0 ? Math.round((xhr.loaded / xhr.total) * 100) : 0;
        onProgress?.(pct);
      },
      (err) => {
        console.error('GLB load error:', err);
        onError?.(err);
      }
    );
  }

  setGuideGroup(group) {
    if (this.guideGroup && this.headGroup) {
      this.headGroup.remove(this.guideGroup);
    }
    this.guideGroup = group;
    if (group && this.headGroup) {
      this.headGroup.add(group);
    }
  }

  _startLoop() {
    let last = performance.now();
    let frames = 0;
    let fpsTimer = 0;

    const tick = (now) => {
      requestAnimationFrame(tick);

      // FPS counter
      frames++;
      fpsTimer += now - last;
      if (fpsTimer >= 500) {
        const fps = Math.round(frames / (fpsTimer / 1000));
        const el  = document.getElementById('fps-counter');
        if (el) el.textContent = `${fps} FPS`;
        frames = 0; fpsTimer = 0;
      }
      last = now;

      this.renderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(tick);
  }

  _onResize() {
    const wrap = this.canvas.parentElement;
    if (!wrap) return;
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  get three() {
    return { scene: this.scene, camera: this.camera, renderer: this.renderer };
  }
}
