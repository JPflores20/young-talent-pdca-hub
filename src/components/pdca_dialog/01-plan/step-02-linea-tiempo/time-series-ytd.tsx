import { StepCard } from "@/components/ui/step-card";
import { DEFAULT_TARGET_VS_ACTUAL } from "@/data/pdca";
import { TimeSeriesHeader } from "./time-series-header";
import { TimeSeriesTable } from "./time-series-table";
import { TimeSeriesChart } from "./time-series-chart";

export function TimeSeriesYTD({
  value,
  onChange,
  unit = "$",
  onUnitChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title = "PASO 3: SITUACIÓN ACTUAL",
  chartTitle = "SITUACIÓN ACTUAL",
  onTitleChange,
  customBadge,
  yMin = 0,
  onYMinChange,
  yMax = "auto",
  onYMaxChange,
}: {
  value?: { mes: string; target: number; actual: number | null }[] | undefined;
  onChange?: ((newSeries: { mes: string; target: number; actual: number | null }[]) => void) | undefined;
  unit?: string | undefined;
  onUnitChange?: ((newUnit: string) => void) | undefined;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
  chartTitle?: string | undefined;
  onTitleChange?: ((newTitle: string) => void) | undefined;
  customBadge?: React.ReactNode | undefined;
  yMin?: number | undefined;
  onYMinChange?: ((newYMin: number) => void) | undefined;
  yMax?: string | undefined;
  onYMaxChange?: ((newYMax: string) => void) | undefined;
}) {
  const series = value && value.length > 0 ? value : DEFAULT_TARGET_VS_ACTUAL;

  const chart_y_max =
    String(yMax).trim() === "auto" || String(yMax).trim() === ""
      ? "auto"
      : Number(yMax);

  const updateMes = (index: number, val: string) => {
    const updated = series.map((s, i) => {
      if (i === index) {
        return { ...s, mes: val };
      }
      return s;
    });
    if (onChange) onChange(updated);
  };

  const addRow = () => {
    const updated = [...series, { mes: "Nuevo", target: 0, actual: null }];
    if (onChange) onChange(updated);
  };

  const removeRow = (index: number) => {
    if (series.length <= 1) return;
    const updated = series.filter((_, i) => i !== index);
    if (onChange) onChange(updated);
  };

  const updateActual = (index: number, val: string) => {
    const updated = series.map((s, i) => {
      if (i === index) {
        return { ...s, actual: val === "" ? null : Number(val) };
      }
      return s;
    });
    if (onChange) onChange(updated);
  };

  const updateTarget = (index: number, val: string) => {
    const updated = series.map((s, i) => {
      if (i === index) {
        return { ...s, target: val === "" ? 0 : Number(val) };
      }
      return s;
    });
    if (onChange) onChange(updated);
  };

  const ytdTarget =
    series.length > 0 ? series.reduce((sum, s) => sum + (s.target || 0), 0) / series.length : 0;
  const actuals = series.filter((s) => s.actual !== null && s.actual !== undefined);
  const ytdActual =
    actuals.length > 0 ? actuals.reduce((sum, s) => sum + (s.actual || 0), 0) / actuals.length : 0;

  const chartData = [
    ...series.map((s) => ({
      name: s.mes,
      metaLine: s.target,
      actualLine: s.actual,
      ytdTargetBar: null,
      ytdActualBar: null,
    })),
    {
      name: "YTD Target",
      metaLine: null,
      actualLine: null,
      ytdTargetBar: ytdTarget,
      ytdActualBar: null,
    },
    {
      name: "YTD Actual",
      metaLine: null,
      actualLine: null,
      ytdTargetBar: null,
      ytdActualBar: ytdActual,
    },
  ];

  const formatValue = (val: any) => {
    if (val === null || val === undefined || isNaN(val)) return "";
    const numStr = Number(val).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (unit === "$") {
      return "$" + numStr;
    }
    return numStr + (unit ? (unit === "%" ? "%" : " " + unit) : "");
  };

  return (
    <StepCard
      className="col-span-full"
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={customBadge}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <TimeSeriesHeader
        unit={unit}
        onUnitChange={onUnitChange}
        yMin={yMin}
        onYMinChange={onYMinChange}
        yMax={yMax}
        onYMaxChange={onYMaxChange}
        onChange={onChange}
      />

      <div className="flex flex-col xl:flex-row gap-6 mt-4">
        <TimeSeriesTable
          series={series}
          updateMes={updateMes}
          updateTarget={updateTarget}
          updateActual={updateActual}
          addRow={addRow}
          removeRow={removeRow}
          ytdTarget={ytdTarget}
          ytdActual={ytdActual}
          formatValue={formatValue}
        />

        <TimeSeriesChart
          chartData={chartData}
          chart_y_max={chart_y_max}
          yMin={yMin}
          chartTitle={chartTitle}
          onTitleChange={onTitleChange}
          formatValue={formatValue}
        />
      </div>
    </StepCard>
  );
}
