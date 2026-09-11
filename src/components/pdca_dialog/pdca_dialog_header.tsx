import React from "react";
import { ArrowLeft, Check, UploadCloud, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/pdca-badge";
import { cn } from "@/lib/utils";
import type { Phase } from "@/data/pdca";

/** All trackable step IDs across every phase */
const ALL_STEP_IDS = [
  "step-1",               // Plan: Problem Statement
  "step-3",               // Do: Target vs Actual
  "step-4",               // Do: KPI Tree
  "step-5",               // Do: Pareto
  "step-process-mapping",  // Check: Process Mapping
  "step-6",               // Check: Fishbone
  "step-7",               // Check: 5 Whys
  "impactMatrix",          // Act: Impact Matrix
  "step-8",               // Act: Action Plan
  "step-9",               // Act: KPI Final
  "step-10",              // Act: Gemba
  "step-11",              // Act: Estandarización
] as const;

const TOTAL_STEPS = ALL_STEP_IDS.length;

interface HeaderProps {
  current_phase: Phase;
  document_identifier: string;
  pdca_title: string;
  last_updated: string;
  completed_steps: Set<string>;
  is_saving_in_progress: boolean;
  has_pending_modifications: boolean;
  is_user_permitted_to_edit: boolean;
  on_trigger_firestore_save: () => Promise<boolean>;
  on_go_back: () => void;
}

export const PdcaDialogHeader: React.FC<HeaderProps> = ({
  current_phase,
  document_identifier,
  pdca_title,
  last_updated,
  completed_steps,
  is_saving_in_progress,
  has_pending_modifications,
  is_user_permitted_to_edit,
  on_trigger_firestore_save,
  on_go_back,
}) => {
  const completed_count = ALL_STEP_IDS.filter((id) => completed_steps.has(id)).length;
  const progress_pct = TOTAL_STEPS > 0 ? Math.round((completed_count / TOTAL_STEPS) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Row 1: Back link */}
      <button
        type="button"
        onClick={on_go_back}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Volver a Mis PDCAs
      </button>

      {/* Row 2: Meta + Save */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
            {document_identifier || "Nuevo PDCA"}
          </span>
          <PhaseBadge phase={current_phase} />
          {last_updated && (
            <span className="text-xs text-muted-foreground">
              Última actualización: {last_updated}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 pr-2">
            {is_saving_in_progress ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium animate-pulse">
                <UploadCloud className="size-3.5 animate-bounce" /> Guardando cambios...
              </span>
            ) : has_pending_modifications ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Save className="size-3.5" /> Cambios pendientes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Check className="size-3.5" /> Sincronizado
              </span>
            )}
          </div>

          <Button
            size="sm"
            onClick={() => { on_trigger_firestore_save(); }}
            disabled={is_saving_in_progress || !is_user_permitted_to_edit}
            className={cn(
              "font-semibold text-xs h-8 gap-1.5 transition-all shadow-sm",
              has_pending_modifications && is_user_permitted_to_edit
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <UploadCloud className="size-3.5" />
            {is_saving_in_progress ? "Guardando..." : "Guardar PDCA"}
          </Button>
        </div>
      </div>

      {/* Row 3: Title + Progress */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
          {pdca_title || "Nuevo PDCA"}
        </h1>

        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            Progreso del PDCA:{" "}
            <span className="text-primary">{progress_pct}%</span>
            <span className="text-xs text-muted-foreground ml-1 font-normal">
              ({completed_count}/{TOTAL_STEPS} pasos)
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-2 w-48 bg-secondary/60 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500 ease-out"
              style={{ width: `${progress_pct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
