/**
 * use_pareto_data.ts
 * Hook reutilizable que encapsula toda la lógica de estado y cálculos
 * del módulo Pareto: filas, Excel import, y opciones de visualización.
 * Responsabilidad única: gestión del estado de un único Pareto interactivo.
 */
import { useState } from "react";
import {
  compute_pareto_data,
  format_pareto_value,
  parse_excel_paste,
  compute_total_gap,
} from "./pareto_data_utils";
import type { ParetoItem, ParetoChartItem } from "./pareto_types";

export interface UseParetoDataOptions {
  /** Lista de items controlada externamente (uncontrolled-friendly). */
  items?: ParetoItem[];
  /** Callback para propagar cambios al padre. */
  on_items_change?: (items: ParetoItem[]) => void;
  /** Unidad de medida para formatear valores. */
  unit?: string;
}

export interface UseParetoDataResult {
  /** Items procesados con porcentajes calculados, ordenados desc. */
  pareto_data: ParetoChartItem[];
  /** Suma total de todos los gaps. */
  total_gap: number;
  /** Función de formateo que aplica la unidad de medida. */
  format_value: (val: unknown) => string;

  /** Agrega una fila vacía al final. */
  add_row: () => void;
  /** Actualiza un campo de una fila por id. */
  update_row: (id: number, field: "area" | "gap", value: string | number) => void;
  /** Elimina una fila por id. */
  remove_row: (id: number) => void;
  /** Importa y fusiona datos desde texto copiado de Excel. */
  handle_import_excel: (raw_text: string) => void;

  /** Estado del diálogo de importación. */
  is_paste_open: boolean;
  set_is_paste_open: (open: boolean) => void;

  /** Estado del modo pantalla completa del gráfico. */
  is_fullscreen: boolean;
  set_is_fullscreen: (full: boolean) => void;

  /** Título editable del gráfico. */
  chart_title: string;
  set_chart_title: (title: string) => void;

  /** Límite mínimo del eje Y izquierdo. */
  y_axis_min: number;
  set_y_axis_min: (val: number) => void;

  /** Límite máximo del eje Y izquierdo (o "auto"). */
  y_axis_max: number | "auto";
  set_y_axis_max: (val: number | "auto") => void;
}

/**
 * Hook principal del módulo Pareto.
 * Gestiona el estado local de visualización y delega la persistencia
 * de datos al padre mediante `on_items_change`.
 */
export function use_pareto_data({
  items = [],
  on_items_change,
  unit = "",
}: UseParetoDataOptions): UseParetoDataResult {
  const [is_paste_open, set_is_paste_open] = useState(false);
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const [chart_title, set_chart_title] = useState("");
  const [y_axis_min, set_y_axis_min] = useState<number>(0);
  const [y_axis_max, set_y_axis_max] = useState<number | "auto">("auto");

  const pareto_data = compute_pareto_data(items);
  const total_gap = compute_total_gap(items);
  const format_value = (val: unknown) => format_pareto_value(val, unit);

  function add_row() {
    on_items_change?.([...items, { id: Date.now(), area: "", gap: 0 }]);
  }

  function update_row(id: number, field: "area" | "gap", value: string | number) {
    on_items_change?.(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function remove_row(id: number) {
    on_items_change?.(items.filter((item) => item.id !== id));
  }

  function handle_import_excel(raw_text: string) {
    const merged = parse_excel_paste(raw_text, items);
    if (merged.length > 0) {
      on_items_change?.(merged);
    }
  }

  return {
    pareto_data,
    total_gap,
    format_value,
    add_row,
    update_row,
    remove_row,
    handle_import_excel,
    is_paste_open,
    set_is_paste_open,
    is_fullscreen,
    set_is_fullscreen,
    chart_title,
    set_chart_title,
    y_axis_min,
    set_y_axis_min,
    y_axis_max,
    set_y_axis_max,
  };
}
