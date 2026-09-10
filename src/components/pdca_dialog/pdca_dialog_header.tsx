import React from "react";
import { Check, UploadCloud, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/pdca-badge";
import { cn } from "@/lib/utils";
import type { Phase } from "@/data/pdca";

interface HeaderProps {
  current_phase: Phase;
  document_identifier: string;
  is_saving_in_progress: boolean;
  has_pending_modifications: boolean;
  is_user_permitted_to_edit: boolean;
  on_trigger_firestore_save: () => Promise<boolean>;
}

export const PdcaDialogHeader: React.FC<HeaderProps> = ({
  current_phase,
  document_identifier,
  is_saving_in_progress,
  has_pending_modifications,
  is_user_permitted_to_edit,
  on_trigger_firestore_save,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
      <div className="flex items-center gap-3">
        <PhaseBadge phase={current_phase} />
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {document_identifier || "Nuevo PDCA"}
        </span>
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
  );
};
