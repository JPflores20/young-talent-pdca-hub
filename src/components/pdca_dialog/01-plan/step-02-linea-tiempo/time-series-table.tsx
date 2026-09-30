import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface TimeSeriesTableProps {
  series: { mes: string; target: number; actual: number | null }[];
  updateMes: (i: number, val: string) => void;
  updateTarget: (i: number, val: string) => void;
  updateActual: (i: number, val: string) => void;
  addRow: () => void;
  removeRow: (i: number) => void;
  ytdTarget: number;
  ytdActual: number;
  formatValue: (val: any) => string;
}

export function TimeSeriesTable({
  series,
  updateMes,
  updateTarget,
  updateActual,
  addRow,
  removeRow,
  ytdTarget,
  ytdActual,
  formatValue,
}: TimeSeriesTableProps) {
  return (
    <div className="w-full xl:w-[40%] overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background">
      <table className="w-full text-xs text-center border-collapse">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">PERÍODO</th>
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">META</th>
            <th className="border-r border-white/20 p-2 font-bold w-[30%]">ACTUAL</th>
            <th className="p-1 w-[10%]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20 hover:text-white"
                onClick={addRow}
              >
                <Plus className="size-3" />
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {series.map((s, i) => (
            <tr key={i} className="border-b border-border/40 group">
              <td className="border-r border-border/40 p-0 font-semibold bg-[#E2E2E2] dark:bg-secondary/30">
                <Input
                  value={s.mes}
                  onChange={(e) => updateMes(i, e.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-semibold bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="border-r border-border/40 p-0">
                <Input
                  type="number"
                  value={s.target || ""}
                  onChange={(e) => updateTarget(i, e.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="border-r border-border/40 p-0">
                <Input
                  type="number"
                  value={s.actual ?? ""}
                  onChange={(e) => updateActual(i, e.target.value)}
                  className="h-8 rounded-none border-none shadow-none text-xs text-center font-mono hide-arrows focus-visible:ring-1 focus-visible:ring-black/20"
                />
              </td>
              <td className="p-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeRow(i)}
                >
                  <X className="size-3" />
                </Button>
              </td>
            </tr>
          ))}
          <tr className="border-b border-border/40">
            <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
              YTD Target
            </td>
            <td className="border-r border-border/40 p-2 font-bold font-mono text-[#0078D7]">
              {formatValue(ytdTarget)}
            </td>
            <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
            <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
          </tr>
          <tr>
            <td className="border-r border-border/40 p-2 font-bold bg-[#E2E2E2] dark:bg-secondary/30 text-right pr-4">
              YTD Actual
            </td>
            <td className="border-r border-border/40 p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
            <td className="border-r border-border/40 p-2 font-bold font-mono text-muted-foreground">
              {formatValue(ytdActual)}
            </td>
            <td className="p-2 bg-[#F2F8FC] dark:bg-secondary/10"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
