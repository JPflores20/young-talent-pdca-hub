/**
 * pareto_section.tsx
 * Coordina múltiples ParetoInteractive (root + drilldowns).
 * Responsabilidad única: gestión del árbol de drill-down de Paretos.
 * Gestiona title_map para que cada ParetoInteractive tenga su propio título.
 */
import { useState } from "react";
import { ParetoInteractive } from "./pareto_interactive";
import type { ParetoSectionProps, ParetoItem } from "./pareto_types";

function parse_drill_down_path(
  path: string,
  fallback_index: number
): { actual_path: string; level: number; category: string } {
  if (!path.includes("level-")) {
    return { actual_path: `level-${fallback_index + 1}-${path}`, level: fallback_index + 1, category: path };
  }
  if (path.includes("-level-")) {
    const parts = path.split("-level-");
    const rest = (parts[1] ?? "").split("-");
    return { actual_path: path, level: parseInt(rest[0] ?? "1", 10), category: rest.slice(1).join("-") };
  }
  const parts = path.split("-");
  return { actual_path: path, level: parseInt(parts[1] ?? "1", 10), category: parts.slice(2).join("-") };
}

export function ParetoSection({
  drill_downs,
  set_drill_downs,
  data_map,
  set_data_map,
  unit = "",
  on_unit_change,
  is_step_completed,
  on_toggle_step,
}: ParetoSectionProps) {
  /** Persiste el título de gráfico de cada ParetoInteractive por ruta. */
  const [title_map, set_title_map] = useState<Record<string, string>>({});

  const root_keys = Object.keys(data_map)
    .filter((k) => k === "root" || k.startsWith("root-"))
    .sort();
  if (root_keys.length === 0) root_keys.push("root");

  function update_chart_title(path: string, new_title: string) {
    set_title_map((prev) => ({ ...prev, [path]: new_title }));
  }

  function update_data(path: string, new_items: ParetoItem[]) {
    set_data_map({ ...data_map, [path]: new_items });
  }

  function handle_bar_click(category: string, level: number, parent_path: string) {
    if (!category) return;
    const is_legacy = drill_downs.length > 0 && !drill_downs[0].includes("level-");
    const current_drills = is_legacy
      ? drill_downs.map((d, i) => `level-${i + 1}-${d}`)
      : [...drill_downs];
    const new_path =
      parent_path === "root"
        ? `level-${level + 1}-${category}`
        : `${parent_path}-level-${level + 1}-${category}`;
    if (!current_drills.includes(new_path)) current_drills.push(new_path);
    set_drill_downs(current_drills);
    if (!data_map[new_path]) set_data_map({ ...data_map, [new_path]: [] });
  }

  function handle_close_drill(path_to_remove: string) {
    const is_legacy = drill_downs.length > 0 && !drill_downs[0].includes("level-");
    const current = is_legacy
      ? drill_downs.map((d, i) => `level-${i + 1}-${d}`)
      : [...drill_downs];
    set_drill_downs(current.filter((p) => p !== path_to_remove && !p.startsWith(`${path_to_remove}-`)));
    const new_map = { ...data_map };
    Object.keys(new_map).forEach((k) => {
      if (k === path_to_remove || k.startsWith(`${path_to_remove}-`)) delete new_map[k];
    });
    set_data_map(new_map);
  }

  function handle_close_root(root_key: string) {
    set_drill_downs(drill_downs.filter((p) => !p.startsWith(`${root_key}-`)));
    const new_map = { ...data_map };
    Object.keys(new_map).forEach((k) => {
      if (k === root_key || k.startsWith(`${root_key}-`)) delete new_map[k];
    });
    set_data_map(new_map);
  }

  function handle_add_root() {
    const new_root_key = `root-${Date.now()}`;
    set_data_map({ ...data_map, [new_root_key]: [] });
  }

  return (
    <div className="space-y-4">
      {root_keys.map((root_key, idx) => (
        <ParetoInteractive
          key={root_key}
          title={idx === 0 ? "PASO 5: PARETO" : `PASO 5: PARETO INDEPENDIENTE ${idx + 1}`}
          level={0}
          pareto_items={data_map[root_key] ?? []}
          on_items_change={(items) => update_data(root_key, items)}
          on_bar_click={(cat) => handle_bar_click(cat, 0, root_key)}
          unit={unit}
          on_add_root={idx === 0 ? handle_add_root : undefined}
          on_close={idx > 0 ? () => handle_close_root(root_key) : undefined}
          on_unit_change={on_unit_change}
          is_step_completed={idx === 0 ? is_step_completed : undefined}
          on_toggle_step={idx === 0 ? on_toggle_step : undefined}
          chart_title={title_map[root_key] ?? ""}
          on_chart_title_change={(t) => update_chart_title(root_key, t)}
        />
      ))}
      {drill_downs.map((drill_str, index) => {
        const { actual_path, level, category } = parse_drill_down_path(drill_str, index);
        return (
          <ParetoInteractive
            key={actual_path}
            level={level}
            title={`Sub-Pareto: ${category}`}
            subtitle={`Desglose específico (Nivel ${level + 1}) de la categoría ${category}.`}
            pareto_items={data_map[actual_path] ?? []}
            on_items_change={(items) => update_data(actual_path, items)}
            on_bar_click={(cat) => handle_bar_click(cat, level, actual_path)}
            on_close={() => handle_close_drill(actual_path)}
            unit={unit}
            on_unit_change={on_unit_change}
            chart_title={title_map[actual_path] ?? ""}
            on_chart_title_change={(t) => update_chart_title(actual_path, t)}
          />
        );
      })}
    </div>
  );
}

