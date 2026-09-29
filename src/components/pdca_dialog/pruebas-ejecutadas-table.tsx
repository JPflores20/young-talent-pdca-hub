import React, { useState } from "react";
import { Plus, Trash2, X, UploadCloud, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepCard } from "@/components/ui/step-card";
import type { PruebaEjecutadaItem } from "@/data/pdca";
import { cn } from "@/lib/utils";

// ─── Comprimir imagen antes de subir ─────────────────────────────────────────
function compressImage(file: File, maxWidth = 2048, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compresión fallida"))),
          "image/jpeg",
          quality,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// ─── Subir imagen a Firebase Storage ─────────────────────────────────────────
async function uploadToFirebase(file: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `uploads/pruebas_ejecutadas_evidencias/${uniqueId}.${fileExt}`;
  const storageRef = ref(storage, fileName);

  let blobToUpload: Blob = file;
  if (file.type.startsWith("image/")) {
    blobToUpload = await compressImage(file);
  }

  const uploadTask = uploadBytesResumable(storageRef, blobToUpload);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(uploadTask.snapshot.ref)),
    );
  });
}

interface PruebasEjecutadasTableProps {
  items: PruebaEjecutadaItem[];
  onChange: (items: PruebaEjecutadaItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const PruebasEjecutadasTable: React.FC<PruebasEjecutadasTableProps> = ({ items, onChange, isStepCompleted, isNa, onToggleStep, onToggleNa }) => {
  const [uploadingRows, setUploadingRows] = useState<Set<string>>(new Set());

  const handleAdd = () => {
    const newItem: PruebaEjecutadaItem = {
      id: crypto.randomUUID(),
      prueba: "",
      fecha: "",
      resultado: "",
      estado: "",
      evidencia: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof PruebaEjecutadaItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 23: PRUEBAS EJECUTADAS"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> Agregar Prueba
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">PRUEBA / ACCIÓN</TableHead>
                <TableHead className="font-bold text-white text-center w-36">FECHA</TableHead>
                <TableHead className="font-bold text-white text-center">RESULTADO ESPERADO VS REAL</TableHead>
                <TableHead className="font-bold text-white text-center w-32">ESTADO</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No hay pruebas registradas.
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.prueba}
                      onChange={(e) => handleUpdate(item.id, "prueba", e.target.value)}
                      placeholder="Descripción de la prueba..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      type="date"
                      value={item.fecha}
                      onChange={(e) => handleUpdate(item.id, "fecha", e.target.value)}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.resultado}
                      onChange={(e) => handleUpdate(item.id, "resultado", e.target.value)}
                      placeholder="Resultado..."
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Select
                      value={item.estado}
                      onValueChange={(val) => handleUpdate(item.id, "estado", val)}
                    >
                      <SelectTrigger className="h-8 text-xs shadow-none">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Exitoso">Exitoso</SelectItem>
                        <SelectItem value="Fallido">Fallido</SelectItem>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="p-1.5 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {items && items.filter((item) => item.prueba.trim() !== "").length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">EVIDENCIAS POR PRUEBA / ACCIÓN</h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items
                .filter((item) => item.prueba.trim() !== "")
                .map((item, i) => {
                  const existing = item.evidencia;
                  const isUploading = uploadingRows.has(item.id);
                  const cardClass = cn(
                    "flex flex-col border rounded-xl p-3 bg-white border-border"
                  );
                  const dropzoneClass = cn(
                    "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group bg-slate-50 border-slate-200"
                  );

                  return (
                    <div key={item.id} className={cardClass}>
                      <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={item.prueba}>
                        {i + 1}. {item.prueba}
                      </p>
                      <div className={dropzoneClass}>
                        {existing ? (
                          <>
                            {existing.includes("application/pdf") ? (
                              <a href={existing} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-full text-red-500 font-bold hover:bg-red-50">
                                <FileText className="size-8 mr-2" /> PDF
                              </a>
                            ) : (
                              <img src={existing} alt={`Evidencia ${i + 1}`} className="w-full h-full object-contain" />
                            )}
                            <button
                              onClick={() => handleUpdate(item.id, "evidencia", "")}
                              className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 hover:bg-white shadow-sm"
                            >
                              <X className="size-4" />
                            </button>
                          </>
                        ) : isUploading ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <RefreshCw className="size-6 mb-1 animate-spin" />
                            <span className="text-[10px] uppercase font-semibold">Subiendo...</span>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                            <UploadCloud className="size-6 mb-1" />
                            <span className="text-[10px] uppercase font-semibold">Subir Foto/PDF</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setUploadingRows((prev) => new Set(prev).add(item.id));
                                    const url = await uploadToFirebase(file);
                                    handleUpdate(item.id, "evidencia", url);
                                  } catch (error) {
                                    console.error("Error subiendo evidencia:", error);
                                  } finally {
                                    setUploadingRows((prev) => {
                                      const next = new Set(prev);
                                      next.delete(item.id);
                                      return next;
                                    });
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
};
