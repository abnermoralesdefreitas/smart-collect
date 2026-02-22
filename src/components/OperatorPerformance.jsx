function moneyBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-2 rounded-full bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {pct}% da meta
      </div>
    </div>
  );
}

function OperatorPerformance({ stats }) {
  const ranking = [...stats].sort((a, b) => b.totalValor - a.totalValor);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Metas & SLA por Operador
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Distribuição automática • Carteira • Score médio • SLA em risco
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {ranking.map((op, index) => (
          <div
            key={op.name}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {index + 1}º • {op.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {op.assignedCount}/{op.capacity} casos • Score médio: {op.scoreMedio} •
                  Críticos: {op.criticos} • SLA risco: {op.slaRisco}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900 dark:text-gray-100">
                  {moneyBRL(op.totalValor)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Meta: {moneyBRL(op.metaValor)}
                </div>
              </div>
            </div>

            <div className="mt-3">
              <ProgressBar value={op.totalValor} max={op.metaValor} />
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                Capacidade: {op.capacity}/dia
              </span>

              {op.slaRisco > 0 ? (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  SLA em risco ({op.slaRisco})
                </span>
              ) : (
                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  SLA ok
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OperatorPerformance;
