// ═══════════════════════════════════════════════════════════
// ANIMATION ENGINE — Transições suaves
// ═══════════════════════════════════════════════════════════

export class AnimationEngine {
  constructor() {
    this.tasks = [];
  }

  // Fade out um grupo Three.js
  fadeOut(group, duration = 300, onDone) {
    if (!group) { onDone?.(); return; }
    const start  = performance.now();
    const meshes = [];
    group.traverse(c => { if (c.isMesh && c.material) meshes.push(c); });

    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      const opacity = 1 - t;
      meshes.forEach(m => {
        if (Array.isArray(m.material)) m.material.forEach(mat => { mat.transparent = true; mat.opacity = opacity; });
        else { m.material.transparent = true; m.material.opacity = opacity; }
      });
      if (t < 1) requestAnimationFrame(tick);
      else onDone?.();
    };
    requestAnimationFrame(tick);
  }

  // Fade in um grupo Three.js
  fadeIn(group, duration = 400, targetOpacity = 0.88) {
    if (!group) return;
    const start  = performance.now();
    const meshes = [];
    group.traverse(c => { if (c.isMesh && c.material) meshes.push(c); });
    meshes.forEach(m => {
      if (Array.isArray(m.material)) m.material.forEach(mat => { mat.transparent = true; mat.opacity = 0; });
      else { m.material.transparent = true; m.material.opacity = 0; }
    });

    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3); // cubic ease out
      const opacity = ease * targetOpacity;
      meshes.forEach(m => {
        if (Array.isArray(m.material)) m.material.forEach(mat => mat.opacity = opacity);
        else m.material.opacity = opacity;
      });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // Anima um valor DOM com easing
  animateValue(el, from, to, duration = 400, format = v => v) {
    if (!el) return;
    const start = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 2);
      const val  = from + (to - from) * ease;
      el.textContent = format(val);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // CSS fade para elemento DOM
  cssTransition(el, cb, duration = 200) {
    if (!el) { cb?.(); return; }
    el.style.transition = `opacity ${duration}ms ease`;
    el.style.opacity    = '0';
    setTimeout(() => {
      cb?.();
      el.style.opacity = '1';
    }, duration);
  }
}
