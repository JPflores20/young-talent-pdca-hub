import React from "react";
import { ActionPlanTable } from "../pdca-dialog/action-plan-table";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { GembaEvidenciasStep } from "../pdca-dialog/gemba-evidencias-step";
import { ImageUploadSection, MultiImageUploadSection } from "../image-upload-section";
import { EvidenciasSolucionStep } from "../pdca-dialog/evidencias-solucion-step";
import { TablaResultadosFinales } from "./tabla-resultados-finales";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../pdca-dialog/step-instructions";
import { Badge } from "@/components/ui/badge";
import type { ActionItem } from "@/data/pdca";
import type { ResultadosFinalesData } from "@/data/pdca-types";

interface PhaseActProps {
  action_items: ActionItem[];
  on_action_items_change: (items: ActionItem[]) => void;
  kpi_tree_foco_image?: string;
  on_kpi_tree_foco_image_change?: (img: string | undefined) => void;
  evidencias_solucion?: any[];
  on_evidencias_solucion_change?: (evs: any[]) => void;
  final_time_series_data: { mes: string; target: number; actual: number | null }[];
  on_final_time_series_change: (val: any) => void;
  final_time_series_unit: string;
  on_final_time_series_unit_change: (unit: string) => void;
  gemba_evidencias: string[];
  on_gemba_evidencias_change: (imgs: string[]) => void;
  gemba_final_images: string[];
  on_gemba_final_images_change: (imgs: string[]) => void;
  resultados_finales: ResultadosFinalesData;
  on_resultados_finales_change: (data: ResultadosFinalesData) => void;
  has_mapeo_proceso: boolean;
  on_has_mapeo_proceso_change: (val: boolean) => void;
  mapeo_proceso_image?: string;
  on_mapeo_proceso_image_change?: (img: string | undefined) => void;
  mapeo_proceso_desc?: string;
  on_mapeo_proceso_desc_change?: (desc: string | undefined) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
  is_editable: boolean;
}

export const PdcaPhaseAct: React.FC<PhaseActProps> = ({
  action_items,
  on_action_items_change,
  kpi_tree_foco_image,
  on_kpi_tree_foco_image_change,
  evidencias_solucion,
  on_evidencias_solucion_change,
  final_time_series_data,
  on_final_time_series_change,
  final_time_series_unit,
  on_final_time_series_unit_change,
  gemba_evidencias,
  on_gemba_evidencias_change,
  gemba_final_images,
  on_gemba_final_images_change,
  resultados_finales,
  on_resultados_finales_change,
  has_mapeo_proceso,
  on_has_mapeo_proceso_change,
  mapeo_proceso_image,
  on_mapeo_proceso_image_change,
  mapeo_proceso_desc,
  on_mapeo_proceso_desc_change,
  completed_steps,
  on_toggle_step,
  is_editable,
}) => {
  return (
    <div className="space-y-6">
      {/* PASO 8: Matriz de Impacto y Plan de Acción */}
      <ActionPlanTable
        items={action_items || []}
        onChange={on_action_items_change}
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
      />

      {/* PASO 9: Evidencias de Solución */}
      <EvidenciasSolucionStep
        kpiFocoImage={kpi_tree_foco_image}
        onKpiFocoImageChange={(img) => on_kpi_tree_foco_image_change?.(img)}
        actions={action_items || []}
        evidencias={evidencias_solucion || []}
        onEvidenciasChange={(evs) => on_evidencias_solucion_change?.(evs)}
        isStepCompleted={completed_steps.has("step-9")}
        onToggleStep={() => on_toggle_step("step-9")}
      />

      {/* PASO 10: Evolución de Resultados */}
      <div className="space-y-4">
        <TimeSeriesYTD
          value={final_time_series_data}
          onChange={on_final_time_series_change}
          unit={final_time_series_unit}
          onUnitChange={on_final_time_series_unit_change}
          title="PASO 10: EVOLUCIÓN DE RESULTADOS"
          chartTitle="EVOLUCIÓN DE RESULTADOS"
          isStepCompleted={completed_steps.has("step-10")}
          onToggleStep={() => on_toggle_step("step-10")}
        />

        <StepCard 
          title="RESULTADOS DE IMPACTO (PI / KPI)"
          headerRight={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
        >
          <TablaResultadosFinales
            data={resultados_finales || {}}
            onChange={on_resultados_finales_change}
          />
        </StepCard>

        <MultiImageUploadSection
          images={gemba_evidencias}
          onChange={on_gemba_evidencias_change}
          title="FOTOS DE RESULTADOS (PI's)"
          subtitle="Sube únicamente formato de imágenes/fotos de la evolución"
          description="Máximo 6 fotos."
          maxImages={6}
        />
      </div>

      {/* PASO 11: Gemba Final — Evidencia de Acciones */}
      <GembaEvidenciasStep
        images={gemba_final_images}
        onChange={on_gemba_final_images_change}
        title="PASO 11: EVIDENCIA DE ACCIONES (GEMBA FINAL)"
        description="Sube archivos, fotos o documentos que respalden la estandarización del proceso final."
        isStepCompleted={completed_steps.has("step-11")}
        onToggleStep={() => on_toggle_step("step-11")}
      />

      {/* PASO 13: Mapeo de Proceso (Opcional) */}
      <div className="border border-border rounded-xl p-4 bg-secondary/10 space-y-4">
        <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={has_mapeo_proceso}
            onChange={(e) => on_has_mapeo_proceso_change(e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          Habilitar Paso 13: Mapeo de Proceso
        </label>
        
        {has_mapeo_proceso && (
          <StepCard
            title="PASO 13: MAPEO DE PROCESO"
            isCompleted={completed_steps.has("step-13")}
            onToggleComplete={() => on_toggle_step("step-13")}
            headerRight={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
          >
            <StepInstructions>
              Documenta el proceso mapeado, incluye una descripción y adjunta el diagrama correspondiente.
            </StepInstructions>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">
                  Descripción del Proceso
                </label>
                <textarea
                  className="w-full min-h-[80px] text-sm p-3 border rounded-md shadow-sm focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Describe los detalles principales del mapeo de proceso..."
                  value={mapeo_proceso_desc || ""}
                  onChange={(e) => on_mapeo_proceso_desc_change(e.target.value)}
                />
              </div>
              <ImageUploadSection
                image={mapeo_proceso_image || null}
                onChange={(img) => on_mapeo_proceso_image_change(img || undefined)}
                title="DIAGRAMA DEL PROCESO"
                subtitle="Sube la imagen de tu diagrama o flujo"
              />
            </div>
          </StepCard>
        )}
      </div>

      <div className="pt-8 border-t border-border/50">
        <TimeSeriesYTD
          value={final_time_series_data}
          onChange={on_final_time_series_change}
          unit={final_time_series_unit}
          onUnitChange={on_final_time_series_unit_change}
          title="RESULTADO FINAL GLOBAL"
          chartTitle="RESULTADO FINAL (CURRENT TIMES)"
          isStepCompleted={completed_steps.has("step-final-results")}
          onToggleStep={() => on_toggle_step("step-final-results")}
          customBadge={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
        />
      </div>
    </div>
  );
};
