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

const PILAR_STYLE_MAP: Record<string, { bg: string; text: string; border: string }> = {
  Seguridad: {
    bg: "bg-red-100 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-200 dark:border-red-900/60",
  },
  Calidad: {
    bg: "bg-blue-100 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-900/60",
  },
  "Medio Ambiente": {
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-900/60",
  },
  default: {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    border: "border-border",
  },
};

export function VpoCheckpointTable({
  checkpoints,
  onChange,
  problemaTexto,
  completedSteps,
  onToggleStep,
}: {
  checkpoints: VpoCheckpointItem[];
  onChange: (newCheckpoints: VpoCheckpointItem[]) => void;
  problemaTexto: string;
  completedSteps: Set<string>;
  onToggleStep: (stepId: string) => void;
}) {
  const updateStatus = (id: string, newStatus: "YES" | "NO" | "N/A" | "") => {
    const updated = checkpoints.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
    onChange(updated);
  };

  const updateEvidencia = (id: string, text: string) => {
    const updated = checkpoints.map((item) =>
      item.id === id ? { ...item, evidencia: text } : item,
    );
    onChange(updated);
  };

  const yesCount = checkpoints.filter((c) => c.status === "YES").length;
  const scorePct = Math.round((yesCount / checkpoints.length) * 100);

  return (
    <StepCard
      title="PASO 2: LISTA DE VERIFICACIÓN SDCA"
      isStepCompleted={completedSteps.has("step-2")}
      onToggleStep={() => onToggleStep("step-2")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <StepInstructions>
          <p className="mb-2">
            <strong>PHASE SDCA CHECKLIST:</strong> Este checklist evalúa la madurez y
            estandarización del proceso afectado según los pilares del Sistema de Gestión VPO de
            Grupo Modelo.
          </p>
          <p>
            Evalúa cada punto en el contexto de tu problema. Registra las evidencias o comentarios
            de soporte para cada ítem y selecciona el status correspondiente (YES / NO / N/A). La
            brecha identificada servirá para alimentar el plan de acción (Kanban).
          </p>
        </StepInstructions>

        <div className="w-full flex rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden shadow-sm">
          <div className="flex w-[120px] shrink-0 items-center justify-center bg-white dark:bg-background border-r border-sky-500/30 p-4">
            <span className="font-bold text-sky-500">Guía</span>
          </div>
          <div className="flex-1 space-y-3 p-4 text-sm font-medium text-foreground/90">
            <p>
              <strong>Si el score es inferior al 70%</strong> - priorizar las acciones entre los
              miembros del equipo para cerrar las brechas en los puntos más relevantes del problema.
              Sin embargo, el equipo debe proceder en paralelo si los datos iniciales indican que
              hay otros aspectos del problema que estos items del SDCA no pueden abordar sin datos y
              análisis adicionales.
            </p>
            <p>
              <strong>Si el score es mayor al 70%</strong> - proceda directamente al resto de este
              toolkit. Cualquier brecha en los puntos anteriores puede asignarse como acciones para
              los miembros del equipo si es relevante para el problema y es probable que tenga un
              impacto. Utilice la matriz de impacto en la pestaña de action log, si es necesario,
              para ayudar a decidir si deben completarse o no.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/80 px-4 py-2 rounded-xl border border-border/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Progreso VPO Checkpoint:
          </span>
          <span
            className={cn(
              "font-mono text-xl font-extrabold",
              scorePct >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {scorePct}% ({yesCount}/{checkpoints.length} YES)
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            scorePct >= 70
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-amber-500 to-rose-500",
          )}
          style={{ width: `${scorePct}%` }}
        />
      </div>

      {/* Banner de Descripción del Problema */}
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
            <FileText className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Descripción del problema (Definición del Problema)
            </span>
            <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">
              {problemaTexto ||
                "Sin especificar (llena la casilla de Descripción del Problema en el Paso 1)"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla Oficial VPO Checkpoint */}
      <div className="overflow-hidden border border-border/80 rounded-xl shadow-md bg-card">
        <Table className="text-xs border-collapse">
          <TableHeader className="bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white">
            <TableRow className="border-b border-slate-800/80">
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-56 border-r border-slate-800/60">
                Bloque Pilar Gestión
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 border-r border-slate-800/60">
                VPO Tool Checkpoint
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-72 border-r border-slate-800/60">
                Evidencias / comentarios
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-44 text-center">
                Estatus
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkpoints.map((item) => {
              const pilarStyle = PILAR_STYLE_MAP[item.pilar] || {
                bg: "bg-secondary/40",
                text: "text-foreground",
                border: "border-border",
              };

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-secondary/30 transition-colors border-b border-border/60"
                >
                  <TableCell className="py-3 px-4 border-r border-border/60 align-top">
                    <span
                      className={cn(
                        "inline-block rounded-md px-2.5 py-1 text-[11px] font-bold border leading-snug",
                        pilarStyle.bg,
                        pilarStyle.text,
                        pilarStyle.border,
                      )}
                    >
                      {item.pilar}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 px-4 text-foreground/90 font-medium text-xs border-r border-border/60 leading-relaxed align-top">
                    {item.checkpoint}
                  </TableCell>

                  <TableCell className="py-2.5 px-3 border-r border-border/60 align-top">
                    <Input
                      value={item.evidencia}
                      onChange={(e) => updateEvidencia(item.id, e.target.value)}
                      placeholder="Escribe evidencias o comentarios..."
                      className="h-9 text-xs bg-background/80 hover:bg-background border border-border/80 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 px-3 transition-all placeholder:text-muted-foreground/50 shadow-none"
                    />
                  </TableCell>

                  <TableCell className="py-2.5 px-3 text-center align-top">
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-secondary/80 border border-border/80 shadow-inner">
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, "YES")}
                        className={cn(
                          "px-2.5 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1",
                          item.status === "YES"
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                        )}
                      >
                        <Check className="size-3.5 stroke-[3]" /> YES
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, "NO")}
                        className={cn(
                          "px-2.5 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1",
                          item.status === "NO"
                            ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                        )}
                      >
                        <X className="size-3.5 stroke-[3]" /> NO
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(item.id, "N/A")}
                        className={cn(
                          "px-2 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1",
                          item.status === "N/A"
                            ? "bg-slate-600 text-white shadow-md ring-2 ring-slate-500/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                        )}
                      >
                        N/A
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </StepCard>
  );
}
