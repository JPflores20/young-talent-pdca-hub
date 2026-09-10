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
  kpi_document_files: string[];
  on_kpi_document_files_change: (files: string[]) => void;
  pareto_drill_downs: string[];
  on_pareto_drill_downs_change: (drills: string[]) => void;
  pareto_data_map: Record<string, ParetoItem[]>;
  on_pareto_data_map_change: (map: Record<string, ParetoItem[]>) => void;
  pareto_unit: string;
  on_pareto_unit_change: (unit: string) => void;
  has_flavor_correlation: boolean;
  flavor_correlation_data: any;
  on_flavor_correlation_data_change: (data: any) => void;
  has_gop_themes: boolean;
  gop_themes_data: any[];
  on_gop_themes_data_change: (data: any[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
}

export const PdcaPhaseDo: React.FC<PhaseDoProps> = ({
  target_vs_actual, on_target_vs_actual_change,
  target_vs_actual_unit, on_target_vs_actual_unit_change,
  kpi_document_files, on_kpi_document_files_change,
  pareto_drill_downs, on_pareto_drill_downs_change,
  pareto_data_map, on_pareto_data_map_change,
  pareto_unit, on_pareto_unit_change,
  has_flavor_correlation, flavor_correlation_data, on_flavor_correlation_data_change,
  has_gop_themes, gop_themes_data, on_gop_themes_data_change,
  completed_steps, on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      <TimeSeriesYTD
        value={target_vs_actual}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
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
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
      />

      {has_flavor_correlation && (
        <FlavorCorrelationSection
          isStepCompleted={completed_steps.has("step-flavor")}
          onToggleStep={() => on_toggle_step("step-flavor")}
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
