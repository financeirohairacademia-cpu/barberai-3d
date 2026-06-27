// ═══════════════════════════════════════════════════════════
// STUDY PANEL — Teoria completa do corte
// ═══════════════════════════════════════════════════════════

export class StudyPanel {
  render(cut) {
    const heroTitle = document.getElementById('study-hero-title');
    const heroSub   = document.getElementById('study-hero-sub');
    const sections  = document.getElementById('study-sections');
    if (heroTitle) heroTitle.textContent = cut.name;
    if (heroSub)   heroSub.textContent   = `${cut.elevation}° · ${cut.section} · ${cut.projection}`;
    if (!sections) return;

    const cards = [
      {
        icon: '📐', tag: 'Geometria', tagColor: 'var(--accent)',
        title: 'O que é este corte?',
        body: this._whatIs(cut),
      },
      {
        icon: '📏', tag: 'Elevação', tagColor: 'var(--blue)',
        title: `Elevação de ${cut.elevation}°`,
        body: this._elevationExplain(cut.elevation),
      },
      {
        icon: '🔵', tag: 'Projeção', tagColor: 'var(--purple)',
        title: `Projeção ${cut.projection}`,
        body: this._projectionExplain(cut.projection),
      },
      {
        icon: '📊', tag: 'Distribuição', tagColor: 'var(--green)',
        title: `Distribuição ${cut.distribution}`,
        body: this._distributionExplain(cut.distribution),
      },
      {
        icon: '⚖️', tag: 'Peso', tagColor: 'var(--red)',
        title: `Peso ${cut.weight}`,
        body: this._weightExplain(cut.weight),
      },
      {
        icon: '🗂', tag: 'Seção', tagColor: 'var(--accent)',
        title: `Seção ${cut.section}`,
        body: this._sectionExplain(cut.section),
      },
      {
        icon: '✦', tag: 'Linha Guia', tagColor: 'var(--text2)',
        title: `Guia ${cut.guide}`,
        body: this._guideExplain(cut.guide),
      },
      {
        icon: '🎯', tag: 'Resultado', tagColor: 'var(--green)',
        title: 'Resultado esperado',
        body: `${cut.name} cria um acabamento com ${cut.movement} de movimento e volume ${cut.volume}. A conexão entre as regiões é ${cut.connection}. Ideal para clientes que desejam um visual com ${cut.weight === 'Máximo' ? 'peso e densidade máximos' : cut.weight === 'Removido' ? 'leveza e camadas visíveis' : 'equilíbrio entre peso e movimento'}.`,
      },
    ];

    sections.innerHTML = cards.map(c => `
      <div class="study-card">
        <div class="study-card-title">
          <span>${c.icon}</span>
          <span style="display:inline-block;padding:2px 7px;border-radius:20px;font-size:9px;font-weight:600;text-transform:uppercase;background:${c.tagColor}18;border:1px solid ${c.tagColor}40;color:${c.tagColor};">${c.tag}</span>
          ${c.title}
        </div>
        <div class="study-card-body">${c.body}</div>
      </div>`).join('');
  }

  _whatIs(cut) {
    return `O ${cut.name} é um corte com ${cut.elevation}° de elevação, utilizando seções do tipo ${cut.section}. A projeção é ${cut.projection} e a distribuição das mechas é ${cut.distribution}. Este corte é conhecido por criar ${cut.movement === 'Alto' ? 'muito movimento e fluidez' : cut.movement === 'Mínimo' ? 'linhas limpas e definidas' : 'movimento moderado e controlado'} no resultado final.`;
  }

  _elevationExplain(deg) {
    const map = {
      0:   'Elevação 0° significa que o cabelo cai naturalmente sem ser levantado. Cria o máximo de peso na linha de corte. Utilizado em cortes clássicos como o One Length e o Bob.',
      45:  'Elevação 45° eleva o cabelo a meio caminho entre a queda natural e o perpendicular. Cria uma graduação suave, acumulando peso de forma progressiva. Base do efeito "stacked".',
      90:  'Elevação 90° projeta o cabelo perpendicular ao couro cabeludo. Remove o peso de forma uniforme sem sacrificar comprimento. Base das camadas uniformes (Uniform Layers).',
      135: 'Elevação 135° vai além da perpendicular — chamada de over-direction. Cria long layers com máximo movimento e leveza. Ideal para cabelos médios e longos.',
    };
    return map[deg] || `Elevação de ${deg}° aplicada de forma técnica para criar o efeito desejado no resultado final.`;
  }

