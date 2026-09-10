import { useState } from "react";
import { ArrowRight, Plus, X, FileText, Maximize2 } from "lucide-react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "./step-instructions";
import type { ParetoItem } from "@/data/pdca";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParetoInteractiveProps {
  title?: string;
  subtitle?: string;
  level?: number;
  data?: ParetoItem[];
  onDataChange?: (new_data: ParetoItem[]) => void;
  onBarClick?: (category: string) => void;
  onClose?: () => void;
  unit?: string;
  onUnitChange?: (new_unit: string) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
  onAddRoot?: () => void;
  chart_title?: string;
  on_chart_title_change?: (new_title: string) => void;
}

interface ParetoRow extends ParetoItem {
  ind_pct: number;
  cum_pct: number;
}

// ─── Pure data helpers ────────────────────────────────────────────────────────

function build_pareto_data(raw_data: ParetoItem[]): {
  sorted: ParetoItem[];
  total_gap: number;
  pareto_rows: ParetoRow[];
} {
  const sorted = [...raw_data].sort((a, b) => (b.gap || 0) - (a.gap || 0));
  const total_gap = sorted.reduce((s, i) => s + (i.gap || 0), 0);
  let running = 0;
  const pareto_rows: ParetoRow[] = sorted.map((item) => {
    const ind_pct = total_gap > 0 ? ((item.gap || 0) / total_gap) * 100 : 0;
    running += ind_pct;
    return { ...item, ind_pct, cum_pct: running };
  });
  return { sorted, total_gap, pareto_rows };
}

function format_value(val: number, unit: string): string {
  if (val === null || val === undefined || isNaN(val)) return "";
  const s = Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (unit === "$") return "$" + s;
  return s + (unit ? (unit === "%" ? "%" : " " + unit) : "");
}

// ─── Custom bar label ─────────────────────────────────────────────────────────

function CustomBarLabel(props: {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  unit: string;
}) {
  const { x = 0, y = 0, width = 0, value, unit } = props;
  if (value === null || value === undefined) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      fill="currentColor"
      fontSize={9}
      textAnchor="start"
      fontWeight="bold"
      transform={`rotate(-45 ${x + width / 2} ${y - 5})`}
    >
      {format_value(value, unit)}
    </text>
  );
}

// ─── Pareto Chart ─────────────────────────────────────────────────────────────

