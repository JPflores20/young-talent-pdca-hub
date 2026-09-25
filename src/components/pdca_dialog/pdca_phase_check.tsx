import React from "react";
import { StepCard } from "@/components/ui/step-card";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { ImageUploadSection } from "../image-upload-section";
import { PruebasEjecutadasTable } from "./pruebas-ejecutadas-table";
import { NuevoPerformanceTable } from "./nuevo-performance-table";

interface PhaseCheckProps {
  final_time_series_data: { mes: string; target: number; actual: number | null }[];
  on_final_time_series_data_change: (val: any) => void;
  final_time_series_unit: string;
  on_final_time_series_unit_change: (unit: string) => void;
  final_time_series_title?: string | undefined;
  on_final_time_series_title_change?: ((title: string) => void) | undefined;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: ((step_id: string) => void) | undefined;
  
  nuevo_performance_image?: string | undefined;
  on_nuevo_performance_image_change?: ((img?: string) => void) | undefined;
  mapeo_proceso_image?: string | undefined;
  on_mapeo_proceso_image_change?: ((img?: string) => void) | undefined;
  pruebas_ejecutadas?: any[] | undefined;
  on_pruebas_ejecutadas_change?: ((items: any[]) => void) | undefined;
  nuevo_performance?: any[] | undefined;
  on_nuevo_performance_change?: ((items: any[]) => void) | undefined;
}

export const PdcaPhaseCheck: React.FC<PhaseCheckProps> = ({
  final_time_series_data,
  on_final_time_series_data_change,
  final_time_series_unit,
  on_final_time_series_unit_change,
  final_time_series_title,
  on_final_time_series_title_change,
  completed_steps, na_steps, on_toggle_step, on_toggle_na,
  nuevo_performance_image,
  on_nuevo_performance_image_change,
  mapeo_proceso_image,
  on_mapeo_proceso_image_change,
  pruebas_ejecutadas,
  on_pruebas_ejecutadas_change,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 21: Nuevo Performance ────────────── */}
      <ImageUploadSection
        image={nuevo_performance_image || null}
        onChange={(img) => on_nuevo_performance_image_change?.(img || undefined)}
        title="PASO 21: NUEVO PERFORMANCE DEL PROCESO (ANALISIS DE PIS DESPUES DE IMPLEMENTACION)"
        subtitle="Sube una imagen del análisis de PIs"
        isStepCompleted={completed_steps.has("step-21")}
        onToggleStep={() => on_toggle_step("step-21")}
        isNa={na_steps?.has("step-21")} onToggleNa={() => on_toggle_na?.("step-21")}
      />

      {/* ── PASO 22: Mapeo Proceso ────────────── */}
      <ImageUploadSection
        image={mapeo_proceso_image || null}
        onChange={(img) => on_mapeo_proceso_image_change?.(img || undefined)}
        title="PASO 22: MAPEO PROCESO (DESPUES DE IMPLEMENTACION)"
        subtitle="Sube una imagen del nuevo flujo de proceso"
        isStepCompleted={completed_steps.has("step-22")}
        onToggleStep={() => on_toggle_step("step-22")}
        isNa={na_steps?.has("step-22")} onToggleNa={() => on_toggle_na?.("step-22")}
      />

      {/* ── PASO 23: Pruebas ejecutadas ───────────────────────── */}
      <PruebasEjecutadasTable
        items={pruebas_ejecutadas || []}
        onChange={on_pruebas_ejecutadas_change!}
        isStepCompleted={completed_steps.has("step-23")}
        onToggleStep={() => on_toggle_step("step-23")}
        isNa={na_steps?.has("step-23")} onToggleNa={() => on_toggle_na?.("step-23")}
      />

      {/* ── PASO 24: Evolución de PI'S ──────────────────────────────────── */}
      <div className="border border-border rounded-xl p-4 bg-secondary/10">
        <TimeSeriesYTD
          value={final_time_series_data}
          onChange={on_final_time_series_data_change}
          unit={final_time_series_unit}
          onUnitChange={on_final_time_series_unit_change}
          title="PASO 24: EVOLUCION EN EL RESULTADO DEL KPI"
          chartTitle={final_time_series_title}
          onTitleChange={on_final_time_series_title_change}
          isStepCompleted={completed_steps.has("step-24")}
          onToggleStep={() => on_toggle_step("step-24")}
          isNa={na_steps?.has("step-24")} onToggleNa={() => on_toggle_na?.("step-24")}
        />
      </div>
    </div>
  );
};
