import React from "react";
import { ArrowRight, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { export_element_to_pdf } from "./utils/pdf_export_helper";
import type { Phase } from "@/data/pdca";

interface FooterProps {
  current_phase: Phase;
  document_identifier: string;
  is_user_permitted_to_edit: boolean;
  on_proceed_next_phase: () => Promise<void>;
  on_close_dialog: () => void;
}

export const PdcaDialogFooter: React.FC<FooterProps> = ({
  current_phase,
  document_identifier,
  is_user_permitted_to_edit,
  on_proceed_next_phase,
  on_close_dialog,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 mt-6" data-html2canvas-ignore>
      <Button
        variant="ghost"
        onClick={on_close_dialog}
        className="text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        Cerrar Ventana
      </Button>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          onClick={() => export_element_to_pdf("pdca-content", document_identifier)}
          className="font-semibold text-xs h-9 text-primary border-primary hover:bg-primary/10 gap-1.5"
        >
          <FileDown className="size-4" /> Exportar PDF
        </Button>

        <Button
          className="bg-primary hover:bg-primary/90 text-xs font-semibold h-9 gap-1.5"
          disabled={!is_user_permitted_to_edit}
          onClick={on_proceed_next_phase}
        >
          {current_phase === "Act" ? "Finalizar PDCA" : "Siguiente Paso"}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};
