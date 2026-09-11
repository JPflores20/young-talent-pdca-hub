import { useState, useRef } from "react";
import { Plus, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
import { AutoResizeTextarea } from "./auto-resize-textarea";
import type { ImpactMatrixRow } from "@/data/pdca";

// ─── FUNCIONES EXPORTADAS PARA EL STATE ──────────────────────────────────────
export function newImpactRow(): ImpactMatrixRow {
  return {
    id: `IM-${Date.now()}-${Math.random()}`,
    problema: "",
    causa: "",
    accion: "",
    seguridad: "",
    calidadHigiene: "",
    costo: "",
    medioAmbiente: "",
    servicio: "",
    quickWin: "",
    tecnologia: "",
    priorizar: "",
  } as any;
}

const getFactorValue = (val: any) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    if (val.includes("5")) return 5;
    if (val.includes("3")) return 3;
    if (val.includes("1")) return 1;
  }
  return 0; // Si está vacío cuenta como 0 para no alterar la multiplicación inicial
};

export function calcImpact(row: any): number {
  const vals = [row.seguridad, row.calidadHigiene, row.costo, row.medioAmbiente, row.servicio];
  const nums = vals.map(getFactorValue);
  const validNums = nums.filter(n => n > 0);
  if (validNums.length === 0) return 0;
  return Math.max(...validNums);
}

export function calcProduct(row: any): number {
  const vals = [row.seguridad, row.calidadHigiene, row.costo, row.medioAmbiente, row.servicio];
  const nums = vals.map(getFactorValue);
  const validNums = nums.filter(n => n > 0);
  if (validNums.length === 0) return 0;
  return validNums.reduce((acc, val) => acc * val, 1);
}
// ─────────────────────────────────────────────────────────────────────────────

const FACTOR_OPTIONS = ["1 - Bajo", "3 - Medio", "5 - Alto"] as const;
const YES_NO_OPTIONS = ["SÍ", "NO", "—"] as const;

// Colores condicionales según la selección
const getDropdownColor = (val: unknown) => {
  const s = val != null ? String(val) : "";
  if (!s || s === "—") return "bg-transparent text-muted-foreground border-border";
  if (s.includes("1") || s === "SÍ") return "bg-[#e6f4ea] text-[#137333] border-[#137333]/20";
  if (s.includes("3")) return "bg-[#fef7e0] text-[#b06000] border-[#b06000]/20";
  if (s.includes("5") || s === "NO") return "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/20";
  return "bg-transparent text-muted-foreground border-border";
};

const DEFAULT_FACTOR_LABELS = [
  "SEGURIDAD",
  "CALIDAD / HIGIENE",
  "COSTO",
  "MEDIO AMBIENTE",
  "SERVICIO",
];

