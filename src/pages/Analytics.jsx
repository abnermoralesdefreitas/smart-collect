import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

import { loadPortfolio, loadSettings, loadAudit } from "../utils/storage";
import HeatmapContacts from "../components/HeatmapContacts";
import PlaybackModal from "../components/PlaybackModal";

const COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#14B8A6"];

function moneyBRL(n) {
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Card({ title, subtitle, children }) {
  return (
    <div
      className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md
      dark:bg-gray-900 dark:border-gray-800 dark:shadow-none"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Tip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const value = formatter ? formatter(p.value) : p.value;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950/95 text-gray-100 px-3 py-2 text-xs">
      <div className="font-semibold">{label}</div>
      <div className="mt-1">
        <span className="opacity-80">{p.name}: </span>
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
}

function bucketDias(dias) {
  if (dias <= 0) return "0";
  if (dias <= 7) return "1–7";
  if (dias <= 15) return "8–15";
  if (dias <= 30) return "16–30";
  if (dias <= 60) return "31–60";
  return "60+";
}

function statusLabel(s) {
  return s || "Em aberto";
}

function Analytics() {
  const [rows, setRows] = useState([]);
  const [audit, setAudit] = useState([]);
  const [playOpen, setPlayOpen] = useState(false);

  useEffect(() => {
    const saved = loadPortfolio() || [];
    setRows(saved);
    setAudit(loadAudit() || []);
  }, []);

  const settings = useMemo(() => loadSettings(), []);
  const riskDays = settings?.sla?.riskDays ?? 7;
  const criticalRiskDays = settings?.sla?.criticalRiskDays ?? 3;

  const enriched = useMemo(() => {
    return (rows || []).map((r) => ({
      ...r,
      status: statusLabel(r.status),
      operador: r.operador || "Sem operador",
      valor: Number(r.valor || 0),
      dias: Number(r.dias || 0),
      semContatoDias:
        typeof r.semContatoDias === "number"
          ? r.semContatoDias
          : Math.min(45, Math.round((r.dias || 0) / 2) + (r.tentativas || 0)),
      historicoContatos: r.historicoContatos || [],
      prioridade: r.prioridade || "Média",
    }));
  }, [rows]);

  const totalValor = useMemo(
    () => enriched.reduce((acc, r) => acc + (r.valor || 0), 0),
    [enriched]
  );

  const statusCountData = useMemo(() => {
    const map = new Map();
    for (const r of enriched) {
      const k = statusLabel(r.status);
      map.set(k, (map.get(k) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [enriched]);

  const statusValueData = useMemo(() => {
    const map = new Map();
    for (const r of enriched) {
      const k = statusLabel(r.status);
      map.set(k, (map.get(k) || 0) + (r.valor || 0));
    }
    return Array.from(map.entries())
      .map(([status, valor]) => ({ status, valor: Math.round(valor * 100) / 100 }))
      .sort((a, b) => b.valor - a.valor);
  }, [enriched]);

  const agingData = useMemo(() => {
    const buckets = ["0", "1–7", "8–15", "16–30", "31–60", "60+"];
    const map = new Map(buckets.map((b) => [b, 0]));
    for (const r of enriched) {
      const b = bucketDias(r.dias || 0);
      map.set(b, (map.get(b) || 0) + 1);
    }
    return buckets.map((b) => ({ faixa: b, clientes: map.get(b) || 0 }));
  }, [enriched]);

  const contactsByDay = useMemo(() => {
    const days = 14;
    const now = new Date();
    const map = new Map();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toDateString();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      map.set(key, { day: `${dd}/${mm}`, contatos: 0 });
    }

    for (const r of enriched) {
      for (const c of r.historicoContatos || []) {
        const key = new Date(c.data).toDateString();
        if (map.has(key)) map.get(key).contatos += 1;
      }
    }

    return Array.from(map.values());
  }, [enriched]);

  const operatorData = useMemo(() => {
    const todayStr = new Date().toDateString();

    const map = new Map();
    for (const r of enriched) {
      const op = r.operador || "Sem operador";
      if (!map.has(op)) {
        map.set(op, {
          operador: op,
          clientes: 0,
          valor: 0,
          slaRisco: 0,
          contatosHoje: 0,
        });
      }
      const obj = map.get(op);
      obj.clientes += 1;
      obj.valor += r.valor || 0;

      const isRisk =
        (r.semContatoDias ?? 0) > riskDays ||
        (r.prioridade === "Crítica" && (r.semContatoDias ?? 0) > criticalRiskDays);
      if (isRisk) obj.slaRisco += 1;

      const contatos = r.historicoContatos || [];
      obj.contatosHoje += contatos.filter(
        (c) => new Date(c.data).toDateString() === todayStr
      ).length;
    }

    return Array.from(map.values())
      .map((x) => ({ ...x, valor: Math.round(x.valor * 100) / 100 }))
      .sort((a, b) => b.valor - a.valor);
  }, [enriched, riskDays, criticalRiskDays]);

  const empty = enriched.length === 0;

  return (
    <div className="space-y-8">
      {/* Header premium */}
      <div
        className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-md
        dark:border-gray-800 dark:bg-gray-900 dark:shadow-none"
      >
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Analytics
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Insights visuais + Heatmap + Playback Mode
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                Clientes: <span className="font-semibold">{enriched.length}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                Valor total: <span className="font-semibold">{moneyBRL(totalValor)}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                SLA risco: <span className="font-semibold">{riskDays}d</span> • Crítico:{" "}
                <span className="font-semibold">{criticalRiskDays}d</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setPlayOpen(true)}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            🎬 Playback Mode
          </button>
        </div>
      </div>

      {empty && (
        <div className="p-4 rounded-2xl border border-yellow-200 bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900/40 dark:text-yellow-200">
          Sem dados ainda. Vá em <b>Carteira</b> e use <b>Demo Mode</b> ou importe um Excel/CSV.
        </div>
      )}

      {/* Heatmap */}
      <HeatmapContacts rows={enriched} weeks={16} />

      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Carteira por Status" subtitle="Distribuição por quantidade de clientes">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusCountData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={2}
                >
                  {statusCountData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={({ active, payload, label }) => (
                  <Tip active={active} payload={payload} label={label} />
                )} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Valor por Status" subtitle="Quanto dinheiro está em cada etapa">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusValueData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                <XAxis dataKey="status" stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <YAxis
                  stroke="currentColor"
                  className="text-gray-500 dark:text-gray-400"
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                />
                <Tooltip content={({ active, payload }) => (
                  <Tip active={active} payload={payload} label="Valor" formatter={(v) => moneyBRL(v)} />
                )} />
                <Bar dataKey="valor" name="Valor" fill="#3B82F6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Aging (faixas de atraso)" subtitle="Distribuição de clientes por dias em atraso">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                <XAxis dataKey="faixa" stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <YAxis stroke="currentColor" className="text-gray-500 dark:text-gray-400" allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) => (
                  <Tip active={active} payload={payload} label={`Faixa ${label}`} />
                )} />
                <Bar dataKey="clientes" name="Clientes" fill="#22C55E" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Produtividade" subtitle="Contatos por dia (últimos 14 dias)">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={contactsByDay} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
                <XAxis dataKey="day" stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
                <YAxis stroke="currentColor" className="text-gray-500 dark:text-gray-400" allowDecimals={false} />
                <Tooltip content={({ active, payload, label }) => (
                  <Tip active={active} payload={payload} label={label} />
                )} />
                <Area
                  type="monotone"
                  dataKey="contatos"
                  name="Contatos"
                  stroke="#A855F7"
                  fill="#A855F7"
                  fillOpacity={0.2}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Operadores */}
      <Card title="Operadores" subtitle="Carteira (valor), SLA em risco e contatos hoje">
        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={operatorData} margin={{ left: 10, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-800" />
              <XAxis dataKey="operador" stroke="currentColor" className="text-gray-500 dark:text-gray-400" />
              <YAxis
                stroke="currentColor"
                className="text-gray-500 dark:text-gray-400"
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
              />
              <Tooltip content={({ active, payload, label }) => (
                <Tip active={active} payload={payload} label={label} formatter={(v) => moneyBRL(v)} />
              )} />
              <Legend />
              <Bar dataKey="valor" name="Valor carteira" fill="#3B82F6" radius={[10, 10, 0, 0]} />
              <Bar dataKey="slaRisco" name="SLA risco" fill="#EF4444" radius={[10, 10, 0, 0]} />
              <Bar dataKey="contatosHoje" name="Contatos hoje" fill="#22C55E" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <PlaybackModal open={playOpen} onClose={() => setPlayOpen(false)} events={audit} />
    </div>
  );
}

export default Analytics;
