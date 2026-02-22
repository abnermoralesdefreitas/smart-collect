import { useEffect, useState } from "react";
import { loadSettings, saveSettings, addAudit } from "../utils/storage";

function Configuracoes() {
  const [settings, setSettings] = useState(loadSettings());

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function update(path, value) {
    const next = structuredClone(settings);
    let obj = next;
    const keys = path.split(".");
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = value;
    setSettings(next);
  }

  function salvar() {
    saveSettings(settings);
    addAudit({ type: "SETTINGS", actor: "user", message: "Configurações atualizadas." });
    alert("Configurações salvas ✅");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Configurações</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ajuste SLA e templates por prioridade/canal (salvo no navegador).
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">SLA</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Risco (dias sem contato)
            </label>
            <input
              type="number"
              value={settings.sla.riskDays}
              onChange={(e) => update("sla.riskDays", Number(e.target.value))}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">
              Risco Crítico (dias sem contato)
            </label>
            <input
              type="number"
              value={settings.sla.criticalRiskDays}
              onChange={(e) => update("sla.criticalRiskDays", Number(e.target.value))}
              className="mt-1 w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Templates (WhatsApp)</h3>
        {["Crítica", "Alta", "Média", "Baixa"].map((p) => (
          <div key={p}>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{p}</div>
            <textarea
              value={settings.templates.WhatsApp[p]}
              onChange={(e) => update(`templates.WhatsApp.${p}`, e.target.value)}
              className="mt-1 w-full min-h-[90px] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Placeholders: {"{nome} {valor} {dias}"}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={salvar}
        className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        Salvar
      </button>
    </div>
  );
}

export default Configuracoes;
