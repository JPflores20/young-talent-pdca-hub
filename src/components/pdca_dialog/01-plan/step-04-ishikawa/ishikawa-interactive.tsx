import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { StepCard } from "@/components/ui/step-card";
import { CategoryBox } from "./category-box";
import { PrioritizationMatrix } from "./prioritization-matrix";

export function IshikawaInteractive({
  causes,
  setCauses,
  effect,
  setEffect,
  prioritizationCauses,
  setPrioritizationCauses,
  customLabels = {},
  setCustomLabels,
  titleSuffix = "",
  title,
  setTitle,
}: {
  causes: Record<string, string[]>;
  setCauses: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  effect: string;
  setEffect: (val: string) => void;
  prioritizationCauses?: any[] | undefined;
  setPrioritizationCauses?: ((causes: any[]) => void) | undefined;
  customLabels?: Record<string, string> | undefined;
  setCustomLabels?: (
    labels: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>),
  ) => void | undefined;
  titleSuffix?: string | undefined;
  title?: string | undefined;
  setTitle?: ((t: string) => void) | undefined;
}) {
  const categories = [
    { id: "machine", label: customLabels["machine"] ?? "Concepto de: Máquina", position: "top" as const },
    { id: "method", label: customLabels["method"] ?? "Concepto de: Método", position: "top" as const },
    { id: "material", label: customLabels["material"] ?? "Concepto de: Material", position: "top" as const },
    {
      id: "manpower",
      label: customLabels["manpower"] ?? "Concepto de: Mano de Obra",
      position: "bottom" as const,
    },
    {
      id: "measurement",
      label: customLabels["measurement"] ?? "Concepto de: Medición",
      position: "bottom" as const,
    },
    {
      id: "environment",
      label: customLabels["environment"] ?? "Concepto de: Medio Amb.",
      position: "bottom" as const,
    },
  ];

  const handleLabelChange = (id: string, newLabel: string) => {
    if (setCustomLabels) {
      setCustomLabels((prev) => ({ ...prev, [id]: newLabel }));
    }
  };

  const addCause = (id: string, value: string) => {
    if (!value.trim()) return;
    setCauses((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), value.trim()],
    }));
  };

  const removeCause = (id: string, index: number) => {
    setCauses((prev) => ({
      ...prev,
      [id]: (prev[id] || []).filter((_, i) => i !== index),
    }));
  };

  const fishboneDiagram = (
    <div className="relative pt-4 pb-4 overflow-x-auto min-h-[400px]">
      <div className="min-w-[800px] relative mt-4">
        <div className="absolute top-1/2 left-0 right-36 h-1.5 bg-border rounded-full -translate-y-1/2 z-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-[8px] border-transparent border-l-border"></div>
        </div>

        <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-widest p-2 rounded-xl border border-destructive/30 z-10 w-36 text-center flex flex-col items-center justify-center shadow-sm min-h-[90px]">
          <span className="text-[9px] font-semibold text-destructive/70 uppercase tracking-wider mb-1">
            Efecto / Problema
          </span>
          <Textarea
            value={effect}
            onChange={(e) => setEffect(e.target.value)}
            placeholder="Escribe el efecto..."
            rows={2}
            className="w-full text-center bg-transparent border-none text-destructive font-bold text-xs resize-none focus-visible:ring-1 focus-visible:ring-destructive/40 p-0 shadow-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {categories
            .filter((c) => c.position === "top")
            .map((cat) => (
              <div key={cat.id} className="flex flex-col items-center">
                <CategoryBox
                  cat={cat}
                  causesList={causes[cat.id] || []}
                  onAdd={addCause}
                  onRemove={removeCause}
                  onLabelChange={handleLabelChange}
                />
                <div className="w-0.5 h-8 bg-border"></div>
              </div>
            ))}
        </div>

        <div className="h-4"></div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {categories
            .filter((c) => c.position === "bottom")
            .map((cat) => (
              <div key={cat.id} className="flex flex-col items-center">
                <div className="w-0.5 h-8 bg-border"></div>
                <CategoryBox
                  cat={cat}
                  causesList={causes[cat.id] || []}
                  onAdd={addCause}
                  onRemove={removeCause}
                  onLabelChange={handleLabelChange}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <StepCard
      className="overflow-hidden"
      title={
        <Input
          value={title ?? `ISHIKAWA${titleSuffix}`}
          onChange={(e) => setTitle?.(e.target.value)}
          placeholder={`ISHIKAWA${titleSuffix}`}
          className="text-sm font-bold text-muted-foreground uppercase tracking-wider bg-transparent border-transparent hover:border-border focus-visible:border-border px-2 py-0 h-8 w-64 shadow-none"
        />
      }
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Maximize2 className="size-3.5" /> Expandir Diagrama
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full p-6">
            <h3 className="text-lg font-bold uppercase mb-4">
              {title ?? `ISHIKAWA${titleSuffix}`}
            </h3>
            {fishboneDiagram}
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {fishboneDiagram}
        <PrioritizationMatrix value={prioritizationCauses} onChange={setPrioritizationCauses} />
      </div>
    </StepCard>
  );
}
