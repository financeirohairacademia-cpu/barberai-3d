// ═══════════════════════════════════════════════════════════
// UI — Interface e interações
// ═══════════════════════════════════════════════════════════

import { CUT_LIBRARY } from './cutLibrary.js';

export class UI {
  constructor(onCutSelect, onCameraView) {
    this.onCutSelect  = onCutSelect;
    this.onCameraView = onCameraView;
    this._buildCuts();
    this._buildCamButtons();
  }

  _buildCuts() {
    const scroll = document.getElementById('cuts-scroll');
    if (!scroll) return;
    CUT_LIBRARY.forEach((cut, i) => {
      const chip = document.createElement('div');
      chip.className = 'cut-chip' + (i === 0 ? ' active' : '');
      chip.textContent = cut.name;
      chip.dataset.id  = cut.id;
      chip.addEventListener('click', () => this.selectCut(cut.id));
      scroll.appendChild(chip);
    });
  }

  _buildCamButtons() {
    document.querySelectorAll('#cam-controls .cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#cam-controls .cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.onCameraView?.(btn.dataset.view);
      });
    });
  }

  selectCut(id) {
    document.querySelectorAll('.cut-chip').forEach(c => c.classList.toggle('active', c.dataset.id === id));
    const cut = CUT_LIBRARY.find(c => c.id === id);
    if (!cut) return;
    this._updateHUD(cut);
    this._updateHeader(cut);
    this._updateTechPanel(cut);
    this._updateGuideSteps(cut);
    this._updateElevation(cut.elevation);
    this.onCutSelect?.(cut);
  }

  _updateHeader(cut) {
    const el = document.getElementById('header-cut-name');
    if (el) el.textContent = cut.name;
  }

  _updateHUD(cut) {
    const name = document.getElementById('hud-name');
    const meta = document.getElementById('hud-meta');
    if (name) name.textContent = cut.name;
    if (meta) meta.textContent = `${cut.elevation}° · ${cut.section} · ${cut.connection}`;
  }

  _updateTechPanel(cut) {
    const grid = document.getElementById('tech-grid');
    if (!grid) return;
    grid.innerHTML = (cut.tech || []).map(item => `
      <div class="tech-item">
        <div class="tech-key">${item.key}</div>
        <div class="tech-val">${item.val}</div>
      </div>`).join('');
  }

  _updateGuideSteps(cut) {
    const el = document.getElementById('guide-steps');
    if (!el) return;
    el.innerHTML = (cut.steps || []).map((step, i) => `
      <div class="guide-step" style="animation-delay:${i * 0.06}s">
        <div class="guide-num" style="background:${cut.color}18;border:1px solid ${cut.color}50;color:${cut.color}">${i+1}</div>
        <div class="guide-txt">${step}</div>
      </div>`).join('');
  }

  _updateElevation(deg) {
    const val = document.getElementById('elev-value');
    const arc = document.getElementById('elev-arc');
    if (val) val.textContent = `${deg}°`;
    if (arc) arc.style.setProperty('--elev-rot', `${-90 + deg}deg`);
  }

  activateCamBtn(viewId) {
    document.querySelectorAll('#cam-controls .cam-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.view === viewId);
    });
  }

  showApp() {
    const splash = document.getElementById('splash');
    const app    = document.getElementById('app');
    splash?.classList.add('out');
    setTimeout(() => {
      if (splash) splash.style.display = 'none';
      if (app)    app.style.display    = 'flex';
    }, 600);
  }

  updateSplash(pct) {
    const bar = document.getElementById('splash-bar');
    const txt = document.getElementById('splash-pct');
    if (bar) bar.style.width  = `${pct}%`;
    if (txt) txt.textContent  = `Carregando modelo 3D... ${pct}%`;
  }

  splashError() {
    const txt = document.getElementById('splash-pct');
    if (txt) txt.textContent = 'Erro ao carregar modelo 3D';
  }
}
