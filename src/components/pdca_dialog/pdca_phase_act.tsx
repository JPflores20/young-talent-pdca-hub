import React from "react";
import { GembaEvidenciasStep } from "../pdca-dialog/gemba-evidencias-step";
import { TablaEstandarizacion } from "./tabla-estandarizacion";
import { TablaEstandarizacionVpo } from "./tabla-estandarizacion-vpo";
import { StepCard } from "@/components/ui/step-card";
import { Badge } from "@/components/ui/badge";
import { AnalisisRiesgosTable } from "./analisis-riesgos-table";
import { Textarea } from "@/components/ui/textarea";

interface PhaseActProps {
  gemba_final_images: string[];
  on_gemba_final_images_change: (imgs: string[]) => void;
  tabla_estandarizacion: any[];
  on_tabla_estandarizacion_change: (data: any[]) => void;
  tabla_estandarizacion_vpo: any[];
  on_tabla_estandarizacion_vpo_change: (data: any[]) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string>;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: (step_id: string) => void;
  is_editable: boolean;
  
  analisis_riesgos_estandarizacion?: any[];
  on_analisis_riesgos_estandarizacion_change?: (items: any[]) => void;
  conclusiones_finales?: string;
  on_conclusiones_finales_change?: (text: string) => void;
}

export const PdcaPhaseAct: React.FC<PhaseActProps> = ({
  gemba_final_images,
  on_gemba_final_images_change,
  tabla_estandarizacion,
  on_tabla_estandarizacion_change,
  tabla_estandarizacion_vpo,
  on_tabla_estandarizacion_vpo_change,
  completed_steps, na_steps, on_toggle_step, on_toggle_na,
  is_editable,
  analisis_riesgos_estandarizacion,
  on_analisis_riesgos_estandarizacion_change,
  conclusiones_finales,
  on_conclusiones_finales_change,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 24: Estandarización de proceso ─────────────────────────── */}
      <StepCard 
        title="PASO 24: ESTANDARIZACIÓN DE PROCESO"
        isStepCompleted={completed_steps.has("step-24-act")}
        onToggleStep={() => on_toggle_step("step-24-act")}
        isNa={na_steps?.has("step-24-act")} onToggleNa={() => on_toggle_na?.("step-24-act")}
      >
        <TablaEstandarizacion
          items={tabla_estandarizacion || []}
          onChange={(items) => on_tabla_estandarizacion_change(items)}
        />
      </StepCard>

      {/* ── PASO 25: Análisis de riesgo del proceso ─────────────────────── */}
      <AnalisisRiesgosTable
        title="PASO 25: ANÁLISIS DE RIESGOS DE LAS ACCIONES ESTANDARIZADAS"
        items={analisis_riesgos_estandarizacion || []}
        onChange={on_analisis_riesgos_estandarizacion_change!}
        isStepCompleted={completed_steps.has("step-25")}
        onToggleStep={() => on_toggle_step("step-25")}
        isNa={na_steps?.has("step-25")} onToggleNa={() => on_toggle_na?.("step-25")}
      />

      {/* ── PASO 26: Conclusión ─────────────────────────────────────────── */}
      <StepCard 
        title="PASO 26: CONCLUSIÓN"
        isStepCompleted={completed_steps.has("step-26")}
        onToggleStep={() => on_toggle_step("step-26")}
        isNa={na_steps?.has("step-26")} onToggleNa={() => on_toggle_na?.("step-26")}
      >
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">Escribe las conclusiones finales y lecciones aprendidas de este proyecto PDCA.</p>
          <Textarea
            value={conclusiones_finales || ""}
            onChange={(e) => on_conclusiones_finales_change?.(e.target.value)}
            placeholder="Conclusiones..."
            disabled={!is_editable}
            className="min-h-[150px]"
          />
        </div>
      </StepCard>
    </div>
  );
};
