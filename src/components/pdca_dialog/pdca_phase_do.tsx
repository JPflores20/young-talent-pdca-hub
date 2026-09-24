import React from "react";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/ui/step-card";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";
import { MultiImageUploadSection, ImageUploadSection } from "../image-upload-section";
import { ParetoSection } from "@/components/pdca-dialog/pareto-section";
import { FlavorCorrelationSection } from "../pdca-dialog/flavor-correlation-section";
import { ProblemTimelineSection } from "../pdca-dialog/problem-timeline-section";
import { GopThemesSection } from "../GopThemesSection";
import { TablaEstandarizacion } from "./tabla-estandarizacion";
import { TablaEstandarizacionVpo } from "./tabla-estandarizacion-vpo";
import { ColeccionDatosTable } from "./coleccion-datos-table";
import type { ParetoItem } from "@/data/pdca";

interface PhaseDoProps {
  target_vs_actual: { mes: string; target: number; actual: number | null }[];
  on_target_vs_actual_change: (val: any) => void;
  target_vs_actual_unit: string;
  on_target_vs_actual_unit_change: (unit: string) => void;
  target_vs_actual_title?: string;
  on_target_vs_actual_title_change?: (title: string) => void;
  baseline_image?: string;
  on_baseline_image_change?: (img: string | undefined) => void;
  coleccion_datos?: any[];
  on_coleccion_datos_change?: (data: any[]) => void;
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
  problemTimelineOption: "A" | "B";
  onProblemTimelineOptionChange: (val: "A" | "B") => void;
  problemTimelineFilter: "day" | "week" | "month" | "3months";
  onProblemTimelineFilterChange: (val: "day" | "week" | "month" | "3months") => void;
  problemTimelineEvents: { id: string; time: string; description: string }[];
  onProblemTimelineEventsChange: (events: { id: string; time: string; description: string }[]) => void;
  statistical_analysis_files: string[];
  on_statistical_analysis_files_change: (files: string[]) => void;
  especificacion_procesos_text?: string;
  on_especificacion_procesos_text_change?: (text: string | undefined) => void;
  especificacion_procesos_image?: string;
  on_especificacion_procesos_image_change?: (img: string | undefined) => void;
  tabla_estandarizacion: any[];
  on_tabla_estandarizacion_change: (data: any[]) => void;
  tabla_estandarizacion_vpo: any[];
  on_tabla_estandarizacion_vpo_change: (data: any[]) => void;
  has_gop_themes: boolean;
  informacion_adicional_files?: string[];
  on_informacion_adicional_files_change?: (files: string[]) => void;
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
  baseline_image,
  on_baseline_image_change,
  coleccion_datos,
  on_coleccion_datos_change,
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
  problemTimelineOption,
  onProblemTimelineOptionChange,
  problemTimelineFilter,
  onProblemTimelineFilterChange,
  problemTimelineEvents,
  onProblemTimelineEventsChange,
  statistical_analysis_files,
  on_statistical_analysis_files_change,
  especificacion_procesos_text,
  on_especificacion_procesos_text_change,
  especificacion_procesos_image,
  on_especificacion_procesos_image_change,
  tabla_estandarizacion,
  on_tabla_estandarizacion_change,
  tabla_estandarizacion_vpo,
  on_tabla_estandarizacion_vpo_change,
  has_gop_themes,
  informacion_adicional_files,
  on_informacion_adicional_files_change,
  gop_themes_data,
  on_gop_themes_data_change,
  completed_steps,
  on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
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

