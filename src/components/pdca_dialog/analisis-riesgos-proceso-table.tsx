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
import { StepInstructions } from "../pdca-dialog/step-instructions";

export type AnalisisRiesgoProcesoItem = {
  id: string;
  riesgo: string;
  accion: string;
  personaACargo: string;
  frecuencia: string;
};

interface AnalisisRiesgosProcesoTableProps {
  items: AnalisisRiesgoProcesoItem[];
  onChange: (items: AnalisisRiesgoProcesoItem[]) => void;
}

export const AnalisisRiesgosProcesoTable: React.FC<AnalisisRiesgosProcesoTableProps> = ({ items, onChange }) => {
  const handleAdd = () => {
    const newItem: AnalisisRiesgoProcesoItem = {
      id: crypto.randomUUID(),
      riesgo: "",
      accion: "",
      personaACargo: "",
      frecuencia: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof AnalisisRiesgoProcesoItem, value: string) => {
    const newItems = (items || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange((items || []).filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Identificar todos los posibles riesgos asociados a los cambios permanentes realizados como resultado del PDCA/ITF y luego llenar en el cuadro la columna que corresponde a esa informaciÃ³n.</li>
          <li>Aplicar todos los procesos de gestiÃ³n del cambio necesarios en funciÃ³n de los riesgos. Utilice la herramienta MOC en el Portal Global de VPO para ayudar en este proceso.</li>
        </ol>
      </StepInstructions>

      <div className="flex items-center justify-end">
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> Agregar Fila
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[800px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="w-10 font-bold text-white text-center border-r border-white/20">#</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">RIESGO</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">ACCION</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">PERSONA A CARGO</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 uppercase">FRECUENCIA</TableHead>
              <TableHead className="w-12 border-none"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No hay riesgos identificados. Agrega uno.
                </TableCell>
              </TableRow>
            )}
            {items?.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell className="p-1.5 text-center font-bold border-r border-border">
                  {index + 1}
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.riesgo || ""}
                    onChange={(e) => handleUpdate(item.id, "riesgo", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.accion || ""}
                    onChange={(e) => handleUpdate(item.id, "accion", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.personaACargo || ""}
                    onChange={(e) => handleUpdate(item.id, "personaACargo", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <Input
                    value={item.frecuencia || ""}
                    onChange={(e) => handleUpdate(item.id, "frecuencia", e.target.value)}
                    placeholder="..."
                    className="h-8 text-xs shadow-none text-center"
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