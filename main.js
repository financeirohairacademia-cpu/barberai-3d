// ═══════════════════════════════════════════════════════════
// MAIN — Orquestrador BarberAI Academy V2
// ═══════════════════════════════════════════════════════════

import { Scene }            from './scene.js';
import { CameraController } from './camera.js';
import { buildGuideLines, disposeGuide } from './guideEngine.js';
import { AnimationEngine }  from './animationEngine.js';
import { UI }               from './ui.js';
import { Simulator }        from './simulator.js';
import { TechniquePanel }   from './techniquePanel.js';
import { StudyPanel }       from './studyPanel.js';
import { AIProfessor }      from './aiProfessor.js';
import { CUT_LIBRARY }      from './cutLibrary.js';

let scene3d, camCtrl, anim, ui, simulator, techniquePanel, studyPanel, aiProfessor;
let headGroup, currentGuide, currentCut;
let isTransitioning = false;
let activeTab = 'geometry';

function init() {
  anim = new AnimationEngine();
  currentCut = CUT_LIBRARY[0];

  // Instancia painéis independentes
  techniquePanel = new TechniquePanel();
  studyPanel     = new StudyPanel();
  aiProfessor    = new AIProfessor(() => currentCut);

  ui = new UI(
    (cut) => switchCut(cut),
    (viewId) => {
      if (camCtrl) { camCtrl.freeMode = false; camCtrl.flyTo(viewId); }
    }
  );

  setupNavTabs();
  setupGeoCanvas();
}

function setupGeoCanvas() {
  const canvas = document.getElementById('canvas');
  scene3d = new Scene(
    canvas,
    (pct) => ui.updateSplash(pct),
    (hg)  => {
      headGroup = hg;
      setupCamera(canvas);
      applyCurrentCut(false);
      ui.selectCut(currentCut.id);
      ui.showApp();
      startLoop();
    },
    () => ui.splashError()
  );
}

function setupCamera(canvas) {
  camCtrl = new CameraController(scene3d.three.camera);
  const opts = { passive: false };
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); camCtrl.onPointerDown(e.clientX, e.clientY); canvas.setPointerCapture(e.pointerId); }, opts);
  canvas.addEventListener('pointermove', e => { e.preventDefault(); camCtrl.onPointerMove(e.clientX, e.clientY); }, opts);
  canvas.addEventListener('pointerup',   e => { e.preventDefault(); camCtrl.onPointerUp(); }, opts);
  canvas.addEventListener('touchstart',  e => e.preventDefault(), opts);
  canvas.addEventListener('touchmove',   e => e.preventDefault(), opts);
}

function setupNavTabs() {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));

  // Lazy init do simulador quando aba é aberta
  if (tab === 'simulate' && !simulator) {
    initSimulator();
  }
  if (tab === 'technique') techniquePanel.render(currentCut);
  if (tab === 'study')     studyPanel.render(currentCut);
  if (tab === 'ai')        aiProfessor.setContext(currentCut);
}

function initSimulator() {
  simulator = new Simulator(
    document.getElementById('canvas-sim'),
    currentCut,
    (viewId) => {
      // Sim camera buttons
    }
  );
  simulator.load(currentCut);

  // Bind sim camera buttons
  document.querySelectorAll('[data-sim-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sim-view]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      simulator?.flyTo(btn.dataset.simView);
    });
  });
}

function applyCurrentCut(animate = true) {
  const cut = currentCut;
  const newGuide = buildGuideLines(cut, 1.0);

  if (animate && currentGuide) {
    anim.fadeOut(currentGuide, 180, () => {
      disposeGuide(currentGuide);
      scene3d.setGuideGroup(newGuide);
      currentGuide = newGuide;
      anim.fadeIn(newGuide, 350, 0.88);
    });
  } else {
    if (currentGuide) disposeGuide(currentGuide);
    scene3d.setGuideGroup(newGuide);
    currentGuide = newGuide;
  }

  if (camCtrl && cut.camera) {
    camCtrl.freeMode = false;
    camCtrl.flyTo(cut.camera);
    const vm = { 'side-right':'right','front':'front','back':'back','top':'top','left':'left' };
    ui.activateCamBtn(vm[cut.camera] || cut.camera);
  }
}

function switchCut(cut) {
  if (isTransitioning || cut.id === currentCut.id) return;
  isTransitioning = true;
  currentCut = cut;

  applyCurrentCut(true);
  if (simulator) simulator.load(cut);
  if (activeTab === 'technique') techniquePanel.render(cut);
  if (activeTab === 'study')     studyPanel.render(cut);
  if (activeTab === 'ai')        aiProfessor.setContext(cut);

  setTimeout(() => { isTransitioning = false; }, 400);
}

function startLoop() {
  const tick = () => {
    requestAnimationFrame(tick);
    if (camCtrl && headGroup) camCtrl.update(headGroup);
  };
  requestAnimationFrame(tick);
}

init();
