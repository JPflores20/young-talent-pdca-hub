import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaPhaseAct } from "../pdca_phase_act";

describe("PdcaPhaseAct", () => {
  it("debe renderizar el Kanban del Paso 8 y la Estandarización del Paso 9", () => {
    render(
      <PdcaPhaseAct
        action_items={[]}
        on_action_items_change={vi.fn()}
        kpi_final_result_data={[]}
        on_kpi_final_result_change={vi.fn()}
        kpi_final_result_unit="%"
        on_kpi_final_result_unit_change={vi.fn()}
        gemba_final_image={null}
        on_gemba_final_image_change={vi.fn()}
        completed_steps={new Set()}
        on_toggle_step={vi.fn()}
        is_editable={true}
      />
    );

    expect(screen.getByText(/PASO 8: PLAN DE ACCIÓN/i)).toBeDefined();
    expect(screen.getByText(/PASO 9: ESTANDARIZACIÓN/i)).toBeDefined();
  });
});
