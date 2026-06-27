// ═══════════════════════════════════════════════════════════
// TECHNIQUE PANEL — Empunhadura, dedos, tesoura, pente
// ═══════════════════════════════════════════════════════════

const TECHNIQUE_DATA = {
  scissors: {
    title: '✂ Tesoura',
    rows: [
      ['Tipo recomendado', 'Tesoura de corte profissional 6"–6.5"'],
      ['Empunhadura', 'Polegar no aro menor, dedo médio no aro maior'],
      ['Dedo de apoio', 'Mindinho fora do aro — controle de estabilidade'],
      ['Movimento ativo', 'Polegar — dedo móvel principal'],
      ['Dedo estático', 'Dedo médio — pivo fixo'],
      ['Tensão da mola', 'Ajustada — nem folgada, nem apertada'],
      ['Ponto de corte', 'No terço médio das lâminas — controle máximo'],
    ]
  },
  fingers: {
    title: '🖐 Posição dos Dedos',
    rows: [
      ['Tensão da mecha', 'Índice + médio — mecha entre os dedos'],
      ['Direção dos dedos', 'Paralela à linha de corte desejada'],
      ['Elevação', 'Ângulo dos dedos = ângulo de elevação do corte'],
      ['Pressão', 'Firme mas sem comprimir — controla comprimento'],
      ['Guia externa', 'Ponta dos dedos nivelada com a guia anterior'],
    ]
  },
  comb: {
    title: '🪮 Pente',
    rows: [
      ['Tipo', 'Pente de cabo longo para controle preciso'],
      ['Distribuição', 'Dentes finos para mechas finas e uniformes'],
      ['Tensão', 'Deslizar suavemente — sem forçar'],
      ['Direção', 'Sempre no sentido do crescimento natural'],
      ['Pente sobre pente', 'Técnica de corte sobre o pente — lateral baixa'],
    ]
  },
  tension: {
    title: '⚡ Tensão e Controle',
    rows: [
      ['Tensão ideal', 'Mecha esticada mas não deformada'],
      ['Efeito da tensão baixa', 'Corte mais longo que o desejado'],
      ['Efeito da tensão alta', 'Encurta o resultado final'],
      ['Uniformidade', 'Manter tensão igual em toda a execução'],
      ['Cabelo molhado', 'Contrai ao secar — corte 10-15% mais longo'],
      ['Técnica de cheque', 'Sempre verificar no seco antes de finalizar'],
    ]
  },
};

const VIEW_DATA = {
  frontal:   { elevacao:'—', base:'—', metra:'—', guia:'—', referencia:'Testa / Parietal', direcao:'Natural' },
  lateral_e: { elevacao:'—', base:'Vertical', mechas:'Paralelas', guia:'Interna', referencia:'Temporal E', direcao:'Para trás' },
  lateral_d: { elevacao:'—', base:'Vertical', mechas:'Paralelas', guia:'Interna', referencia:'Temporal D', direcao:'Para trás' },
  posterior: { elevacao:'—', base:'Horizontal', mechas:'Paralelas', guia:'Estacionária', referencia:'Occipital', direcao:'Para baixo' },
  topo:      { elevacao:'—', base:'Radial', mechas:'Radiais', guia:'Viajante', referencia:'Apex', direcao:'Do centro' },
};

export class TechniquePanel {
  render(cut) {
    const nameEl = document.getElementById('technique-cut-name');
    const descEl = document.getElementById('technique-cut-desc');
    const sectEl = document.getElementById('technique-sections');
    if (nameEl) nameEl.textContent = cut.name;
    if (descEl) descEl.textContent = cut.description || `${cut.name} — ${cut.elevation}° de elevação, seção ${cut.section}.`;
    if (!sectEl) return;

    // Views data with elevation filled in
    const views = { ...VIEW_DATA };
    Object.keys(views).forEach(k => { views[k] = { ...views[k], elevacao: `${cut.elevation}°` }; });

    sectEl.innerHTML = `
      ${Object.values(TECHNIQUE_DATA).map(sec => `
        <div class="technique-section">
          <div class="technique-section-title">${sec.title}</div>
          ${sec.rows.map(([k,v]) => `
            <div class="technique-row">
              <span class="technique-key">${k}</span>
              <span class="technique-val">${v}</span>
            </div>`).join('')}
        </div>`).join('')}

      <div class="technique-section">
        <div class="technique-section-title">📐 Geometria por Vista — ${cut.name}</div>
        ${Object.entries(views).map(([vista, data]) => `
          <div style="margin-bottom:8px;">
            <div style="font-size:9px;color:var(--accent);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;">${vista.replace('_',' ')}</div>
            ${Object.entries(data).map(([k,v]) => `
              <div class="technique-row">
                <span class="technique-key">${k.replace('_',' ')}</span>
                <span class="technique-val">${v}</span>
              </div>`).join('')}
          </div>`).join('')}
      </div>

      <div class="technique-section">
        <div class="technique-section-title">📋 Parâmetros Técnicos</div>
        ${(cut.tech||[]).map(t => `
          <div class="technique-row">
            <span class="technique-key">${t.key}</span>
            <span class="technique-val">${t.val}</span>
          </div>`).join('')}
      </div>
    `;
  }
}
