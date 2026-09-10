import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { use_pdca_dialog_state } from "../hooks/use_pdca_dialog_state";
import type { Pdca } from "@/data/pdca";

const mock_pdca: Pdca = {
  id: "PDCA-TEST-001",
  titulo: "Optimización de Envasado",
  area: "envasado",
  fase: "Plan",
  actualizado: "01/01/2026",
  progreso: 20,
  problema: "Fuga en válvula",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Mermas", antes: 10, despues: 2, unidad: "%" },
  serie: [],
  equipo: ["Operador 1", "Mecánico 1"],
};

describe("use_pdca_dialog_state", () => {
  it("debe inicializar correctamente con los valores provistos del PDCA", () => {
    const { result } = renderHook(() =>
      use_pdca_dialog_state(mock_pdca, { name: "Admin", email: "admin@test.com" })
    );

    expect(result.current.title_value).toBe("Optimización de Envasado");
    expect(result.current.area_value).toBe("envasado");
    expect(result.current.active_tab).toBe("Plan");
    expect(result.current.team_members).toEqual(["Operador 1", "Mecánico 1"]);
  });

  it("debe permitir cambiar de fase activa y modificar el título", () => {
    const { result } = renderHook(() =>
      use_pdca_dialog_state(mock_pdca, { name: "Admin", email: "admin@test.com" })
    );

    act(() => {
      result.current.set_active_tab("Do");
      result.current.set_title_value("Nuevo Título de Prueba");
    });

    expect(result.current.active_tab).toBe("Do");
    expect(result.current.title_value).toBe("Nuevo Título de Prueba");
  });
});
