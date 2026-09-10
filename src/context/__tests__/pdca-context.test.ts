/**
 * Pruebas unitarias para `pdca-context.tsx`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import React from "react";
import { PdcaProvider, usePdcas } from "../pdca-context";
import * as auth_context from "../auth-context";
import * as pdca_firestore from "@/services/pdca-firestore";
import type { Pdca } from "@/data/pdca-types";

vi.mock("../auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/pdca-firestore", () => ({
  subscribe_to_pdcas: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(PdcaProvider, null, children);
}

function mock_pdca(id: string, autor_email: string, asignados: any[] = []): Pdca {
  return {
    id,
    titulo: `Test ${id}`,
    area: "Test",
    fase: "Plan",
    actualizado: "",
    progreso: 0,
    problema: "",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "Test KPI", antes: 0, despues: 0, unidad: "%" },
    serie: [],
    autor_email,
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
  (pdca_firestore.subscribe_to_pdcas as any).mockImplementation((cb: Function) => {
    cb(mock_data);
    return vi.fn(); // mock de unsubscribe
  });
});

describe("PdcaProvider / usePdcas", () => {
  it("lanza error si se usa fuera del provider", () => {
    expect(() => renderHook(() => usePdcas())).toThrow();
  });

  it("retorna listas vacÃ­as y loading false si no hay usuario logueado", () => {
    (auth_context.useAuth as any).mockReturnValue({ current_user: null });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.pdca_list).toEqual([]);
    expect(result.current.all_pdcas).toEqual([]);
  });

  it("retorna todos los PDCAs si el usuario es admin", () => {
    (auth_context.useAuth as any).mockReturnValue({
      current_user: { role: "admin", email: "admin@test.com", name: "Admin" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    expect(result.current.pdca_list).toHaveLength(3);
    expect(result.current.all_pdcas).toHaveLength(3);
  });

  it("filtra los PDCAs para usuarios normales (sÃ³lo propios o asignados)", () => {
    (auth_context.useAuth as any).mockReturnValue({
      current_user: { role: "user", email: "user@test.com", name: "User" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    // DeberÃ­a ver el 2 (es autor) y el 3 (estÃ¡ asignado)
    expect(result.current.all_pdcas).toHaveLength(3);
    expect(result.current.pdca_list).toHaveLength(2);
    expect(result.current.pdca_list.map((p) => p.id)).toEqual(["2", "3"]);
  });

  it("mantiene los alias legacy pdcaList y allPdcas", () => {
    (auth_context.useAuth as any).mockReturnValue({
      current_user: { role: "admin", email: "admin@test.com", name: "Admin" },
    });

    const { result } = renderHook(() => usePdcas(), { wrapper });

    expect(result.current.pdcaList).toBe(result.current.pdca_list);
    expect(result.current.allPdcas).toBe(result.current.all_pdcas);
  });
});
