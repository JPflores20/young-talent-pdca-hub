import React from "react";
import { ActionPlanTable } from "../pdca-dialog/action-plan-table";
import { EvidenciasSolucionStep } from "../pdca-dialog/evidencias-solucion-step";
import { ImageUploadSection } from "../image-upload-section";
import type { ActionItem } from "@/data/pdca";

interface PhaseDoProps {
  action_items: ActionItem[];
  on_action_items_change: (items: ActionItem[]) => void;
  evidencias_solucion: any[];
  on_evidencias_solucion_change: (evs: any[]) => void;
  kpi_tree_foco_image?: string;
  on_kpi_tree_foco_image_change: (img: string | undefined) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
}

export const PdcaPhaseDo: React.FC<PhaseDoProps> = ({
  action_items,
  on_action_items_change,
  evidencias_solucion,
  on_evidencias_solucion_change,
  kpi_tree_foco_image,
  on_kpi_tree_foco_image_change,
  completed_steps,
  on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 18: Plan de acción ───────────────────────────────────── */}
      <ActionPlanTable
        items={action_items || []}
        onChange={on_action_items_change}
        isStepCompleted={completed_steps.has("step-18")}
        onToggleStep={() => on_toggle_step("step-18")}
      />

      {/* ── PASO 19: Evidencia de soluciones ──────────────────────────── */}
      <EvidenciasSolucionStep
        actions={action_items || []}
        evidencias={evidencias_solucion || []}
        onEvidenciasChange={on_evidencias_solucion_change}
        isStepCompleted={completed_steps.has("step-19")}
        onToggleStep={() => on_toggle_step("step-19")}
      />

      {/* ── PASO 20: Arbol de KPII's con PIS foco ─────────────────────── */}
      <div className="border border-border rounded-xl p-4 bg-secondary/10">
        <ImageUploadSection
          image={kpi_tree_foco_image || null}
          onChange={(img) => on_kpi_tree_foco_image_change(img || undefined)}
          title="PASO 20: ÁRBOL DE KPII'S CON PIS FOCO"
          subtitle="Sube la imagen del KPI Tree objetivo"
          isStepCompleted={completed_steps.has("step-20")}
          onToggleStep={() => on_toggle_step("step-20")}
        />
      </div>
    </div>
  );
};
