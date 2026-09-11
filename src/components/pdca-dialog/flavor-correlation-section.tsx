import { useState } from "react";
import { Plus, X, FileText } from "lucide-react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceArea
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepCard } from "@/components/ui/step-card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

// ─── Types & Helper ──────────────────────────────────────────────────────────

type Point = { id: number; x: number; y: number };

type Series = {
  id: string;
  name: string;
  type: "positive" | "negative";
  fill: string;
  stroke: string;
  points: Point[];
};

// Función para calcular la Correlación de Pearson automáticamente
function calculatePearson(points: Point[]): string {
  if (points.length < 2) return "0.000";
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
    sumY2 += p.y * p.y;
  }
  const n = points.length;
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  if (den === 0) return "0.000";
  return (num / den).toFixed(3);
}

// Paleta de colores predefinida para nuevas series
const SERIES_COLORS = [
  { fill: "#000000", stroke: "#f1c40f" },
  { fill: "#f1c40f", stroke: "#000000" },
  { fill: "#4a2e00", stroke: "#000000" },
  { fill: "#654321", stroke: "#f1c40f" },
  { fill: "#3498db", stroke: "#2980b9" },
  { fill: "#e74c3c", stroke: "#c0392b" },
];

export function FlavorCorrelationSection({
  isStepCompleted,
  onToggleStep,
}: {
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const [positiveTitle, setPositiveTitle] = useState("Sensory (Global Panel) vs % of tasters who identify the positive attributes");
  const [negativeTitle, setNegativeTitle] = useState("Sensory (Global Panel) vs % of tasters who identify the Negative Attributes");

  // Estado dinámico para todas las series, iniciado con 4 en cada lado
  const [seriesList, setSeriesList] = useState<Series[]>([
    // POSITIVOS
    { id: "1", name: "Clean-End-Finish", type: "positive", fill: "#000", stroke: "#f1c40f", points: [{ id: 1, x: 30, y: 6.3 }, { id: 2, x: 8, y: 6.1 }, { id: 3, x: 10, y: 6.2 }, { id: 4, x: 70, y: 7.7 }, { id: 5, x: 85, y: 7.1 }] },
    { id: "2", name: "Esters", type: "positive", fill: "#f1c40f", stroke: "#000", points: [{ id: 6, x: 10, y: 6.2 }, { id: 7, x: 2, y: 6.1 }, { id: 8, x: 5, y: 6.1 }, { id: 9, x: 30, y: 7.2 }, { id: 10, x: 55, y: 7.7 }] },
    { id: "pos3", name: "Positivo 3", type: "positive", fill: "#3498db", stroke: "#2980b9", points: [] },
    { id: "pos4", name: "Positivo 4", type: "positive", fill: "#e74c3c", stroke: "#c0392b", points: [] },
    // NEGATIVOS
    { id: "3", name: "Linger-Bitter", type: "negative", fill: "#4a2e00", stroke: "#000", points: [{ id: 11, x: 30, y: 7.8 }, { id: 12, x: 50, y: 7.1 }, { id: 13, x: 60, y: 6.4 }, { id: 14, x: 135, y: 6.1 }] },
    { id: "4", name: "Smokey-Phenolic", type: "negative", fill: "#f1c40f", stroke: "#000", points: [{ id: 15, x: 2, y: 7.7 }, { id: 16, x: 25, y: 7.2 }, { id: 17, x: 65, y: 6.2 }, { id: 18, x: 70, y: 6.2 }] },
    { id: "5", name: "Astringent-Drying", type: "negative", fill: "#654321", stroke: "#f1c40f", points: [{ id: 19, x: 30, y: 6.2 }, { id: 20, x: 50, y: 6.2 }, { id: 21, x: 60, y: 6.3 }, { id: 22, x: 50, y: 7.2 }] },
    { id: "neg4", name: "Negativo 4", type: "negative", fill: "#9b59b6", stroke: "#8e44ad", points: [] }
  ]);

  // ─── Funciones de actualización ──────────────────────────────────────────────

  const addSeries = (type: "positive" | "negative") => {
    const currentCount = seriesList.filter(s => s.type === type).length;
    if (currentCount >= 4) return; // Límite de 4 correlaciones

    const colorObj = SERIES_COLORS[seriesList.length % SERIES_COLORS.length] ?? { fill: "#000000", stroke: "#f1c40f" };
    
    setSeriesList(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Nueva Serie ${currentCount + 1}`,
        type,
        fill: colorObj.fill,
        stroke: colorObj.stroke,
        points: []
      }
    ]);
  };

  const removeSeries = (seriesId: string) => {
    setSeriesList(prev => prev.filter(s => s.id !== seriesId));
  };

  const updateSeriesName = (seriesId: string, newName: string) => {
    setSeriesList(prev => prev.map(s => s.id === seriesId ? { ...s, name: newName } : s));
  };

  const addPoint = (seriesId: string) => {
    setSeriesList(prev => prev.map(s => {
      if (s.id === seriesId) {
        return { ...s, points: [...s.points, { id: Date.now(), x: 0, y: 6.0 }] };
      }
      return s;
    }));
  };

  const updatePoint = (seriesId: string, pointId: number, field: "x" | "y", value: number) => {
    setSeriesList(prev => prev.map(s => {
      if (s.id === seriesId) {
        return {
          ...s,
          points: s.points.map(p => p.id === pointId ? { ...p, [field]: value } : p)
        };
      }
      return s;
    }));
  };

  const removePoint = (seriesId: string, pointId: number) => {
    setSeriesList(prev => prev.map(s => {
      if (s.id === seriesId) {
        return { ...s, points: s.points.filter(p => p.id !== pointId) };
      }
      return s;
    }));
  };

  const positiveSeries = seriesList.filter(s => s.type === "positive");
  const negativeSeries = seriesList.filter(s => s.type === "negative");

  // ─── Componente Editor de Serie ──────────────────────────────────────────────

  const SeriesEditor = ({ series }: { series: Series }) => (
    <div className="border rounded p-3 space-y-3 bg-card">
      <div className="flex justify-between items-center gap-2">
        <Input 
          value={series.name} 
          onChange={e => updateSeriesName(series.id, e.target.value)}
          className="h-7 text-sm font-bold w-full"
          placeholder="Nombre de la serie"
        />
        <Button variant="outline" size="sm" onClick={() => addPoint(series.id)} className="h-7 text-xs px-2 shrink-0">
          <Plus className="size-3 mr-1"/> Punto
        </Button>
        <Button variant="ghost" size="icon" onClick={() => removeSeries(series.id)} className="h-7 w-7 text-destructive shrink-0">
          <X className="size-4"/>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {series.points.map(p => (
          <div key={p.id} className="flex items-center gap-1 bg-secondary/30 p-1 rounded border">
            <span className="text-[10px] font-bold w-3 text-center">X</span>
            <Input type="number" value={p.x} onChange={e => updatePoint(series.id, p.id, "x", Number(e.target.value))} className="h-6 text-xs px-1" />
            <span className="text-[10px] font-bold w-3 text-center ml-1">Y</span>
            <Input type="number" step="0.1" value={p.y} onChange={e => updatePoint(series.id, p.id, "y", Number(e.target.value))} className="h-6 text-xs px-1" />
            <Button variant="ghost" size="icon" onClick={() => removePoint(series.id, p.id)} className="h-6 w-6 text-destructive shrink-0"><X className="size-3"/></Button>
          </div>
        ))}
        {series.points.length === 0 && <p className="text-xs text-muted-foreground col-span-2">No hay puntos. Añade uno para comenzar.</p>}
      </div>
    </div>
  );

  return (
    <StepCard 
      title="Correlación"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="size-4 mr-2" /> Editar Puntos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold">Gestor Dinámico de Correlaciones</h3>
            <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-6 pr-2">
              
              {/* Columna Positivos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">Atributos Positivos ({positiveSeries.length}/4)</h4>
                  <Button variant="secondary" size="sm" onClick={() => addSeries("positive")} disabled={positiveSeries.length >= 4} className="h-7 text-xs">
                    <Plus className="size-3 mr-1" /> Nueva Correlación
                  </Button>
                </div>
                {positiveSeries.map(s => <SeriesEditor key={s.id} series={s} />)}
              </div>

              {/* Columna Negativos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-red-700 dark:text-red-400">Atributos Negativos ({negativeSeries.length}/4)</h4>
                  <Button variant="secondary" size="sm" onClick={() => addSeries("negative")} disabled={negativeSeries.length >= 4} className="h-7 text-xs">
                    <Plus className="size-3 mr-1" /> Nueva Correlación
                  </Button>
                </div>
                {negativeSeries.map(s => <SeriesEditor key={s.id} series={s} />)}
              </div>

            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid xl:grid-cols-2 gap-6">
        
        {/* CHART 1: POSITIVE */}
        <div className="space-y-2">
          <input 
            value={positiveTitle} 
            onChange={(e) => setPositiveTitle(e.target.value)} 
            className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
          />
          <div className="h-64 border bg-white relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
                <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
                <ZAxis type="number" range={[100, 100]} />
                <RTooltip cursor={{ strokeDasharray: '3 3' }} />
                
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                
                {positiveSeries.map(s => (
                  <Scatter key={s.id} name={s.name} data={s.points} fill={s.fill} stroke={s.stroke} strokeWidth={2} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 items-end">
            <span className="font-bold text-sm mb-1 w-full text-center sm:w-auto sm:text-left">Pearson Correlation</span>
            {positiveSeries.map(s => (
              <div key={`legend-${s.id}`} className="flex flex-col items-center">
                <span className="flex items-center gap-1 text-xs font-semibold">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill, borderColor: s.stroke, borderWidth: 1 }}></div> 
                  {s.name}
                </span>
                <span className="bg-amber-400 font-bold px-4 py-0.5 text-black mt-1 rounded-sm">
                  {calculatePearson(s.points)}
                </span>
              </div>
            ))}
            {positiveSeries.length === 0 && <span className="text-muted-foreground text-xs italic mb-1">No hay series creadas</span>}
          </div>
        </div>

        {/* CHART 2: NEGATIVE */}
        <div className="space-y-2">
          <input 
            value={negativeTitle} 
            onChange={(e) => setNegativeTitle(e.target.value)} 
            className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
          />
          <div className="h-64 border bg-white relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid />
                <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
                <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
                <ZAxis type="number" range={[100, 100]} />
                <RTooltip cursor={{ strokeDasharray: '3 3' }} />
                
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                <ReferenceArea x1={40} x2={180} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                
                {negativeSeries.map(s => (
                  <Scatter key={s.id} name={s.name} data={s.points} fill={s.fill} stroke={s.stroke} strokeWidth={2} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 items-end">
            <span className="font-bold text-sm mb-1 w-full text-center sm:w-auto sm:text-left">Pearson Correlation</span>
            {negativeSeries.map(s => (
               <div key={`legend-${s.id}`} className="flex flex-col items-center">
                 <span className="flex items-center gap-1 text-xs font-semibold">
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill, borderColor: s.stroke, borderWidth: 1 }}></div> 
                   {s.name}
                 </span>
                 <span className="bg-amber-400 font-bold px-3 py-0.5 text-black mt-1 rounded-sm">
                   {calculatePearson(s.points)}
                 </span>
               </div>
            ))}
            {negativeSeries.length === 0 && <span className="text-muted-foreground text-xs italic mb-1">No hay series creadas</span>}
          </div>
        </div>

      </div>
    </StepCard>
  );
}