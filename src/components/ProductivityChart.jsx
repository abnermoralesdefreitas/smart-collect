import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

function ProductivityChart({ data }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-md
      dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            📈 Produtividade (contatos por dia)
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Últimos 14 dias • baseado na timeline de contatos
          </p>
        </div>
      </div>

      <div className="mt-4 h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-gray-200 dark:text-gray-800"
            />
            <XAxis
              dataKey="day"
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              stroke="currentColor"
              className="text-gray-500 dark:text-gray-400"
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0b1220",
                border: "1px solid #334155",
                borderRadius: "10px",
                color: "#e5e7eb",
              }}
              labelStyle={{ color: "#e5e7eb" }}
            />
            <Bar dataKey="contatos" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProductivityChart;
