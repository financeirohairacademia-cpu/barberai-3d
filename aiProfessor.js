// ═══════════════════════════════════════════════════════════
// AI PROFESSOR — Professor IA em tempo real
// ═══════════════════════════════════════════════════════════

const API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `Você é o Professor IA do BarberAI Academy — um especialista mundial em geometria de corte masculino com foco em tesoura.

Seu papel:
- Explicar geometria de corte de forma clara e técnica
- Responder sobre ângulos, elevação, projeção, distribuição e peso
- Orientar sobre empunhadura, posição dos dedos, tensão da mecha
- Contextualizar com o corte que o profissional está estudando
- Ser preciso, didático e direto

Formato das respostas:
- Máximo 3 parágrafos curtos
- Use termos técnicos corretos
- Se mencionar ângulos, seja preciso (0°, 45°, 90°, 135°)
- Sempre relacione com o corte em contexto

Nunca invente técnicas. Nunca recomende produtos. Foco 100% em geometria e execução.`;

const QUICK_QUESTIONS = [
  'Por que usar 90° neste corte?',
  'Como segurar a tesoura?',
  'O que é linha guia viajante?',
  'Como verificar o peso?',
  'Qual a diferença de projeção?',
  'Como criar camadas conectadas?',
];

export class AIProfessor {
  constructor(getCut) {
    this.getCut   = getCut;
    this.messages = [];
    this.typing   = false;
    this._init();
  }

  _init() {
    const sendBtn  = document.getElementById('ai-send');
    const input    = document.getElementById('ai-input');
    const quickEl  = document.getElementById('ai-quick-btns');

    sendBtn?.addEventListener('click', () => this._send());
    input?.addEventListener('keydown', e => { if (e.key === 'Enter') this._send(); });

    if (quickEl) {
      quickEl.innerHTML = QUICK_QUESTIONS.map(q =>
        `<button class="ai-quick" data-q="${q}">${q}</button>`
      ).join('');
      quickEl.querySelectorAll('.ai-quick').forEach(btn => {
        btn.addEventListener('click', () => {
          const inp = document.getElementById('ai-input');
          if (inp) inp.value = btn.dataset.q;
          this._send();
        });
      });
    }

    this._addMessage('ai', `Olá! Sou seu Professor de Geometria de Corte. Estou acompanhando seu estudo. O que você quer entender sobre este corte?`);
  }

  setContext(cut) {
    const ctxCut  = document.getElementById('ai-context-cut');
    const ctxStep = document.getElementById('ai-context-step');
    if (ctxCut)  ctxCut.textContent  = cut.name.toUpperCase();
    if (ctxStep) ctxStep.textContent = `${cut.elevation}° · ${cut.section} · ${cut.projection}`;
  }

  async _send() {
    const input = document.getElementById('ai-input');
    const text  = input?.value?.trim();
    if (!text || this.typing) return;
    if (input) input.value = '';

    const cut = this.getCut?.();
    this._addMessage('user', text);
    this._addTyping();

    const contextMsg = cut
      ? `Contexto atual: corte ${cut.name}, ${cut.elevation}° de elevação, seção ${cut.section}, projeção ${cut.projection}, guia ${cut.guide}. Pergunta: ${text}`
      : text;

    this.messages.push({ role: 'user', content: contextMsg });

    try {
      const res  = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-sonnet-4-6',
          max_tokens: 600,
          system:     SYSTEM_PROMPT,
          messages:   this.messages,
        })
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || '').join('') || 'Erro na resposta.';
      this.messages.push({ role: 'assistant', content: reply });
      this._removeTyping();
      this._addMessage('ai', reply);
    } catch (err) {
      this._removeTyping();
      this._addMessage('ai', 'Erro de conexão. Verifique sua internet e tente novamente.');
    }
  }

  _addMessage(role, text) {
    const msgs = document.getElementById('ai-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = `ai-msg ${role}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  _addTyping() {
    this.typing = true;
    const msgs = document.getElementById('ai-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'ai-msg ai typing';
    div.id = 'ai-typing';
    div.innerHTML = '<span class="spinner"></span>Professor digitando...';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  _removeTyping() {
    this.typing = false;
    document.getElementById('ai-typing')?.remove();
  }
}
