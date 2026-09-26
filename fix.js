const fs = require('fs');
const f = 'src/components/pdca_dialog/pdca_phase_act.tsx';
let c = fs.readFileSync(f, 'utf8');
const startIdx = c.indexOf('title="PASO 30: CONCLUSIONES"');
const sectionStart = c.lastIndexOf('<StepCard', startIdx);
const sectionEnd = c.indexOf('</StepCard>', startIdx) + '</StepCard>'.length;
const before = c.substring(0, sectionStart);
const after = c.substring(sectionEnd);
const newContent = 
      <ConclusionesStep
        isStepCompleted={completed_steps.has("step-30")}
        onToggleStep={() => on_toggle_step("step-30")}
        isNa={na_steps?.has("step-30")}
        onToggleNa={() => on_toggle_na?.("step-30")}
        isEditable={is_editable}
        kpiData={conclusiones_kpi_data}
        onKpiDataChange={(data) => on_conclusiones_kpi_data_change?.(data)}
        piItems={conclusiones_pi_items || []}
        onPiItemsChange={(items) => on_conclusiones_pi_items_change?.(items)}
        storyboardHtml={conclusiones_finales}
        onStoryboardHtmlChange={(html) => on_conclusiones_finales_change?.(html)}
      />
;
fs.writeFileSync(f, before + newContent + after, 'utf8');
console.log('Replaced successfully');
