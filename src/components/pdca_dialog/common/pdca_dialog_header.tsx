import React from "react";
import { ArrowLeft, Check, UploadCloud, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/pdca-badge";
import { cn } from "@/lib/utils";
import { differenceInDays, startOfDay } from "date-fns";
import type { Phase } from "@/data/pdca";
import { parse_date_string } from "../utils/date_helpers";

/** All trackable step IDs across every phase */
export const ALL_STEP_IDS = [
  "step-1", "step-2", "step-3", "step-4", "step-5", "step-6", "step-7",
  "step-8", "step-9", "step-10", "step-11", "step-12", "step-13", "step-14",
  "step-15", "step-16", "step-17", "step-18", "step-19", "step-20", "step-21",
  "step-22", "step-23", "step-24", "step-25", "step-26", "step-27", "step-28",
  "step-29", "step-30", "step-31", "step-32", "step-33", "step-34"
] as const;

export const TOTAL_STEPS = ALL_STEP_IDS.length;

interface HeaderProps {
  current_phase: Phase;
  document_identifier: string;
  pdca_title: string;
  last_updated: string;
  creation_date?: string;
  deadline_string?: string | null;
  completed_steps: Set<string>;
  na_steps: Set<string>;
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
  creation_date,
  deadline_string,
  completed_steps,
  na_steps,
  is_saving_in_progress,
  has_pending_modifications,
  is_user_permitted_to_edit,
  on_trigger_firestore_save,
  on_go_back,
}) => {
  const valid_steps = ALL_STEP_IDS.filter((id) => !na_steps.has(id));
  const completed_count = valid_steps.filter((id) => completed_steps.has(id)).length;
  const progress_pct = valid_steps.length > 0 ? Math.round((completed_count / valid_steps.length) * 100) : 0;

  let deadline_info = null;
  if (deadline_string && deadline_string !== "Sin límite") {
    const deadline_date = parse_date_string(deadline_string);
    if (deadline_date) {
      const today = startOfDay(new Date());
      const diff = differenceInDays(deadline_date, today);
      if (diff < 0) {
        deadline_info = (
          <span className="text-red-500 font-bold ml-2">Vencido por {Math.abs(diff)} días</span>
        );
      } else if (diff === 0) {
        deadline_info = <span className="text-amber-500 font-bold ml-2">Vence hoy</span>;
      } else {
        deadline_info = (
          <span className="text-emerald-500 font-medium ml-2">Quedan {diff} días</span>
        );
      }
    }
  } else if (deadline_string === "Sin límite") {
    deadline_info = <span className="text-muted-foreground ml-2">Sin límite de tiempo</span>;
  }

  const document_type = document_identifier?.startsWith("RDA-") ? "RDA" : "PDCA";

  return (
    <div className="space-y-4">
      {/* Row 1: Back link */}
      <button
        type="button"
        onClick={on_go_back}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Volver a Mis Proyectos
      </button>

      {/* Row 2: Meta + Save */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-xs font-semibold text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded">
            {document_identifier || `Nuevo ${document_type}`}
          </span>
          <PhaseBadge phase={current_phase} />
          {creation_date && (
            <span className="text-xs text-muted-foreground ml-2">Abierto: {creation_date}</span>
          )}
          {deadline_info && <span className="text-xs">| {deadline_info}</span>}
          {last_updated && (
            <span className="text-xs text-muted-foreground ml-2">
              | Actualizado: {last_updated}
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
            onClick={() => {
              on_trigger_firestore_save();
            }}
            disabled={is_saving_in_progress || !is_user_permitted_to_edit}
            className={cn(
              "font-semibold text-xs h-8 gap-1.5 transition-all shadow-sm",
              has_pending_modifications && is_user_permitted_to_edit
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            <UploadCloud className="size-3.5" />
            {is_saving_in_progress ? "Guardando..." : `Guardar ${document_type}`}
          </Button>
        </div>
      </div>

      {/* Row 3: Title + Progress */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight max-w-3xl">
          {pdca_title || `Nuevo ${document_type}`}
        </h1>

        <div className="flex-shrink-0 text-right">
          <div className="text-sm font-semibold text-foreground whitespace-nowrap">
            Progreso del {document_type}: <span className="text-primary">{progress_pct}%</span>
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
