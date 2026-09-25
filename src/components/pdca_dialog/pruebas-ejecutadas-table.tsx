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
import type { PruebaEjecutadaItem } from "@/data/pdca";

interface PruebasEjecutadasTableProps {
  items: PruebaEjecutadaItem[];
  onChange: (items: PruebaEjecutadaItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const PruebasEjecutadasTable: React.FC<PruebasEjecutadasTableProps> = ({ items, onChange, isStepCompleted, isNa, onToggleStep, onToggleNa }) => {
  const handleAdd = () => {
    const newItem: PruebaEjecutadaItem = {
      id: crypto.randomUUID(),
      prueba: "",
      fecha: "",
      resultado: "",
      estado: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof PruebaEjecutadaItem, value: string) => {
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
      title="PASO 23: PRUEBAS EJECUTADAS"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Prueba
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">PRUEBA / ACCIÓN</TableHead>
                <TableHead className="font-bold text-white text-center w-36">FECHA</TableHead>
                <TableHead className="font-bold text-white text-center">RESULTADO ESPERADO VS REAL</TableHead>
                <TableHead className="font-bold text-white text-center w-32">ESTADO</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay pruebas registradas.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.prueba}
                      onChange={(e) => handleUpdate(item.id, "prueba", e.target.value)}
                      placeholder="Descripción de la prueba..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
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
                      value={item.resultado}
                      onChange={(e) => handleUpdate(item.id, "resultado", e.target.value)}
                      placeholder="Resultado..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Select
                      value={item.estado}
                      onValueChange={(val) => handleUpdate(item.id, "estado", val)}
                    >
                      <SelectTrigger className="h-8 text-xs shadow-none">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Exitoso">Exitoso</SelectItem>
                        <SelectItem value="Fallido">Fallido</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
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
