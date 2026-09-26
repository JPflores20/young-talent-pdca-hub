import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaPhaseAct } from "../pdca_phase_act";

describe("PdcaPhaseAct", () => {
  it("debe renderizar los pasos de la fase de Ejecución", () => {
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

    expect(screen.getByText(/PASO 25: ESTANDARIZACIÓN DE PROCESOS/i)).toBeDefined();
    expect(screen.getByText(/PASO 26: SOPs & DOCUMENTOS/i)).toBeDefined();
    expect(screen.getByText(/PASO 27: PLAN DE ENTRENAMIENTO/i)).toBeDefined();
    expect(screen.getByText(/PASO 28: PLAN DE CONTROL/i)).toBeDefined();
    expect(screen.getByText(/PASO 29: LECCIONES APRENDIDAS/i)).toBeDefined();
    expect(screen.getByText(/PASO 30: CONCLUSIONES/i)).toBeDefined();
  });
});