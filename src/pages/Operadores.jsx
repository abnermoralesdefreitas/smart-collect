import { useEffect, useState } from "react";
import { fetchPortfolio } from "../services/api";
import { distribuirCarteira } from "../utils/assignment";
import OperatorPerformance from "../components/OperatorPerformance";

function Operadores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const operatorsConfig = [
    { name: "Abner", capacity: 4, metaValor: 18000 },
    { name: "João", capacity: 3, metaValor: 12000 },
    { name: "Larissa", capacity: 3, metaValor: 15000 },
  ];

  useEffect(() => {
    async function load() {
      const res = await fetchPortfolio();
      setData(res);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p>Carregando operadores...</p>;

  const result = distribuirCarteira(data, operatorsConfig);

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Operadores</h2>

      <OperatorPerformance stats={result.operatorStats} />
    </div>
  );
}

export default Operadores;
