/**
 * Pruebas unitarias para `use-pdca-metrics.ts`.
 */
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { renderHook } from "@testing-library/react";
import { use_pdca_metrics } from "../use-pdca-metrics";
import type { Pdca } from "@/data/pdca-types";

// Mock the current date to make tests deterministic
beforeAll(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-08T12:00:00Z"));
});

afterAll(() => {
  vi.useRealTimers();
});

function create_pdca(partial: Partial<Pdca>): Pdca {
  return {
    id: "test",
    titulo: "test",
    area: "",
    fase: "Plan",
    actualizado: "",
    progreso: 0,
    problema: "",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "", antes: 0, despues: 0, unidad: "" },
    serie: [],
    ...partial,
  };
}

describe("use_pdca_metrics", () => {
  it("retorna todo en 0 con un arreglo vacío", () => {
    const { result } = renderHook(() => use_pdca_metrics([]));
    expect(result.current).toEqual({
      activos: 0,
      cerrados: 0,
      bloque_frio: 0,
      cocimientos: 0,
      vencidos: 0,
      a_tiempo: 0,
    });
  });

  it("cuenta correctamente activos vs cerrados", () => {
    const data = [
      create_pdca({ fase: "Act", progreso: 100 }), // Cerrado
      create_pdca({ fase: "Act", progreso: 99 }), // Activo
      create_pdca({ fase: "Plan", progreso: 0 }), // Activo
    ];

    const { result } = renderHook(() => use_pdca_metrics(data));
    expect(result.current.cerrados).toBe(1);
    expect(result.current.activos).toBe(2);
  });

  it("clasifica por áreas usando coincidencias parciales case-insensitive", () => {
    const data = [
      create_pdca({ area: "Cuartos Fríos" }),
      create_pdca({ area: "bloque frio" }),
      create_pdca({ area: "Cocimientos L1" }),
      create_pdca({ area: "Envasado" }), // Ninguno
    ];

    const { result } = renderHook(() => use_pdca_metrics(data));
    expect(result.current.bloque_frio).toBe(2);
    expect(result.current.cocimientos).toBe(1);
  });

  it("calcula vencidos vs a tiempo para los PDCAs activos (referencia: 2026-09-08)", () => {
    const data = [
      // Vencido (anterior a sep 8)
      create_pdca({ fase: "Plan", fecha_finalizacion: "2026-09-01" }),
      // A tiempo (posterior a sep 8)
      create_pdca({ fase: "Plan", fecha_finalizacion: "2026-10-01" }),
      // A tiempo (hoy)
      create_pdca({ fase: "Plan", fecha_finalizacion: "2026-09-08" }),
      // Cerrado pero fecha pasada (no debe contar en vencidos ni a tiempo)
      create_pdca({ fase: "Act", progreso: 100, fecha_finalizacion: "2026-01-01" }),
      // Sin fecha (no cuenta)
      create_pdca({ fase: "Plan", fecha_finalizacion: "" }),
    ];

    const { result } = renderHook(() => use_pdca_metrics(data));
    expect(result.current.vencidos).toBe(1);
    expect(result.current.a_tiempo).toBe(2);
  });
});
