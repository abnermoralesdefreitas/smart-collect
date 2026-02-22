function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function round(n) {
  return Math.round(n);
}

export function calcularEstrategia({
  diasEmAtraso,
  valor,
  reincidente = false,
  historico = "bom", // bom | medio | ruim
  tentativas = 0, // número de tentativas anteriores
}) {
  // Base
  let score = 35;

  // Atraso (pesa bastante)
  if (diasEmAtraso >= 3) score += 8;
  if (diasEmAtraso >= 8) score += 12;
  if (diasEmAtraso >= 15) score += 12;
  if (diasEmAtraso >= 30) score += 18;
  if (diasEmAtraso >= 60) score += 15;

  // Valor (ROI)
  if (valor >= 300) score += 6;
  if (valor >= 1000) score += 10;
  if (valor >= 5000) score += 12;
  if (valor >= 10000) score += 10;

  // Perfil
  if (reincidente) score += 12;

  // Histórico
  if (historico === "medio") score += 6;
  if (historico === "ruim") score += 12;

  // Tentativas (muitas tentativas = mais difícil)
  score -= tentativas * 3;

  score = clamp(score, 0, 100);

  // Prioridade
  let prioridade = "Baixa";
  if (score >= 85) prioridade = "Crítica";
  else if (score >= 70) prioridade = "Alta";
  else if (score >= 55) prioridade = "Média";

  // Canal recomendado
  let canal = "WhatsApp";
  if (prioridade === "Média") canal = "WhatsApp + Ligação";
  if (prioridade === "Alta") canal = "Ligação + WhatsApp";
  if (prioridade === "Crítica") canal = "Ligação Direta";

  // Tom
  let tom = "Leve e amigável";
  if (prioridade === "Média") tom = "Direto e objetivo";
  if (prioridade === "Alta") tom = "Firme, sem agressividade";
  if (prioridade === "Crítica") tom = "Firme e urgente";

  // Probabilidade (bem simples, mas plausível)
  const probabilidade = clamp(round(score * 0.9 + 10), 5, 95);

  // Mensagem sugerida
  const valorBR = valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const mensagem = (nome = "Olá") => {
    if (prioridade === "Baixa") {
      return `Oi, ${nome}! Tudo bem? Notei um pagamento pendente de ${valorBR}. Posso te ajudar a regularizar hoje?`;
    }
    if (prioridade === "Média") {
      return `Olá, ${nome}. Consta em aberto o valor de ${valorBR}. Consegue me confirmar uma previsão de pagamento ainda hoje?`;
    }
    if (prioridade === "Alta") {
      return `${nome}, bom dia. Precisamos regularizar o pendente de ${valorBR} para evitar impactos no cadastro/serviço. Qual melhor horário para concluir hoje?`;
    }
    return `${nome}, boa tarde. Seu pendente de ${valorBR} está com atraso elevado. Precisamos de uma confirmação imediata de pagamento ou negociação agora.`;
  };

  return {
    score,
    prioridade,
    canal,
    tom,
    probabilidade,
    mensagem,
  };
}
