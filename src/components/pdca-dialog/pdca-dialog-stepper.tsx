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

const PHASE_STEPS_MAP: Record<string, string[]> = {
  Plan: [
    "step-1", "step-2", "step-3", "step-4", "step-5", 
    "step-6", "step-12", "step-7", "step-8", "step-9", "step-10", 
    "step-11", "step-13", "step-14", "step-15",
    "step-16", "step-17"
  ],
  Do: ["step-18", "step-19", "step-20"],
  Check: ["step-21", "step-22", "step-23", "step-24"],
  Act: ["step-24-act", "step-25", "step-26"],
};
export const getCustomPhases = (isAdmin: boolean) => {
  const base = [
    { id: "Plan", label: "1. PLAN", sub: "" },
    { id: "Do", label: "2. DO", sub: "" },
    { id: "Check", label: "3. CHECK", sub: "" },
    { id: "Act", label: "4. ACT", sub: "" },
  ] as const;
  
  if (isAdmin) {
    return [
      ...base,
      { id: "Evaluacion", label: "EVALUACIÓN R2D2", sub: "Solo Administradores" }
    ] as const;
  }
  return base;
};
export const isPhaseStepsCompleted = (phaseId: string, completedSteps: Set<string>) => {
  const steps = PHASE_STEPS_MAP[phaseId as Phase] || [];
  return steps.length > 0 && steps.every((s) => completedSteps.has(s));
};

const getPhaseTabColors = (id: string, isCurrent: boolean) => {
  if (isCurrent) {
    switch (id) {
      case "Plan": return "bg-red-600 text-white shadow-sm";
      case "Do": return "bg-yellow-400 text-black shadow-sm";
      case "Check": return "bg-emerald-500 text-white shadow-sm";
      case "Act": return "bg-blue-600 text-white shadow-sm";
      case "Evaluacion": return "bg-indigo-900 text-white shadow-sm"; // Dark blue from image
      default: return "bg-primary text-primary-foreground shadow-sm";
    }
  }
  switch (id) {
    case "Plan": return "bg-red-500/10 text-red-700 hover:bg-red-500/20";
    case "Do": return "bg-yellow-500/20 text-yellow-800 hover:bg-yellow-500/30";
    case "Check": return "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20";
    case "Act": return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20";
    case "Evaluacion": return "bg-indigo-900/10 text-indigo-900 hover:bg-indigo-900/20";
    default: return "hover:bg-background/80 text-muted-foreground";
  }
};

const getPhaseCircleColors = (id: string, isCurrent: boolean, isCompleted: boolean) => {
  if (isCompleted) return "border-emerald-500 bg-emerald-500 text-white";
  if (isCurrent) {
    return id === "Do" ? "border-black/20 bg-black/10 text-black" : "border-white/20 bg-white/20 text-white";
  }
  switch (id) {
    case "Plan": return "border-red-200 bg-red-100 text-red-700";
    case "Do": return "border-yellow-400/40 bg-yellow-200/50 text-yellow-800";
    case "Check": return "border-emerald-200 bg-emerald-100 text-emerald-700";
    case "Act": return "border-blue-200 bg-blue-100 text-blue-700";
    case "Evaluacion": return "border-indigo-200 bg-indigo-100 text-indigo-900";
    default: return "border-border bg-background";
  }
};

const getPhaseSubText = (id: string, isCurrent: boolean) => {
  if (isCurrent) return id === "Do" ? "text-black/70" : "text-white/80";
  switch (id) {
    case "Plan": return "text-red-700/70";
    case "Do": return "text-yellow-800/70";
    case "Check": return "text-emerald-700/70";
    case "Act": return "text-blue-700/70";
    case "Evaluacion": return "text-indigo-900/70";
    default: return "text-muted-foreground/80";
  }
};

const getPhaseToggleBorder = (id: string, isCurrent: boolean, isCompleted: boolean) => {
  if (isCompleted) return "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600";
  if (isCurrent) {
    return id === "Do" ? "border-black/30 text-black/40 hover:border-black hover:text-black" 
                       : "border-white/40 text-white/50 hover:border-white hover:text-white";
  }
  switch (id) {
    case "Plan": return "border-red-500/30 text-red-500/30 hover:border-red-500 hover:text-red-500";
    case "Do": return "border-yellow-600/30 text-yellow-600/30 hover:border-yellow-600 hover:text-yellow-600";
    case "Check": return "border-emerald-500/30 text-emerald-500/30 hover:border-emerald-500 hover:text-emerald-500";
    case "Act": return "border-blue-500/30 text-blue-500/30 hover:border-blue-500 hover:text-blue-500";
    case "Evaluacion": return "border-indigo-900/30 text-indigo-900/30 hover:border-indigo-900 hover:text-indigo-900";
    default: return "border-muted-foreground/30 text-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-500";
  }
};

