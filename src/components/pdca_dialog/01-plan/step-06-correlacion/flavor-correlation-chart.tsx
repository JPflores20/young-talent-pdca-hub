import { SafeResponsiveContainer } from "@/components/ui/safe-responsive-container";
import {
  CartesianGrid,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceArea,
} from "recharts";
import type { Series } from "./flavor-correlation-utils";
import { calculatePearson } from "./flavor-correlation-utils";

export function FlavorCorrelationChart({
  title,
  setTitle,
  seriesList,
  isPositive,
}: {
  title: string;
  setTitle: (t: string) => void;
  seriesList: Series[];
  isPositive: boolean;
}) {
  return (
    <div className="space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-sm font-semibold text-center bg-transparent border border-transparent hover:border-border focus:border-border focus:bg-background outline-none transition-colors px-2 py-0.5 rounded"
      />
      <div className="h-64 border bg-white relative">
        <SafeResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
            <CartesianGrid />
            <XAxis type="number" dataKey="x" domain={[0, 180]} tickCount={10} />
            <YAxis type="number" dataKey="y" domain={[6.0, 8.5]} tickCount={6} />
            <ZAxis type="number" range={[100, 100]} />
            <RTooltip cursor={{ strokeDasharray: "3 3" }} />

            {isPositive ? (
              <>
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#f8d7da" fillOpacity={0.5} />
                <ReferenceArea
                  x1={40}
                  x2={180}
                  y1={6.0}
                  y2={7.5}
                  fill="#fff3cd"
                  fillOpacity={0.5}
                />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#e2e3e5" fillOpacity={0.5} />
                <ReferenceArea
                  x1={40}
                  x2={180}
                  y1={7.5}
                  y2={8.5}
                  fill="#d4edda"
                  fillOpacity={0.5}
                />
              </>
            ) : (
              <>
                <ReferenceArea x1={0} x2={40} y1={6.0} y2={7.5} fill="#fff3cd" fillOpacity={0.5} />
                <ReferenceArea
                  x1={40}
                  x2={180}
                  y1={6.0}
                  y2={7.5}
                  fill="#f8d7da"
                  fillOpacity={0.5}
                />
                <ReferenceArea x1={0} x2={40} y1={7.5} y2={8.5} fill="#d4edda" fillOpacity={0.5} />
                <ReferenceArea
                  x1={40}
                  x2={180}
                  y1={7.5}
                  y2={8.5}
                  fill="#e2e3e5"
                  fillOpacity={0.5}
                />
              </>
            )}

            {seriesList.map((s) => (
              <Scatter
                key={s.id}
                name={s.name}
                data={s.points}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={2}
              />
            ))}
          </ScatterChart>
        </SafeResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-4 items-end">
        <span className="font-bold text-sm mb-1 w-full text-center sm:w-auto sm:text-left">
          Pearson Correlation
        </span>
        {seriesList.map((s) => (
          <div key={`legend-${s.id}`} className="flex flex-col items-center">
            <span className="flex items-center gap-1 text-xs font-semibold">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: s.fill, borderColor: s.stroke, borderWidth: 1 }}
              ></div>
              {s.name}
            </span>
            <span className="bg-amber-400 font-bold px-4 py-0.5 text-black mt-1 rounded-sm">
              {calculatePearson(s.points)}
            </span>
          </div>
        ))}
        {seriesList.length === 0 && (
          <span className="text-muted-foreground text-xs italic mb-1">
            No hay series creadas
          </span>
        )}
      </div>
    </div>
  );
}
