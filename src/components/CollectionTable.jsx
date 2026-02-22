import { useMemo, useState } from "react";
import { calcularEstrategia } from "../utils/strategy";
import ContactModal from "./ContactModal";

function moneyBRL(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Badge({ value }) {
  const colors = {
    Crítica: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    Alta: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    Média: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200",
    Baixa: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${
        colors[value] ||
        "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
      }`}
    >
      {value}
    </span>
  );
}

function SlaBadge({ dias, prioridade }) {
  const risco = dias > 7 || (prioridade === "Crítica" && dias > 3);

  return risco ? (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
      SLA risco • {dias}d
    </span>
  ) : (
    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
      SLA ok • {dias}d
    </span>
  );
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("Mensagem copiada ✅");
  } catch {
    alert("Não consegui copiar. Copie manualmente.");
  }
}

function downloadCSV(filename, rows) {
  const headers = [
    "id",
    "nome",
    "cpf",
    "dias",
    "valor",
    "prioridade",
    "score",
    "probabilidade",
    "canal",
    "tom",
    "status",
    "operador",
    "semContatoDias",
    "mensagem",
  ];

  const escape = (v) => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replaceAll('"', '""')}"`;
    }
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val =
            h === "valor"
              ? Number(r.valor || 0).toFixed(2)
              : h === "mensagem"
              ? (r.mensagem || "").replace(/\s+/g, " ").trim()
              : r[h];
          return escape(val);
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function CollectionTable({
  rows = [],
  isLoading = false,
  onRowsChange, // ✅ para atualizar/persistir na página
}) {
  const [search, setSearch] = useState("");
  const [prioridadeFiltro, setPrioridadeFiltro] = useState("Todas");
  const [selected, setSelected] = useState(null);
  const [openTimelineId, setOpenTimelineId] = useState(null);

  const enrichedFiltered = useMemo(() => {
    const s = search.trim().toLowerCase();

    const enriched = rows.map((r) => {
      const est = calcularEstrategia({
        diasEmAtraso: r.dias,
        valor: r.valor,
        reincidente: r.reincidente,
        historico: r.historico,
        tentativas: r.tentativas,
      });

      const primeiroNome = (r.nome || "Cliente").split(" ")[0];
      const mensagem =
        typeof est?.mensagem === "function"
          ? est.mensagem(primeiroNome)
          : r.mensagem || "";

      return {
        ...r,
        score: est.score,
        prioridade: est.prioridade,
        canal: est.canal,
        tom: est.tom,
        probabilidade: est.probabilidade,
        mensagem,
        semContatoDias:
          typeof r.semContatoDias === "number"
            ? r.semContatoDias
            : Math.min(45, Math.round((r.dias || 0) / 2) + (r.tentativas || 0)),
        historicoContatos: r.historicoContatos || [],
      };
    });

    return enriched
      .filter((r) =>
        prioridadeFiltro === "Todas" ? true : r.prioridade === prioridadeFiltro
      )
      .filter((r) => {
        if (!s) return true;
        return (
          (r.nome || "").toLowerCase().includes(s) ||
          (r.cpf || "").replace(/\D/g, "").includes(s.replace(/\D/g, ""))
        );
      })
      .sort((a, b) => b.score - a.score);
  }, [rows, search, prioridadeFiltro]);

  function openWhatsApp(mensagem) {
    const msg = encodeURIComponent(mensagem);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  function handleSaveContact(contato) {
    if (!selected) return;

    const updated = rows.map((r) => {
      if (r.id === selected.id) {
        return {
          ...r,
          semContatoDias: 0, // ✅ zera SLA
          tentativas: (r.tentativas || 0) + 1,
          historicoContatos: [...(r.historicoContatos || []), contato],
          status: r.status === "Sem contato" ? "Em aberto" : r.status, // ajuste leve
        };
      }
      return r;
    });

    onRowsChange?.(updated);
  }

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800">
        Carregando carteira…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros + Export */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-4 flex-1">
          <div className="flex-1">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Buscar (nome/CPF)
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ex: Mariana ou 12345678910"
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500
                dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
            />
          </div>

          <div className="w-full md:w-56">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Prioridade
            </label>
            <select
              value={prioridadeFiltro}
              onChange={(e) => setPrioridadeFiltro(e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500
                dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
            >
              <option value="Todas">Todas</option>
              <option value="Baixa">Baixa</option>
              <option value="Média">Média</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => downloadCSV("carteira_smart_collect.csv", enrichedFiltered)}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Exportar CSV
        </button>
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Carteira (Priorizada + Mensagens + SLA + Timeline)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ordenado por maior Score • {enrichedFiltered.length} registros
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-950/40">
              <tr className="text-left text-gray-600 dark:text-gray-400">
                <th className="px-6 py-3 font-semibold">Cliente</th>
                <th className="px-6 py-3 font-semibold">Atraso</th>
                <th className="px-6 py-3 font-semibold">Valor</th>
                <th className="px-6 py-3 font-semibold">SLA</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Prioridade</th>
                <th className="px-6 py-3 font-semibold">Operador</th>
                <th className="px-6 py-3 font-semibold">Ações</th>
              </tr>
            </thead>

            <tbody>
              {enrichedFiltered.map((r) => (
                <>
                  <tr
                    key={r.id}
                    className="border-t border-gray-100 hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-950/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {r.nome}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {r.cpf || "—"} • Status: {r.status || "Em aberto"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Contatos: {r.historicoContatos?.length || 0}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {r.dias} dias
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">
                      {moneyBRL(r.valor)}
                    </td>

                    <td className="px-6 py-4">
                      <SlaBadge dias={r.semContatoDias ?? 0} prioridade={r.prioridade} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-gray-100">
                        {r.score}/100
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {r.probabilidade}% • {r.canal} • {r.tom}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge value={r.prioridade} />
                    </td>

                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100">
                      {r.operador || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openWhatsApp(r.mensagem)}
                          className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                        >
                          WhatsApp
                        </button>

                        <button
                          onClick={() => copyText(r.mensagem)}
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-100 transition
                            dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                          Copiar Msg
                        </button>

                        <button
                          onClick={() => setSelected(r)}
                          className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          Registrar contato
                        </button>

                        <button
                          onClick={() =>
                            setOpenTimelineId(openTimelineId === r.id ? null : r.id)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-300 text-gray-900 hover:bg-gray-100 transition
                            dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                        >
                          {openTimelineId === r.id ? "Ocultar" : "Timeline"}
                        </button>
                      </div>

                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                        <span className="font-semibold">Sugestão:</span>{" "}
                        {r.mensagem}
                      </div>
                    </td>
                  </tr>

                  {openTimelineId === r.id && (
                    <tr className="border-t border-gray-100 dark:border-gray-800">
                      <td colSpan={8} className="px-6 py-4 bg-gray-50/60 dark:bg-gray-950/20">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          Timeline de contatos
                        </div>

                        {(!r.historicoContatos || r.historicoContatos.length === 0) ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Nenhum contato registrado ainda.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {[...r.historicoContatos].slice().reverse().map((c, idx) => (
                              <div
                                key={idx}
                                className="p-3 rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800"
                              >
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(c.data).toLocaleString("pt-BR")} • {c.canal}
                                </div>
                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                  {c.obs}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}

              {enrichedFiltered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-10 text-center text-gray-500 dark:text-gray-400"
                  >
                    Nenhum registro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ContactModal
          cliente={selected}
          onClose={() => setSelected(null)}
          onSave={handleSaveContact}
        />
      )}
    </div>
  );
}

export default CollectionTable;
