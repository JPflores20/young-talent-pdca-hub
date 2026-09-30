import React from "react";
import { type DefinicionMeta } from "@/data/pdca";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO, isValid } from "date-fns";
import { DEFAULT_DEFINICION_META } from "./pdca-goal-defaults";

interface PdcaGoalDefinitionProps {
  value?: DefinicionMeta;
  onChange: (newValue: DefinicionMeta) => void;
  readOnly?: boolean;
}

export function PdcaGoalDefinition({ value, onChange, readOnly = false }: PdcaGoalDefinitionProps) {
  const meta: DefinicionMeta = {
    ...DEFAULT_DEFINICION_META,
    ...(value || {}),
  };

  const updateField = (field: keyof DefinicionMeta, val: string) => {
    if (readOnly) return;
    onChange({
      ...meta,
      [field]: val,
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="w-full overflow-x-auto rounded-lg border border-border/80 bg-card shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-xs">
          <thead>
            <tr>
              <th
                colSpan={4}
                className="bg-[#0F2942] py-2.5 px-4 text-center font-display text-sm font-bold uppercase tracking-wider text-white shadow-sm"
              >
                DEFINICIÓN DE LA META
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60">
              <td className="w-[18%] bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                KPI
              </td>
              <td className="w-[32%] p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={meta.kpi}
                  onChange={(e) => updateField("kpi", e.target.value)}
                  placeholder="Ej. PÉRDIDA DE EXTRACTO"
                  disabled={readOnly}
                  className="h-8 font-semibold uppercase text-center text-primary border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="w-[18%] bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                PI (s)
              </td>
              <td className="w-[32%] p-2 bg-background/50">
                <Textarea
                  value={meta.pis}
                  onChange={(e) => updateField("pis", e.target.value)}
                  placeholder="Indicadores de proceso (PI)"
                  disabled={readOnly}
                  rows={2}
                  className="min-h-[40px] text-xs text-center resize-none border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary py-1 px-2"
                />
              </td>
            </tr>

            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                MÉTODO DE CÁLCULO
              </td>
              <td colSpan={3} className="p-2 bg-background/50">
                <Input
                  value={meta.metodoCalculo}
                  onChange={(e) => updateField("metodoCalculo", e.target.value)}
                  placeholder="Ej. HANNA"
                  disabled={readOnly}
                  className="h-8 font-semibold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>

            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                DESDE (Valor):
              </td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={meta.desdeValor}
                  onChange={(e) => updateField("desdeValor", e.target.value)}
                  placeholder="Ej. 2,58"
                  disabled={readOnly}
                  className="h-8 font-mono font-bold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                A (Valor):
              </td>
              <td className="p-2 bg-background/50">
                <Input
                  value={meta.aValor}
                  onChange={(e) => updateField("aValor", e.target.value)}
                  placeholder="Ej. 2,35"
                  disabled={readOnly}
                  className="h-8 font-mono font-bold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>

            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                Hasta (Fecha):
              </td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <DatePicker
                  date={
                    meta.hastaFecha && isValid(parseISO(meta.hastaFecha))
                      ? parseISO(meta.hastaFecha)
                      : undefined
                  }
                  setDate={(date) =>
                    updateField("hastaFecha", date ? format(date, "yyyy-MM-dd") : "")
                  }
                  placeholder="Seleccionar fecha"
                  disabled={readOnly}
                  className="h-8 text-xs border-none shadow-none font-mono bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-primary w-full justify-center text-center"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                UNIDAD DE MEDIDA:
              </td>
              <td className="p-2 bg-background/50">
                <Input
                  value={meta.unidadMedida}
                  onChange={(e) => updateField("unidadMedida", e.target.value)}
                  placeholder="Ej. %"
                  disabled={readOnly}
                  className="h-8 font-bold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>

            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                BENCHMARK:
              </td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={meta.benchmark}
                  onChange={(e) => updateField("benchmark", e.target.value)}
                  placeholder="Valor o planta benchmark"
                  disabled={readOnly}
                  className="h-8 text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                MEJORA:
              </td>
              <td className="p-2 bg-background/50">
                <Select
                  value={meta.mejora}
                  onValueChange={(val) => updateField("mejora", val)}
                  disabled={readOnly}
                >
                  <SelectTrigger className="h-8 border-none shadow-none text-xs font-semibold justify-center text-center">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lower">lower (Reducir / Menor)</SelectItem>
                    <SelectItem value="higher">higher (Incrementar / Mayor)</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>

            <tr>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                RESPONSABLE:
              </td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={meta.responsable}
                  onChange={(e) => updateField("responsable", e.target.value)}
                  placeholder="Nombre del responsable"
                  disabled={readOnly}
                  className="h-8 font-medium text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                FACILITADOR/LÍDER:
              </td>
              <td className="p-2 bg-background/50">
                <Input
                  value={meta.facilitadorLider}
                  onChange={(e) => updateField("facilitadorLider", e.target.value)}
                  placeholder="Ej. Jaime Lagunas"
                  disabled={readOnly}
                  className="h-8 font-semibold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
