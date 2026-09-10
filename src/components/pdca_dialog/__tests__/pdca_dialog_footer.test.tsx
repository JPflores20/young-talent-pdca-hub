import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaDialogFooter } from "../pdca_dialog_footer";

describe("PdcaDialogFooter", () => {
  it("debe mostrar los botones de cerrar, exportar y avanzar de fase", () => {
    render(
      <PdcaDialogFooter
        current_phase="Plan"
        document_identifier="PDCA-TEST-001"
        is_user_permitted_to_edit={true}
        on_proceed_next_phase={vi.fn()}
        on_close_dialog={vi.fn()}
      />
    );

    expect(screen.getByText("Cerrar Ventana")).toBeDefined();
    expect(screen.getByText("Exportar PDF")).toBeDefined();
    expect(screen.getByText("Siguiente Paso")).toBeDefined();
  });

  it("debe mostrar 'Finalizar PDCA' en la fase Act y responder al clic", () => {
    const handle_proceed = vi.fn().mockResolvedValue(undefined);

    render(
      <PdcaDialogFooter
        current_phase="Act"
        document_identifier="PDCA-TEST-001"
        is_user_permitted_to_edit={true}
        on_proceed_next_phase={handle_proceed}
        on_close_dialog={vi.fn()}
      />
    );

    const finish_button = screen.getByRole("button", { name: /Finalizar PDCA/i });
    expect(finish_button).toBeDefined();

    fireEvent.click(finish_button);
    expect(handle_proceed).toHaveBeenCalledTimes(1);
  });
});
