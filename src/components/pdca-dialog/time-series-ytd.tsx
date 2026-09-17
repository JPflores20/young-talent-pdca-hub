import { useEffect, useState, useMemo, useCallback, useRef, Fragment } from "react";
import {
  Check,
  UploadCloud,
  Paperclip,
  Plus,
  Save,
  ArrowRight,
  ArrowDown,
  MinusCircle,
  X,
  RefreshCw,
  FileText,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceArea,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PdcaComments } from "../pdca-comments";
import { PdcaHistory } from "../pdca-history";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PhaseBadge } from "@/components/pdca-badge";
import {
  phases,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
  DEFAULT_PARTICIPANTES,
  type ParticipantesData,
  type ActionItem,
  type Pdca,
  type Phase,
  type ParetoItem,
  type VpoCheckpointItem,
  type DefinicionMeta,
  type ImpactMatrixRow,
  type FiveWhysTableData,
  type IshikawaItem,
} from "@/data/pdca";
import {
  PdcaGoalDefinition,
  PdcaParticipants,
  DEFAULT_DEFINICION_META,
} from "@/components/pdca-goal-definition";
import { KpiTreeInteractive } from "../kpi-tree";
import { ActionKanban } from "../action-kanban";
// Removed firestore imports
import { db } from "@/lib/firebase";
import { GopThemesSection } from "../GopThemesSection";
import { ImageUploadSection, MultiImageUploadSection } from "../image-upload-section";
import { DatePicker } from "@/components/ui/date-picker";
import { savePdcaToFirestore } from "@/services/pdca-service";
import { useAuth } from "@/context/auth-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "./step-instructions";