        <ImageUploadSection
          image={baseline_image || null}
          onChange={(img) => on_baseline_image_change?.(img || undefined)}
          title="Baseline (Imagen)"
          subtitle="Sube una imagen representativa del baseline"
          customBadge={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
        />

        <ColeccionDatosTable 
          items={coleccion_datos || []}
          onChange={(d) => on_coleccion_datos_change?.(d)}
          isStepCompleted={completed_steps.has("step-coleccion-datos")}
          onToggleStep={() => on_toggle_step("step-coleccion-datos")}
        />
      </div>

      <ParetoSection
        drillDowns={pareto_drill_downs}
        setDrillDowns={on_pareto_drill_downs_change}
        dataMap={pareto_data_map}
        setDataMap={on_pareto_data_map_change}
        unit={pareto_unit}
        onUnitChange={on_pareto_unit_change}
        paretoTitles={pareto_titles}
        onParetoTitlesChange={on_pareto_titles_change}
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
      />

      <div className="space-y-6">
        <MultiImageUploadSection
          images={kpi_document_files}
          onChange={on_kpi_document_files_change}
          title="PASO 5: KPI TREE E IP"
          subtitle="Documentación del KPI Tree"
          description="Sube hasta 6 fotos o un PDF con tu análisis de KPI Tree (Indicadores de Proceso)."
          maxImages={6}
          isStepCompleted={completed_steps.has("step-5")}
          onToggleStep={() => on_toggle_step("step-5")}
        />
        
        <div className="mt-8 space-y-4">
          <StepCard title="TABLA DE ESTANDARIZACIÓN">
            <TablaEstandarizacion
              items={tabla_estandarizacion || []}
              onChange={(items) => on_tabla_estandarizacion_change?.(items)}
            />
          </StepCard>

          <StepCard 
            title="TABLA DE ESTANDARIZACIÓN VPO"
            headerRight={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
          >
            <TablaEstandarizacionVpo
              items={tabla_estandarizacion_vpo || []}
              onChange={(items) => on_tabla_estandarizacion_vpo_change?.(items)}
            />
          </StepCard>
        </div>
      </div>

      {has_flavor_correlation && (
        <FlavorCorrelationSection
          isStepCompleted={completed_steps.has("step-flavor")}
          onToggleStep={() => on_toggle_step("step-flavor")}
        />
      )}

      <ProblemTimelineSection
        timelineOption={problemTimelineOption}
        onOptionChange={onProblemTimelineOptionChange}
        timelineFilter={problemTimelineFilter}
        onFilterChange={onProblemTimelineFilterChange}
        events={problemTimelineEvents}
        onEventsChange={onProblemTimelineEventsChange}
        isStepCompleted={completed_steps.has("step-timeline")}
        onToggleStep={() => on_toggle_step("step-timeline")}
      />

      {statistical_analysis_files && (
        <div className="space-y-6">
          <MultiImageUploadSection
            images={statistical_analysis_files || []}
            onChange={(files) => on_statistical_analysis_files_change(files)}
            title="ANÁLISIS ESTADÍSTICO"
            subtitle="Sube tu análisis"
            description="Adjunta fotos o gráficos de tu análisis estadístico."
            isStepCompleted={completed_steps.has("step-statistical-analysis")}
            onToggleStep={() => on_toggle_step("step-statistical-analysis")}
            customBadge={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0">REVISIÓN</Badge>}
          />

            <div className="space-y-4">
              <StepCard 
                title="ESPECIFICACIÓN DE PROCESOS"
                headerRight={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
              >
                <div className="space-y-6">
                  <textarea
                    className="w-full min-h-[80px] text-sm p-3 border rounded-md shadow-sm focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Describe las especificaciones de procesos..."
                    value={especificacion_procesos_text || ""}
                    onChange={(e) => on_especificacion_procesos_text_change?.(e.target.value)}
                  />

                  <ImageUploadSection
                    image={especificacion_procesos_image || null}
                    onChange={(img) => on_especificacion_procesos_image_change?.(img || undefined)}
                    title="DIAGRAMA/IMAGEN"
                    subtitle="Sube una imagen de las especificaciones"
                    hideCard={true}
                  />
                </div>
              </StepCard>
            </div>
        </div>
      )}

      {has_gop_themes && (
        <div className="space-y-6">
          <MultiImageUploadSection
            images={informacion_adicional_files || []}
            onChange={(files) => on_informacion_adicional_files_change?.(files)}
            title="Información Adicional GOP"
            subtitle="Contexto General (Max 6 fotos)"
            description="Agrega imágenes o capturas que proporcionen contexto antes de llenar la tabla de GOPs."
            maxImages={6}
          />
          <GopThemesSection
            data={gop_themes_data}
            onChange={on_gop_themes_data_change}
            isStepCompleted={completed_steps.has("step-gop")}
            onToggleStep={() => on_toggle_step("step-gop")}
          />
        </div>
      )}
    </div>
  );
};
