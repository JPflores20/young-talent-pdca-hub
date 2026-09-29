import React from "react";
import { StepCard } from "@/components/ui/step-card";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { ImageUploadSection } from "../image-upload-section";
import { ParetoSection } from "@/components/pdca-dialog/pareto-section";
import { FlavorCorrelationSection } from "@/components/pdca-dialog/flavor-correlation-section";
import { PruebasEjecutadasTable } from "./pruebas-ejecutadas-table";
import { NuevoPerformanceTable } from "./nuevo-performance-table";

interface PhaseCheckProps {
  final_time_series_data: { mes: string; target: number; actual: number | null }[];
  on_final_time_series_data_change: (val: any) => void;
  final_time_series_unit: string;
  on_final_time_series_unit_change: (unit: string) => void;
  final_time_series_title?: string | undefined;
  on_final_time_series_title_change?: ((title: string) => void) | undefined;
  final_time_series_ymin?: number | undefined;
  on_final_time_series_ymin_change?: ((val: number) => void) | undefined;
  final_time_series_ymax?: string | undefined;
  on_final_time_series_ymax_change?: ((val: string) => void) | undefined;
  completed_steps: Set<string>;
  na_steps?: Set<string> | undefined;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: ((step_id: string) => void) | undefined;
  
  nuevo_performance_image?: string | undefined;
  on_nuevo_performance_image_change?: ((img?: string) => void) | undefined;
  nuevo_pareto_image?: string | undefined;
  on_nuevo_pareto_image_change?: ((img?: string) => void) | undefined;
  nueva_correlacion_image?: string | undefined;
  on_nueva_correlacion_image_change?: ((img?: string) => void) | undefined;
  mapeo_proceso_image?: string | undefined;
  on_mapeo_proceso_image_change?: ((img?: string) => void) | undefined;
  pruebas_ejecutadas?: any[] | undefined;
  on_pruebas_ejecutadas_change?: ((items: any[]) => void) | undefined;
  nuevo_performance?: any[] | undefined;
  on_nuevo_performance_change?: ((items: any[]) => void) | undefined;
  nuevo_pareto_drill_downs?: string[];
  on_nuevo_pareto_drill_downs_change?: (d: string[]) => void;
  nuevo_pareto_data_map?: Record<string, any[]>;
  on_nuevo_pareto_data_map_change?: (m: Record<string, any[]>) => void;
  nuevo_pareto_unit?: string;
  on_nuevo_pareto_unit_change?: (u: string) => void;
  nuevo_pareto_titles?: Record<string, string>;
  on_nuevo_pareto_titles_change?: (t: Record<string, string>) => void;
  has_nueva_correlacion?: boolean;
  on_has_nueva_correlacion_change?: (val: boolean) => void;
  nueva_correlacion_data?: any[];
  on_nueva_correlacion_data_change?: (d: any[]) => void;
}

