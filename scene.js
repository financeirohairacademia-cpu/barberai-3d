// ═══════════════════════════════════════════════════════════
// SCENE — Setup da cena Three.js premium + GLB
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupLighting, buildStudioFloor } from './lighting.js';

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
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace  = THREE.SRGBColorSpace;
  }

  _initScene() {
    this.scene = new THREE.Scene();
    // Fundo de estúdio — gradiente escuro quente
    this.scene.background = new THREE.Color(0x0A0A0C);
    this.scene.fog = new THREE.FogExp2(0x0A0806, 0.042);
  }

  _initCamera() {
    const W = this.canvas.clientWidth  || 400;
    const H = this.canvas.clientHeight || 300;
    this.camera = new THREE.PerspectiveCamera(32, W / H, 0.05, 50);
    this.camera.position.set(0, 0.10, 3.9);
    this.camera.lookAt(0, 0.05, 0);
  }

  _initEnvironment() {
    setupLighting(this.scene);
    buildStudioFloor(this.scene);
  }

  _loadModel(onProgress, onLoaded, onError) {
    new GLTFLoader().load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;

        // Auto-centraliza e escala — cabeça ocupa ~65% da área
        const box    = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size   = box.getSize(new THREE.Vector3());
        const scale  = 1.92 / Math.max(size.x, size.y, size.z);

        model.position.sub(center);
        model.scale.setScalar(scale);
        // Centraliza verticalmente no viewport
        model.position.y += 0.06;

        // Material de pele premium
        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow    = true;
            child.receiveShadow = true;
            if (!child.material?.map) {
              child.material = new THREE.MeshStandardMaterial({
                color:     new THREE.Color(0xC8A882),
                roughness: 0.62,
                metalness: 0.03,
                envMapIntensity: 0.8,
              });
            } else {
              // Mantém textura original mas melhora PBR
              child.material.roughness = Math.max(child.material.roughness ?? 0.6, 0.5);
              child.material.envMapIntensity = 0.8;
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
    let last   = performance.now();
    let frames = 0;
    let fpsTimer = 0;

    const tick = (now) => {
      requestAnimationFrame(tick);
      frames++;
      fpsTimer += now - last;
      if (fpsTimer >= 600) {
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
