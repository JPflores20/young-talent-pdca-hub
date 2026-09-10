/**
 * Pruebas unitarias para `pdca-cache.ts`.
 * El módulo de caché es puro (sin efectos secundarios externos),
 * lo que lo hace ideal para pruebas rápidas sin mocks de Firebase.
 */
import { describe, it, expect, beforeEach } from "vitest";
import {
  set_pdca_snapshot,
  get_pdca_snapshot,
  remove_pdca_snapshot,
  patch_pdca_snapshot,
  is_deep_equal,
  get_shallow_diff,
} from "../pdca-cache";

// Limpiar el estado del módulo entre tests usando side effects
// controlados (el mapa vive en el módulo, no en window).
// Como Vitest re-importa módulos entre suites, el estado es fresco.

describe("set_pdca_snapshot / get_pdca_snapshot", () => {
  it("almacena y recupera un snapshot serializado correctamente", () => {
    const pdca_mock = { id: "PDCA-001", titulo: "Test", progreso: 50 };
    set_pdca_snapshot("PDCA-001", pdca_mock);

    const stored = get_pdca_snapshot("PDCA-001");
    expect(stored).toBe(JSON.stringify(pdca_mock));
  });

  it("retorna undefined para un id que no existe", () => {
    expect(get_pdca_snapshot("PDCA-INEXISTENTE")).toBeUndefined();
  });

  it("sobrescribe el snapshot si se llama dos veces con el mismo id", () => {
    set_pdca_snapshot("PDCA-002", { titulo: "Original" });
    set_pdca_snapshot("PDCA-002", { titulo: "Actualizado" });

    const stored = get_pdca_snapshot("PDCA-002");
    expect(stored).toContain("Actualizado");
    expect(stored).not.toContain("Original");
  });
});

describe("remove_pdca_snapshot", () => {
  it("elimina el snapshot y retorna undefined después de la eliminación", () => {
    set_pdca_snapshot("PDCA-003", { id: "PDCA-003" });
    remove_pdca_snapshot("PDCA-003");

    expect(get_pdca_snapshot("PDCA-003")).toBeUndefined();
  });

  it("no lanza error al eliminar un id que no existe", () => {
    expect(() => remove_pdca_snapshot("PDCA-INEXISTENTE")).not.toThrow();
  });
});

describe("patch_pdca_snapshot", () => {
  it("aplica el parche parcial sobre el snapshot existente", () => {
    set_pdca_snapshot("PDCA-004", { id: "PDCA-004", progreso: 30, titulo: "Original" });
    patch_pdca_snapshot("PDCA-004", { progreso: 80 });

    const stored = JSON.parse(get_pdca_snapshot("PDCA-004")!);
    expect(stored.progreso).toBe(80);
    expect(stored.titulo).toBe("Original");
  });

  it("no hace nada si el id no existe en caché", () => {
    expect(() => patch_pdca_snapshot("PDCA-INEXISTENTE", { progreso: 100 })).not.toThrow();
  });
});

describe("is_deep_equal", () => {
  it("retorna true para primitivos iguales", () => {
    expect(is_deep_equal(1, 1)).toBe(true);
    expect(is_deep_equal("hola", "hola")).toBe(true);
    expect(is_deep_equal(null, null)).toBe(true);
  });

  it("retorna false para primitivos distintos", () => {
    expect(is_deep_equal(1, 2)).toBe(false);
    expect(is_deep_equal("a", "b")).toBe(false);
    expect(is_deep_equal(null, undefined)).toBe(false);
  });

  it("retorna true para objetos con la misma estructura", () => {
    expect(is_deep_equal({ a: 1, b: [2, 3] }, { a: 1, b: [2, 3] })).toBe(true);
  });

  it("retorna false para objetos con estructura diferente", () => {
    expect(is_deep_equal({ a: 1 }, { a: 2 })).toBe(false);
    expect(is_deep_equal({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("retorna false cuando uno es array y el otro es objeto", () => {
    expect(is_deep_equal([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  it("retorna true para arreglos anidados iguales", () => {
    expect(is_deep_equal([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 2 }])).toBe(true);
  });
});

describe("get_shallow_diff", () => {
  it("retorna objeto vacío si no hay diferencias", () => {
    const original = { a: 1, b: "hola" };
    const current = { a: 1, b: "hola" };
    expect(get_shallow_diff(original, current)).toEqual({});
  });

  it("retorna sólo los campos que cambiaron", () => {
    const original = { a: 1, b: "hola", c: [1, 2] };
    const current = { a: 99, b: "hola", c: [1, 2] };
    expect(get_shallow_diff(original, current)).toEqual({ a: 99 });
  });

  it("incluye campos nuevos que no existían en original", () => {
    const original: Record<string, unknown> = { a: 1 };
    const current = { a: 1, b: "nuevo" };
    expect(get_shallow_diff(original, current)).toEqual({ b: "nuevo" });
  });

  it("detecta cambios en arreglos anidados", () => {
    const original = { acciones: [{ id: "a1", done: false }] };
    const current = { acciones: [{ id: "a1", done: true }] };
    const diff = get_shallow_diff(original, current);
    expect(diff).toHaveProperty("acciones");
  });
});
