import { useState } from "react";

function ContactModal({ cliente, onClose, onSave }) {
  const [canal, setCanal] = useState("WhatsApp");
  const [obs, setObs] = useState("");

  function handleSave() {
    if (!obs.trim()) return;

    onSave({
      data: new Date().toISOString(),
      canal,
      obs,
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-96 space-y-4">
        <h3 className="text-lg font-semibold">
          Registrar contato — {cliente.nome}
        </h3>

        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border dark:bg-gray-800"
        >
          <option>WhatsApp</option>
          <option>Telefone</option>
          <option>Email</option>
        </select>

        <textarea
          placeholder="Observação do contato..."
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border dark:bg-gray-800"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ContactModal;
