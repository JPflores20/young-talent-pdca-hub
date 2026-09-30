import { SafeResponsiveContainer } from "@/components/ui/safe-responsive-container";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format_value } from "./pareto-utils";
import type { ParetoRow } from "./pareto-utils";

export function ParetoChart({
  pareto_rows,
  on_bar_click,
  unit = "",
  y_axis_min,
  y_axis_max,
  chart_title,
  max_bar_size = 40,
}: {
  pareto_rows: ParetoRow[];
  on_bar_click?: (area: string) => void;
  unit?: string;
  y_axis_min: number;
  y_axis_max: number | "auto";
  chart_title: string;
  on_chart_title_change: (t: string) => void;
  max_bar_size?: number;
}) {
  const bottom_margin = Math.max(100, 40 + pareto_rows.length * 5);

  return (
    <div className="flex flex-col gap-1 w-full h-full">
      {chart_title && (
        <h3 className="text-center text-sm font-semibold mb-2 text-foreground">{chart_title}</h3>
      )}
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={pareto_rows}
          margin={{ top: 20, right: 30, bottom: bottom_margin, left: -10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="area"
            tick={{ fontSize: 10 }}
            stroke="hsl(var(--muted-foreground))"
            interval={0}
            angle={-45}
            textAnchor="end"
            height={bottom_margin}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(v) => format_value(v, unit)}
            domain={[y_axis_min, y_axis_max]}
            allowDataOverflow={true}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            domain={[0, 100]}
            tickFormatter={(v) => Math.round(v) + "%"}
          />
          <RTooltip
            contentStyle={{ borderRadius: 8, fontSize: 12, padding: "8px 12px" }}
            formatter={(val: number, name: string) => [
              name === "Acumulado" ? val.toFixed(2) + "%" : format_value(val, unit),
              name,
            ]}
          />
          <Bar
            yAxisId="left"
            dataKey="gap"
            name="Valor"
            fill="#4285f4"
            radius={[4, 4, 0, 0]}
            maxBarSize={max_bar_size}
            onClick={(payload: any) => {
              if (on_bar_click && payload && payload.area) {
                on_bar_click(payload.area);
              }
            }}
            className={on_bar_click ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cum_pct"
            name="Acumulado"
            stroke="#ff4d4f"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "white", stroke: "#ff4d4f", strokeWidth: 2 }}
          />
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );
}
