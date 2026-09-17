import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaPhaseAct } from "../pdca_phase_act";

describe("PdcaPhaseAct", () => {
  it("debe renderizar los pasos 8.2, 9, 10 y 11 de la fase de Ejecución", () => {
    render(
      <PdcaPhaseAct
        action_items={[]}
        on_action_items_change={vi.fn()}
        kpi_final_result_data={[]}
        on_kpi_final_result_change={vi.fn()}
        kpi_final_result_unit="%"
        on_kpi_final_result_unit_change={vi.fn()}
        gemba_evidencias={[]}
        on_gemba_evidencias_change={vi.fn()}
        gemba_final_images={[]}
        on_gemba_final_images_change={vi.fn()}
        completed_steps={new Set()}
        on_toggle_step={vi.fn()}
        is_editable={true}
      />,
    );

    expect(screen.getByText(/PASO 8.2: PLAN DE ACCIÓN/i)).toBeDefined();
    expect(screen.getByText(/PASO 9: GEMBA/i)).toBeDefined();
    expect(screen.getByText(/PASO 10: KPI FINAL RESULT/i)).toBeDefined();
    expect(screen.getByText(/PASO 11: GEMBA FINAL/i)).toBeDefined();
  });
});
