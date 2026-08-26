import { useEffect, useState } from "react";
import {
  Check,
  UploadCloud,
  Paperclip,
  Plus,
  TrendingDown,
  Save,
  ArrowRight,
  ArrowDown,
  MinusCircle,
  X
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { phases, type ActionItem, type Pdca, type Phase } from "@/data/pdca";

const emptyDraft: Pdca = {
  id: "PDCA-2026-NUEVO",
  titulo: "",
  area: "",
  fase: "Plan",
  actualizado: "25 Ago 2026",
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
};

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

function IshikawaInteractive() {
  const [causes, setCauses] = useState<Record<string, string[]>>({
    machine: [],
    method: [],
    material: [],
    manpower: [],
    measurement: [],
    environment: []
  });

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
      <h3 className="font-display text-base font-semibold uppercase tracking-wide">
        Diagrama de Ishikawa (6M)
      </h3>
      <p className="text-xs text-muted-foreground pb-2">
        Identifica las posibles causas del problema categorizándolas. Presiona Enter para agregar.
      </p>

      <div className="relative pt-2 pb-2 overflow-x-auto">
        <div className="min-w-[600px] relative">
          {/* Espina central */}
          <div className="absolute top-1/2 left-0 right-28 h-1.5 bg-border rounded-full -translate-y-1/2 z-0">
             {/* Arrow head */}
             <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-[8px] border-transparent border-l-border"></div>
          </div>
          
          {/* Cabeza (Problema) */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-widest p-3 rounded-lg border border-destructive/20 z-10 w-24 text-center flex items-center justify-center shadow-sm h-[80px]">
            Efecto /<br/>Problema
          </div>

          {/* Ramas Superiores */}
          <div className="grid grid-cols-3 gap-3 pr-32 relative z-10">
            {categories.filter(c => c.position === "top").map(cat => (
              <div key={cat.id} className="flex flex-col items-center">
                <CategoryBox cat={cat} causesList={causes[cat.id] || []} onAdd={addCause} onRemove={removeCause} />
                <div className="w-0.5 h-6 bg-border"></div>
              </div>
            ))}
          </div>

          <div className="h-4"></div>

          {/* Ramas Inferiores */}
          <div className="grid grid-cols-3 gap-3 pr-32 relative z-10">
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
  onClose
}: {
  title?: string;
  subtitle?: string;
  level?: number;
  data?: { id: number; area: string; gap: number }[];
  onDataChange?: (newData: { id: number; area: string; gap: number }[]) => void;
  onBarClick?: (category: string) => void;
  onClose?: () => void;
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

  // Sort and calculate pareto logic
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
          <h3 className="font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2">
            {level > 0 && <ArrowRight className="size-4 text-muted-foreground" />} {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
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
            <Plus className="size-4 mr-2" /> Agregar Categoría
          </Button>
        </div>
      </div>

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

export type ParetoItem = { id: number; area: string; gap: number };

function ParetoSection({
  drillDowns,
  setDrillDowns,
  dataMap,
  setDataMap
}: {
  drillDowns: string[];
  setDrillDowns: (d: string[]) => void;
  dataMap: Record<string, ParetoItem[]>;
  setDataMap: (m: Record<string, ParetoItem[]>) => void;
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
        level={0}
        data={dataMap["root"] || []}
        onDataChange={(d) => updateData("root", d)}
        onBarClick={(cat) => handleBarClick(cat, 0)} 
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
            Matriz de Priorización de Causas
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Filtra las causas del Ishikawa. (1=Bajo, 3=Medio, 5=Alto).
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
              <TableHead className="w-24 text-center font-bold">TOTAL</TableHead>
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
                    <Select value={c.difficulty} onValueChange={(v) => updateCause(c.id, "difficulty", v)}>
                      <SelectTrigger className="h-8 shadow-none text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Difícil</SelectItem>
                        <SelectItem value="3">3 - Medio</SelectItem>
                        <SelectItem value="5">5 - Fácil</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "inline-flex items-center justify-center font-bold text-sm h-7 w-7 rounded-full",
                      isHigh ? "bg-brand-yellow/20 text-brand-yellow-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {total}
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

function TimeSeriesYTD() {
  const [series, setSeries] = useState<{ mes: string; target: number; actual: number | null }[]>([
    { mes: "Ene", target: 2.1, actual: 2.59 },
    { mes: "Feb", target: 2.1, actual: 2.58 },
    { mes: "Mar", target: 2.1, actual: 2.58 },
    { mes: "Abr", target: 2.1, actual: 2.57 },
    { mes: "May", target: 2.1, actual: 2.47 },
    { mes: "Jun", target: 2.1, actual: null },
    { mes: "Jul", target: 2.1, actual: null },
    { mes: "Ago", target: 2.1, actual: null },
    { mes: "Sep", target: 2.1, actual: null },
    { mes: "Oct", target: 2.1, actual: null },
    { mes: "Nov", target: 2.1, actual: null },
    { mes: "Dic", target: 2.1, actual: null },
  ]);

  const updateActual = (index: number, val: string) => {
    const newSeries = [...series];
    if (newSeries[index]) {
      newSeries[index].actual = val === "" ? null : Number(val);
      setSeries(newSeries);
    }
  };

  const updateTarget = (index: number, val: string) => {
    const newSeries = [...series];
    if (newSeries[index]) {
      newSeries[index].target = val === "" ? 0 : Number(val);
      setSeries(newSeries);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] col-span-full">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide">
          Seguimiento Mensual (Target vs Actual)
        </h3>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
              <RTooltip
                contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }}
              />
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

function FiveWhysInteractive({ initialValue }: { initialValue: string }) {
  // Parse existing cause or start with one empty step
  const [whys, setWhys] = useState<string[]>(
    initialValue ? initialValue.split(" | WHY: ") : [""]
  );

  const updateWhy = (index: number, value: string) => {
    const newWhys = [...whys];
    newWhys[index] = value;
    setWhys(newWhys);
  };

  const addWhy = () => {
    if (whys.length < 5) setWhys([...whys, ""]);
  };

  const removeWhy = (index: number) => {
    const newWhys = whys.filter((_, i) => i !== index);
    setWhys(newWhys.length ? newWhys : [""]);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide">
          Análisis de 5 Porqués (5 WHYs)
        </h3>
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

function Stepper({
  current,
  onSelect,
}: {
  current: Phase;
  onSelect: (p: Phase) => void;
}) {
  const currentIndex = phases.indexOf(current);
  return (
    <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5">
      {phases.map((phase, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <button
            key={phase}
            type="button"
            onClick={() => onSelect(phase)}
            className={cn(
              "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
              isCurrent
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-background/80 text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                isCurrent
                  ? "border-brand-yellow bg-brand-yellow text-brand-yellow-foreground"
                  : isDone
                    ? "border-phase-act bg-phase-act/15 text-phase-act"
                    : "border-border bg-background",
              )}
            >
              {isDone ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-semibold uppercase tracking-wide">
                {phase}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[11px] sm:block",
                  isCurrent ? "text-primary-foreground/75" : "text-muted-foreground/80",
                )}
              >
                {["Planear", "Ejecutar", "Verificar", "Estandarizar"][i]}
              </span>
            </span>
          </button>
        );
      })}
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
  const data = pdca ?? emptyDraft;
  const [tab, setTab] = useState<Phase>(data.fase);
  const [acciones, setAcciones] = useState<ActionItem[]>(data.acciones);
  
  const [planChecklist, setPlanChecklist] = useState({
    problem: false,
    rootCause: false,
    actionPlan: false,
  });
  
  const [actChecklist, setActChecklist] = useState({
    results: false,
    standardized: false,
    communicated: false,
  });

  const [indicadorAntes, setIndicadorAntes] = useState(data.indicador.antes);
  const [indicadorDespues, setIndicadorDespues] = useState(data.indicador.despues);

  const [paretoDrillDowns, setParetoDrillDowns] = useState<string[]>([]);
  const [paretoDataMap, setParetoDataMap] = useState<Record<string, ParetoItem[]>>({
    "root": [
      { id: 1, area: "Cocimientos", gap: 0.07 },
      { id: 2, area: "Cuartos frios", gap: 2.10 },
      { id: 3, area: "Envasado", gap: 0.65 },
    ]
  });

  useEffect(() => {
    setTab(data.fase);
    setAcciones(data.acciones);
    setPlanChecklist({ problem: false, rootCause: false, actionPlan: false });
    setActChecklist({ results: false, standardized: false, communicated: false });
    setIndicadorAntes(data.indicador.antes);
    setIndicadorDespues(data.indicador.despues);
    setParetoDrillDowns([]);
    setParetoDataMap({
      "root": [
        { id: 1, area: "Cocimientos", gap: 0.07 },
        { id: 2, area: "Cuartos frios", gap: 2.10 },
        { id: 3, area: "Envasado", gap: 0.65 },
      ]
    });
  }, [data.id, data.fase, data.acciones, data.indicador]);

  const addAccion = () => {
    setAcciones(prev => [...prev, {
      id: `A-${Date.now()}`,
      what: "",
      who: "",
      when: "",
      status: "Pendiente",
      done: false
    }]);
  };

  const updateAccion = (id: string, field: keyof ActionItem, value: any) => {
    setAcciones(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };
        if (field === 'status') {
           updated.done = value === 'Completada';
        }
        return updated;
      }
      return a;
    }));
  };

  const removeAccion = (id: string) => {
    setAcciones(prev => prev.filter(a => a.id !== id));
  };

  const completadas = acciones.filter((a) => a.done).length;
  const nextPhase = phases[Math.min(phases.indexOf(data.fase) + 1, 3)];
  const isPlanComplete = Object.values(planChecklist).every(Boolean);
  const isActComplete = Object.values(actChecklist).every(Boolean);

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
        </div>
        <h2 className="font-display text-3xl font-bold">
          {data.titulo || "Nuevo PDCA"}
        </h2>
      </div>

      <div className="flex-1 space-y-6 pb-20">
          <Stepper current={tab} onSelect={setTab} />

          {tab === "Plan" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título del proyecto</Label>
                  <Input id="titulo" defaultValue={data.titulo} placeholder="Ej. Reducción de merma en L3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Input id="area" defaultValue={data.area} placeholder="Ej. Ingeniería de Procesos" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFinalizacion">Fecha de Finalización</Label>
                  <Input id="fechaFinalizacion" type="date" defaultValue={data.fechaFinalizacion} />
                </div>
              </div>
              <TeamMembersInput initialMembers={[]} />
              <div className="space-y-2">
                <Label htmlFor="problema">Definición del problema</Label>
                <Textarea
                  id="problema"
                  rows={4}
                  defaultValue={data.problema}
                  placeholder="Describe el problema con datos, magnitud e impacto."
                />
              </div>
              <div className="space-y-2">
                <ParetoSection 
                  drillDowns={paretoDrillDowns}
                  setDrillDowns={setParetoDrillDowns}
                  dataMap={paretoDataMap}
                  setDataMap={setParetoDataMap}
                />
              </div>
              <div className="space-y-2">
                <IshikawaInteractive />
              </div>
              <div className="space-y-2">
                <PrioritizationMatrix />
              </div>
              <div className="space-y-2">
                <FiveWhysInteractive initialValue={data.causaRaiz} />
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                    Plan de acción (5W1H)
                  </h3>
                  <Button variant="outline" size="sm" onClick={addAccion}>
                    <Plus className="size-4 mr-2" /> Agregar acción
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-[600px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>¿Qué? (Acción)</TableHead>
                        <TableHead className="w-40">¿Quién?</TableHead>
                        <TableHead className="w-36">¿Cuándo?</TableHead>
                        <TableHead className="w-40">Estatus</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acciones.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="py-6 text-center text-sm text-muted-foreground">
                            Aún no hay acciones definidas. Haz clic en "Agregar acción".
                          </TableCell>
                        </TableRow>
                      )}
                      {acciones.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell>
                            <Input
                              value={a.what}
                              onChange={(e) => updateAccion(a.id, "what", e.target.value)}
                              placeholder="Describir acción..."
                              className="h-8 shadow-none"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={a.who}
                              onChange={(e) => updateAccion(a.id, "who", e.target.value)}
                              placeholder="Responsable"
                              className="h-8 shadow-none"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={a.when}
                              onChange={(e) => updateAccion(a.id, "when", e.target.value)}
                              className="h-8 shadow-none"
                            />
                          </TableCell>
                          <TableCell>
                            <Select value={a.status} onValueChange={(val) => updateAccion(a.id, "status", val)}>
                              <SelectTrigger className={cn(
                                "h-8 shadow-none text-xs font-semibold",
                                a.status === "Pendiente" && "bg-destructive/15 text-destructive border-destructive/30",
                                a.status === "En progreso" && "bg-amber-500/15 text-amber-600 border-amber-500/30",
                                a.status === "Completada" && "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                              )}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pendiente">Pendiente</SelectItem>
                                <SelectItem value="En progreso">En progreso</SelectItem>
                                <SelectItem value="Completada">Completada</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeAccion(a.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <X className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* TOLLGATE PLAN */}
              <div className="mt-8 rounded-xl border border-brand-yellow/30 bg-brand-yellow/5 p-4 shadow-sm">
                <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-yellow-foreground mb-3 flex items-center gap-2">
                  <Check className="size-4" />
                  SDCA Tollgate: Fase Plan
                </h4>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={planChecklist.problem}
                      onCheckedChange={(c) => setPlanChecklist(p => ({ ...p, problem: !!c }))}
                      className="mt-0.5 border-brand-yellow/50 data-[state=checked]:bg-brand-yellow data-[state=checked]:text-brand-yellow-foreground"
                    />
                    <span className="text-sm font-medium text-foreground/90">¿El problema está claramente definido y validado con datos?</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={planChecklist.rootCause}
                      onCheckedChange={(c) => setPlanChecklist(p => ({ ...p, rootCause: !!c }))}
                      className="mt-0.5 border-brand-yellow/50 data-[state=checked]:bg-brand-yellow data-[state=checked]:text-brand-yellow-foreground"
                    />
                    <span className="text-sm font-medium text-foreground/90">¿Se identificó la causa raíz utilizando Ishikawa y 5 Porqués y fue verificada en el Gemba?</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={planChecklist.actionPlan}
                      onCheckedChange={(c) => setPlanChecklist(p => ({ ...p, actionPlan: !!c }))}
                      className="mt-0.5 border-brand-yellow/50 data-[state=checked]:bg-brand-yellow data-[state=checked]:text-brand-yellow-foreground"
                    />
                    <span className="text-sm font-medium text-foreground/90">¿El plan de acción ataca directamente la causa raíz e incluye responsables y fechas (5W1H)?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === "Do" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                  Ejecución del plan de acción
                </h3>
                <span className="text-sm text-muted-foreground">
                  {completadas} de {acciones.length} tareas completadas
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand-yellow transition-all"
                  style={{
                    width: `${acciones.length ? (completadas / acciones.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <ul className="space-y-2">
                {acciones.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                  >
                    <Checkbox
                      id={a.id}
                      checked={a.done}
                      onCheckedChange={(v) =>
                        setAcciones((prev) =>
                          prev.map((x) => (x.id === a.id ? { ...x, done: Boolean(v) } : x)),
                        )
                      }
                      className="mt-0.5"
                    />
                    <label htmlFor={a.id} className="flex-1 cursor-pointer">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          a.done && "text-muted-foreground line-through",
                        )}
                      >
                        {a.what}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Responsable: {a.who} · Compromiso: {a.when}
                      </span>
                    </label>
                  </li>
                ))}
                {acciones.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Define acciones en la fase Plan para verlas aquí.
                  </li>
                )}
              </ul>
            </div>
          )}

          {tab === "Check" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                      Galería Gemba (Evidencias)
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toast.success("Foto añadida (demo)")}
                    >
                      <UploadCloud className="size-4 mr-2" /> Subir foto
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Mock Image 1 */}
                    <div className="relative group overflow-hidden rounded-lg border border-border bg-muted aspect-video">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-muted-foreground font-medium text-xs">Máquina L3 - Sucia</span>
                      </div>
                      <div className="absolute top-2 left-2 bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                        ANTES
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="h-7 text-xs">Ver detalle</Button>
                      </div>
                    </div>

                    {/* Mock Image 2 */}
                    <div className="relative group overflow-hidden rounded-lg border border-border bg-muted aspect-video">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-muted-foreground font-medium text-xs">Máquina L3 - Ajustada</span>
                      </div>
                      <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        DESPUÉS
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="h-7 text-xs">Ver detalle</Button>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-2 mt-4 pt-4 border-t border-border">
                    {data.evidencias.map((e) => (
                      <li
                        key={e}
                        className="flex items-center gap-2 rounded-md bg-secondary/70 px-3 py-2 text-sm"
                      >
                        <Paperclip className="size-4 text-primary" />
                        <span className="truncate">{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <TimeSeriesYTD />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificacion">Verificación de resultados</Label>
                <Textarea
                  id="verificacion"
                  rows={5}
                  defaultValue={data.verificacion}
                  placeholder="Compara el resultado obtenido contra la meta y explica desviaciones."
                />
              </div>
            </div>
          )}

          {tab === "Act" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="estandarizacion">Estandarización y cierre</Label>
                <Textarea
                  id="estandarizacion"
                  rows={7}
                  defaultValue={data.estandarizacion}
                  placeholder="Procedimientos actualizados, capacitación, replicación en otras líneas y cierre formal."
                />
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                    Resultado del ciclo ({data.indicador.etiqueta})
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Antes:</Label>
                      <Input
                        type="number"
                        className="h-8 w-20 text-xs"
                        value={indicadorAntes}
                        onChange={(e) => setIndicadorAntes(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs">Después:</Label>
                      <Input
                        type="number"
                        className="h-8 w-20 text-xs"
                        value={indicadorDespues}
                        onChange={(e) => setIndicadorDespues(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { etapa: "Antes", valor: indicadorAntes },
                        { etapa: "Después", valor: indicadorDespues },
                      ]}
                      margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="etapa" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                      <RTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="valor" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* TOLLGATE ACT */}
              <div className="mt-8 rounded-xl border border-phase-act/30 bg-phase-act/5 p-4 shadow-sm">
                <h4 className="font-display text-sm font-semibold uppercase tracking-wide text-phase-act mb-3 flex items-center gap-2">
                  <Check className="size-4" />
                  SDCA Tollgate: Fase Act
                </h4>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={actChecklist.results}
                      onCheckedChange={(c) => setActChecklist(p => ({ ...p, results: !!c }))}
                      className="mt-0.5 border-phase-act/50 data-[state=checked]:bg-phase-act data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium text-foreground/90">¿Se validó que el resultado cumple la meta y se mantiene estable?</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={actChecklist.standardized}
                      onCheckedChange={(c) => setActChecklist(p => ({ ...p, standardized: !!c }))}
                      className="mt-0.5 border-phase-act/50 data-[state=checked]:bg-phase-act data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium text-foreground/90">¿Se actualizó el procedimiento estándar (SOP) y las rutinas (SIC)?</span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={actChecklist.communicated}
                      onCheckedChange={(c) => setActChecklist(p => ({ ...p, communicated: !!c }))}
                      className="mt-0.5 border-phase-act/50 data-[state=checked]:bg-phase-act data-[state=checked]:text-white"
                    />
                    <span className="text-sm font-medium text-foreground/90">¿Se capacitó a los operadores en el nuevo estándar?</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-5">
          <Button variant="outline" onClick={() => toast.success("Borrador guardado")}>
            <Save className="size-4 mr-2" /> Guardar borrador
          </Button>
          <Button
            className="bg-primary hover:bg-brand-dark"
            disabled={(tab === "Plan" && !isPlanComplete) || (tab === "Act" && !isActComplete)}
            onClick={() => {
              if (tab === "Act") toast.success("¡PDCA Cerrado y Estandarizado!");
              else toast.success(`Fase avanzada a ${nextPhase}`);
            }}
          >
            {tab === "Act" ? "Cerrar PDCA" : "Avanzar fase"} <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
    </div>
  );
}
