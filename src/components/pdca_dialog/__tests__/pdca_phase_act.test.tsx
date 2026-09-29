import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaPhaseAct } from "../04-act/pdca_phase_act";

describe("PdcaPhaseAct", () => {
  it("debe renderizar los pasos de la fase de Ejecucion", () => {
    render(
      <PdcaPhaseAct
        tabla_estandarizacion={[]}
        on_tabla_estandarizacion_change={vi.fn()}
        completed_steps={new Set()}
        na_steps={new Set()}
        on_toggle_step={vi.fn()}
        is_editable={true}
      />
    );

    expect(screen.getByText(/PASO 27/i)).toBeDefined();
    expect(screen.getByText(/PASO 28/i)).toBeDefined();
    expect(screen.getByText(/PASO 29/i)).toBeDefined();
    expect(screen.getByText(/PASO 30/i)).toBeDefined();
    expect(screen.getByText(/PASO 31/i)).toBeDefined();
    expect(screen.getByText(/PASO 32/i)).toBeDefined();
  });
});
