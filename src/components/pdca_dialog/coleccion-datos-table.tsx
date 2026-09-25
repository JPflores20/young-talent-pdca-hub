import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepCard } from "@/components/ui/step-card";
import type { ColeccionDatosItem } from "@/data/pdca";

interface ColeccionDatosTableProps {
  items: ColeccionDatosItem[];
  onChange: (items: ColeccionDatosItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

const HEADER_BG = "bg-[#0078D7] text-white font-bold text-center text-xs uppercase";
const GROUP_BG = "bg-[#005A9E] text-white font-bold text-center text-xs uppercase";
const CELL = "p-1 border border-gray-200";

export const ColeccionDatosTable: React.FC<ColeccionDatosTableProps> = ({
  items,
  onChange,
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
}) => {
  const handleAdd = () => {
    const newItem: ColeccionDatosItem = {
      id: crypto.randomUUID(),
      xs_ys: "",
      variable: "",
      tipo_dato: "",
      definicion_operacional: "",
      metodo_medicion: "",
      estratificacion: "",
      metodo_recoleccion: "",
      quien: "",
      tipo_muestreo: "",
      cuantos: "",
      cada_cuando: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, field: keyof ColeccionDatosItem, value: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 9: DATA COLLECTION PLAN"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <table className="min-w-[1100px] w-full text-xs border-collapse">
            <thead>
              {/* Row 1: Group headers */}
              <tr>
                <th colSpan={4} className={`${GROUP_BG} border border-white/30 py-2 px-3`}>
                  ¿QUÉ MEDIR?
                </th>
                <th colSpan={3} className={`${GROUP_BG} border border-white/30 py-2 px-3`}>
                  ¿CÓMO MEDIRLO?
                </th>
                <th colSpan={4} className={`${GROUP_BG} border border-white/30 py-2 px-3`}>
                  PLAN DE MUESTREO
                </th>
                <th className="border border-white/30 bg-[#005A9E] w-10" />
              </tr>
              {/* Row 2: Column headers */}
              <tr>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[70px]`}>X'S O Y'S</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[100px]`}>VARIABLE</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[90px]`}>TIPO DE DATO</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[150px]`}>DEFINICIÓN OPERACIONAL</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[150px]`}>MÉTODO DE MEDICIÓN</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[150px]`}>ESTRATIFICACIÓN</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[150px]`}>MÉTODO DE RECOLECCIÓN</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[90px]`}>QUIÉN</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[90px]`}>TIPO DE MUESTREO</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[70px]`}>CUÁNTOS</th>
                <th className={`${HEADER_BG} border border-white/20 py-1.5 px-2 min-w-[90px]`}>CADA CUÁNDO</th>
                <th className="bg-[#0078D7] border border-white/20 w-10" />
              </tr>
            </thead>
            <tbody>
              {(!items || items.length === 0) && (
                <tr>
                  <td colSpan={12} className="text-center py-6 text-muted-foreground">
                    No hay registros en la colección de datos. Agrega uno.
                  </td>
                </tr>
              )}
              {items?.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {(
                    [
                      { field: "xs_ys", placeholder: "X1, Y1..." },
                      { field: "variable", placeholder: "Ej. Smokey" },
                      { field: "tipo_dato", placeholder: "Ej. Dato continuo" },
                      { field: "definicion_operacional", placeholder: "Ej. Recepción de Arroz" },
                      { field: "metodo_medicion", placeholder: "Ej. Catado Ok-Nook" },
                      { field: "estratificacion", placeholder: "Ej. Medición de cada lote..." },
                      { field: "metodo_recoleccion", placeholder: "Ej. Sensory One" },
                      { field: "quien", placeholder: "Ej. Operador" },
                      { field: "tipo_muestreo", placeholder: "Ej. Proceso" },
                      { field: "cuantos", placeholder: "Ej. 6 Meses" },
                      { field: "cada_cuando", placeholder: "Ej. Diario" },
                    ] as { field: keyof ColeccionDatosItem; placeholder: string }[]
                  ).map(({ field, placeholder }) => (
                    <td key={String(field)} className={CELL}>
                      <Input
                        value={(item[field] as string) ?? ""}
                        onChange={(e) => handleUpdate(item.id, field, e.target.value)}
                        placeholder={placeholder}
                        className="h-7 text-xs shadow-none border-0 bg-transparent focus-visible:ring-0 px-1"
                      />
                    </td>
                  ))}
                  <td className={`${CELL} text-center`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StepCard>
  );
};
