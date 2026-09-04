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
  Maximize2
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
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { KpiTreeInteractive } from "./kpi-tree";
import { ActionKanban } from "./action-kanban";
import { GopThemesSection } from "./GopThemesSection";
import { ImageUploadSection, MultiImageUploadSection } from "./image-upload-section";
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

const PHASE_STEPS_MAP: Record<Phase, string[]> = {
  Plan: ["step-1", "step-2"],
  Do: ["step-3", "step-4", "step-5", "step-flavor", "step-gop"],
  Check: ["step-6", "step-7"],
  Act: ["step-8", "step-9"],
};

const customPhases = [
  { id: "Plan", label: "1. Definición", sub: "Pasos 1 y 2" },
  { id: "Do", label: "2. Análisis", sub: "Pasos 3, 4 y 5" },
  { id: "Check", label: "3. Causa Raíz", sub: "Pasos 6 y 7" },
  { id: "Act", label: "4. Ejecución", sub: "Pasos 8 y 9" }
] as const;

const getEmptyDraft = (): Pdca => ({
  id: `PDCA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  titulo: "",
  area: "cocimientos",
  fase: "Plan",
  actualizado: new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }),
  progreso: 0,
  problema: "",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Indicador principal", antes: 0, despues: 0, unidad: "%" },
  serie: [
    { mes: "May", valor: 0 },
    { mes: "Jun", valor: 0 },
    { mes: "Jul", valor: 0 },
    { mes: "Ago", valor: 0 },
  ],
  vpoCheckpoints: DEFAULT_VPO_CHECKPOINTS.map(item => ({ ...item, status: "", evidencia: "" })),
  equipo: [],
});

function StepInstructions({ title = "Instrucciones", children }: { title?: string, children: React.ReactNode }) {
  return (
    <Accordion type="single" collapsible className="w-full mb-4 border rounded-md bg-secondary/30 px-4">
      <AccordionItem value="instructions" className="border-none">
        <AccordionTrigger className="py-3 text-sm font-semibold text-primary hover:no-underline">
          <span className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs">i</span>
            {title}
          </span>
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground text-xs leading-relaxed pb-4">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function TeamMembersInput({ members = [], onChange }: { members?: string[], onChange: (m: string[]) => void }) {
  const [inputValue, setInputValue] = useState("");

  const addMember = () => {
    const val = inputValue.trim();
    if (val && !members.includes(val)) {
      onChange([...members, val]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMember();
    }
  };

  const removeMember = (indexToRemove: number) => {
    onChange(members.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="equipo">Equipo / Integrantes</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {members.map((member, index) => (
          <div key={index} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary border border-primary/20">
            <span>{member}</span>
            <button
              type="button"
              onClick={() => removeMember(index)}
              className="ml-1 rounded-full p-0.5 hover:bg-primary/20 hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          id="equipo"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ej. Ana López (Líder)"
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={addMember}>
          Agregar
        </Button>
      </div>
    </div>
  );
}

const CategoryBox = ({ 
  cat, 
  causesList, 
  onAdd, 
  onRemove,
  onLabelChange
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
          <div key={i} className="group relative flex items-start gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary leading-tight">
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
        causes: { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] },
        prioritization: []
      }
    ]);
  };

  const removeIshikawa = (id: string) => {
    if (ishikawas.length > 1) {
      onChange(ishikawas.filter(i => i.id !== id));
    }
  };

  const updateIshikawa = (id: string, field: keyof IshikawaItem, value: any) => {
    onChange(ishikawas.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {onToggleStep && (
          <button
            type="button"
            onClick={onToggleStep}
            title={isStepCompleted ? "Desmarcar paso como completado" : "Marcar paso como completado"}
            className={cn(
              "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
              isStepCompleted
                ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
                : "border-muted-foreground/40 text-muted-foreground/40 hover:border-emerald-500 hover:text-emerald-500 bg-background"
            )}
          >
            <Check className="size-4" />
          </button>
        )}
        <h3 className={cn("font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2", isStepCompleted && "text-emerald-600 dark:text-emerald-400")}>
            <span>PASO 6: FISHBONE</span>
          {isStepCompleted && (
            <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
              Completado
            </span>
          )}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
          Estamos trabajando en la opción de subir archivos
        </span>
      </div>

      <StepInstructions>
        <p className="mb-2">1. Basándote en las conclusiones extraídas de los pasos anteriores para estrechar tu enfoque, define el tema que debe ser analizado, y será la "cabeza del pez". Nota: este NO debe ser el KPI que estás tratando de mejorar, sino más bien, el PI o aspecto del mismo al que has reducido tu enfoque.</p>
        <p className="mb-2">2. Reunir un equipo y en base a una discusión, rellenar el diagrama con las causas levantadas, intentando separar las causas y subcausas según sus categorías.</p>
        <p className="mb-2">3. Recuerda... ¡esta es una herramienta para la lluvia de ideas! Cualquier cosa que se ponga en la Espina de Pescado debe ser validado como un contribuyente al problema o no.</p>
        <p className="mb-2">4. Para añadir sub-puntos, escribe la causa y presiona Enter dentro de la categoría correspondiente.</p>
        <p>5. Las posibles causas rellenadas en el diagrama deben introducirse en el cuadro de prioridades (Filtro) para su posterior validación/confirmación de que efectivamente están contribuyendo al problema.</p>
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
                      Esta acción no se puede deshacer. Se eliminarán permanentemente las causas y priorizaciones registradas en este diagrama.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeIshikawa(ish.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <IshikawaInteractive
              causes={ish.causes}
              setCauses={(c) => updateIshikawa(ish.id, "causes", typeof c === "function" ? c(ish.causes) : c)}
              effect={ish.effect}
              setEffect={(e) => updateIshikawa(ish.id, "effect", e)}
              prioritizationCauses={ish.prioritization}
              setPrioritizationCauses={(p) => updateIshikawa(ish.id, "prioritization", p)}
              customLabels={ish.customLabels}
              setCustomLabels={(l) => updateIshikawa(ish.id, "customLabels", typeof l === "function" ? l(ish.customLabels || {}) : l)}
              titleSuffix={ishikawas.length > 1 ? ` ${index + 1}` : ""}
              title={ish.title}
              setTitle={(t) => updateIshikawa(ish.id, "title", t)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center border-t border-border/60 pt-6">
        <Button onClick={addIshikawa} variant="outline" className="gap-2 shadow-sm bg-card hover:bg-card/80">
          <Plus className="size-4" /> Agregar otro Ishikawa
        </Button>
      </div>
    </div>
  );
}

function IshikawaInteractive({
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
  setCustomLabels?: (labels: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;
  titleSuffix?: string;
  title?: string;
  setTitle?: (t: string) => void;
}) {
  const categories = [
    { id: "machine", label: customLabels["machine"] ?? "Máquina", position: "top" as const },
    { id: "method", label: customLabels["method"] ?? "Método", position: "top" as const },
    { id: "material", label: customLabels["material"] ?? "Material", position: "top" as const },
    { id: "manpower", label: customLabels["manpower"] ?? "Mano de Obra", position: "bottom" as const },
    { id: "measurement", label: customLabels["measurement"] ?? "Medición", position: "bottom" as const },
    { id: "environment", label: customLabels["environment"] ?? "Medio Amb.", position: "bottom" as const },
  ];

  const handleLabelChange = (id: string, newLabel: string) => {
    if (setCustomLabels) {
      setCustomLabels(prev => ({ ...prev, [id]: newLabel }));
    }
  };

  const addCause = (id: string, value: string) => {
    if (!value.trim()) return;
    setCauses(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), value.trim()]
    }));
  };

  const removeCause = (id: string, index: number) => {
    setCauses(prev => ({
      ...prev,
      [id]: (prev[id] || []).filter((_, i) => i !== index)
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
          {categories.filter(c => c.position === "top").map(cat => (
            <div key={cat.id} className="flex flex-col items-center">
              <CategoryBox cat={cat} causesList={causes[cat.id] || []} onAdd={addCause} onRemove={removeCause} onLabelChange={handleLabelChange} />
              <div className="w-0.5 h-8 bg-border"></div>
            </div>
          ))}
        </div>

        <div className="h-4"></div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {categories.filter(c => c.position === "bottom").map(cat => (
            <div key={cat.id} className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-border"></div>
              <CategoryBox cat={cat} causesList={causes[cat.id] || []} onAdd={addCause} onRemove={removeCause} onLabelChange={handleLabelChange} />
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
            <h3 className="text-lg font-bold uppercase mb-4">{title ?? `ISHIKAWA${titleSuffix}`}</h3>
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


function ParetoInteractive({
  title = "Análisis de Pareto (PASO 5)",
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
}: {
  title?: string;
  subtitle?: string;
  level?: number;
  data?: ParetoItem[];
  onDataChange?: (newData: ParetoItem[]) => void;
  onBarClick?: (category: string) => void;
  onClose?: () => void;
  unit?: string;
  onUnitChange?: (newUnit: string) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onAddRoot?: () => void;
}) {
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteData, setPasteData] = useState("");

  const handleImportExcel = () => {
    if (!pasteData.trim()) return;
    
    const lines = pasteData.split('\n');
    const aggregated: Record<string, number> = {};
    
    for (const line of lines) {
      if (!line.trim()) continue;
      const parts = line.split('\t');
      
      let cat = "";
      let val = 0;

      if (parts.length >= 2) {
        cat = parts[0].trim();
        val = parseFloat(parts[1].replace(/,/g, '').trim()) || 0;
      } else {
        const fallbackParts = line.split(',');
        if (fallbackParts.length >= 2) {
          cat = fallbackParts[0].trim();
          val = parseFloat(fallbackParts[1].replace(/,/g, '').trim()) || 0;
        } else {
          cat = line.trim();
          val = 1;
        }
      }
      
      if (cat) {
        aggregated[cat] = (aggregated[cat] || 0) + val;
      }
    }
    
    if (onDataChange) {
      const existingAgg: Record<string, number> = {};
      data.forEach(item => {
        if (item.area && item.area.trim()) {
           existingAgg[item.area.trim()] = (existingAgg[item.area.trim()] || 0) + (item.gap || 0);
        }
      });
      
      for (const cat in aggregated) {
        existingAgg[cat] = (existingAgg[cat] || 0) + aggregated[cat];
      }
      
      const combinedItems = Object.keys(existingAgg).map(cat => ({
        id: Date.now() + Math.random(),
        area: cat,
        gap: existingAgg[cat]
      }));

      onDataChange(combinedItems.length > 0 ? combinedItems : data);
    }
    
    setIsPasteOpen(false);
    setPasteData("");
    toast.success("Datos importados y agrupados correctamente");
  };

  const addRow = () => {
    if (onDataChange) {
      onDataChange([...data, { id: Date.now(), area: "", gap: 0 }]);
    }
  };

  const updateRow = (id: number, field: "area" | "gap", value: string | number) => {
    if (onDataChange) {
      onDataChange(data.map(d => d.id === id ? { ...d, [field]: value } : d));
    }
  };

  const removeRow = (id: number) => {
    if (onDataChange) {
      onDataChange(data.filter(d => d.id !== id));
    }
  };

  const sorted = [...data].sort((a, b) => b.gap - a.gap);
  const totalGap = sorted.reduce((sum, item) => sum + item.gap, 0);
  
  let currentCumulative = 0;
  const paretoData = sorted.map(item => {
    const indPct = totalGap > 0 ? (item.gap / totalGap) * 100 : 0;
    currentCumulative += indPct;
    return {
      ...item,
      indPct,
      cumPct: currentCumulative
    };
  });

  const formatValue = (val: any) => {
    if (val === null || val === undefined || isNaN(val)) return "";
    const numStr = Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (unit === "$") {
      return "$" + numStr;
    }
    return numStr + (unit ? (unit === "%" ? "%" : " " + unit) : "");
  };

  const CustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === null || value === undefined) return null;
    return (
      <text x={x + width / 2} y={y - 10} fill="var(--color-foreground)" fontSize={9} textAnchor="middle" fontWeight="bold">
        {formatValue(value)}
      </text>
    );
  };

  return (
    <StepCard 
      className="col-span-full animate-in fade-in zoom-in-95"
      title={<>{level > 0 && <ArrowRight className="size-4 text-muted-foreground" />} {title}</>}
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
                  <AlertDialogTitle>¿Eliminar Pareto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar este Pareto? Esta acción no se puede deshacer y eliminará también sus desgloses.
                  </AlertDialogDescription>
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
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setIsPasteOpen(true); }}>
            <FileText className="size-4 mr-2" /> Importar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addRow(); }}>
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
          
          <Dialog open={isPasteOpen} onOpenChange={setIsPasteOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Importar Datos (Copiar y Pegar desde Excel)</DialogTitle>
                <DialogDescription>
                  Copia dos columnas de tu Excel (Categoría y Frecuencia/Costo) y pégalas aquí. Los datos se agruparán automáticamente por categoría. Soporta miles de filas.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder="Ejemplo:&#10;Falla A&#9;10&#10;Falla B&#9;5&#10;Falla A&#9;15"
                  className="min-h-[200px] text-xs font-mono whitespace-pre"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsPasteOpen(false)}>Cancelar</Button>
                  <Button onClick={handleImportExcel}>Importar y Generar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="flex flex-col gap-1 mb-4">
        <p className="text-sm text-muted-foreground ml-[36px]">
          {subtitle} {onBarClick && "Haz clic en una barra para desglosarla."}
        </p>
      </div>
      
      {level === 0 && (
        <StepInstructions>
          <p className="mb-2">1. Utiliza la columna de categorías para identificar las formas de desglosar los KPI o IP en diferentes categorías. Este será tu eje X. Ejemplo: tipo de equipo.</p>
          <p className="mb-2">2. Introduce tus datos para cada categoría en la columna de datos (Valor / Gap). Nota: los datos deben estar en las mismas unidades. Ejemplo: tiempo de inactividad de cada tipo de equipo.</p>
          <p className="mb-2">3. En esta herramienta web, el gráfico de Pareto se genera automáticamente a medida que introduces los datos.</p>
          <p>4. Puedes crear Paretos adicionales (Nivel 2) haciendo clic directamente sobre la barra de la categoría que deseas desglosar en el gráfico interactivo.</p>
        </StepInstructions>
      )}

      {level === 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unidad de Medida:</span>
          <Input 
            value={unit} 
            onChange={e => { if(onUnitChange) onUnitChange(e.target.value) }}
            placeholder="ej. $, %, HL" 
            className="w-28 h-7 text-xs font-bold" 
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="overflow-x-auto border rounded-md">
          <Table className="text-xs">
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="py-2 px-3">Área / Categoría</TableHead>
                <TableHead className="py-2 px-3 w-24">Valor (Gap)</TableHead>
                <TableHead className="py-2 px-3 w-20">% Ind.</TableHead>
                <TableHead className="py-2 px-3 w-20">% Acum.</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paretoData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-1.5 px-3">
                    <Input
                      value={row.area}
                      onChange={(e) => updateRow(row.id, "area", e.target.value)}
                      placeholder="Ej. Envasado..."
                      className="h-7 text-xs shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background"
                    />
                  </TableCell>
                  <TableCell className="py-1.5 px-3">
                    <Input
                      type="number"
                      value={row.gap || ""}
                      onChange={(e) => updateRow(row.id, "gap", Number(e.target.value))}
                      className="h-7 text-xs shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background text-right"
                    />
                  </TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-muted-foreground">
                    {row.indPct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-muted-foreground font-semibold">
                    {row.cumPct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-1.5">
                    {data.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeRow(row.id)}>
                        <X className="size-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-secondary/20">
                <TableCell className="py-2 px-3 font-bold text-right">TOTAL</TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono text-right">{formatValue(totalGap)}</TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="h-64 border rounded-md p-3 flex flex-col justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData} margin={{ top: 25, right: 15, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="area" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" tickFormatter={(val) => formatValue(val)} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" domain={[0, 100]} tickFormatter={(val) => Math.round(val) + "%"} />
              <RTooltip
                contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12, backgroundColor: "var(--color-card)", color: "var(--color-foreground)", padding: "8px 12px" }}
                formatter={(val: number, name: string) => [name === "Acumulado" ? val.toFixed(2) + "%" : formatValue(val), name]}
              />
              <Bar 
                yAxisId="left" 
                dataKey="gap" 
                name="Valor" 
                fill="#4285f4" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40} 
                onClick={(payload) => { if (onBarClick && payload.area) onBarClick(payload.area); }}
                className={onBarClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                label={<CustomBarLabel />}
              />
              <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Acumulado" stroke="#ff4d4f" strokeWidth={2} dot={{ r: 4, fill: "var(--color-card)", stroke: "#ff4d4f", strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </StepCard>
  );
}

function ParetoSection({
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
  onUnitChange?: (newUnit: string) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}) {
  const rootKeys = Object.keys(dataMap).filter(k => k === "root" || k.startsWith("root-")).sort();
  if (rootKeys.length === 0) rootKeys.push("root");

  const handleBarClick = (category: string, level: number, parentPath: string) => {
    if (category) {
      const newPath = parentPath === "root" 
        ? `level-${level + 1}-${category}` 
        : `${parentPath}-level-${level + 1}-${category}`;
      
      const isLegacy = drillDowns.length > 0 && !drillDowns[0].includes("level-");
      const currentDrills = isLegacy ? drillDowns.map((d, i) => `level-${i + 1}-${d}`) : [...drillDowns];
      
      if (!currentDrills.includes(newPath)) {
        currentDrills.push(newPath);
        setDrillDowns(currentDrills);
      }
      
      if (!dataMap[newPath]) {
        setDataMap({ ...dataMap, [newPath]: [] });
      }
    }
  };

  const handleClose = (pathToRemove: string) => {
    const isLegacy = drillDowns.length > 0 && !drillDowns[0].includes("level-");
    const currentDrills = isLegacy ? drillDowns.map((d, i) => `level-${i + 1}-${d}`) : [...drillDowns];
    setDrillDowns(currentDrills.filter(p => p !== pathToRemove && !p.startsWith(`${pathToRemove}-`)));
    
    // Also remove from dataMap
    const newDataMap = { ...dataMap };
    Object.keys(newDataMap).forEach(k => {
      if (k === pathToRemove || k.startsWith(`${pathToRemove}-`)) {
        delete newDataMap[k];
      }
    });
    setDataMap(newDataMap);
  };

  const handleCloseRoot = (rootKey: string) => {
    const currentDrills = drillDowns.filter(p => !p.startsWith(`${rootKey}-`));
    setDrillDowns(currentDrills);

    const newDataMap = { ...dataMap };
    Object.keys(newDataMap).forEach(k => {
      if (k === rootKey || k.startsWith(`${rootKey}-`)) {
        delete newDataMap[k];
      }
    });
    setDataMap(newDataMap);
  };

  const updateData = (path: string, newData: ParetoItem[]) => {
    setDataMap({ ...dataMap, [path]: newData });
  };

  const handleAddRoot = () => {
    const newRootKey = `root-${Date.now()}`;
    setDataMap({ ...dataMap, [newRootKey]: [] });
  };

  const parseDrillDownPath = (path: string, index: number) => {
    if (!path.includes("level-")) {
      return { actualPath: `level-${index + 1}-${path}`, level: index + 1, category: path };
    }
    if (path.includes("-level-")) {
      const parts = path.split("-level-");
      const restParts = parts[1].split("-");
      return { actualPath: path, level: parseInt(restParts[0], 10), category: restParts.slice(1).join("-") };
    }
    const parts = path.split("-");
    return { actualPath: path, level: parseInt(parts[1], 10), category: parts.slice(2).join("-") };
  };

  return (
    <div className="space-y-4">
      {rootKeys.map((rootKey, idx) => (
        <ParetoInteractive 
          key={rootKey}
          title={idx === 0 ? "PASO 5: PARETO" : `PASO 5: PARETO INDEPENDIENTE ${idx + 1}`}
          level={0}
          data={dataMap[rootKey] || []}
          onDataChange={(d) => updateData(rootKey, d)}
          onBarClick={(cat) => handleBarClick(cat, 0, rootKey)} 
          unit={unit}
          onAddRoot={idx === 0 ? handleAddRoot : undefined}
          onClose={idx > 0 ? () => handleCloseRoot(rootKey) : undefined}
          {...(onUnitChange ? { onUnitChange } : {})}
          isStepCompleted={idx === 0 ? isStepCompleted : undefined}
          {...(idx === 0 && onToggleStep ? { onToggleStep } : {})}
        />
      ))}
      
      {drillDowns.map((drillStr, index) => {
        const { actualPath, level, category } = parseDrillDownPath(drillStr, index);

        return (
          <ParetoInteractive 
            key={actualPath}
            level={level}
            title={`Sub-Pareto: ${category}`}
            subtitle={`Desglose específico (Nivel ${level + 1}) de la categoría ${category}.`}
            data={dataMap[actualPath] || []}
            onDataChange={(d) => updateData(actualPath, d)}
            onBarClick={(cat) => handleBarClick(cat, level, actualPath)}
            onClose={() => handleClose(actualPath)}
            unit={unit}
            {...(onUnitChange ? { onUnitChange } : {})}
          />
        );
      })}
    </div>
  );
}

function AutoResizeTextarea({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
    onChange(e.target.value);
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleInput}
      placeholder={placeholder}
      rows={1}
      className={cn(
        "w-full resize-none overflow-hidden bg-transparent focus:outline-none focus-visible:ring-1",
        className
      )}
      style={{ minHeight: "32px", height: "auto" }}
    />
  );
}

function PrioritizationMatrix({
  value = [],
  onChange
}: {
  value?: any[] | undefined;
  onChange?: ((causes: any[]) => void) | undefined;
}) {
  const causes = value && value.length > 0 ? value : [
    { id: 1, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    { id: 2, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    { id: 3, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    { id: 4, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
  ];

  const updateCause = (id: number, field: string, val: string) => {
    if (onChange) {
      onChange(causes.map(c => c.id === id ? { ...c, [field]: val } : c));
    }
  };

  const addRow = () => {
    if (onChange) {
      onChange([...causes, { id: Date.now(), text: "", impact: "", authority: "", difficulty: "", criteria: "" }]);
    }
  };

  const removeRow = (id: number) => {
    if (onChange && causes.length > 1) {
      onChange(causes.filter(c => c.id !== id));
    }
  };

  return (
    <div className="mt-8 border border-[#0078D7] rounded-sm overflow-hidden bg-white shadow-sm dark:bg-background">
      <div className="bg-white dark:bg-background px-2 py-1 flex items-center justify-between border-b border-[#0078D7]">
        <span className="text-[11px] font-bold text-[#0078D7] uppercase tracking-wide">
          PRIORIZACIÓN - CAUSAS PROBABLES - PROBLEMA 1
        </span>
        <Button variant="ghost" size="sm" onClick={addRow} className="h-6 px-2 text-[10px] uppercase font-bold text-[#0078D7] hover:bg-[#0078D7]/10">
          <Plus className="size-3 mr-1" /> Agregar causa
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0078D7] text-white">
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[30%]">CAUSAS PROBABLES</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">IMPACTO SOBRE EL PROBLEMA</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">AUTORIDAD</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">DIFICULTAD</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">CRITERIO ADICIONAL</th>
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
                  <td className={cn("p-0 text-center font-bold text-xs", isHigh ? "bg-[#00B050] text-white" : "bg-[#E2E2E2] dark:bg-secondary text-black/60 dark:text-foreground/60")}>
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

function TimeSeriesYTD({
  value,
  onChange,
  unit = "$",
  onUnitChange,
  isStepCompleted,
  onToggleStep,
  title = "PASO 3: CURRENT TIME SERIES",
  chartTitle = "CURRENT TIME SERIES",
}: {
  value?: { mes: string; target: number; actual: number | null }[];
  onChange?: (newSeries: { mes: string; target: number; actual: number | null }[]) => void;
  unit?: string;
  onUnitChange?: (newUnit: string) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  title?: string;
  chartTitle?: string;
}) {
  const series = value && value.length > 0 ? value : DEFAULT_TARGET_VS_ACTUAL;

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

  const ytdTarget = series.length > 0 ? series.reduce((sum, s) => sum + (s.target || 0), 0) / series.length : 0;
  const actuals = series.filter(s => s.actual !== null && s.actual !== undefined);
  const ytdActual = actuals.length > 0 ? actuals.reduce((sum, s) => sum + (s.actual || 0), 0) / actuals.length : 0;

  const chartData = [
    ...series.map(s => ({
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
    }
  ];

  const formatValue = (val: any) => {
    if (val === null || val === undefined || isNaN(val)) return "";
    const numStr = Number(val).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (unit === "$") {
      return "$" + numStr;
    }
    return numStr + (unit ? (unit === "%" ? "%" : " " + unit) : "");
  };

  const CustomActualLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === null || value === undefined) return null;
    return (
      <text x={x} y={y - 10} fill="var(--color-foreground)" fontSize={9} textAnchor="middle" fontWeight="bold">
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
      <text x={x + width / 2} y={y - 10} fill="var(--color-foreground)" fontSize={9} textAnchor="middle" fontWeight="bold">
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

      <div className="bg-[#1F497D] text-white p-2.5 text-xs leading-relaxed font-sans rounded-sm shadow-sm">
        <p className="mb-1">Instrucciones:</p>
        <p>1. Rellena el campo gris con su problema.</p>
        <p>2. Completa el período de tiempo con tu período de tiempo deseado (años, meses, semanas, días, etc.)</p>
        <p>3. Rellena las columnas "Objetivo" y "Actual" con tus datos.</p>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unidad de Medida:</span>
          <Input 
            value={unit} 
            onChange={e => { if(onUnitChange) onUnitChange(e.target.value) }}
            placeholder="ej. $, %, HL" 
            className="w-28 h-7 text-xs font-bold" 
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Plantilla Rápida:</span>
          <Select onValueChange={(val) => {
            if (window.confirm("Cambiar la plantilla reemplazará los datos actuales en la tabla. ¿Deseas continuar?")) {
              if (val === 'meses') {
                if (onChange) onChange([
                  { mes: "Ene", target: 0, actual: null }, { mes: "Feb", target: 0, actual: null },
                  { mes: "Mar", target: 0, actual: null }, { mes: "Abr", target: 0, actual: null },
                  { mes: "May", target: 0, actual: null }, { mes: "Jun", target: 0, actual: null },
                  { mes: "Jul", target: 0, actual: null }, { mes: "Ago", target: 0, actual: null },
                  { mes: "Sep", target: 0, actual: null }, { mes: "Oct", target: 0, actual: null },
                  { mes: "Nov", target: 0, actual: null }, { mes: "Dic", target: 0, actual: null }
                ]);
              } else if (val.startsWith('sem-')) {
                const month = val.split('-')[1];
                if (onChange) onChange([
                  { mes: `${month} Sem 1`, target: 0, actual: null },
                  { mes: `${month} Sem 2`, target: 0, actual: null },
                  { mes: `${month} Sem 3`, target: 0, actual: null },
                  { mes: `${month} Sem 4`, target: 0, actual: null },
                  { mes: `${month} Sem 5`, target: 0, actual: null },
                ]);
              }
            }
          }}>
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
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20 hover:text-white" onClick={addRow}>
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
                      onChange={e => updateMes(i, e.target.value)}
                      className="h-8 rounded-none border-none shadow-none text-xs text-center font-semibold bg-transparent focus-visible:ring-1 focus-visible:ring-black/20" 
                    />
                  </td>
                  <td className="border-r border-border/40 p-0">
                    <Input 
                      type="number" 
                      value={s.target || ""} 
                      onChange={e => updateTarget(i, e.target.value)}
                      className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20" 
                    />
                  </td>
                  <td className="border-r border-border/40 p-0">
                    <Input 
                      type="number" 
                      value={s.actual ?? ""} 
                      onChange={e => updateActual(i, e.target.value)}
                      className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20" 
                    />
                  </td>
                  <td className="p-0">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeRow(i)}>
                      <X className="size-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              <tr className="border-b border-border/40">
                <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">YTD Target</td>
                <td className="border-r border-border/40 p-2 font-bold font-mono text-[#0078D7]">{formatValue(ytdTarget)}</td>
                <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
                <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
              </tr>
              <tr>
                <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">YTD Actual</td>
                <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
                <td className="border-r border-border/40 p-2 font-bold font-mono text-muted-foreground">{formatValue(ytdActual)}</td>
                <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Chart Side */}
        <div className="w-full xl:w-[60%] flex flex-col h-[400px]">
          <h4 className="text-center font-bold text-sm mb-4 tracking-wider text-foreground/80">{chartTitle}</h4>
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
              />
              <RTooltip 
                contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12, backgroundColor: "var(--color-card)" }}
                formatter={(val: number) => formatValue(val)}
              />
              <Bar dataKey="ytdTargetBar" name="YTD Target" fill="#0078D7" barSize={30} label={<CustomBarLabel />} />
              <Bar dataKey="ytdActualBar" name="YTD Actual" fill="#808080" barSize={30} label={<CustomBarLabel />} />
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
const SCORE_OPTIONS = ["", "1", "3", "5"] as const;
const SCORE_LABELS: Record<string, string> = { "1": "Bajo", "3": "Medio", "5": "Alto" };
const SCORE_COLORS: Record<string, string> = {
  "1": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "3": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "5": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

function newImpactRow(): ImpactMatrixRow {
  return { id: `ir-${Date.now()}-${Math.random()}`, accion: "", seguridad: "", calidadHigiene: "", costo: "", medioAmbiente: "", servicio: "", priorizar: "" };
}

function calcImpact(row: ImpactMatrixRow): number {
  const vals = [row.seguridad, row.calidadHigiene, row.costo, row.medioAmbiente, row.servicio];
  const nums = vals.filter((v): v is number => typeof v === "number" && v !== 0);
  if (nums.length === 0) return 0;
  return Math.max(...nums);
}

function ImpactMatrixTable({
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
              const impactLevel = impact === 5 ? "5" : impact === 3 ? "3" : impact === 1 ? "1" : "";
              return (
                <tr key={row.id} className="border-b border-border last:border-0 group">
                  <td className="p-0 border-r border-border">
                    <Textarea value={row.accion} onChange={e => updateRow(row.id, "accion", e.target.value)}
                      className="min-h-[36px] rounded-none border-none shadow-none bg-transparent text-xs resize-none p-2 focus-visible:ring-1 focus-visible:ring-black/20"
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
                  <td className="p-1 border-r border-border text-center">
                    {impactLevel ? (
                      <span className={cn("inline-block px-2 py-0.5 rounded text-xs font-bold", SCORE_COLORS[impactLevel])}>
                        {SCORE_LABELS[impactLevel]}
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeRow(row.id)}>
                        <X className="size-3.5" />
                      </Button>
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

function FiveWhysSection({
  tables,
  onChange,
  isStepCompleted,
  onToggleStep,
}: {
  tables: FiveWhysTableData[];
  onChange: (tables: FiveWhysTableData[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const addTable = () => {
    const newId = `fivewhys-${Date.now()}`;
    onChange([...tables, { id: newId, title: "MÉTODO", rows: [{ id: Date.now(), q1: "", q2: "", q3: "", q4: "", q5: "", w1: "", w2: "", w3: "", w4: "", w5: "", accion: "" }] }]);
  };

  const updateTable = (id: string, newRows: any[]) => {
    onChange(tables.map(t => t.id === id ? { ...t, rows: newRows } : t));
  };
  
  const updateTitle = (id: string, newTitle: string) => {
    onChange(tables.map(t => t.id === id ? { ...t, title: newTitle } : t));
  };

  const removeTable = (id: string) => {
    if (tables.length === 1) return;
    onChange(tables.filter(t => t.id !== id));
  };

  return (
    <StepCard 
      className="overflow-hidden"
      title="PASO 7: 5 WHYS"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >

      <div className="space-y-8">
        {tables.map((table, index) => (
          <div key={table.id} className="pt-4">
            <FiveWhysInteractive
              value={table.rows}
              onChange={(rows) => updateTable(table.id, rows)}
              title={table.title}
              onTitleChange={(title) => updateTitle(table.id, title)}
              index={index}
              onRemoveTable={tables.length > 1 ? () => removeTable(table.id) : undefined}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4 border-t border-border">
        <Button variant="outline" size="sm" onClick={addTable} className="border-dashed border-2 hover:border-primary hover:bg-primary/5">
          <Plus className="size-4 mr-2" /> Agregar otra tabla 5 Whys
        </Button>
      </div>
    </StepCard>
  );
}

function FiveWhysInteractive({
  value,
  onChange,
  title,
  onTitleChange,
  index,
  onRemoveTable,
}: {
  value?: any[];
  onChange?: (whys: any[]) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  index: number;
  onRemoveTable?: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateRow = (id: number, field: string, val: string) => {
    if (!value || !onChange) return;
    onChange(value.map((r: any) => r.id === id ? { ...r, [field]: val } : r));
  };

  const addRow = () => {
    if (onChange && value) {
      onChange([...value, { id: Date.now(), q1: "", q2: "", q3: "", q4: "", q5: "", w1: "", w2: "", w3: "", w4: "", w5: "", accion: "" }]);
    }
  };

  const removeRow = (id: number) => {
    if (onChange && value) {
      if (value.length === 1) return;
      onChange(value.filter((r: any) => r.id !== id));
    }
  };

  const whysCount = Math.max(
    5,
    ...(value || []).flatMap((r: any) => 
      Object.keys(r)
        .filter(k => k.startsWith('q'))
        .map(k => parseInt(k.substring(1)))
        .filter(n => !isNaN(n))
    )
  );

  const addWhyColumn = () => {
    if (onChange && value) {
      const nextWhy = whysCount + 1;
      onChange(value.map((r: any) => ({ ...r, [`q${nextWhy}`]: "", [`w${nextWhy}`]: "" })));
    }
  };

  const removeWhyColumn = () => {
    if (onChange && value && whysCount > 5) {
      onChange(value.map((r: any) => {
        const newRow = { ...r };
        delete newRow[`q${whysCount}`];
        delete newRow[`w${whysCount}`];
        return newRow;
      }));
    }
  };

  const tableContent = (
    <div className={cn("overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background shadow-sm flex-1", isFullscreen ? "flex flex-col h-full" : "")}>
      <div className="flex justify-between items-center px-2 py-1 bg-white dark:bg-background border-b border-[#0078D7]">
        <input 
          type="text" 
          value={title || "MÉTODO"} 
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="text-[11px] font-bold text-[#0078D7] uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 p-0.5 w-48" 
          placeholder="TÍTULO DE LA TABLA"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold" onClick={addWhyColumn}>
              <Plus className="mr-1 size-3" /> Añadir Por Qué
            </Button>
            {whysCount > 5 && (
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold" onClick={removeWhyColumn}>
                <MinusCircle className="mr-1 size-3" /> Quitar Por Qué
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold" onClick={addRow}>
            <Plus className="mr-1 size-3" /> Añadir Causa
          </Button>
          {onRemoveTable && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold">
                  <X className="mr-1 size-3" /> Eliminar Tabla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar tabla 5 Whys?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todas las preguntas y respuestas registradas en esta tabla.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemoveTable} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!isFullscreen && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold" onClick={() => setIsFullscreen(true)}>
              <Maximize2 className="mr-1 size-3" /> Expandir
            </Button>
          )}
          <span className="text-[11px] font-bold text-[#0078D7] uppercase">TEMA {String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            {Array.from({ length: whysCount }).map((_, i) => (
              <th key={i} className="font-bold uppercase text-center border-r border-white/20 p-2 text-[10px] min-w-[150px]">
                {i + 1}º POR QUÉ
              </th>
            ))}
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">CAUSA RAÍZ</th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[150px] border-r border-white/20">ACCION(ES)</th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">EVIDENCIA</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {value?.map((row: any) => (
            <Fragment key={row.id}>
              {/* Fila de Preguntas */}
              <tr className="border-b border-white group">
                {Array.from({ length: whysCount }).map((_, i) => (
                  <td key={`q-${i}`} className={cn("p-0 border-r border-white align-top",
                    row.isRootCause === "Sí" ? "bg-red-50 dark:bg-red-950/30" :
                    row.isRootCause === "No" ? "bg-green-50 dark:bg-green-950/30" :
                    "bg-blue-100/50 dark:bg-blue-900/20"
                  )}>
                    <AutoResizeTextarea
                      value={row[`q${i + 1}`] || ""}
                      onChange={(val) => updateRow(row.id, `q${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-semibold focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/60 overflow-hidden"
                      placeholder="Pregunta..."
                    />
                  </td>
                ))}
                <td rowSpan={2} className={cn(
                  "p-1 border-r border-white align-middle text-center min-w-[80px]",
                  row.isRootCause === "Sí" ? "bg-red-100 dark:bg-red-900/40" :
                  row.isRootCause === "No" ? "bg-green-100 dark:bg-green-900/40" :
                  "bg-[#E2E2E2] dark:bg-secondary"
                )}>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Button 
                      variant={row.isRootCause === "Sí" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => updateRow(row.id, "isRootCause", row.isRootCause === "Sí" ? "" : "Sí")}
                      className={cn("h-6 w-12 text-[10px] px-0", row.isRootCause === "Sí" ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : "hover:bg-red-50 hover:text-red-600")}
                    >
                      SÍ
                    </Button>
                    <Button 
                      variant={row.isRootCause === "No" ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => updateRow(row.id, "isRootCause", row.isRootCause === "No" ? "" : "No")}
                      className={cn("h-6 w-12 text-[10px] px-0", row.isRootCause === "No" ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "hover:bg-green-50 hover:text-green-600")}
                    >
                      NO
                    </Button>
                  </div>
                </td>
                <td rowSpan={2} className={cn("p-0 border-r border-white align-top",
                  row.isRootCause === "Sí" ? "bg-red-50 dark:bg-red-950/30" :
                  row.isRootCause === "No" ? "bg-green-50 dark:bg-green-950/30" :
                  "bg-[#E2E2E2] dark:bg-secondary"
                )}>
                  <AutoResizeTextarea
                    value={row.accion || ""}
                    onChange={(val) => updateRow(row.id, "accion", val)}
                    className="w-full min-h-[80px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground overflow-hidden"
                  />
                </td>
                <td rowSpan={2} className="bg-background align-middle text-center border-r border-white/20 p-1">
                  <div className="flex flex-col items-center justify-center min-h-[40px]">
                    {row.evidencia ? (
                      <div className="relative group flex justify-center">
                        {row.evidencia.includes('application/pdf') ? (
                          <a href={row.evidencia} target="_blank" rel="noreferrer" className="flex items-center justify-center size-10 rounded bg-red-100 text-red-600 hover:bg-red-200" title="Ver PDF">
                            <span className="text-[10px] font-bold">PDF</span>
                          </a>
                        ) : (
                          <a href={row.evidencia} target="_blank" rel="noreferrer" title="Ver Imagen">
                            <img src={row.evidencia} alt="Evidencia" className="size-10 object-cover rounded shadow-sm border border-border" />
                          </a>
                        )}
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="absolute -top-2 -right-2 size-5 opacity-0 group-hover:opacity-100 transition-opacity rounded-full p-0"
                          onClick={() => updateRow(row.id, "evidencia", "")}
                        >
                          <X className="size-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer text-muted-foreground hover:text-blue-600 flex flex-col items-center">
                        <Paperclip className="size-4" />
                        <span className="text-[9px] mt-1 text-center leading-tight">Añadir<br/>Evidencia</span>
                        <input 
                          type="file" 
                          accept="image/*,application/pdf" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                updateRow(row.id, "evidencia", ev.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </td>
                <td rowSpan={2} className="bg-background align-middle">
                  {(value?.length || 0) > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive mx-auto block">
                          <X className="size-4" />
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
              {/* Fila de Respuestas */}
              <tr className="border-b-[3px] border-[#0078D7] group">
                {Array.from({ length: whysCount }).map((_, i) => (
                  <td key={`w-${i}`} className={cn("p-0 border-r border-white align-top",
                    row.isRootCause === "Sí" ? "bg-red-100 dark:bg-red-900/40" :
                    row.isRootCause === "No" ? "bg-green-100 dark:bg-green-900/40" :
                    "bg-[#E2E2E2] dark:bg-secondary"
                  )}>
                    <AutoResizeTextarea
                      value={row[`w${i + 1}`] || ""}
                      onChange={(val) => updateRow(row.id, `w${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/50 overflow-hidden"
                      placeholder="Respuesta..."
                    />
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      {!isFullscreen && tableContent}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 sm:p-6 flex flex-col gap-2 overflow-hidden bg-muted/20">
          <DialogHeader className="sr-only">
            <DialogTitle>{title || "5 WHYS"}</DialogTitle>
          </DialogHeader>
          {tableContent}
        </DialogContent>
      </Dialog>
    </>
  );
}

function StepHeader({
  stepId,
  title,
  completedSteps,
  onToggleStep,
  children,
}: {
  stepId: string;
  title: string;
  completedSteps: Set<string>;
  onToggleStep: (stepId: string) => void;
  children?: React.ReactNode;
}) {
  const isCompleted = completedSteps.has(stepId);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onToggleStep(stepId)}
          title={isCompleted ? "Desmarcar paso como completado" : "Marcar paso como completado"}
          className={cn(
            "shrink-0 size-7 grid place-items-center rounded-full border-2 transition-all cursor-pointer",
            isCompleted
              ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm"
              : "border-muted-foreground/40 text-muted-foreground/40 hover:border-emerald-500 hover:text-emerald-500 bg-background"
          )}
        >
          <Check className="size-4" />
        </button>
        <h3 className={cn("font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2", isCompleted && "text-emerald-600 dark:text-emerald-400")}>
          <span>{title}</span>
          {isCompleted && (
            <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
              Completado
            </span>
          )}
        </h3>
      </div>
      {children}
    </div>
  );
}

const isPhaseStepsCompleted = (phaseId: string, completedSteps: Set<string>) => {
  const steps = PHASE_STEPS_MAP[phaseId as Phase] || [];
  return steps.length > 0 && steps.every(s => completedSteps.has(s));
};

function CustomStepper({
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
        const isCompleted = completedPhases.has(phase.id) || isPhaseStepsCompleted(phase.id, completedSteps);
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
              onClick={(e) => { e.stopPropagation(); onToggleComplete(phase.id as Phase); }}
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
  "Creación & ejecución de estándares": {
    bg: "bg-indigo-500/15 dark:bg-indigo-500/25",
    text: "text-indigo-700 dark:text-indigo-300",
    border: "border-indigo-500/40",
  },
  "Proceso de revisión de rutina": {
    bg: "bg-cyan-500/15 dark:bg-cyan-500/25",
    text: "text-cyan-700 dark:text-cyan-300",
    border: "border-cyan-500/40",
  },
  "Gestión del conocimiento": {
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
  "Solución de problemas": {
    bg: "bg-rose-500/15 dark:bg-rose-500/25",
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-500/40",
  },
  "Descripción del negocio": {
    bg: "bg-teal-500/15 dark:bg-teal-500/25",
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-500/40",
  },
  "Proceso de revisión del rendimiento": {
    bg: "bg-violet-500/15 dark:bg-violet-500/25",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-500/40",
  },
};

function VpoCheckpointTable({
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
    const updated = checkpoints.map(item => item.id === id ? { ...item, status: newStatus } : item);
    onChange(updated);
  };

  const updateEvidencia = (id: string, text: string) => {
    const updated = checkpoints.map(item => item.id === id ? { ...item, evidencia: text } : item);
    onChange(updated);
  };

  const yesCount = checkpoints.filter(c => c.status === "YES").length;
  const scorePct = Math.round((yesCount / checkpoints.length) * 100);

  return (
    <StepCard 
      title="PASO 2: PHASE SDCA CHECKLIST"
      isStepCompleted={completedSteps.has("step-2")}
      onToggleStep={() => onToggleStep("step-2")}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <StepInstructions>
          <p className="mb-2"><strong>PHASE SDCA CHECKLIST:</strong> Este checklist evalúa la madurez y estandarización del proceso afectado según los pilares del Sistema de Gestión VPO de Grupo Modelo.</p>
          <p>Evalúa cada punto en el contexto de tu problema. Registra las evidencias o comentarios de soporte para cada ítem y selecciona el status correspondiente (YES / NO / N/A). La brecha identificada servirá para alimentar el plan de acción (Kanban).</p>
        </StepInstructions>

        <div className="w-full flex rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden shadow-sm">
          <div className="flex w-[120px] shrink-0 items-center justify-center bg-white dark:bg-background border-r border-sky-500/30 p-4">
            <span className="font-bold text-sky-500">Guía</span>
          </div>
          <div className="flex-1 space-y-3 p-4 text-sm font-medium text-foreground/90">
            <p>
              <strong>Si el score es inferior al 70%</strong> - priorizar las acciones entre los miembros del equipo para cerrar las brechas en los puntos más relevantes del problema. Sin embargo, el equipo debe proceder en paralelo si los datos iniciales indican que hay otros aspectos del problema que estos items del SDCA no pueden abordar sin datos y análisis adicionales.
            </p>
            <p>
              <strong>Si el score es mayor al 70%</strong> - proceda directamente al resto de este toolkit. Cualquier brecha en los puntos anteriores puede asignarse como acciones para los miembros del equipo si es relevante para el problema y es probable que tenga un impacto. Utilice la matriz de impacto en la pestaña de action log, si es necesario, para ayudar a decidir si deben completarse o no.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/80 px-4 py-2 rounded-xl border border-border/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progreso VPO Checkpoint:</span>
          <span className={cn(
            "font-mono text-xl font-extrabold", 
            scorePct >= 70 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}>
            {scorePct}% ({yesCount}/{checkpoints.length} YES)
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            scorePct >= 70 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-rose-500"
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
              {problemaTexto || "Sin especificar (llena la casilla de Descripción del Problema en el Paso 1)"}
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
                <TableRow key={item.id} className="hover:bg-secondary/30 transition-colors border-b border-border/60">
                  <TableCell className="py-3 px-4 border-r border-border/60 align-top">
                    <span className={cn(
                      "inline-block rounded-md px-2.5 py-1 text-[11px] font-bold border leading-snug",
                      pilarStyle.bg,
                      pilarStyle.text,
                      pilarStyle.border
                    )}>
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
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
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

export function PdcaDialog({
  pdca,
  open,
  onOpenChange,
}: {
  pdca: Pdca | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = useMemo(() => pdca ?? getEmptyDraft(), [pdca]);
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  // Deadline lock: non-admins cannot edit once the deadline has passed
  const isDeadlineLocked = useMemo(() => {
    if (isAdmin) return false;
    const deadlineStr = data.fechaFinalizacion?.trim();
    if (!deadlineStr) return false;
    const parts = deadlineStr.split("/");
    if (parts.length !== 3) return false;
    const d = new Date(+parts[2], +parts[1] - 1, +parts[0]);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }, [isAdmin, data.fechaFinalizacion]);

  // Combine: user can edit only if they are admin, or deadline is not locked
  const canEdit = isAdmin || !isDeadlineLocked;

  const [tab, setTab] = useState<Phase>(data.fase);
  const [titulo, setTitulo] = useState<string>(data.titulo || "");
  const [area, setArea] = useState<string>(data.area || "cocimientos");
  const [problema, setProblema] = useState<string>(data.problema || "");
  const [causaRaiz, setCausaRaiz] = useState<string>(data.causaRaiz || "");
  const [acciones, setAcciones] = useState<ActionItem[]>(data.acciones);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(() => parseDateString(data.fechaFinalizacion));
  
  // Paso 2 VPO Checkpoints state
  const [vpoCheckpoints, setVpoCheckpoints] = useState<VpoCheckpointItem[]>(
    data.vpoCheckpoints || DEFAULT_VPO_CHECKPOINTS
  );

  // Pareto state
  const [paretoDrillDowns, setParetoDrillDowns] = useState<string[]>(
    data.paretoDrillDowns || []
  );
  const [paretoDataMap, setParetoDataMap] = useState<Record<string, ParetoItem[]>>(
    data.paretoDataMap || DEFAULT_PARETO_DATA_MAP
  );
  const [paretoUnit, setParetoUnit] = useState<string>(data.paretoUnit || "");

  // TimeSeries YTD state
  const [targetVsActual, setTargetVsActual] = useState<{ mes: string; target: number; actual: number | null }[]>(
    data.targetVsActual || DEFAULT_TARGET_VS_ACTUAL
  );
  const [targetVsActualUnit, setTargetVsActualUnit] = useState<string>(data.targetVsActualUnit || "");

  const [kpiFinalResultData, setKpiFinalResultData] = useState<{ mes: string; target: number; actual: number | null }[]>(
    data.kpiFinalResultData || DEFAULT_TARGET_VS_ACTUAL
  );
  const [kpiFinalResultUnit, setKpiFinalResultUnit] = useState<string>(data.kpiFinalResultUnit || "");
  const [gembaFinalImage, setGembaFinalImage] = useState<string | null>(data.gembaFinalImage || null);
  const [evidencias, setEvidencias] = useState<string[]>(data.evidencias || []);
  const [kpiDocuments, setKpiDocuments] = useState<string[]>(data.kpiDocuments || []);

  const [hasFlavorCorrelation, setHasFlavorCorrelation] = useState<boolean>(data.hasFlavorCorrelation || false);
  const [flavorCorrelationData, setFlavorCorrelationData] = useState<any>(data.flavorCorrelationData || null);
  
  const [hasGopThemes, setHasGopThemes] = useState<boolean>(data.hasGopThemes || false);
  const [gopThemesData, setGopThemesData] = useState<any[]>(data.gopThemesData || []);
  const [processMappingImage, setProcessMappingImage] = useState<string | null>(data.processMappingImage || null);

  // 5 Whys state
  const [fiveWhysTables, setFiveWhysTables] = useState<FiveWhysTableData[]>(() => {
    if (data.fiveWhysTables && data.fiveWhysTables.length > 0) {
      return data.fiveWhysTables;
    }
    // Migration from old fiveWhys array
    if (data.fiveWhys && Array.isArray(data.fiveWhys) && data.fiveWhys.length > 0) {
      let migratedRows = [];
      if (typeof data.fiveWhys[0] === 'object') {
        migratedRows = data.fiveWhys;
      } else {
        migratedRows = [{
          id: 1,
          q1: "", q2: "", q3: "", q4: "", q5: "",
          w1: data.fiveWhys[0] || "",
          w2: data.fiveWhys[1] || "",
          w3: data.fiveWhys[2] || "",
          w4: data.fiveWhys[3] || "",
          w5: data.fiveWhys[4] || "",
          accion: ""
        }];
      }
      return [{ id: "fivewhys-1", title: "MÉTODO", rows: migratedRows }];
    }
    return [{ id: "fivewhys-1", title: "MÉTODO", rows: [{ id: Date.now(), q1: "", q2: "", q3: "", q4: "", q5: "", w1: "", w2: "", w3: "", w4: "", w5: "", accion: "" }] }];
  });

  // Impact Matrix state
  const [impactMatrix, setImpactMatrix] = useState<ImpactMatrixRow[]>(() =>
    data.impactMatrix && data.impactMatrix.length > 0 ? data.impactMatrix : [newImpactRow()]
  );

  // Ishikawas state
  const [ishikawas, setIshikawas] = useState<IshikawaItem[]>(() => {
    if (data.ishikawas && data.ishikawas.length > 0) {
      return data.ishikawas;
    }
    // Migration from old fields
    return [{
      id: "ishikawa-1",
      effect: data.ishikawaEffect || "Efecto / Problema",
      causes: data.ishikawaCauses || { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] },
      prioritization: data.prioritizationCauses || []
    }];
  });

  // KPI Tree state
  const [kpiNodes, setKpiNodes] = useState<any[]>(data.kpiNodes || []);
  const [kpiEdges, setKpiEdges] = useState<any[]>(data.kpiEdges || []);

  const handleKpiChange = useCallback((newNodes: any[], newEdges: any[]) => {
    setKpiNodes(newNodes);
    setKpiEdges(newEdges);
  }, []);

  // Completed phases & steps state
  const [completedPhases, setCompletedPhases] = useState<Set<string>>(
    new Set(data.completedPhases || [])
  );
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(data.completedSteps || [])
  );

  const togglePhaseComplete = useCallback((phase: Phase) => {
    if (!isAdmin) {
      toast.error("Solo los usuarios administradores pueden marcar o desmarcar verificaciones.");
      return;
    }
    const stepsForPhase = PHASE_STEPS_MAP[phase] || [];

    setCompletedPhases(prevPhases => {
      const nextPhases = new Set(prevPhases);
      const willBeCompleted = !nextPhases.has(phase);

      if (willBeCompleted) {
        nextPhases.add(phase);
      } else {
        nextPhases.delete(phase);
      }

      // Automatically update all steps belonging to this phase
      setCompletedSteps(prevSteps => {
        const nextSteps = new Set(prevSteps);
        stepsForPhase.forEach(stepId => {
          if (willBeCompleted) {
            nextSteps.add(stepId);
          } else {
            nextSteps.delete(stepId);
          }
        });
        return nextSteps;
      });

      return nextPhases;
    });
  }, [isAdmin]);

  const toggleStepComplete = useCallback((stepId: string) => {
    if (!isAdmin) {
      toast.error("Solo los usuarios administradores pueden marcar o desmarcar verificaciones.");
      return;
    }
    setCompletedSteps(prevSteps => {
      const nextSteps = new Set(prevSteps);
      if (nextSteps.has(stepId)) {
        nextSteps.delete(stepId);
      } else {
        nextSteps.add(stepId);
      }

      // Check if phase should be auto-completed or auto-uncompleted
      setCompletedPhases(prevPhases => {
        const nextPhases = new Set(prevPhases);
        (Object.keys(PHASE_STEPS_MAP) as Phase[]).forEach(phase => {
          const steps = PHASE_STEPS_MAP[phase];
          if (steps.includes(stepId)) {
            const allStepsDone = steps.every(s => nextSteps.has(s));
            if (allStepsDone) {
              nextPhases.add(phase);
            } else {
              nextPhases.delete(phase);
            }
          }
        });
        return nextPhases;
      });

      return nextSteps;
    });
  }, [isAdmin]);
  // Definición de la Meta state
  const [definicionMeta, setDefinicionMeta] = useState<DefinicionMeta>(
    data.definicionMeta || DEFAULT_DEFINICION_META
  );

  const [equipo, setEquipo] = useState<string[]>(data.equipo || []);
  
  // Participantes state
  const [participantes, setParticipantes] = useState<ParticipantesData>(
    data.participantes || {
      localesNombres: "",
      localesRoles: "",
      externosNombres: "",
      externosRoles: "",
      fechaReunionInicial: "",
      reunionRutina: ""
    }
  );

  const flattenedCauses = useMemo(() => {
    return ishikawas.flatMap(ish => Object.values(ish.causes).flat());
  }, [ishikawas]);

  const isInitialMount = useRef(true);
  const skipNextAutosave = useRef(true);
  const lastSavedRef = useRef<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    isInitialMount.current = true;
    skipNextAutosave.current = true;
    
    let initialData = data;
    setHasUnsavedChanges(false);

    lastSavedRef.current = JSON.stringify(data);

    setTitulo(initialData.titulo || "");
    setArea(initialData.area || "cocimientos");
    setProblema(initialData.problema || "");
    setCausaRaiz(initialData.causaRaiz || "");
    setFechaFin(parseDateString(initialData.fechaFinalizacion));
    setFiveWhysTables(() => {
      if (initialData.fiveWhysTables && initialData.fiveWhysTables.length > 0) {
        return initialData.fiveWhysTables;
      }
      if (initialData.fiveWhys && Array.isArray(initialData.fiveWhys) && initialData.fiveWhys.length > 0) {
        let migratedRows = [];
        if (typeof initialData.fiveWhys[0] === 'object') {
          migratedRows = initialData.fiveWhys;
        } else {
          migratedRows = [{
            id: 1,
            q1: "", q2: "", q3: "", q4: "", q5: "",
            w1: initialData.fiveWhys[0] || "",
            w2: initialData.fiveWhys[1] || "",
            w3: initialData.fiveWhys[2] || "",
            w4: initialData.fiveWhys[3] || "",
            w5: initialData.fiveWhys[4] || "",
            accion: ""
          }];
        }
        return [{ id: "fivewhys-1", title: "MÉTODO", rows: migratedRows }];
      }
      return [{ id: "fivewhys-1", title: "MÉTODO", rows: [{ id: Date.now(), q1: "", q2: "", q3: "", q4: "", q5: "", w1: "", w2: "", w3: "", w4: "", w5: "", accion: "" }] }];
    });
    setTab(initialData.fase);
    setAcciones(initialData.acciones || []);
    setKpiNodes(initialData.kpiNodes || []);
    setKpiEdges(initialData.kpiEdges || []);
    setIshikawas(() => {
      if (initialData.ishikawas && initialData.ishikawas.length > 0) {
        return initialData.ishikawas;
      }
      return [{
        id: "ishikawa-1",
        effect: initialData.ishikawaEffect || "Efecto / Problema",
        causes: initialData.ishikawaCauses || { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] },
        prioritization: initialData.prioritizationCauses || []
      }];
    });
    setTargetVsActual(initialData.targetVsActual || DEFAULT_TARGET_VS_ACTUAL);
    setTargetVsActualUnit(initialData.targetVsActualUnit || "");
    setKpiFinalResultUnit(initialData.kpiFinalResultUnit || "");
    setParetoDrillDowns(initialData.paretoDrillDowns || []);
    setParetoDataMap(initialData.paretoDataMap || DEFAULT_PARETO_DATA_MAP);
    setParetoUnit(initialData.paretoUnit || "");
    setImpactMatrix(initialData.impactMatrix && initialData.impactMatrix.length > 0 ? initialData.impactMatrix : [newImpactRow()]);
    setVpoCheckpoints(initialData.vpoCheckpoints || DEFAULT_VPO_CHECKPOINTS);
    setDefinicionMeta(initialData.definicionMeta || DEFAULT_DEFINICION_META);
    setEquipo(initialData.equipo || []);
    setParticipantes(initialData.participantes || {
      localesNombres: "",
      localesRoles: "",
      externosNombres: "",
      externosRoles: "",
      fechaReunionInicial: "",
      reunionRutina: ""
    });
    setCompletedPhases(new Set(initialData.completedPhases || []));
    setCompletedSteps(new Set(initialData.completedSteps || []));
  }, [data.id, open, data]);

  const completedStepsCount = useMemo(() => {
    const allStepIds = ["step-1", "step-2", "step-3", "step-4", "step-5", "step-6", "step-7", "step-8", "step-9", "step-10", "step-11"];
    return allStepIds.filter(s => completedSteps.has(s)).length;
  }, [completedSteps]);

  const progressPercentage = Math.round((completedStepsCount / 11) * 100);

  // Detect unsaved changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const newDraft: Pdca = {
      ...data,
      titulo,
      area,
      problema,
      causaRaiz: causaRaiz,
      fiveWhysTables,
      impactMatrix,
      fase: tab,
      progreso: progressPercentage,
      acciones,
      kpiNodes,
      kpiEdges,
      ishikawas,
      targetVsActual,
      targetVsActualUnit,
      kpiFinalResultData,
      kpiFinalResultUnit,
      gembaFinalImage,
      evidencias,
      kpiDocuments,
      paretoDataMap,
      paretoDrillDowns,
      paretoUnit,
      vpoCheckpoints,
      definicionMeta,
      participantes,
      equipo,
      completedPhases: Array.from(completedPhases),
      completedSteps: Array.from(completedSteps),
      fechaFinalizacion: formatDateToString(fechaFin),
      actualizado: new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const draftStr = JSON.stringify(newDraft);

    if (skipNextAutosave.current) {
      skipNextAutosave.current = false;
      if (!hasUnsavedChanges) {
        lastSavedRef.current = draftStr;
        return;
      }
    }

    if (draftStr === lastSavedRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(true);
  }, [
    titulo, area, problema, causaRaiz, fiveWhysTables, impactMatrix, tab, progressPercentage, acciones,
    kpiNodes, kpiEdges, ishikawas, targetVsActual, targetVsActualUnit, kpiFinalResultData, kpiFinalResultUnit, gembaFinalImage, evidencias, kpiDocuments, paretoDataMap, paretoDrillDowns, paretoUnit, vpoCheckpoints, definicionMeta, participantes, equipo, completedPhases, completedSteps, fechaFin
  ]);

  // Upload all cached changes to Firestore database
  const handleSaveToFirestore = useCallback(async () => {
    setIsSaving(true);

    const updatedPdca: Pdca = {
      ...data,
      titulo,
      area,
      problema,
      causaRaiz: causaRaiz,
      fiveWhysTables,
      impactMatrix,
      fase: tab,
      progreso: progressPercentage,
      acciones,
      kpiNodes,
      kpiEdges,
      ishikawas,
      targetVsActual,
      targetVsActualUnit,
      kpiFinalResultData,
      kpiFinalResultUnit,
      gembaFinalImage,
      evidencias,
      kpiDocuments,
      paretoDataMap,
      paretoDrillDowns,
      paretoUnit,
      hasFlavorCorrelation,
      flavorCorrelationData,
      hasGopThemes,
      gopThemesData,
      processMappingImage,
      vpoCheckpoints,
      definicionMeta,
      participantes,
      equipo,
      completedPhases: Array.from(completedPhases),
      completedSteps: Array.from(completedSteps),
      fechaFinalizacion: formatDateToString(fechaFin),
      actualizado: new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }),
      autor: data.autor || currentUser?.name || "Usuario",
      autorEmail: data.autorEmail || currentUser?.email || "",
    };

    try {
      await savePdcaToFirestore(updatedPdca);
      lastSavedRef.current = JSON.stringify(updatedPdca);
      setHasUnsavedChanges(false);
      toast.success("¡Todos los cambios del PDCA se subieron a la base de datos!");
    } catch (err) {
      console.error("Error al subir a la base de datos:", err);
      toast.error("Error al guardar en la base de datos");
    } finally {
      setIsSaving(false);
    }
  }, [data, titulo, area, problema, causaRaiz, fiveWhysTables, impactMatrix, tab, progressPercentage, acciones, kpiNodes, kpiEdges, ishikawas, targetVsActual, targetVsActualUnit, kpiFinalResultData, kpiFinalResultUnit, gembaFinalImage, kpiDocuments, paretoDataMap, paretoDrillDowns, paretoUnit, vpoCheckpoints, definicionMeta, participantes, equipo, completedPhases, completedSteps, fechaFin, currentUser]);

  const nextPhase = phases[Math.min(phases.indexOf(tab) + 1, 3)];

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="space-y-4 border-b border-border pb-5 mb-5 text-left">
        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="-ml-2 mb-2 text-muted-foreground hover:text-foreground">
          <ArrowRight className="size-4 mr-2 rotate-180" /> Volver a Mis PDCAs
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
            {data.id}
          </span>
          <PhaseBadge phase={data.fase} />
          <span className="text-xs text-muted-foreground">
            Última actualización: {data.actualizado}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary/80 text-xs border border-border">
              {isSaving ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <RefreshCw className="size-3 animate-spin" /> Subiendo a la BD...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Save className="size-3" /> Cambios sin guardar
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="size-3" /> Sincronizado con la BD
                </span>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleSaveToFirestore}
              disabled={isSaving || !canEdit}
              className={cn(
                "font-semibold text-xs h-8 gap-1.5 transition-all shadow-sm",
                hasUnsavedChanges && canEdit
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <UploadCloud className="size-3.5" />
              {isSaving ? "Guardando..." : "Guardar PDCA"}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <h2 className="font-display text-3xl font-bold">
            {data.titulo || "Nuevo PDCA"}
          </h2>
          <div className="flex items-center gap-2 bg-secondary/60 px-3 py-1.5 rounded-lg border border-border">
            <span className="text-xs font-semibold text-muted-foreground">Progreso del PDCA:</span>
            <span className={cn(
              "font-mono text-base font-bold",
              progressPercentage === 100 ? "text-emerald-500" : progressPercentage > 0 ? "text-primary" : "text-muted-foreground"
            )}>
              {progressPercentage}%
            </span>
            <span className="text-xs text-muted-foreground font-medium">({completedStepsCount}/11 pasos)</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/80 border border-border/50">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                progressPercentage === 100
                  ? "bg-emerald-500"
                  : progressPercentage >= 50
                    ? "bg-primary"
                    : "bg-amber-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 pb-20">
          <CustomStepper current={tab} onSelect={setTab} completedPhases={completedPhases} onToggleComplete={togglePhaseComplete} completedSteps={completedSteps} />

          {/* Deadline Locked Banner */}
          {isDeadlineLocked && (
            <div className="flex items-start gap-3 rounded-xl border border-red-400/50 bg-red-50/80 dark:bg-red-950/20 p-4 text-red-700 dark:text-red-300 shadow-sm">
              <span className="shrink-0 mt-0.5 text-red-500">🔒</span>
              <div>
                <p className="font-semibold text-sm">PDCA bloqueado — Fecha límite vencida</p>
                <p className="text-xs mt-0.5 text-red-600/80 dark:text-red-400/80">
                  La fecha límite <strong>{data.fechaFinalizacion}</strong> ya pasó. Solo un administrador puede editar este PDCA. Contacta a tu admin si necesitas actualizarlo.
                </p>
              </div>
            </div>
          )}

          {/* FASE 1: DEFINICIÓN Y ESTANDARIZACIÓN */}
          {tab === "Plan" && (
            <div className="space-y-6">
              <StepCard 
                title="Paso 1: Problem Statement"
                isStepCompleted={completedSteps.has("step-1")}
                onToggleStep={() => toggleStepComplete("step-1")}
              >
                <StepInstructions>
                  <p className="mb-2">Instrucciones: Revisar la situación actual con todos los miembros del equipo. Esto se puede hacer utilizando los dashboards de KPI, GapAs, T&M slides, Análisis de pérdidas y desperdicios, etc. El objetivo es familiarizar a todos con el tema que se les pide que aborden.</p>
                  <p>A partir de ahí, rellene las secciones de abajo. Evite las suposiciones y saltar a conclusiones. Es probable que regrese y perfeccione la descripción del problema, los KPI, los PI, el objetivo y los miembros del equipo.</p>
                </StepInstructions>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título del proyecto</Label>
                    <Input 
                      id="titulo" 
                      value={titulo} 
                      onChange={(e) => setTitulo(e.target.value)} 
                      placeholder="Ej. Reducción de merma en L3" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="area">Área</Label>
                    <Select value={area} onValueChange={(v) => setArea(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un área" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bloque_frio">Bloque Frío</SelectItem>
                        <SelectItem value="cocimientos">Cocimientos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fechaFinalizacion">Fecha Límite</Label>
                    <DatePicker 
                      date={fechaFin} 
                      setDate={setFechaFin} 
                      placeholder="Seleccionar fecha límite"
                      className="h-9 w-full"
                      disabled={!isAdmin}
                    />
                  </div>
                </div>
                <TeamMembersInput members={equipo} onChange={setEquipo} />
                <div className="space-y-2">
                  <Label htmlFor="problema">Descripción del Problema</Label>
                  <Textarea
                    id="problema"
                    rows={3}
                    value={problema}
                    onChange={(e) => setProblema(e.target.value)}
                    placeholder="Describe el problema con datos, magnitud e impacto."
                  />
                </div>

                <div className="pt-3 border-t border-border/60 space-y-6">
                  <PdcaGoalDefinition 
                    value={definicionMeta} 
                    onChange={setDefinicionMeta} 
                    readOnly={!isAdmin} 
                  />
                  <PdcaParticipants 
                    value={participantes} 
                    onChange={setParticipantes} 
                    readOnly={!isAdmin} 
                  />
                </div>
              </StepCard>

              <VpoCheckpointTable
                checkpoints={vpoCheckpoints}
                onChange={setVpoCheckpoints}
                problemaTexto={problema}
                completedSteps={completedSteps}
                onToggleStep={toggleStepComplete}
              />
            </div>
          )}

          {/* FASE 2: ANÁLISIS DE DATOS */}
          {tab === "Do" && (
            <div className="space-y-6">
              <TimeSeriesYTD 
                value={targetVsActual}
                onChange={setTargetVsActual}
                unit={targetVsActualUnit}
                onUnitChange={setTargetVsActualUnit}
                isStepCompleted={completedSteps.has("step-3")} 
                onToggleStep={() => toggleStepComplete("step-3")} 
              />
              <MultiImageUploadSection
                images={kpiDocuments}
                onChange={setKpiDocuments}
                title="PASO 4: KPI TREE (IP)"
                subtitle="Documentación del KPI Tree"
                description="Sube hasta 6 fotos o un PDF con tu análisis de KPI Tree (Indicadores de Proceso)."
                maxImages={6}
                isStepCompleted={completedSteps.has("step-4")}
                onToggleStep={() => toggleStepComplete("step-4")}
              />
              <ParetoSection 
                drillDowns={paretoDrillDowns}
                setDrillDowns={setParetoDrillDowns}
                dataMap={paretoDataMap}
                setDataMap={setParetoDataMap}
                unit={paretoUnit}
                onUnitChange={setParetoUnit}
                isStepCompleted={completedSteps.has("step-5")}
                onToggleStep={() => toggleStepComplete("step-5")}
              />
              {hasFlavorCorrelation ? (
                <div className="relative group/flavor pt-4 border-t border-border/40 mt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute right-0 top-0 z-20 h-6 px-2 text-[10px] uppercase font-bold transition-opacity rounded-full shadow-md"
                      >
                        <X className="size-3 mr-1" /> Eliminar Correlación
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar sección?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar la sección de Correlación de Flavors? Esta acción ocultará la sección, pero los datos se mantendrán hasta que guardes.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setHasFlavorCorrelation(false)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <FlavorCorrelationSection 
                    isStepCompleted={completedSteps.has("step-flavor")}
                    onToggleStep={() => toggleStepComplete("step-flavor")}
                  />
                </div>
              ) : (
                <div className="flex justify-center border-t border-border/60 pt-6 mt-4">
                  <Button onClick={() => setHasFlavorCorrelation(true)} variant="outline" className="gap-2 shadow-sm bg-card hover:bg-card/80">
                    <Plus className="size-4" /> Agregar Análisis de Flavors
                  </Button>
                </div>
              )}

              {hasGopThemes ? (
                <div className="relative group/gop pt-4 border-t border-border/40 mt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="absolute right-0 top-0 z-20 h-6 px-2 text-[10px] uppercase font-bold transition-opacity rounded-full shadow-md"
                      >
                        <X className="size-3 mr-1" /> Eliminar Temas de GOP
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar sección?</AlertDialogTitle>
                        <AlertDialogDescription>
                          ¿Estás seguro de que deseas eliminar la sección de Temas de GOP? Esta acción ocultará la tabla.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setHasGopThemes(false)}>Eliminar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <GopThemesSection 
                    data={gopThemesData}
                    onChange={setGopThemesData}
                    isStepCompleted={completedSteps.has("step-gop")}
                    onToggleStep={() => toggleStepComplete("step-gop")}
                  />
                </div>
              ) : (
                <div className="flex justify-center border-t border-border/60 pt-6 mt-4">
                  <Button onClick={() => setHasGopThemes(true)} variant="outline" className="gap-2 shadow-sm bg-card hover:bg-card/80">
                    <Plus className="size-4" /> Agregar Temas de GOP
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* FASE 3: CAUSA RAÍZ */}
          {tab === "Check" && (
            <div className="space-y-6">
              <ImageUploadSection
                image={processMappingImage}
                onChange={setProcessMappingImage}
                title="Mapeo de Proceso"
              />

              <IshikawaSection 
                ishikawas={ishikawas} 
                onChange={setIshikawas} 
                isStepCompleted={completedSteps.has("step-6")} 
                onToggleStep={() => toggleStepComplete("step-6")} 
              />
              <FiveWhysSection 
                tables={fiveWhysTables}
                onChange={setFiveWhysTables}
                isStepCompleted={completedSteps.has("step-7")} 
                onToggleStep={() => toggleStepComplete("step-7")} 
              />
            </div>
          )}

          {/* FASE 4: EJECUCIÓN */}
          {tab === "Act" && (
            <div className="space-y-6">
              {/* PASO 8.1: MATRIZ DE IMPACTO */}
              <ImpactMatrixTable
                rows={impactMatrix}
                onChange={setImpactMatrix}
                isStepCompleted={completedSteps.has("step-8")}
                onToggleStep={() => toggleStepComplete("step-8")}
              />

              <StepCard title="PASO 8.2: PLAN DE ACCIÓN">
                <StepInstructions>
                  <p className="mb-1">1. Use esto como cualquier otro registro de acción en su MCRS.</p>
                  <p>2. Si una acción particular tuvo éxito en la eliminación de un síntoma o causa de raíz, indique si se necesita una herramienta SDCA o necesita ser actualizada para estandarizar el resultado.</p>
                </StepInstructions>
                <div className="mt-4">
                  <ActionKanban acciones={acciones} setAcciones={setAcciones} />
                </div>
              </StepCard>

              <MultiImageUploadSection
                images={evidencias}
                onChange={setEvidencias}
                title="PASO 9: GEMBA (EVIDENCIAS)"
                subtitle="Gestión de Evidencias Gemba"
                description="Sube fotos del Gemba o documentos que respalden que el plan de acción se ejecutó correctamente."
                maxImages={10}
                isStepCompleted={completedSteps.has("step-9")}
                onToggleStep={() => toggleStepComplete("step-9")}
              />

              {/* PASO 10: KPI FINAL RESULT */}
              <TimeSeriesYTD
                value={kpiFinalResultData}
                onChange={setKpiFinalResultData}
                unit={kpiFinalResultUnit}
                onUnitChange={setKpiFinalResultUnit}
                isStepCompleted={completedSteps.has("step-10")}
                onToggleStep={() => toggleStepComplete("step-10")}
                title="PASO 10: KPI FINAL RESULT"
                chartTitle="KPI FINAL RESULT"
              />

              {/* PASO 11: GEMBA FINAL */}
              <ImageUploadSection
                image={gembaFinalImage}
                onChange={setGembaFinalImage}
                title="PASO 11: GEMBA FINAL"
                subtitle="Gestión de Evidencias Gemba"
                description="Sube archivos, fotos del Gemba o documentos que respalden la estandarización del proceso final."
                isStepCompleted={completedSteps.has("step-11")}
                onToggleStep={() => toggleStepComplete("step-11")}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          <Button 
            variant="outline" 
            onClick={handleSaveToFirestore}
            disabled={isSaving || !canEdit}
            className={cn(
              "font-semibold transition-all",
              hasUnsavedChanges && canEdit && "border-emerald-500 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
            )}
          >
            <UploadCloud className="size-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar PDCA"}
          </Button>
          <Button
            className="bg-primary hover:bg-brand-dark font-semibold"
            disabled={!canEdit}
            onClick={async () => {
              if (!canEdit) return;
              await handleSaveToFirestore();

              if (tab === "Act") {
                toast.success("¡PDCA Finalizado y Guardado en la Base de Datos!");
                onOpenChange(false);
              } else if (nextPhase) {
                setTab(nextPhase);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            {tab === "Act" ? "Finalizar PDCA" : "Siguiente Paso"} <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
    </div>
  );
}
export function FlavorCorrelationSection({
  isStepCompleted,
  onToggleStep,
}: {
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const [data, setData] = useState({
    cleanEndFinish: [
      { id: 1, x: 30, y: 6.3 }, { id: 2, x: 8, y: 6.1 }, { id: 3, x: 10, y: 6.2 }, { id: 4, x: 70, y: 7.7 }, { id: 5, x: 85, y: 7.1 }
    ],
    esters: [
      { id: 6, x: 10, y: 6.2 }, { id: 7, x: 2, y: 6.1 }, { id: 8, x: 5, y: 6.1 }, { id: 9, x: 30, y: 7.2 }, { id: 10, x: 55, y: 7.7 }
    ],
    lingerBitter: [
      { id: 11, x: 30, y: 7.8 }, { id: 12, x: 50, y: 7.1 }, { id: 13, x: 60, y: 6.4 }, { id: 14, x: 135, y: 6.1 }
    ],
    smokeyPhenolic: [
      { id: 15, x: 2, y: 7.7 }, { id: 16, x: 25, y: 7.2 }, { id: 17, x: 65, y: 6.2 }, { id: 18, x: 70, y: 6.2 }
    ],
    astringentDrying: [
      { id: 19, x: 30, y: 6.2 }, { id: 20, x: 50, y: 6.2 }, { id: 21, x: 60, y: 6.3 }, { id: 22, x: 50, y: 7.2 }
    ]
  });

  const [positiveTitle, setPositiveTitle] = useState("Sensory (Global Panel) vs % of tasters who identify the positive attributes");
  const [negativeTitle, setNegativeTitle] = useState("Sensory (Global Panel) vs % of tasters who identify the Negative Attributes");


  const updatePoint = (series: keyof typeof data, id: number, field: "x" | "y", value: number) => {
    setData(prev => ({
      ...prev,
      [series]: prev[series].map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const addPoint = (series: keyof typeof data) => {
    setData(prev => ({
      ...prev,
      [series]: [...prev[series], { id: Date.now(), x: 0, y: 6.0 }]
    }));
  };

  const removePoint = (series: keyof typeof data, id: number) => {
    setData(prev => ({
      ...prev,
      [series]: prev[series].filter(p => p.id !== id)
    }));
  };

  const SeriesEditor = ({ name, series, label }: { name: keyof typeof data, series: any[], label: string }) => (
    <div className="border rounded p-3 space-y-2">
      <div className="font-bold text-sm flex justify-between items-center">
        {label}
        <Button variant="outline" size="sm" onClick={() => addPoint(name)} className="h-6 text-xs px-2"><Plus className="size-3 mr-1"/> Añadir</Button>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {series.map(p => (
          <div key={p.id} className="flex items-center gap-1 bg-secondary/30 p-1 rounded">
            <span className="text-[10px] font-bold w-3">X:</span>
            <Input type="number" value={p.x} onChange={e => updatePoint(name, p.id, "x", Number(e.target.value))} className="h-6 text-xs px-1" />
            <span className="text-[10px] font-bold w-3 ml-1">Y:</span>
            <Input type="number" step="0.1" value={p.y} onChange={e => updatePoint(name, p.id, "y", Number(e.target.value))} className="h-6 text-xs px-1" />
            <Button variant="ghost" size="icon" onClick={() => removePoint(name, p.id)} className="h-6 w-6 text-destructive shrink-0"><X className="size-3"/></Button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <StepCard 
      title="Correlación de Flavors"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="size-4 mr-2" /> Editar Puntos
            </Button>
          </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <h3 className="text-lg font-bold">Editar Puntos de Correlación</h3>
              <div className="grid grid-cols-2 gap-4">
                <SeriesEditor name="cleanEndFinish" series={data.cleanEndFinish} label="Clean-End-Finish" />
                <SeriesEditor name="esters" series={data.esters} label="Esters" />
                <SeriesEditor name="lingerBitter" series={data.lingerBitter} label="Linger-Bitter" />
                <SeriesEditor name="smokeyPhenolic" series={data.smokeyPhenolic} label="Smokey-Phenolic" />
                <SeriesEditor name="astringentDrying" series={data.astringentDrying} label="Astringent-Drying" />
              </div>
            </DialogContent>
          </Dialog>
      }
    >

      <div className="grid xl:grid-cols-2 gap-6">
        {/* CHART 1: POSITIVE */}
        <div className="space-y-2">
          <input 
            value={positiveTitle} 
            onChange={(e) => setPositiveTitle(e.target.value)} 
            className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
          />
          <div className="h-64 border bg-white relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
                <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
                <ZAxis type="number" range={[100, 100]} />
                <RTooltip cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Quadrants - approximate colors based on image */}
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                
                <Scatter name="Clean-End-Finish" data={data.cleanEndFinish} fill="#000" stroke="#f1c40f" strokeWidth={2} />
                <Scatter name="Esters" data={data.esters} fill="#f1c40f" stroke="#000" strokeWidth={1} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mt-2 items-end">
            <span className="font-bold text-sm mb-1">Pearson Correlation</span>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-black border border-yellow-400"></div> Clean-End-Finish</span>
              <span className="bg-amber-400 font-bold px-4 py-0.5 text-black mt-1">0.760</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div> Esters</span>
              <span className="bg-amber-400 font-bold px-4 py-0.5 text-black mt-1">0.998</span>
            </div>
          </div>
        </div>

        {/* CHART 2: NEGATIVE */}
        <div className="space-y-2">
          <input 
            value={negativeTitle} 
            onChange={(e) => setNegativeTitle(e.target.value)} 
            className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
          />
          <div className="h-64 border bg-white relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
                <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
                <ZAxis type="number" range={[100, 100]} />
                <RTooltip cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Quadrants */}
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                
                <Scatter name="Linger-Bitter" data={data.lingerBitter} fill="#4a2e00" stroke="#000" strokeWidth={1} />
                <Scatter name="Smokey-Phenolic" data={data.smokeyPhenolic} fill="#f1c40f" stroke="#000" strokeWidth={1} />
                <Scatter name="Astringent-Drying" data={data.astringentDrying} fill="#654321" stroke="#f1c40f" strokeWidth={1} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-2 items-end">
            <span className="font-bold text-sm mb-1">Pearson Correlation</span>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-[#4a2e00] border border-black"></div> Linger-Bitter</span>
              <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1">-0.900</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></div> Smokey-Phenolic</span>
              <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1">-0.994</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-[#654321] border border-yellow-400"></div> Astringent-Drying</span>
              <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1">-0.355</span>
            </div>
          </div>
        </div>
      </div>
    </StepCard>
  );
}
