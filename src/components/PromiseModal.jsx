import { useEffect, useMemo, useState } from "react";
import { moneyBRL, toISODate } from "../utils/promiseUtils";

function Input({ label, ...props }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <input
        {...props}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
          dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <select
        {...props}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
          dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
      >
        {children}
      </select>
    </div>
  );
}

function PromiseModal({
  open,
  onClose,
  mode = "create", // create | edit
  portfolioRows = [],
  initialClienteId = "",
  initialPromise = null,
  onSave,
}) {
  const [clienteId, setClienteId] = useState(initialClienteId);
  const [valorPrometido, setValorPrometido] = useState("");
  const [dataPrometida, setDataPrometida] = useState(toISODate(new Date()));
  const [canal, setCanal] = useState("WhatsApp");
  const [obs, setObs] = useState("");

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && initialPromise) {
      setClienteId(String(initialPromise.clienteId || initialClienteId || ""));
      setValorPrometido(String(initialPromise.valorPrometido ?? ""));
      setDataPrometida(String(initialPromise.dataPrometida || toISODate(new Date())));
      setCanal(String(initialPromise.canal || "WhatsApp"));
      setObs(String(initialPromise.obs || ""));
    } else {
      setClienteId(String(initialClienteId || ""));
      setValorPrometido("");
      setDataPrometida(toISODate(new Date()));
      setCanal("WhatsApp");
      setObs("");
    }
  }, [open, mode, initialPromise, initialClienteId]);

  // trava scroll do body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = prev);
  }, [open]);

  const clients = useMemo(() => {
    return (portfolioRows || [])
      .map((r) => ({ id: String(r.id), nome: r.nome || `Cliente ${r.id}` }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [portfolioRows]);

  if (!open) return null;

  const valorNum = Number(String(valorPrometido).replace(",", "."));
  const invalid =
    !clienteId || !dataPrometida || !Number.isFinite(valorNum) || valorNum <= 0;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div
          className="w-full max-w-xl rounded-3xl border border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950 shadow-2xl overflow-hidden"
          style={{ maxHeight: "92vh" }}
        >
          <div className="p-5 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {mode === "edit" ? "Editar promessa" : "Criar promessa"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {mode === "edit"
                    ? "Reagendar / ajustar valor / canal."
                    : "Promessa de pagamento (PDP) para acompanhamento."}
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              >
                Fechar
              </button>
            </div>
          </div>

          <div className="p-5 overflow-y-auto" style={{ maxHeight: "calc(92vh - 140px)" }}>
            <div className="grid grid-cols-1 gap-4">
              <Select label="Cliente" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">— selecione —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Valor prometido"
                  placeholder="Ex: 350.00"
                  value={valorPrometido}
                  onChange={(e) => setValorPrometido(e.target.value)}
                />
                <Input
                  label="Data prometida"
                  type="date"
                  value={dataPrometida}
                  onChange={(e) => setDataPrometida(e.target.value)}
                />
              </div>

              <Select label="Canal" value={canal} onChange={(e) => setCanal(e.target.value)}>
                <option>WhatsApp</option>
                <option>Telefone</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Outro</option>
              </Select>

              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Observação</div>
                <textarea
                  rows={3}
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
                    dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
                  placeholder="Ex: Cliente pediu 2ª via; pagará após receber salário."
                />
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  Resumo:{" "}
                  <span className="font-semibold">
                    {Number.isFinite(valorNum) && valorNum > 0 ? moneyBRL(valorNum) : "—"}
                  </span>{" "}
                  em{" "}
                  <span className="font-semibold">{dataPrometida || "—"}</span>{" "}
                  via <span className="font-semibold">{canal}</span>
                </div>
              </div>

              <button
                disabled={invalid}
                onClick={() => {
                  onSave({
                    clienteId,
                    valorPrometido: valorNum,
                    dataPrometida,
                    canal,
                    obs,
                  });
                }}
                className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {mode === "edit" ? "Salvar alterações" : "Criar promessa"}
              </button>
            </div>
          </div>

          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            Dica: promessas vencidas viram “Atrasadas” automaticamente.
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromiseModal;
