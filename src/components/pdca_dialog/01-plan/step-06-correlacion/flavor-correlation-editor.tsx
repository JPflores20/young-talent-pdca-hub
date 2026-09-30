import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Series } from "./flavor-correlation-utils";

export function FlavorCorrelationEditor({
  series,
  updateSeriesName,
  addPoint,
  removeSeries,
  updatePoint,
  removePoint,
}: {
  series: Series;
  updateSeriesName: (id: string, name: string) => void;
  addPoint: (id: string) => void;
  removeSeries: (id: string) => void;
  updatePoint: (seriesId: string, pointId: number, field: "x" | "y", value: number) => void;
  removePoint: (seriesId: string, pointId: number) => void;
}) {
  return (
    <div className="border rounded p-3 space-y-3 bg-card">
      <div className="flex justify-between items-center gap-2">
        <Input
          value={series.name}
          onChange={(e) => updateSeriesName(series.id, e.target.value)}
          className="h-7 text-sm font-bold w-full"
          placeholder="Nombre de la serie"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => addPoint(series.id)}
          className="h-7 text-xs px-2 shrink-0"
        >
          <Plus className="size-3 mr-1" /> Punto
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeSeries(series.id)}
          className="h-7 w-7 text-destructive shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {series.points.map((p) => (
          <div key={p.id} className="flex items-center gap-1 bg-secondary/30 p-1 rounded border">
            <span className="text-[10px] font-bold w-3 text-center">X</span>
            <Input
              type="number"
              value={p.x}
              onChange={(e) => updatePoint(series.id, p.id, "x", Number(e.target.value))}
              className="h-6 text-xs px-1"
            />
            <span className="text-[10px] font-bold w-3 text-center ml-1">Y</span>
            <Input
              type="number"
              step="0.1"
              value={p.y}
              onChange={(e) => updatePoint(series.id, p.id, "y", Number(e.target.value))}
              className="h-6 text-xs px-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePoint(series.id, p.id)}
              className="h-6 w-6 text-destructive shrink-0"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
        {series.points.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-2">
            No hay puntos. Añade uno para comenzar.
          </p>
        )}
      </div>
    </div>
  );
}
