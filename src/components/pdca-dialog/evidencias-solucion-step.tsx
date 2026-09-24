import React from "react";
import { UploadCloud, X } from "lucide-react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "./step-instructions";
import { ImageUploadSection } from "../image-upload-section";
import { Badge } from "@/components/ui/badge";
import type { ActionItem, EvidenciaSolucionItem } from "@/data/pdca";

interface EvidenciasSolucionStepProps {
  kpiFocoImage?: string;
  onKpiFocoImageChange: (img: string | undefined) => void;
  actions: ActionItem[];
  evidencias: EvidenciaSolucionItem[];
  onEvidenciasChange: (evs: EvidenciaSolucionItem[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

export const EvidenciasSolucionStep: React.FC<EvidenciasSolucionStepProps> = ({
  kpiFocoImage,
  onKpiFocoImageChange,
  actions,
  evidencias,
  onEvidenciasChange,
  isStepCompleted,
  onToggleStep,
}) => {
  const handleImageChange = (actionId: string, image: string | undefined) => {
    const newEvidencias = [...evidencias];
    const index = newEvidencias.findIndex((e) => e.actionId === actionId);
    
    if (image) {
      if (index >= 0) {
        newEvidencias[index].image = image;
      } else {
        newEvidencias.push({ id: crypto.randomUUID(), actionId, image });
      }
    } else {
      if (index >= 0) {
        newEvidencias.splice(index, 1);
      }
    }
    
    onEvidenciasChange(newEvidencias);
  };

  const handleFileChange = (actionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        handleImageChange(actionId, event.target.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <StepCard
      title="PASO 9: IMPLEMENTACIÓN DE SOLUCIONES"
      isCompleted={isStepCompleted}
      onToggleComplete={onToggleStep}
      headerRight={<Badge className="bg-yellow-400 hover:bg-yellow-500 text-yellow-950 font-bold border-0 ml-2">REVISIÓN</Badge>}
    >
      <StepInstructions>
        Sube la imagen del KPI Tree Foco a trabajar. Luego, por cada acción del plan, adjunta una foto como evidencia.
      </StepInstructions>

      <div className="mt-4 space-y-8">
        <div className="border border-border rounded-xl p-4 bg-secondary/10">
          <ImageUploadSection
            image={kpiFocoImage || null}
            onChange={(img) => onKpiFocoImageChange(img || undefined)}
            title="KPI TREE FOCO A TRABAJAR"
            subtitle="Sube la imagen del KPI Tree objetivo"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-700 uppercase">Evidencias por Acción</h4>
          {actions.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No hay acciones definidas en el Paso 8.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {actions.map((action, i) => {
                const label = `${action.accion || "Sin acción"} - ${action.resultados || "Sin solución/resultado"}`;
                const existing = evidencias.find((e) => e.actionId === action.id)?.image;
                return (
                  <div key={action.id} className="flex flex-col border border-border rounded-xl p-3 bg-white">
                    <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={label}>
                      {i + 1}. {label}
                    </p>
                    <div className="relative mt-auto h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden group">
                      {existing ? (
                        <>
                          <img src={existing} alt={`Evidencia ${i + 1}`} className="w-full h-full object-contain" />
                          <button
                            onClick={() => handleActionImageChange(action.id, undefined)}
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
