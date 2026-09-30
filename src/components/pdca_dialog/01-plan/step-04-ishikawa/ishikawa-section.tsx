import { Plus, X } from "lucide-react";
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
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "@/components/pdca_dialog/common/step-instructions";
import type { IshikawaItem } from "@/data/pdca";
import { IshikawaInteractive } from "./ishikawa-interactive";

export function IshikawaSection({
  ishikawas,
  onChange,
  isStepCompleted, isNa, onToggleStep, onToggleNa,
  hasFlavorCorrelation,
  onToggleFlavorCorrelation,
}: {
  ishikawas: IshikawaItem[];
  onChange: (items: IshikawaItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  hasFlavorCorrelation?: boolean | undefined;
  onToggleFlavorCorrelation?: ((val: boolean) => void) | undefined;
}) {
  const addIshikawa = () => {
    onChange([
      ...ishikawas,
      {
        id: Date.now().toString(),
        causes: {},
        effect: "",
        prioritization: [],
        title: "",
      },
    ]);
  };

  const updateIshikawa = (id: string, field: keyof IshikawaItem, value: any) => {
    onChange(ishikawas.map((ish) => (ish.id === id ? { ...ish, [field]: value } : ish)));
  };

  const removeIshikawa = (id: string) => {
    onChange(ishikawas.filter((ish) => ish.id !== id));
  };

  return (
    <StepCard
      className="col-span-full border-none shadow-none bg-transparent"
      title="PASO 11: ANÁLISIS DE CAUSA RAÍZ (ISHIKAWA)"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        <p className="mb-2">1. Escribe el Efecto o Problema a analizar en la cabeza del pez.</p>
        <p className="mb-2">2. Agrega posibles causas usando las 6 M's.</p>
        <p className="mb-2">3. Prioriza las causas probables usando la matriz en la parte inferior.</p>
        <p>4. Si necesitas analizar más de un problema, haz clic en "Agregar otro Ishikawa".</p>
      </StepInstructions>

      <div className="space-y-12">
        {ishikawas.map((ish, index) => (
          <div key={ish.id} className="relative">
            {ishikawas.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -top-10 right-0 text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                  >
                    <X className="size-3 mr-1" /> Eliminar Ishikawa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar diagrama de Ishikawa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminarán permanentemente las causas y
                      priorizaciones registradas en este diagrama.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => removeIshikawa(ish.id)}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <IshikawaInteractive
              causes={ish.causes}
              setCauses={(c) =>
                updateIshikawa(ish.id, "causes", typeof c === "function" ? c(ish.causes) : c)
              }
              effect={ish.effect || ""}
              setEffect={(e) => updateIshikawa(ish.id, "effect", e)}
              prioritizationCauses={ish.prioritization}
              setPrioritizationCauses={(p) => updateIshikawa(ish.id, "prioritization", p)}
              customLabels={ish.customLabels || {}}
              setCustomLabels={(l) =>
                updateIshikawa(
                  ish.id,
                  "customLabels",
                  typeof l === "function" ? l(ish.customLabels || {}) : l,
                )
              }
              titleSuffix={ishikawas.length > 1 ? ` ${index + 1}` : ""}
              title={ish.title}
              setTitle={(t) => updateIshikawa(ish.id, "title", t)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center border-t border-border/60 pt-6 mt-8">
        <Button
          onClick={addIshikawa}
          variant="outline"
          className="gap-2 shadow-sm bg-card hover:bg-card/80"
        >
          <Plus className="size-4" /> Agregar otro Ishikawa
        </Button>
      </div>
    </StepCard>
  );
}
