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
  CheckCircle2
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
  Legend
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
import { phases, DEFAULT_TARGET_VS_ACTUAL, DEFAULT_PARETO_DATA_MAP, DEFAULT_VPO_CHECKPOINTS, DEFAULT_PARTICIPANTES, type ParticipantesData, type ActionItem, type Pdca, type Phase, type ParetoItem, type VpoCheckpointItem, type DefinicionMeta, type ImpactMatrixRow, type FiveWhysTableData, type IshikawaItem } from "@/data/pdca";
import { PdcaGoalDefinition, PdcaParticipants, DEFAULT_DEFINICION_META } from "@/components/pdca-goal-definition";
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
import { AutoResizeTextarea } from "./auto-resize-textarea";


export const SCORE_OPTIONS = ["", "1", "3", "5"] as const;
const SCORE_LABELS: Record<string, string> = { "1": "Bajo", "3": "Medio", "5": "Alto" };
const SCORE_COLORS: Record<string, string> = {
  "1": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "3": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "5": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};


export function newImpactRow(): ImpactMatrixRow {
  return { id: `ir-${Date.now()}-${Math.random()}`, accion: "", seguridad: "", calidadHigiene: "", costo: "", medioAmbiente: "", servicio: "", priorizar: "" };
}


export function calcImpact(row: ImpactMatrixRow): number {
  const vals = [row.seguridad, row.calidadHigiene, row.costo, row.medioAmbiente, row.servicio];
  const nums = vals.filter((v): v is number => typeof v === "number" && v !== 0);
  if (nums.length === 0) return 0;
  return Math.max(...nums);
}


export function calcProduct(row: ImpactMatrixRow): number {
  const vals = [row.seguridad, row.calidadHigiene, row.costo, row.medioAmbiente, row.servicio];
  const nums = vals.filter((v): v is number => typeof v === "number" && v !== 0);
  if (nums.length === 0) return 0;
  return nums.reduce((acc, val) => acc * val, 1);
}


export function ImpactMatrixTable({
  rows,
  onChange,
  isStepCompleted,
  onToggleStep,
}: {
  rows: ImpactMatrixRow[];
  onChange: (rows: ImpactMatrixRow[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const updateRow = (id: string, field: keyof ImpactMatrixRow, val: any) => {
    onChange(rows.map(r => r.id === id ? { ...r, [field]: val } : r));
  };
  const addRow = () => onChange([...rows, newImpactRow()]);
  const removeRow = (id: string) => { if (rows.length > 1) onChange(rows.filter(r => r.id !== id)); };

  const COLS = [
    { key: "seguridad", label: "SEGURIDAD" },
    { key: "calidadHigiene", label: "CALIDAD / HIGIENE" },
    { key: "costo", label: "COSTO" },
    { key: "medioAmbiente", label: "MEDIO AMBIENTE" },
    { key: "servicio", label: "SERVICIO" },
  ] as const;

  return (
    <StepCard 
      className="overflow-hidden"
      title="PASO 8.1: MATRIZ DE IMPACTO"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addRow(); }}><Plus className="mr-2 size-4" /> Agregar Acción</Button>
      }
    >

      <StepInstructions>
        <p className="mb-1">1. Elige la causa raíz eliminando las acciones a ser analizadas en base a los pasos anteriores.</p>
        <p className="mb-1">2. Evalúa las acciones en base a los criterios (Seguridad, Calidad, Costo, Medio Ambiente y Servicio) usando la escala: <strong>ALTO = 5 · MEDIO = 3 · BAJO = 1</strong>.</p>
        <p>3. La columna "Resultado del Impacto" se auto-poblará. Define qué acciones serán priorizadas y llena la última columna con SÍ o NO.</p>
      </StepInstructions>

      <div className="overflow-x-auto rounded-sm border border-[#0078D7]">
        <table className="w-full text-sm border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-[#0078D7] text-white text-[10px] uppercase font-bold">
              <th className="p-2 border-r border-white/20 text-left w-[22%]">ACCIÓN</th>
              {COLS.map(c => <th key={c.key} className="p-2 border-r border-white/20 text-center w-[11%]">{c.label}</th>)}
              <th className="p-2 border-r border-white/20 text-center w-[11%]">RESULTADO DE IMPACTO</th>
              <th className="p-2 border-r border-white/20 text-center w-[8%]">PRIORIZAR SÍ/NO</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const impact = calcImpact(row);
              const product = calcProduct(row);
              const impactLevel = impact === 5 ? "5" : impact === 3 ? "3" : impact === 1 ? "1" : "";
              return (
                <tr key={row.id} className="border-b border-border last:border-0 group">
                  <td className="p-0 border-r border-border">
                    <AutoResizeTextarea value={row.accion} onChange={val => updateRow(row.id, "accion", val)}
                      className="w-full min-h-[36px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs resize-none p-2 dark:text-foreground overflow-hidden"
                      placeholder="Acción..." />
                  </td>
                  {COLS.map(c => (
                    <td key={c.key} className="p-1 border-r border-border text-center">
                      <select value={row[c.key] === "" ? "" : String(row[c.key])}
                        onChange={e => updateRow(row.id, c.key, e.target.value === "" ? "" : Number(e.target.value))}
                        className={cn("w-full rounded px-1 py-1 text-xs font-semibold border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors",
                          row[c.key] ? SCORE_COLORS[String(row[c.key])] : "bg-muted text-muted-foreground"
                        )}>
                        <option value="">—</option>
                        {["1","3","5"].map(v => <option key={v} value={v}>{v} – {SCORE_LABELS[v]}</option>)}
                      </select>
                    </td>
                  ))}
                  <td className="p-1 border-r border-border text-center align-middle">
                    {impactLevel ? (
                      <span className={cn("inline-block px-2 py-1.5 rounded text-[11px] font-bold w-full", SCORE_COLORS[impactLevel])}>
                        {product}-{SCORE_LABELS[impactLevel]}
                      </span>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </td>
                  <td className="p-1 border-r border-border text-center">
                    <select value={row.priorizar}
                      onChange={e => updateRow(row.id, "priorizar", e.target.value as "SI" | "NO" | "")}
                      className={cn("w-full rounded px-1 py-1 text-xs font-semibold border border-transparent cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400",
                        row.priorizar === "SI" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                        row.priorizar === "NO" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : "bg-muted text-muted-foreground"
                      )}>
                      <option value="">—</option>
                      <option value="SI">SÍ</option>
                      <option value="NO">NO</option>
                    </select>
                  </td>
                  <td className="p-1 text-center">
                    {rows.length > 1 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive mx-auto block">
                            <X className="size-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar fila?</AlertDialogTitle>
                            <AlertDialogDescription>
                              ¿Estás seguro que deseas eliminar esta fila? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeRow(row.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-3 text-[10px] pt-1">
        <span className="text-muted-foreground font-semibold uppercase">Leyenda:</span>
        {(["5","3","1"] as const).map((v) => {
          const labels: Record<string, string> = { "5": "ALTO", "3": "MEDIO", "1": "BAJO" };
          return (
            <span key={v} className={cn("px-2 py-0.5 rounded font-bold", SCORE_COLORS[v])}>{labels[v]} = {v}</span>
          );
        })}
      </div>
    </StepCard>
  );
}
// ─────────────────────────────────────────────────────────────────────────────


