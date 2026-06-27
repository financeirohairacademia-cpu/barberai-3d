// ═══════════════════════════════════════════════════════════
// SIMULATOR — Execução passo a passo em 3D
// ═══════════════════════════════════════════════════════════

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { setupLighting } from './lighting.js';
import { buildGuideLines, disposeGuide } from './guideEngine.js';
import { CameraController } from './camera.js';

const MODEL_URL = 'https://eshufnkarfwvqibecyzr.supabase.co/storage/v1/object/public/models/head.glb';

export class Simulator {
  constructor(canvas, cut) {
    this.canvas    = canvas;
    this.cut       = cut;
    this.step      = 0;
    this.playing   = false;
    this.playTimer = null;
    this.headGroup = null;
    this.guide     = null;
    this.camCtrl   = null;
    this._initScene();
    this._initControls();
  }

  _initScene() {
    const W = this.canvas.clientWidth  || 400;
    const H = this.canvas.clientHeight || 300;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(W, H);
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060606);
    this.scene.fog = new THREE.FogExp2(0x060606, 0.048);

    this.camera = new THREE.PerspectiveCamera(34, W / H, 0.05, 50);
    this.camera.position.set(0, 0.12, 3.8);
    setupLighting(this.scene);

    // Floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10,10),
      new THREE.MeshStandardMaterial({color:0x080808,roughness:1}));
    floor.rotation.x = -Math.PI/2; floor.position.y = -1.9; floor.receiveShadow = true;
    this.scene.add(floor);
    const grid = new THREE.GridHelper(8,16,0x111111,0x0D0D0D);
    grid.position.y = -1.88; this.scene.add(grid);

    this.headGroup = new THREE.Group();
    this.scene.add(this.headGroup);

    this.camCtrl = new CameraController(this.camera);

    new GLTFLoader().load(MODEL_URL, gltf => {
      const model = gltf.scene;
      const box   = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size   = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      model.scale.setScalar(1.88 / Math.max(size.x, size.y, size.z));
      model.position.y += 0.02;
      model.traverse(c => {
        if (c.isMesh) {
          c.castShadow = true; c.receiveShadow = true;
          if (!c.material?.map) c.material = new THREE.MeshStandardMaterial({color:0xC4A882,roughness:.65,metalness:.02});
        }
      });
      this.headGroup.add(model);
      this.load(this.cut);
    });

    const loop = () => {
      requestAnimationFrame(loop);
      if (this.camCtrl && this.headGroup) this.camCtrl.update(this.headGroup);
      this.renderer.render(this.scene, this.camera);
    };
    loop();

    window.addEventListener('resize', () => {
      const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
      this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Drag
    const c = this.canvas;
    c.addEventListener('pointerdown', e => { this.camCtrl.onPointerDown(e.clientX, e.clientY); c.setPointerCapture(e.pointerId); });
    c.addEventListener('pointermove', e => this.camCtrl.onPointerMove(e.clientX, e.clientY));
    c.addEventListener('pointerup',   () => this.camCtrl.onPointerUp());
  }

  _initControls() {
    document.getElementById('sim-prev')?.addEventListener('click', () => this.prev());
    document.getElementById('sim-next')?.addEventListener('click', () => this.next());
    document.getElementById('sim-play')?.addEventListener('click', () => this.togglePlay());
  }

  load(cut) {
    this.cut  = cut;
    this.step = 0;
    this.stopPlay();
    if (this.guide) { disposeGuide(this.guide); this.guide = null; }
    this._renderStep();
    document.getElementById('sim-total').textContent = cut.steps?.length || 0;
  }

  _renderStep() {
    const cut   = this.cut;
    const steps = cut.steps || [];
    const s     = this.step;

    // Update overlay
    const numEl  = document.getElementById('sim-step-num');
    const txtEl  = document.getElementById('sim-step-txt');
    const detEl  = document.getElementById('sim-step-detail');
    const curEl  = document.getElementById('sim-cur');
    const fillEl = document.getElementById('sim-progress-fill');

    if (numEl) numEl.textContent  = `PASSO ${s + 1} — ${cut.name.toUpperCase()}`;
    if (txtEl) txtEl.textContent  = steps[s] || '';
    if (detEl) detEl.textContent  = steps[s] || '';
    if (curEl) curEl.textContent  = s + 1;
    if (fillEl) fillEl.style.width = `${((s + 1) / steps.length) * 100}%`;

    // Tech row
    const techRow = document.getElementById('sim-tech-row');
    if (techRow) {
      techRow.innerHTML = (cut.tech || []).map(t => `
        <div class="tech-item">
          <div class="tech-key">${t.key}</div>
          <div class="tech-val">${t.val}</div>
        </div>`).join('');
    }

    // Build guide for this step (show progressively)
    if (this.guide) { disposeGuide(this.guide); }
    const partial = { ...cut, sliceCount: Math.max(1, Math.round((cut.sliceCount || 6) * ((s + 1) / steps.length))) };
    this.guide = buildGuideLines(partial, 1.0);
    if (this.headGroup) this.headGroup.add(this.guide);

    // Camera
    const cams = ['back','side-right','front','top','front'];
    const camId = cams[s] || cut.camera || 'front';
    if (this.camCtrl) { this.camCtrl.freeMode = false; this.camCtrl.flyTo(camId); }
  }

  next() {
    const max = (this.cut.steps || []).length - 1;
    if (this.step < max) { this.step++; this._renderStep(); }
    else this.stopPlay();
  }

  prev() {
    if (this.step > 0) { this.step--; this._renderStep(); }
  }

  togglePlay() {
    this.playing ? this.stopPlay() : this.startPlay();
  }

  startPlay() {
    this.playing = true;
    const btn = document.getElementById('sim-play');
    if (btn) btn.textContent = '⏸ Pausar';
    this.playTimer = setInterval(() => {
      const max = (this.cut.steps || []).length - 1;
      if (this.step < max) { this.step++; this._renderStep(); }
      else this.stopPlay();
    }, 2800);
  }

  stopPlay() {
    this.playing = false;
    clearInterval(this.playTimer);
    const btn = document.getElementById('sim-play');
    if (btn) btn.textContent = '▶ Play';
  }

  flyTo(viewId) {
    if (this.camCtrl) { this.camCtrl.freeMode = false; this.camCtrl.flyTo(viewId); }
  }
}
