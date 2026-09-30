import React from "react";
import { ImageUploadSection, MultiImageUploadSection, ALL_ACCEPT_STRING } from "@/components/image-upload-section";
import { ParetoSection } from "./step-03-pareto/pareto-section";
import { IshikawaSection } from "./step-04-ishikawa/ishikawa-section";
import { FiveWhysSection } from "./step-05-cinco-porques/five-whys-section";
import { FlavorCorrelationSection } from "./step-06-correlacion/flavor-correlation-section";
import { GopThemesSection } from "./step-07-gops/GopThemesSection";
import { ColeccionDatosTable } from "./step-08-coleccion-datos/coleccion-datos-table";
import { VozConsumidorTable } from "./step-09-voz-consumidor/voz-consumidor-table";
import { AnalisisRiesgosTable } from "./step-11-analisis-riesgos/analisis-riesgos-table";
import { RendimientoActualStep } from "./step-13-rendimiento-actual/rendimiento-actual-step";
import { ConclusionesCausaRaizTable } from "./step-14-conclusiones-causa-raiz/conclusiones-causa-raiz-table";
import type { PhasePlanProps } from "./pdca-phase-plan-types";

export const PdcaPhasePlanSubphase2: React.FC<PhasePlanProps> = ({
  process_mapping_files,
  sipoc_map_files,
  on_sipoc_map_files_change,
  on_process_mapping_files_change,
  baseline_image,
  on_baseline_image_change,
  coleccion_datos,
  on_coleccion_datos_change,
  pareto_drill_downs,
  on_pareto_drill_downs_change,
  pareto_data_map,
  on_pareto_data_map_change,
  pareto_unit,
  on_pareto_unit_change,
  pareto_titles,
  on_pareto_titles_change,
  ishikawas,
  on_ishikawas_change,
  five_whys_tables,
  on_five_whys_tables_change,
  voz_consumidor,
  on_voz_consumidor_change,
  analisis_riesgos_proyecto,
  on_analisis_riesgos_proyecto_change,
  especificacion_procesos_image,
  on_especificacion_procesos_image_change,
  benchmark_image,
  on_benchmark_image_change,
  conclusiones_causa_raiz,
  on_conclusiones_causa_raiz_change,
  has_flavor_correlation,
  set_has_flavor_correlation,
  gop_themes_data,
  on_gop_themes_data_change,
  rendimiento_actual_pis,
  on_rendimiento_actual_pis_change,
  rendimiento_actual_image,
  on_rendimiento_actual_image_change,
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 8: Línea base ──────────────────────────────────────── */}
      <ImageUploadSection
        image={baseline_image || null}
        onChange={(img) => on_baseline_image_change?.(img || undefined)}
        title="PASO 8: LÍNEA BASE"
        subtitle="Sube una imagen representativa del baseline"
        isStepCompleted={completed_steps.has("step-7")}
        onToggleStep={() => on_toggle_step("step-7")}
        isNa={na_steps?.has("step-7")}
        onToggleNa={() => on_toggle_na?.("step-7")}
      />

      {/* ── PASO 9: Data collection Plan ────────────────────────────── */}
      <ColeccionDatosTable 
        items={coleccion_datos || []}
        onChange={(d) => on_coleccion_datos_change?.(d)}
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
        isNa={na_steps?.has("step-8")}
        onToggleNa={() => on_toggle_na?.("step-8")}
      />

      {/* ── PASO 10: Pareto ──────────────────────────────────────────── */}
      <ParetoSection
        drillDowns={pareto_drill_downs || []}
        setDrillDowns={on_pareto_drill_downs_change!}
        dataMap={pareto_data_map || {}}
        setDataMap={on_pareto_data_map_change!}
        unit={pareto_unit || ""}
        onUnitChange={on_pareto_unit_change!}
        paretoTitles={pareto_titles}
        onParetoTitlesChange={on_pareto_titles_change}
        isStepCompleted={completed_steps.has("step-9")}
        onToggleStep={() => on_toggle_step("step-9")}
        isNa={na_steps?.has("step-9")}
        onToggleNa={() => on_toggle_na?.("step-9")}
      />

      {/* ── PASO 11: Voz del Consumidor (VOC) ───────────────────────── */}
      <VozConsumidorTable
        items={voz_consumidor || []}
        onChange={(d) => on_voz_consumidor_change?.(d)}
        isStepCompleted={completed_steps.has("step-10")}
        onToggleStep={() => on_toggle_step("step-10")}
        isNa={na_steps?.has("step-10")}
        onToggleNa={() => on_toggle_na?.("step-10")}
      />

      {/* ── PASO 12: SIPOC Map / Process Mapping ──────────────────────── */}
      <MultiImageUploadSection
        images={sipoc_map_files || []}
        onChange={(urls) => on_sipoc_map_files_change?.(urls)}
        title="PASO 12.1: SIPOC MAP"
        subtitle="Sube uno o más archivos para el mapa SIPOC"
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-11-sipoc")}
        onToggleStep={() => on_toggle_step("step-11-sipoc")}
        isNa={na_steps?.has("step-11-sipoc")}
        onToggleNa={() => on_toggle_na?.("step-11-sipoc")}
      />

      <MultiImageUploadSection
        images={process_mapping_files || []}
        onChange={(urls) => on_process_mapping_files_change?.(urls)}
        title="PASO 12.2: PROCESS MAPPING"
        subtitle="Sube uno o más archivos del mapa de procesos"
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-11")}
        onToggleStep={() => on_toggle_step("step-11")}
        isNa={na_steps?.has("step-11")}
        onToggleNa={() => on_toggle_na?.("step-11")}
      />

      <ImageUploadSection
        image={especificacion_procesos_image || null}
        onChange={(img) => on_especificacion_procesos_image_change?.(img || undefined)}
        title="PASO 12.3: ESPECIFICACIONES DE PROCESOS/EQUIPOS/DISEÑO"
        subtitle="Sube archivo/imagen"
        isStepCompleted={completed_steps.has("step-18")}
        onToggleStep={() => on_toggle_step("step-18")}
        isNa={na_steps?.has("step-18")}
        onToggleNa={() => on_toggle_na?.("step-18")}
      />

      <ImageUploadSection
        image={benchmark_image || null}
        onChange={(img) => on_benchmark_image_change?.(img || undefined)}
        title="PASO 12.4: BENCHMARK E HISTORIAL DE MEJORAS"
        subtitle="Sube archivo/imagen"
        isStepCompleted={completed_steps.has("step-19")}
        onToggleStep={() => on_toggle_step("step-19")}
        isNa={na_steps?.has("step-19")}
        onToggleNa={() => on_toggle_na?.("step-19")}
      />

      {/* ── PASO 13: Rendimiento actual (PIs) ──────────────────────── */}
      <RendimientoActualStep
        items={rendimiento_actual_pis || []}
        onChange={on_rendimiento_actual_pis_change!}
        image={rendimiento_actual_image}
        onImageChange={on_rendimiento_actual_image_change!}
        isStepCompleted={completed_steps.has("step-13")}
        onToggleStep={() => on_toggle_step("step-13")}
        isNa={na_steps?.has("step-13")}
        onToggleNa={() => on_toggle_na?.("step-13")}
      />

      {/* ── PASO 14: GOP Themes ────────────────────────────────────── */}
      <GopThemesSection
        data={gop_themes_data || []}
        onChange={on_gop_themes_data_change!}
        isStepCompleted={completed_steps.has("step-20")}
        onToggleStep={() => on_toggle_step("step-20")}
        isNa={na_steps?.has("step-20")}
        onToggleNa={() => on_toggle_na?.("step-20")}
      />

      {/* ── PASO 15: Ishikawa ────────────────────────────────────────── */}
      <IshikawaSection
        ishikawas={ishikawas || []}
        onChange={on_ishikawas_change!}
        isStepCompleted={completed_steps.has("step-14")}
        onToggleStep={() => on_toggle_step("step-14")}
        isNa={na_steps?.has("step-14")}
        onToggleNa={() => on_toggle_na?.("step-14")}
        hasFlavorCorrelation={has_flavor_correlation}
        onToggleFlavorCorrelation={(val: boolean) => set_has_flavor_correlation?.(val)}
      />

      {has_flavor_correlation && (
        <FlavorCorrelationSection
          isStepCompleted={completed_steps.has("step-flavor-corr")}
          onToggleStep={() => on_toggle_step("step-flavor-corr")}
          isNa={na_steps?.has("step-flavor-corr")}
          onToggleNa={() => on_toggle_na?.("step-flavor-corr")}
        />
      )}

      {/* ── PASO 16: Análisis de Riesgos ────────────────────────────── */}
      <AnalisisRiesgosTable
        title="PASO 16: ANÁLISIS DE RIESGOS"
        items={analisis_riesgos_proyecto || []}
        onChange={(d) => on_analisis_riesgos_proyecto_change?.(d)}
        isStepCompleted={completed_steps.has("step-21")}
        onToggleStep={() => on_toggle_step("step-21")}
        isNa={na_steps?.has("step-21")}
        onToggleNa={() => on_toggle_na?.("step-21")}
      />

      {/* ── PASO 16b: Cinco Porqués ─────────────────────────────────── */}
      <FiveWhysSection
        tables={five_whys_tables || []}
        onChange={on_five_whys_tables_change!}
        isStepCompleted={completed_steps.has("step-15")}
        onToggleStep={() => on_toggle_step("step-15")}
        isNa={na_steps?.has("step-15")}
        onToggleNa={() => on_toggle_na?.("step-15")}
      />
      {/* ── PASO 17: Causas Raíz Definidas ──────────── */}
      <ConclusionesCausaRaizTable
        title="PASO 17: CAUSAS RAÍZ DEFINIDAS"
        items={conclusiones_causa_raiz || []}
        onChange={on_conclusiones_causa_raiz_change!}
        isStepCompleted={completed_steps.has("step-17")}
        onToggleStep={() => on_toggle_step("step-17")}
        isNa={na_steps?.has("step-17")}
        onToggleNa={() => on_toggle_na?.("step-17")}
      />
    </div>
  );
};
