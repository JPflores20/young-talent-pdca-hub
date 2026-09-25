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
import type { VozDelConsumidorItem } from "@/data/pdca";

interface VozConsumidorTableProps {
  items: VozDelConsumidorItem[];
  onChange: (items: VozDelConsumidorItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const VozConsumidorTable: React.FC<VozConsumidorTableProps> = ({ items, onChange, isStepCompleted, isNa, onToggleStep, onToggleNa }) => {
  const handleAdd = () => {
    const newItem: VozDelConsumidorItem = {
      id: crypto.randomUUID(),
      necesidad: "",
      importancia: "",
      metrica: "",
      comentario: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof VozDelConsumidorItem, value: string) => {
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
      title="PASO 5: VOZ DEL CONSUMIDOR (VOC/VOB)"
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
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">CLIENTE</TableHead>
                <TableHead className="font-bold text-white text-center">VOZ DEL CLIENTE</TableHead>
                <TableHead className="font-bold text-white text-center">INDICADOR CLAVE DE PROCESO</TableHead>
                <TableHead className="font-bold text-white text-center">REQUERIMIENTO CRÍTICO DEL CLIENTE</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay registros. Agrega uno.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.necesidad}
                      onChange={(e) => handleUpdate(item.id, "necesidad", e.target.value)}
                      placeholder="Ej. Usuario Final, Logística..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.importancia}
                      onChange={(e) => handleUpdate(item.id, "importancia", e.target.value)}
                      placeholder="Ej. Entregas más rápidas..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.metrica}
                      onChange={(e) => handleUpdate(item.id, "metrica", e.target.value)}
                      placeholder="Ej. Lead Time, OTIF..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.comentario}
                      onChange={(e) => handleUpdate(item.id, "comentario", e.target.value)}
                      placeholder="Ej. Entrega en < 24h..."
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
