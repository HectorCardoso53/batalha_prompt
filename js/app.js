// ═══════════════════════════════════════════════════
//  Configure aqui antes de usar
// ═══════════════════════════════════════════════════

export const OPENAI_KEY = localStorage.getItem("openaiKey") || "";

// Desafio padrão — o admin pode sobrescrever via Painel Admin
const _PADRAO = {
  id:           "desafio-1",
  title:        "Desafio #1",
  masterImage:  "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Sunrise_over_the_sea.jpg/1280px-Sunrise_over_the_sea.jpg",
  masterPrompt: "(secreto — só o admin vê aqui no app.js)",
  isActive:     true,
};

function _loadDesafio() {
  try {
    const saved = localStorage.getItem("desafioConfig");
    return saved ? JSON.parse(saved) : _PADRAO;
  } catch { return _PADRAO; }
}

export const DESAFIO = _loadDesafio();
