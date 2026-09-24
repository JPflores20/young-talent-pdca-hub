import React from "react";
import { GembaEvidenciasStep } from "../pdca-dialog/gemba-evidencias-step";
import { TablaEstandarizacion } from "./tabla-estandarizacion";
import { TablaEstandarizacionVpo } from "./tabla-estandarizacion-vpo";
import { StepCard } from "@/components/ui/step-card";
import { Badge } from "@/components/ui/badge";

interface PhaseActProps {
  gemba_final_images: string[];
  on_gemba_final_images_change: (imgs: string[]) => void;
  tabla_estandarizacion: any[];
  on_tabla_estandarizacion_change: (data: any[]) => void;
  tabla_estandarizacion_vpo: any[];
  on_tabla_estandarizacion_vpo_change: (data: any[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
  is_editable: boolean;
}

export const PdcaPhaseAct: React.FC<PhaseActProps> = ({
  gemba_final_images,
  on_gemba_final_images_change,
  tabla_estandarizacion,
  on_tabla_estandarizacion_change,
  tabla_estandarizacion_vpo,
  on_tabla_estandarizacion_vpo_change,
  completed_steps,
  on_toggle_step,
  is_editable,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 24: Estandarización de proceso ─────────────────────────── */}
      <StepCard 
        title="PASO 24: ESTANDARIZACIÓN DE PROCESO"
        isStepCompleted={completed_steps.has("step-24-act")}
        onToggleStep={() => on_toggle_step("step-24-act")}
      >
        <TablaEstandarizacion
          items={tabla_estandarizacion || []}
          onChange={(items) => on_tabla_estandarizacion_change(items)}
        />
      </StepCard>

      {/* ── PASO 25: Análisis de riesgo del proceso ─────────────────────── */}
      <StepCard 
        title="PASO 25: ANÁLISIS DE RIESGO DEL PROCESO"
        isStepCompleted={completed_steps.has("step-25")}
        onToggleStep={() => on_toggle_step("step-25")}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/10 border border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground mt-1">Aquí irá el componente para el Análisis de Riesgo del Proceso.</p>
        </div>
      </StepCard>

      {/* ── PASO 26: Conclusión ─────────────────────────────────────────── */}
      <StepCard 
        title="PASO 26: CONCLUSIÓN"
        isStepCompleted={completed_steps.has("step-26")}
        onToggleStep={() => on_toggle_step("step-26")}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/10 border border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground mt-1">Aquí irá el componente para la Conclusión.</p>
        </div>
      </StepCard>
    </div>
  );
};
