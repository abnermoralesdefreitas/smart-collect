import * as XLSX from "xlsx";

// CSV simples
function csvToObjects(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const obj = {};
    headers.forEach((h, i) => (obj[h] = values[i] ?? ""));
    return obj;
  });
}

function extractHeaders(rows) {
  const set = new Set();
  rows.forEach((r) => Object.keys(r || {}).forEach((k) => set.add(k)));
  return Array.from(set);
}

// =========================
// Parse: retorna sheets + helper pra ler sheet específico
// =========================
export async function parseFileMeta(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  const buffer = await file.arrayBuffer();

  if (ext === "csv") {
    const text = new TextDecoder("utf-8").decode(buffer);
    const rows = csvToObjects(text);
    const headers = extractHeaders(rows);
    return {
      type: "csv",
      sheets: ["CSV"],
      readSheet: async () => ({ rows, headers }),
    };
  }

  if (ext === "xlsx" || ext === "xls") {
    const wb = XLSX.read(buffer, { type: "array" });
    const sheets = wb.SheetNames;

    return {
      type: "xlsx",
      sheets,
      readSheet: async (sheetName) => {
        const name = sheetName || sheets[0];
        const ws = wb.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
        const headers = extractHeaders(rows);
        return { rows, headers };
      },
    };
  }

  throw new Error("Formato não suportado. Use .csv ou .xlsx");
}

// =========================
// Infer mapping
// =========================
export function inferMapping(headers = []) {
  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");

  const h = headers.map((x) => ({ raw: x, key: norm(x) }));

  const pick = (candidates) => {
    for (const cand of candidates) {
      const found = h.find((x) => x.key === norm(cand));
      if (found) return found.raw;
    }
    for (const cand of candidates) {
      const cc = norm(cand);
      const found = h.find((x) => x.key.includes(cc));
      if (found) return found.raw;
    }
    return "";
  };

  return {
    nome: pick(["nome", "cliente", "razaosocial", "devedor"]),
    cpf: pick(["cpf", "documento", "doc", "cnpjcpf", "cpfcnpj"]),
    dias: pick(["dias", "diasatraso", "atraso", "dias_em_atraso"]),
    valor: pick(["valor", "valoraberto", "saldo", "valor_em_aberto", "vlr"]),
    historico: pick(["historico", "perfil", "cluster"]),
    reincidente: pick(["reincidente", "recorrente", "reincidencia"]),
    tentativas: pick(["tentativas", "tentativascontato", "qtdecontatos"]),
    status: pick(["status", "situacao", "stage"]),
    operador: pick(["operador", "responsavel", "agente"]),
    semContatoDias: pick(["semcontatodias", "sladias", "sla", "diassemcontato"]),
  };
}

export function normalizeRowsWithMapping(rawRows, mapping) {
  const get = (obj, headerName) => (headerName ? obj?.[headerName] ?? "" : "");

  const parseNumber = (v) => {
    if (typeof v === "number") return v;
    if (typeof v !== "string") return 0;
    const cleaned = v.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };

  const parseBool = (v) => {
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase().trim();
    return s === "true" || s === "sim" || s === "1" || s === "yes";
  };

  const parseIntSafe = (v) => {
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : 0;
  };

  const normHistorico = (v) => {
    const s = String(v || "").toLowerCase().trim();
    if (!s) return "medio";
    if (["bom", "boa", "good", "alto"].includes(s)) return "bom";
    if (["ruim", "bad", "baixo"].includes(s)) return "ruim";
    return "medio";
  };

  return rawRows.map((r, idx) => ({
    id: idx + 1,
    nome: String(get(r, mapping.nome)).trim() || `Cliente ${idx + 1}`,
    cpf: String(get(r, mapping.cpf)).trim() || "",
    dias: parseIntSafe(get(r, mapping.dias)),
    valor: parseNumber(get(r, mapping.valor)),
    historico: normHistorico(get(r, mapping.historico)),
    reincidente: parseBool(get(r, mapping.reincidente)),
    tentativas: parseIntSafe(get(r, mapping.tentativas)),
    status: String(get(r, mapping.status)).trim() || "Em aberto",
    operador: String(get(r, mapping.operador)).trim() || "",
    semContatoDias: parseIntSafe(get(r, mapping.semContatoDias)),
    historicoContatos: [],
  }));
}

export function validateRows(rows) {
  const errors = [];

  const isCPFLike = (cpf) => {
    const digits = String(cpf || "").replace(/\D/g, "");
    if (!digits) return true;
    return digits.length === 11 || digits.length === 14;
  };

  rows.forEach((r, i) => {
    if (!r.nome || String(r.nome).trim().length < 3) {
      errors.push({ index: i, id: r.id, field: "nome", message: "Nome inválido/curto" });
    }
    if (!isCPFLike(r.cpf)) {
      errors.push({ index: i, id: r.id, field: "cpf", message: "CPF/CNPJ com tamanho inválido" });
    }
    if (!Number.isFinite(r.dias) || r.dias < 0 || r.dias > 3650) {
      errors.push({ index: i, id: r.id, field: "dias", message: "Dias em atraso inválido" });
    }
    if (!Number.isFinite(r.valor) || r.valor < 0) {
      errors.push({ index: i, id: r.id, field: "valor", message: "Valor inválido" });
    }
    if (r.tentativas < 0 || r.tentativas > 200) {
      errors.push({ index: i, id: r.id, field: "tentativas", message: "Tentativas inválidas" });
    }
  });

  const invalidRowIndexes = new Set(errors.map((e) => e.index));
  const valid = rows.filter((_, idx) => !invalidRowIndexes.has(idx));
  const invalid = rows.filter((_, idx) => invalidRowIndexes.has(idx));

  return { valid, invalid, errors };
}
