import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaDialogHeader } from "../pdca_dialog_header";

const BASE_PROPS = {
  current_phase: "Plan" as const,
  document_identifier: "PDCA-2026-001",
  pdca_title: "Test PDCA Title",
  last_updated: "10 sept 2026",
  completed_steps: new Set<string>(),
  is_saving_in_progress: false,
  has_pending_modifications: false,
  is_user_permitted_to_edit: true,
  on_trigger_firestore_save: vi.fn().mockResolvedValue(true),
  on_go_back: vi.fn(),
};

describe("PdcaDialogHeader", () => {
  it("debe mostrar el identificador del documento y el badge de fase", () => {
    render(<PdcaDialogHeader {...BASE_PROPS} />);

    expect(screen.getByText("PDCA-2026-001")).toBeDefined();
    expect(screen.getByText("Sincronizado")).toBeDefined();
    expect(screen.getByText("Test PDCA Title")).toBeDefined();
  });

  it("debe mostrar estado de 'Cambios pendientes' y responder al clic de guardar", () => {
    const handle_save = vi.fn().mockResolvedValue(true);

    render(
      <PdcaDialogHeader
        {...BASE_PROPS}
        has_pending_modifications={true}
        on_trigger_firestore_save={handle_save}
      />
    );

    expect(screen.getByText("Cambios pendientes")).toBeDefined();
    const save_button = screen.getByRole("button", { name: /Guardar PDCA/i });
    fireEvent.click(save_button);

    expect(handle_save).toHaveBeenCalledTimes(1);
  });

  it("debe mostrar el progreso correctamente con pasos completados", () => {
    const steps = new Set(["step-1", "step-3", "step-4"]);
    render(<PdcaDialogHeader {...BASE_PROPS} completed_steps={steps} />);

    expect(screen.getByText(/3\/12 pasos/)).toBeDefined();
    expect(screen.getByText("25%")).toBeDefined();
  });

  it("debe ejecutar on_go_back al clic en volver", () => {
    const go_back = vi.fn();
    render(<PdcaDialogHeader {...BASE_PROPS} on_go_back={go_back} />);

    fireEvent.click(screen.getByText("Volver a Mis PDCAs"));
    expect(go_back).toHaveBeenCalledTimes(1);
  });
});
