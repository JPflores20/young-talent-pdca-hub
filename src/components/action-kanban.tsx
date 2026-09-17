import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ActionItem } from "@/data/pdca";

const parseTaskDate = (whenStr?: string): Date | undefined => {
  if (!whenStr) return undefined;
  let d = new Date(`${whenStr}T12:00:00`);
  if (!isNaN(d.getTime())) return d;
  d = new Date(whenStr);
  if (!isNaN(d.getTime())) return d;
  return undefined;
};

// Colores extraídos exactamente del diseño de la imagen
const STATUS_COLORS = {
  "NO INICIADO": "bg-[#5D6770] text-white",
  "EN PROGRESO": "bg-[#FFC000] text-black",
  COMPLETADO: "bg-[#00B050] text-white",
  // Soporte de compatibilidad para datos viejos que ya tenías guardados
  Pendiente: "bg-[#5D6770] text-white",
  "En progreso": "bg-[#FFC000] text-black",
  Completada: "bg-[#00B050] text-white",
} as const;

export function ActionKanban({
  acciones,
  setAcciones,
}: {
  acciones: ActionItem[];
  setAcciones: (updater: (prev: ActionItem[]) => ActionItem[]) => void;
}) {
  const addAction = () => {
    setAcciones((prev) => [
      ...prev,
      {
        id: `A-${Date.now()}`,
        tema: "",
        causa: "",
        what: "",
        comentarios: "",
        who: "",
        when: "",
        status: "NO INICIADO",
        sdca: "", // CORREGIDO: Ahora inicia completamente vacío
        done: false,
      } as any,
    ]);
  };

  const updateAction = (id: string, field: string, value: any) => {
    setAcciones((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const removeAction = (id: string) => {
    setAcciones((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={addAction}>
          <Plus className="size-4 mr-2" /> Agregar Acción
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table className="text-xs min-w-[1000px]">
          <TableHeader>
            <TableRow className="bg-[#0070c0] hover:bg-[#0070c0]">
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20">
                TEMA
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20">
                CAUSA RAÍZ
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20">
                ACCIÓN
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20">
                COMENTARIOS
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20 w-[140px] text-center">
                RESPONSABLE
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20 w-[140px] text-center">
                FECHA
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20 w-[140px] text-center">
                ESTADO
              </TableHead>
              <TableHead className="text-white font-bold h-8 py-1 px-3 border-r border-white/20 text-center">
                HERRAMIENTA SDCA
              </TableHead>
              <TableHead className="w-10 h-8 py-1 px-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {acciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                  No hay acciones registradas. Haz clic en "Agregar Acción" para comenzar.
                </TableCell>
              </TableRow>
            )}
            {acciones.map((task) => (
              <TableRow key={task.id} className="hover:bg-muted/30">
                <TableCell className="p-0 border-r">
                  <Input
                    value={(task as any).tema || ""}
                    onChange={(e) => updateAction(task.id, "tema", e.target.value)}
                    placeholder="Tema..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>
                <TableCell className="p-0 border-r">
                  <Input
                    value={(task as any).causa || ""}
                    onChange={(e) => updateAction(task.id, "causa", e.target.value)}
                    placeholder="Causa raíz..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>
                <TableCell className="p-0 border-r">
                  <Input
                    value={task.what || ""}
                    onChange={(e) => updateAction(task.id, "what", e.target.value)}
                    placeholder="Acción..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>
                <TableCell className="p-0 border-r">
                  <Input
                    value={(task as any).comentarios || ""}
                    onChange={(e) => updateAction(task.id, "comentarios", e.target.value)}
                    placeholder="Comentarios..."
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs"
                  />
                </TableCell>
                <TableCell className="p-0 border-r">
                  <Input
                    value={task.who || ""}
                    onChange={(e) => updateAction(task.id, "who", e.target.value)}
                    placeholder="Responsable"
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-xs text-center text-muted-foreground"
                  />
                </TableCell>
                <TableCell className="p-1 border-r relative">
                  <DatePicker
                    date={parseTaskDate(task.when)}
                    setDate={(date) => {
                      if (date && !isNaN(date.getTime())) {
                        const formatted = date.toISOString().split("T")[0];
                        if (formatted) updateAction(task.id, "when", formatted);
                      } else {
                        updateAction(task.id, "when", "");
                      }
                    }}
                    className="h-8 w-full text-xs shadow-none border-0 bg-transparent flex justify-center text-muted-foreground font-medium"
                  />
                </TableCell>
                <TableCell className="p-1 border-r">
                  <div className="relative w-full h-8">
                    <select
                      value={task.status || "NO INICIADO"}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setAcciones((prev) =>
                          prev.map((a) =>
                            a.id === task.id
                              ? { ...a, status: newStatus as any, done: newStatus === "COMPLETADO" }
                              : a,
                          ),
                        );
                      }}
                      className={cn(
                        "w-full h-full text-[10px] font-bold text-center border-0 outline-none cursor-pointer rounded-sm appearance-none",
                        STATUS_COLORS[
                          (task.status || "NO INICIADO") as keyof typeof STATUS_COLORS
                        ] || "bg-[#5D6770] text-white",
                      )}
                    >
                      <option value="NO INICIADO" className="bg-[#5D6770] text-white">
                        NO INICIADO
                      </option>
                      <option value="EN PROGRESO" className="bg-[#FFC000] text-black">
                        EN PROGRESO
                      </option>
                      <option value="COMPLETADO" className="bg-[#00B050] text-white">
                        COMPLETADO
                      </option>

                      <option value="Pendiente" className="hidden">
                        Pendiente
                      </option>
                      <option value="En progreso" className="hidden">
                        En progreso
                      </option>
                      <option value="Completada" className="hidden">
                        Completada
                      </option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-white">
                      <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                        <path
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="p-0 border-r">
                  <Input
                    value={(task as any).sdca || ""}
                    onChange={(e) => updateAction(task.id, "sdca", e.target.value)}
                    placeholder="Herramienta SDCA"
                    className="h-10 border-0 rounded-none shadow-none focus-visible:ring-0 bg-transparent text-[10px] text-center text-muted-foreground uppercase"
                  />
                </TableCell>
                <TableCell className="p-0 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAction(task.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
