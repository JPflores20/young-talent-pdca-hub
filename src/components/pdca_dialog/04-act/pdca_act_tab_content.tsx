import React from "react";
import { PdcaPhaseAct } from "./pdca_phase_act";
import type { PdcaDialogState } from "../hooks/use_pdca_dialog_state";

interface PdcaActTabContentProps {
  state: PdcaDialogState;
  autosave: { mark_as_modified: () => void };
  is_editable: boolean;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na: (step_id: string) => void;
}

export const PdcaActTabContent: React.FC<PdcaActTabContentProps> = ({
  state,
  autosave,
  is_editable,
  on_toggle_step,
  on_toggle_na,
}) => {
  return (
    <PdcaPhaseAct
      analisis_riesgos_estandarizacion={state.analisis_riesgos_estandarizacion}
      on_analisis_riesgos_estandarizacion_change={(data) => {
        state.set_analisis_riesgos_estandarizacion(data);
        autosave.mark_as_modified();
      }}
      tabla_estandarizacion={state.tabla_estandarizacion}
      on_tabla_estandarizacion_change={(data) => {
        state.set_tabla_estandarizacion(data);
        autosave.mark_as_modified();
      }}
      completed_steps={state.completed_steps}
      na_steps={state.na_steps}
      on_toggle_step={on_toggle_step}
      on_toggle_na={on_toggle_na}
      is_editable={is_editable}
      sops_documentos_image={state.sops_documentos_image}
      on_sops_documentos_image_change={(img) => {
        state.set_sops_documentos_image(img);
        autosave.mark_as_modified();
      }}
      plan_entrenamiento_image={state.plan_entrenamiento_image}
      on_plan_entrenamiento_image_change={(img) => {
        state.set_plan_entrenamiento_image(img);
        autosave.mark_as_modified();
      }}
      plan_control_image={state.plan_control_image}
      on_plan_control_image_change={(img) => {
        state.set_plan_control_image(img);
        autosave.mark_as_modified();
      }}
      lecciones_aprendidas={state.lecciones_aprendidas}
      on_lecciones_aprendidas_change={(text) => {
        state.set_lecciones_aprendidas(text);
        autosave.mark_as_modified();
      }}
      conclusiones_finales={state.conclusiones_finales}
      conclusiones_storyboard_image={state.conclusiones_storyboard_image}
      on_conclusiones_storyboard_image_change={(img) => {
        state.set_conclusiones_storyboard_image(img);
        autosave.mark_as_modified();
      }}
      on_conclusiones_finales_change={(c) => {
        state.set_conclusiones_finales(c);
        autosave.mark_as_modified();
      }}
      conclusiones_kpi_data={state.conclusiones_kpi_data}
      on_conclusiones_kpi_data_change={(data) => {
        state.set_conclusiones_kpi_data(data);
        autosave.mark_as_modified();
      }}
      conclusiones_pi_items={state.conclusiones_pi_items}
      on_conclusiones_pi_items_change={(items) => {
        state.set_conclusiones_pi_items(items);
        autosave.mark_as_modified();
      }}
    />
  );
};
