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
  Plan: ["step-1", "step-2"],
  Do: ["step-3", "step-4", "step-5", "step-flavor", "step-gop"],
  Check: ["step-6", "step-7"],
  Act: ["step-8", "step-9"],
};
const customPhases = [
  { id: "Plan", label: "1. DEFINICIÓN", sub: "Pasos 1 y 2" },
  { id: "Do", label: "2. ANÁLISIS", sub: "Pasos 3, 4 y 5" },
  { id: "Check", label: "3. CAUSA RAÍZ", sub: "Pasos 6 y 7" },
  { id: "Act", label: "4. EJECUCIÓN", sub: "Pasos 8 y 9" },
] as const;
export const isPhaseStepsCompleted = (phaseId: string, completedSteps: Set<string>) => {
  const steps = PHASE_STEPS_MAP[phaseId as Phase] || [];
  return steps.length > 0 && steps.every((s) => completedSteps.has(s));
};

export function CustomStepper({
  current,
  onSelect,
  completedPhases,
  onToggleComplete,
  completedSteps,
}: {
  current: Phase;
  onSelect: (p: Phase) => void;
  completedPhases: Set<string>;
  onToggleComplete: (p: Phase) => void;
  completedSteps: Set<string>;
}) {
  const currentIndex = phases.indexOf(current);
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
              isCurrent
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-background/80 text-muted-foreground",
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
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : isCurrent
                      ? "border-brand-yellow bg-brand-yellow text-brand-yellow-foreground"
                      : "border-border bg-background",
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm font-semibold uppercase tracking-wide">
                  {phase.label}
                </span>
                <span
                  className={cn(
                    "hidden truncate text-[11px] sm:block",
                    isCurrent ? "text-primary-foreground/75" : "text-muted-foreground/80",
                  )}
                >
                  {phase.sub}
                </span>
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
                isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                  : isCurrent
                    ? "border-primary-foreground/40 text-primary-foreground/40 hover:border-white hover:text-white"
                    : "border-muted-foreground/30 text-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-500",
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
