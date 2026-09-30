import React from "react";
import { StepCard } from "@/components/ui/step-card";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GopThemeItem } from "@/data/pdca";
import { GopThemeRow } from "./gop-themes-row";

interface GopThemesSectionProps {
  data: GopThemeItem[];
  onChange: (data: GopThemeItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

const MONTHS = ["Ene", "FEB", "MAR", "Abr", "MAY", "Jun", "JUL", "Ago", "SEP", "OCT", "NOV", "Dic"];

export function GopThemesSection({
  data,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
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

  const updateRow = (id: number, field: keyof GopThemeItem | string, value: any) => {
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
          } as GopThemeItem;
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
          return { ...item, mesesValues: newMesesValues } as GopThemeItem;
        }
        return item;
      }),
    );
  };

  return (
    <StepCard
      title="PASO 14: GOPS"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
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
              <th className="border border-border p-2 w-28 text-center text-xs">FECHA COMPROMISO</th>
              <th className="border border-border p-2 w-20 text-center text-xs">% AVANCE</th>
              <th className="border border-border p-2 w-24 text-center text-xs">FOCUS GOP ITEMS</th>
              <th className="border border-border p-2 w-32 text-center text-xs">
                FOCUS GOP STATUS
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
              <GopThemeRow
                key={item.id}
                item={item}
                index={index}
                updateRow={updateRow}
                removeRow={removeRow}
                toggleMonth={toggleMonth}
                updateMonthValue={updateMonthValue}
              />
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
