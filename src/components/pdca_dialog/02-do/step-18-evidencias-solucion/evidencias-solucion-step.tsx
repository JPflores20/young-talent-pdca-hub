import React, { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "@/components/pdca_dialog/common/step-instructions";
import type { ActionItem, EvidenciaSolucionItem } from "@/data/pdca";

interface EvidenciasSolucionStepProps {
  actions: ActionItem[];
  evidencias: EvidenciaSolucionItem[];
  onEvidenciasChange: (evs: EvidenciaSolucionItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const EvidenciasSolucionStep: React.FC<EvidenciasSolucionStepProps> = ({
  actions,
  evidencias,
  onEvidenciasChange,
  isStepCompleted, isNa, onToggleStep, onToggleNa,
}) => {
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const handleImageChange = (actionId: string, image: string | undefined) => {
    const newEvidencias = [...evidencias];
    const index = newEvidencias.findIndex((e) => e.actionId === actionId);
    
    if (image) {
      if (index >= 0 && newEvidencias[index]) {
        newEvidencias[index].image = image;
      } else {
        newEvidencias.push({ actionId, image });
      }
    } else {
      if (index >= 0) {
        newEvidencias.splice(index, 1);
      }
    }
    
    onEvidenciasChange(newEvidencias);
  };

  const processFile = async (actionId: string, file: File) => {
    if (!file.type.startsWith("image/")) return;

    try {
      setUploadingState(prev => ({ ...prev, [actionId]: true }));

      const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("@/lib/firebase");

      const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);

      const compressImage = (f: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 2048;
              const MAX_HEIGHT = 2048;

              if (width > height) {
                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
              } else {
                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (blob) resolve(blob);
                  else reject(new Error("Error al comprimir la imagen"));
                },
                f.type === "image/png" ? "image/png" : "image/jpeg",
                0.85
              );
            };
            img.onerror = () => reject(new Error("Error cargando imagen"));
            img.src = event.target?.result as string;
          };
          reader.onerror = () => reject(new Error("Error leyendo archivo"));
          reader.readAsDataURL(f);
        });
      };

      const compressedFile = await compressImage(file);
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `uploads/pdca_images/${uniqueId}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Error al subir archivo:", error);
          setUploadingState(prev => ({ ...prev, [actionId]: false }));
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          handleImageChange(actionId, downloadURL);
          setUploadingState(prev => ({ ...prev, [actionId]: false }));
        }
      );
    } catch (err) {
      console.error("Error procesando imagen:", err);
      setUploadingState(prev => ({ ...prev, [actionId]: false }));
    }
  };

  const handleFileChange = (actionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(actionId, file);
    e.target.value = "";
  };

  return (
    <StepCard
      title="PASO 19: EVIDENCIA DE SOLUCIONES"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        Por cada acción del plan, adjunta una foto o PDF como evidencia.
      </StepInstructions>

      <div className="mt-4 space-y-8">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase">EVIDENCIAS POR ACCIÓN</h4>
          {actions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No hay acciones definidas en el Paso 18.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((action, i) => {
                const label = `${action.accion || "Sin acción"} - ${action.resultados || "Sin solución/resultado"}`;
                const existing = evidencias.find((e) => e.actionId === action.id)?.image;
                const isUploading = uploadingState[action.id];

                return (
                  <div key={action.id} className="flex flex-col border border-border rounded-xl p-3 bg-white">
                    <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={label}>
                      {i + 1}. {label}
                    </p>
                    <div className="relative mt-auto h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden group">
                      {isUploading ? (
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Loader2 className="size-6 animate-spin mb-1 text-primary" />
                          <span className="text-[10px] uppercase font-semibold">Subiendo...</span>
                        </div>
                      ) : existing ? (
                        <>
                          <img src={existing} alt={`Evidencia ${i + 1}`} className="w-full h-full object-contain" />
                          <button
                            onClick={() => handleImageChange(action.id, undefined)}
                            className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 hover:bg-white"
                          >
                            <X className="size-4" />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                          <UploadCloud className="size-6 mb-1" />
                          <span className="text-[10px] uppercase font-semibold">Subir Foto</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(action.id, e)} />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StepCard>
  );
};
