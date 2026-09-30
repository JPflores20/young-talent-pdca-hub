import { Fragment } from "react";
import { X, Plus, MinusCircle, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AutoResizeTextarea } from "@/components/pdca_dialog/common/auto-resize-textarea";

export function FiveWhysTable({
  value,
  title,
  index,
  whysCount,
  isFullscreen,
  setIsFullscreen,
  onTitleChange,
  addWhyColumn,
  removeWhyColumn,
  addRow,
  removeRow,
  updateRow,
  onRemoveTable,
}: {
  value?: any[] | undefined;
  title?: string | undefined;
  index: number;
  whysCount: number;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  onTitleChange?: ((title: string) => void) | undefined;
  addWhyColumn: () => void;
  removeWhyColumn: () => void;
  addRow: () => void;
  removeRow: (id: number) => void;
  updateRow: (id: number, field: string, val: string) => void;
  onRemoveTable?: (() => void) | undefined;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background shadow-sm flex-1",
        isFullscreen ? "flex flex-col h-full" : "",
      )}
    >
      <div className="flex justify-between items-center px-2 py-1 bg-white dark:bg-background border-b border-[#0078D7]">
        <input
          type="text"
          value={title || "MÉTODO"}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="text-[11px] font-bold text-[#0078D7] uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 p-0.5 w-48"
          placeholder="TÍTULO DE LA TABLA"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
              onClick={addWhyColumn}
            >
              <Plus className="mr-1 size-3" /> Añadir Por Qué
            </Button>
            {whysCount > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
                onClick={removeWhyColumn}
              >
                <MinusCircle className="mr-1 size-3" /> Quitar Por Qué
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={addRow}
          >
            <Plus className="mr-1 size-3" /> Añadir Causa
          </Button>
          {onRemoveTable && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
                >
                  <X className="mr-1 size-3" /> Eliminar Tabla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar tabla 5 Whys?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todas las
                    preguntas y respuestas registradas en esta tabla.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemoveTable}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="mr-1 size-3" /> Expandir
            </Button>
          )}
          <span className="text-[11px] font-bold text-[#0078D7] uppercase">
            TEMA {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            {Array.from({ length: whysCount }).map((_, i) => (
              <th
                key={i}
                className="font-bold uppercase text-center border-r border-white/20 p-2 text-[10px] min-w-[150px]"
              >
                {i + 1}º POR QUÉ
              </th>
            ))}
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">
              CAUSA RAÍZ
            </th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[150px] border-r border-white/20">
              ACCION(ES)
            </th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {value?.map((row: any) => (
            <Fragment key={row.id}>
              {/* Fila de Preguntas */}
              <tr className="border-b border-white group">
                {Array.from({ length: whysCount }).map((_, i) => (
                  <td
                    key={`q-${i}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      row.isRootCause === "Sí"
                        ? "bg-red-50 dark:bg-red-950/30"
                        : row.isRootCause === "No"
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-blue-100/50 dark:bg-blue-900/20",
                    )}
                  >
                    <AutoResizeTextarea
                      value={row[`q${i + 1}`] || ""}
                      onChange={(val) => updateRow(row.id, `q${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-semibold focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/60 overflow-hidden"
                      placeholder="Pregunta..."
                    />
                  </td>
                ))}
                <td
                  rowSpan={2}
                  className={cn(
                    "p-1 border-r border-white align-middle text-center min-w-[80px]",
                    row.isRootCause === "Sí"
                      ? "bg-red-100 dark:bg-red-900/40"
                      : row.isRootCause === "No"
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-[#E2E2E2] dark:bg-secondary",
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Button
                      variant={row.isRootCause === "Sí" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateRow(row.id, "isRootCause", row.isRootCause === "Sí" ? "" : "Sí")
                      }
                      className={cn(
                        "h-6 w-12 text-[10px] px-0",
                        row.isRootCause === "Sí"
                          ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                          : "hover:bg-red-50 hover:text-red-600",
                      )}
                    >
                      SÍ
                    </Button>
                    <Button
                      variant={row.isRootCause === "No" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateRow(row.id, "isRootCause", row.isRootCause === "No" ? "" : "No")
                      }
                      className={cn(
                        "h-6 w-12 text-[10px] px-0",
                        row.isRootCause === "No"
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          : "hover:bg-green-50 hover:text-green-600",
                      )}
                    >
                      NO
                    </Button>
                  </div>
                </td>
                <td
                  rowSpan={2}
                  className={cn(
                    "p-0 border-r border-white align-top",
                    row.isRootCause === "Sí"
                      ? "bg-red-50 dark:bg-red-950/30"
                      : row.isRootCause === "No"
                        ? "bg-green-50 dark:bg-green-950/30"
                        : "bg-[#E2E2E2] dark:bg-secondary",
                  )}
                >
                  <AutoResizeTextarea
                    value={row.accion || ""}
                    onChange={(val) => updateRow(row.id, "accion", val)}
                    className="w-full min-h-[80px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground overflow-hidden"
                  />
                </td>

                <td rowSpan={2} className="bg-background align-middle">
                  {(value?.length || 0) > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive mx-auto block"
                        >
                          <X className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar fila?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar esta fila? Esta acción no se puede
                            deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeRow(row.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
              {/* Fila de Respuestas */}
              <tr className="border-b-[3px] border-[#0078D7] group">
                {Array.from({ length: whysCount }).map((_, i) => (
                  <td
                    key={`w-${i}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      row.isRootCause === "Sí"
                        ? "bg-red-100 dark:bg-red-900/40"
                        : row.isRootCause === "No"
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-[#E2E2E2] dark:bg-secondary",
                    )}
                  >
                    <AutoResizeTextarea
                      value={row[`w${i + 1}`] || ""}
                      onChange={(val) => updateRow(row.id, `w${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/50 overflow-hidden"
                      placeholder="Respuesta..."
                    />
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
