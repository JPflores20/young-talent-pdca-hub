/**
 * pareto_import_dialog.tsx
 * Modal para importar datos desde Excel (copiar y pegar).
 * Responsabilidad única: captura y envío del texto pegado.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ParetoImportDialogProps } from "./pareto_types";

export function ParetoImportDialog({
  is_open,
  on_open_change,
  on_import,
}: ParetoImportDialogProps) {
  const [pasted_text, set_pasted_text] = useState("");

  function handle_confirm_import() {
    if (!pasted_text.trim()) return;
    on_import(pasted_text);
    set_pasted_text("");
    on_open_change(false);
  }

  function handle_cancel() {
    set_pasted_text("");
    on_open_change(false);
  }

  return (
    <Dialog open={is_open} onOpenChange={on_open_change}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Datos (Copiar y Pegar desde Excel)</DialogTitle>
          <DialogDescription>
            Copia dos columnas de tu Excel (Categoría y Frecuencia/Costo) y pégalas aquí. Los datos
            se agruparán automáticamente por categoría. Soporta miles de filas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={pasted_text}
            onChange={(e) => set_pasted_text(e.target.value)}
            placeholder={"Ejemplo:\nFalla A\t10\nFalla B\t5\nFalla A\t15"}
            className="min-h-[200px] text-xs font-mono whitespace-pre"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handle_cancel}>
              Cancelar
            </Button>
            <Button onClick={handle_confirm_import}>Importar y Generar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
