import type { ParetoItem } from "@/data/pdca";

export interface ParetoInteractiveProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  level?: number;
  data?: ParetoItem[];
  onDataChange?: (new_data: ParetoItem[]) => void;
  onBarClick?: (category: string) => void;
  onClose?: () => void;
  unit?: string;
  onUnitChange?: (new_unit: string) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  onAddRoot?: () => void;
  chart_title?: string;
  on_chart_title_change?: (new_title: string) => void;
}

export interface ParetoRow extends ParetoItem {
  ind_pct: number;
  cum_pct: number;
}

export function build_pareto_data(raw_data: ParetoItem[]): {
  sorted: ParetoItem[];
  total_gap: number;
  pareto_rows: ParetoRow[];
} {
  const safe_data = raw_data || [];
  const sorted = [...safe_data].sort((a, b) => (b.gap ?? 0) - (a.gap ?? 0));
  const total_gap = sorted.reduce((s, i) => s + (i.gap ?? 0), 0);
  let running = 0;
  const pareto_rows: ParetoRow[] = sorted.map((item) => {
    const gap = item.gap ?? 0;
    const ind_pct = total_gap > 0 ? (gap / total_gap) * 100 : 0;
    running += ind_pct;
    return { ...item, ind_pct, cum_pct: running };
  });
  return { sorted, total_gap, pareto_rows };
}

export function format_value(val: number | undefined | null, unit?: string): string {
  if (val === null || val === undefined || isNaN(val)) return "";
  const s = Number(val).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (unit === "$") return "$" + s;
  return s + (unit ? (unit === "%" ? "%" : " " + unit) : "");
}
