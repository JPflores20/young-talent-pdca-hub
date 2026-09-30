import { Input } from "@/components/ui/input";
import { SafeResponsiveContainer } from "@/components/ui/safe-responsive-container";
import {
  Bar,
  CartesianGrid,
  Line,
  ComposedChart,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TimeSeriesChartProps {
  chartData: any[];
  chart_y_max: number | "auto";
  yMin: number;
  chartTitle: string;
  onTitleChange?: ((val: string) => void) | undefined;
  formatValue: (val: any) => string;
}

export function TimeSeriesChart({
  chartData,
  chart_y_max,
  yMin,
  chartTitle,
  onTitleChange,
  formatValue,
}: TimeSeriesChartProps) {
  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="var(--color-foreground)"
        fontSize={10}
        textAnchor="start"
        fontWeight="bold"
        transform={`rotate(-45 ${x + width / 2} ${y - 5})`}
      >
        {formatValue(value)}
      </text>
    );
  };

  return (
    <div className="w-full xl:w-[60%] flex flex-col h-[400px]">
      {onTitleChange ? (
        <Input
          value={chartTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="CURRENT TIME SERIES"
          className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80 border-transparent hover:border-input focus:border-input bg-transparent shadow-none"
        />
      ) : (
        <h4 className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80">
          {chartTitle}
        </h4>
      )}
      <SafeResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: 600 }}
            stroke="var(--color-muted-foreground)"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(val) => formatValue(val)}
            width={80}
            domain={[yMin, chart_y_max]}
            allowDataOverflow={true}
          />
          <RTooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              fontSize: 12,
              backgroundColor: "var(--color-card)",
            }}
            formatter={(val: number) => formatValue(val)}
          />
          <Bar
            dataKey="ytdTargetBar"
            name="YTD Target"
            fill="#0078D7"
            barSize={30}
            label={<CustomBarLabel />}
          />
          <Bar
            dataKey="ytdActualBar"
            name="YTD Actual"
            fill="#808080"
            barSize={30}
            label={<CustomBarLabel />}
          />
          <Line
            type="linear"
            dataKey="metaLine"
            name="Meta"
            stroke="#4DB8FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#4DB8FF" }}
            isAnimationActive={false}
          />
          <Line
            type="linear"
            dataKey="actualLine"
            name="Actual"
            stroke="#0078D7"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#0078D7" }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </SafeResponsiveContainer>
    </div>
  );
}
