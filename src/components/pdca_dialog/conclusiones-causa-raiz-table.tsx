import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      problema: "",
      causaRaiz: "",
      validacion: "",
      valorP: "",
      conclusion: "",
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
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[900px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center border-r border-white/20">Problema / Desviación</TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/20 w-1/4">Causa Raíz / Causa Potencial</TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/20">Técnica de Validación / Prueba Hipótesis</TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/20">Valor-P / Significancia Estadística</TableHead>
                <TableHead className="font-bold text-white text-center w-1/4">Conclusión</TableHead>
                <TableHead className="w-12 bg-white"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No hay causas raíz definidas. Haz clic en "Agregar Fila".
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id} className="border-b border-border">
                  <TableCell className="p-1.5 border-r border-border align-top">
                    <Textarea
                      value={item.problema}
                      onChange={(e) => handleUpdate(item.id, "problema", e.target.value)}
                      placeholder="Problema o desviación..."
                      className="min-h-[80px] text-xs shadow-none resize-y"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 border-r border-border align-top">
                    <Textarea
                      value={item.causaRaiz}
                      onChange={(e) => handleUpdate(item.id, "causaRaiz", e.target.value)}
                      placeholder="Ej. Presencia de Smokey en arroz..."
                      className="min-h-[80px] text-xs shadow-none resize-y"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 border-r border-border align-top">
                    <Textarea
                      value={item.validacion}
                      onChange={(e) => handleUpdate(item.id, "validacion", e.target.value)}
                      placeholder="Ej. Validación estadística o prueba de hipótesis X²"
                      className="min-h-[80px] text-xs shadow-none resize-y text-center"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 border-r border-border align-top">
                    <Textarea
                      value={item.valorP}
                      onChange={(e) => handleUpdate(item.id, "valorP", e.target.value)}
                      placeholder="Ej. Valor-P = 1.50 X 10^-5"
                      className="min-h-[80px] text-xs shadow-none resize-y text-center font-semibold text-red-600"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 align-top">
                    <Textarea
                      value={item.conclusion}
                      onChange={(e) => handleUpdate(item.id, "conclusion", e.target.value)}
                      placeholder="Conclusión..."
                      className="min-h-[80px] text-xs shadow-none resize-y"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 text-center align-middle">
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
