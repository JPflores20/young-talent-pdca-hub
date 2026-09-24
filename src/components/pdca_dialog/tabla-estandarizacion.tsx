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
import type { TablaEstandarizacionItem } from "@/data/pdca";

interface TablaEstandarizacionProps {
  items: TablaEstandarizacionItem[];
  onChange: (items: TablaEstandarizacionItem[]) => void;
}

export const TablaEstandarizacion: React.FC<TablaEstandarizacionProps> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: TablaEstandarizacionItem = {
      id: crypto.randomUUID(),
      actividad: "",
      responsable: "",
      frecuencia: "",
      estandar: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, field: keyof TablaEstandarizacionItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Tabla de Estandarización</h3>
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> Agregar Fila
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[700px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">Actividad</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">Responsable</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">Frecuencia</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">Documento / Estándar</TableHead>
              <TableHead className="w-12 border-none"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No hay registros de estandarización. Agrega uno.
                </TableCell>
              </TableRow>
            )}
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-1.5">
                  <Input
                    value={item.actividad}
                    onChange={(e) => handleUpdate(item.id, "actividad", e.target.value)}
                    placeholder="Describe la actividad..."
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    value={item.responsable}
                    onChange={(e) => handleUpdate(item.id, "responsable", e.target.value)}
                    placeholder="Responsable..."
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    value={item.frecuencia}
                    onChange={(e) => handleUpdate(item.id, "frecuencia", e.target.value)}
                    placeholder="Diaria, Semanal, etc."
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    value={item.estandar}
                    onChange={(e) => handleUpdate(item.id, "estandar", e.target.value)}
                    placeholder="SOP-123..."
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
  );
};
