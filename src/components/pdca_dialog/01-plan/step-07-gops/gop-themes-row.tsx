import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { GopThemeItem } from "@/data/pdca";

const STATUS_COLORS = {
  "Not Started": "bg-gray-300 text-gray-800",
  "In Progress": "bg-amber-400 text-amber-900",
  Complete: "bg-emerald-500 text-white",
  "": "bg-transparent text-transparent",
};

interface GopThemeRowProps {
  item: GopThemeItem;
  index: number;
  updateRow: (id: number, field: keyof GopThemeItem | string, value: any) => void;
  removeRow: (id: number) => void;
  toggleMonth: (id: number, monthIndex: number) => void;
  updateMonthValue: (id: number, monthIndex: number, value: string) => void;
}

export function GopThemeRow({
  item,
  index,
  updateRow,
  removeRow,
  toggleMonth,
  updateMonthValue,
}: GopThemeRowProps) {
  const localItem = item as any;

  return (
    <tr className="group hover:bg-muted/30">
      <td className="border border-border p-2 text-center font-bold bg-[#0070c0] text-white">
        {index + 1}
      </td>
      <td className="border border-border p-0">
        <Textarea
          value={item.tema}
          onChange={(e) => updateRow(item.id, "tema", e.target.value)}
          className="border-0 focus-visible:ring-0 resize-none min-h-[60px] rounded-none bg-transparent"
          placeholder="Describe el tema..."
        />
      </td>
      {item.meses.map((isActive, mIndex) => {
        const monthValue = localItem.mesesValues?.[mIndex] ?? "100%";
        const monthColor = localItem.mesesColors?.[mIndex] ?? "red";

        let bgColorClass = "bg-transparent hover:bg-secondary";
        if (isActive) {
          bgColorClass = monthColor === "green" ? "bg-[#00b050]" : "bg-[#c00000]";
        }

        return (
          <td
            key={mIndex}
            className={cn(
              "border border-border p-0 cursor-pointer transition-colors duration-200",
              bgColorClass,
            )}
            onClick={() => toggleMonth(item.id, mIndex)}
          >
            <div className="w-10 h-full min-h-[60px] flex items-center justify-center">
              {isActive && (
                <Input
                  value={monthValue}
                  onChange={(e) => updateMonthValue(item.id, mIndex, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-8 w-full text-center text-white font-bold text-[10px] bg-transparent border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/70"
                />
              )}
            </div>
          </td>
        );
      })}
      <td className="border border-border p-1 align-top">
        <Input
          type="date"
          value={localItem.fechaCompromiso || ""}
          onChange={(e) => updateRow(item.id, "fechaCompromiso", e.target.value)}
          className="h-8 text-xs px-1 border-0 shadow-none bg-transparent"
        />
      </td>
      <td className="border border-border p-1 text-center relative align-top">
        <div className="flex items-center justify-center h-8">
          <Input
            type="number"
            value={localItem.porcentajeAvance || ""}
            onChange={(e) => updateRow(item.id, "porcentajeAvance", e.target.value)}
            className="h-full w-16 text-center text-xs border-0 shadow-none bg-transparent hide-arrows px-1"
            placeholder="0"
          />
          <span className="text-xs text-muted-foreground ml-1">%</span>
        </div>
        {localItem.fechaCompromiso && localItem.porcentajeAvance !== undefined && (
          <div className="mt-1">
            {new Date(localItem.fechaCompromiso + "T00:00:00") <
              new Date(new Date().setHours(0, 0, 0, 0)) &&
              Number(localItem.porcentajeAvance || 0) < 100 && (
                <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase">
                  Retrasado
                </span>
              )}
          </div>
        )}
      </td>
      <td className="border border-border p-0 align-top">
        <div className="flex h-full min-h-[60px] items-center">
          <select
            value={localItem.focusType || "#"}
            onChange={(e) => updateRow(item.id, "focusType", e.target.value)}
            className="border-0 bg-transparent text-xs w-10 text-center focus-visible:ring-0 cursor-pointer outline-none font-bold"
          >
            <option value="#">#</option>
            <option value="%">%</option>
          </select>
          <Input
            value={item.focusItems}
            onChange={(e) => updateRow(item.id, "focusItems", e.target.value)}
            className="border-0 focus-visible:ring-0 text-left rounded-none bg-transparent h-full flex-1 px-1"
            placeholder="Valor..."
          />
        </div>
      </td>
      <td className="border border-border p-1">
        <select
          value={item.status}
          onChange={(e) => updateRow(item.id, "status", e.target.value)}
          className={cn(
            "w-full h-full min-h-[52px] text-xs font-semibold text-center border-0 outline-none cursor-pointer rounded",
            STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "bg-transparent",
          )}
        >
          <option value="" className="bg-background text-foreground">
            Seleccionar...
          </option>
          <option value="Not Started" className="bg-gray-300 text-gray-800">
            Not Started
          </option>
          <option value="In Progress" className="bg-amber-400 text-amber-900">
            In Progress
          </option>
          <option value="Complete" className="bg-emerald-500 text-white">
            Complete
          </option>
        </select>
      </td>
      <td className="border border-border p-1 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeRow(item.id)}
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
        >
          <X className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
