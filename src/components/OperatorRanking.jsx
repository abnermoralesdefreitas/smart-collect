function OperatorRanking({ rows }) {
  const operators = {};

  rows.forEach((r) => {
    const name = r.operador || "Sem operador";
    if (!operators[name]) {
      operators[name] = { totalValor: 0, totalScore: 0, qtd: 0 };
    }
    operators[name].totalValor += r.valor;
    operators[name].totalScore += r.score;
    operators[name].qtd += 1;
  });

  const ranking = Object.entries(operators)
    .map(([nome, data]) => ({
      nome,
      totalValor: data.totalValor,
      scoreMedio: Math.round(data.totalScore / data.qtd),
      qtd: data.qtd,
    }))
    .sort((a, b) => b.totalValor - a.totalValor);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800 p-6">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Ranking de Operadores
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ordenado por maior valor em carteira
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ranking.map((op, index) => (
          <div
            key={op.nome}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800"
          >
            <div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">
                {index + 1}º • {op.nome}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {op.qtd} clientes • Score médio: {op.scoreMedio}
              </div>
            </div>

            <div className="font-bold text-gray-900 dark:text-gray-100">
              {op.totalValor.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OperatorRanking;
