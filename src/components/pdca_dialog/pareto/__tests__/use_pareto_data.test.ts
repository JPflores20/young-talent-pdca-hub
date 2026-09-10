/**
 * use_pareto_data.test.ts
 * Pruebas unitarias del hook use_pareto_data.
 * Cubre: cálculos de pareto, CRUD de filas, importación Excel y estado UI.
 */
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { use_pareto_data } from "../use_pareto_data";
import type { ParetoItem } from "../pareto_types";

const SAMPLE_ITEMS: ParetoItem[] = [
  { id: 1, area: "Esters", gap: 8 },
  { id: 2, area: "Sweet", gap: 7 },
  { id: 3, area: "Yeast", gap: 6 },
  { id: 4, area: "Tart", gap: 4 },
];

// ─── compute_pareto_data (via hook) ─────────────────────────────────────────

describe("use_pareto_data › pareto_data calculation", () => {
  it("ordena los items de mayor a menor gap", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS })
    );
    expect(result.current.pareto_data[0].area).toBe("Esters");
    expect(result.current.pareto_data[0].gap).toBe(8);
    expect(result.current.pareto_data[1].area).toBe("Sweet");
  });

  it("acumula el porcentaje acumulado correctamente", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS })
    );
    const total = 8 + 7 + 6 + 4; // 25
    const expected_first = (8 / total) * 100;
    const expected_second = ((8 + 7) / total) * 100;
    expect(result.current.pareto_data[0].cum_pct).toBeCloseTo(expected_first, 1);
    expect(result.current.pareto_data[1].cum_pct).toBeCloseTo(expected_second, 1);
  });

  it("el último ítem acumula exactamente 100%", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS })
    );
    const last = result.current.pareto_data[result.current.pareto_data.length - 1];
    expect(last.cum_pct).toBeCloseTo(100, 1);
  });

  it("calcula total_gap sumando todos los gaps", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS })
    );
    expect(result.current.total_gap).toBe(25);
  });

  it("retorna arreglo vacío cuando no hay items", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: [] })
    );
    expect(result.current.pareto_data).toHaveLength(0);
    expect(result.current.total_gap).toBe(0);
  });
});

// ─── add_row ─────────────────────────────────────────────────────────────────

describe("use_pareto_data › add_row", () => {
  it("llama a on_items_change con una fila vacía agregada", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change })
    );
    act(() => {
      result.current.add_row();
    });
    expect(mock_change).toHaveBeenCalledOnce();
    const called_with: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(called_with).toHaveLength(SAMPLE_ITEMS.length + 1);
    const new_row = called_with[called_with.length - 1];
    expect(new_row.area).toBe("");
    expect(new_row.gap).toBe(0);
  });

  it("no lanza error cuando on_items_change no está definido", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS })
    );
    expect(() => act(() => result.current.add_row())).not.toThrow();
  });
});

// ─── remove_row ──────────────────────────────────────────────────────────────

describe("use_pareto_data › remove_row", () => {
  it("elimina la fila con el id dado", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change })
    );
    act(() => {
      result.current.remove_row(2); // remove "Sweet"
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated.find((r) => r.id === 2)).toBeUndefined();
    expect(updated).toHaveLength(SAMPLE_ITEMS.length - 1);
  });
});

// ─── update_row ──────────────────────────────────────────────────────────────

describe("use_pareto_data › update_row", () => {
  it("actualiza el campo 'area' de la fila correcta", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change })
    );
    act(() => {
      result.current.update_row(1, "area", "Estery");
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated.find((r) => r.id === 1)?.area).toBe("Estery");
  });

  it("actualiza el campo 'gap' de la fila correcta", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change })
    );
    act(() => {
      result.current.update_row(3, "gap", 99);
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated.find((r) => r.id === 3)?.gap).toBe(99);
  });

  it("no modifica otras filas al actualizar", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: SAMPLE_ITEMS, on_items_change: mock_change })
    );
    act(() => {
      result.current.update_row(1, "gap", 100);
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated.find((r) => r.id === 2)?.gap).toBe(7);
    expect(updated.find((r) => r.id === 4)?.gap).toBe(4);
  });
});

