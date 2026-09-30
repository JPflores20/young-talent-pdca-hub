import { useState } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Series } from "./flavor-correlation-utils";
import { SERIES_COLORS } from "./flavor-correlation-utils";
import { FlavorCorrelationEditor } from "./flavor-correlation-editor";
import { FlavorCorrelationChart } from "./flavor-correlation-chart";

export function FlavorCorrelationSection({
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title = "Correlación",
}: {
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
}) {
  const [positiveTitle, setPositiveTitle] = useState(
    "SENSORY (GLOBAL PANEL) VS % OF TASTERS WHO IDENTIFY THE POSITIVE ATTRIBUTES",
  );
  const [negativeTitle, setNegativeTitle] = useState(
    "SENSORY (GLOBAL PANEL) VS % OF TASTERS WHO IDENTIFY THE NEGATIVE ATTRIBUTES",
  );

  const [seriesList, setSeriesList] = useState<Series[]>([
    {
      id: "1",
      name: "Clean-End-Finish",
      type: "positive",
      fill: "#000",
      stroke: "#f1c40f",
      points: [
        { id: 1, x: 30, y: 6.3 },
        { id: 2, x: 8, y: 6.1 },
        { id: 3, x: 10, y: 6.2 },
        { id: 4, x: 70, y: 7.7 },
        { id: 5, x: 85, y: 7.1 },
      ],
    },
    {
      id: "2",
      name: "Esters",
      type: "positive",
      fill: "#f1c40f",
      stroke: "#000",
      points: [
        { id: 6, x: 10, y: 6.2 },
        { id: 7, x: 2, y: 6.1 },
        { id: 8, x: 5, y: 6.1 },
        { id: 9, x: 30, y: 7.2 },
        { id: 10, x: 55, y: 7.7 },
      ],
    },
    {
      id: "pos3",
      name: "Positivo 3",
      type: "positive",
      fill: "#3498db",
      stroke: "#2980b9",
      points: [],
    },
    {
      id: "pos4",
      name: "Positivo 4",
      type: "positive",
      fill: "#e74c3c",
      stroke: "#c0392b",
      points: [],
    },
    {
      id: "3",
      name: "Linger-Bitter",
      type: "negative",
      fill: "#4a2e00",
      stroke: "#000",
      points: [
        { id: 11, x: 30, y: 7.8 },
        { id: 12, x: 50, y: 7.1 },
        { id: 13, x: 60, y: 6.4 },
        { id: 14, x: 135, y: 6.1 },
      ],
    },
    {
      id: "4",
      name: "Smokey-Phenolic",
      type: "negative",
      fill: "#f1c40f",
      stroke: "#000",
      points: [
        { id: 15, x: 2, y: 7.7 },
        { id: 16, x: 25, y: 7.2 },
        { id: 17, x: 65, y: 6.2 },
        { id: 18, x: 70, y: 6.2 },
      ],
    },
    {
      id: "5",
      name: "Astringent-Drying",
      type: "negative",
      fill: "#654321",
      stroke: "#f1c40f",
      points: [
        { id: 19, x: 30, y: 6.2 },
        { id: 20, x: 50, y: 6.2 },
        { id: 21, x: 60, y: 6.3 },
        { id: 22, x: 50, y: 7.2 },
      ],
    },
    {
      id: "neg4",
      name: "Negativo 4",
      type: "negative",
      fill: "#9b59b6",
      stroke: "#8e44ad",
      points: [],
    },
  ]);

  const addSeries = (type: "positive" | "negative") => {
    const currentCount = seriesList.filter((s) => s.type === type).length;
    if (currentCount >= 4) return;

    const colorObj = SERIES_COLORS[seriesList.length % SERIES_COLORS.length] ?? {
      fill: "#000000",
      stroke: "#f1c40f",
    };

    setSeriesList((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Nueva Serie ${currentCount + 1}`,
        type,
        fill: colorObj.fill,
        stroke: colorObj.stroke,
        points: [],
      },
    ]);
  };

  const removeSeries = (seriesId: string) => {
    setSeriesList((prev) => prev.filter((s) => s.id !== seriesId));
  };

  const updateSeriesName = (seriesId: string, newName: string) => {
    setSeriesList((prev) => prev.map((s) => (s.id === seriesId ? { ...s, name: newName } : s)));
  };

  const addPoint = (seriesId: string) => {
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.id === seriesId) {
          return { ...s, points: [...s.points, { id: Date.now(), x: 0, y: 6.0 }] };
        }
        return s;
      }),
    );
  };

  const updatePoint = (seriesId: string, pointId: number, field: "x" | "y", value: number) => {
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.id === seriesId) {
          return {
            ...s,
            points: s.points.map((p) => (p.id === pointId ? { ...p, [field]: value } : p)),
          };
        }
        return s;
      }),
    );
  };

  const removePoint = (seriesId: string, pointId: number) => {
    setSeriesList((prev) =>
      prev.map((s) => {
        if (s.id === seriesId) {
          return { ...s, points: s.points.filter((p) => p.id !== pointId) };
        }
        return s;
      }),
    );
  };

  const positiveSeries = seriesList.filter((s) => s.type === "positive");
  const negativeSeries = seriesList.filter((s) => s.type === "negative");

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="size-4 mr-2" /> Editar Puntos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold">GESTOR DINÁMICO DE CORRELACIONES</h3>
            <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-6 pr-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">
                    Atributos Positivos ({positiveSeries.length}/4)
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addSeries("positive")}
                    disabled={positiveSeries.length >= 4}
                    className="h-7 text-xs"
                  >
                    <Plus className="size-3 mr-1" /> Nueva Correlación
                  </Button>
                </div>
                {positiveSeries.map((s) => (
                  <FlavorCorrelationEditor
                    key={s.id}
                    series={s}
                    updateSeriesName={updateSeriesName}
                    addPoint={addPoint}
                    removeSeries={removeSeries}
                    updatePoint={updatePoint}
                    removePoint={removePoint}
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    Atributos Negativos ({negativeSeries.length}/4)
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => addSeries("negative")}
                    disabled={negativeSeries.length >= 4}
                    className="h-7 text-xs"
                  >
                    <Plus className="size-3 mr-1" /> Nueva Correlación
                  </Button>
                </div>
                {negativeSeries.map((s) => (
                  <FlavorCorrelationEditor
                    key={s.id}
                    series={s}
                    updateSeriesName={updateSeriesName}
                    addPoint={addPoint}
                    removeSeries={removeSeries}
                    updatePoint={updatePoint}
                    removePoint={removePoint}
                  />
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid xl:grid-cols-2 gap-6">
        <FlavorCorrelationChart
          title={positiveTitle}
          setTitle={setPositiveTitle}
          seriesList={positiveSeries}
          isPositive={true}
        />
        <FlavorCorrelationChart
          title={negativeTitle}
          setTitle={setNegativeTitle}
          seriesList={negativeSeries}
          isPositive={false}
        />
      </div>
    </StepCard>
  );
}
