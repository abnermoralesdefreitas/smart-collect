import { initialRows } from "../data/initialRows";

/**
 * API fake: simula backend (delay, chance de variação nos dados).
 */

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchPortfolio() {
  const ms = 600 + Math.round(Math.random() * 600);
  await wait(ms);

  // Variação leve (pra parecer vivo)
  const mutated = initialRows.map((r) => {
    const jitter = (Math.random() - 0.5) * 0.06; // -3% a +3%
    const valor = Math.max(50, r.valor * (1 + jitter));

    return {
      ...r,
      valor: Math.round(valor * 100) / 100,
      semContatoDias:
        typeof r.semContatoDias === "number"
          ? Math.max(0, r.semContatoDias + (Math.random() > 0.7 ? 1 : 0))
          : 0,
    };
  });

  return mutated;
}
