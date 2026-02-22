function SkeletonRow() {
  return (
    <tr className="border-t border-gray-100 dark:border-gray-800">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function SkeletonTable({ rows = 6 }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-lg dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="h-5 w-60 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="mt-2 h-4 w-72 rounded bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-950/40">
            <tr className="text-left text-gray-600 dark:text-gray-400">
              {["Cliente", "Atraso", "Valor", "SLA", "Score", "Prioridade", "Operador", "Ações"].map(
                (h) => (
                  <th key={h} className="px-6 py-3 font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SkeletonTable;
