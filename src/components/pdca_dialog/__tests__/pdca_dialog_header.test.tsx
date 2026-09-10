import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaDialogHeader } from "../pdca_dialog_header";

describe("PdcaDialogHeader", () => {
  it("debe mostrar el identificador del documento y el badge de fase", () => {
    render(
      <PdcaDialogHeader
        current_phase="Plan"
        document_identifier="PDCA-2026-001"
        is_saving_in_progress={false}
        has_pending_modifications={false}
        is_user_permitted_to_edit={true}
        on_trigger_firestore_save={vi.fn()}
      />
    );

    expect(screen.getByText("PDCA-2026-001")).toBeDefined();
    expect(screen.getByText("Sincronizado")).toBeDefined();
  });

  it("debe mostrar estado de 'Cambios pendientes' y responder al clic de guardar", () => {
    const handle_save = vi.fn().mockResolvedValue(true);

    render(
      <PdcaDialogHeader
        current_phase="Plan"
        document_identifier="PDCA-2026-001"
        is_saving_in_progress={false}
        has_pending_modifications={true}
        is_user_permitted_to_edit={true}
        on_trigger_firestore_save={handle_save}
      />
    );

    expect(screen.getByText("Cambios pendientes")).toBeDefined();
    const save_button = screen.getByRole("button", { name: /Guardar PDCA/i });
    fireEvent.click(save_button);

    expect(handle_save).toHaveBeenCalledTimes(1);
  });
});
