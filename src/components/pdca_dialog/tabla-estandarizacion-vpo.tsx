import React, { useRef } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TablaEstandarizacionVpoItem } from "@/data/pdca-types";

interface TablaEstandarizacionVpoProps {
  items: TablaEstandarizacionVpoItem[];
  onChange: (items: TablaEstandarizacionVpoItem[]) => void;
}

export const TablaEstandarizacionVpo: React.FC<TablaEstandarizacionVpoProps> = ({ items, onChange }) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAdd = () => {
    const newItem: TablaEstandarizacionVpoItem = {
      id: crypto.randomUUID(),
      nombreEstandar: "",
      herramientaVpo: "",
      dueno: "",
      equipoComunicara: "",
      datosEntrenamiento: "",
      gopPresentacion: "",
      fechaFinalizacion: "",
      status: "",
      evidencia: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof TablaEstandarizacionVpoItem, value: string) => {
    const newItems = (items || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange((items || []).filter((item) => item.id !== id));
  };

  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(id, "evidencia", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string) => {
    handleUpdate(id, "evidencia", "");
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id]!.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Tabla de Estandarización VPO</h3>
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> Agregar Fila
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1200px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">Nombre del Estandar</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">HERRAMIENTA VPO</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">DUEÑO / Responsable</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] min-w-[150px]">EQUIPO QUE SE COMUNICARÁ / ENTRENARÁ</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] min-w-[150px]">DATOS DE ENTRENAMIENTO</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] min-w-[150px]">GOP O LA PRESENTACIÓN DE MEJORES PRÁCTICAS?</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">FECHA DE FINALIZACIÓN</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">Status</TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] w-24">Evidencia</TableHead>
              <TableHead className="w-12 border-none"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  No hay registros de estandarización. Agrega uno.
                </TableCell>
              </TableRow>
            )}
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-1.5 align-top">
                  <Textarea
                    value={item.nombreEstandar}
                    onChange={(e) => handleUpdate(item.id, "nombreEstandar", e.target.value)}
                    className="min-h-[60px] h-full text-xs shadow-none resize-none"
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Textarea
                    value={item.herramientaVpo}
                    onChange={(e) => handleUpdate(item.id, "herramientaVpo", e.target.value)}
                    className="min-h-[60px] h-full text-xs shadow-none resize-none"
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Textarea
                    value={item.dueno}
                    onChange={(e) => handleUpdate(item.id, "dueno", e.target.value)}
                    className="min-h-[60px] h-full text-xs shadow-none resize-none"
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Textarea
                    value={item.equipoComunicara}
                    onChange={(e) => handleUpdate(item.id, "equipoComunicara", e.target.value)}
                    className="min-h-[60px] h-full text-xs shadow-none resize-none"
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Textarea
                    value={item.datosEntrenamiento}
                    onChange={(e) => handleUpdate(item.id, "datosEntrenamiento", e.target.value)}
                    className="min-h-[60px] h-full text-xs shadow-none resize-none"
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Textarea
                    value={item.gopPresentacion}
                    onChange={(e) => handleUpdate(item.id, "gopPresentacion", e.target.value)}
                    className="min-h-[60px] h-full text-xs shadow-none resize-none"
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Input
                    type="date"
                    value={item.fechaFinalizacion}
                    onChange={(e) => handleUpdate(item.id, "fechaFinalizacion", e.target.value)}
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <select
                    value={item.status || ""}
                    onChange={(e) => handleUpdate(item.id, "status", e.target.value)}
                    className={`w-full h-8 text-xs border rounded-md outline-none cursor-pointer px-2 ${
                      item.status === "Not Started" ? "bg-slate-100 text-slate-700 font-medium" :
                      item.status === "In Progress" ? "bg-blue-100 text-blue-700 font-medium border-blue-200" :
                      item.status === "Complete" ? "bg-green-100 text-green-700 font-medium border-green-200" :
                      item.status === "Retrasado" ? "bg-red-100 text-red-700 font-medium border-red-200" :
                      "bg-transparent text-slate-700"
                    }`}
                  >
                    <option value="" className="bg-white text-slate-900 font-normal">Seleccionar...</option>
                    <option value="Not Started" className="bg-white text-slate-900 font-normal">Not Started</option>
                    <option value="In Progress" className="bg-white text-slate-900 font-normal">In Progress</option>
                    <option value="Complete" className="bg-white text-slate-900 font-normal">Complete</option>
                    <option value="Retrasado" className="bg-white text-slate-900 font-normal">Retrasado</option>
                  </select>
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <div className="flex flex-col items-center justify-center min-h-[60px] border rounded-md border-dashed bg-secondary/20 relative">
                    {item.evidencia && item.evidencia.startsWith("data:") ? (
                      <div className="relative w-full h-16 group">
                        {item.evidencia.startsWith("data:video/") ? (
                          <video src={item.evidencia} className="w-full h-full object-cover rounded-md" />
                        ) : (
                          <img src={item.evidencia} alt="Evidencia" className="w-full h-full object-cover rounded-md" />
                        )}
                        <button
                          onClick={() => removeImage(item.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Eliminar evidencia"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          ref={(el) => (fileInputRefs.current[item.id] = el)}
                          onChange={(e) => handleFileChange(item.id, e)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => fileInputRefs.current[item.id]?.click()}
                          title="Subir foto o video"
                        >
                          <Upload className="size-4 text-muted-foreground" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-1.5 align-middle text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar fila"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
