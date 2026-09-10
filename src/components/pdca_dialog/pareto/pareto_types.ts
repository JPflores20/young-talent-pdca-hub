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
  title?: string;
  subtitle?: string;
  level?: number;
  pareto_items?: ParetoItem[];
  on_items_change?: (items: ParetoItem[]) => void;
  on_bar_click?: (category: string) => void;
  on_close?: () => void;
  unit?: string;
  on_unit_change?: (new_unit: string) => void;
  is_step_completed?: boolean;
  on_toggle_step?: () => void;
  on_add_root?: () => void;
  /** Título del gráfico (controlado desde el padre vía title_map). */
  chart_title?: string;
  /** Callback para notificar cambios en el título al padre. */
  on_chart_title_change?: (title: string) => void;
}

export interface ParetoSectionProps {
  drill_downs: string[];
  set_drill_downs: (drills: string[]) => void;
  data_map: Record<string, ParetoItem[]>;
  set_data_map: (map: Record<string, ParetoItem[]>) => void;
  unit?: string;
  on_unit_change?: (new_unit: string) => void;
  is_step_completed?: boolean;
  on_toggle_step?: () => void;
}

export interface ParetoChartProps {
  chart_data: ParetoChartItem[];
  chart_title: string;
  on_chart_title_change: (title: string) => void;
  y_axis_min: number;
  y_axis_max: number | "auto";
  on_y_axis_min_change: (val: number) => void;
  on_y_axis_max_change: (val: number | "auto") => void;
  on_bar_click?: (category: string) => void;
  unit: string;
  format_value: (val: unknown) => string;
  is_fullscreen?: boolean;
  on_expand?: () => void;
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
