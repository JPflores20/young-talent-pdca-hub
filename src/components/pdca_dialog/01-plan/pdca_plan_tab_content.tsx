import React from "react";
import { PdcaPhasePlan } from "./pdca_phase_plan";
import type { PdcaDialogState } from "../hooks/use_pdca_dialog_state";

interface PdcaPlanTabContentProps {
  state: PdcaDialogState;
  autosave: { mark_as_modified: () => void };
  available_users: { name: string; email: string; role?: string }[];
  is_admin: boolean;
  is_editable: boolean;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na: (step_id: string) => void;
}

export const PdcaPlanTabContent: React.FC<PdcaPlanTabContentProps> = ({
  state,
  autosave,
  available_users,
  is_admin,
  is_editable,
  on_toggle_step,
  on_toggle_na,
}) => {
  return (
    <PdcaPhasePlan
      title_value={state.title_value}
      on_title_change={(t) => {
        state.set_title_value(t);
        autosave.mark_as_modified();
      }}
      area_value={state.area_value}
      on_area_change={(a) => {
        state.set_area_value(a);
        autosave.mark_as_modified();
      }}
      deadline_date={state.deadline_date || new Date()}
      on_deadline_change={(d) => {
        state.set_deadline_date(d);
        autosave.mark_as_modified();
      }}
      author_name={state.author_name}
      author_email={state.author_email}
      on_author_change={(email, name) => {
        state.set_author_email(email);
        state.set_author_name(name);
        autosave.mark_as_modified();
      }}
      assigned_users={state.assigned_users}
      on_toggle_assigned_user={(u) => {
        const exists = state.assigned_users.some((a) => a.email === u.email);
        const next = exists
          ? state.assigned_users.filter((a) => a.email !== u.email)
          : [...state.assigned_users, u];
        state.set_assigned_users(next);
        autosave.mark_as_modified();
      }}
      available_users={available_users}
      is_admin_user={is_admin}
      team_members_list={state.team_members}
      on_team_members_change={(m) => {
        state.set_team_members(m);
        autosave.mark_as_modified();
      }}
      problem_description={state.problem_value}
      on_problem_change={(v) => {
        state.set_problem_value(v);
        autosave.mark_as_modified();
      }}
      goal_definition={state.definition_goal}
      on_goal_definition_change={(g) => {
        state.set_definition_goal(g);
        autosave.mark_as_modified();
      }}
      participants_info={state.participants_data}
      on_participants_info_change={(p) => {
        state.set_participants_data(p);
        autosave.mark_as_modified();
      }}
      vpo_checkpoints={state.vpo_checkpoints}
      on_vpo_checkpoints_change={(c) => {
        state.set_vpo_checkpoints(c);
        autosave.mark_as_modified();
      }}
      completed_steps={state.completed_steps}
      na_steps={state.na_steps}
      on_toggle_step={on_toggle_step}
      on_toggle_na={on_toggle_na}
      is_editable={is_editable}
      process_mapping_files={state.process_mapping_files}
      on_process_mapping_files_change={(f) => {
        state.set_process_mapping_files(f);
        autosave.mark_as_modified();
      }}
      sipoc_map_files={state.sipoc_map_files}
      on_sipoc_map_files_change={(f) => {
        state.set_sipoc_map_files(f);
        autosave.mark_as_modified();
      }}
      baseline_image={state.baseline_image}
      on_baseline_image_change={(img) => {
        state.set_baseline_image(img);
        autosave.mark_as_modified();
      }}
      coleccion_datos={state.coleccion_datos}
      on_coleccion_datos_change={(d) => {
        state.set_coleccion_datos(d);
        autosave.mark_as_modified();
      }}
      pareto_drill_downs={state.pareto_drill_downs}
      on_pareto_drill_downs_change={(d) => {
        state.set_pareto_drill_downs(d);
        autosave.mark_as_modified();
      }}
      pareto_data_map={state.pareto_data_map}
      on_pareto_data_map_change={(m) => {
        state.set_pareto_data_map(m);
        autosave.mark_as_modified();
      }}
      pareto_unit={state.pareto_unit}
      on_pareto_unit_change={(u) => {
        state.set_pareto_unit(u);
        autosave.mark_as_modified();
      }}
      pareto_titles={state.pareto_titles}
      on_pareto_titles_change={(t) => {
        state.set_pareto_titles(t);
        autosave.mark_as_modified();
      }}
      target_vs_actual={state.target_vs_actual}
      on_target_vs_actual_change={(t) => {
        state.set_target_vs_actual(t);
        autosave.mark_as_modified();
      }}
      target_vs_actual_unit={state.target_vs_actual_unit}
      on_target_vs_actual_unit_change={(u) => {
        state.set_target_vs_actual_unit(u);
        autosave.mark_as_modified();
      }}
      target_vs_actual_title={state.target_vs_actual_title}
      on_target_vs_actual_title_change={(t) => {
        state.set_target_vs_actual_title(t);
        autosave.mark_as_modified();
      }}
      target_vs_actual_ymin={state.target_vs_actual_ymin}
      on_target_vs_actual_ymin_change={(y) => {
        state.set_target_vs_actual_ymin(y);
        autosave.mark_as_modified();
      }}
      target_vs_actual_ymax={state.target_vs_actual_ymax}
      on_target_vs_actual_ymax_change={(y) => {
        state.set_target_vs_actual_ymax(y);
        autosave.mark_as_modified();
      }}
      ishikawas={state.ishikawas}
      on_ishikawas_change={(i) => {
        state.set_ishikawas(i);
        autosave.mark_as_modified();
      }}
      five_whys_tables={state.five_whys_tables}
      on_five_whys_tables_change={(w) => {
        state.set_five_whys_tables(w);
        autosave.mark_as_modified();
      }}
      voz_consumidor={state.voz_consumidor}
      on_voz_consumidor_change={(v) => {
        state.set_voz_consumidor(v);
        autosave.mark_as_modified();
      }}
      analisis_riesgos_proyecto={state.analisis_riesgos_proyecto}
      on_analisis_riesgos_proyecto_change={(a) => {
        state.set_analisis_riesgos_proyecto(a);
        autosave.mark_as_modified();
      }}
      especificacion_procesos_image={state.especificacion_procesos_image}
      on_especificacion_procesos_image_change={(img) => {
        state.set_especificacion_procesos_image(img);
        autosave.mark_as_modified();
      }}
      benchmark_image={state.benchmark_image}
      on_benchmark_image_change={(img) => {
        state.set_benchmark_image(img);
        autosave.mark_as_modified();
      }}
      conclusiones_causa_raiz={state.conclusiones_causa_raiz}
      on_conclusiones_causa_raiz_change={(c) => {
        state.set_conclusiones_causa_raiz(c);
        autosave.mark_as_modified();
      }}
      has_flavor_correlation={state.has_flavor_correlation}
      set_has_flavor_correlation={(val) => {
        state.set_has_flavor_correlation(val);
        autosave.mark_as_modified();
      }}
      flavor_correlation_data={state.flavor_correlation_data}
      on_flavor_correlation_data_change={(val) => {
        state.set_flavor_correlation_data(val);
        autosave.mark_as_modified();
      }}
      rendimiento_actual_pis={state.rendimiento_actual_pis}
      on_rendimiento_actual_pis_change={(val) => {
        state.set_rendimiento_actual_pis(val);
        autosave.mark_as_modified();
      }}
      rendimiento_actual_image={state.rendimiento_actual_image}
      on_rendimiento_actual_image_change={(val) => {
        state.set_rendimiento_actual_image(val);
        autosave.mark_as_modified();
      }}
      gop_themes_data={state.gop_themes_data}
      on_gop_themes_data_change={(data) => {
        state.set_gop_themes_data(data);
        autosave.mark_as_modified();
      }}
    />
  );
};
