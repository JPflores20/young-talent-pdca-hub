import React from "react";
import { PdcaPhaseDo } from "./pdca_phase_do";
import type { PdcaDialogState } from "../hooks/use_pdca_dialog_state";

interface PdcaDoTabContentProps {
  state: PdcaDialogState;
  autosave: { mark_as_modified: () => void };
  on_toggle_step: (step_id: string) => void;
  on_toggle_na: (step_id: string) => void;
}

export const PdcaDoTabContent: React.FC<PdcaDoTabContentProps> = ({
  state,
  autosave,
  on_toggle_step,
  on_toggle_na,
}) => {
  return (
    <PdcaPhaseDo
      action_items={state.action_items}
      on_action_items_change={(a) => {
        state.set_action_items(a);
        autosave.mark_as_modified();
      }}
      evidencias_solucion={state.evidencias_solucion}
      on_evidencias_solucion_change={(evs) => {
        state.set_evidencias_solucion(evs);
        autosave.mark_as_modified();
      }}
      kpi_tree_foco_image={state.kpi_tree_foco_image}
      on_kpi_tree_foco_image_change={(img) => {
        state.set_kpi_tree_foco_image(img);
        autosave.mark_as_modified();
      }}
      completed_steps={state.completed_steps}
      na_steps={state.na_steps}
      on_toggle_step={on_toggle_step}
      on_toggle_na={on_toggle_na}
    />
  );
};
