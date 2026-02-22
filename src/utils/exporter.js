import * as XLSX from "xlsx";

export function exportToXLSX(filename, rows) {
  const flat = rows.map((r) => ({
    ID: r.id,
    Cliente: r.nome,
    CPF: r.cpf,
    "Dias em atraso": r.dias,
    Valor: r.valor,
    Status: r.status,
    Operador: r.operador,
    "Dias sem contato": r.semContatoDias,
    Tentativas: r.tentativas,
    Reincidente: r.reincidente ? "Sim" : "Não",
    Histórico: r.historico,
    "Qtd contatos": (r.historicoContatos || []).length,
  }));

  const ws = XLSX.utils.json_to_sheet(flat);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Carteira");

  XLSX.writeFile(wb, filename);
}