// ─── format_value ────────────────────────────────────────────────────────────

describe("use_pareto_data › format_value", () => {
  it("formatea con unidad de porcentaje", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: [], unit: "%" })
    );
    expect(result.current.format_value(8)).toBe("8.00%");
  });

  it("formatea con unidad de dólar", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: [], unit: "$" })
    );
    expect(result.current.format_value(1000)).toBe("$1,000.00");
  });

  it("formatea sin unidad", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: [], unit: "" })
    );
    expect(result.current.format_value(42.5)).toBe("42.50");
  });

  it("retorna cadena vacía para valores nulos", () => {
    const { result } = renderHook(() =>
      use_pareto_data({ items: [], unit: "%" })
    );
    expect(result.current.format_value(null)).toBe("");
    expect(result.current.format_value(undefined)).toBe("");
    expect(result.current.format_value(NaN)).toBe("");
  });
});

// ─── handle_import_excel ─────────────────────────────────────────────────────

describe("use_pareto_data › handle_import_excel", () => {
  it("agrega categorías del texto importado", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: [], on_items_change: mock_change })
    );
    act(() => {
      result.current.handle_import_excel("Falla A\t10\nFalla B\t5");
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated.find((r) => r.area === "Falla A")?.gap).toBe(10);
    expect(updated.find((r) => r.area === "Falla B")?.gap).toBe(5);
  });

  it("agrupa categorías duplicadas sumando sus valores", () => {
    const mock_change = vi.fn();
    const { result } = renderHook(() =>
      use_pareto_data({ items: [], on_items_change: mock_change })
    );
    act(() => {
      result.current.handle_import_excel("Falla A\t10\nFalla A\t15");
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated.find((r) => r.area === "Falla A")?.gap).toBe(25);
  });

  it("fusiona con items existentes", () => {
    const mock_change = vi.fn();
    const existing: ParetoItem[] = [{ id: 1, area: "Falla A", gap: 10 }];
    const { result } = renderHook(() =>
      use_pareto_data({ items: existing, on_items_change: mock_change })
    );
    act(() => {
      result.current.handle_import_excel("Falla B\t5");
    });
    const updated: ParetoItem[] = mock_change.mock.calls[0][0];
    expect(updated).toHaveLength(2);
    expect(updated.find((r) => r.area === "Falla A")?.gap).toBe(10);
    expect(updated.find((r) => r.area === "Falla B")?.gap).toBe(5);
  });
});

// ─── UI state ────────────────────────────────────────────────────────────────

describe("use_pareto_data › UI state", () => {
  it("is_paste_open inicia en false", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    expect(result.current.is_paste_open).toBe(false);
  });

  it("set_is_paste_open cambia el estado", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    act(() => result.current.set_is_paste_open(true));
    expect(result.current.is_paste_open).toBe(true);
  });

  it("is_fullscreen inicia en false", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    expect(result.current.is_fullscreen).toBe(false);
  });

  it("set_is_fullscreen cambia el estado", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    act(() => result.current.set_is_fullscreen(true));
    expect(result.current.is_fullscreen).toBe(true);
  });

  it("chart_title inicia vacío", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    expect(result.current.chart_title).toBe("");
  });

  it("set_chart_title actualiza el título", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    act(() => result.current.set_chart_title("Mi Pareto"));
    expect(result.current.chart_title).toBe("Mi Pareto");
  });

  it("y_axis_min inicia en 0", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    expect(result.current.y_axis_min).toBe(0);
  });

  it("y_axis_max inicia en 'auto'", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    expect(result.current.y_axis_max).toBe("auto");
  });

  it("set_y_axis_max cambia a un valor numérico", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    act(() => result.current.set_y_axis_max(100));
    expect(result.current.y_axis_max).toBe(100);
  });

  it("set_y_axis_max vuelve a 'auto'", () => {
    const { result } = renderHook(() => use_pareto_data({ items: [] }));
    act(() => {
      result.current.set_y_axis_max(100);
      result.current.set_y_axis_max("auto");
    });
    expect(result.current.y_axis_max).toBe("auto");
  });
});
