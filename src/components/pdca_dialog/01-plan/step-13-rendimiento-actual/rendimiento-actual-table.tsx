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
import type { RendimientoActualPiItem } from "@/data/pdca";

interface RendimientoActualTableProps {
  items: RendimientoActualPiItem[];
  handleAdd: () => void;
  handleUpdate: (id: string, field: keyof RendimientoActualPiItem, value: string) => void;
  handleDelete: (id: string) => void;
}

export function RendimientoActualTable({
  items,
  handleAdd,
  handleUpdate,
  handleDelete,
}: RendimientoActualTableProps) {
  return (
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
              <TableHead className="font-bold text-white text-center border-r border-white/20">
                Estación de trabajo de operador o técnico
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20">
                Nombre de Indicador
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20">
                Estado Actual
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20">
                Puesto Responsable
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20">
                Herramienta en la que se Encuentra
              </TableHead>
              <TableHead className="font-bold text-white text-center">Ubicación de PI</TableHead>
              <TableHead className="w-12 bg-white"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No hay datos registrados.
                </TableCell>
              </TableRow>
            )}
            {items?.map((item) => (
              <TableRow key={item.id} className="border-b border-border">
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.estacionTrabajo}
                    onChange={(e) => handleUpdate(item.id, "estacionTrabajo", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.nombreIndicador}
                    onChange={(e) => handleUpdate(item.id, "nombreIndicador", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.estadoActual}
                    onChange={(e) => handleUpdate(item.id, "estadoActual", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.puestoResponsable}
                    onChange={(e) => handleUpdate(item.id, "puestoResponsable", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.herramienta}
                    onChange={(e) => handleUpdate(item.id, "herramienta", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <Input
                    value={item.ubicacion}
                    onChange={(e) => handleUpdate(item.id, "ubicacion", e.target.value)}
                    placeholder="..."
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
}
