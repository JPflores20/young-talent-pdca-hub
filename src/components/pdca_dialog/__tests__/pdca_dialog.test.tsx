import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaDialog } from "../pdca_dialog";
import type { Pdca } from "@/data/pdca";

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    currentUser: { name: "Ingeniero Modelo", email: "modelo@corona.com", role: "admin" },
    usersList: [{ name: "Ingeniero Modelo", email: "modelo@corona.com" }],
  }),
}));

vi.mock("@/services/pdca-service", () => ({
  savePdcaToFirestore: vi.fn().mockResolvedValue(true),
}));

const sample_pdca: Pdca = {
  id: "PDCA-2026-UNIT",
  titulo: "Proyecto de Reducción de Pérdidas",
  area: "cocimientos",
  fase: "Plan",
  actualizado: "01/01/2026",
  progreso: 10,
  problema: "Variación térmica",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Temperatura", antes: 80, despues: 70, unidad: "°C" },
  serie: [],
  equipo: [],
};

describe("PdcaDialog (Componente Refactorizado)", () => {
  it("debe renderizar el diálogo con el título del proyecto y los campos de metadatos", () => {
    render(<PdcaDialog pdca={sample_pdca} open={true} onOpenChange={vi.fn()} />);

    expect(screen.getByText("PDCA-2026-UNIT")).toBeDefined();
    expect(screen.getByDisplayValue("Proyecto de Reducción de Pérdidas")).toBeDefined();
    expect(screen.getByText("Guardar PDCA")).toBeDefined();
    expect(screen.getByText("Exportar PDF")).toBeDefined();
  });
});