export function CustomStepper({
  current,
  onSelect,
  completedPhases,
  onToggleComplete,
  completedSteps,
  isAdmin,
}: {
  current: Phase;
  onSelect: (p: Phase) => void;
  completedPhases: Set<string>;
  onToggleComplete: (p: Phase) => void;
  completedSteps: Set<string>;
  isAdmin?: boolean;
}) {
  const customPhases = getCustomPhases(!!isAdmin);
  const currentIndex = customPhases.findIndex(p => p.id === current);
  return (
    <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5">
      {customPhases.map((phase, i) => {
        const isCurrent = i === currentIndex;
        const isCompleted =
          completedPhases.has(phase.id) || isPhaseStepsCompleted(phase.id, completedSteps);
        return (
          <div
            key={phase.id}
            className={cn(
              "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors relative group",
              getPhaseTabColors(phase.id, isCurrent)
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(phase.id)}
              className="flex flex-1 items-center gap-2.5 min-w-0"
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                  getPhaseCircleColors(phase.id, isCurrent, isCompleted)
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm font-semibold uppercase tracking-wide">
                  {phase.label}
                </span>
                {phase.sub && (
                  <span
                    className={cn(
                      "hidden truncate text-[11px] sm:block",
                      getPhaseSubText(phase.id, isCurrent)
                    )}
                  >
                    {phase.sub}
                  </span>
                )}
              </span>
            </button>
            {/* Toggle complete button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(phase.id as Phase);
              }}
              title={isCompleted ? "Desmarcar fase como completada" : "Marcar fase como completada"}
              className={cn(
                "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
                getPhaseToggleBorder(phase.id, isCurrent, isCompleted)
              )}
            >
              <Check className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const parseDateString = (str?: string): Date | undefined => {
  if (!str) return undefined;
  if (str.includes("-")) {
    const parts = str.split("-").map(Number);
    const [y, m, d] = parts;
    if (y !== undefined && m !== undefined && d !== undefined && y > 1000) {
      return new Date(y, m - 1, d);
    }
  }
  if (str.includes("/")) {
    const parts = str.split("/").map(Number);
    const [d, m, y] = parts;
    if (d !== undefined && m !== undefined && y !== undefined) {
      return new Date(y, m - 1, d);
    }
  }
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDateToString = (date?: Date): string => {
  if (!date || isNaN(date.getTime())) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const PILAR_STYLE_MAP: Record<string, { bg: string; text: string; border: string }> = {
  "Mapeo de procesos": {
    bg: "bg-blue-500/15 dark:bg-blue-500/25",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-500/40",
  },
  "CreaciÃ³n & ejecuciÃ³n de estÃ¡ndares": {
    bg: "bg-indigo-500/15 dark:bg-indigo-500/25",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/40",
  },
  "Proceso de revisiÃ³n de rutina": {
    bg: "bg-cyan-500/15 dark:bg-cyan-500/25",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/40",
  },
  "GestiÃ³n del conocimiento": {
    bg: "bg-purple-500/15 dark:bg-purple-500/25",
    text: "text-purple-700 dark:text-purple-300",
    border: "border-purple-500/40",
  },
  "5S": {
    bg: "bg-emerald-500/15 dark:bg-emerald-500/25",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/40",
  },
  "Indicadores de producto y proceso": {
    bg: "bg-amber-500/15 dark:bg-amber-500/25",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/40",
  },
  "SoluciÃ³n de problemas": {
    bg: "bg-rose-500/15 dark:bg-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/40",
  },
  "DescripciÃ³n del negocio": {
    bg: "bg-teal-500/15 dark:bg-teal-500/25",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/40",
  },
  "Proceso de revisiÃ³n del rendimiento": {
    bg: "bg-violet-500/15 dark:bg-violet-500/25",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/40",
  },
};
