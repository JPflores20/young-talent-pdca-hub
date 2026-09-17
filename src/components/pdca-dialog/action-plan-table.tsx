import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextareaAutosize from "react-textarea-autosize";
import { format } from "date-fns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { ActionItem } from "@/data/pdca";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Pendiente", "En progreso", "Completada"] as const;
const SDCA_OPTIONS = ["", "SDCA", "SOP", "OPL", "Lección de 1 Punto", "Otra"] as const;

const STATUS_COLOR: Record<string, string> = {
  Pendiente: "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30",
  "En progreso": "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/30",
  Completada: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
};

const SCORE_OPTIONS = [
  { value: "", label: "-" },
  { value: "5", label: "5 - Alto" },
  { value: "3", label: "3 - Medio" },
  { value: "1", label: "1 - Bajo" },
];

const DEFAULT_FACTOR_LABELS = [
  "SEGURIDAD (S)",
  "CALIDAD (C)",
  "COSTO (C)",
  "MEDIO AMBIENTE (M)",
  "SERVICIO (S)",
];
const FACTOR_KEYS = ["seguridad", "calidadHigiene", "costo", "medioAmbiente", "servicio"] as const;

const getFactorValue = (val: any) => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    if (val.includes("5")) return 5;
    if (val.includes("3")) return 3;
    if (val.includes("1")) return 1;
  }
  return 0;
};

function calcProduct(row: any): number {
  const vals = [row.seguridad, row.calidadHigiene, row.costo, row.medioAmbiente, row.servicio];
  const nums = vals.map(getFactorValue);
  const validNums = nums.filter((n) => n > 0);
  if (validNums.length === 0) return 0;
  return validNums.reduce((acc, val) => acc * val, 1);
}

function calculateImpactVisuals(row: any) {
  const p = calcProduct(row);
  if (p === 0) return { text: "-", color: "bg-transparent text-muted-foreground border-border" };
  if (p <= 1)
    return {
      text: p.toString(),
      color: "bg-[#e6f4ea] text-[#137333] border-[#137333]/30 font-bold",
    };
  if (p < 25)
    return {
      text: p.toString(),
      color: "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30 font-bold",
    };
  return { text: p.toString(), color: "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30 font-bold" };
}

const getDropdownColor = (val: any) => {
  if (val === "" || val == null) return "bg-transparent text-muted-foreground border-border";
  if (String(val).includes("5")) return "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30 font-bold";
  if (String(val).includes("3")) return "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30 font-bold";
  if (String(val).includes("1")) return "bg-[#e6f4ea] text-[#137333] border-[#137333]/30 font-bold";
  return "bg-transparent text-muted-foreground";
};

