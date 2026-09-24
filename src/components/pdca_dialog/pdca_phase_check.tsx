import React from "react";
import { StepCard } from "@/components/ui/step-card";
import { TimeSeriesYTD } from "../pdca-dialog/time-series-ytd";

interface PhaseCheckProps {
  final_time_series_data: { mes: string; target: number; actual: number | null }[];
  on_final_time_series_data_change: (val: any) => void;
  final_time_series_unit: string;
  on_final_time_series_unit_change: (unit: string) => void;
  final_time_series_title?: string;
  on_final_time_series_title_change?: (title: string) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
}

export const PdcaPhaseCheck: React.FC<PhaseCheckProps> = ({
  final_time_series_data,
  on_final_time_series_data_change,
  final_time_series_unit,
  on_final_time_series_unit_change,
  final_time_series_title,
  on_final_time_series_title_change,
  completed_steps,
  on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 21: TO-BE Process Map (Mejora de Procesos) ────────────── */}
      <StepCard
        title="PASO 21: TO-BE PROCESS MAP (MEJORA DE PROCESOS)"
        isStepCompleted={completed_steps.has("step-21")}
        onToggleStep={() => on_toggle_step("step-21")}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/10 border border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground mt-1">Aquí irá el componente para TO-BE Process Map.</p>
        </div>
      </StepCard>

      {/* ── PASO 22: Piloto / Pruebas ejecutadas ───────────────────────── */}
      <StepCard
        title="PASO 22: PILOTO / PRUEBAS EJECUTADAS"
        isStepCompleted={completed_steps.has("step-22")}
        onToggleStep={() => on_toggle_step("step-22")}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/10 border border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground mt-1">Aquí irá el componente para Piloto / Pruebas ejecutadas.</p>
        </div>
      </StepCard>

      {/* ── PASO 23: Evolución de PI'S ──────────────────────────────────── */}
      <div className="border border-border rounded-xl p-4 bg-secondary/10">
        <TimeSeriesYTD
          value={final_time_series_data}
          onChange={on_final_time_series_data_change}
          unit={final_time_series_unit}
          onUnitChange={on_final_time_series_unit_change}
          title="PASO 23: EVOLUCIÓN DE PI'S"
          chartTitle={final_time_series_title}
          onTitleChange={on_final_time_series_title_change}
          isStepCompleted={completed_steps.has("step-23")}
          onToggleStep={() => on_toggle_step("step-23")}
        />
      </div>

      {/* ── PASO 24: Nuevo Performance de Procesos (estadístico) ──────── */}
      <StepCard
        title="PASO 24: NUEVO PERFORMANCE DE PROCESOS (ESTADÍSTICO)"
        isStepCompleted={completed_steps.has("step-24")}
        onToggleStep={() => on_toggle_step("step-24")}
      >
        <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/10 border border-dashed rounded-lg">
          <p className="text-muted-foreground font-medium">Sección en construcción</p>
          <p className="text-xs text-muted-foreground mt-1">Aquí irá el componente para el Nuevo Performance de Procesos.</p>
        </div>
      </StepCard>
    </div>
  );
};
