import React from "react";
import { ActionKanban } from "../action-kanban";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { ImageUploadSection } from "../image-upload-section";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../pdca-dialog/step-instructions";
import type { ActionItem } from "@/data/pdca";

interface PhaseActProps {
  action_items: ActionItem[];
  on_action_items_change: (items: ActionItem[]) => void;
  kpi_final_result_data: { mes: string; target: number; actual: number | null }[];
  on_kpi_final_result_change: (val: any) => void;
  kpi_final_result_unit: string;
  on_kpi_final_result_unit_change: (unit: string) => void;
  gemba_final_image: string | null;
  on_gemba_final_image_change: (img: string | null) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
  is_editable: boolean;
}

export const PdcaPhaseAct: React.FC<PhaseActProps> = ({
  action_items, on_action_items_change,
  kpi_final_result_data, on_kpi_final_result_change,
  kpi_final_result_unit, on_kpi_final_result_unit_change,
  gemba_final_image, on_gemba_final_image_change,
  completed_steps, on_toggle_step,
  is_editable,
}) => {
  return (
    <div className="space-y-6">
      <StepCard
        title="PASO 8: PLAN DE ACCIÓN (KANBAN)"
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
      >
        <StepInstructions>
          <p className="mb-2"><strong>8. PLAN DE ACCIÓN:</strong> Gestiona las acciones acordadas para eliminar las causas raíz identificadas.</p>
          <p>Arrastra las tarjetas entre columnas para actualizar su estatus.</p>
        </StepInstructions>
        <div className="mt-4">
          <ActionKanban
            acciones={action_items || []}
            setAcciones={(updater) => on_action_items_change(updater(action_items || []))}
          />
        </div>
      </StepCard>

      <StepCard
        title="PASO 9: ESTANDARIZACIÓN Y RESULTADOS FINALES"
        isStepCompleted={completed_steps.has("step-9")}
        onToggleStep={() => on_toggle_step("step-9")}
      >
        <StepInstructions>
          <p className="mb-2"><strong>9. ESTANDARIZACIÓN:</strong> Registra los resultados finales y la evidencia de Gemba que valida la efectividad del PDCA.</p>
        </StepInstructions>

        <div className="space-y-6 mt-4">
          <TimeSeriesYTD
            value={kpi_final_result_data}
            onChange={on_kpi_final_result_change}
            unit={kpi_final_result_unit}
            onUnitChange={on_kpi_final_result_unit_change}
          />

          <ImageUploadSection
            image={gemba_final_image}
            onChange={on_gemba_final_image_change}
            title="Evidencia Final en Gemba"
            description="Adjunta una fotografía o comprobante de la estandarización física en la línea de producción."
          />
        </div>
      </StepCard>
    </div>
  );
};
