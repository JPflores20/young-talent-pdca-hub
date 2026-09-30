import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AutoResizeTextarea } from "@/components/pdca_dialog/common/auto-resize-textarea";

export function PrioritizationMatrix({
  value = [],
  onChange,
}: {
  value?: any[] | undefined;
  onChange?: ((causes: any[]) => void) | undefined;
}) {
  const causes =
    value && value.length > 0
      ? value
      : [
          { id: 1, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
          { id: 2, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
          { id: 3, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
          { id: 4, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
        ];

  const updateCause = (id: number, field: string, val: string) => {
    if (onChange) {
      onChange(causes.map((c) => (c.id === id ? { ...c, [field]: val } : c)));
    }
  };

  const addRow = () => {
    if (onChange) {
      onChange([
        ...causes,
        { id: Date.now(), text: "", impact: "", authority: "", difficulty: "", criteria: "" },
      ]);
    }
  };

  const removeRow = (id: number) => {
    if (onChange && causes.length > 1) {
      onChange(causes.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="mt-8 border border-[#0078D7] rounded-sm overflow-hidden bg-white shadow-sm dark:bg-background">
      <div className="bg-white dark:bg-background px-2 py-1 flex items-center justify-between border-b border-[#0078D7]">
        <span className="text-[11px] font-bold text-[#0078D7] uppercase tracking-wide">
          PRIORIZACIÓN - CAUSAS PROBABLES - PROBLEMA 1
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={addRow}
          className="h-6 px-2 text-[10px] uppercase font-bold text-[#0078D7] hover:bg-[#0078D7]/10"
        >
          <Plus className="size-3 mr-1" /> Agregar causa
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0078D7] text-white">
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[30%]">
                CAUSAS PROBABLES
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                IMPACTO SOBRE EL PROBLEMA
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                AUTORIDAD
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                DIFICULTAD
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                CRITERIO ADICIONAL
              </th>
              <th className="font-bold uppercase text-center p-2 text-[10px] w-[14%]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {causes.map((c) => {
              const impact = Number(c.impact) || 0;
              const authority = Number(c.authority) || 0;
              const difficulty = Number(c.difficulty) || 0;

              let total = impact * authority * difficulty;
              const criteriaText = String(c.criteria || "").trim();
              const criteriaNum = Number(criteriaText);

              if (criteriaText !== "" && !isNaN(criteriaNum)) {
                total *= criteriaNum;
              }

              const isHigh = total > 0;

              return (
                <tr key={c.id} className="border-b border-white group">
                  <td className="bg-[#E2E2E2] dark:bg-secondary p-0 border-r border-white relative group/td">
                    <AutoResizeTextarea
                      value={c.text}
                      onChange={(val) => updateCause(c.id, "text", val)}
                      className="py-1.5 font-medium focus-visible:ring-black/20 text-xs text-center dark:text-foreground pr-8"
                    />
                    {causes.length > 1 && (
                      <button
                        onClick={() => removeRow(c.id)}
                        className="absolute right-2 top-2 text-muted-foreground/60 hover:text-destructive transition-colors"
                        title="Eliminar causa"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={c.impact}
                      onChange={(e) => updateCause(c.id, "impact", e.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={c.authority}
                      onChange={(e) => updateCause(c.id, "authority", e.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={c.difficulty}
                      onChange={(e) => updateCause(c.id, "difficulty", e.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <AutoResizeTextarea
                      value={c.criteria}
                      onChange={(val) => updateCause(c.id, "criteria", val)}
                      placeholder="Texto..."
                      className="py-1.5 font-medium text-white text-center focus-visible:ring-white/50 text-xs placeholder:text-white/50"
                    />
                  </td>
                  <td
                    className={cn(
                      "p-0 text-center font-bold text-xs",
                      isHigh
                        ? "bg-[#00B050] text-white"
                        : "bg-[#E2E2E2] dark:bg-secondary text-black/60 dark:text-foreground/60",
                    )}
                  >
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
