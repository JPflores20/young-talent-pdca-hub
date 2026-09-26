import React from "react";
import { TablaEstandarizacion } from "./tabla-estandarizacion";
import { AnalisisRiesgosProcesoTable } from "./analisis-riesgos-proceso-table";
import { StepCard } from "@/components/ui/step-card";
import { ImageUploadSection } from "../image-upload-section";
import { RichTextEditor } from "./rich-text-editor";
import { ConclusionesStep } from "./conclusiones-step";
import { ConclusionesKpiData, ConclusionesPiItem } from "@/data/pdca";

interface PhaseActProps {
  tabla_estandarizacion: any[];
  on_tabla_estandarizacion_change: (data: any[]) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: ((step_id: string) => void) | undefined;
  is_editable: boolean;

  sops_documentos_image?: string | undefined;
  on_sops_documentos_image_change?: ((img?: string) => void) | undefined;

  plan_entrenamiento_image?: string | undefined;
  on_plan_entrenamiento_image_change?: ((img?: string) => void) | undefined;

  plan_control_image?: string | undefined;
  on_plan_control_image_change?: ((img?: string) => void) | undefined;

  lecciones_aprendidas?: string | undefined;
  on_lecciones_aprendidas_change?: ((text: string) => void) | undefined;

  conclusiones_finales?: string | undefined;
  conclusiones_storyboard_image?: string | undefined;
  on_conclusiones_storyboard_image_change?: (img?: string) => void;
  on_conclusiones_finales_change?: ((text: string) => void) | undefined;
  conclusiones_kpi_data?: ConclusionesKpiData;
  on_conclusiones_kpi_data_change?: (data: ConclusionesKpiData) => void;
  conclusiones_pi_items?: ConclusionesPiItem[];
  on_conclusiones_pi_items_change?: (items: ConclusionesPiItem[]) => void;

  analisis_riesgos_estandarizacion?: any[] | undefined;
  on_analisis_riesgos_estandarizacion_change?: ((items: any[]) => void) | undefined;
}

export const PdcaPhaseAct: React.FC<PhaseActProps> = ({
  tabla_estandarizacion,
  on_tabla_estandarizacion_change,
  analisis_riesgos_estandarizacion,
  on_analisis_riesgos_estandarizacion_change,
  completed_steps, na_steps, on_toggle_step, on_toggle_na,
  is_editable,
  sops_documentos_image,
  on_sops_documentos_image_change,
  plan_entrenamiento_image,
  on_plan_entrenamiento_image_change,
  plan_control_image,
  on_plan_control_image_change,
  lecciones_aprendidas,
  on_lecciones_aprendidas_change,
  conclusiones_finales,
  on_conclusiones_finales_change,
  conclusiones_storyboard_image,
  on_conclusiones_storyboard_image_change,
  conclusiones_kpi_data,
  on_conclusiones_kpi_data_change,
  conclusiones_pi_items,
  on_conclusiones_pi_items_change,
}) => {
  return (
    <div className="space-y-6">
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PASO 25: EstandarizaciÃƒÂ³n de Procesos Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <StepCard
        title="PASO 25: ESTANDARIZACIÃƒâ€œN DE PROCESOS"
        isStepCompleted={completed_steps.has("step-25")}
        onToggleStep={() => on_toggle_step("step-25")}
        isNa={na_steps?.has("step-25")} onToggleNa={() => on_toggle_na?.("step-25")}
      >
        <TablaEstandarizacion
          items={tabla_estandarizacion || []}
          onChange={(items) => on_tabla_estandarizacion_change(items)}
        />
      </StepCard>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ ANÃƒÂLISIS DE RIESGOS DEL PROCESO Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <StepCard
        title="ANÃƒÂLISIS DE RIESGOS DEL PROCESO"
        isStepCompleted={completed_steps.has("step-riesgos-estandarizacion")}
        onToggleStep={() => on_toggle_step("step-riesgos-estandarizacion")}
        isNa={na_steps?.has("step-riesgos-estandarizacion")} onToggleNa={() => on_toggle_na?.("step-riesgos-estandarizacion")}
      >
        <AnalisisRiesgosProcesoTable
          items={analisis_riesgos_estandarizacion || []}
          onChange={(items) => on_analisis_riesgos_estandarizacion_change?.(items)}
        />
      </StepCard>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PASO 26: SOPs & Documentos Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <ImageUploadSection
        image={sops_documentos_image || null}
        onChange={(img) => on_sops_documentos_image_change?.(img || undefined)}
        title="PASO 26: SOPs & DOCUMENTOS"
        subtitle="Sube una imagen o documento de los SOPs"
        isStepCompleted={completed_steps.has("step-26")}
        onToggleStep={() => on_toggle_step("step-26")}
        isNa={na_steps?.has("step-26")} onToggleNa={() => on_toggle_na?.("step-26")}
      />

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PASO 27: Plan de Entrenamiento Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <ImageUploadSection
        image={plan_entrenamiento_image || null}
        onChange={(img) => on_plan_entrenamiento_image_change?.(img || undefined)}
        title="PASO 27: PLAN DE ENTRENAMIENTO"
        subtitle="Sube una imagen del plan de entrenamiento"
        isStepCompleted={completed_steps.has("step-27")}
        onToggleStep={() => on_toggle_step("step-27")}
        isNa={na_steps?.has("step-27")} onToggleNa={() => on_toggle_na?.("step-27")}
      />

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PASO 28: Plan de Control Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <ImageUploadSection
        image={plan_control_image || null}
        onChange={(img) => on_plan_control_image_change?.(img || undefined)}
        title="PASO 28: PLAN DE CONTROL"
        subtitle="Sube una imagen del plan de control"
        isStepCompleted={completed_steps.has("step-28")}
        onToggleStep={() => on_toggle_step("step-28")}
        isNa={na_steps?.has("step-28")} onToggleNa={() => on_toggle_na?.("step-28")}
      />

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PASO 29: Lecciones Aprendidas Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <StepCard
        title="PASO 29: LECCIONES APRENDIDAS"
        isStepCompleted={completed_steps.has("step-29")}
        onToggleStep={() => on_toggle_step("step-29")}
        isNa={na_steps?.has("step-29")} onToggleNa={() => on_toggle_na?.("step-29")}
      >
        <div className="p-4 space-y-3">
          <RichTextEditor
            value={lecciones_aprendidas || ""}
            onChange={(v) => on_lecciones_aprendidas_change?.(v)}
            disabled={!is_editable}
            placeholder="Documenta las lecciones aprendidas durante el proyecto PDCA..."
            minHeight="140px"
          />
        </div>
      </StepCard>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ PASO 30: Conclusiones Ã¢â€â‚¬Ã¢â€â‚¬ */}
      <ConclusionesStep
        isStepCompleted={completed_steps.has("step-30")}
        onToggleStep={() => on_toggle_step("step-30")}
        isNa={na_steps?.has("step-30")}
        onToggleNa={() => on_toggle_na?.("step-30")}
        isEditable={is_editable}
        kpiData={conclusiones_kpi_data}
        onKpiDataChange={(data) => on_conclusiones_kpi_data_change?.(data)}
        piItems={conclusiones_pi_items || []}
        onPiItemsChange={(items) => on_conclusiones_pi_items_change?.(items)}
        storyboardHtml={conclusiones_finales}
        onStoryboardHtmlChange={(html) => on_conclusiones_finales_change?.(html)}
        storyboardImage={conclusiones_storyboard_image}
        onStoryboardImageChange={(img) => on_conclusiones_storyboard_image_change?.(img)}
      />
    </div>
  );
};