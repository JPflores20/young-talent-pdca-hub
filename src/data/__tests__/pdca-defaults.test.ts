/**
 * Pruebas unitarias para `pdca-defaults.ts`.
 * Valida que los valores por defecto son correctos y completos.
 */
import { describe, it, expect } from "vitest";
import {
  PHASES,
  PHASE_STYLES,
  DEFAULT_PARTICIPANTES,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
  phases,
  phaseStyles,
} from "../pdca-defaults";

describe("PHASES", () => {
  it("contiene exactamente las 4 fases del ciclo PDCA en orden", () => {
    expect(PHASES).toEqual(["Plan", "Do", "Check", "Act"]);
  });

  it("el alias legacy `phases` apunta al mismo arreglo", () => {
    expect(phases).toBe(PHASES);
  });
});

describe("PHASE_STYLES", () => {
  it("tiene una entrada para cada fase del ciclo PDCA", () => {
    expect(Object.keys(PHASE_STYLES)).toEqual(["Plan", "Do", "Check", "Act"]);
  });

  it("cada estilo es un string no vacío con clases de Tailwind", () => {
    for (const style of Object.values(PHASE_STYLES)) {
      expect(typeof style).toBe("string");
      expect(style.length).toBeGreaterThan(0);
    }
  });

  it("el alias legacy `phaseStyles` apunta al mismo objeto", () => {
    expect(phaseStyles).toBe(PHASE_STYLES);
  });
});

describe("DEFAULT_PARTICIPANTES", () => {
  it("todos los campos son strings vacíos por defecto", () => {
    const fields = Object.values(DEFAULT_PARTICIPANTES);
    expect(fields.every((v) => v === "")).toBe(true);
  });

  it("contiene los 6 campos esperados", () => {
    expect(DEFAULT_PARTICIPANTES).toMatchObject({
      locales_nombres: "",
      locales_roles: "",
      externos_nombres: "",
      externos_roles: "",
      fecha_reunion_inicial: "",
      reunion_rutina: "",
    });
  });
});

describe("DEFAULT_TARGET_VS_ACTUAL", () => {
  it("contiene exactamente 12 meses", () => {
    expect(DEFAULT_TARGET_VS_ACTUAL).toHaveLength(12);
  });

  it("el primer mes es Ene y el último es Dic", () => {
    expect(DEFAULT_TARGET_VS_ACTUAL[0].mes).toBe("Ene");
    expect(DEFAULT_TARGET_VS_ACTUAL[11].mes).toBe("Dic");
  });

  it("los meses del 6 al 12 tienen `actual` nulo (pendientes)", () => {
    const pending_months = DEFAULT_TARGET_VS_ACTUAL.slice(5);
    expect(pending_months.every((m) => m.actual === null)).toBe(true);
  });
});

describe("DEFAULT_PARETO_DATA_MAP", () => {
  it("tiene la clave raíz `root`", () => {
    expect(DEFAULT_PARETO_DATA_MAP).toHaveProperty("root");
  });

  it("cada elemento en `root` tiene id, area y gap", () => {
    for (const item of DEFAULT_PARETO_DATA_MAP.root) {
      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("area");
      expect(typeof item.gap).toBe("number");
    }
  });
});

describe("DEFAULT_VPO_CHECKPOINTS", () => {
  it("contiene exactamente 14 checkpoints VPO", () => {
    expect(DEFAULT_VPO_CHECKPOINTS).toHaveLength(14);
  });

  it("cada checkpoint tiene id único", () => {
    const ids = DEFAULT_VPO_CHECKPOINTS.map((c) => c.id);
    const unique_ids = new Set(ids);
    expect(unique_ids.size).toBe(ids.length);
  });

  it("todos los checkpoints tienen status vacío por defecto", () => {
    expect(DEFAULT_VPO_CHECKPOINTS.every((c) => c.status === "")).toBe(true);
  });

  it("todos los checkpoints tienen evidencia vacía por defecto", () => {
    expect(DEFAULT_VPO_CHECKPOINTS.every((c) => c.evidencia === "")).toBe(true);
  });

  it("los ids siguen el patrón vpo-N", () => {
    DEFAULT_VPO_CHECKPOINTS.forEach((c, index) => {
      expect(c.id).toBe(`vpo-${index + 1}`);
    });
  });
});
