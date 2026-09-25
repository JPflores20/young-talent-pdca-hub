
const fs = require('fs');
let file = 'src/components/pdca_dialog/pdca_phase_plan.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'import { IshikawaSection } from "../ishikawa-section";',
  'import { IshikawaSection } from "../ishikawa-section";\nimport { GopThemesSection } from "../GopThemesSection";\nimport type { GopThemeItem } from "@/data/pdca";'
);

c = c.replace(
  '  on_has_flavor_correlation_change?: (has: boolean) => void;\n}',
  '  on_has_flavor_correlation_change?: (has: boolean) => void;\n  gop_themes_data?: GopThemeItem[];\n  on_gop_themes_data_change?: (data: GopThemeItem[]) => void;\n}'
);

c = c.replace(
  '  on_has_flavor_correlation_change,',
  '  on_has_flavor_correlation_change,\n  gop_themes_data,\n  on_gop_themes_data_change,'
);

c = c.replace(
  'title="PASO 7: CURRENT PROCESS PERMANANCE (SITUACIÓN ACTUAL PI\'S)"',
  'title="PASO 7: SITUACIÓN ACTUAL"'
);

c = c.replace(
  'title="PASO 8: LÍNEA BASE (BASE LINE)"',
  'title="PASO 8: LÍNEA BASE"'
);

c = c.replace(
  'title="PASO 12: BENCH MARK"',
  'title="PASO 12: BENCHMARK"'
);

c = c.replace(
  'title="PASO 13: 60 PI\'S IDENTIFICADOS"',
  'title="PASO 13: PERFORMANCE ACTUAL DEL PROCESO (ANÁLISIS DE PI\'S)"'
);

c = c.replace(
  '{/* -- PASO 14: Fishbone ----------------------------------------- */}',
  '{/* -- PASO 14: GOPS ----------------------------------------- */}\n      <GopThemesSection\n        data={gop_themes_data || []}\n        onChange={on_gop_themes_data_change!}\n        isStepCompleted={completed_steps.has("step-14")}\n        onToggleStep={() => on_toggle_step("step-14")}\n        isNa={na_steps?.has("step-14")} onToggleNa={() => on_toggle_na?.("step-14")}\n      />\n\n      {/* -- PASO 15: Fishbone ----------------------------------------- */}'
);

c = c.replace(
  'isStepCompleted={completed_steps.has("step-14")}\n        onToggleStep={() => on_toggle_step("step-14")}\n        isNa={na_steps?.has("step-14")} onToggleNa={() => on_toggle_na?.("step-14")}\n      />\n\n      {/* -- PASO 15: 5 Why\\'s',
  'isStepCompleted={completed_steps.has("step-15")}\n        onToggleStep={() => on_toggle_step("step-15")}\n        isNa={na_steps?.has("step-15")} onToggleNa={() => on_toggle_na?.("step-15")}\n      />\n\n      {/* -- PASO 16: 5 Why\\'s'
);

c = c.replace(
  'isStepCompleted={completed_steps.has("step-15")}\n        onToggleStep={() => on_toggle_step("step-15")}\n        isNa={na_steps?.has("step-15")} onToggleNa={() => on_toggle_na?.("step-15")}\n      />\n      {/* -- PASO 16: Acciones de validacion --------------- */}',
  'isStepCompleted={completed_steps.has("step-16")}\n        onToggleStep={() => on_toggle_step("step-16")}\n        isNa={na_steps?.has("step-16")} onToggleNa={() => on_toggle_na?.("step-16")}\n      />\n      {/* -- PASO 17: Acciones de validacion --------------- */}'
);

c = c.replace(
  'title="PASO 16: ACCIONES DE VALIDACIÓN"\n        isStepCompleted={completed_steps.has("step-16")}\n        onToggleStep={() => on_toggle_step("step-16")}\n        isNa={na_steps?.has("step-16")} onToggleNa={() => on_toggle_na?.("step-16")}',
  'title="PASO 17: ACCIONES DE VALIDACIÓN"\n        isStepCompleted={completed_steps.has("step-17")}\n        onToggleStep={() => on_toggle_step("step-17")}\n        isNa={na_steps?.has("step-17")} onToggleNa={() => on_toggle_na?.("step-17")}'
);

c = c.replace(
  '{/* -- PASO 17: Conclusión de causas raíz ------------ */}\n      <ConclusionesCausaRaizTable\n        items={conclusiones_causa_raiz || []}\n        onChange={on_conclusiones_causa_raiz_change!}\n        isStepCompleted={completed_steps.has("step-17")}\n        onToggleStep={() => on_toggle_step("step-17")}\n        isNa={na_steps?.has("step-17")} onToggleNa={() => on_toggle_na?.("step-17")}',
  '{/* -- PASO 18: Causas Raíz Definidas ------------ */}\n      <ConclusionesCausaRaizTable\n        title="PASO 18: CAUSAS RAÍZ DEFINIDAS"\n        items={conclusiones_causa_raiz || []}\n        onChange={on_conclusiones_causa_raiz_change!}\n        isStepCompleted={completed_steps.has("step-18")}\n        onToggleStep={() => on_toggle_step("step-18")}\n        isNa={na_steps?.has("step-18")} onToggleNa={() => on_toggle_na?.("step-18")}'
);

fs.writeFileSync(file, c);

