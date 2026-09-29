import React from "react";
import { TablaEstandarizacion } from "./step-23-estandarizacion/tabla-estandarizacion";
import { AnalisisRiesgosProcesoTable } from "../01-plan/step-12-riesgos-proceso/analisis-riesgos-proceso-table";
import { StepCard } from "@/components/ui/step-card";
import { ImageUploadSection } from "@/components/image-upload-section";
import { RichTextEditor } from "../common/rich-text-editor";
import { ConclusionesStep } from "../03-check/step-22-conclusiones/conclusiones-step";
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
  conclusiones_kpi_data?: ConclusionesKpiData | undefined;
  on_conclusiones_kpi_data_change?: ((data: ConclusionesKpiData) => void) | undefined;
  conclusiones_pi_items?: ConclusionesPiItem[] | undefined;
  on_conclusiones_pi_items_change?: ((items: ConclusionesPiItem[]) => void) | undefined;

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
      {/* ── PASO 27: Estandarización de Procesos ── */}
      <StepCard
        title="PASO 27: ESTANDARIZACIÓN DE PROCESOS"
        isStepCompleted={completed_steps.has("step-28")}
        onToggleStep={() => on_toggle_step("step-28")}
        isNa={na_steps?.has("step-28")} onToggleNa={() => on_toggle_na?.("step-28")}
      >
        <TablaEstandarizacion
          items={tabla_estandarizacion || []}
          onChange={(items) => on_tabla_estandarizacion_change(items)}
        />
      </StepCard>

      {/* ── PASO 28: Análisis de Riesgos ── */}
      <StepCard
        title="PASO 28: ANÁLISIS DE RIESGOS DEL PROCESO"
        isStepCompleted={completed_steps.has("step-29")}
        onToggleStep={() => on_toggle_step("step-29")}
        isNa={na_steps?.has("step-29")} onToggleNa={() => on_toggle_na?.("step-29")}
      >
        <AnalisisRiesgosProcesoTable
          items={analisis_riesgos_estandarizacion || []}
          onChange={(items) => on_analisis_riesgos_estandarizacion_change?.(items)}
        />
      </StepCard>

      {/* ── PASO 29: SOPs & Documentos ── */}
      <ImageUploadSection
        image={sops_documentos_image || null}
        onChange={(img) => on_sops_documentos_image_change?.(img || undefined)}
        title="PASO 29: SOPS & DOCUMENTOS"
        subtitle="Sube una imagen o documento de los SOPs"
        isStepCompleted={completed_steps.has("step-30")}
        onToggleStep={() => on_toggle_step("step-30")}
        isNa={na_steps?.has("step-30")} onToggleNa={() => on_toggle_na?.("step-30")}
      />

      {/* ── PASO 30: Plan de Entrenamiento ── */}
      <ImageUploadSection
        image={plan_entrenamiento_image || null}
        onChange={(img) => on_plan_entrenamiento_image_change?.(img || undefined)}
        title="PASO 30: PLAN DE ENTRENAMIENTO"
        subtitle="Sube una imagen del plan de entrenamiento"
        isStepCompleted={completed_steps.has("step-31")}
        onToggleStep={() => on_toggle_step("step-31")}
        isNa={na_steps?.has("step-31")} onToggleNa={() => on_toggle_na?.("step-31")}
      />

      {/* ── PASO 31: Plan de Control ── */}
      <ImageUploadSection
        image={plan_control_image || null}
        onChange={(img) => on_plan_control_image_change?.(img || undefined)}
        title="PASO 31: PLAN DE CONTROL"
        subtitle="Sube una imagen del plan de control"
        isStepCompleted={completed_steps.has("step-32")}
        onToggleStep={() => on_toggle_step("step-32")}
        isNa={na_steps?.has("step-32")} onToggleNa={() => on_toggle_na?.("step-32")}
      />

      {/* ── PASO 32: Lecciones Aprendidas ── */}
      <StepCard
        title="PASO 32: LECCIONES APRENDIDAS"
        isStepCompleted={completed_steps.has("step-33")}
        onToggleStep={() => on_toggle_step("step-33")}
        isNa={na_steps?.has("step-33")} onToggleNa={() => on_toggle_na?.("step-33")}
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

      {/* ── PASO 33: Conclusiones ── */}
      <ConclusionesStep
        isStepCompleted={completed_steps.has("step-34")}
        onToggleStep={() => on_toggle_step("step-34")}
        isNa={na_steps?.has("step-34") ?? false}
        onToggleNa={() => on_toggle_na?.("step-34")}
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
