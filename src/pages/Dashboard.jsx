import { useMemo, useState } from "react";

function fmtBRL(v) {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  } catch {
    return `R$ ${Number(v).toFixed(2)}`;
  }
}

function percent(a, b) {
  if (!b) return "0%";
  return `${Math.round((a / b) * 100)}%`;
}

function TrendBadge({ value }) {
  const positive = value >= 0;
  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-full border
      ${positive ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-900/40"
                 : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-200 dark:border-red-900/40"}`}
    >
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

function MiniBar({ value, max }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / (max || 1)) * 100)));
  return (
    <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

function Card({ title, value, subtitle, trend }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            {value}
          </div>
          {subtitle ? (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</div>
          ) : null}
        </div>
        {typeof trend === "number" ? <TrendBadge value={trend} /> : null}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [periodo, setPeriodo] = useState("7d");

  const data = useMemo(() => {
    // Dados fictícios (depois plugamos Excel/CSV real)
    const base = {
      "7d": {
        recuperado: 82400,
        meta: 100000,
        clientes: 142,
        pedidos: 38,
        promessas: 27,
        promessasCumpridas: 18,
        sla: 0.86,
        atrasosCriticos: 9,
        riscoAlto: 13,
        riscoMedio: 41,
        riscoBaixo: 88,
        trendRecuperado: 12,
        trendClientes: 4,
        trendPedidos: -2,
        trendSla: 3,
        operacao: [
          { nome: "Ações realizadas", valor: 312 },
          { nome: "Contatos válidos", valor: 198 },
          { nome: "WhatsApps enviados", valor: 104 },
          { nome: "Sem retorno", valor: 58 },
        ],
        atividades: [
          { t: "10:12", msg: "Importação de carteira concluída (CSV) — 142 clientes." },
          { t: "10:31", msg: "Mensagem WhatsApp enviada para 9 clientes (modelo: Atraso 7+)." },
          { t: "11:05", msg: "Promessa registrada: R$ 1.250 para 26/02." },
          { t: "11:24", msg: "Alerta crítico: 3 clientes com risco alto e atraso > 30d." },
        ],
      },
      "30d": {
        recuperado: 321500,
        meta: 380000,
        clientes: 608,
        pedidos: 221,
        promessas: 122,
        promessasCumpridas: 91,
        sla: 0.83,
        atrasosCriticos: 34,
        riscoAlto: 49,
        riscoMedio: 187,
        riscoBaixo: 372,
        trendRecuperado: 7,
        trendClientes: 2,
        trendPedidos: 6,
        trendSla: -1,
        operacao: [
          { nome: "Ações realizadas", valor: 1284 },
          { nome: "Contatos válidos", valor: 811 },
          { nome: "WhatsApps enviados", valor: 522 },
          { nome: "Sem retorno", valor: 219 },
        ],
        atividades: [
          { t: "Ontem", msg: "Exportação de relatório (Excel) — Carteira + Auditoria." },
          { t: "2 dias", msg: "Meta mensal atualizada para R$ 380.000." },
          { t: "3 dias", msg: "Operadores: ranking recalculado (SLA + Promessas)." },
          { t: "5 dias", msg: "Ajuste no modelo de criticidade: atraso x valor x risco." },
        ],
      },
    };
    return base[periodo];
  }, [periodo]);

  const taxaPromessas = Math.round((data.promessasCumpridas / (data.promessas || 1)) * 100);
  const pctMeta = Math.round((data.recuperado / (data.meta || 1)) * 100);
  const slaPct = Math.round((data.sla || 0) * 100);

  return (
    <div className="text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Visão Geral</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Painel executivo do SmartCollect — metas, riscos e operação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Período</div>
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900
              dark:bg-gray-900 dark:text-white dark:border-gray-800"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          title="Recuperado"
          value={fmtBRL(data.recuperado)}
          subtitle={`Meta: ${fmtBRL(data.meta)} • ${pctMeta}% atingido`}
          trend={data.trendRecuperado}
        />
        <Card
          title="Clientes"
          value={data.clientes}
          subtitle="Carteira ativa"
          trend={data.trendClientes}
        />
        <Card
          title="Pedidos"
          value={data.pedidos}
          subtitle="Negociações em andamento"
          trend={data.trendPedidos}
        />
      </div>

      {/* Progress + Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Meta */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Meta x Realizado</div>
              <div className="text-xl font-bold mt-1">{pctMeta}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fmtBRL(data.recuperado)} de {fmtBRL(data.meta)}
              </div>
            </div>
            <TrendBadge value={data.trendRecuperado} />
          </div>

          <div className="mt-4">
            <MiniBar value={data.recuperado} max={data.meta} />
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-950/40 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">SLA Operacional</div>
              <div className="text-lg font-extrabold mt-1">{slaPct}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{percent(slaPct, 100)} do alvo</div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-950/40 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Promessas</div>
              <div className="text-lg font-extrabold mt-1">{data.promessas}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Cumpridas: {taxaPromessas}% ({data.promessasCumpridas})
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-950/40 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Atrasos críticos</div>
              <div className="text-lg font-extrabold mt-1">{data.atrasosCriticos}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">30d+ ou risco alto</div>
            </div>
          </div>
        </div>

        {/* Risco */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">Distribuição de risco</div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Alto</span>
                <span>{data.riscoAlto}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div className="h-2 rounded-full bg-red-600" style={{ width: `${Math.min(100, (data.riscoAlto / (data.clientes || 1)) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Médio</span>
                <span>{data.riscoMedio}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(100, (data.riscoMedio / (data.clientes || 1)) * 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Baixo</span>
                <span>{data.riscoBaixo}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (data.riscoBaixo / (data.clientes || 1)) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-gray-200 bg-gray-50 dark:bg-gray-950/40 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400">Recomendação</div>
            <div className="mt-1 text-sm font-semibold">
              Priorizar {data.riscoAlto} clientes de risco alto
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Disparar WhatsApp + ligação + promessa.
            </div>
          </div>
        </div>
      </div>

      {/* Operação + Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">Operação</div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.operacao.map((item) => (
              <div
                key={item.nome}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-950/40 dark:border-gray-800"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400">{item.nome}</div>
                <div className="text-xl font-extrabold mt-1">{item.valor}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            Dados de exemplo — na próxima etapa vamos ligar isso com CSV/Excel e auditoria.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="text-sm text-gray-500 dark:text-gray-400">Atividade recente</div>
          <div className="mt-4 space-y-3">
            {data.atividades.map((a, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-gray-950/40 dark:border-gray-800"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-gray-900 dark:text-white">
                    {a.t}
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    SmartCollect
                  </span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200 mt-2">
                  {a.msg}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition text-sm">
              Ver auditoria
            </button>
            <button className="px-4 py-2 rounded-xl bg-gray-200 text-gray-900 hover:bg-gray-300 transition text-sm dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              Exportar resumo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
