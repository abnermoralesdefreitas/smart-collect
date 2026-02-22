import { useEffect, useState } from "react";
import AuditLog from "../components/AuditLog";
import { clearAudit, loadAudit } from "../utils/storage";

function Auditoria() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(loadAudit());
  }, []);

  function handleClear() {
    clearAudit();
    setItems([]);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Auditoria</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Eventos: contatos, status, imports, configurações…
        </p>
      </div>

      <AuditLog items={items} onClear={handleClear} />
    </div>
  );
}

export default Auditoria;
