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
import { Badge } from "@/components/ui/badge";
import type { ColeccionDatosItem } from "@/data/pdca";

interface ColeccionDatosTableProps {
  items: ColeccionDatosItem[];
  onChange: (items: ColeccionDatosItem[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

export const ColeccionDatosTable: React.FC<ColeccionDatosTableProps> = ({ items, onChange, isStepCompleted, onToggleStep }) => {
  const handleAdd = () => {
    const newItem: ColeccionDatosItem = {
      id: crypto.randomUUID(),
      fecha: "",
      variable: "",
      valor: "",
      comentario: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, field: keyof ColeccionDatosItem, value: string) => {
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
      title="COLECCIÓN DE DATOS"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">Fecha</TableHead>
                <TableHead className="font-bold text-white text-center">Variable / KPI</TableHead>
                <TableHead className="font-bold text-white text-center">Valor</TableHead>
                <TableHead className="font-bold text-white text-center">Comentarios</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay registros en la colección de datos. Agrega uno.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      type="date"
                      value={item.fecha}
                      onChange={(e) => handleUpdate(item.id, "fecha", e.target.value)}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.variable}
                      onChange={(e) => handleUpdate(item.id, "variable", e.target.value)}
                      placeholder="E.g. Temperatura, Presión..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.valor}
                      onChange={(e) => handleUpdate(item.id, "valor", e.target.value)}
                      placeholder="Valor..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.comentario}
                      onChange={(e) => handleUpdate(item.id, "comentario", e.target.value)}
                      placeholder="Observaciones..."
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