  _projectionExplain(proj) {
    const map = {
      'Natural':       'Projeção Natural — o cabelo é direcionado como cresce naturalmente, sem deslocamento intencional. Preserva o peso onde ele naturalmente existe.',
      'Perpendicular': 'Projeção Perpendicular — o cabelo é projetado a 90° da superfície da cabeça. Cria distribuição uniforme e remove peso de forma equilibrada.',
      'Diagonal':      'Projeção Diagonal — o cabelo é inclinado em ângulo para criar linha de peso específica. Controla onde o peso se acumula no corte.',
      'Over-directed': 'Projeção Over-directed — o cabelo é deslocado além da posição natural. Cria camadas longas e leveza máxima no comprimento.',
      'Direcionada':   'Projeção Direcionada — mechas são intencionalmente puxadas em uma direção específica para criar volume, movimento ou efeito especial.',
    };
    return map[proj] || `Projeção ${proj} aplicada para controlar a distribuição e o peso do corte.`;
  }

  _distributionExplain(dist) {
    const map = {
      'Uniforme':       'Distribuição Uniforme — todas as mechas são puxadas para o mesmo ponto de referência. Cria consistência e equilíbrio em todo o corte.',
      'Desconectada':   'Distribuição Desconectada — diferentes regiões são cortadas independentemente, sem conexão entre elas. Cria contraste intencional.',
      'Circular':       'Distribuição Circular — mechas em pivô de 360° ao redor de um ponto central. Cria forma arredondada e volume simétrico.',
      'Direcionada':    'Distribuição Direcionada — mechas são deslocadas intencionalmente para uma direção específica, criando volume ou movimento direcionado.',
    };
    return map[dist] || `Distribuição ${dist} utilizada para controlar como as mechas se distribuem durante a execução.`;
  }

  _weightExplain(weight) {
    const map = {
      'Máximo':       'Peso Máximo — nenhuma camada é criada. Todo o peso do cabelo concentra-se na linha de corte. Cria aparência densa e volumosa na extremidade.',
      'Acumulado':    'Peso Acumulado — o peso se concentra progressivamente em uma região específica. Cria o "stacked" — aparência mais volumosa na área de acúmulo.',
      'Removido':     'Peso Removido — camadas distribuem o peso por toda a extensão do cabelo. Cria leveza, movimento e reduz o volume aparente.',
      'Médio':        'Peso Médio — equilíbrio entre peso e leveza. Cria movimento sem eliminar a densidade. Versátil para diferentes tipos de cabelo.',
      'Texturizado':  'Peso Texturizado — peso irregular intencionalmente. Cria textura visível e movimento orgânico. Frequente em estilos modernos.',
      'Topo':         'Peso concentrado no topo — corpo e volume na região superior, laterais mais finas. Cria a silhueta característica do estilo.',
      'Franja':       'Peso concentrado na franja — define a linha frontal como elemento principal do corte.',
    };
    return map[weight] || `Peso ${weight} aplicado para criar o resultado visual desejado no corte.`;
  }

  _sectionExplain(section) {
    const map = {
      'Horizontal':    'Seção Horizontal — divisão paralela ao chão. Controla a linha de peso e cria graduação. Padrão na maioria dos cortes clássicos.',
      'Vertical':      'Seção Vertical — divisão perpendicular ao chão. Cria direcionamento e conecta regiões diferentes da cabeça.',
      'Radial':        'Seção Radial — mechas partem de um ponto central (geralmente o apex). Cria distribuição uniforme em 360° ao redor da cabeça.',
      'Diagonal ant.': 'Seção Diagonal Anterior — divisão inclinada para a frente. Cria comprimento maior na frente. Utilizada em bobs e lobs.',
      'Diagonal post.':'Seção Diagonal Posterior — divisão inclinada para trás. Cria comprimento maior atrás. Cria efeito de aumento visual de comprimento.',
      'Pivô':          'Seção em Pivô — mechas em leque ao redor de um ponto fixo. Cria forma circular. Base das round layers e bob redondo.',
    };
    return map[section] || `Seção do tipo ${section} aplicada para controlar a distribuição e o resultado geométrico do corte.`;
  }

  _guideExplain(guide) {
    const map = {
      'Estacionária': 'Guia Estacionária — uma mecha de comprimento fixo serve como referência para todo o corte. Cria uniformidade e peso. Padrão em cortes one-length.',
      'Viajante':     'Guia Viajante — cada mecha cortada se torna a guia da próxima. O comprimento viaja pela cabeça. Cria camadas conectadas e progressivas.',
      'Interna':      'Guia Interna — a guia está dentro da seção, não visível por fora. Controla o comprimento de dentro para fora. Utilizada em camadas.',
      'Externa':      'Guia Externa — a guia está visível por fora da seção. Controla o comprimento externo. Precisa de visibilidade constante durante o corte.',
      'Central':      'Guia Central — ponto de referência no centro da cabeça. A partir dela, o comprimento se define para os lados. Utilizada em round layers.',
    };
    return map[guide] || `Guia ${guide} utilizada para manter consistência e precisão durante a execução do corte.`;
  }
}
