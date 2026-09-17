/**
 * pareto_data_table.test.tsx
 * Pruebas unitarias del componente ParetoDataTable.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ParetoDataTable } from "../pareto_data_table";
import type { ParetoChartItem, ParetoItem } from "../pareto_types";

const SAMPLE_CHART_ITEMS: ParetoChartItem[] = [
  { id: 1, area: "Esters", gap: 8, ind_pct: 32, cum_pct: 32 },
  { id: 2, area: "Sweet", gap: 7, ind_pct: 28, cum_pct: 60 },
];

const SAMPLE_RAW: ParetoItem[] = [
  { id: 1, area: "Esters", gap: 8 },
  { id: 2, area: "Sweet", gap: 7 },
];

const format_value = (val: unknown) => `${val}`;

describe("ParetoDataTable", () => {
  it("renderiza los encabezados de la tabla", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    expect(screen.getByText("Área / Categoría")).toBeInTheDocument();
    expect(screen.getByText("% Ind.")).toBeInTheDocument();
    expect(screen.getByText("% Acum.")).toBeInTheDocument();
    expect(screen.getByText("TOTAL")).toBeInTheDocument();
  });

  it("renderiza todos los items de datos", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    expect(screen.getByDisplayValue("Esters")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Sweet")).toBeInTheDocument();
  });

  it("llama a on_row_update al cambiar el área", () => {
    const mock_update = vi.fn();
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={mock_update}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    const input = screen.getByDisplayValue("Esters");
    fireEvent.change(input, { target: { value: "Estery" } });
    expect(mock_update).toHaveBeenCalledWith(1, "area", "Estery");
  });

  it("muestra botones de eliminar cuando hay más de un item", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    // Con 2 items, deben aparecer botones de borrar
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("muestra el total correctamente", () => {
    render(
      <ParetoDataTable
        pareto_data={SAMPLE_CHART_ITEMS}
        raw_items={SAMPLE_RAW}
        on_row_update={vi.fn()}
        on_row_remove={vi.fn()}
        format_value={format_value}
        total_gap={15}
      />,
    );
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});
