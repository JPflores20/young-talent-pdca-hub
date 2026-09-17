import React from "react";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { MultiImageUploadSection } from "../image-upload-section";
import { ParetoSection } from "@/components/pdca-dialog/pareto-section";
import { FlavorCorrelationSection } from "../pdca-dialog/flavor-correlation-section";
import { GopThemesSection } from "../GopThemesSection";
import type { ParetoItem } from "@/data/pdca";

interface PhaseDoProps {
  target_vs_actual: { mes: string; target: number; actual: number | null }[];
  on_target_vs_actual_change: (val: any) => void;
  target_vs_actual_unit: string;
  on_target_vs_actual_unit_change: (unit: string) => void;
  target_vs_actual_title?: string;
  on_target_vs_actual_title_change?: (title: string) => void;
  kpi_document_files: string[];
  on_kpi_document_files_change: (files: string[]) => void;
  pareto_drill_downs: string[];
  on_pareto_drill_downs_change: (drills: string[]) => void;
  pareto_data_map: Record<string, ParetoItem[]>;
  on_pareto_data_map_change: (map: Record<string, ParetoItem[]>) => void;
  pareto_unit: string;
  on_pareto_unit_change: (unit: string) => void;
  pareto_titles?: Record<string, string>;
  on_pareto_titles_change?: (titles: Record<string, string>) => void;
  has_flavor_correlation: boolean;
  flavor_correlation_data: any;
  on_flavor_correlation_data_change: (data: any) => void;
  statistical_analysis_files: string[];
  on_statistical_analysis_files_change: (files: string[]) => void;
  has_gop_themes: boolean;
  gop_themes_data: any[];
  on_gop_themes_data_change: (data: any[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
}

export const PdcaPhaseDo: React.FC<PhaseDoProps> = ({
  target_vs_actual,
  on_target_vs_actual_change,
  target_vs_actual_unit,
  on_target_vs_actual_unit_change,
  target_vs_actual_title,
  on_target_vs_actual_title_change,
  kpi_document_files,
  on_kpi_document_files_change,
  pareto_drill_downs,
  on_pareto_drill_downs_change,
  pareto_data_map,
  on_pareto_data_map_change,
  pareto_unit,
  on_pareto_unit_change,
  pareto_titles,
  on_pareto_titles_change,
  has_flavor_correlation,
  flavor_correlation_data,
  on_flavor_correlation_data_change,
  statistical_analysis_files,
  on_statistical_analysis_files_change,
  has_gop_themes,
  gop_themes_data,
  on_gop_themes_data_change,
  completed_steps,
  on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      <TimeSeriesYTD
        value={target_vs_actual}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
        title={target_vs_actual_title ? `PASO 3: ${target_vs_actual_title}` : undefined}
        chartTitle={target_vs_actual_title}
        onTitleChange={on_target_vs_actual_title_change}
        isStepCompleted={completed_steps.has("step-3")}
        onToggleStep={() => on_toggle_step("step-3")}
      />

      <MultiImageUploadSection
        images={kpi_document_files}
        onChange={on_kpi_document_files_change}
        title="PASO 4: KPI TREE (IP)"
        subtitle="Documentación del KPI Tree"
        description="Sube hasta 6 fotos o un PDF con tu análisis de KPI Tree (Indicadores de Proceso)."
        maxImages={6}
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
      />

      <ParetoSection
        drillDowns={pareto_drill_downs}
        setDrillDowns={on_pareto_drill_downs_change}
        dataMap={pareto_data_map}
        setDataMap={on_pareto_data_map_change}
        unit={pareto_unit}
        onUnitChange={on_pareto_unit_change}
        paretoTitles={pareto_titles}
        onParetoTitlesChange={on_pareto_titles_change}
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
      />

      {has_flavor_correlation && (
        <FlavorCorrelationSection
          isStepCompleted={completed_steps.has("step-flavor")}
          onToggleStep={() => on_toggle_step("step-flavor")}
        />
      )}

      {has_flavor_correlation && (
        <MultiImageUploadSection
          images={statistical_analysis_files}
          onChange={on_statistical_analysis_files_change}
          title="Análisis Estadístico"
          subtitle="Sube tu archivo o pega una captura de pantalla"
          description="Selecciona la foto, imagen o pega (Ctrl+V) una captura de pantalla del análisis."
          maxImages={4}
          isStepCompleted={completed_steps.has("step-statistical-analysis")}
          onToggleStep={() => on_toggle_step("step-statistical-analysis")}
        />
      )}

      {has_gop_themes && (
        <GopThemesSection
          data={gop_themes_data}
          onChange={on_gop_themes_data_change}
          isStepCompleted={completed_steps.has("step-gop")}
          onToggleStep={() => on_toggle_step("step-gop")}
        />
      )}
    </div>
  );
};