export function ImpactMatrixTable({
  rows,
  onChange,
  isStepCompleted,
  onToggleStep,
  factorLabels: factorLabelsProp,
  onFactorLabelsChange,
}: {
  rows: ImpactMatrixRow[];
  onChange: (rows: ImpactMatrixRow[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
  factorLabels?: string[];
  onFactorLabelsChange?: (labels: string[]) => void;
}) {
  const [factorLabels, setFactorLabels] = useState<string[]>(
    factorLabelsProp ?? DEFAULT_FACTOR_LABELS
  );
  const [editingFactorIdx, setEditingFactorIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditFactor = (idx: number) => {
    setEditingFactorIdx(idx);
    setEditingValue(factorLabels[idx] ?? "");
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEditFactor = () => {
    if (editingFactorIdx === null) return;
    const newLabels = factorLabels.map((l, i) =>
      i === editingFactorIdx ? (editingValue.trim() || l) : l
    );
    setFactorLabels(newLabels);
    onFactorLabelsChange?.(newLabels);
    setEditingFactorIdx(null);
  };

  const addRow = () => {
    onChange([...rows, newImpactRow()]);
  };

  const updateRow = (id: string, field: string, value: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  const calculateImpactVisuals = (row: any) => {
    const p = calcProduct(row);
    if (p === 0) return { text: "—", color: "bg-transparent text-muted-foreground" };
    if (p <= 1) return { text: `${p}-Bajo`, color: "bg-[#e6f4ea] text-[#137333]" };
    if (p < 25) return { text: `${p}-Medio`, color: "bg-[#fef7e0] text-[#b06000]" };
    return { text: `${p}-Alto`, color: "bg-[#fce8e6] text-[#c5221f]" };
  };

  const FACTOR_KEYS = ["seguridad", "calidadHigiene", "costo", "medioAmbiente", "servicio"] as const;
  const FACTORS = FACTOR_KEYS.map((key, i) => ({ key, label: factorLabels[i] ?? DEFAULT_FACTOR_LABELS[i] }));

  return (
    <StepCard
      className="overflow-hidden"
      title="PASO 8.1: MATRIZ DE IMPACTO"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addRow(); }}>
          <Plus className="mr-2 size-4" /> Agregar Acción
        </Button>
      }
    >
      <StepInstructions>
        <p className="mb-1">1. Elige la causa raíz eliminando las acciones a ser analizadas en base a los pasos anteriores.</p>
        <p className="mb-1">2. Evalúa las acciones en base a los criterios usando la escala: <strong>ALTO = 5 · MEDIO = 3 · BAJO = 1</strong>.</p>
        <p>3. La columna "Resultado del Impacto" multiplicará los factores automáticamente al seleccionarlos.</p>
      </StepInstructions>

      <div className="overflow-x-auto border rounded-md">
        <Table className="text-xs min-w-[1400px]">
          <TableHeader>
            <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
              <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 min-w-[150px]">PROBLEMAS</TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 min-w-[150px]">CAUSA RAÍZ ABORDADA</TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 min-w-[200px]">ACCIÓN</TableHead>
              
              {FACTORS.map((f, i) => (
                <TableHead key={f.key} className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center w-[90px] leading-tight">
                  {editingFactorIdx === i ? (
                    <input
                      ref={inputRef}
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={commitEditFactor}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") commitEditFactor(); }}
                      className="w-full bg-white/20 text-white text-center text-[10px] font-bold rounded px-1 outline-none border border-white/60 leading-tight"
                      style={{ minWidth: 0 }}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditFactor(i)}
                      className="group flex items-center justify-center gap-1 w-full leading-tight hover:underline decoration-white/60 cursor-pointer"
                      title="Haz clic para renombrar"
                    >
                      <span>{f.label}</span>
                      <Pencil className="size-2.5 opacity-0 group-hover:opacity-70 shrink-0" />
                    </button>
                  )}
                </TableHead>
              ))}
              
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center w-[100px] leading-tight">RESULTADO DE IMPACTO</TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center w-[80px]">QUICK WIN</TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center w-[100px] leading-tight">TECNOLOGÍA REQUERIDA</TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center w-[80px] leading-tight">PRIORIZAR SÍ/NO</TableHead>
              <TableHead className="w-8 h-8 py-1 px-1"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} className="text-center py-6 text-muted-foreground">
                  No hay datos en la matriz. Haz clic en "Agregar Acción" para comenzar.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const impact = calculateImpactVisuals(row);

              return (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="p-0 border-r">
                    <Input
                      value={(row as any).problema || ""}
                      onChange={(e) => updateRow(row.id, "problema", e.target.value)}
                      placeholder="Problema..."
                      className="h-12 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-0 border-r">
                    <Input
                      value={(row as any).causa || ""}
                      onChange={(e) => updateRow(row.id, "causa", e.target.value)}
                      placeholder="Causa raíz..."
                      className="h-12 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                    />
                  </TableCell>
                  <TableCell className="p-0 border-r">
                    <AutoResizeTextarea
                      value={row.accion || ""}
                      onChange={(val) => updateRow(row.id, "accion", val)}
                      placeholder="Acción..."
                      className="w-full min-h-[48px] p-2 border-0 rounded-none shadow-none bg-transparent focus-visible:ring-0 text-xs resize-none"
                    />
                  </TableCell>

                  {/* Factores Numéricos */}
                  {FACTORS.map((f) => {
                    const cellValue = (row as any)[f.key] || "";
                    return (
                      <TableCell key={f.key} className="p-1 border-r">
                        <div className="px-1 h-full flex items-center justify-center relative">
                          <select
                            value={cellValue}
                            onChange={(e) => updateRow(row.id, f.key, e.target.value)}
                            className={cn(
                              "w-full h-7 text-[10px] font-bold border outline-none cursor-pointer rounded appearance-none px-2",
                              getDropdownColor(cellValue)
                            )}
                          >
                            <option value="">—</option>
                            {FACTOR_OPTIONS.map((opt) => (
                              <option key={opt} value={opt} className="bg-white text-black font-normal">{opt}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className={cn("h-3 w-3", getDropdownColor(cellValue).split(" ")[1])} viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}

                  {/* Resultado de Impacto (Calculado) */}
                  <TableCell className="p-1 border-r text-center">
                    <div className={cn("mx-auto w-[90%] h-7 flex items-center justify-center text-[10px] font-bold rounded", impact.color)}>
                      {impact.text}
                    </div>
                  </TableCell>

                  {/* Sí/No Dropdowns */}
                  {(["quickWin", "tecnologia", "priorizar"] as const).map((field) => {
                     const cellValue = (row as any)[field] || "";
                     return (
                      <TableCell key={field} className="p-1 border-r">
                        <div className="px-1 h-full flex items-center justify-center relative">
                          <select
                            value={cellValue}
                            onChange={(e) => updateRow(row.id, field, e.target.value)}
                            className={cn(
                              "w-full h-7 text-[10px] font-bold border outline-none cursor-pointer rounded appearance-none px-2 text-center",
                              getDropdownColor(cellValue)
                            )}
                          >
                            <option value="">—</option>
                            {YES_NO_OPTIONS.filter(o => o !== "—").map((opt) => (
                              <option key={opt} value={opt} className="bg-white text-black font-normal">{opt}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                            <svg className={cn("h-3 w-3", getDropdownColor(cellValue).split(" ")[1])} viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}

                  {/* Botón Eliminar */}
                  <TableCell className="p-0 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(row.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-4" />
                    </Button>
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