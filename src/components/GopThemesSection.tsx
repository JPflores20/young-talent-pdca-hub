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
  "Complete": "bg-emerald-500 text-white",
  "": "bg-transparent text-transparent"
};

export function GopThemesSection({ data, onChange, isStepCompleted, onToggleStep }: GopThemesSectionProps) {
  const addRow = () => {
    onChange([
      ...data,
      {
        id: Date.now(),
        tema: "",
        meses: Array(12).fill(false),
        focusItems: "",
        status: ""
      }
    ]);
  };

  const removeRow = (id: number) => {
    onChange(data.filter(item => item.id !== id));
  };

  const updateRow = (id: number, field: keyof GopThemeItem, value: any) => {
    onChange(data.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const toggleMonth = (id: number, monthIndex: number) => {
    onChange(data.map(item => {
      if (item.id === id) {
        const newMeses = [...item.meses];
        newMeses[monthIndex] = !newMeses[monthIndex];
        return { ...item, meses: newMeses };
      }
      return item;
    }));
  };

  return (
    <StepCard 
      title="Temas de GOP Aplicables"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 w-10 text-center">#</th>
              <th className="border border-border p-2 min-w-[300px]">TEMAS DE GOP APLICABLES</th>
              {MONTHS.map(m => (
                <th key={m} className="border border-border p-2 w-10 text-center text-xs bg-[#0070c0] text-white font-bold">{m}</th>
              ))}
              <th className="border border-border p-2 w-24 text-center text-xs">Focus GOP Items</th>
              <th className="border border-border p-2 w-32 text-center text-xs">Focus GOP status</th>
              <th className="border border-border p-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={17} className="p-4 text-center text-muted-foreground">
                  No hay temas registrados. Haz clic en "Agregar Tema" para comenzar.
                </td>
              </tr>
            )}
            {data.map((item, index) => (
              <tr key={item.id} className="group hover:bg-muted/30">
                <td className="border border-border p-2 text-center font-bold bg-[#0070c0] text-white">{index + 1}</td>
                <td className="border border-border p-0">
                  <Textarea 
                    value={item.tema}
                    onChange={(e) => updateRow(item.id, "tema", e.target.value)}
                    className="border-0 focus-visible:ring-0 resize-none min-h-[60px] rounded-none bg-transparent"
                    placeholder="Describe el tema..."
                  />
                </td>
                {item.meses.map((isActive, mIndex) => (
                  <td 
                    key={mIndex} 
                    className={cn(
                      "border border-border p-0 cursor-pointer transition-colors duration-200",
                      isActive ? "bg-[#c00000]" : "bg-transparent hover:bg-secondary"
                    )}
                    onClick={() => toggleMonth(item.id, mIndex)}
                  >
                    <div className="w-10 h-full min-h-[60px]"></div>
                  </td>
                ))}
                <td className="border border-border p-0">
                  <Input 
                    value={item.focusItems}
                    onChange={(e) => updateRow(item.id, "focusItems", e.target.value)}
                    className="border-0 focus-visible:ring-0 text-center rounded-none bg-transparent h-full min-h-[60px]"
                  />
                </td>
                <td className="border border-border p-1">
                  <select 
                    value={item.status}
                    onChange={(e) => updateRow(item.id, "status", e.target.value as any)}
                    className={cn(
                      "w-full h-full min-h-[52px] text-xs font-semibold text-center border-0 outline-none cursor-pointer rounded",
                      STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || "bg-transparent"
                    )}
                  >
                    <option value="" className="bg-background text-foreground">Seleccionar...</option>
                    <option value="Not Started" className="bg-gray-300 text-gray-800">Not Started</option>
                    <option value="In Progress" className="bg-amber-400 text-amber-900">In Progress</option>
                    <option value="Complete" className="bg-emerald-500 text-white">Complete</option>
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
