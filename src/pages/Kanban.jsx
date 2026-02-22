import { useEffect, useMemo, useState } from "react";
import { loadPortfolio, savePortfolio, addAudit } from "../utils/storage";
import { calcularEstrategia } from "../utils/strategy";
import ClientDrawer from "../components/ClientDrawer";

const STATUSES = ["Em aberto", "Negociação", "Promessa", "Pago", "Sem contato"];

function enrich(rows) {
  return rows.map((r) => {
    const est = calcularEstrategia({
      diasEmAtraso: r.dias,
      valor: r.valor,
      reincidente: r.reincidente,
      historico: r.historico,
      tentativas: r.tentativas,
    });
    return {
      ...r,
      prioridade: est.prioridade,
      score: est.score,
      canal: est.canal,
      tom: est.tom,
      probabilidade: est.probabilidade,
      historicoContatos: r.historicoContatos || [],
      status: r.status || "Em aberto",
      semContatoDias: typeof r.semContatoDias === "number" ? r.semContatoDias : 0,
    };
  });
}

function Kanban() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const saved = loadPortfolio() || [];
    setRows(saved);
  }, []);

  const items = useMemo(() => enrich(rows), [rows]);

  const byStatus = useMemo(() => {
    const map = {};
    STATUSES.forEach((s) => (map[s] = []));
    for (const r of items) {
      const s = STATUSES.includes(r.status) ? r.status : "Em aberto";
      map[s].push(r);
    }
    // Ordena por score nas colunas
    for (const s of STATUSES) map[s].sort((a, b) => (b.score || 0) - (a.score || 0));
    return map;
  }, [items]);

  function persist(updated) {
    setRows(updated);
    savePortfolio(updated);
  }

  function onDragStart(e, id) {
    e.dataTransfer.setData("text/plain", String(id));
  }

  function onDropStatus(e, status) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const current = items.find((x) => x.id === id);
    if (!current) return;

    const updated = rows.map((r) => (r.id === id ? { ...r, status } : r));
    persist(updated);

    addAudit({
      type: "STATUS",
      actor: "user",
      message: `Status de "${current.nome}" alterado para "${status}".`,
    });
  }

  function onRegisterContact(id, contato) {
    const current = items.find((x) => x.id === id);
    const updated = rows.map((r) => {
      if (r.id !== id) return r;
      return {
        ...r,
        semContatoDias: 0,
        tentativas: (r.tentativas || 0) + 1,
        historicoContatos: [...(r.historicoContatos || []), contato],
      };
    });

    persist(updated);
    addAudit({
      type: "CONTATO",
      actor: "user",
      message: `Contato registrado em "${current?.nome}" via ${contato.canal}.`,
    });
  }

  function onChangeStatus(id, status) {
    const current = items.find((x) => x.id === id);
    const updated = rows.map((r) => (r.id === id ? { ...r, status } : r));
    persist(updated);
    addAudit({
      type: "STATUS",
      actor: "user",
      message: `Status de "${current?.nome}" alterado para "${status}".`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Kanban</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Arraste os clientes entre colunas para mudar o status (salva automaticamente).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {STATUSES.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDropStatus(e, status)}
          >
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="font-semibold text-gray-900 dark:text-white">{status}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {byStatus[status]?.length || 0} itens
              </div>
            </div>

            <div className="p-3 space-y-3">
              {(byStatus[status] || []).map((r) => (
                <div
                  key={r.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, r.id)}
                  onClick={() => setSelected(r)}
                  className="cursor-pointer p-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition
                    dark:border-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  <div className="font-semibold text-gray-900 dark:text-white truncate">{r.nome}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Score {r.score} • {r.prioridade} • {r.semContatoDias ?? 0}d sem contato
                  </div>
                </div>
              ))}

              {(byStatus[status] || []).length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Solte itens aqui…
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ClientDrawer
        client={selected}
        onClose={() => setSelected(null)}
        onRegisterContact={onRegisterContact}
        onChangeStatus={onChangeStatus}
      />
    </div>
  );
}

export default Kanban;
