import React, { useMemo, useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { use_pdca_dialog_state } from "./hooks/use_pdca_dialog_state";
import { use_pdca_deadline } from "./hooks/use_pdca_deadline";
import { use_pdca_autosave } from "./hooks/use_pdca_autosave";
import { PdcaDialogHeader, ALL_STEP_IDS } from "./common/pdca_dialog_header";
import { PdcaDialogFooter } from "./common/pdca_dialog_footer";
import { PdcaPhaseResumen } from "./00-resumen/pdca_phase_resumen";
import { PdcaPlanTabContent } from "./01-plan/pdca_plan_tab_content";
import { PdcaDoTabContent } from "./02-do/pdca_do_tab_content";
import { PdcaCheckTabContent } from "./03-check/pdca_check_tab_content";
import { PdcaActTabContent } from "./04-act/pdca_act_tab_content";
import { PdcaItfR2d2 } from "./04-act/step-itf-r2d2/pdca_itf_r2d2";
import { CustomStepper } from "./common/pdca-dialog-stepper";
import { PdcaBottomSection } from "./common/pdca_bottom_section";
import { create_empty_pdca_draft } from "./utils/create_empty_pdca_draft";
import { build_pdca_payload } from "./utils/build_pdca_payload";
import type { Pdca, Phase } from "@/data/pdca";

export const PdcaDialog: React.FC<{
  pdca: Pdca | null;
  newPdcaType?: "PDCA" | "RDA";
  open: boolean;
  onOpenChange: (open: boolean) => void;
}> = ({ pdca, newPdcaType = "PDCA", onOpenChange }) => {
  const current_pdca = useMemo(() => pdca ?? create_empty_pdca_draft(newPdcaType), [pdca, newPdcaType]);
  const { currentUser: auth_user, usersList: available_users } = useAuth();
  const is_admin = auth_user?.role === "admin";

  const is_deadline_locked = use_pdca_deadline(is_admin, current_pdca.fechaFinalizacion);
  const is_editable = is_admin || !is_deadline_locked;

  const state = use_pdca_dialog_state(current_pdca, auth_user);

  const valid_steps = ALL_STEP_IDS.filter((id) => !state.na_steps.has(id));
  const completed_count = valid_steps.filter((id) => state.completed_steps.has(id)).length;
  const computed_progress = valid_steps.length > 0 ? Math.round((completed_count / valid_steps.length) * 100) : 0;

  const get_current_pdca_payload = useCallback((): Pdca => {
    return build_pdca_payload(current_pdca, state, computed_progress);
  }, [current_pdca, state, computed_progress]);

  const { refresh } = usePdcas();

  const autosave = use_pdca_autosave(
    current_pdca.id,
    get_current_pdca_payload,
    is_editable,
    auth_user?.name,
    refresh,
  );

  const [mounted_tabs, set_mounted_tabs] = useState<Set<Phase>>(new Set([state.active_tab]));
  useEffect(() => {
    set_mounted_tabs((prev) => {
      if (prev.has(state.active_tab)) return prev;
      const next = new Set(prev);
      next.add(state.active_tab);
      return next;
    });
  }, [state.active_tab]);

  const handle_toggle_step = useCallback(
    (step_id: string) => {
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
    },
    [is_admin, state, autosave],
  );

  const handle_toggle_na = useCallback(
    (step_id: string) => {
      if (!is_admin) {
        toast.error("Solo administradores pueden marcar pasos como N/A.");
        return;
      }
      state.set_na_steps((prev) => {
        const next_steps = new Set(prev);
        if (next_steps.has(step_id)) next_steps.delete(step_id);
        else next_steps.add(step_id);
        return next_steps;
      });
      autosave.mark_as_modified();
    },
    [is_admin, state, autosave],
  );

  const handle_proceed_next_phase = async () => {
    if (!is_editable) return;
    const phase_order: Phase[] = is_admin 
      ? ["Resumen", "Plan", "Do", "Check", "Act", "Evaluacion"]
      : ["Resumen", "Plan", "Do", "Check", "Act"];
      
    const current_idx = phase_order.indexOf(state.active_tab);
    
    if ((state.active_tab === "Act" && !is_admin) || state.active_tab === "Evaluacion") {
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
          current_pdca.historial && current_pdca.historial.length > 0 && current_pdca.historial[0]
            ? new Date(current_pdca.historial[0].timestamp).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Desconocida"
        }
        deadline_string={current_pdca.fechaFinalizacion ?? null}
        completed_steps={state.completed_steps}
        na_steps={state.na_steps}
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
        naSteps={state.na_steps}
        isAdmin={is_admin}
      />

      {mounted_tabs.has("Resumen") && (
        <div className={state.active_tab !== "Resumen" ? "hidden" : "block"}>
          <PdcaPhaseResumen
            goal_definition={state.definition_goal}
            vpo_checkpoints={state.vpo_checkpoints}
            pareto_data_map={state.pareto_data_map}
            nuevo_pareto_data_map={state.nuevo_pareto_data_map}
            impact_matrix={state.impact_matrix}
            final_time_series_data={state.final_time_series_data}
            progreso={computed_progress}
            action_items={state.action_items}
          />
        </div>
      )}

      {mounted_tabs.has("Plan") && (
        <div className={state.active_tab !== "Plan" ? "hidden" : "block"}>
          <PdcaPlanTabContent
            state={state}
            autosave={autosave}
            available_users={available_users}
            is_admin={is_admin}
            is_editable={is_editable}
            on_toggle_step={handle_toggle_step}
            on_toggle_na={handle_toggle_na}
          />
        </div>
      )}

      {mounted_tabs.has("Do") && (
        <div className={state.active_tab !== "Do" ? "hidden" : "block"}>
          <PdcaDoTabContent
            state={state}
            autosave={autosave}
            on_toggle_step={handle_toggle_step}
            on_toggle_na={handle_toggle_na}
          />
        </div>
      )}

      {mounted_tabs.has("Check") && (
        <div className={state.active_tab !== "Check" ? "hidden" : "block"}>
          <PdcaCheckTabContent
            state={state}
            autosave={autosave}
            on_toggle_step={handle_toggle_step}
            on_toggle_na={handle_toggle_na}
          />
        </div>
      )}

      {mounted_tabs.has("Act") && (
        <div className={state.active_tab !== "Act" ? "hidden" : "block"}>
          <PdcaActTabContent
            state={state}
            autosave={autosave}
            is_editable={is_editable}
            on_toggle_step={handle_toggle_step}
            on_toggle_na={handle_toggle_na}
          />
        </div>
      )}

      <PdcaBottomSection
        state={state}
        autosave={autosave}
        auth_user={auth_user}
      />

      {is_admin && mounted_tabs.has("Evaluacion") && (
        <div className={state.active_tab !== "Evaluacion" ? "hidden" : "block"}>
          <PdcaItfR2d2
            evaluation={state.itf_r2d2_evaluation}
            onChange={(ev) => {
              state.set_itf_r2d2_evaluation(ev);
              autosave.mark_as_modified();
            }}
            disabled={!is_editable}
            currentUser={auth_user}
          />
        </div>
      )}

      <PdcaDialogFooter
        current_phase={state.active_tab}
        document_identifier={current_pdca.id}
        is_user_permitted_to_edit={is_editable}
        on_proceed_next_phase={handle_proceed_next_phase}
        on_close_dialog={() => onOpenChange(false)}
        isAdmin={is_admin}
      />
    </div>
  );
};
