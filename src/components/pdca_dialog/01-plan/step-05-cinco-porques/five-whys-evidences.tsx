import { RefreshCw, UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadToFirebase } from "./five-whys-utils";

export function FiveWhysEvidences({
  value,
  uploadingRows,
  setUploadingRows,
  updateRow,
}: {
  value?: any[] | undefined;
  uploadingRows: Set<number>;
  setUploadingRows: React.Dispatch<React.SetStateAction<Set<number>>>;
  updateRow: (id: number, field: string, val: string) => void;
}) {
  return (
    <div className="mt-6 p-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">EVIDENCIAS POR ACCIÓN</h4>
      {!value || value.filter((r) => r.accion && r.accion.trim() !== "").length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          No hay acciones definidas en esta tabla.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {value
            .filter((r) => r.accion && r.accion.trim() !== "")
            .map((row, i) => {
              const existing = row.evidencia;
              const isUploading = uploadingRows.has(row.id);
              const isYes = row.isRootCause === "Sí";
              const isNo = row.isRootCause === "No";
              const cardClass = cn(
                "flex flex-col border rounded-xl p-3",
                isYes
                  ? "bg-red-50 border-red-200"
                  : isNo
                    ? "bg-green-50 border-green-200"
                    : "bg-white border-border",
              );
              const dropzoneClass = cn(
                "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group",
                isYes
                  ? "bg-red-100/50 border-red-300"
                  : isNo
                    ? "bg-green-100/50 border-green-300"
                    : "bg-slate-50 border-slate-200",
              );

              return (
                <div key={row.id} className={cardClass}>
                  <p
                    className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                    title={row.accion}
                  >
                    {i + 1}. {row.accion}
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
                          onClick={() => updateRow(row.id, "evidencia", "")}
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
                                setUploadingRows((prev) => new Set(prev).add(row.id));
                                const url = await uploadToFirebase(file);
                                updateRow(row.id, "evidencia", url);
                              } catch (error) {
                                console.error("Error subiendo evidencia:", error);
                              } finally {
                                setUploadingRows((prev) => {
                                  const next = new Set(prev);
                                  next.delete(row.id);
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
      )}
    </div>
  );
}
