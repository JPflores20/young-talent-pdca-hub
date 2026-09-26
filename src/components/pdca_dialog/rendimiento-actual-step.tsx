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
import { StepInstructions } from "../pdca-dialog/step-instructions";
import { ImageUploadSection } from "../image-upload-section";
import type { RendimientoActualPiItem } from "@/data/pdca";

interface RendimientoActualStepProps {
  items: RendimientoActualPiItem[];
  onChange?: (items: RendimientoActualPiItem[]) => void;
  image: string | undefined;
  onImageChange?: (image: string | undefined) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const RendimientoActualStep: React.FC<RendimientoActualStepProps> = ({
  items,
  onChange,
  image,
  onImageChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}) => {
  const handleAdd = () => {
    const newItem: RendimientoActualPiItem = {
      id: crypto.randomUUID(),
      estacionTrabajo: "",
      nombreIndicador: "",
      estadoActual: "",
      puestoResponsable: "",
      herramienta: "",
      ubicacion: "",
    };
    onChange?.([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof RendimientoActualPiItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange?.(newItems);
  };

  const handleDelete = (id: string) => {
    onChange?.(items.filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 13: RENDIMIENTO ACTUAL DEL PROCESO"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Determinar las PI que serán analizadas. Idealmente, estos serán asignados a los Operadores o Técnicos en las estaciones de trabajo de los Operadores relevantes. En algunos casos, puede tener sentido que el equipo PDCA/ITF rastree un PI en particular.</li>
          <li>Enumere los PIs a ser rastreados.</li>
          <li>Prepare los gráficos SIC necesarios (ya sea en versión digital o en papel/pizarra).</li>
          <li>Incluya planes de reacción para cualquier PI que deban rastrear los operadores/técnicos. Comunicar los SIC a las estaciones de trabajo impactadas, explicando por qué el equipo necesita la ayuda del Operador/Técnico para rastrear el PI, cómo debe llenarse el SIC, asegurándose de que se entienda el Plan de Reacción, cualquier información adicional que pueda ser útil, etc.</li>
          <li>Incluya fotos o capturas de pantalla de cualquier Carta SIC del Operador/Técnico en el espacio de abajo.</li>
          <li>Si el equipo del PDCA/ITF va a realizar el seguimiento de un SIC, utilice cualquier herramienta gráfica apropiada disponible aquí en Excel y el espacio en esta pestaña para el gráfico, así como los datos en bruto.</li>
        </ol>
      </StepInstructions>

      <div className="space-y-6 mt-4">
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
                  <TableHead className="font-bold text-white text-center border-r border-white/20">Estación de trabajo de operador o técnico</TableHead>
                  <TableHead className="font-bold text-white text-center border-r border-white/20">Nombre de Indicador</TableHead>
                  <TableHead className="font-bold text-white text-center border-r border-white/20">Estado Actual</TableHead>
                  <TableHead className="font-bold text-white text-center border-r border-white/20">Puesto Responsable</TableHead>
                  <TableHead className="font-bold text-white text-center border-r border-white/20">Herramienta en la que se Encuentra</TableHead>
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

        <div>
          <h4 className="text-sm font-bold text-slate-700 uppercase mb-2">Cartas SIC / Gráficos</h4>
          <ImageUploadSection
            image={image || null}
            onChange={(val) => onImageChange?.(val || undefined)}
            title="Sube fotos o capturas de pantalla"
            
          />
        </div>
      </div>
    </StepCard>
  );
};
