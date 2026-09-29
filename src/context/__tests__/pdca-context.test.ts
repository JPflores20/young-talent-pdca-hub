/**
 * Pruebas unitarias para `pdca-context.tsx`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import React from "react";
import { PdcaProvider, usePdcas } from "../pdca-context";
import * as auth_context from "../auth-context";
import * as pdca_service from "@/services/pdca-service";
import type { Pdca } from "@/data/pdca-types";

vi.mock("../auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/pdca-service", () => ({
  fetchPdcasFromFirestore: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(PdcaProvider, null, children);
}

function mock_pdca(id: string, autorEmail: string, asignados: any[] = []): Pdca {
  return {
    id,
    titulo: `Test ${id}`,
    area: "Test",
    fase: "Plan",
    actualizado: "",
    progreso: 0,
    problema: "",
    causaRaiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "Test KPI", antes: 0, despues: 0, unidad: "%" },
    serie: [],
    autorEmail,
    asignados,
  };
}

const mock_data = [
  mock_pdca("1", "admin@test.com"),
  mock_pdca("2", "user@test.com"),
  mock_pdca("3", "other@test.com", [{ email: "user@test.com", name: "User" }]),
];

beforeEach(() => {
  vi.clearAllMocks();
  (pdca_service.fetchPdcasFromFirestore as any).mockResolvedValue(mock_data);
});

describe("PdcaProvider / usePdcas", () => {
  it("retorna listas vacias y loading false si no hay usuario logueado", async () => {
    (auth_context.useAuth as any).mockReturnValue({ currentUser: null });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.pdcaList).toEqual([]);
    expect(result.current.allPdcas).toEqual([]);
  });

  it("retorna todos los PDCAs si el usuario es admin", async () => {
    (auth_context.useAuth as any).mockReturnValue({
      currentUser: { role: "admin", email: "admin@test.com", name: "Admin" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.allPdcas).toHaveLength(3);
    });

    expect(result.current.pdcaList).toHaveLength(3);
  });

  it("filtra los PDCAs para usuarios normales", async () => {
    (auth_context.useAuth as any).mockReturnValue({
      currentUser: { role: "user", email: "user@test.com", name: "User" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    await vi.waitFor(() => {
      expect(result.current.allPdcas).toHaveLength(3);
    });

    expect(result.current.pdcaList).toHaveLength(2);
    expect(result.current.pdcaList.map((p: any) => p.id)).toEqual(["2", "3"]);
  });
});
