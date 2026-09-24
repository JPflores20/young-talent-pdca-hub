import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Phase } from "@/data/pdca";

interface FooterProps {
  current_phase: Phase;
  document_identifier: string;
  is_user_permitted_to_edit: boolean;
  on_proceed_next_phase: () => Promise<void>;
  on_close_dialog: () => void;
  isAdmin?: boolean;
}

export const PdcaDialogFooter: React.FC<FooterProps> = ({
  current_phase,
  document_identifier,
  is_user_permitted_to_edit,
  on_proceed_next_phase,
  on_close_dialog,
  isAdmin,
}) => {
  const isFinalPhase = (current_phase === "Act" && !isAdmin) || current_phase === "Evaluacion";
  
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 mt-6"
      data-html2canvas-ignore
    >
      <Button
        variant="ghost"
        onClick={on_close_dialog}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Cerrar Ventana
      </Button>

      <div className="flex items-center gap-3">
        <Button
          className="bg-primary hover:bg-primary/90 text-xs font-semibold h-9 gap-1.5"
          disabled={!is_user_permitted_to_edit}
          onClick={on_proceed_next_phase}
        >
          {isFinalPhase ? "Finalizar PDCA" : "Siguiente Paso"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
