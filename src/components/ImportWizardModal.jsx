import { useEffect, useMemo, useState } from "react";
import {
  inferMapping,
  normalizeRowsWithMapping,
  validateRows,
} from "../utils/importer";
import { loadDefaultMapping, saveDefaultMapping, addAudit } from "../utils/storage";

function FieldSelect({ label, headers, value, onChange }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
          dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
      >
        <option value="">— Não mapear —</option>
        {headers.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
    </div>
  );
}

function ImportWizardModal({
  open,
  fileName,
  sheets,
  selectedSheet,
  onSelectSheet,
  rawRows,
  headers,
  onClose,
  onImport,
}) {
  const [mapping, setMapping] = useState(inferMapping(headers));
  const [onlyValid, setOnlyValid] = useState(true);

  useEffect(() => {
    setMapping(inferMapping(headers));
  }, [headers]);

  // trava scroll do body quando modal abre
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const previewRows = useMemo(() => rawRows.slice(0, 8), [rawRows]);

  const normalized = useMemo(() => {
    return normalizeRowsWithMapping(rawRows, mapping);
  }, [rawRows, mapping]);

  const validation = useMemo(() => validateRows(normalized), [normalized]);

  if (!open) return null;

  function useSavedMapping() {
    const saved = loadDefaultMapping();
    if (saved) {
      setMapping((m) => ({ ...m, ...saved }));
      addAudit({ type: "IMPORT_MAPPING", actor: "user", message: "Mapeamento padrão aplicado." });
      alert("Mapeamento padrão aplicado ✅");
    } else {
      alert("Não há mapeamento salvo ainda.");
    }
  }

  function saveAsDefault() {
    saveDefaultMapping(mapping);
    addAudit({ type: "IMPORT_MAPPING", actor: "user", message: "Mapeamento salvo como padrão." });
    alert("Mapeamento salvo como padrão ✅");
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* container central */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        {/* modal */}
        <div
          className="w-full max-w-6xl rounded-3xl border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950 shadow-2xl overflow-hidden"
          style={{
            // altura máxima real da viewport (evita “modal gigante”)
            maxHeight: "92vh",
          }}
        >
          {/* HEADER FIXO */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Importação Profissional
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Arquivo: <span className="font-semibold">{fileName}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              >
                Fechar
              </button>
            </div>

            <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">Aba:</div>
                <select
                  value={selectedSheet}
                  onChange={(e) => onSelectSheet(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
                    dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
                >
                  {sheets.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={useSavedMapping}
                  className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
                >
                  Usar mapeamento salvo
                </button>
                <button
                  onClick={saveAsDefault}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition dark:bg-white dark:text-gray-900"
                >
                  Salvar mapeamento padrão
                </button>
              </div>
            </div>
          </div>

          {/* CONTEÚDO COM SCROLL */}
          <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(92vh - 130px)" }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Preview */}
              <div className="lg:col-span-2 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <div className="font-semibold text-gray-900 dark:text-white mb-2">
                  Preview (primeiras linhas)
                </div>

                {/* tabela com scroll próprio */}
                <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
                  <div className="overflow-auto" style={{ maxHeight: 320 }}>
                    <table className="min-w-full text-xs">
                      <thead className="sticky top-0 bg-gray-100 dark:bg-gray-900">
                        <tr>
                          {headers.slice(0, 10).map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-gray-600 dark:text-gray-300 whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((r, idx) => (
                          <tr key={idx} className="border-t border-gray-100 dark:border-gray-800">
                            {headers.slice(0, 10).map((h) => (
                              <td
                                key={h}
                                className="px-3 py-2 text-gray-900 dark:text-gray-100 whitespace-nowrap"
                              >
                                {String(r?.[h] ?? "")}
                              </td>
                            ))}
                          </tr>
                        ))}

                        {previewRows.length === 0 && (
                          <tr>
                            <td className="px-3 py-6 text-gray-500 dark:text-gray-400" colSpan={10}>
                              Nenhuma linha encontrada.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Mostrando até <b>10 colunas</b> no preview. (Mas o mapeamento acessa todas.)
                </div>
              </div>

              {/* Mapping + Validação */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                <div className="font-semibold text-gray-900 dark:text-white mb-3">
                  Mapeamento de colunas
                </div>

                {/* grid rolável se necessário */}
                <div className="space-y-3">
                  <FieldSelect label="Nome" headers={headers} value={mapping.nome} onChange={(v) => setMapping((m) => ({ ...m, nome: v }))} />
                  <FieldSelect label="CPF/CNPJ" headers={headers} value={mapping.cpf} onChange={(v) => setMapping((m) => ({ ...m, cpf: v }))} />
                  <FieldSelect label="Dias em atraso" headers={headers} value={mapping.dias} onChange={(v) => setMapping((m) => ({ ...m, dias: v }))} />
                  <FieldSelect label="Valor" headers={headers} value={mapping.valor} onChange={(v) => setMapping((m) => ({ ...m, valor: v }))} />
                  <FieldSelect label="Histórico" headers={headers} value={mapping.historico} onChange={(v) => setMapping((m) => ({ ...m, historico: v }))} />
                  <FieldSelect label="Reincidente" headers={headers} value={mapping.reincidente} onChange={(v) => setMapping((m) => ({ ...m, reincidente: v }))} />
                  <FieldSelect label="Tentativas" headers={headers} value={mapping.tentativas} onChange={(v) => setMapping((m) => ({ ...m, tentativas: v }))} />
                  <FieldSelect label="Status" headers={headers} value={mapping.status} onChange={(v) => setMapping((m) => ({ ...m, status: v }))} />
                  <FieldSelect label="Operador" headers={headers} value={mapping.operador} onChange={(v) => setMapping((m) => ({ ...m, operador: v }))} />
                  <FieldSelect label="SLA" headers={headers} value={mapping.semContatoDias} onChange={(v) => setMapping((m) => ({ ...m, semContatoDias: v }))} />
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Validação
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Linhas válidas: <span className="font-semibold">{validation.valid.length}</span>
                    <br />
                    Linhas com erro: <span className="font-semibold text-red-600">{validation.invalid.length}</span>
                  </div>

                  <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={onlyValid}
                      onChange={(e) => setOnlyValid(e.target.checked)}
                    />
                    Importar somente válidas
                  </label>

                  {validation.errors.length > 0 && (
                    <div className="mt-3 max-h-32 overflow-auto text-xs">
                      <div className="font-semibold text-red-600 mb-1">Erros (amostra)</div>
                      {validation.errors.slice(0, 8).map((e, idx) => (
                        <div key={idx} className="text-gray-700 dark:text-gray-200">
                          Linha {e.index + 1}: <span className="text-red-600">{e.field}</span> — {e.message}
                        </div>
                      ))}
                      {validation.errors.length > 8 && (
                        <div className="text-gray-500 dark:text-gray-400 mt-1">
                          + {validation.errors.length - 8} erros…
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* BOTÃO SEMPRE VISÍVEL */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      const payload = onlyValid ? validation.valid : normalized;
                      onImport(payload);
                    }}
                    disabled={
                      normalized.length === 0 ||
                      (onlyValid && validation.valid.length === 0)
                    }
                    className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Importar agora
                  </button>
                </div>

                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Dica: se estiver tudo certo, clique em <b>Importar agora</b>.
                </div>
              </div>
            </div>
          </div>

          {/* Rodapé opcional (pode tirar) */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-5 py-3 text-xs text-gray-500 dark:text-gray-400">
            Modal responsivo: não precisa diminuir zoom. Scroll interno ativado ✅
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportWizardModal;
