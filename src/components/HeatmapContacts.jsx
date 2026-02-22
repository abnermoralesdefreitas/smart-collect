import { useMemo, useState } from "react";

function pad(n) {
  return String(n).padStart(2, "0");
}

function formatDayLabel(d) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function keyOfDay(date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Gera sequência de dias
function generateDays(weeks = 16) {
  const totalDays = weeks * 7;
  const today = startOfDay(new Date());
  const days = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  return days;
}

function intensityClass(value, max) {
  if (!max || value <= 0) return "bg-gray-200 dark:bg-gray-800";
  const pct = value / max;

  // 4 níveis
  if (pct < 0.25) return "bg-blue-200 dark:bg-blue-900/50";
  if (pct < 0.5) return "bg-blue-300 dark:bg-blue-800/60";
  if (pct < 0.75) return "bg-blue-400 dark:bg-blue-700/70";
  return "bg-blue-600 dark:bg-blue-500/80";
}

function HeatmapContacts({ rows, weeks = 16 }) {
  const [hover, setHover] = useState(null);

  const days = useMemo(() => generateDays(weeks), [weeks]);

  // lista de operadores e canais existentes
  const operators = useMemo(() => {
    const set = new Set(["Todos"]);
    for (const r of rows || []) set.add(r.operador || "Sem operador");
    return Array.from(set);
  }, [rows]);

  const channels = useMemo(() => {
    const set = new Set(["Todos"]);
    for (const r of rows || []) {
      for (const c of r.historicoContatos || []) set.add(c.canal || "Desconhecido");
    }
    return Array.from(set);
  }, [rows]);

  const [selectedOperator, setSelectedOperator] = useState("Todos");
  const [selectedChannel, setSelectedChannel] = useState("Todos");

  const daily = useMemo(() => {
    const map = new Map(); // key -> count
    for (const d of days) map.set(keyOfDay(d), 0);

    for (const r of rows || []) {
      const op = r.operador || "Sem operador";
      if (selectedOperator !== "Todos" && op !== selectedOperator) continue;

      for (const c of r.historicoContatos || []) {
        const canal = c.canal || "Desconhecido";
        if (selectedChannel !== "Todos" && canal !== selectedChannel) continue;

        const k = keyOfDay(new Date(c.data));
        if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
      }
    }

    const values = Array.from(map.values());
    const max = values.length ? Math.max(...values) : 0;

    return { map, max };
  }, [rows, days, selectedOperator, selectedChannel]);

  // organiza em colunas por semana (como GitHub)
  const columns = useMemo(() => {
    const cols = [];
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7));
    }
    return cols;
  }, [days]);

  // meses (labels em cima)
  const monthLabels = useMemo(() => {
    const labels = [];
    let lastMonth = null;

    columns.forEach((col, idx) => {
      const d = col[0];
      const m = d.getMonth();
      if (m !== lastMonth) {
        labels.push({ idx, label: d.toLocaleString("pt-BR", { month: "short" }) });
        lastMonth = m;
      }
    });

    return labels;
  }, [columns]);

  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md
      dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔥 Heatmap de Produtividade
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Contatos por dia (estilo GitHub) • {weeks} semanas
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedOperator}
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
              dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
          >
            {operators.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
              dark:bg-gray-950 dark:text-gray-100 dark:border-gray-800"
          >
            {channels.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* meses */}
      <div className="mt-5 relative">
        <div className="flex gap-1 ml-10 text-xs text-gray-500 dark:text-gray-400 select-none">
          {columns.map((_, idx) => {
            const lbl = monthLabels.find((x) => x.idx === idx);
            return (
              <div key={idx} className="w-3">
                {lbl ? lbl.label : ""}
              </div>
            );
          })}
        </div>

        {/* grade */}
        <div className="mt-2 flex gap-1">
          {/* labels de dia da semana */}
          <div className="w-10 text-xs text-gray-500 dark:text-gray-400 select-none">
            <div className="h-3" />
            <div className="h-3 mt-1">Seg</div>
            <div className="h-3 mt-2">Qua</div>
            <div className="h-3 mt-2">Sex</div>
          </div>

          <div className="flex gap-1">
            {columns.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((d, i) => {
                  const k = keyOfDay(d);
                  const v = daily.map.get(k) || 0;
                  const cls = intensityClass(v, daily.max);

                  return (
                    <div
                      key={k}
                      className={`h-3 w-3 rounded-[4px] ${cls} cursor-pointer ring-1 ring-black/5 dark:ring-white/5`}
                      onMouseEnter={() =>
                        setHover({
                          day: formatDayLabel(d),
                          iso: k,
                          value: v,
                        })
                      }
                      onMouseLeave={() => setHover(null)}
                      title={`${formatDayLabel(d)} • ${v} contatos`}
                      style={{
                        opacity: clamp(0.35 + (daily.max ? v / daily.max : 0), 0.35, 1),
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* tooltip fixo */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {hover ? (
              <>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {hover.day}
                </span>{" "}
                • {hover.value} contatos
              </>
            ) : (
              "Passe o mouse em um dia para ver detalhes."
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            Menos
            <span className="h-3 w-3 rounded-[4px] bg-gray-200 dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/5" />
            <span className="h-3 w-3 rounded-[4px] bg-blue-200 dark:bg-blue-900/50 ring-1 ring-black/5 dark:ring-white/5" />
            <span className="h-3 w-3 rounded-[4px] bg-blue-300 dark:bg-blue-800/60 ring-1 ring-black/5 dark:ring-white/5" />
            <span className="h-3 w-3 rounded-[4px] bg-blue-400 dark:bg-blue-700/70 ring-1 ring-black/5 dark:ring-white/5" />
            <span className="h-3 w-3 rounded-[4px] bg-blue-600 dark:bg-blue-500/80 ring-1 ring-black/5 dark:ring-white/5" />
            Mais
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeatmapContacts;
