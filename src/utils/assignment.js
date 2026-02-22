import { calcularEstrategia } from "./strategy";

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Distribui casos por score (maior primeiro) respeitando capacidade por operador.
// Estratégia: round-robin ponderado por capacidade.
export function distribuirCarteira(rows, operatorsConfig) {
  const ops = operatorsConfig.map((op) => ({
    ...op,
    assigned: [],
    used: 0,
    totalValor: 0,
    totalScore: 0,
    criticos: 0,
    slaRisco: 0, // casos com SLA estourado
  }));

  // Enriquecer com score/prioridade/canal/tom etc.
  const enriched = rows.map((r) => {
    const est = calcularEstrategia({
      diasEmAtraso: r.dias,
      valor: r.valor,
      reincidente: r.reincidente,
      historico: r.historico,
      tentativas: r.tentativas,
    });

    const primeiroNome = r.nome.split(" ")[0];

    return {
      ...r,
      score: est.score,
      prioridade: est.prioridade,
      canal: est.canal,
      tom: est.tom,
      probabilidade: est.probabilidade,
      mensagem: est.mensagem(primeiroNome),
      // SLA: se não tiver, cria um plausível (dias desde último contato)
      semContatoDias:
        typeof r.semContatoDias === "number"
          ? r.semContatoDias
          : clamp(Math.round(r.dias / 2) + r.tentativas, 0, 45),
    };
  });

  // Ordenar por score desc (priorização real)
  enriched.sort((a, b) => b.score - a.score);

  // índice do operador para round-robin
  let idx = 0;

  for (const caseItem of enriched) {
    // encontrar próximo operador com capacidade
    let tries = 0;
    while (tries < ops.length && ops[idx].used >= ops[idx].capacity) {
      idx = (idx + 1) % ops.length;
      tries++;
    }

    // se todos estiverem lotados, joga no operador com menor carga
    let target = ops[idx];
    if (tries >= ops.length) {
      target = ops.reduce((best, cur) => (cur.used < best.used ? cur : best), ops[0]);
    }

    target.assigned.push({ ...caseItem, operador: target.name });
    target.used += 1;
    target.totalValor += caseItem.valor;
    target.totalScore += caseItem.score;
    if (caseItem.prioridade === "Crítica") target.criticos += 1;

    // SLA risco: sem contato > 7 dias OU caso crítico sem contato > 3
    const slaRisco =
      caseItem.semContatoDias > 7 || (caseItem.prioridade === "Crítica" && caseItem.semContatoDias > 3);
    if (slaRisco) target.slaRisco += 1;

    // próximo operador
    idx = (idx + 1) % ops.length;
  }

  // Achatar rows distribuídos
  const distributedRows = ops.flatMap((o) => o.assigned);

  // Métricas por operador
  const operatorStats = ops.map((o) => ({
    name: o.name,
    capacity: o.capacity,
    assignedCount: o.used,
    totalValor: o.totalValor,
    scoreMedio: o.used ? Math.round(o.totalScore / o.used) : 0,
    criticos: o.criticos,
    slaRisco: o.slaRisco,
    metaValor: o.metaValor,
  }));

  // KPIs globais
  const totalValor = distributedRows.reduce((acc, r) => acc + r.valor, 0);
  const totalCriticos = distributedRows.filter((r) => r.prioridade === "Crítica").length;
  const slaRiscoTotal = distributedRows.filter(
    (r) => r.semContatoDias > 7 || (r.prioridade === "Crítica" && r.semContatoDias > 3)
  ).length;

  // “Recuperação estimada” (demo): valor * probabilidade
  const recuperacaoEstimada = distributedRows.reduce((acc, r) => {
    const p = (r.probabilidade ?? 50) / 100;
    return acc + r.valor * p;
  }, 0);

  return {
    distributedRows,
    operatorStats,
    kpis: {
      totalValor,
      totalCriticos,
      slaRiscoTotal,
      recuperacaoEstimada,
    },
  };
}
