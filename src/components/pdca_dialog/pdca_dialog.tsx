import React, { useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { use_pdca_dialog_state } from "./hooks/use_pdca_dialog_state";
import { use_pdca_deadline } from "./hooks/use_pdca_deadline";
import { use_pdca_autosave } from "./hooks/use_pdca_autosave";
import { format_date_to_string } from "./utils/date_helpers";
import { PdcaDialogHeader } from "./pdca_dialog_header";
import { PdcaDialogFooter } from "./pdca_dialog_footer";
import { PdcaPhasePlan } from "./pdca_phase_plan";
import { PdcaPhaseDo } from "./pdca_phase_do";
import { PdcaPhaseCheck } from "./pdca_phase_check";
import { PdcaPhaseAct } from "./pdca_phase_act";

import { CustomStepper } from "../pdca-dialog/pdca-dialog-stepper";
import { PdcaComments } from "../pdca-comments";
import { PdcaHistory } from "../pdca-history";
import { DEFAULT_VPO_CHECKPOINTS, type Pdca, type Phase } from "@/data/pdca";

const create_empty_pdca_draft = (): Pdca => ({
  id: `PDCA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  titulo: "",
  area: "cocimientos",
  fase: "Plan",
  actualizado: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
  progreso: 0,
  problema: "",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Indicador principal", antes: 0, despues: 0, unidad: "%" },
  serie: [{ mes: "May", valor: 0 }, { mes: "Jun", valor: 0 }, { mes: "Jul", valor: 0 }, { mes: "Ago", valor: 0 }],
  vpoCheckpoints: DEFAULT_VPO_CHECKPOINTS.map((item) => ({ ...item, status: "", evidencia: "" })),
  equipo: [],
});

export const PdcaDialog: React.FC<{
  pdca: Pdca | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ pdca, onOpenChange }) => {
  const current_pdca = useMemo(() => pdca ?? create_empty_pdca_draft(), [pdca]);
  const { currentUser: auth_user, usersList: available_users } = useAuth();
  const is_admin = auth_user?.role === "admin";

  const is_deadline_locked = use_pdca_deadline(is_admin, current_pdca.fechaFinalizacion);
  const is_editable = is_admin || !is_deadline_locked;

  const state = use_pdca_dialog_state(current_pdca, auth_user);

  const get_current_pdca_payload = useCallback((): Pdca => {
    return {
      ...current_pdca,
      titulo: state.title_value,
      area: state.area_value,
      fase: state.active_tab,
      problema: state.problem_value,
      causaRaiz: state.root_cause_value,
      acciones: state.action_items,
      targetVsActual: state.target_vs_actual,
      targetVsActualUnit: state.target_vs_actual_unit,
      targetVsActualTitle: state.target_vs_actual_title,
      kpiFinalResultData: state.kpi_final_result_data,
      kpiFinalResultUnit: state.kpi_final_result_unit,
      gembaFinalImage: state.gemba_final_image,
      evidencias: state.evidence_files,
      kpiDocuments: state.kpi_document_files,
      paretoDataMap: state.pareto_data_map,
      paretoDrillDowns: state.pareto_drill_downs,
      paretoUnit: state.pareto_unit,
      paretoTitles: state.pareto_titles,
      vpoCheckpoints: state.vpo_checkpoints,
      definicionMeta: state.definition_goal,
      participantes: state.participants_data,
      equipo: state.team_members,
      ishikawas: state.ishikawas,
      fiveWhysTables: state.five_whys_tables,
      impactMatrix: state.impact_matrix,
      hasFlavorCorrelation: state.has_flavor_correlation,
      flavorCorrelationData: state.flavor_correlation_data,
      hasGopThemes: state.has_gop_themes,
      gopThemesData: state.gop_themes_data,
      processMappingFiles: state.process_mapping_files,
      comentarios: state.comments_list,
      historial: state.history_events,
      completedSteps: Array.from(state.completed_steps),
      completedPhases: Array.from(state.completed_phases),
      fechaFinalizacion: state.deadline_date
        ? format_date_to_string(state.deadline_date)
        : current_pdca.fechaFinalizacion === "Sin límite"
        ? "Sin límite"
        : current_pdca.fechaFinalizacion && !parse_date_string(current_pdca.fechaFinalizacion)
        ? current_pdca.fechaFinalizacion
        : "",
      autor: state.author_name,
      autorEmail: state.author_email,
      asignados: state.assigned_users,
      actualizado: new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }),
    };
  }, [current_pdca, state]);

  const autosave = use_pdca_autosave(
    current_pdca.id,
    get_current_pdca_payload,
    is_editable,
    auth_user?.name
  );

  const handle_toggle_step = useCallback((step_id: string) => {
    if (!is_admin) {
      toast.error("Solo administradores pueden marcar pasos completados.");
      return;
    }
    state.set_completed_steps((prev) => {
      const next_steps = new Set(prev);
      if (next_steps.has(step_id)) next_steps.delete(step_id);
      else next_steps.add(step_id);
      return next_steps;
    });
    autosave.mark_as_modified();
  }, [is_admin, state, autosave]);

  const handle_proceed_next_phase = async () => {
    if (!is_editable) return;
    const phase_order: Phase[] = ["Plan", "Do", "Check", "Act"];
    const current_idx = phase_order.indexOf(state.active_tab);
    if (state.active_tab === "Act") {
      await autosave.handle_save_to_firestore();
      toast.success("¡PDCA finalizado!");
      onOpenChange(false);
    } else if (current_idx >= 0 && current_idx < phase_order.length - 1) {
      const next_phase = phase_order[current_idx + 1]!;
      await autosave.handle_save_to_firestore(next_phase);
      state.set_active_tab(next_phase);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div id="pdca-content" className="space-y-6">
      <PdcaDialogHeader
        current_phase={state.active_tab}
        document_identifier={current_pdca.id}
        pdca_title={state.title_value}
        last_updated={current_pdca.actualizado}
        creation_date={
          current_pdca.historial && current_pdca.historial.length > 0 
            ? new Date(current_pdca.historial[0].timestamp).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) 
            : "Desconocida"
        }
        deadline_string={current_pdca.fechaFinalizacion}
        completed_steps={state.completed_steps}
        is_saving_in_progress={autosave.is_saving}
        has_pending_modifications={autosave.has_unsaved_changes}
        is_user_permitted_to_edit={is_editable}
        on_trigger_firestore_save={() => autosave.handle_save_to_firestore()}
        on_go_back={() => onOpenChange(false)}
      />


      <CustomStepper
        current={state.active_tab}
        onSelect={(phase) => state.set_active_tab(phase)}
        completedPhases={state.completed_phases}
        onToggleComplete={() => {}}
        completedSteps={state.completed_steps}
      />

      {state.active_tab === "Plan" && (
        <PdcaPhasePlan
          title_value={state.title_value}
          on_title_change={(t) => { state.set_title_value(t); autosave.mark_as_modified(); }}
          area_value={state.area_value}
          on_area_change={(a) => { state.set_area_value(a); autosave.mark_as_modified(); }}
          deadline_date={state.deadline_date || new Date()}
          on_deadline_change={(d) => { state.set_deadline_date(d); autosave.mark_as_modified(); }}
          author_name={state.author_name}
          author_email={state.author_email}
          on_author_change={(email, name) => { state.set_author_email(email); state.set_author_name(name); autosave.mark_as_modified(); }}
          assigned_users={state.assigned_users}
          on_toggle_assigned_user={(u) => {
            const exists = state.assigned_users.some((a) => a.email === u.email);
            const next = exists ? state.assigned_users.filter((a) => a.email !== u.email) : [...state.assigned_users, u];
            state.set_assigned_users(next);
            autosave.mark_as_modified();
          }}
          available_users={available_users}
          is_admin_user={is_admin}
          team_members_list={state.team_members}
          on_team_members_change={(m) => { state.set_team_members(m); autosave.mark_as_modified(); }}
          problem_description={state.problem_value}
          on_problem_change={(v) => { state.set_problem_value(v); autosave.mark_as_modified(); }}
          goal_definition={state.definition_goal}
          on_goal_definition_change={(g) => { state.set_definition_goal(g); autosave.mark_as_modified(); }}
          participants_info={state.participants_data}
          on_participants_info_change={(p) => { state.set_participants_data(p); autosave.mark_as_modified(); }}
          vpo_checkpoints={state.vpo_checkpoints}
          on_vpo_checkpoints_change={(c) => { state.set_vpo_checkpoints(c); autosave.mark_as_modified(); }}
          completed_steps={state.completed_steps}
          on_toggle_step={handle_toggle_step}
          is_editable={is_editable}
        />
      )}

      {state.active_tab === "Do" && (
        <PdcaPhaseDo
          target_vs_actual={state.target_vs_actual}
          on_target_vs_actual_change={(t) => { state.set_target_vs_actual(t); autosave.mark_as_modified(); }}
          target_vs_actual_unit={state.target_vs_actual_unit}
          on_target_vs_actual_unit_change={(u) => { state.set_target_vs_actual_unit(u); autosave.mark_as_modified(); }}
          target_vs_actual_title={state.target_vs_actual_title}
          on_target_vs_actual_title_change={(title) => { state.set_target_vs_actual_title(title); autosave.mark_as_modified(); }}
          kpi_document_files={state.kpi_document_files}
          on_kpi_document_files_change={(f) => { state.set_kpi_document_files(f); autosave.mark_as_modified(); }}
          pareto_drill_downs={state.pareto_drill_downs}
          on_pareto_drill_downs_change={(d) => { state.set_pareto_drill_downs(d); autosave.mark_as_modified(); }}
          pareto_data_map={state.pareto_data_map}
          on_pareto_data_map_change={(m) => { state.set_pareto_data_map(m); autosave.mark_as_modified(); }}
          pareto_unit={state.pareto_unit}
          on_pareto_unit_change={(u) => { state.set_pareto_unit(u); autosave.mark_as_modified(); }}
          pareto_titles={state.pareto_titles}
          on_pareto_titles_change={(t) => { state.set_pareto_titles(t); autosave.mark_as_modified(); }}
          has_flavor_correlation={state.has_flavor_correlation}
          flavor_correlation_data={state.flavor_correlation_data}
          on_flavor_correlation_data_change={(d) => { state.set_flavor_correlation_data(d); autosave.mark_as_modified(); }}
          has_gop_themes={state.has_gop_themes}
          gop_themes_data={state.gop_themes_data}
          on_gop_themes_data_change={(g) => { state.set_gop_themes_data(g); autosave.mark_as_modified(); }}
          completed_steps={state.completed_steps}
          on_toggle_step={handle_toggle_step}
        />
      )}

      {state.active_tab === "Check" && (
        <PdcaPhaseCheck
          process_mapping_files={state.process_mapping_files}
          on_process_mapping_files_change={(f) => { state.set_process_mapping_files(f); autosave.mark_as_modified(); }}
          ishikawas={state.ishikawas}
          on_ishikawas_change={(i) => { state.set_ishikawas(i); autosave.mark_as_modified(); }}
          five_whys_tables={state.five_whys_tables}
          on_five_whys_tables_change={(w) => { state.set_five_whys_tables(w); autosave.mark_as_modified(); }}
          completed_steps={state.completed_steps}
          on_toggle_step={handle_toggle_step}
        />
      )}

      {state.active_tab === "Act" && (
        <div className="space-y-6">
          {/* PASO 8 y siguientes en la fase Act */}
          <PdcaPhaseAct
            action_items={state.action_items}
            on_action_items_change={(a) => { state.set_action_items(a); autosave.mark_as_modified(); }}
            kpi_final_result_data={state.kpi_final_result_data}
            on_kpi_final_result_change={(k) => { state.set_kpi_final_result_data(k); autosave.mark_as_modified(); }}
            kpi_final_result_unit={state.kpi_final_result_unit}
            on_kpi_final_result_unit_change={(u) => { state.set_kpi_final_result_unit(u); autosave.mark_as_modified(); }}
            gemba_evidencias={state.evidence_files}
            on_gemba_evidencias_change={(imgs) => { state.set_evidence_files(imgs); autosave.mark_as_modified(); }}
            gemba_final_image={state.gemba_final_image}
            on_gemba_final_image_change={(i) => { state.set_gemba_final_image(i); autosave.mark_as_modified(); }}
            completed_steps={state.completed_steps}
            on_toggle_step={handle_toggle_step}
            is_editable={is_editable}
          />
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex gap-2 border-b border-border pb-2">
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-md ${state.bottom_tab === "comments" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => state.set_bottom_tab("comments")}
          >
            Comentarios
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs font-semibold rounded-md ${state.bottom_tab === "history" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            onClick={() => state.set_bottom_tab("history")}
          >
            Historial
          </button>
        </div>
        {state.bottom_tab === "comments" ? (
          <PdcaComments
            comments={state.comments_list}
            onAddComment={(text, stepTitle) => {
              const new_comment = {
                id: crypto.randomUUID(),
                userId: auth_user?.email || "anonymous",
                userName: auth_user?.name || "Usuario",
                text,
                timestamp: new Date().toISOString(),
                stepTitle,
              };
              state.set_comments_list([...state.comments_list, new_comment]);
              autosave.mark_as_modified();
            }}
            onDeleteComment={(id) => {
              state.set_comments_list(state.comments_list.filter((c) => c.id !== id));
              autosave.mark_as_modified();
            }}
          />
        ) : (
          <PdcaHistory history={state.history_events} />
        )}
      </div>

      <PdcaDialogFooter
        current_phase={state.active_tab}
        document_identifier={current_pdca.id}
        is_user_permitted_to_edit={is_editable}
        on_proceed_next_phase={handle_proceed_next_phase}
        on_close_dialog={() => onOpenChange(false)}
      />
    </div>
  );
};