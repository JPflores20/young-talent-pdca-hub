import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckSquare, Square, TrendingUp, Target, ListChecks, Activity } from "lucide-react";
import type {
  DefinicionMeta,
  VpoCheckpointItem,
  ParetoItem,
  ImpactMatrixRow,
  ActionItem,
} from "@/data/pdca";
import { SafeResponsiveContainer } from "@/components/ui/safe-responsive-container";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface PhaseResumenProps {
  goal_definition: DefinicionMeta | undefined;
  vpo_checkpoints: VpoCheckpointItem[] | undefined;
  pareto_data_map: Record<string, ParetoItem[]> | undefined;
  nuevo_pareto_data_map: Record<string, ParetoItem[]> | undefined;
  impact_matrix: ImpactMatrixRow[] | undefined;
  final_time_series_data: { mes: string; target: number; actual: number | null }[] | undefined;
  progreso: number;
  action_items?: ActionItem[] | undefined;
}

export const PdcaPhaseResumen: React.FC<PhaseResumenProps> = ({
  goal_definition,
  vpo_checkpoints,
  pareto_data_map,
  nuevo_pareto_data_map,
  impact_matrix,
  final_time_series_data,
  progreso,
  action_items,
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const meta = goal_definition || { kpi: "", pis: "", desdeValor: "", aValor: "", unidadMedida: "" };
  const vpoChecks = vpo_checkpoints || [];
  const initialParetoRoot = pareto_data_map?.["root"] || [];
  const newParetoRoot = nuevo_pareto_data_map?.["root"] || [];
  const matrix = impact_matrix || [];

  // YTD Jan-Dec time series from Paso 26 / Paso 7
  const timeSeries = final_time_series_data || [];

  const yesCount = vpoChecks.filter(c => c.status === "YES").length;
  const noCount = vpoChecks.filter(c => c.status === "NO").length;
  const totalValid = vpoChecks.filter(c => c.status !== "N/A").length;

  const kpiLabel = meta.kpi || "—";
  const desdeVal = (meta as any).desde_valor || meta.desdeValor || "—";
  const aVal = (meta as any).a_valor || meta.aValor || "—";
  const unidad = (meta as any).unidad_medida || meta.unidadMedida || "";

  // Combine actions from impact_matrix and action_items
  const displayActions = Array.isArray(action_items) && action_items.length > 0
    ? action_items.map((act) => ({
        issue: act.tema || act.what || "—",
        root_cause: act.causaRaiz || act.causaRaiz2 || "—",
        accion: act.accion || act.accion2 || act.what || "—",
        priorizar: act.priorizar || "NO",
        quickWin: act.quickWin || "NO",
        herramientaSdca: act.herramientaSdca || "—",
      }))
    : matrix.map((m) => ({
        issue: m.issue || "—",
        root_cause: m.root_cause || m.rootCause || "—",
        accion: m.accion || "—",
        priorizar: m.priorizar || "NO",
        quickWin: "NO",
        herramientaSdca: "—",
      }));

  const completedActionsCount = Array.isArray(action_items) && action_items.length > 0
    ? action_items.filter((a) => a.status === "Completada" || a.done).length
    : 0;

  // Calculate GAP if numeric
  let gapText = "—";
  const numDesde = parseFloat(desdeVal);
  const numA = parseFloat(aVal);
  if (!isNaN(numDesde) && !isNaN(numA)) {
    const diff = +(numA - numDesde).toFixed(2);
    gapText = `${diff > 0 ? "+" : ""}${diff} ${unidad}`.trim();
  }

  return (
    <div className="space-y-5 pb-6">

      {/* ── FILA 1: Métricas Principales (3 Cajas Rojas en boceto) ────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Box 1: Target / GAP & Indicador */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
          <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Activity className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">Indicador</p>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                GAP: {gapText}
              </span>
            </div>
            <p className="text-sm font-bold truncate mt-0.5">{kpiLabel}</p>
            <p className="text-[11px] text-muted-foreground">Target: <strong className="text-foreground font-semibold">{desdeVal} → {aVal} {unidad}</strong></p>
          </div>
        </div>

        {/* Box 2: Avance PDCA & SDCA Check */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
          <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
            <TrendingUp className="size-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground leading-tight">Avance PDCA & SDCA Check</p>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progreso}%</span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progreso}%` }} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>SDCA Check: <strong className="text-foreground font-semibold">{yesCount}/{totalValid}</strong></span>
              <span>{noCount > 0 ? `${noCount} pendientes` : "Al corriente"}</span>
            </div>
          </div>
        </div>

        {/* Box 3: Acciones Plan */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-card shadow-sm">
          <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <ListChecks className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">Acciones Plan</p>
            <p className="text-xl font-bold">{completedActionsCount} <span className="text-xs font-normal text-muted-foreground">de {displayActions.length} totales</span></p>
            <p className="text-[11px] text-muted-foreground">completadas en el plan</p>
          </div>
        </div>
      </div>

      {/* ── FILA 2: Gráficos y Visuales (3 Cajas Azules en boceto) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna 1: Tendencia del KPI (paso 26) */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-blue-500" />
              Tendencia del KPI (Paso 26)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {timeSeries.length > 0 && mounted ? (
              <div className="h-[200px] w-full">
                <SafeResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeries} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="actual" stroke="#0078D7" strokeWidth={2} name="Real" connectNulls dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} name="Target" dot={false} />
                  </LineChart>
                </SafeResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center">Sin datos de serie de tiempo aún (Paso 26).</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna 2: Pareto Antes (paso 10) */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BarChart className="size-3.5 text-red-500" />
              Pareto Antes (Paso 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {initialParetoRoot.length > 0 && mounted ? (
              <div className="h-[200px] w-full">
                <SafeResponsiveContainer width="100%" height="100%">
                  <BarChart data={initialParetoRoot} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="gap" fill="#ef4444" radius={[3, 3, 0, 0]} name="Brecha" />
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center">Sin datos de Pareto inicial (Paso 10).</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Columna 3: Pareto Después (paso 24) */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-2 pt-4 px-4 border-b bg-muted/20">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <BarChart className="size-3.5 text-green-500" />
              Pareto Después (Paso 24)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pt-3 pb-2">
            {newParetoRoot.length > 0 && mounted ? (
              <div className="h-[200px] w-full">
                <SafeResponsiveContainer width="100%" height="100%">
                  <BarChart data={newParetoRoot} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="gap" fill="#22c55e" radius={[3, 3, 0, 0]} name="Brecha" />
                  </BarChart>
                </SafeResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed rounded-lg bg-secondary/10">
                <p className="text-xs text-muted-foreground text-center px-4">
                  Sin datos aún de Pareto Después.<br />
                  Se completará en la fase Check (Paso 24).
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── FILA 3: Tabla Completa del Paso 18 (Caja Verde en boceto) ─────────── */}
      <Card className="border-emerald-500/30 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2">
            <ListChecks className="size-4 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-foreground">
              Tabla Completa del Paso 18 · Plan de Acción
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
            {displayActions.length} acciones registradas
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/60 text-muted-foreground text-left">
                  <th className="py-2.5 px-3 font-semibold w-10 text-center">#</th>
                  <th className="py-2.5 px-3 font-semibold min-w-[150px]">Issue / Problema</th>
                  <th className="py-2.5 px-3 font-semibold min-w-[180px]">Causa Raíz</th>
                  <th className="py-2.5 px-3 font-semibold min-w-[240px]">Acción de Mejora</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Priorizar</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-24">Quick Win</th>
                  <th className="py-2.5 px-3 font-semibold min-w-[120px]">SDCA / SOP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayActions.map((act, i) => {
                  const isPrioritized = act.priorizar === "SI";
                  return (
                    <tr
                      key={i}
                      className={
                        isPrioritized
                          ? "bg-emerald-50/40 dark:bg-emerald-950/15 hover:bg-emerald-50/80 transition-colors"
                          : "hover:bg-muted/30 transition-colors"
                      }
                    >
                      <td className="py-2.5 px-3 font-bold text-center text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{act.issue}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{act.root_cause}</td>
                      <td className="py-2.5 px-3 font-medium text-foreground">{act.accion}</td>
                      <td className="py-2.5 px-3 text-center">
                        {act.priorizar === "SI" ? (
                          <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 text-[10px] py-0 px-2 font-bold">
                            SÍ
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] py-0 px-2 text-muted-foreground">
                            NO
                          </Badge>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {act.quickWin === "SI" ? (
                          <Badge variant="secondary" className="text-amber-700 bg-amber-100 dark:bg-amber-900/30 text-[10px] py-0 px-2 font-medium">
                            Quick Win
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">{act.herramientaSdca}</td>
                    </tr>
                  );
                })}
                {displayActions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No hay acciones registradas en el Paso 18.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ── SECCIÓN ADICIONAL: Paso 1 & Paso 2 (Colapsables para soporte) ───────── */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="detalles-proyecto" className="border rounded-xl bg-card shadow-sm overflow-hidden">
          <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:no-underline">
            Ver detalles del Paso 1 (Project Statement) y Paso 2 (SDCA Checklist)
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Paso 1 */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 1 · Project Statement</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 space-y-2 text-xs">
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                    <span className="font-medium text-muted-foreground">KPI</span>
                    <span>{meta.kpi || "—"}</span>
                    <span className="font-medium text-muted-foreground">PIs</span>
                    <span className="leading-snug">{meta.pis || "—"}</span>
                    <span className="font-medium text-muted-foreground">Meta</span>
                    <span>{desdeVal} → {aVal} {unidad}</span>
                    <span className="font-medium text-muted-foreground">Benchmark</span>
                    <span>{(meta as any).benchmark || "—"}</span>
                    <span className="font-medium text-muted-foreground">Responsable</span>
                    <span>{(meta as any).responsable || "—"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Paso 2: SDCA Checklist */}
              <Card>
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Paso 2 · SDCA Checklist</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                    {vpoChecks.map((check, i) => (
                      <div key={i} className="flex items-start gap-2">
                        {check.status === "YES" ? (
                          <CheckSquare className="size-3.5 text-green-500 mt-0.5 shrink-0" />
                        ) : check.status === "NO" ? (
                          <Square className="size-3.5 text-red-400 mt-0.5 shrink-0" />
                        ) : (
                          <div className="size-3.5 border rounded text-[7px] flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">N/A</div>
                        )}
                        <span className="text-xs leading-snug">{check.checkpoint}</span>
                      </div>
                    ))}
                    {vpoChecks.length === 0 && <p className="text-xs text-muted-foreground">Sin checkpoints registrados.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

    </div>
  );
};
