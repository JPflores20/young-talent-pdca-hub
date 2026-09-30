import React from "react";
import { X, UploadCloud, RefreshCw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RendimientoActualPiItem } from "@/data/pdca";
import { uploadToFirebase } from "./rendimiento-actual-utils";

interface RendimientoActualEvidencesProps {
  items: RendimientoActualPiItem[];
  uploadingRows: Set<string>;
  setUploadingRows: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleUpdate: (id: string, field: keyof RendimientoActualPiItem, value: string) => void;
}

export function RendimientoActualEvidences({
  items,
  uploadingRows,
  setUploadingRows,
  handleUpdate,
}: RendimientoActualEvidencesProps) {
  if (!items || items.filter((item) => item.nombreIndicador.trim() !== "").length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">EVIDENCIAS POR INDICADOR</h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter((item) => item.nombreIndicador.trim() !== "")
          .map((item, i) => {
            const existing = item.evidencia;
            const isUploading = uploadingRows.has(item.id);
            const cardClass = cn("flex flex-col border rounded-xl p-3 bg-white border-border");
            const dropzoneClass = cn(
              "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group bg-slate-50 border-slate-200"
            );

            return (
              <div key={item.id} className={cardClass}>
                <p
                  className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                  title={item.nombreIndicador}
                >
                  {i + 1}. {item.nombreIndicador}
                </p>
                <div className={dropzoneClass}>
                  {existing ? (
                    <>
                      {existing.includes("application/pdf") ? (
                        <a
                          href={existing}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-full h-full text-red-500 font-bold hover:bg-red-50"
                        >
                          <FileText className="size-8 mr-2" /> PDF
                        </a>
                      ) : (
                        <img
                          src={existing}
                          alt={`Evidencia ${i + 1}`}
                          className="w-full h-full object-contain"
                        />
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
  );
}
