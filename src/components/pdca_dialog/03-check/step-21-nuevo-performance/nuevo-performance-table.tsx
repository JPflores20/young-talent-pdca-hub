import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StepCard } from "@/components/ui/step-card";
import type { NuevoPerformanceItem } from "@/data/pdca";

interface NuevoPerformanceTableProps {
  items: NuevoPerformanceItem[];
  onChange: (items: NuevoPerformanceItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const NuevoPerformanceTable: React.FC<NuevoPerformanceTableProps> = ({ items, onChange, isStepCompleted, onToggleStep, isNa, onToggleNa }) => {
  const handleAdd = () => {
    const newItem: NuevoPerformanceItem = {
      id: crypto.randomUUID(),
      indicador: "",
      antes: "",
      despues: "",
      mejora: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof NuevoPerformanceItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 24: NUEVO PERFORMANCE DE PROCESOS (ESTADÍSTICO)"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Indicador
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">INDICADOR / PI / KPI</TableHead>
                <TableHead className="font-bold text-white text-center">ANTES (BASELINE)</TableHead>
                <TableHead className="font-bold text-white text-center">DESPUÉS (IMPLEMENTACIÓN)</TableHead>
                <TableHead className="font-bold text-white text-center">MEJORA (%)</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay indicadores registrados.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.indicador}
                      onChange={(e) => handleUpdate(item.id, "indicador", e.target.value)}
                      placeholder="Ej. Tiempo de ciclo, Defectos..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.antes}
                      onChange={(e) => handleUpdate(item.id, "antes", e.target.value)}
                      placeholder="Valor inicial..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.despues}
                      onChange={(e) => handleUpdate(item.id, "despues", e.target.value)}
                      placeholder="Valor final..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.mejora}
                      onChange={(e) => handleUpdate(item.id, "mejora", e.target.value)}
                      placeholder="Ej. +15%"
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </StepCard>
  );
};
