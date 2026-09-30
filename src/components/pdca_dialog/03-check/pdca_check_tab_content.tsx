import React from "react";
import { PdcaPhaseCheck } from "./pdca_phase_check";
import type { PdcaDialogState } from "../hooks/use_pdca_dialog_state";

interface PdcaCheckTabContentProps {
  state: PdcaDialogState;
  autosave: { mark_as_modified: () => void };
  on_toggle_step: (step_id: string) => void;
  on_toggle_na: (step_id: string) => void;
}

export const PdcaCheckTabContent: React.FC<PdcaCheckTabContentProps> = ({
  state,
  autosave,
  on_toggle_step,
  on_toggle_na,
}) => {
  return (
    <PdcaPhaseCheck
      final_time_series_data={state.final_time_series_data}
      on_final_time_series_data_change={(k) => {
        state.set_final_time_series_data(k);
        autosave.mark_as_modified();
      }}
      final_time_series_unit={state.final_time_series_unit}
      on_final_time_series_unit_change={(u) => {
        state.set_final_time_series_unit(u);
        autosave.mark_as_modified();
      }}
      final_time_series_title={state.final_time_series_title}
      on_final_time_series_title_change={(t) => {
        state.set_final_time_series_title(t);
        autosave.mark_as_modified();
      }}
      final_time_series_ymin={state.final_time_series_ymin}
      on_final_time_series_ymin_change={(y) => {
        state.set_final_time_series_ymin(y);
        autosave.mark_as_modified();
      }}
      final_time_series_ymax={state.final_time_series_ymax}
      on_final_time_series_ymax_change={(y) => {
        state.set_final_time_series_ymax(y);
        autosave.mark_as_modified();
      }}
      completed_steps={state.completed_steps}
      na_steps={state.na_steps}
      on_toggle_step={on_toggle_step}
      on_toggle_na={on_toggle_na}
      mapeo_proceso_image={state.mapeo_proceso_image}
      on_mapeo_proceso_image_change={(img) => {
        state.set_mapeo_proceso_image(img);
        autosave.mark_as_modified();
      }}
      pruebas_ejecutadas={state.pruebas_ejecutadas}
      on_pruebas_ejecutadas_change={(p) => {
        state.set_pruebas_ejecutadas(p);
        autosave.mark_as_modified();
      }}
      nuevo_performance_image={state.nuevo_performance_image}
      on_nuevo_performance_image_change={(img) => {
        state.set_nuevo_performance_image(img);
        autosave.mark_as_modified();
      }}
      nuevo_pareto_drill_downs={state.nuevo_pareto_drill_downs}
      on_nuevo_pareto_drill_downs_change={(d) => {
        state.set_nuevo_pareto_drill_downs(d);
        autosave.mark_as_modified();
      }}
      nuevo_pareto_data_map={state.nuevo_pareto_data_map}
      on_nuevo_pareto_data_map_change={(m) => {
        state.set_nuevo_pareto_data_map(m);
        autosave.mark_as_modified();
      }}
      nuevo_pareto_unit={state.nuevo_pareto_unit}
      on_nuevo_pareto_unit_change={(u) => {
        state.set_nuevo_pareto_unit(u);
        autosave.mark_as_modified();
      }}
      nuevo_pareto_titles={state.nuevo_pareto_titles}
      on_nuevo_pareto_titles_change={(t) => {
        state.set_nuevo_pareto_titles(t);
        autosave.mark_as_modified();
      }}
      has_nueva_correlacion={state.has_nueva_correlacion}
      on_has_nueva_correlacion_change={(val) => {
        state.set_has_nueva_correlacion(val);
        autosave.mark_as_modified();
      }}
      nueva_correlacion_data={state.nueva_correlacion_data}
      on_nueva_correlacion_data_change={(d) => {
        state.set_nueva_correlacion_data(d);
        autosave.mark_as_modified();
      }}
      nuevo_performance={state.nuevo_performance}
      on_nuevo_performance_change={(n) => {
        state.set_nuevo_performance(n);
        autosave.mark_as_modified();
      }}
    />
  );
};
