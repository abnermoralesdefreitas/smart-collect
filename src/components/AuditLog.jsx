function AuditLog({ items, onClear }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md
      dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🧾 Auditoria</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Registro de ações do sistema (contato, status, import, etc.)
          </p>
        </div>
        <button
          onClick={onClear}
          className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        >
          Limpar log
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Sem eventos ainda.</div>
        ) : (
          items.slice(0, 80).map((e) => (
            <div
              key={e.id}
              className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(e.ts).toLocaleString("pt-BR")} • {e.type} • {e.actor || "sistema"}
              </div>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {e.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AuditLog;
