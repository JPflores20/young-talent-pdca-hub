/**
 * pareto_chart.tsx
 * Gráfica interactiva de Pareto con Recharts.
 * Features: nombre editable, límites Y ajustables, todos los X-labels visibles.
 * Responsabilidad única: visualización del gráfico.
 */
import { Maximize2 } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ParetoChartProps } from "./pareto_types";

function CustomBarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  format_value: (v: unknown) => string;
}) {
  const { x = 0, y = 0, width = 0, value, format_value } = props;
  if (value === null || value === undefined) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="var(--color-foreground)"
      fontSize={9}
      textAnchor="start"
      fontWeight="bold"
      transform={`rotate(-45 ${x + width / 2} ${y - 5})`}
    >
      {format_value(value)}
    </text>
  );
}

export function ParetoChart({
  chart_data,
  chart_title,
  on_chart_title_change,
  y_axis_min,
  y_axis_max,
  on_y_axis_min_change,
  on_y_axis_max_change,
  on_bar_click,
  unit,
  format_value,
  is_fullscreen = false,
  on_expand,
}: ParetoChartProps) {
  const y_domain: [number, number | "auto"] = [y_axis_min, y_axis_max];
  const bar_height = is_fullscreen ? "100%" : 250;
  // Aumentamos considerablemente el margen inferior para que quepan los textos largos rotados
  const x_bottom_margin = chart_data.length > 6 ? 120 : 80;

  return (
    <div className="flex flex-col gap-2">
      {/* Nombre editable del Pareto */}
      <Input
        value={chart_title}
        onChange={(e) => on_chart_title_change(e.target.value)}
        placeholder="Nombre del gráfico..."
        className="h-7 text-xs font-semibold border-dashed text-center"
      />

      {/* Controles de límites del eje Y */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Label className="text-[10px] uppercase tracking-wide">Y mín:</Label>
          <Input
            type="number"
            value={y_axis_min}
            onChange={(e) => on_y_axis_min_change(Number(e.target.value))}
            className="h-6 w-20 text-xs px-1"
          />
        </div>
        <div className="flex items-center gap-1">
          <Label className="text-[10px] uppercase tracking-wide">Y máx:</Label>
          <Input
            type="number"
            value={y_axis_max === "auto" ? "" : y_axis_max}
            placeholder="auto"
            onChange={(e) =>
              on_y_axis_max_change(e.target.value === "" ? "auto" : Number(e.target.value))
            }
            className="h-6 w-20 text-xs px-1"
          />
        </div>
        {on_expand && !is_fullscreen && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={on_expand}
          >
            <Maximize2 className="mr-1 size-3" /> Expandir
          </Button>
        )}
      </div>

      {/* Gráfica */}
      <div className="border rounded-md p-2 bg-card">
        {/* Título renderizado arriba de la gráfica, usa el valor del input superior */}
        {chart_title && (
          <h3 className="text-center text-sm font-semibold mb-2 text-foreground">{chart_title}</h3>
        )}
        <ResponsiveContainer width="100%" height={bar_height}>
          <ComposedChart
            data={chart_data}
            margin={{ top: 25, right: 15, bottom: x_bottom_margin, left: -10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />

            {/* Eje X ajustado: interval={0} fuerza todos los labels, height permite que no se recorten */}
            <XAxis
              dataKey="area"
              interval={0}
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 10 }}
              stroke="var(--color-muted-foreground)"
            />

            {/* Eje Y izquierdo ajustado: allowDataOverflow garantiza que se respeten los límites */}
            <YAxis
              yAxisId="left"
              domain={y_domain}
              allowDataOverflow={true}
              tick={{ fontSize: 11 }}
              stroke="var(--color-muted-foreground)"
              tickFormatter={(val) => format_value(val)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="var(--color-muted-foreground)"
              domain={[0, 100]}
              tickFormatter={(val) => Math.round(val) + "%"}
            />
            <RTooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--color-border)",
                fontSize: 12,
                backgroundColor: "var(--color-card)",
                color: "var(--color-foreground)",
                padding: "8px 12px",
              }}
              formatter={(val: number, name: string) => [
                name === "Acumulado" ? val.toFixed(2) + "%" : format_value(val),
                name,
              ]}
            />
            <Bar
              yAxisId="left"
              dataKey="gap"
              name="Valor"
              fill="#4285f4"
              radius={[4, 4, 0, 0]}
              maxBarSize={is_fullscreen ? 60 : 40}
              onClick={(payload) => {
                if (on_bar_click && payload?.area) on_bar_click(payload.area);
              }}
              className={on_bar_click ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              label={<CustomBarLabel format_value={format_value} />}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cum_pct"
              name="Acumulado"
              stroke="#ff4d4f"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-card)", stroke: "#ff4d4f", strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
