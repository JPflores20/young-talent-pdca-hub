import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { StepInstructions } from "@/components/pdca_dialog/common/step-instructions";

interface VpoCheckpointProgressProps {
  scorePct: number;
  yesCount: number;
  totalCount: number;
  problemaTexto: string;
}

export function VpoCheckpointProgress({ scorePct, yesCount, totalCount, problemaTexto }: VpoCheckpointProgressProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <StepInstructions>
          <p className="mb-2">
            <strong>PHASE SDCA CHECKLIST:</strong> Este checklist evalúa la madurez y
            estandarización del proceso afectado según los pilares del Sistema de Gestión VPO de
            Grupo Modelo.
          </p>
          <p>
            Evalúa cada punto en el contexto de tu problema. Registra las evidencias o comentarios
            de soporte para cada ítem y selecciona el status correspondiente (YES / NO / N/A). La
            brecha identificada servirá para alimentar el plan de acción (Kanban).
          </p>
        </StepInstructions>

        <div className="w-full flex rounded-xl border border-sky-500/30 bg-sky-50/50 dark:bg-sky-950/20 overflow-hidden shadow-sm">
          <div className="flex w-[120px] shrink-0 items-center justify-center bg-white dark:bg-background border-r border-sky-500/30 p-4">
            <span className="font-bold text-sky-500 uppercase tracking-widest">GUÍA</span>
          </div>
          <div className="flex-1 space-y-3 p-4 text-sm font-medium text-foreground/90">
            <p>
              <strong>Si el score es inferior al 70%</strong> - priorizar las acciones entre los
              miembros del equipo para cerrar las brechas en los puntos más relevantes del problema.
              Sin embargo, el equipo debe proceder en paralelo si los datos iniciales indican que
              hay otros aspectos del problema que estos items del SDCA no pueden abordar sin datos y
              análisis adicionales.
            </p>
            <p>
              <strong>Si el score es mayor al 70%</strong> - proceda directamente al resto de este
              toolkit. Cualquier brecha en los puntos anteriores puede asignarse como acciones para
              los miembros del equipo si es relevante para el problema y es probable que tenga un
              impacto. Utilice la matriz de impacto en la pestaña de action log, si es necesario,
              para ayudar a decidir si deben completarse o no.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-secondary/80 px-4 py-2 rounded-xl border border-border/80 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Progreso VPO Checkpoint:
          </span>
          <span
            className={cn(
              "font-mono text-xl font-extrabold",
              scorePct >= 70
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {scorePct}% ({yesCount}/{totalCount} YES)
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary mb-4">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            scorePct >= 70
              ? "bg-gradient-to-r from-emerald-500 to-teal-400"
              : "bg-gradient-to-r from-amber-500 to-rose-500",
          )}
          style={{ width: `${scorePct}%` }}
        />
      </div>

      {/* Banner de Descripción del Problema */}
      <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-transparent p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white font-bold shadow-sm">
            <FileText className="size-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Descripción del problema (Definición del Problema)
            </span>
            <p className="text-sm font-semibold text-foreground mt-0.5 leading-snug">
              {problemaTexto ||
                "Sin especificar (llena la casilla de Descripción del Problema en el Paso 1)"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
