import React from "react";
import { ActionPlanTable } from "../pdca-dialog/action-plan-table";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { GembaEvidenciasStep } from "../pdca-dialog/gemba-evidencias-step";
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
  gemba_evidencias: string[];
  on_gemba_evidencias_change: (imgs: string[]) => void;
  gemba_final_images: string[];
  on_gemba_final_images_change: (imgs: string[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
  is_editable: boolean;
}

export const PdcaPhaseAct: React.FC<PhaseActProps> = ({
  action_items,
  on_action_items_change,
  kpi_final_result_data,
  on_kpi_final_result_change,
  kpi_final_result_unit,
  on_kpi_final_result_unit_change,
  gemba_evidencias,
  on_gemba_evidencias_change,
  gemba_final_images,
  on_gemba_final_images_change,
  completed_steps,
  on_toggle_step,
  is_editable,
}) => {
  return (
    <div className="space-y-6">
      {/* PASO 8: Matriz de Impacto y Plan de Acción (tabla) */}
      <ActionPlanTable
        items={action_items || []}
        onChange={on_action_items_change}
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
      />

      {/* PASO 9: Gemba — Evidencias multi-foto */}
      <GembaEvidenciasStep
        images={gemba_evidencias}
        onChange={on_gemba_evidencias_change}
        isStepCompleted={completed_steps.has("step-9")}
        onToggleStep={() => on_toggle_step("step-9")}
      />

      {/* PASO 10: KPI Final Result */}
      <TimeSeriesYTD
        value={kpi_final_result_data}
        onChange={on_kpi_final_result_change}
        unit={kpi_final_result_unit}
        onUnitChange={on_kpi_final_result_unit_change}
        title="PASO 10: KPI FINAL RESULT"
        chartTitle="KPI FINAL RESULT"
        isStepCompleted={completed_steps.has("step-10")}
        onToggleStep={() => on_toggle_step("step-10")}
      />

      {/* PASO 11: Gemba Final — Evidencia de Acciones */}
      <GembaEvidenciasStep
        images={gemba_final_images}
        onChange={on_gemba_final_images_change}
        title="PASO 11: EVIDENCIA DE ACCIONES"
        description="Sube archivos, fotos o documentos que respalden la estandarización del proceso final."
        isStepCompleted={completed_steps.has("step-11")}
        onToggleStep={() => on_toggle_step("step-11")}
      />
    </div>
  );
};
