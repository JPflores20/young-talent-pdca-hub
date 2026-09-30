import { useState } from "react";
import type { ParetoItem } from "@/data/pdca";
import { ParetoInteractive } from "./pareto-interactive";

export function ParetoSection({
  drillDowns,
  setDrillDowns,
  dataMap,
  setDataMap,
  unit = "",
  onUnitChange,
  paretoTitles,
  onParetoTitlesChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  mainTitle = "PASO 10: ESTRATIFICACIÓN DEL PROBLEMA (PARETO)",
  secondaryTitlePrefix = "PASO 10: PARETO INDEPENDIENTE",
}: {
  drillDowns: string[];
  setDrillDowns: (d: string[]) => void;
  dataMap: Record<string, ParetoItem[]>;
  setDataMap: (m: Record<string, ParetoItem[]>) => void;
  unit?: string | undefined;
  onUnitChange?: ((new_unit: string) => void) | undefined;
  paretoTitles?: Record<string, string> | undefined;
  onParetoTitlesChange?: ((titles: Record<string, string>) => void) | undefined;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  mainTitle?: string | undefined;
  secondaryTitlePrefix?: string | undefined;
}) {
  const [internal_title_map, set_internal_title_map] = useState<Record<string, string>>({});
  const title_map = paretoTitles ?? internal_title_map;
  const set_title_map = onParetoTitlesChange ?? set_internal_title_map;

  const root_keys = Object.keys(dataMap)
    .filter((k) => k === "root" || k.startsWith("root-"))
    .sort();
  if (root_keys.length === 0) root_keys.push("root");

  const update_data = (path: string, new_data: ParetoItem[]) =>
    setDataMap({ ...dataMap, [path]: new_data });
  const update_title = (path: string, t: string) => set_title_map({ ...title_map, [path]: t });

  const handle_bar_click = (cat: string, level: number, parent: string) => {
    if (!cat) return;
    const new_path =
      parent === "root" ? `level-${level + 1}-${cat}` : `${parent}-level-${level + 1}-${cat}`;

    const firstDrill = drillDowns[0] ?? "";
    const is_legacy = drillDowns.length > 0 && !firstDrill.includes("level-");

    const drills = is_legacy ? drillDowns.map((d, i) => `level-${i + 1}-${d}`) : [...drillDowns];

    if (!drills.includes(new_path)) setDrillDowns([...drills, new_path]);

    const currentData = dataMap[new_path];
    if (!currentData) setDataMap({ ...dataMap, [new_path]: [] });
  };

  const handle_close_drill = (path: string) => {
    const firstDrill = drillDowns[0] ?? "";
    const is_legacy = drillDowns.length > 0 && !firstDrill.includes("level-");

    const drills = is_legacy ? drillDowns.map((d, i) => `level-${i + 1}-${d}`) : [...drillDowns];

    setDrillDowns(drills.filter((p) => p !== path && !p.startsWith(`${path}-`)));
    const m = { ...dataMap };
    Object.keys(m).forEach((k) => {
      if (k === path || k.startsWith(`${path}-`)) delete m[k];
    });
    setDataMap(m);
  };

  const handle_close_root = (key: string) => {
    setDrillDowns(drillDowns.filter((p) => !p.startsWith(`${key}-`)));
    const m = { ...dataMap };
    Object.keys(m).forEach((k) => {
      if (k === key || k.startsWith(`${key}-`)) delete m[k];
    });
    setDataMap(m);
  };

  const handle_add_root = () => setDataMap({ ...dataMap, [`root-${Date.now()}`]: [] });

  const parse_path = (path: string, idx: number) => {
    if (!path.includes("level-"))
      return { actual_path: `level-${idx + 1}-${path}`, level: idx + 1, category: path };

    if (path.includes("-level-")) {
      const parts = path.split("-level-");
      const p1 = parts[1] ?? "";
      const rest = p1.split("-");
      const r0 = rest[0] ?? "0";
      return { actual_path: path, level: parseInt(r0, 10), category: rest.slice(1).join("-") };
    }

    const parts = path.split("-");
    const p1 = parts[1] ?? "0";
    return { actual_path: path, level: parseInt(p1, 10), category: parts.slice(2).join("-") };
  };

  return (
    <div className="space-y-4">
      {root_keys.map((key, idx) => (
        <ParetoInteractive
          key={key}
          title={idx === 0 ? mainTitle : `${secondaryTitlePrefix} ${idx + 1}`}
          level={0}
          data={dataMap[key] ?? []}
          onDataChange={(d) => update_data(key, d)}
          onBarClick={(cat) => handle_bar_click(cat, 0, key)}
          unit={unit}
          {...(idx === 0 ? { onAddRoot: handle_add_root } : {})}
          {...(idx > 0 ? { onClose: () => handle_close_root(key) } : {})}
          {...(onUnitChange ? { onUnitChange } : {})}
          {...(idx === 0 && isStepCompleted !== undefined ? { isStepCompleted } : {})}
          {...(idx === 0 && onToggleStep ? { onToggleStep } : {})}
          chart_title={title_map[key] ?? ""}
          on_chart_title_change={(t) => update_title(key, t)}
        />
      ))}
      {drillDowns.map((drill, idx) => {
        const { actual_path, level, category } = parse_path(drill, idx);
        return (
          <ParetoInteractive
            key={actual_path}
            level={level}
            title={`Sub-Pareto: ${category}`}
            subtitle={`Desglose (Nivel ${level + 1}) de la categoria ${category}.`}
            data={dataMap[actual_path] ?? []}
            onDataChange={(d) => update_data(actual_path, d)}
            onBarClick={(cat) => handle_bar_click(cat, level, actual_path)}
            onClose={() => handle_close_drill(actual_path)}
            unit={unit}
            {...(onUnitChange ? { onUnitChange } : {})}
            chart_title={title_map[actual_path] ?? ""}
            on_chart_title_change={(t) => update_title(actual_path, t)}
          />
        );
      })}
    </div>
  );
}
