function moneyBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function Progress({ value, max }) {
  const pct = max > 0 ? clamp(Math.round((value / max) * 100), 0, 100) : 0;

  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{pct}%</div>
    </div>
  );
}

function OperatorGoals({ rows, goals }) {
  const todayStr = new Date().toDateString();

  const stats = goals.map((g) => {
    const my = rows.filter((r) => (r.operador || "") === g.name);

    const valor = my.reduce((acc, r) => acc + (r.valor || 0), 0);

    const contatosHoje = my.reduce((acc, r) => {
      const contatos = r.historicoContatos || [];
      const qtd = contatos.filter((c) => new Date(c.data).toDateString() === todayStr).length;
      return acc + qtd;
    }, 0);

    const slaRisco = my.filter(
      (r) => (r.semContatoDias ?? 0) > 7 || (r.prioridade === "Crítica" && (r.semContatoDias ?? 0) > 3)
    ).length;

    return {
      name: g.name,
      valor,
      metaValor: g.metaValor,
      metaContatosDia: g.metaContatosDia,
      contatosHoje,
      slaRisco,
      clientes: my.length,
    };
  });

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md
      dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🎯 Metas por Operador
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Progresso de carteira + contatos do dia + SLA em risco
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {stats.map((s) => (
          <div
            key={s.name}
            className="p-4 rounded-xl border border-gray-200 bg-gray-50
              dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {s.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Clientes: {s.clientes} • Contatos hoje:{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {s.contatosHoje}/{s.metaContatosDia}
                  </span>{" "}
                  • SLA risco:{" "}
                  <span className="font-semibold text-red-600">
                    {s.slaRisco}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-500 dark:text-gray-400">Carteira</div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {moneyBRL(s.valor)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Meta: {moneyBRL(s.metaValor)}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <Progress value={s.valor} max={s.metaValor} />
            </div>

            <div className="mt-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Contatos do dia
              </div>
              <Progress value={s.contatosHoje} max={s.metaContatosDia} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OperatorGoals;

