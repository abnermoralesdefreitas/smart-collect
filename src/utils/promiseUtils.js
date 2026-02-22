export function moneyBRL(n) {
  return (Number(n) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function toISODate(d) {
  // YYYY-MM-DD no fuso local
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(iso) {
  // cria data local 00:00
  const [y, m, d] = String(iso).split("-").map((x) => parseInt(x, 10));
  const date = new Date(y, (m || 1) - 1, d || 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfToday() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function dayDiff(a, b) {
  // b - a (dias)
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / ms);
}

// Extrai todas promessas da carteira num formato “flat”
export function flattenPromises(portfolioRows = []) {
  const list = [];
  for (const r of portfolioRows) {
    const promises = r.promessas || [];
    for (const p of promises) {
      list.push({
        ...p,
        clienteId: r.id,
        clienteNome: r.nome,
        operador: r.operador || "Sem operador",
        valorAtraso: Number(r.valor || 0),
        diasAtraso: Number(r.dias || 0),
        statusCliente: r.status || "Em aberto",
      });
    }
  }
  return list;
}

export function classifyPromise(p) {
  const today = startOfToday();
  const due = parseISODate(p.dataPrometida);

  const diff = dayDiff(today, due); // due - today
  // diff < 0 -> atrasada
  if (p.status === "PAGA") return "PAGA";
  if (p.status === "CANCELADA") return "CANCELADA";
  if (diff < 0) return "ATRASADA";
  if (diff === 0) return "HOJE";
  if (diff === 1) return "AMANHA";
  if (diff <= 7) return "SEMANA";
  return "FUTURA";
}
