const KEY_PORTFOLIO = "portfolio_data";
const KEY_AUDIT = "audit_log";
const KEY_SETTINGS = "smartcollect_settings";
const KEY_MAPPING = "smartcollect_mapping_default";

export function savePortfolio(rows) {
  localStorage.setItem(KEY_PORTFOLIO, JSON.stringify(rows));
}
export function loadPortfolio() {
  const data = localStorage.getItem(KEY_PORTFOLIO);
  return data ? JSON.parse(data) : null;
}

// Atualiza 1 cliente pelo id (helper pra promessas / contatos)
export function updatePortfolioById(id, updaterFn) {
  const current = loadPortfolio() || [];
  const updated = current.map((r) => {
    if (String(r.id) !== String(id)) return r;
    return updaterFn({ ...r });
  });
  savePortfolio(updated);
  return updated;
}

// ======================
// AUDITORIA
// ======================
export function addAudit(event) {
  const list = loadAudit();
  const enriched = {
    id: crypto?.randomUUID?.() || String(Date.now()) + Math.random(),
    ts: new Date().toISOString(),
    ...event,
  };
  const updated = [enriched, ...list].slice(0, 600);
  localStorage.setItem(KEY_AUDIT, JSON.stringify(updated));
  return updated;
}
export function loadAudit() {
  const data = localStorage.getItem(KEY_AUDIT);
  return data ? JSON.parse(data) : [];
}
export function clearAudit() {
  localStorage.removeItem(KEY_AUDIT);
}

// ======================
// SETTINGS
// ======================
export function defaultSettings() {
  return {
    sla: { riskDays: 7, criticalRiskDays: 3 },
    templates: {
      WhatsApp: {
        Crítica:
          "Olá {nome}, aqui é do time financeiro. Identificamos uma pendência de {valor} com {dias} dias em atraso. Podemos resolver agora?",
        Alta:
          "Oi {nome}! Seu pagamento de {valor} está em atraso há {dias} dias. Quer opções de pagamento?",
        Média:
          "Olá {nome}, lembrete da pendência de {valor}. Posso enviar segunda via?",
        Baixa:
          "Oi {nome}! Lembrete gentil sobre {valor}. Se precisar, envio a segunda via 🙂",
      },
      Email: {
        Crítica: "Assunto: Regularização urgente — {nome}\n\nOlá {nome}, ...",
        Alta: "Assunto: Pendência em aberto — {nome}\n\nOlá {nome}, ...",
        Média: "Assunto: Lembrete de pendência — {nome}\n\nOlá {nome}, ...",
        Baixa: "Assunto: Lembrete — {nome}\n\nOlá {nome}, ...",
      },
      Telefone: {
        Crítica: "Roteiro: confirmar identificação + propor acordo imediato.",
        Alta: "Roteiro: entender motivo + oferecer opções.",
        Média: "Roteiro: lembrete + segunda via.",
        Baixa: "Roteiro: lembrete cordial.",
      },
    },
  };
}

export function loadSettings() {
  const raw = localStorage.getItem(KEY_SETTINGS);
  if (!raw) return defaultSettings();
  try {
    const parsed = JSON.parse(raw);
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}
export function saveSettings(settings) {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

// ======================
// MAPEAMENTO PADRÃO (IMPORT)
// ======================
export function saveDefaultMapping(mapping) {
  localStorage.setItem(KEY_MAPPING, JSON.stringify(mapping));
}
export function loadDefaultMapping() {
  const raw = localStorage.getItem(KEY_MAPPING);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function clearDefaultMapping() {
  localStorage.removeItem(KEY_MAPPING);
}