function newActionRow(): ActionItem {
  return {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    seguridad: "",
    calidadHigiene: "",
    costo: "",
    medioAmbiente: "",
    servicio: "",
    resultados: "",
    priorizar: "",
    quickWin: "",
    technologyRequired: "",
    tema: "",
    causaRaiz: "",
    accion: "",
    causaRaiz2: "",
    accion2: "",
    comentarios: "",
    responsable: "",
    fecha: "",
    status: "Pendiente",
    herramientaSdca: "",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────
interface ActionPlanTableProps {
  items: ActionItem[];
  onChange: (items: ActionItem[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

export function ActionPlanTable({
  items,
  onChange,
  isStepCompleted,
  onToggleStep,
}: ActionPlanTableProps) {
  const addRow = () => onChange([...items, newActionRow()]);

  const updateRow = (id: string, field: keyof ActionItem, value: string) => {
    onChange(items.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRow = (id: string) => onChange(items.filter((r) => r.id !== id));

  return (
    <StepCard
      title="PASO 8: MATRIZ DE IMPACTO Y PLAN DE ACCIÓN"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            addRow();
          }}
        >
          <Plus className="mr-1.5 size-3.5" /> Agregar Acción
        </Button>
      }
    >
      <StepInstructions>
        <p className="mb-1">
          1. Usa esto como{" "}
          <span className="text-primary underline cursor-default">
            cualquier otro registro de acción en su MCRS
          </span>
          .
        </p>
        <p>
          2. Si una acción particular tuvo éxito en la eliminación de un síntoma o causa de raíz,
          indique si se necesita una herramienta SDCA o necesita ser actualizada para estandarizar
          el resultado.
        </p>
      </StepInstructions>

      <div className="overflow-x-auto border rounded-md mt-4">
        <Table className="text-xs min-w-[1550px]">
          <TableHeader>
            <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
              <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center min-w-[200px] leading-tight">
                TEMA
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center min-w-[200px] leading-tight">
                CAUSA RAÍZ
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center min-w-[250px] leading-tight">
                ACCIÓN
              </TableHead>

              {/* Factores Numéricos */}
              {DEFAULT_FACTOR_LABELS.map((label) => (
                <TableHead
                  key={label}
                  className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[100px] leading-tight"
                >
                  {label}
                </TableHead>
              ))}
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[110px] leading-tight">
                RESULTADOS (R)
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[95px] leading-tight">
                PRIORIZAR
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[95px] leading-tight">
                QUICK WIN
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-1 border-r border-white/20 text-center min-w-[110px] leading-tight">
                TECH REQUIRED
              </TableHead>

              {[
                { label: "CAUSA RAÍZ", w: "min-w-[150px]" },
                { label: "ACCIÓN", w: "min-w-[200px]" },
                { label: "COMENTARIOS", w: "min-w-[180px]" },
                { label: "RESPONSABLE", w: "min-w-[140px]" },
                { label: "FECHA", w: "min-w-[110px]" },
                { label: "ESTADO", w: "min-w-[110px]" },
                { label: "SDCA", w: "min-w-[100px]" },
              ].map(({ label, w }) => (
                <TableHead
                  key={label}
                  className={cn(
                    "text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center leading-tight",
                    w,
                  )}
                >
                  {label}
                </TableHead>
              ))}
              <TableHead className="w-8 h-8 py-1 px-1" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No hay acciones. Haz clic en "Agregar Acción" para comenzar.
                </TableCell>
              </TableRow>
            )}

            {items.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/30">
                {/* TEMA */}
                <TableCell className="p-0 border-r align-top">
                  <TextareaAutosize
                    value={row.tema || ""}
                    onChange={(e) => updateRow(row.id, "tema", e.target.value)}
                    placeholder="Tema..."
                    minRows={1}
                    className="w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-xs p-2.5 outline-none min-h-[40px]"
                  />
                </TableCell>

                {/* CAUSA RAÍZ */}
                <TableCell className="p-0 border-r align-top">
                  <TextareaAutosize
                    value={row.causaRaiz || ""}
                    onChange={(e) => updateRow(row.id, "causaRaiz", e.target.value)}
                    placeholder="Causa raíz..."
                    minRows={1}
                    className="w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-xs p-2.5 outline-none min-h-[40px]"
                  />
                </TableCell>

                {/* ACCIÓN */}
                <TableCell className="p-0 border-r align-top">
                  <TextareaAutosize
                    value={row.accion || ""}
                    onChange={(e) => updateRow(row.id, "accion", e.target.value)}
                    placeholder="Acción..."
                    minRows={1}
                    className="w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-xs p-2.5 outline-none min-h-[40px]"
                  />
                </TableCell>

                {/* Factores Numéricos */}
                {FACTOR_KEYS.map((key) => {
                  const cellValue = row[key] || "";
                  return (
                    <TableCell key={key} className="p-1 border-r">
                      <div className="px-1 h-full flex items-center justify-center relative">
                        <Select
                          value={cellValue ? String(cellValue) : "-"}
                          onValueChange={(v) => updateRow(row.id, key, v === "-" ? "" : v)}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-8 text-[11px] rounded border px-2 shadow-none focus:ring-1 focus:ring-primary [&>span]:line-clamp-none",
                              getDropdownColor(cellValue),
                            )}
                          >
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            {SCORE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value || "-"} value={opt.value || "-"}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  );
                })}

                {/* RESULTADO DE IMPACTO */}
                <TableCell className="p-1 border-r">
                  <div className="px-1 h-full flex items-center justify-center relative">
                    {(() => {
                      const impact = calculateImpactVisuals(row);
                      return (
                        <div
                          className={cn(
                            "flex items-center justify-center w-full h-8 text-[11px] rounded border",
                            impact.color,
                          )}
                        >
                          {impact.text}
                        </div>
                      );
                    })()}
                  </div>
                </TableCell>

                {/* PRIORIZAR */}
                <TableCell className="p-1 border-r bg-muted/20">
                  <div className="h-full flex items-center justify-center relative">
                    <Select
                      value={row.priorizar || "-"}
                      onValueChange={(v) => updateRow(row.id, "priorizar", v === "-" ? "" : v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-[11px] font-bold rounded border px-2 shadow-none [&>span]:line-clamp-none",
                          row.priorizar === "SI"
                            ? "bg-[#e6f4ea] text-[#137333] border-[#137333]/30"
                            : row.priorizar === "NO"
                              ? "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30"
                              : "bg-white border-border",
                        )}
                      >
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="SI">SÍ</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                {/* QUICK WIN */}
                <TableCell className="p-1 border-r bg-muted/20">
                  <div className="h-full flex items-center justify-center relative">
                    <Select
                      value={row.quickWin || "-"}
                      onValueChange={(v) => updateRow(row.id, "quickWin", v === "-" ? "" : v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-[11px] font-bold rounded border px-2 shadow-none [&>span]:line-clamp-none",
                          row.quickWin === "SI"
                            ? "bg-[#e6f4ea] text-[#137333] border-[#137333]/30"
                            : row.quickWin === "NO"
                              ? "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30"
                              : "bg-white border-border",
                        )}
                      >
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="SI">SÍ</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                {/* TECHNOLOGY REQUIRED */}
                <TableCell className="p-1 border-r bg-muted/20">
                  <div className="h-full flex items-center justify-center relative">
                    <Select
                      value={row.technologyRequired || "-"}
                      onValueChange={(v) =>
                        updateRow(row.id, "technologyRequired", v === "-" ? "" : v)
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 text-[11px] font-bold rounded border px-2 shadow-none [&>span]:line-clamp-none",
                          row.technologyRequired === "SI"
                            ? "bg-[#e6f4ea] text-[#137333] border-[#137333]/30"
                            : row.technologyRequired === "NO"
                              ? "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30"
                              : "bg-white border-border",
                        )}
                      >
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-">-</SelectItem>
                        <SelectItem value="SI">SÍ</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>

                {/* CAUSA RAIZ */}
                <TableCell className="p-1 border-r min-w-[150px]">
                  <TextareaAutosize
                    minRows={1}
                    value={row.causaRaiz2 || ""}
                    onChange={(e) => updateRow(row.id, "causaRaiz2", e.target.value)}
                    placeholder="Causa raíz..."
                    className="w-full text-xs p-2 bg-transparent border-0 resize-none outline-none focus:ring-1 focus:ring-primary rounded"
                  />
                </TableCell>

                {/* ACCION */}
                <TableCell className="p-1 border-r min-w-[200px]">
                  <TextareaAutosize
                    minRows={1}
                    value={row.accion2 || ""}
                    onChange={(e) => updateRow(row.id, "accion2", e.target.value)}
                    placeholder="Acción..."
                    className="w-full text-xs p-2 bg-transparent border-0 resize-none outline-none focus:ring-1 focus:ring-primary rounded"
                  />
                </TableCell>

                {/* COMENTARIOS */}
                <TableCell className="p-1 border-r min-w-[180px]">
                  <TextareaAutosize
                    minRows={1}
                    value={row.comentarios || ""}
                    onChange={(e) => updateRow(row.id, "comentarios", e.target.value)}
                    placeholder="Comentarios..."
                    className="w-full text-xs p-2 bg-transparent border-0 resize-none outline-none focus:ring-1 focus:ring-primary rounded"
                  />
                </TableCell>

                {/* RESPONSABLE */}
                <TableCell className="p-1 border-r min-w-[140px]">
                  <Input
                    value={row.responsable || ""}
                    onChange={(e) => updateRow(row.id, "responsable", e.target.value)}
                    placeholder="Responsable..."
                    className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus-visible:ring-1 rounded"
                  />
                </TableCell>

                {/* FECHA */}
                <TableCell className="p-1 border-r">
                  <DatePicker
                    date={row.fecha ? new Date(row.fecha + "T12:00:00") : undefined}
                    setDate={(d) => updateRow(row.id, "fecha", d ? format(d, "yyyy-MM-dd") : "")}
                    className="h-8 text-[11px] px-2 bg-transparent border-0 shadow-none hover:bg-muted/50 rounded"
                    placeholder="-"
                  />
                </TableCell>

                {/* ESTADO */}
                <TableCell className="p-1 border-r">
                  <Select value={row.status} onValueChange={(v) => updateRow(row.id, "status", v)}>
                    <SelectTrigger
                      className={cn(
                        "h-8 text-[10px] font-semibold rounded border px-2 shadow-none [&>span]:line-clamp-none",
                        STATUS_COLOR[row.status] ??
                          "bg-transparent text-muted-foreground border-border",
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* HERRAMIENTA SDCA */}
                <TableCell className="p-1 border-r min-w-[100px]">
                  <Input
                    value={row.herramientaSdca || ""}
                    onChange={(e) => updateRow(row.id, "herramientaSdca", e.target.value)}
                    placeholder="SDCA..."
                    className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus-visible:ring-1 rounded"
                  />
                </TableCell>

                {/* Eliminar */}
                <TableCell className="p-1 text-center">
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
            ))}
          </TableBody>
        </Table>
      </div>
    </StepCard>
  );
}
