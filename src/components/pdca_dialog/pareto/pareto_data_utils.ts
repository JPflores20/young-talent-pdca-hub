/**
 * pareto_data_utils.ts
 * Lógica de cálculo pura para el módulo Pareto (sin efectos de UI).
 * Responsabilidad única: transformar y formatear datos de Pareto.
 */
import type { ParetoItem, ParetoChartItem } from "./pareto_types";

/**
 * Ordena items de mayor a menor gap y calcula porcentajes
 * individual y acumulado para el gráfico de Pareto.
 */
export function compute_pareto_data(items: ParetoItem[]): ParetoChartItem[] {
  const sorted = [...items].sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0));
  const total_gap = sorted.reduce((sum, item) => sum + (item.gap ?? 0), 0);

  let running_cumulative = 0;
  return sorted.map((item) => {
    const ind_pct = total_gap > 0 ? ((item.gap ?? 0) / total_gap) * 100 : 0;
    running_cumulative += ind_pct;
    return { ...item, ind_pct, cum_pct: running_cumulative };
  });
}

/**
 * Formatea un valor numérico con la unidad de medida especificada.
 */
export function format_pareto_value(val: unknown, unit: string): string {
  if (val === null || val === undefined || Number.isNaN(val)) return "";
  const num_str = Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (unit === "$") return "$" + num_str;
  return num_str + (unit ? (unit === "%" ? "%" : " " + unit) : "");
}

/**
 * Parsea texto copiado desde Excel (TSV o CSV) y lo fusiona con
 * los items existentes, agrupando por nombre de categoría.
 */
export function parse_excel_paste(
  raw_text: string,
  existing_items: ParetoItem[]
): ParetoItem[] {
  const lines = raw_text.split("\n");
  const aggregated: Record<string, number> = {};

  for (const line of lines) {
    if (!line.trim()) continue;
    const tab_parts = line.split("\t");
    let category = "";
    let value = 0;

    if (tab_parts.length >= 2 && tab_parts[0] && tab_parts[1]) {
      category = tab_parts[0].trim();
      value = parseFloat(tab_parts[1].replace(/,/g, "").trim()) || 0;
    } else {
      const comma_parts = line.split(",");
      if (comma_parts.length >= 2 && comma_parts[0] && comma_parts[1]) {
        category = comma_parts[0].trim();
        value = parseFloat(comma_parts[1].replace(/,/g, "").trim()) || 0;
      } else {
        category = line.trim();
        value = 1;
      }
    }

    if (category) {
      aggregated[category] = (aggregated[category] ?? 0) + value;
    }
  }

  const existing_aggregated: Record<string, number> = {};
  for (const item of existing_items) {
    if (item.area?.trim()) {
      existing_aggregated[item.area.trim()] =
        (existing_aggregated[item.area.trim()] ?? 0) + (item.gap ?? 0);
    }
  }

  for (const category in aggregated) {
    existing_aggregated[category] =
      (existing_aggregated[category] ?? 0) + aggregated[category];
  }

  return Object.keys(existing_aggregated).map((category) => ({
    id: Date.now() + Math.random(),
    area: category,
    gap: existing_aggregated[category] ?? 0,
  }));
}

/**
 * Calcula el total de los valores gap de una lista de items.
 */
export function compute_total_gap(items: ParetoItem[]): number {
  return items.reduce((sum, item) => sum + (item.gap ?? 0), 0);
}