export const PdcaPhaseCheck: React.FC<PhaseCheckProps> = ({
  final_time_series_data,
  on_final_time_series_data_change,
  final_time_series_unit,
  on_final_time_series_unit_change,
  final_time_series_title,
  on_final_time_series_title_change,
  final_time_series_ymin,
  on_final_time_series_ymin_change,
  final_time_series_ymax,
  on_final_time_series_ymax_change,
  completed_steps, na_steps, on_toggle_step, on_toggle_na,
  nuevo_performance_image,
  on_nuevo_performance_image_change,
  nuevo_pareto_image,
  on_nuevo_pareto_image_change,
  nueva_correlacion_image,
  on_nueva_correlacion_image_change,
  mapeo_proceso_image,
  on_mapeo_proceso_image_change,
  pruebas_ejecutadas,
  on_pruebas_ejecutadas_change,
  nuevo_pareto_drill_downs,
  on_nuevo_pareto_drill_downs_change,
  nuevo_pareto_data_map,
  on_nuevo_pareto_data_map_change,
  nuevo_pareto_unit,
  on_nuevo_pareto_unit_change,
  nuevo_pareto_titles,
  on_nuevo_pareto_titles_change,
  has_nueva_correlacion,
  on_has_nueva_correlacion_change,
  nueva_correlacion_data,
  on_nueva_correlacion_data_change,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 21: Nuevo Performance ────────────────────────────── */}
      <ImageUploadSection
        image={nuevo_performance_image || null}
        onChange={(img) => on_nuevo_performance_image_change?.(img || undefined)}
        title="PASO 21: NUEVO PERFORMANCE DEL PROCESO ( ANÁLISIS DE PIs)"
        subtitle="Sube una imagen del análisis de PIs"
        isStepCompleted={completed_steps.has("step-22")}
        onToggleStep={() => on_toggle_step("step-22")}
        isNa={na_steps?.has("step-22")} onToggleNa={() => on_toggle_na?.("step-22")}
      />

      {/* ── PASO 22: Mapeo Proceso ────────────────────────────── */}
      <ImageUploadSection
        image={mapeo_proceso_image || null}
        onChange={(img) => on_mapeo_proceso_image_change?.(img || undefined)}
        title="PASO 22: NUEVO MAPEO DE PROCESOS"
        subtitle="Sube una imagen del nuevo flujo de proceso"
        isStepCompleted={completed_steps.has("step-23")}
        onToggleStep={() => on_toggle_step("step-23")}
        isNa={na_steps?.has("step-23")} onToggleNa={() => on_toggle_na?.("step-23")}
      />

      {/* ── PASO 23: Pruebas ejecutadas ───────────────────────── */}
      <PruebasEjecutadasTable
        items={pruebas_ejecutadas || []}
        onChange={on_pruebas_ejecutadas_change!}
        isStepCompleted={completed_steps.has("step-24")}
        onToggleStep={() => on_toggle_step("step-24")}
        isNa={na_steps?.has("step-24")} onToggleNa={() => on_toggle_na?.("step-24")}
      />

      {/* ── PASO 24: Nuevo Pareto ────────────────────────────── */}
      <ParetoSection
        drillDowns={nuevo_pareto_drill_downs || []}
        setDrillDowns={on_nuevo_pareto_drill_downs_change!}
        dataMap={nuevo_pareto_data_map || {}}
        setDataMap={on_nuevo_pareto_data_map_change!}
        unit={nuevo_pareto_unit || ""}
        onUnitChange={on_nuevo_pareto_unit_change!}
        isStepCompleted={completed_steps.has("step-25")}
        onToggleStep={() => on_toggle_step("step-25")}
        isNa={na_steps?.has("step-25")} onToggleNa={() => on_toggle_na?.("step-25")}
        paretoTitles={nuevo_pareto_titles || {}}
        onParetoTitlesChange={on_nuevo_pareto_titles_change!}
        mainTitle="PASO 24: NUEVO PARETO"
        secondaryTitlePrefix="PASO 24: NUEVO PARETO INDEPENDIENTE"
      />

      {/* ── PASO 25: Nueva Correlaciones ─────────────────────── */}
      <FlavorCorrelationSection
        title="PASO 25: NUEVAS CORRELACIONES"
        isStepCompleted={completed_steps.has("step-26")}
        onToggleStep={() => on_toggle_step("step-26")}
        isNa={na_steps?.has("step-26")} onToggleNa={() => on_toggle_na?.("step-26")}
      />

      {/* ── PASO 26: Evolución de KPIs ───────────────────────── */}
      <TimeSeriesYTD
        value={final_time_series_data}
        onChange={on_final_time_series_data_change}
        unit={final_time_series_unit}
        onUnitChange={on_final_time_series_unit_change}
        title="PASO 26: EVOLUCIÓN DE KPIs"
        chartTitle={final_time_series_title}
        onTitleChange={on_final_time_series_title_change}
        yMin={final_time_series_ymin}
        onYMinChange={on_final_time_series_ymin_change}
        yMax={final_time_series_ymax}
        onYMaxChange={on_final_time_series_ymax_change}
        isStepCompleted={completed_steps.has("step-27")}
        onToggleStep={() => on_toggle_step("step-27")}
        isNa={na_steps?.has("step-27")} onToggleNa={() => on_toggle_na?.("step-27")}
      />
    </div>
  );
};
