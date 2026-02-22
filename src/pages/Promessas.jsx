import { useEffect, useMemo, useState } from "react";
import {
  classifyPromise,
  flattenPromises,
  moneyBRL,
  startOfToday,
  parseISODate,
  dayDiff,
} from "../utils/promiseUtils";
import { addAudit, loadPortfolio, savePortfolio, updatePortfolioById } from "../utils/storage";
import PromiseModal from "../components/PromiseModal";

function Pill({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
    red: "bg-red-100 text-red-700 dark:bg-red-900/25 dark:text-red-200",
    yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/25 dark:text-yellow-200",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/25 dark:text-blue-200",
    green: "bg-green-100 text-green-700 dark:bg-green-900/25 dark:text-green-200",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/25 dark:text-purple-200",
  };
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function getTone(kind) {
  if (kind === "ATRASADA") return "red";
  if (kind === "HOJE") return "yellow";
  if (kind === "AMANHA") return "blue";
  if (kind === "SEMANA") return "purple";
  if (kind === "PAGA") return "green";
  return "gray";
}

function Promessas() {
  const [portfolio, setPortfolio] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // edição
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null); // promise flat

  useEffect(() => {
    setPortfolio(loadPortfolio() || []);
  }, []);

  const allPromises = useMemo(() => {
    const flat = flattenPromises(portfolio);
    const withKind = flat.map((p) => ({
      ...p,
      kind: classifyPromise(p),
    }));

    // ordenação: atrasadas primeiro, depois hoje, amanhã...
    const order = { ATRASADA: 0, HOJE: 1, AMANHA: 2, SEMANA: 3, FUTURA: 4, PAGA: 5, CANCELADA: 6 };
    withKind.sort((a, b) => {
      const oa = order[a.kind] ?? 99;
      const ob = order[b.kind] ?? 99;
      if (oa !== ob) return oa - ob;
      return String(a.dataPrometida).localeCompare(String(b.dataPrometida));
    });

    return withKind;
  }, [portfolio]);

  const summary = useMemo(() => {
    const s = {
      atrasadas: 0, hoje: 0, amanha: 0, semana: 0, futuras: 0, pagas: 0,
      valorSemana: 0,
    };

    const today = startOfToday();

    for (const p of allPromises) {
      if (p.kind === "ATRASADA") s.atrasadas += 1;
      if (p.kind === "HOJE") s.hoje += 1;
      if (p.kind === "AMANHA") s.amanha += 1;
      if (p.kind === "SEMANA") s.semana += 1;
      if (p.kind === "FUTURA") s.futuras += 1;
      if (p.kind === "PAGA") s.pagas += 1;

      const due = parseISODate(p.dataPrometida);
      const diff = dayDiff(today, due);
      if (p.status !== "PAGA" && diff >= 0 && diff <= 7) {
        s.valorSemana += Number(p.valorPrometido || 0);
      }
    }
    return s;
  }, [allPromises]);

  function persist(updatedPortfolio) {
    setPortfolio(updatedPortfolio);
    savePortfolio(updatedPortfolio);
  }

  function createPromise({ clienteId, valorPrometido, dataPrometida, canal, obs }) {
    const promise = {
      id: crypto?.randomUUID?.() || String(Date.now()) + Math.random(),
      status: "ABERTA", // ABERTA | PAGA | CANCELADA
      valorPrometido,
      dataPrometida,
      canal,
      obs: obs || "",
      createdAt: new Date().toISOString(),
    };

    const updated = updatePortfolioById(clienteId, (r) => {
      const arr = Array.isArray(r.promessas) ? r.promessas : [];
      return { ...r, promessas: [promise, ...arr] };
    });

    addAudit({
      type: "PROMESSA_CRIADA",
      actor: "user",
      message: `Promessa criada (${moneyBRL(valorPrometido)}) para ${dataPrometida}.`,
    });

    persist(updated);
    setModalOpen(false);
  }

  function markPaid(p) {
    const updated = updatePortfolioById(p.clienteId, (r) => {
      const arr = Array.isArray(r.promessas) ? r.promessas : [];
      const next = arr.map((x) => (x.id === p.id ? { ...x, status: "PAGA", paidAt: new Date().toISOString() } : x));
      return { ...r, promessas: next };
    });

    addAudit({
      type: "PROMESSA_PAGA",
      actor: "user",
      message: `Promessa marcada como paga (${moneyBRL(p.valorPrometido)}) — ${p.clienteNome}.`,
    });

    persist(updated);
  }

  function cancelPromise(p) {
    const updated = updatePortfolioById(p.clienteId, (r) => {
      const arr = Array.isArray(r.promessas) ? r.promessas : [];
      const next = arr.map((x) => (x.id === p.id ? { ...x, status: "CANCELADA" } : x));
      return { ...r, promessas: next };
    });

    addAudit({
      type: "PROMESSA_CANCELADA",
      actor: "user",
      message: `Promessa cancelada (${moneyBRL(p.valorPrometido)}) — ${p.clienteNome}.`,
    });

    persist(updated);
  }

  function openEdit(p) {
    setEditing(p);
    setEditOpen(true);
  }

  function saveEdit(payload) {
    const p = editing;
    if (!p) return;

    const updated = updatePortfolioById(p.clienteId, (r) => {
      const arr = Array.isArray(r.promessas) ? r.promessas : [];
      const next = arr.map((x) =>
        x.id === p.id
          ? {
              ...x,
              valorPrometido: payload.valorPrometido,
              dataPrometida: payload.dataPrometida,
              canal: payload.canal,
              obs: payload.obs || "",
            }
          : x
      );
      return { ...r, promessas: next };
    });

    addAudit({
      type: "PROMESSA_EDITADA",
      actor: "user",
      message: `Promessa editada — ${p.clienteNome} (${moneyBRL(payload.valorPrometido)}) para ${payload.dataPrometida}.`,
    });

    persist(updated);
    setEditOpen(false);
    setEditing(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Promessas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acompanhamento de promessas de pagamento (PDP) — visão de gestor e execução.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          + Criar promessa
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Atrasadas</div>
          <div className="text-2xl font-extrabold text-red-600">{summary.atrasadas}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Vencem hoje</div>
          <div className="text-2xl font-extrabold text-yellow-600">{summary.hoje}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Amanhã</div>
          <div className="text-2xl font-extrabold text-blue-600">{summary.amanha}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Próx. 7 dias</div>
          <div className="text-2xl font-extrabold text-purple-600">{summary.semana}</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Valor 7 dias</div>
          <div className="text-xl font-extrabold text-gray-900 dark:text-white">
            {moneyBRL(summary.valorSemana)}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-xs text-gray-500 dark:text-gray-400">Pagas</div>
          <div className="text-2xl font-extrabold text-green-600">{summary.pagas}</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="font-semibold text-gray-900 dark:text-white">
            Lista de promessas
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Total: <span className="font-semibold">{allPromises.length}</span>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-950/40">
              <tr className="text-left">
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Vencimento</th>
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Cliente</th>
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Operador</th>
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Valor prometido</th>
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Canal</th>
                <th className="px-4 py-3 text-gray-600 dark:text-gray-300">Ações</th>
              </tr>
            </thead>

            <tbody>
              {allPromises.map((p) => (
                <tr key={`${p.clienteId}-${p.id}`} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-3">
                    <Pill tone={getTone(p.kind)}>
                      {p.kind === "ATRASADA" ? "Atrasada" :
                       p.kind === "HOJE" ? "Hoje" :
                       p.kind === "AMANHA" ? "Amanhã" :
                       p.kind === "SEMANA" ? "Esta semana" :
                       p.kind === "PAGA" ? "Paga" :
                       p.kind === "CANCELADA" ? "Cancelada" : "Futura"}
                    </Pill>
                  </td>

                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                    {p.dataPrometida}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 dark:text-white">{p.clienteNome}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {p.statusCliente} • {p.diasAtraso}d atraso • {moneyBRL(p.valorAtraso)}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{p.operador}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                    {moneyBRL(p.valorPrometido)}
                  </td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{p.canal || "—"}</td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-xs"
                      >
                        Reagendar
                      </button>

                      <button
                        onClick={() => markPaid(p)}
                        disabled={p.status === "PAGA"}
                        className="px-3 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition text-xs disabled:opacity-50"
                      >
                        Marcar paga
                      </button>

                      <button
                        onClick={() => cancelPromise(p)}
                        disabled={p.status === "CANCELADA" || p.status === "PAGA"}
                        className="px-3 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition text-xs disabled:opacity-50 dark:bg-white dark:text-gray-900"
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {allPromises.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma promessa cadastrada ainda. Clique em <b>+ Criar promessa</b>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PromiseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        mode="create"
        portfolioRows={portfolio}
        onSave={createPromise}
      />

      <PromiseModal
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditing(null); }}
        mode="edit"
        portfolioRows={portfolio}
        initialClienteId={editing?.clienteId}
        initialPromise={editing}
        onSave={saveEdit}
      />
    </div>
  );
}

export default Promessas;
