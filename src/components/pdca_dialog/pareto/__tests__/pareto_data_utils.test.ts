/**
 * pareto_data_utils.test.ts
 * Pruebas unitarias para las funciones de cálculo del módulo Pareto.
 */
import { describe, it, expect } from "vitest";
import {
  compute_pareto_data,
  format_pareto_value,
  parse_excel_paste,
  compute_total_gap,
} from "../pareto_data_utils";
import type { ParetoItem } from "../pareto_types";

const SAMPLE_ITEMS: ParetoItem[] = [
  { id: 1, area: "Esters", gap: 8 },
  { id: 2, area: "Sweet", gap: 7 },
  { id: 3, area: "Yeast", gap: 6 },
  { id: 4, area: "Tart", gap: 4 },
];

describe("compute_pareto_data", () => {
  it("ordena los items de mayor a menor gap", () => {
    const result = compute_pareto_data(SAMPLE_ITEMS);
    expect(result[0].area).toBe("Esters");
    expect(result[0].gap).toBe(8);
    expect(result[1].area).toBe("Sweet");
  });

  it("calcula el porcentaje individual correctamente", () => {
    const result = compute_pareto_data(SAMPLE_ITEMS);
    const total = 8 + 7 + 6 + 4; // 25
    expect(result[0].ind_pct).toBeCloseTo((8 / total) * 100, 1);
  });

  it("calcula el porcentaje acumulado correctamente", () => {
    const result = compute_pareto_data(SAMPLE_ITEMS);
    const total = 25;
    const expected_cum_first_two = ((8 + 7) / total) * 100;
    expect(result[1].cum_pct).toBeCloseTo(expected_cum_first_two, 1);
  });

  it("el último item siempre acumula 100%", () => {
    const result = compute_pareto_data(SAMPLE_ITEMS);
    expect(result[result.length - 1].cum_pct).toBeCloseTo(100, 1);
  });

  it("maneja lista vacía sin errores", () => {
    const result = compute_pareto_data([]);
    expect(result).toHaveLength(0);
  });

  it("maneja gaps nulos tratándolos como cero", () => {
    const items = [{ id: 1, area: "A", gap: null as unknown as number }];
    const result = compute_pareto_data(items);
    expect(result[0].ind_pct).toBe(0);
  });
});

describe("format_pareto_value", () => {
  it("formatea con unidad de porcentaje", () => {
    expect(format_pareto_value(8, "%")).toBe("8.00%");
  });

  it("formatea con unidad de dólar", () => {
    expect(format_pareto_value(1000, "$")).toBe("$1,000.00");
  });

  it("formatea sin unidad", () => {
    expect(format_pareto_value(42.5, "")).toBe("42.50");
  });

  it("retorna cadena vacía para valores nulos", () => {
    expect(format_pareto_value(null, "%")).toBe("");
    expect(format_pareto_value(undefined, "%")).toBe("");
    expect(format_pareto_value(NaN, "%")).toBe("");
  });
});

describe("parse_excel_paste", () => {
  it("parsea texto tab-separado correctamente", () => {
    const raw = "Falla A\t10\nFalla B\t5";
    const result = parse_excel_paste(raw, []);
    const falla_a = result.find((r) => r.area === "Falla A");
    expect(falla_a?.gap).toBe(10);
  });

  it("agrupa filas duplicadas sumando sus valores", () => {
    const raw = "Falla A\t10\nFalla A\t15";
    const result = parse_excel_paste(raw, []);
    const falla_a = result.find((r) => r.area === "Falla A");
    expect(falla_a?.gap).toBe(25);
  });

  it("fusiona con items existentes", () => {
    const raw = "Falla B\t5";
    const existing: ParetoItem[] = [{ id: 1, area: "Falla A", gap: 10 }];
    const result = parse_excel_paste(raw, existing);
    expect(result).toHaveLength(2);
  });

  it("ignora líneas vacías", () => {
    const raw = "Falla A\t10\n\n\nFalla B\t5";
    const result = parse_excel_paste(raw, []);
    expect(result).toHaveLength(2);
  });
});

describe("compute_total_gap", () => {
  it("calcula la suma correctamente", () => {
    expect(compute_total_gap(SAMPLE_ITEMS)).toBe(25);
  });

  it("retorna 0 para lista vacía", () => {
    expect(compute_total_gap([])).toBe(0);
  });
});