function ParetoChart({
  pareto_rows,
  on_bar_click,
  unit,
  y_axis_min,
  y_axis_max,
  chart_title,
  on_chart_title_change,
  max_bar_size = 40,
}: {
  pareto_rows: ParetoRow[];
  on_bar_click?: (area: string) => void;
  unit: string;
  y_axis_min: number;
  y_axis_max: number | "auto";
  chart_title: string;
  on_chart_title_change: (t: string) => void;
  max_bar_size?: number;
}) {
  const bottom_margin = Math.max(60, Math.min(130, 40 + pareto_rows.length * 5));
  return (
    <div className="flex flex-col gap-1 w-full h-full">
      
      <ResponsiveContainer width="100%" height="100%">
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
            angle={-40}
            textAnchor="end"
            height={bottom_margin}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            stroke="hsl(var(--muted-foreground))"
            tickFormatter={(v) => format_value(v, unit)}
            domain={[y_axis_min, y_axis_max]}
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
            onClick={(payload) => {
              if (on_bar_click && payload.area) on_bar_click(payload.area);
            }}
            className={on_bar_click ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
            label={<CustomBarLabel unit={unit} />}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cum_pct"
            name="Acumulado"
            stroke="#ff4d4f"
            strokeWidth={2}
            dot={{ r: 4, fill: "white", stroke: "#ff4d4f", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── ParetoInteractive ────────────────────────────────────────────────────────

export function ParetoInteractive({
  title = "Analisis de Pareto (PASO 5)",
  subtitle = "Desglosa el KPI para encontrar el 80/20.",
  level = 0,
  data = [],
  onDataChange,
  onBarClick,
  onClose,
  unit = "",
  onUnitChange,
  isStepCompleted,
  onToggleStep,
  onAddRoot,
  chart_title: external_chart_title,
  on_chart_title_change: external_on_title_change,
}: ParetoInteractiveProps) {
  const [is_paste_open, set_is_paste_open] = useState(false);
  const [paste_data, set_paste_data] = useState("");
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const [internal_title, set_internal_title] = useState("");
  const [y_axis_min, set_y_axis_min] = useState<number>(0);
  const [y_axis_max_str, set_y_axis_max_str] = useState<string>("");

  const chart_title = external_chart_title !== undefined ? external_chart_title : internal_title;
  const on_title_change = external_on_title_change ?? set_internal_title;
  const y_axis_max: number | "auto" = y_axis_max_str === "" ? "auto" : Number(y_axis_max_str);

  const { pareto_rows, total_gap } = build_pareto_data(data);

  const add_row = () => {
    if (onDataChange) onDataChange([...data, { id: Date.now(), area: "", gap: 0 }]);
  };
  const update_row = (id: number, field: "area" | "gap", value: string | number) => {
    if (onDataChange) onDataChange(data.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };
  const remove_row = (id: number) => {
    if (onDataChange) onDataChange(data.filter((d) => d.id !== id));
  };

  const handle_import_excel = () => {
    if (!paste_data.trim()) return;
    const agg: Record<string, number> = {};
    for (const line of paste_data.split("\n")) {
      if (!line.trim()) continue;
      const parts = line.split("\t");
      let cat = "";
      let val = 0;
      if (parts.length >= 2) {
        cat = parts[0].trim();
        val = parseFloat(parts[1].replace(/,/g, "").trim()) || 0;
      } else {
        const fb = line.split(",");
        if (fb.length >= 2) { cat = fb[0].trim(); val = parseFloat(fb[1].replace(/,/g, "").trim()) || 0; }
        else { cat = line.trim(); val = 1; }
      }
      if (cat) agg[cat] = (agg[cat] || 0) + val;
    }
    if (onDataChange) {
      const ex: Record<string, number> = {};
      data.forEach((item) => {
        if (item.area?.trim()) ex[item.area.trim()] = (ex[item.area.trim()] || 0) + (item.gap || 0);
      });
      for (const c in agg) ex[c] = (ex[c] || 0) + agg[c];
      onDataChange(Object.keys(ex).map((c) => ({ id: Date.now() + Math.random(), area: c, gap: ex[c] })));
    }
    set_is_paste_open(false);
    set_paste_data("");
    toast.success("Datos importados correctamente");
  };

  const make_chart = (max_bar_size: number) => (
    <ParetoChart
      pareto_rows={pareto_rows}
      on_bar_click={onBarClick}
      unit={unit}
      y_axis_min={y_axis_min}
      y_axis_max={y_axis_max}
      chart_title={chart_title}
      on_chart_title_change={on_title_change}
      max_bar_size={max_bar_size}
    />
  );

  return (
    <StepCard
      className="col-span-full animate-in fade-in zoom-in-95"
      title={
        <div className="flex items-center gap-2">
          {level > 0 && <ArrowRight className="size-4 text-muted-foreground" />}
          <span>{title}</span>
          <span className="text-muted-foreground/50 font-normal">-</span>
          <Input
            value={chart_title}
            onChange={(e) => on_chart_title_change(e.target.value)}
            placeholder="Nombre del pareto (opcional)"
            className="h-7 text-sm font-medium border-dashed bg-transparent shadow-none
              placeholder:text-muted-foreground/50 focus-visible:bg-background w-64 px-2"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      }
      isStepCompleted={level === 0 ? isStepCompleted : undefined}
      onToggleStep={level === 0 ? onToggleStep : undefined}
      headerRight={
        <div className="flex gap-2">
          {onClose && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <X className="size-4 mr-2" /> Cerrar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar Pareto</AlertDialogTitle>
                  <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onClose}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {onAddRoot && (
            <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onAddRoot(); }}>
              <Plus className="size-4 mr-2" /> Nuevo Pareto
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); set_is_paste_open(true); }}>
            <FileText className="size-4 mr-2" /> Importar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); add_row(); }}>
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
          <Dialog open={is_paste_open} onOpenChange={set_is_paste_open}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Importar Datos desde Excel</DialogTitle>
                <DialogDescription>Copia dos columnas (Categoria, Valor) y pegalas aqui.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  value={paste_data}
                  onChange={(e) => set_paste_data(e.target.value)}
                  placeholder={"Ejemplo:\nFalla A\t10\nFalla B\t5"}
                  className="min-h-[200px] text-xs font-mono whitespace-pre"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => set_is_paste_open(false)}>Cancelar</Button>
                  <Button onClick={handle_import_excel}>Importar y Generar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground ml-9 mb-4">
        {subtitle} {onBarClick && "Haz clic en una barra para desglosarla."}
      </p>

      {level === 0 && (
        <StepInstructions>
          <p className="mb-2">1. Identifica las categorias para desglosar el KPI (eje X).</p>
          <p className="mb-2">2. Introduce el valor o gap de cada categoria.</p>
          <p className="mb-2">3. La grafica de Pareto se genera automaticamente.</p>
          <p>4. Haz clic en una barra para crear un Sub-Pareto de nivel 2.</p>
        </StepInstructions>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {level === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Unidad de Medida:
            </span>
            <Input
              value={unit}
              onChange={(e) => { if (onUnitChange) onUnitChange(e.target.value); }}
              placeholder="ej. $, %, HL"
              className="w-28 h-7 text-xs font-bold"
            />
          </div>
        )}
        <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Eje Y —</span>
          <span className="text-xs text-muted-foreground">Min:</span>
          <Input
            type="number"
            value={y_axis_min}
            onChange={(e) => set_y_axis_min(Number(e.target.value))}
            className="w-20 h-7 text-xs"
          />
          <span className="text-xs text-muted-foreground">Max:</span>
          <Input
            type="number"
            value={y_axis_max_str}
            onChange={(e) => set_y_axis_max_str(e.target.value)}
            placeholder="auto"
            className="w-20 h-7 text-xs"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Table */}
        <div className="overflow-x-auto border rounded-md">
          <Table className="text-xs">
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="py-2 px-3">Area / Categoria</TableHead>
                <TableHead className="py-2 px-3 w-24">Valor (Gap)</TableHead>
                <TableHead className="py-2 px-3 w-20">% Ind.</TableHead>
                <TableHead className="py-2 px-3 w-20">% Acum.</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pareto_rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-1.5 px-3">
                    <Input
                      value={row.area}
                      onChange={(e) => update_row(row.id, "area", e.target.value)}
                      placeholder="Ej. Envasado..."
                      className="h-7 text-xs shadow-none border-0 px-1 bg-transparent
                        hover:bg-secondary/50 focus-visible:bg-background"
                    />
                  </TableCell>
                  <TableCell className="py-1.5 px-3">
                    <Input
                      type="number"
                      value={row.gap || ""}
                      onChange={(e) => update_row(row.id, "gap", Number(e.target.value))}
                      className="h-7 text-xs shadow-none border-0 px-1 bg-transparent
                        hover:bg-secondary/50 focus-visible:bg-background text-right"
                    />
                  </TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-muted-foreground">
                    {row.ind_pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-muted-foreground font-semibold">
                    {row.cum_pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-1.5">
                    {data.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => remove_row(row.id)}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-secondary/20">
                <TableCell className="py-2 px-3 font-bold text-right">TOTAL</TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono text-right">
                  {format_value(total_gap, unit)}
                </TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Inline chart */}
        {!is_fullscreen && (
          <div className="h-[400px] border rounded-md p-3 flex flex-col relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-6 px-2 text-[10px] text-[#0078D7]
                hover:bg-blue-50 dark:hover:bg-blue-950 font-bold z-10"
              onClick={() => set_is_fullscreen(true)}
            >
              <Maximize2 className="mr-1 size-3" /> Expandir
            </Button>
            {make_chart(40)}
          </div>
        )}
      </div>

      {/* Fullscreen */}
      <Dialog open={is_fullscreen} onOpenChange={set_is_fullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-4 sm:p-6 flex flex-col bg-background">
          <DialogHeader>
            <DialogTitle>{title} {chart_title ? `- ${chart_title}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ParetoChart
              pareto_rows={pareto_rows}
              on_bar_click={(cat) => {
                if (onBarClick) { onBarClick(cat); set_is_fullscreen(false); }
              }}
              unit={unit}
              y_axis_min={y_axis_min}
              y_axis_max={y_axis_max}
              chart_title={chart_title}
              on_chart_title_change={on_title_change}
              max_bar_size={60}
            />
          </div>
        </DialogContent>
      </Dialog>
    </StepCard>
  );
}

// ─── ParetoSection ────────────────────────────────────────────────────────────

export function ParetoSection({
  drillDowns,
  setDrillDowns,
  dataMap,
  setDataMap,
  unit = "",
  onUnitChange,
  isStepCompleted,
  onToggleStep,
}: {
  drillDowns: string[];
  setDrillDowns: (d: string[]) => void;
  dataMap: Record<string, ParetoItem[]>;
  setDataMap: (m: Record<string, ParetoItem[]>) => void;
  unit?: string;
  onUnitChange?: (new_unit: string) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const [title_map, set_title_map] = useState<Record<string, string>>({});

  const root_keys = Object.keys(dataMap)
    .filter((k) => k === "root" || k.startsWith("root-"))
    .sort();
  if (root_keys.length === 0) root_keys.push("root");

  const update_data = (path: string, new_data: ParetoItem[]) =>
    setDataMap({ ...dataMap, [path]: new_data });
  const update_title = (path: string, t: string) =>
    set_title_map({ ...title_map, [path]: t });

  const handle_bar_click = (cat: string, level: number, parent: string) => {
    if (!cat) return;
    const new_path =
      parent === "root"
        ? `level-${level + 1}-${cat}`
        : `${parent}-level-${level + 1}-${cat}`;
    const is_legacy = drillDowns.length > 0 && !drillDowns[0].includes("level-");
    const drills = is_legacy
      ? drillDowns.map((d, i) => `level-${i + 1}-${d}`)
      : [...drillDowns];
    if (!drills.includes(new_path)) setDrillDowns([...drills, new_path]);
    if (!dataMap[new_path]) setDataMap({ ...dataMap, [new_path]: [] });
  };

  const handle_close_drill = (path: string) => {
    const is_legacy = drillDowns.length > 0 && !drillDowns[0].includes("level-");
    const drills = is_legacy
      ? drillDowns.map((d, i) => `level-${i + 1}-${d}`)
      : [...drillDowns];
    setDrillDowns(drills.filter((p) => p !== path && !p.startsWith(`${path}-`)));
    const m = { ...dataMap };
    Object.keys(m).forEach((k) => { if (k === path || k.startsWith(`${path}-`)) delete m[k]; });
    setDataMap(m);
  };

  const handle_close_root = (key: string) => {
    setDrillDowns(drillDowns.filter((p) => !p.startsWith(`${key}-`)));
    const m = { ...dataMap };
    Object.keys(m).forEach((k) => { if (k === key || k.startsWith(`${key}-`)) delete m[k]; });
    setDataMap(m);
  };

  const handle_add_root = () =>
    setDataMap({ ...dataMap, [`root-${Date.now()}`]: [] });

  const parse_path = (path: string, idx: number) => {
    if (!path.includes("level-"))
      return { actual_path: `level-${idx + 1}-${path}`, level: idx + 1, category: path };
    if (path.includes("-level-")) {
      const parts = path.split("-level-");
      const rest = parts[1].split("-");
      return { actual_path: path, level: parseInt(rest[0], 10), category: rest.slice(1).join("-") };
    }
    const parts = path.split("-");
    return { actual_path: path, level: parseInt(parts[1], 10), category: parts.slice(2).join("-") };
  };

  return (
    <div className="space-y-4">
      {root_keys.map((key, idx) => (
        <ParetoInteractive
          key={key}
          title={idx === 0 ? "PASO 5: PARETO" : `PASO 5: PARETO INDEPENDIENTE ${idx + 1}`}
          level={0}
          data={dataMap[key] || []}
          onDataChange={(d) => update_data(key, d)}
          onBarClick={(cat) => handle_bar_click(cat, 0, key)}
          unit={unit}
          onAddRoot={idx === 0 ? handle_add_root : undefined}
          onClose={idx > 0 ? () => handle_close_root(key) : undefined}
          {...(onUnitChange ? { onUnitChange } : {})}
          isStepCompleted={idx === 0 ? isStepCompleted : undefined}
          {...(idx === 0 && onToggleStep ? { onToggleStep } : {})}
          chart_title={title_map[key] || ""}
          on_chart_title_change={(t) => update_title(key, t)}
        />
      ))}
      {drillDowns.map((drill, idx) => {
        const { actual_path, level, category } = parse_path(drill, idx);
        return (
          <ParetoInteractive
            key={actual_path}
            level={level}
            title={`Sub-Pareto: ${category}`}
            subtitle={`Desglose (Nivel ${level + 1}) de la categoria ${category}.`}
            data={dataMap[actual_path] || []}
            onDataChange={(d) => update_data(actual_path, d)}
            onBarClick={(cat) => handle_bar_click(cat, level, actual_path)}
            onClose={() => handle_close_drill(actual_path)}
            unit={unit}
            {...(onUnitChange ? { onUnitChange } : {})}
            chart_title={title_map[actual_path] || ""}
            on_chart_title_change={(t) => update_title(actual_path, t)}
          />
        );
      })}
    </div>
  );
}
