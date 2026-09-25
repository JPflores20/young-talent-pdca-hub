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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepCard } from "@/components/ui/step-card";
import type { ConclusionCausaRaizItem } from "@/data/pdca";

interface ConclusionesCausaRaizTableProps {
  items: ConclusionCausaRaizItem[];
  onChange: (items: ConclusionCausaRaizItem[]) => void;
  title?: string;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const ConclusionesCausaRaizTable: React.FC<ConclusionesCausaRaizTableProps> = ({ items, onChange, title, isStepCompleted, onToggleStep, isNa, onToggleNa }) => {
  const handleAdd = () => {
    const newItem: ConclusionCausaRaizItem = {
      id: crypto.randomUUID(),
      causaRaiz: "",
      validacion: "",
      conclusion: "",
      esReal: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof ConclusionCausaRaizItem, value: string) => {
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
      title={title ?? "PASO 18: CAUSAS RAÍZ DEFINIDAS"}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Conclusión
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[650px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">CAUSA RAÍZ DEFINIDA</TableHead>
                <TableHead className="font-bold text-white text-center">FORMA DE VALIDACIÓN</TableHead>
                <TableHead className="font-bold text-white text-center">CONCLUSIÓN DE LA VALIDACIÓN</TableHead>
                <TableHead className="font-bold text-white text-center w-24">¿ES CAUSA RAÍZ REAL?</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay causas raíz definidas.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.causaRaiz}
                      onChange={(e) => handleUpdate(item.id, "causaRaiz", e.target.value)}
                      placeholder="Causa raíz..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.validacion}
                      onChange={(e) => handleUpdate(item.id, "validacion", e.target.value)}
                      placeholder="Ej. Prueba en línea, análisis de datos"
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.conclusion}
                      onChange={(e) => handleUpdate(item.id, "conclusion", e.target.value)}
                      placeholder="Conclusión..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Select
                      value={item.esReal}
                      onValueChange={(val) => handleUpdate(item.id, "esReal", val)}
                    >
                      <SelectTrigger className="h-8 text-xs shadow-none">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">SI</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                      </SelectContent>
                    </Select>
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
