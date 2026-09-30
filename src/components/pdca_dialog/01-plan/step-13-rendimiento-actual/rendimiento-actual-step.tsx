import React, { useState } from "react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "@/components/pdca_dialog/common/step-instructions";
import type { RendimientoActualPiItem } from "@/data/pdca";
import { RendimientoActualTable } from "./rendimiento-actual-table";
import { RendimientoActualEvidences } from "./rendimiento-actual-evidences";

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
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}) => {
  const [uploadingRows, setUploadingRows] = useState<Set<string>>(new Set());

  const handleAdd = () => {
    const newItem: RendimientoActualPiItem = {
      id: crypto.randomUUID(),
      estacionTrabajo: "",
      nombreIndicador: "",
      estadoActual: "",
      puestoResponsable: "",
      herramienta: "",
      ubicacion: "",
      evidencia: "",
    };
    onChange?.([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof RendimientoActualPiItem, value: string) => {
    const newItems = (items || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange?.(newItems);
  };

  const handleDelete = (id: string) => {
    onChange?.((items || []).filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 13: PERFORMANCE ACTUAL DEL PROCESO ( ANÁLISIS DE PIS)"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>
            Determinar las PI que serán analizadas. Idealmente, estos serán asignados a los Operadores o
            Técnicos en las estaciones de trabajo de los Operadores relevantes. En algunos casos, puede
            tener sentido que el equipo PDCA/ITF rastree un PI en particular.
          </li>
          <li>Enumere los PIs a ser rastreados.</li>
          <li>Prepare los gráficos SIC necesarios (ya sea en versión digital o en papel/pizarra).</li>
          <li>
            Incluya planes de reacción para cualquier PI que deban rastrear los operadores/técnicos.
            Comunicar los SIC a las estaciones de trabajo impactadas, explicando por qué el equipo
            necesita la ayuda del Operador/Técnico para rastrear el PI, cómo debe llenarse el SIC,
            asegurándose de que se entienda el Plan de Reacción, cualquier información adicional que
            pueda ser útil, etc.
          </li>
          <li>
            Incluya fotos o capturas de pantalla de cualquier Carta SIC del Operador/Técnico en el
            espacio de abajo.
          </li>
          <li>
            Si el equipo del PDCA/ITF va a realizar el seguimiento de un SIC, utilice cualquier
            herramienta gráfica apropiada disponible aquí en Excel y el espacio en esta pestaña para
            el gráfico, así como los datos en bruto.
          </li>
        </ol>
      </StepInstructions>

      <div className="space-y-6 mt-4">
        <RendimientoActualTable
          items={items || []}
          handleAdd={handleAdd}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
        />

        <RendimientoActualEvidences
          items={items || []}
          uploadingRows={uploadingRows}
          setUploadingRows={setUploadingRows}
          handleUpdate={handleUpdate}
        />
      </div>
    </StepCard>
  );
};