export function TimeSeriesYTD({
  value,
  onChange,
  unit = "$",
  onUnitChange,
  isStepCompleted,
  onToggleStep,
  title = "PASO 3: CURRENT TIME SERIES",
  chartTitle = "CURRENT TIME SERIES",
  onTitleChange,
}: {
  value?: { mes: string; target: number; actual: number | null }[];
  onChange?: (newSeries: { mes: string; target: number; actual: number | null }[]) => void;
  unit?: string;
  onUnitChange?: (newUnit: string) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  title?: string | undefined;
  chartTitle?: string | undefined;
  onTitleChange?: ((newTitle: string) => void) | undefined;
}) {
  const series = value && value.length > 0 ? value : DEFAULT_TARGET_VS_ACTUAL;

  const [y_axis_min, set_y_axis_min] = useState<number>(0);
  const [y_axis_max_str, set_y_axis_max_str] = useState<string>("auto");
  const chart_y_max =
    y_axis_max_str.trim() === "auto" || y_axis_max_str.trim() === ""
      ? "auto"
      : Number(y_axis_max_str);

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

  const CustomActualLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    return (
      <text
        x={x}
        y={y - 10}
        fill="var(--color-foreground)"
        fontSize={9}
        textAnchor="middle"
        fontWeight="bold"
      >
        {formatValue(value)}
      </text>
    );
  };

  const CustomMetaLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    return (
      <text x={x} y={y + 16} fill="#4DB8FF" fontSize={9} textAnchor="middle" fontWeight="bold">
        {formatValue(value)}
      </text>
    );
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
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
        {formatValue(value)}
      </text>
    );
  };

  return (
    <StepCard
      className="col-span-full"
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >
      <StepInstructions>
        <p className="mb-1">1. Rellena el campo gris con su problema.</p>
        <p className="mb-1">
          2. Completa el período de tiempo con tu período de tiempo deseado (años, meses, semanas,
          días, etc.)
        </p>
        <p>3. Rellena las columnas "Objetivo" y "Actual" con tus datos.</p>
      </StepInstructions>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Unidad de Medida:
            </span>
            <Input
              value={unit}
              onChange={(e) => {
                if (onUnitChange) onUnitChange(e.target.value);
              }}
              placeholder="ej. $, %, HL"
              className="w-28 h-7 text-xs font-bold"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20 hidden md:flex">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Eje Y —
            </span>
            <span className="text-xs text-muted-foreground">Min:</span>
            <Input
              type="number"
              value={y_axis_min}
              onChange={(e) => set_y_axis_min(Number(e.target.value))}
              className="w-20 h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">Max:</span>
            <Input
              type="text"
              value={y_axis_max_str}
              onChange={(e) => set_y_axis_max_str(e.target.value)}
              placeholder="auto"
              className="w-20 h-7 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Plantilla Rápida:
          </span>
          <Select
            onValueChange={(val) => {
              if (
                window.confirm(
                  "Cambiar la plantilla reemplazará los datos actuales en la tabla. ¿Deseas continuar?",
                )
              ) {
                if (val === "meses") {
                  if (onChange)
                    onChange([
                      { mes: "Ene", target: 0, actual: null },
                      { mes: "Feb", target: 0, actual: null },
                      { mes: "Mar", target: 0, actual: null },
                      { mes: "Abr", target: 0, actual: null },
                      { mes: "May", target: 0, actual: null },
                      { mes: "Jun", target: 0, actual: null },
                      { mes: "Jul", target: 0, actual: null },
                      { mes: "Ago", target: 0, actual: null },
                      { mes: "Sep", target: 0, actual: null },
                      { mes: "Oct", target: 0, actual: null },
                      { mes: "Nov", target: 0, actual: null },
                      { mes: "Dic", target: 0, actual: null },
                    ]);
                } else if (val.startsWith("sem-")) {
                  const month = val.split("-")[1];
                  if (onChange)
                    onChange([
                      { mes: `${month} Sem 1`, target: 0, actual: null },
                      { mes: `${month} Sem 2`, target: 0, actual: null },
                      { mes: `${month} Sem 3`, target: 0, actual: null },
                      { mes: `${month} Sem 4`, target: 0, actual: null },
                      { mes: `${month} Sem 5`, target: 0, actual: null },
                    ]);
                }
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs w-[180px] bg-secondary/30">
              <SelectValue placeholder="Elegir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meses">12 Meses (Anual)</SelectItem>
              <SelectItem value="sem-Ene">Enero (Semanas)</SelectItem>
              <SelectItem value="sem-Feb">Febrero (Semanas)</SelectItem>
              <SelectItem value="sem-Mar">Marzo (Semanas)</SelectItem>
              <SelectItem value="sem-Abr">Abril (Semanas)</SelectItem>
              <SelectItem value="sem-May">Mayo (Semanas)</SelectItem>
              <SelectItem value="sem-Jun">Junio (Semanas)</SelectItem>
              <SelectItem value="sem-Jul">Julio (Semanas)</SelectItem>
              <SelectItem value="sem-Ago">Agosto (Semanas)</SelectItem>
              <SelectItem value="sem-Sep">Septiembre (Semanas)</SelectItem>
              <SelectItem value="sem-Oct">Octubre (Semanas)</SelectItem>
              <SelectItem value="sem-Nov">Noviembre (Semanas)</SelectItem>
              <SelectItem value="sem-Dic">Diciembre (Semanas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mt-4">
        {/* Table Side */}
        <div className="w-full xl:w-[40%] overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr className="bg-[#0078D7] text-white">
                <th className="border-r border-white/20 p-2 font-bold w-[30%]">PERÍODO</th>
                <th className="border-r border-white/20 p-2 font-bold w-[30%]">META</th>
                <th className="border-r border-white/20 p-2 font-bold w-[30%]">ACTUAL</th>
                <th className="p-1 w-[10%]">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                    onClick={addRow}
                  >
                    <Plus className="size-3" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((s, i) => (
                <tr key={i} className="border-b border-border/40 group">
                  <td className="border-r border-border/40 p-0 font-semibold bg-[#E2E2E2] dark:bg-secondary/30">
                    <Input
                      value={s.mes}
                      onChange={(e) => updateMes(i, e.target.value)}
                      className="h-8 rounded-none border-none shadow-none text-xs text-center font-semibold bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                    />
                  </td>
                  <td className="border-r border-border/40 p-0">
                    <Input
                      type="number"
                      value={s.target || ""}
                      onChange={(e) => updateTarget(i, e.target.value)}
                      className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                    />
                  </td>
                  <td className="border-r border-border/40 p-0">
                    <Input
                      type="number"
                      value={s.actual ?? ""}
                      onChange={(e) => updateActual(i, e.target.value)}
                      className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                    />
                  </td>
                  <td className="p-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeRow(i)}
                    >
                      <X className="size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="border-b border-border/40">
                <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
                  YTD Target
                </td>
                <td className="border-r border-border/40 p-2 font-bold font-mono text-[#0078D7]">
                  {formatValue(ytdTarget)}
                </td>
                <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
                <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
              </tr>
              <tr>
                <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
                  YTD Actual
                </td>
                <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
                <td className="border-r border-border/40 p-2 font-bold font-mono text-muted-foreground">
                  {formatValue(ytdActual)}
                </td>
                <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Chart Side */}
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
          <ResponsiveContainer width="100%" height="100%">
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
                domain={[y_axis_min, chart_y_max]}
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
                dot={{ r: 4, fill: "#4DB8FF" }}
                label={<CustomMetaLabel />}
                isAnimationActive={false}
              />
              <Line
                type="linear"
                dataKey="actualLine"
                name="Actual"
                stroke="#0078D7"
                strokeWidth={2}
                dot={{ r: 4, fill: "#0078D7" }}
                label={<CustomActualLabel />}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </StepCard>
  );
}

// ─── IMPACT MATRIX ───────────────────────────────────────────────────────────
