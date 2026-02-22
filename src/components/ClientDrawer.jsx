import ContactModal from "./ContactModal";
import { useState } from "react";

function Badge({ value }) {
  const colors = {
    Crítica: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200",
    Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200",
    Média: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    Baixa: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-200",
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[value] || ""}`}>
      {value}
    </span>
  );
}

function ClientDrawer({ client, onClose, onRegisterContact, onChangeStatus }) {
  const [showContact, setShowContact] = useState(false);

  if (!client) return null;

  const history = [...(client.historicoContatos || [])].slice().reverse();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Detalhe do Cliente</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{client.nome}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">{client.cpf || "—"}</div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
          >
            Fechar
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Status</div>
            <div className="font-semibold text-gray-900 dark:text-white">{client.status}</div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Prioridade</div>
            <div className="mt-1"><Badge value={client.prioridade} /></div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Valor</div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {(client.valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">SLA (dias sem contato)</div>
            <div className="font-semibold text-gray-900 dark:text-white">{client.semContatoDias ?? 0}d</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setShowContact(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Registrar contato
          </button>

          {["Em aberto", "Negociação", "Promessa", "Pago", "Sem contato"].map((s) => (
            <button
              key={s}
              onClick={() => onChangeStatus(client.id, s)}
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-7">
          <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Timeline
          </div>

          {history.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Nenhum contato registrado ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(c.data).toLocaleString("pt-BR")} • {c.canal}
                  </div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{c.obs}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showContact && (
          <ContactModal
            cliente={client}
            onClose={() => setShowContact(false)}
            onSave={(contato) => onRegisterContact(client.id, contato)}
          />
        )}
      </div>
    </div>
  );
}

export default ClientDrawer;
