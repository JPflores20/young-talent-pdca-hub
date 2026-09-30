export type Point = { id: number; x: number; y: number };

export type Series = {
  id: string;
  name: string;
  type: "positive" | "negative";
  fill: string;
  stroke: string;
  points: Point[];
};

// Función para calcular la Correlación de Pearson automáticamente
export function calculatePearson(points: Point[]): string {
  if (points.length < 2) return "0.000";
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
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
export const SERIES_COLORS = [
  { fill: "#000000", stroke: "#f1c40f" },
  { fill: "#f1c40f", stroke: "#000000" },
  { fill: "#4a2e00", stroke: "#000000" },
  { fill: "#654321", stroke: "#f1c40f" },
  { fill: "#3498db", stroke: "#2980b9" },
  { fill: "#e74c3c", stroke: "#c0392b" },
];
