const fs = require('fs');
const f = 'src/components/pdca_dialog/pdca_phase_act.tsx';
let c = fs.readFileSync(f, 'utf8');

const returnStart = c.indexOf('return (');
const returnStr = `return (
    <div className="space-y-6">
      {/* ── PASO 28: Estandarización de Procesos ── */}
      <StepCard
        title="PASO 28: ESTANDARIZACIÓN DE PROCESOS"
        isStepCompleted={completed_steps.has("step-28")}
        onToggleStep={() => on_toggle_step("step-28")}
        isNa={na_steps?.has("step-28")} onToggleNa={() => on_toggle_na?.("step-28")}
      >
        <TablaEstandarizacion
          items={tabla_estandarizacion || []}
          onChange={(items) => on_tabla_estandarizacion_change(items)}
        />
      </StepCard>

      {/* ── PASO 29: Análisis de Riesgos ── */}
      <StepCard
        title="PASO 29: ANÁLISIS DE RIESGOS DEL PROCESO"
        isStepCompleted={completed_steps.has("step-29")}
        onToggleStep={() => on_toggle_step("step-29")}
        isNa={na_steps?.has("step-29")} onToggleNa={() => on_toggle_na?.("step-29")}
      >
        <AnalisisRiesgosProcesoTable
          items={analisis_riesgos_estandarizacion || []}
          onChange={(items) => on_analisis_riesgos_estandarizacion_change?.(items)}
        />
      </StepCard>

      {/* ── PASO 30: SOPs & Documentos ── */}
      <ImageUploadSection
        image={sops_documentos_image || null}
        onChange={(img) => on_sops_documentos_image_change?.(img || undefined)}
        title="PASO 30: SOPS & DOCUMENTOS"
        subtitle="Sube una imagen o documento de los SOPs"
        isStepCompleted={completed_steps.has("step-30")}
        onToggleStep={() => on_toggle_step("step-30")}
        isNa={na_steps?.has("step-30")} onToggleNa={() => on_toggle_na?.("step-30")}
      />

      {/* ── PASO 31: Plan de Entrenamiento ── */}
      <ImageUploadSection
        image={plan_entrenamiento_image || null}
        onChange={(img) => on_plan_entrenamiento_image_change?.(img || undefined)}
        title="PASO 31: PLAN DE ENTRENAMIENTO"
        subtitle="Sube una imagen del plan de entrenamiento"
        isStepCompleted={completed_steps.has("step-31")}
        onToggleStep={() => on_toggle_step("step-31")}
        isNa={na_steps?.has("step-31")} onToggleNa={() => on_toggle_na?.("step-31")}
      />

      {/* ── PASO 32: Plan de Control ── */}
      <ImageUploadSection
        image={plan_control_image || null}
        onChange={(img) => on_plan_control_image_change?.(img || undefined)}
        title="PASO 32: PLAN DE CONTROL"
        subtitle="Sube una imagen del plan de control"
        isStepCompleted={completed_steps.has("step-32")}
        onToggleStep={() => on_toggle_step("step-32")}
        isNa={na_steps?.has("step-32")} onToggleNa={() => on_toggle_na?.("step-32")}
      />

      {/* ── PASO 33: Lecciones Aprendidas ── */}
      <StepCard
        title="PASO 33: LECCIONES APRENDIDAS"
        isStepCompleted={completed_steps.has("step-33")}
        onToggleStep={() => on_toggle_step("step-33")}
        isNa={na_steps?.has("step-33")} onToggleNa={() => on_toggle_na?.("step-33")}
      >
        <div className="p-4 space-y-3">
          <RichTextEditor
            value={lecciones_aprendidas || ""}
            onChange={(v) => on_lecciones_aprendidas_change?.(v)}
            disabled={!is_editable}
            placeholder="Documenta las lecciones aprendidas durante el proyecto PDCA..."
            minHeight="140px"
          />
        </div>
      </StepCard>

      {/* ── PASO 34: Conclusiones ── */}
      <ConclusionesStep
        isStepCompleted={completed_steps.has("step-34")}
        onToggleStep={() => on_toggle_step("step-34")}
        isNa={na_steps?.has("step-34")}
        onToggleNa={() => on_toggle_na?.("step-34")}
        isEditable={is_editable}
        kpiData={conclusiones_kpi_data}
        onKpiDataChange={(data) => on_conclusiones_kpi_data_change?.(data)}
        piItems={conclusiones_pi_items || []}
        onPiItemsChange={(items) => on_conclusiones_pi_items_change?.(items)}
        storyboardHtml={conclusiones_finales}
        onStoryboardHtmlChange={(html) => on_conclusiones_finales_change?.(html)}
        storyboardImage={conclusiones_storyboard_image}
        onStoryboardImageChange={(img) => on_conclusiones_storyboard_image_change?.(img)}
      />
    </div>
  );
};
`;

c = c.substring(0, returnStart) + returnStr;
fs.writeFileSync(f, c, 'utf8');