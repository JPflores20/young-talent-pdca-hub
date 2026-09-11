import React from "react";
import { Plus, X } from "lucide-react";
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
import type { ActionItem } from "@/data/pdca";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["Pendiente", "En progreso", "Completada"] as const;
const SDCA_OPTIONS = ["", "SDCA", "SOP", "OPL", "Lección de 1 Punto", "Otra"] as const;

const STATUS_COLOR: Record<string, string> = {
  "Pendiente":    "bg-[#fef7e0] text-[#b06000] border-[#b06000]/30",
  "En progreso":  "bg-[#e8f0fe] text-[#1a73e8] border-[#1a73e8]/30",
  "Completada":   "bg-[#e6f4ea] text-[#137333] border-[#137333]/30",
};

function newActionRow(): ActionItem {
  return {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tema: "",
    causaRaiz: "",
    accion: "",
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
      title="PASO 8.2: PLAN DE ACCIÓN"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); addRow(); }}>
          <Plus className="mr-1.5 size-3.5" /> Agregar Acción
        </Button>
      }
    >
      <StepInstructions>
        <p className="mb-1">
          1. Usa esto como{" "}
          <span className="text-primary underline cursor-default">cualquier otro registro de acción en su MCRS</span>.
        </p>
        <p>
          2. Si una acción particular tuvo éxito en la eliminación de un síntoma o causa de raíz, indique si se necesita una herramienta SDCA o necesita ser actualizada para estandarizar el resultado.
        </p>
      </StepInstructions>

      <div className="overflow-x-auto border rounded-md mt-4">
        <Table className="text-xs min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
              {[
                { label: "TEMA",             w: "min-w-[120px]" },
                { label: "CAUSA RAÍZ",       w: "min-w-[130px]" },
                { label: "ACCIÓN",           w: "min-w-[160px]" },
                { label: "COMENTARIOS",      w: "min-w-[150px]" },
                { label: "RESPONSABLE",      w: "min-w-[110px]" },
                { label: "FECHA",            w: "min-w-[110px]" },
                { label: "ESTADO",           w: "min-w-[110px]" },
                { label: "HERRAMIENTA SDCA", w: "min-w-[130px]" },
              ].map(({ label, w }) => (
                <TableHead
                  key={label}
                  className={cn(
                    "text-white font-bold h-8 py-1 px-2 border-r border-white/20 text-center leading-tight",
                    w
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
                <TableCell className="p-0 border-r">
                  <Input
                    value={row.tema || ""}
                    onChange={(e) => updateRow(row.id, "tema", e.target.value)}
                    placeholder="Tema..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>

                {/* CAUSA RAÍZ */}
                <TableCell className="p-0 border-r">
                  <Input
                    value={row.causaRaiz || ""}
                    onChange={(e) => updateRow(row.id, "causaRaiz", e.target.value)}
                    placeholder="Causa raíz..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>

                {/* ACCIÓN */}
                <TableCell className="p-0 border-r">
                  <Input
                    value={row.accion || ""}
                    onChange={(e) => updateRow(row.id, "accion", e.target.value)}
                    placeholder="Acción..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>

                {/* COMENTARIOS */}
                <TableCell className="p-0 border-r">
                  <Input
                    value={row.comentarios || ""}
                    onChange={(e) => updateRow(row.id, "comentarios", e.target.value)}
                    placeholder="Comentarios..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>

                {/* RESPONSABLE */}
                <TableCell className="p-0 border-r">
                  <Input
                    value={row.responsable || ""}
                    onChange={(e) => updateRow(row.id, "responsable", e.target.value)}
                    placeholder="Responsable..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>

                {/* FECHA */}
                <TableCell className="p-1 border-r">
                  <input
                    type="date"
                    value={row.fecha || ""}
                    onChange={(e) => updateRow(row.id, "fecha", e.target.value)}
                    className="w-full h-8 text-xs bg-transparent border-0 outline-none focus:ring-0 cursor-pointer px-1"
                  />
                </TableCell>

                {/* ESTADO */}
                <TableCell className="p-1 border-r">
                  <select
                    value={row.status}
                    onChange={(e) => updateRow(row.id, "status", e.target.value)}
                    className={cn(
                      "w-full h-7 text-[10px] font-semibold rounded border text-center appearance-none cursor-pointer px-1",
                      STATUS_COLOR[row.status] ?? "bg-transparent text-muted-foreground border-border"
                    )}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-white text-black font-normal">
                        {opt}
                      </option>
                    ))}
                  </select>
                </TableCell>

                {/* HERRAMIENTA SDCA */}
                <TableCell className="p-1 border-r">
                  <select
                    value={row.herramientaSdca || ""}
                    onChange={(e) => updateRow(row.id, "herramientaSdca", e.target.value)}
                    className="w-full h-7 text-[10px] rounded border border-border bg-transparent text-center appearance-none cursor-pointer px-1"
                  >
                    {SDCA_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="bg-white text-black font-normal">
                        {opt || "—"}
                      </option>
                    ))}
                  </select>
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
