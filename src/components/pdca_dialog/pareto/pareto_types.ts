/**
 * pareto_types.ts
 * Tipos e interfaces del módulo Pareto.
 * Responsabilidad única: definición de contratos de datos.
 */

export interface ParetoItem {
  id: number;
  area: string;
  gap: number;
}

export interface ParetoChartItem extends ParetoItem {
  ind_pct: number;
  cum_pct: number;
}

export interface ParetoInteractiveProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  level?: number | undefined;
  pareto_items?: ParetoItem[] | undefined;
  on_items_change?: ((items: ParetoItem[]) => void) | undefined;
  on_bar_click?: ((category: string) => void) | undefined;
  on_close?: (() => void) | undefined;
  unit?: string | undefined;
  on_unit_change?: ((new_unit: string) => void) | undefined;
  is_step_completed?: boolean | undefined;
  on_toggle_step?: (() => void) | undefined;
  on_add_root?: (() => void) | undefined;
  /** Título del gráfico (controlado desde el padre vía title_map). */
  chart_title?: string | undefined;
  /** Callback para notificar cambios en el título al padre. */
  on_chart_title_change?: ((title: string) => void) | undefined;
}

export interface ParetoSectionProps {
  drill_downs: string[];
  set_drill_downs: (drills: string[]) => void;
  data_map: Record<string, ParetoItem[]>;
  set_data_map: (map: Record<string, ParetoItem[]>) => void;
  unit?: string | undefined;
  on_unit_change?: ((new_unit: string) => void) | undefined;
  is_step_completed?: boolean | undefined;
  on_toggle_step?: (() => void) | undefined;
}

export interface ParetoChartProps {
  chart_data: ParetoChartItem[];
  chart_title: string;
  on_chart_title_change: (title: string) => void;
  y_axis_min: number;
  y_axis_max: number | "auto";
  on_y_axis_min_change: (val: number) => void;
  on_y_axis_max_change: (val: number | "auto") => void;
  on_bar_click?: ((category: string) => void) | undefined;
  unit: string;
  format_value: (val: unknown) => string;
  is_fullscreen?: boolean | undefined;
  on_expand?: (() => void) | undefined;
}

export interface ParetoDataTableProps {
  pareto_data: ParetoChartItem[];
  raw_items: ParetoItem[];
  on_row_update: (id: number, field: "area" | "gap", value: string | number) => void;
  on_row_remove: (id: number) => void;
  format_value: (val: unknown) => string;
  total_gap: number;
}

export interface ParetoImportDialogProps {
  is_open: boolean;
  on_open_change: (open: boolean) => void;
  on_import: (raw_text: string) => void;
}
