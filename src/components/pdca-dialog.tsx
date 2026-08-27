import { useEffect, useState, useMemo, useCallback, useRef } from "react";
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
  FileText
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ComposedChart,
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
import { phases, DEFAULT_TARGET_VS_ACTUAL, DEFAULT_PARETO_DATA_MAP, DEFAULT_VPO_CHECKPOINTS, type ActionItem, type Pdca, type Phase, type ParetoItem, type VpoCheckpointItem } from "@/data/pdca";
import { KpiTreeInteractive } from "./kpi-tree";
import { ActionKanban } from "./action-kanban";
import { DatePicker } from "@/components/ui/date-picker";
import { savePdcaToFirestore } from "@/services/pdca-service";
import { useAuth } from "@/context/auth-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PHASE_STEPS_MAP: Record<Phase, string[]> = {
  Plan: ["step-1", "step-2"],
  Do: ["step-3", "step-4", "step-5"],
  Check: ["step-6", "step-7"],
  Act: ["step-8"],
};

const customPhases = [
  { id: "Plan", label: "1. Definición", sub: "Pasos 1 y 2" },
  { id: "Do", label: "2. Análisis", sub: "Pasos 3, 4 y 5" },
  { id: "Check", label: "3. Causa Raíz", sub: "Pasos 6 y 7" },
  { id: "Act", label: "4. Ejecución", sub: "Paso 8" }
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

function TeamMembersInput({ initialMembers = [] }: { initialMembers?: string[] }) {
  const [members, setMembers] = useState<string[]>(initialMembers);
  const [inputValue, setInputValue] = useState("");

  const addMember = () => {
    const val = inputValue.trim();
    if (val && !members.includes(val)) {
      setMembers([...members, val]);
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
    setMembers(members.filter((_, index) => index !== indexToRemove));
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
  onRemove 
}: { 
  cat: { id: string; label: string; position: "top" | "bottom" };
  causesList: string[];
  onAdd: (id: string, value: string) => void;
  onRemove: (id: string, index: number) => void;
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
      <div className="bg-secondary/60 px-2 py-1.5 border-b border-border text-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {cat.label}
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

function IshikawaInteractive({
  causes,
  setCauses,
  effect,
  setEffect,
  isStepCompleted,
  onToggleStep,
}: {
  causes: Record<string, string[]>;
  setCauses: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  effect: string;
  setEffect: (val: string) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}) {
  const categories = [
    { id: "machine", label: "Máquina", position: "top" },
    { id: "method", label: "Método", position: "top" },
    { id: "material", label: "Material", position: "top" },
    { id: "manpower", label: "Mano de Obra", position: "bottom" },
    { id: "measurement", label: "Medición", position: "bottom" },
    { id: "environment", label: "Medio Amb.", position: "bottom" },
  ] as const;

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

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] overflow-hidden">
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
          <span>Paso 6: Diagrama de Ishikawa (6M)</span>
          {isStepCompleted && (
            <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
              Completado
            </span>
          )}
        </h3>
      </div>
      
      <StepInstructions>
        <p className="mb-2">1. Basándote en las conclusiones extraídas de los pasos anteriores para estrechar tu enfoque, define el tema que debe ser analizado, y será la "cabeza del pez". Nota: este NO debe ser el KPI que estás tratando de mejorar, sino más bien, el PI o aspecto del mismo al que has reducido tu enfoque.</p>
        <p className="mb-2">2. Reunir un equipo y en base a una discusión, rellenar el diagrama con las causas levantadas, intentando separar las causas y subcausas según sus categorías.</p>
        <p className="mb-2">3. Recuerda... ¡esta es una herramienta para la lluvia de ideas! Cualquier cosa que se ponga en la Espina de Pescado debe ser validado como un contribuyente al problema o no.</p>
        <p className="mb-2">4. Para añadir sub-puntos, escribe la causa y presiona Enter dentro de la categoría correspondiente.</p>
        <p>5. Las posibles causas rellenadas en el diagrama deben introducirse en el cuadro de prioridades (Filtro) para su posterior validación/confirmación de que efectivamente están contribuyendo al problema.</p>
      </StepInstructions>

      <div className="relative pt-2 pb-2 overflow-x-auto">
        <div className="min-w-[650px] relative">
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

          <div className="grid grid-cols-3 gap-3 pr-40 relative z-10">
            {categories.filter(c => c.position === "top").map(cat => (
              <div key={cat.id} className="flex flex-col items-center">
                <CategoryBox cat={cat} causesList={causes[cat.id] || []} onAdd={addCause} onRemove={removeCause} />
                <div className="w-0.5 h-6 bg-border"></div>
              </div>
            ))}
          </div>

          <div className="h-4"></div>

          <div className="grid grid-cols-3 gap-3 pr-40 relative z-10">
            {categories.filter(c => c.position === "bottom").map(cat => (
              <div key={cat.id} className="flex flex-col items-center">
                <div className="w-0.5 h-6 bg-border"></div>
                <CategoryBox cat={cat} causesList={causes[cat.id] || []} onAdd={addCause} onRemove={removeCause} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
  isStepCompleted,
  onToggleStep,
}: {
  title?: string;
  subtitle?: string;
  level?: number;
  data?: ParetoItem[];
  onDataChange?: (newData: ParetoItem[]) => void;
  onBarClick?: (category: string) => void;
  onClose?: () => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}) {
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

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] col-span-full animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            {level === 0 && onToggleStep && (
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
            <h3 className={cn("font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2", level === 0 && isStepCompleted && "text-emerald-600 dark:text-emerald-400")}>
              {level > 0 && <ArrowRight className="size-4 text-muted-foreground" />} {title}
              {level === 0 && isStepCompleted && (
                <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
                  Completado
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            {subtitle} {onBarClick && "Haz clic en una barra para desglosarla."}
          </p>
        </div>
        <div className="flex gap-2">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-destructive">
              <X className="size-4 mr-2" /> Cerrar
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={addRow}>
            <Plus className="size-4 mr-2" /> Agregar
          </Button>
        </div>
      </div>
      
      {level === 0 && (
        <StepInstructions>
          <p className="mb-2">1. Utiliza la columna de categorías para identificar las formas de desglosar los KPI o IP en diferentes categorías. Este será tu eje X. Ejemplo: tipo de equipo.</p>
          <p className="mb-2">2. Introduce tus datos para cada categoría en la columna de datos (Valor / Gap). Nota: los datos deben estar en las mismas unidades. Ejemplo: tiempo de inactividad de cada tipo de equipo.</p>
          <p className="mb-2">3. En esta herramienta web, el gráfico de Pareto se genera automáticamente a medida que introduces los datos.</p>
          <p>4. Puedes crear Paretos adicionales (Nivel 2) haciendo clic directamente sobre la barra de la categoría que deseas desglosar en el gráfico interactivo.</p>
        </StepInstructions>
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
                <TableCell className="py-2 px-3 font-bold font-mono text-right">{totalGap.toFixed(2)}</TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="h-64 border rounded-md p-3 flex flex-col justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={paretoData} margin={{ top: 15, right: 15, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="area" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" domain={[0, 100]} />
              <RTooltip
                contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
                formatter={(val: number, name: string) => [val.toFixed(2) + (name === "Acumulado" ? "%" : ""), name]}
              />
              <Bar 
                yAxisId="left" 
                dataKey="gap" 
                name="Valor" 
                fill="var(--color-primary)" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40} 
                onClick={(payload) => { if (onBarClick && payload.area) onBarClick(payload.area); }}
                className={onBarClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
              />
              <Line yAxisId="right" type="monotone" dataKey="cumPct" name="Acumulado" stroke="var(--color-destructive)" strokeWidth={2} dot={{ r: 3, fill: "var(--color-destructive)" }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function ParetoSection({
  drillDowns,
  setDrillDowns,
  dataMap,
  setDataMap,
  isStepCompleted,
  onToggleStep,
}: {
  drillDowns: string[];
  setDrillDowns: (d: string[]) => void;
  dataMap: Record<string, ParetoItem[]>;
  setDataMap: (m: Record<string, ParetoItem[]>) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}) {
  const handleBarClick = (category: string, level: number) => {
    if (category) {
      const newDrills = drillDowns.slice(0, level);
      newDrills.push(category);
      setDrillDowns(newDrills);
      
      const newPath = `level-${level + 1}-${category}`;
      if (!dataMap[newPath]) {
        setDataMap({ ...dataMap, [newPath]: [] });
      }
    }
  };

  const handleClose = (level: number) => {
    setDrillDowns(drillDowns.slice(0, level - 1));
  };

  const updateData = (path: string, newData: ParetoItem[]) => {
    setDataMap({ ...dataMap, [path]: newData });
  };

  return (
    <div className="space-y-4">
      <ParetoInteractive 
        title="Paso 5: Análisis de Pareto"
        level={0}
        data={dataMap["root"] || []}
        onDataChange={(d) => updateData("root", d)}
        onBarClick={(cat) => handleBarClick(cat, 0)} 
        isStepCompleted={isStepCompleted}
        onToggleStep={onToggleStep}
      />
      
      {drillDowns.map((category, index) => {
        const path = `level-${index + 1}-${category}`;
        return (
          <ParetoInteractive 
            key={path}
            level={index + 1}
            title={`Sub-Pareto: ${category}`}
            subtitle={`Desglose específico (2do Nivel) de la categoría ${category}.`}
            data={dataMap[path] || []}
            onDataChange={(d) => updateData(path, d)}
            onBarClick={(cat) => handleBarClick(cat, index + 1)}
            onClose={() => handleClose(index + 1)}
          />
        );
      })}
    </div>
  );
}

function PrioritizationMatrix() {
  const [causes, setCauses] = useState([
    { id: 1, text: "", impact: "3", authority: "3", difficulty: "3" }
  ]);

  const addCause = () => {
    setCauses([...causes, { id: Date.now(), text: "", impact: "3", authority: "3", difficulty: "3" }]);
  };

  const updateCause = (id: number, field: string, value: string) => {
    setCauses(causes.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCause = (id: number) => {
    setCauses(causes.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-base font-semibold uppercase tracking-wide">
            Matriz de Priorización de Causas (Filtro)
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            (1=Bajo, 3=Medio, 5=Alto). Se priorizan automáticamente aquellas con impacto alto (&gt;= 12).
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addCause}>
          <Plus className="size-4 mr-2" /> Agregar Causa
        </Button>
      </div>

      <div className="overflow-x-auto mt-2">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead>Causas Probables</TableHead>
              <TableHead className="w-24 text-center">Impacto</TableHead>
              <TableHead className="w-24 text-center">Autoridad</TableHead>
              <TableHead className="w-24 text-center">Dificultad</TableHead>
              <TableHead className="w-24 text-center">Priorizar</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {causes.map((c) => {
              const total = Number(c.impact) + Number(c.authority) + Number(c.difficulty);
              const isHigh = total >= 12;
              
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <Input
                      value={c.text}
                      onChange={(e) => updateCause(c.id, "text", e.target.value)}
                      placeholder="Ej. Desajuste de máquina..."
                      className="h-8 shadow-none text-sm"
                    />
                  </TableCell>
                  <TableCell>
                    <Select value={c.impact} onValueChange={(v) => updateCause(c.id, "impact", v)}>
                      <SelectTrigger className="h-8 shadow-none text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Bajo</SelectItem>
                        <SelectItem value="3">3 - Medio</SelectItem>
                        <SelectItem value="5">5 - Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={c.authority} onValueChange={(v) => updateCause(c.id, "authority", v)}>
                      <SelectTrigger className="h-8 shadow-none text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Baja</SelectItem>
                        <SelectItem value="3">3 - Media</SelectItem>
                        <SelectItem value="5">5 - Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const diffColors: Record<string, string> = {
                        "1": "bg-red-500/15 text-red-700 border-red-500/40 font-semibold dark:bg-red-950/50 dark:text-red-300",
                        "3": "bg-amber-500/15 text-amber-700 border-amber-500/40 font-semibold dark:bg-amber-950/50 dark:text-amber-300",
                        "5": "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 font-semibold dark:bg-emerald-950/50 dark:text-emerald-300",
                      };
                      return (
                        <Select value={c.difficulty} onValueChange={(v) => updateCause(c.id, "difficulty", v)}>
                          <SelectTrigger className={cn("h-8 shadow-none text-xs transition-colors", diffColors[c.difficulty])}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1" className="text-red-600 font-semibold focus:text-red-700 focus:bg-red-50">
                              <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-red-500 shrink-0" />
                                1 - Difícil
                              </span>
                            </SelectItem>
                            <SelectItem value="3" className="text-amber-600 font-semibold focus:text-amber-700 focus:bg-amber-50">
                              <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                                3 - Medio
                              </span>
                            </SelectItem>
                            <SelectItem value="5" className="text-emerald-600 font-semibold focus:text-emerald-700 focus:bg-emerald-50">
                              <span className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                                5 - Fácil
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center font-bold text-xs px-2 py-1 rounded-md",
                      isHigh ? "bg-emerald-500/20 text-emerald-600" : "bg-secondary text-muted-foreground"
                    )}>
                      {isHigh ? "YES" : "NO"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {causes.length > 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeCause(c.id)}>
                        <X className="size-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TimeSeriesYTD({
  value,
  onChange,
  isStepCompleted,
  onToggleStep,
}: {
  value?: { mes: string; target: number; actual: number | null }[];
  onChange?: (newSeries: { mes: string; target: number; actual: number | null }[]) => void;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}) {
  const series = value && value.length > 0 ? value : DEFAULT_TARGET_VS_ACTUAL;

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

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] col-span-full">
      <div className="flex items-center justify-between">
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
            <span>Paso 3: Seguimiento Mensual (Target vs Actual)</span>
            {isStepCompleted && (
              <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
                Completado
              </span>
            )}
          </h3>
        </div>
        <Button variant="secondary" size="sm" onClick={() => toast.success("Series temporales actualizadas desde InfluxDB")}>
          <RefreshCw className="size-3.5 mr-2" /> Sincronizar Grafana
        </Button>
      </div>
      
      <StepInstructions>
        <p className="mb-2">1. Los datos base del problema se capturan desde la sección "1. Definición".</p>
        <p className="mb-2">2. Completa el período de tiempo con tu período de tiempo deseado (meses preconfigurados por defecto).</p>
        <p>3. Rellena las columnas "Target" (Objetivo) y "Actual" (Real) con tus datos. El gráfico se actualizará automáticamente.</p>
      </StepInstructions>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <RTooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Bar dataKey="actual" name="Real (Actual)" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Line type="stepAfter" dataKey="target" name="Meta (Target)" stroke="var(--color-destructive)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="overflow-x-auto lg:max-h-64 border rounded-md">
          <Table className="text-xs">
            <TableHeader className="bg-secondary/50 sticky top-0 z-10">
              <TableRow>
                <TableHead className="py-1.5 px-2">Mes</TableHead>
                <TableHead className="py-1.5 px-2">Target</TableHead>
                <TableHead className="py-1.5 px-2">Actual</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((s, i) => (
                <TableRow key={s.mes}>
                  <TableCell className="py-1 px-2 font-medium">{s.mes}</TableCell>
                  <TableCell className="py-1 px-2">
                    <Input 
                      type="number" 
                      value={s.target || ""} 
                      onChange={e => updateTarget(i, e.target.value)}
                      className="h-6 w-14 text-xs px-1 shadow-none" 
                    />
                  </TableCell>
                  <TableCell className="py-1 px-2">
                    <Input 
                      type="number" 
                      value={s.actual ?? ""} 
                      onChange={e => updateActual(i, e.target.value)}
                      className="h-6 w-14 text-xs px-1 shadow-none" 
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function FiveWhysInteractive({
  value,
  onChange,
  initialValue,
  preloadedCauses = [],
  isStepCompleted,
  onToggleStep,
}: {
  value?: string[];
  onChange?: (whys: string[]) => void;
  initialValue?: string;
  preloadedCauses?: string[];
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
}) {
  const whys = value && value.length > 0
    ? value
    : (initialValue ? initialValue.split(" | WHY: ") : [""]);

  useEffect(() => {
    if (whys.length === 1 && whys[0] === "" && preloadedCauses.length > 0) {
      const initial = [preloadedCauses.join(", ")];
      if (onChange) onChange(initial);
    }
  }, [preloadedCauses, whys]);

  const updateWhysState = (newWhys: string[]) => {
    if (onChange) {
      onChange(newWhys);
    }
  };

  const updateWhy = (index: number, val: string) => {
    const newWhys = [...whys];
    newWhys[index] = val;
    updateWhysState(newWhys);
  };

  const addWhy = () => {
    if (whys.length < 5) {
      const newWhys = [...whys, ""];
      updateWhysState(newWhys);
    }
  };

  const removeWhy = (index: number) => {
    const newWhys = whys.filter((_, i) => i !== index);
    const finalWhys = newWhys.length ? newWhys : [""];
    updateWhysState(finalWhys);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
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
            <span>Paso 7: Análisis de 5 Porqués (5 WHYs)</span>
            {isStepCompleted && (
              <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
                Completado
              </span>
            )}
          </h3>
        </div>
        <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
          {whys.length}/5 Niveles
        </span>
      </div>
      
      <div className="mt-4 flex flex-col items-center space-y-2">
        {whys.map((why, index) => {
          const isRootCause = index === whys.length - 1;
          
          return (
            <div key={index} className="w-full flex flex-col items-center">
              <div className={cn(
                "w-full flex items-start gap-3 rounded-lg border p-3 transition-colors",
                isRootCause ? "border-brand-yellow/50 bg-brand-yellow/5" : "border-border bg-background"
              )}>
                <div className="flex shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold size-8">
                  W{index + 1}
                </div>
                <Textarea
                  value={why}
                  onChange={(e) => updateWhy(index, e.target.value)}
                  placeholder={`¿Por qué ocurrió el problema${index > 0 ? ' anterior' : ''}?`}
                  className="min-h-12 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 sm:text-sm"
                  rows={2}
                />
                {index > 0 && (
                  <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeWhy(index)}>
                    <MinusCircle className="size-4" />
                  </Button>
                )}
              </div>
              
              {isRootCause && (
                <div className="mt-2 text-[11px] font-semibold text-brand-yellow-foreground tracking-wide uppercase">
                  ⭐ Causa Raíz Identificada
                </div>
              )}
              
              {!isRootCause && (
                <div className="py-2 text-border">
                  <ArrowDown className="size-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {whys.length < 5 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={addWhy} 
          className="w-full mt-4 border-dashed"
        >
          <Plus className="mr-2 size-4" /> Profundizar (Agregar ¿Por qué?)
        </Button>
      )}
    </div>
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
    <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <StepHeader
          stepId="step-2"
          title="Paso 2: VPO Tool Checkpoint (SDCA Checklist)"
          completedSteps={completedSteps}
          onToggleStep={onToggleStep}
        />
        
        <StepInstructions>
          <p className="mb-2"><strong>VPO Tool Checkpoint - Paso 2 SDCA:</strong> Este checklist evalúa la madurez y estandarización del proceso afectado según los pilares del Sistema de Gestión VPO de Grupo Modelo.</p>
          <p>Evalúa cada punto en el contexto de tu problema. Registra las evidencias o comentarios de soporte para cada ítem y selecciona el status correspondiente (YES / NO / N/A). La brecha identificada servirá para alimentar el plan de acción (Kanban).</p>
        </StepInstructions>

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
    </div>
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

  // TimeSeries YTD state
  const [targetVsActual, setTargetVsActual] = useState<{ mes: string; target: number; actual: number | null }[]>(
    data.targetVsActual || DEFAULT_TARGET_VS_ACTUAL
  );

  // 5 Whys state
  const [fiveWhys, setFiveWhys] = useState<string[]>(
    data.fiveWhys || (data.causaRaiz ? data.causaRaiz.split(" | WHY: ") : [""])
  );

  // Ishikawa state
  const [ishikawaCauses, setIshikawaCauses] = useState<Record<string, string[]>>(
    data.ishikawaCauses || { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] }
  );
  const [ishikawaEffect, setIshikawaEffect] = useState<string>(
    data.ishikawaEffect || "Efecto / Problema"
  );

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

  const flattenedCauses = useMemo(() => {
    return Object.values(ishikawaCauses).flat();
  }, [ishikawaCauses]);

  const isInitialMount = useRef(true);
  const lastSavedRef = useRef<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    isInitialMount.current = true;
    
    // Check if there is a cached local draft for this PDCA
    let initialData = data;
    const cachedDraftStr = localStorage.getItem(`pdca_draft_${data.id}`);
    if (cachedDraftStr) {
      try {
        const parsed = JSON.parse(cachedDraftStr);
        initialData = { ...data, ...parsed };
        setHasUnsavedChanges(true);
      } catch (e) {
        console.error("Error al leer el borrador local del caché:", e);
      }
    } else {
      setHasUnsavedChanges(false);
    }

    lastSavedRef.current = JSON.stringify(data);

    setTitulo(initialData.titulo || "");
    setArea(initialData.area || "cocimientos");
    setProblema(initialData.problema || "");
    setCausaRaiz(initialData.causaRaiz || "");
    setFechaFin(parseDateString(initialData.fechaFinalizacion));
    setFiveWhys(initialData.fiveWhys || (initialData.causaRaiz ? initialData.causaRaiz.split(" | WHY: ") : [""]));
    setTab(initialData.fase);
    setAcciones(initialData.acciones || []);
    setKpiNodes(initialData.kpiNodes || []);
    setKpiEdges(initialData.kpiEdges || []);
    setIshikawaCauses(initialData.ishikawaCauses || { machine: [], method: [], material: [], manpower: [], measurement: [], environment: [] });
    setIshikawaEffect(initialData.ishikawaEffect || "Efecto / Problema");
    setTargetVsActual(initialData.targetVsActual || DEFAULT_TARGET_VS_ACTUAL);
    setParetoDrillDowns(initialData.paretoDrillDowns || []);
    setParetoDataMap(initialData.paretoDataMap || DEFAULT_PARETO_DATA_MAP);
    setVpoCheckpoints(initialData.vpoCheckpoints || DEFAULT_VPO_CHECKPOINTS);
    setCompletedPhases(new Set(initialData.completedPhases || []));
    setCompletedSteps(new Set(initialData.completedSteps || []));
  }, [data.id, open, data]);

  const completedStepsCount = useMemo(() => {
    const allStepIds = ["step-1", "step-2", "step-3", "step-4", "step-5", "step-6", "step-7", "step-8"];
    return allStepIds.filter(s => completedSteps.has(s)).length;
  }, [completedSteps]);

  const progressPercentage = Math.round((completedStepsCount / 8) * 100);

  // Save changes locally to browser cache (localStorage) on every edit
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const computedCausa = fiveWhys.filter(Boolean).join(" | WHY: ") || causaRaiz;

    const draftPdca: Pdca = {
      ...data,
      titulo,
      area,
      problema,
      causaRaiz: computedCausa,
      fiveWhys,
      fase: tab,
      progreso: progressPercentage,
      acciones,
      kpiNodes,
      kpiEdges,
      ishikawaCauses,
      ishikawaEffect,
      targetVsActual,
      paretoDataMap,
      paretoDrillDowns,
      vpoCheckpoints,
      completedPhases: Array.from(completedPhases),
      completedSteps: Array.from(completedSteps),
      fechaFinalizacion: formatDateToString(fechaFin),
      actualizado: new Date().toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const draftStr = JSON.stringify(draftPdca);
    if (draftStr === lastSavedRef.current) {
      localStorage.removeItem(`pdca_draft_${data.id}`);
      setHasUnsavedChanges(false);
      return;
    }

    try {
      localStorage.setItem(`pdca_draft_${data.id}`, draftStr);
      setHasUnsavedChanges(true);
    } catch (e) {
      console.error("Error al guardar en el caché local:", e);
    }
  }, [
    titulo, area, problema, causaRaiz, fiveWhys, tab, progressPercentage, acciones,
    kpiNodes, kpiEdges, ishikawaCauses, ishikawaEffect, targetVsActual, paretoDataMap, paretoDrillDowns, vpoCheckpoints, completedPhases, completedSteps, fechaFin
  ]);

  // Upload all cached changes to Firestore database
  const handleSaveToFirestore = useCallback(async () => {
    setIsSaving(true);
    const computedCausa = fiveWhys.filter(Boolean).join(" | WHY: ") || causaRaiz;

    const updatedPdca: Pdca = {
      ...data,
      titulo,
      area,
      problema,
      causaRaiz: computedCausa,
      fiveWhys,
      fase: tab,
      progreso: progressPercentage,
      acciones,
      kpiNodes,
      kpiEdges,
      ishikawaCauses,
      ishikawaEffect,
      targetVsActual,
      paretoDataMap,
      paretoDrillDowns,
      vpoCheckpoints,
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
      localStorage.removeItem(`pdca_draft_${data.id}`);
      setHasUnsavedChanges(false);
      toast.success("¡Todos los cambios del PDCA se subieron a la base de datos!");
    } catch (err) {
      console.error("Error al subir a la base de datos:", err);
      toast.error("Error al guardar en la base de datos");
    } finally {
      setIsSaving(false);
    }
  }, [data, titulo, area, problema, causaRaiz, fiveWhys, tab, progressPercentage, acciones, kpiNodes, kpiEdges, ishikawaCauses, ishikawaEffect, targetVsActual, paretoDataMap, paretoDrillDowns, vpoCheckpoints, completedPhases, completedSteps, fechaFin, currentUser]);

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
                  <Save className="size-3" /> Cambios guardados en Caché
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
              disabled={isSaving}
              className={cn(
                "font-semibold text-xs h-8 gap-1.5 transition-all shadow-sm",
                hasUnsavedChanges
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
            <span className="text-xs text-muted-foreground font-medium">({completedStepsCount}/8 pasos)</span>
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

          {/* FASE 1: DEFINICIÓN Y ESTANDARIZACIÓN */}
          {tab === "Plan" && (
            <div className="space-y-6">
              <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <StepHeader
                  stepId="step-1"
                  title="Paso 1: Problem Statement"
                  completedSteps={completedSteps}
                  onToggleStep={toggleStepComplete}
                />
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
                <TeamMembersInput initialMembers={[]} />
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
              </div>

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
                isStepCompleted={completedSteps.has("step-3")} 
                onToggleStep={() => toggleStepComplete("step-3")} 
              />
              <KpiTreeInteractive initialNodes={kpiNodes} initialEdges={kpiEdges} onChange={handleKpiChange} isStepCompleted={completedSteps.has("step-4")} onToggleStep={() => toggleStepComplete("step-4")} />
              <ParetoSection 
                drillDowns={paretoDrillDowns}
                setDrillDowns={setParetoDrillDowns}
                dataMap={paretoDataMap}
                setDataMap={setParetoDataMap}
                isStepCompleted={completedSteps.has("step-5")}
                onToggleStep={() => toggleStepComplete("step-5")}
              />
            </div>
          )}

          {/* FASE 3: CAUSA RAÍZ */}
          {tab === "Check" && (
            <div className="space-y-6">
              <IshikawaInteractive 
                causes={ishikawaCauses} 
                setCauses={setIshikawaCauses} 
                effect={ishikawaEffect}
                setEffect={setIshikawaEffect}
                isStepCompleted={completedSteps.has("step-6")} 
                onToggleStep={() => toggleStepComplete("step-6")} 
              />
              <FiveWhysInteractive 
                value={fiveWhys}
                onChange={setFiveWhys}
                initialValue={data.causaRaiz} 
                preloadedCauses={flattenedCauses} 
                isStepCompleted={completedSteps.has("step-7")} 
                onToggleStep={() => toggleStepComplete("step-7")} 
              />
            </div>
          )}

          {/* FASE 4: EJECUCIÓN */}
          {tab === "Act" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <StepHeader
                  stepId="step-8"
                  title="Paso 8: Plan de Acción y Matriz de Priorización"
                  completedSteps={completedSteps}
                  onToggleStep={toggleStepComplete}
                />
              </div>
              <PrioritizationMatrix />
              <ActionKanban acciones={acciones} setAcciones={setAcciones} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          <Button 
            variant="outline" 
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className={cn(
              "font-semibold transition-all",
              hasUnsavedChanges && "border-emerald-500 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400"
            )}
          >
            <UploadCloud className="size-4 mr-2" />
            {isSaving ? "Guardando..." : "Guardar PDCA"}
          </Button>
          <Button
            className="bg-primary hover:bg-brand-dark font-semibold"
            disabled={false}
            onClick={async () => {
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
