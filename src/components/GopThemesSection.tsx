import React from "react";
import { StepCard } from "@/components/ui/step-card";
import { Plus, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { GopThemeItem } from "@/data/pdca";

interface GopThemesSectionProps {
  data: GopThemeItem[];
  onChange: (data: GopThemeItem[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

const MONTHS = ["Ene", "FEB", "MAR", "Abr", "MAY", "Jun", "JUL", "Ago", "SEP", "OCT", "NOV", "Dic"];

const STATUS_COLORS = {
  "Not Started": "bg-gray-300 text-gray-800",
  "In Progress": "bg-amber-400 text-amber-900",
  Complete: "bg-emerald-500 text-white",
  "": "bg-transparent text-transparent",
};

export function GopThemesSection({
  data,
  onChange,
  isStepCompleted,
  onToggleStep,
}: GopThemesSectionProps) {
  const addRow = () => {
    onChange([
      ...data,
      {
        id: Date.now(),
        tema: "",
        meses: Array(12).fill(false),
        mesesValues: Array(12).fill("100%"), // Almacena los porcentajes
        mesesColors: Array(12).fill("red"), // Almacena el color (rojo o verde)
        focusItems: "",
        status: "",
      } as GopThemeItem,
    ]);
  };

  const removeRow = (id: number) => {
    onChange(data.filter((item) => item.id !== id));
  };

  const updateRow = (id: number, field: keyof GopThemeItem, value: any) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  // Ciclo de clics: Transparente (false) -> Rojo (true) -> Verde (true) -> Transparente (false)
  const toggleMonth = (id: number, monthIndex: number) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          const localItem = item as any;
          const newMeses = [...item.meses];
          const newMesesValues = localItem.mesesValues
            ? [...localItem.mesesValues]
            : Array(12).fill("100%");
          const newMesesColors = localItem.mesesColors
            ? [...localItem.mesesColors]
            : Array(12).fill("red");

          const isActive = newMeses[monthIndex];
          const currentColor = newMesesColors[monthIndex];

          if (!isActive) {
            // 1. Estaba apagado, lo encendemos en rojo
            newMeses[monthIndex] = true;
            newMesesColors[monthIndex] = "red";
          } else if (currentColor === "red") {
            // 2. Estaba en rojo, lo pasamos a verde
            newMeses[monthIndex] = true;
            newMesesColors[monthIndex] = "green";
          } else {
            // 3. Estaba en verde, lo apagamos
            newMeses[monthIndex] = false;
            newMesesColors[monthIndex] = "red"; // Reseteamos a rojo para la próxima vez
          }

          return {
            ...item,
            meses: newMeses,
            mesesValues: newMesesValues,
            mesesColors: newMesesColors,
          };
        }
        return item;
      }),
    );
  };

  const updateMonthValue = (id: number, monthIndex: number, value: string) => {
    onChange(
      data.map((item) => {
        if (item.id === id) {
          const localItem = item as any;
          const newMesesValues = localItem.mesesValues
            ? [...localItem.mesesValues]
            : Array(12).fill("100%");
          newMesesValues[monthIndex] = value;
          return { ...item, mesesValues: newMesesValues };
        }
        return item;
      }),
    );
  };

  return (
    <StepCard
      title="Cumplimiento de GOPs Aplicables"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 w-10 text-center">#</th>
              <th className="border border-border p-2 min-w-[300px]">
                CUMPLIMIENTO DE GOPS APLICABLES
              </th>
              {MONTHS.map((m) => (
                <th
                  key={m}
                  className="border border-border p-2 w-10 text-center text-xs bg-[#0070c0] text-white font-bold"
                >
                  {m}
                </th>
              ))}
              <th className="border border-border p-2 w-28 text-center text-xs">Fecha Compromiso</th>
              <th className="border border-border p-2 w-20 text-center text-xs">% Avance</th>
              <th className="border border-border p-2 w-24 text-center text-xs">Focus GOP Items</th>
              <th className="border border-border p-2 w-32 text-center text-xs">
                Focus GOP status
              </th>
              <th className="border border-border p-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={19} className="p-4 text-center text-muted-foreground">
                  No hay temas registrados. Haz clic en "Agregar Tema" para comenzar.
                </td>
              </tr>
            )}
            {data.map((item, index) => (
              <tr key={item.id} className="group hover:bg-muted/30">
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
                  const localItem = item as any;
                  const monthValue = localItem.mesesValues?.[mIndex] ?? "100%";
                  const monthColor = localItem.mesesColors?.[mIndex] ?? "red";

                  // Determinamos el color de fondo en base al estado
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
                    value={(item as any).fechaCompromiso || ""}
                    onChange={(e) => updateRow(item.id, "fechaCompromiso" as any, e.target.value)}
                    className="h-8 text-xs px-1 border-0 shadow-none bg-transparent"
                  />
                </td>
                <td className="border border-border p-1 text-center relative align-top">
                  <div className="flex items-center justify-center h-8">
                    <Input
                      type="number"
                      value={(item as any).porcentajeAvance || ""}
                      onChange={(e) => updateRow(item.id, "porcentajeAvance" as any, e.target.value)}
                      className="h-full w-16 text-center text-xs border-0 shadow-none bg-transparent hide-arrows px-1"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground ml-1">%</span>
                  </div>
                  {/* Retrasado badge */}
                  {(item as any).fechaCompromiso && (item as any).porcentajeAvance !== undefined && (
                    <div className="mt-1">
                      {new Date((item as any).fechaCompromiso + "T00:00:00") < new Date(new Date().setHours(0,0,0,0)) &&
                        Number((item as any).porcentajeAvance || 0) < 100 && (
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
                      value={(item as any).focusType || "#"}
                      onChange={(e) => updateRow(item.id, "focusType" as any, e.target.value)}
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
                    onChange={(e) => updateRow(item.id, "status", e.target.value as any)}
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
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <Button onClick={addRow} variant="outline" size="sm" className="gap-2">
          <Plus className="size-4" /> Agregar Tema
        </Button>
      </div>
    </StepCard>
  );
}
