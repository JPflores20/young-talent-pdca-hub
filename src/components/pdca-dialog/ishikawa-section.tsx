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
import { AutoResizeTextarea } from "./auto-resize-textarea";

export const CategoryBox = ({
  cat,
  causesList,
  onAdd,
  onRemove,
  onLabelChange,
}: {
  cat: { id: string; label: string; position: "top" | "bottom" };
  causesList: string[];
  onAdd: (id: string, value: string) => void;
  onRemove: (id: string, index: number) => void;
  onLabelChange?: (id: string, newLabel: string) => void;
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd(cat.id, inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="w-full flex flex-col rounded-md border border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-secondary/60 px-1 py-1 border-b border-border text-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground focus-within:bg-secondary/80">
        <input
          type="text"
          value={cat.label}
          onChange={(e) => onLabelChange?.(cat.id, e.target.value)}
          className="w-full bg-transparent text-center outline-none uppercase font-display"
        />
      </div>
      <div className="p-2 flex flex-col gap-1.5 min-h-[60px]">
        {causesList.map((cause, i) => (
          <div
            key={i}
            className="group relative flex items-start gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary leading-tight"
          >
            <span className="flex-1 break-words">{cause}</span>
            <button
              type="button"
              onClick={() => onRemove(cat.id, i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/60 hover:text-destructive shrink-0 mt-0.5"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="+ Causa (Enter)"
          className="h-6 text-[11px] px-1.5 shadow-none border-dashed bg-transparent focus-visible:ring-1"
        />
      </div>
    </div>
  );
};

export function IshikawaSection({
  ishikawas,
  onChange,
  isStepCompleted,
  onToggleStep,
}: {
  ishikawas: IshikawaItem[];
  onChange: (items: IshikawaItem[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const addIshikawa = () => {
    onChange([
      ...ishikawas,
      {
        id: `ishikawa-${Date.now()}`,
        effect: "Efecto / Problema",
        causes: {
          machine: [],
          method: [],
          material: [],
          manpower: [],
          measurement: [],
          environment: [],
        },
        prioritization: [],
      },
    ]);
  };

  const removeIshikawa = (id: string) => {
    if (ishikawas.length > 1) {
      onChange(ishikawas.filter((i) => i.id !== id));
    }
  };

  const updateIshikawa = (id: string, field: keyof IshikawaItem, value: any) => {
    onChange(ishikawas.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  return (
    <StepCard
      className="space-y-6"
      title="PASO 6: DIAGRAMA DE ISHIKAWA"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
          Estamos trabajando en la opción de subir archivos
        </span>
      </div>

      <StepInstructions>
        <p className="mb-2">
          1. Basándote en las conclusiones extraídas de los pasos anteriores para estrechar tu
          enfoque, define el tema que debe ser analizado, y será la "cabeza del pez". Nota: este NO
          debe ser el KPI que estás tratando de mejorar, sino más bien, el PI o aspecto del mismo al
          que has reducido tu enfoque.
        </p>
        <p className="mb-2">
          2. Reunir un equipo y en base a una discusión, rellenar el diagrama con las causas
          levantadas, intentando separar las causas y subcausas según sus categorías.
        </p>
        <p className="mb-2">
          3. Recuerda... ¡esta es una herramienta para la lluvia de ideas! Cualquier cosa que se
          ponga en la Espina de Pescado debe ser validado como un contribuyente al problema o no.
        </p>
        <p className="mb-2">
          4. Para añadir sub-puntos, escribe la causa y presiona Enter dentro de la categoría
          correspondiente.
        </p>
        <p>
          5. Las posibles causas rellenadas en el diagrama deben introducirse en el cuadro de
          prioridades (Filtro) para su posterior validación/confirmación de que efectivamente están
          contribuyendo al problema.
        </p>
      </StepInstructions>

      <div className="space-y-12">
        {ishikawas.map((ish, index) => (
          <div key={ish.id} className="relative group/ishikawa pt-4">
            {ishikawas.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -right-2 top-0 z-20 h-6 px-2 text-[10px] uppercase font-bold transition-opacity rounded-full shadow-md"
                  >
                    <X className="size-3 mr-1" /> Eliminar Ishikawa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar diagrama de Ishikawa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminarán permanentemente las causas y
                      priorizaciones registradas en este diagrama.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeIshikawa(ish.id)}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <IshikawaInteractive
              causes={ish.causes}
              setCauses={(c) =>
                updateIshikawa(ish.id, "causes", typeof c === "function" ? c(ish.causes) : c)
              }
              effect={ish.effect}
              setEffect={(e) => updateIshikawa(ish.id, "effect", e)}
              prioritizationCauses={ish.prioritization}
              setPrioritizationCauses={(p) => updateIshikawa(ish.id, "prioritization", p)}
              customLabels={ish.customLabels || {}}
              setCustomLabels={(l) =>
                updateIshikawa(
                  ish.id,
                  "customLabels",
                  typeof l === "function" ? l(ish.customLabels || {}) : l,
                )
              }
              titleSuffix={ishikawas.length > 1 ? ` ${index + 1}` : ""}
              title={ish.title}
              setTitle={(t) => updateIshikawa(ish.id, "title", t)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center border-t border-border/60 pt-6">
        <Button
          onClick={addIshikawa}
          variant="outline"
          className="gap-2 shadow-sm bg-card hover:bg-card/80"
        >
          <Plus className="size-4" /> Agregar otro Ishikawa
        </Button>
      </div>
    </StepCard>
  );
}

export function IshikawaInteractive({
  causes,
  setCauses,
  effect,
  setEffect,
  prioritizationCauses,
  setPrioritizationCauses,
  customLabels = {},
  setCustomLabels,
  titleSuffix = "",
  title,
  setTitle,
}: {
  causes: Record<string, string[]>;
  setCauses: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  effect: string;
  setEffect: (val: string) => void;
  prioritizationCauses?: any[];
  setPrioritizationCauses?: (causes: any[]) => void;
  customLabels?: Record<string, string>;
  setCustomLabels?: (
    labels: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void;
  titleSuffix?: string | undefined;
  title?: string | undefined;
  setTitle?: ((t: string) => void) | undefined;
}) {
  const categories = [
    { id: "machine", label: customLabels["machine"] ?? "Concepto de: Máquina", position: "top" as const },
    { id: "method", label: customLabels["method"] ?? "Concepto de: Método", position: "top" as const },
    { id: "material", label: customLabels["material"] ?? "Concepto de: Material", position: "top" as const },
    {
      id: "manpower",
      label: customLabels["manpower"] ?? "Concepto de: Mano de Obra",
      position: "bottom" as const,
    },
    {
      id: "measurement",
      label: customLabels["measurement"] ?? "Concepto de: Medición",
      position: "bottom" as const,
    },
    {
      id: "environment",
      label: customLabels["environment"] ?? "Concepto de: Medio Amb.",
      position: "bottom" as const,
    },
  ];

  const handleLabelChange = (id: string, newLabel: string) => {
    if (setCustomLabels) {
      setCustomLabels((prev) => ({ ...prev, [id]: newLabel }));
    }
  };

  const addCause = (id: string, value: string) => {
    if (!value.trim()) return;
    setCauses((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), value.trim()],
    }));
  };

  const removeCause = (id: string, index: number) => {
    setCauses((prev) => ({
      ...prev,
      [id]: (prev[id] || []).filter((_, i) => i !== index),
    }));
  };

  const fishboneDiagram = (
    <div className="relative pt-4 pb-4 overflow-x-auto min-h-[400px]">
      <div className="min-w-[800px] relative mt-4">
        <div className="absolute top-1/2 left-0 right-36 h-1.5 bg-border rounded-full -translate-y-1/2 z-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-[8px] border-transparent border-l-border"></div>
        </div>

        <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-widest p-2 rounded-xl border border-destructive/30 z-10 w-36 text-center flex flex-col items-center justify-center shadow-sm min-h-[90px]">
          <span className="text-[9px] font-semibold text-destructive/70 uppercase tracking-wider mb-1">
            Efecto / Problema
          </span>
          <Textarea
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
            placeholder="Escribe el efecto..."
            rows={2}
            className="w-full text-center bg-transparent border-none text-destructive font-bold text-xs resize-none focus-visible:ring-1 focus-visible:ring-destructive/40 p-0 shadow-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {categories
            .filter((c) => c.position === "top")
            .map((cat) => (
              <div key={cat.id} className="flex flex-col items-center">
                <CategoryBox
                  cat={cat}
                  causesList={causes[cat.id] || []}
                  onAdd={addCause}
                  onRemove={removeCause}
                  onLabelChange={handleLabelChange}
                />
                <div className="w-0.5 h-8 bg-border"></div>
              </div>
            ))}
        </div>

        <div className="h-4"></div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {categories
            .filter((c) => c.position === "bottom")
            .map((cat) => (
              <div key={cat.id} className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-border"></div>
                <CategoryBox
                  cat={cat}
                  causesList={causes[cat.id] || []}
                  onAdd={addCause}
                  onRemove={removeCause}
                  onLabelChange={handleLabelChange}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <StepCard
      className="overflow-hidden"
      title={
        <Input
          value={title ?? `ISHIKAWA${titleSuffix}`}
          onChange={(e) => setTitle?.(e.target.value)}
          placeholder={`ISHIKAWA${titleSuffix}`}
          className="text-sm font-bold text-muted-foreground uppercase tracking-wider bg-transparent border-transparent hover:border-border focus-visible:border-border px-2 py-0 h-8 w-64 shadow-none"
        />
      }
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Maximize2 className="size-3.5" /> Expandir Diagrama
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full p-6">
            <h3 className="text-lg font-bold uppercase mb-4">
              {title ?? `ISHIKAWA${titleSuffix}`}
            </h3>
            {fishboneDiagram}
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {fishboneDiagram}
        <PrioritizationMatrix value={prioritizationCauses} onChange={setPrioritizationCauses} />
      </div>
    </StepCard>
  );
}

export function PrioritizationMatrix({
  value = [],
  onChange,
}: {
  value?: any[] | undefined;
  onChange?: ((causes: any[]) => void) | undefined;
}) {
  const causes =
    value && value.length > 0
      ? value
      : [
          { id: 1, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
          { id: 2, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
          { id: 3, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
          { id: 4, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
        ];

  const updateCause = (id: number, field: string, val: string) => {
    if (onChange) {
      onChange(causes.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
    }
  };

  const addRow = () => {
    if (onChange) {
      onChange([
        ...causes,
        { id: Date.now(), text: "", impact: "", authority: "", difficulty: "", criteria: "" },
      ]);
    }
  };

  const removeRow = (id: number) => {
    if (onChange && causes.length > 1) {
      onChange(causes.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="mt-8 border border-[#0078D7] rounded-sm overflow-hidden bg-white shadow-sm dark:bg-background">
      <div className="bg-white dark:bg-background px-2 py-1 flex items-center justify-between border-b border-[#0078D7]">
        <span className="text-[11px] font-bold text-[#0078D7] uppercase tracking-wide">
          PRIORIZACIÓN - CAUSAS PROBABLES - PROBLEMA 1
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="h-6 px-2 text-[10px] uppercase font-bold text-[#0078D7] hover:bg-[#0078D7]/10"
        >
          <Plus className="size-3 mr-1" /> Agregar causa
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0078D7] text-white">
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[30%]">
                CAUSAS PROBABLES
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                IMPACTO SOBRE EL PROBLEMA
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                AUTORIDAD
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                DIFICULTAD
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                CRITERIO ADICIONAL
              </th>
              <th className="font-bold uppercase text-center p-2 text-[10px] w-[14%]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {causes.map((c, i) => {
              const impact = Number(c.impact) || 0;
              const authority = Number(c.authority) || 0;
              const difficulty = Number(c.difficulty) || 0;

              let total = impact * authority * difficulty;
              const criteriaText = String(c.criteria || "").trim();
              const criteriaNum = Number(criteriaText);

              if (criteriaText !== "" && !isNaN(criteriaNum)) {
                total *= criteriaNum;
              }

              const isHigh = total > 0;

              return (
                <tr key={c.id} className="border-b border-white group">
                  <td className="bg-[#E2E2E2] dark:bg-secondary p-0 border-r border-white relative group/td">
                    <AutoResizeTextarea
                      value={c.text}
                      onChange={(val) => updateCause(c.id, "text", val)}
                      className="py-1.5 font-medium focus-visible:ring-black/20 text-xs text-center dark:text-foreground pr-8"
                    />
                    {causes.length > 1 && (
                      <button
                        onClick={() => removeRow(c.id)}
                        className="absolute right-2 top-2 text-muted-foreground/60 hover:text-destructive transition-colors"
                        title="Eliminar causa"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={c.impact}
                      onChange={(e) => updateCause(c.id, "impact", e.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={c.authority}
                      onChange={(e) => updateCause(c.id, "authority", e.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={c.difficulty}
                      onChange={(e) => updateCause(c.id, "difficulty", e.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <AutoResizeTextarea
                      value={c.criteria}
                      onChange={(val) => updateCause(c.id, "criteria", val)}
                      placeholder="Texto..."
                      className="py-1.5 font-medium text-white text-center focus-visible:ring-white/50 text-xs placeholder:text-white/50"
                    />
                  </td>
                  <td
                    className={cn(
                      "p-0 text-center font-bold text-xs",
                      isHigh
                        ? "bg-[#00B050] text-white"
                        : "bg-[#E2E2E2] dark:bg-secondary text-black/60 dark:text-foreground/60",
                    )}
                  >
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
