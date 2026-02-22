import { useEffect, useMemo, useState } from "react";
import CollectionTable from "../components/CollectionTable";
import { loadPortfolio, savePortfolio, addAudit } from "../utils/storage";
import { fetchPortfolio } from "../services/api";
import { distribuirCarteira } from "../utils/assignment";

import ImportWizardModal from "../components/ImportWizardModal";
import { parseFileMeta } from "../utils/importer";
import { generateDemoPortfolio } from "../data/demoPortfolio";
import { exportToXLSX } from "../utils/exporter";

function Carteira() {
  const operatorsConfig = [
    { name: "Abner", capacity: 4, metaValor: 18000 },
    { name: "João", capacity: 3, metaValor: 12000 },
    { name: "Larissa", capacity: 3, metaValor: 15000 },
  ];

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Import wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [rawRows, setRawRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const [sheets, setSheets] = useState(["CSV"]);
  const [selectedSheet, setSelectedSheet] = useState("CSV");
  const [reader, setReader] = useState(null);

  useEffect(() => {
    async function load() {
      const saved = loadPortfolio();
      if (saved?.length) {
        setRows(saved);
        setLoading(false);
        return;
      }
      const data = await fetchPortfolio();
      setRows(data);
      savePortfolio(data);
      setLoading(false);
    }
    load();
  }, []);

  function handleRowsChange(updated) {
    setRows(updated);
    savePortfolio(updated);
  }

  const distributedRows = useMemo(() => {
    if (!rows.length) return [];
    const result = distribuirCarteira(rows, operatorsConfig);
    return result.distributedRows;
  }, [rows]);

  async function handleImportPro(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError("");
      setLoading(true);
      setFileName(file.name);

      const meta = await parseFileMeta(file);
      setSheets(meta.sheets);
      setSelectedSheet(meta.sheets[0]);
      setReader(() => meta.readSheet);

      const first = await meta.readSheet(meta.sheets[0]);
      if (!first.rows.length) {
        setError("Arquivo importado, mas não encontrei linhas.");
        setLoading(false);
        return;
      }

      setRawRows(first.rows);
      setHeaders(first.headers);
      setWizardOpen(true);

      addAudit({
        type: "IMPORT_PREVIEW",
        actor: "user",
        message: `Preview de import aberto: "${file.name}" (${first.rows.length} linhas) • Aba: ${meta.sheets[0]}.`,
      });
    } catch (err) {
      setError(err.message || "Erro ao importar arquivo.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function changeSheet(sheetName) {
    setSelectedSheet(sheetName);
    if (!reader) return;
    setLoading(true);
    try {
      const data = await reader(sheetName);
      setRawRows(data.rows);
      setHeaders(data.headers);
      addAudit({
        type: "IMPORT_SHEET",
        actor: "user",
        message: `Aba selecionada: ${sheetName} (${data.rows.length} linhas).`,
      });
    } finally {
      setLoading(false);
    }
  }

  function confirmImport(normalizedRows) {
    setWizardOpen(false);
    setRows(normalizedRows);
    savePortfolio(normalizedRows);

    addAudit({
      type: "IMPORT",
      actor: "user",
      message: `Import finalizado: "${fileName}" • Aba: ${selectedSheet} • ${normalizedRows.length} linhas.`,
    });
  }

  function loadDemo() {
    const demo = generateDemoPortfolio(50);
    setRows(demo);
    savePortfolio(demo);
    addAudit({
      type: "DEMO",
      actor: "user",
      message: "Demo Mode ativado (50 clientes gerados).",
    });
  }

  function exportXLSX() {
    exportToXLSX("smartcollect-carteira.xlsx", distributedRows);
    addAudit({ type: "EXPORT", actor: "user", message: "Export XLSX realizado." });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Carteira</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Import Pro com preview, mapeamento, validação e escolha de aba. Export XLSX para relatório.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer">
            Importar (Pro) Excel/CSV
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleImportPro}
            />
          </label>

          <button
            onClick={exportXLSX}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-900 hover:bg-gray-100 transition
              dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Exportar XLSX
          </button>

          <button
            onClick={loadDemo}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-900 hover:bg-gray-100 transition
              dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Demo Mode
          </button>

          <button
            onClick={() => {
              setRows([]);
              savePortfolio([]);
              setFileName("");
              setError("");
              addAudit({ type: "RESET", actor: "user", message: "Carteira limpa." });
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-900 hover:bg-gray-100 transition
              dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
          >
            Limpar
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-700 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-200">
          {error}
        </div>
      )}

      <CollectionTable rows={distributedRows} isLoading={loading} onRowsChange={handleRowsChange} />

      <ImportWizardModal
        open={wizardOpen}
        fileName={fileName}
        sheets={sheets}
        selectedSheet={selectedSheet}
        onSelectSheet={changeSheet}
        rawRows={rawRows}
        headers={headers}
        onClose={() => setWizardOpen(false)}
        onImport={confirmImport}
      />
    </div>
  );
}

export default Carteira;
