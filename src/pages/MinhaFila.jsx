import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loadPortfolio, savePortfolio, addAudit } from "../utils/storage";
import CollectionTable from "../components/CollectionTable";

function MinhaFila() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(loadPortfolio() || []);
  }, []);

  const myRows = useMemo(() => {
    const name = user?.name || "";
    return rows.filter((r) => (r.operador || "").toLowerCase() === name.toLowerCase());
  }, [rows, user]);

  function handleRowsChange(updatedAllRows) {
    setRows(updatedAllRows);
    savePortfolio(updatedAllRows);
    addAudit({
      type: "UPDATE",
      actor: user?.name || "user",
      message: "Alteração na carteira (Minha Fila).",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Minha Fila</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Carteira filtrada para o operador logado: <span className="font-semibold">{user?.name}</span>
        </p>
      </div>

      <CollectionTable rows={myRows} isLoading={false} onRowsChange={handleRowsChange} />
    </div>
  );
}

export default MinhaFila;
