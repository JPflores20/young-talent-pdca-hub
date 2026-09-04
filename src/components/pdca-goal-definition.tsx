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
import { Target, Info } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO, isValid } from "date-fns";
import TextareaAutosize from "react-textarea-autosize";

export const DEFAULT_DEFINICION_META: DefinicionMeta = {
  kpi: "PÉRDIDA DE EXTRACTO",
  pis: "Extracción de levadura en reposo y extracción de levadura en fermentación",
  metodoCalculo: "HANNA",
  desdeValor: "2,58",
  aValor: "2,35",
  hastaFecha: "2026-02-15",
  unidadMedida: "%",
  benchmark: "",
  mejora: "lower",
  responsable: "",
  facilitadorLider: "Jaime Lagunas",
};

interface PdcaGoalDefinitionProps {
  value?: DefinicionMeta;
  onChange: (newValue: DefinicionMeta) => void;
  readOnly?: boolean;
}

export function PdcaGoalDefinition({
  value,
  onChange,
  readOnly = false,
}: PdcaGoalDefinitionProps) {
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="size-5 text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Definición de la Meta (VPO Standard)
          </h3>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Info className="size-3.5" /> Formato oficial A3 / AB InBev
        </span>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-border/80 bg-card shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-xs">
          {/* Main Title Row */}
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
            {/* Row 1: KPI & PI(s) */}
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

            {/* Row 2: Método de Cálculo */}
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

            {/* Row 3: DESDE (Valor) & A (Valor) */}
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

            {/* Row 4: Hasta (Fecha) & UNIDAD DE MEDIDA */}
            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                Hasta (Fecha):
              </td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <DatePicker
                  date={meta.hastaFecha && isValid(parseISO(meta.hastaFecha)) ? parseISO(meta.hastaFecha) : undefined}
                  setDate={(date) => updateField("hastaFecha", date ? format(date, "yyyy-MM-dd") : "")}
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

            {/* Row 5: BENCHMARK & MEJORA */}
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

            {/* Row 6: RESPONSABLE & FACILITADOR/LÍDER */}
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

export function PdcaParticipants({
  value,
  onChange,
  readOnly = false,
}: {
  value: import("@/data/pdca").ParticipantesData;
  onChange?: (val: import("@/data/pdca").ParticipantesData) => void;
  readOnly?: boolean;
}) {
  const updateField = (field: keyof import("@/data/pdca").ParticipantesData, newValue: string) => {
    if (onChange && !readOnly) {
      onChange({ ...value, [field]: newValue });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2">
          Participantes del Proyecto
        </h3>
      </div>
      <div className="overflow-x-auto rounded-sm border border-[#174373]">
        <table className="w-full border-collapse text-xs text-center">
          <thead>
            <tr className="bg-[#174373] text-white">
              <th colSpan={4} className="p-1.5 font-bold uppercase tracking-widest text-[11px] border border-[#174373]">
                PARTICIPANTES
              </th>
            </tr>
          </thead>
          <tbody>
            {/* PARTICIPANTES LOCALES */}
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 w-[20%] border border-white/20 align-middle">
                PARTICIPANTES LOCALES
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 w-[30%] border border-[#174373]/20">
                <TextareaAutosize
                  value={value.localesNombres}
                  onChange={(e) => updateField("localesNombres", e.target.value)}
                  disabled={readOnly}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder="Ej. Axel Guillén Ramírez"
                />
              </td>
              <td className="bg-[#174373] text-white p-3 w-[20%] text-[10px] leading-tight text-left border border-white/20">
                <strong className="block mb-1">PAPEL/RESPONSABILIDAD EN ESTE EQUIPO:</strong>
                <span className="text-white/80">(No el título del trabajo de la persona... ¿cuál es su rol en el equipo? Ejemplos... facilitador, analista de datos/experto en Excel, experto en la materia, perspectiva de primera línea, ojos externos, etc.)</span>
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 w-[30%] border border-[#174373]/20">
                <TextareaAutosize
                  value={value.localesRoles}
                  onChange={(e) => updateField("localesRoles", e.target.value)}
                  disabled={readOnly}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder="Ej. GERENTE DE ELABORACIÓN"
                />
              </td>
            </tr>

            {/* RECURSOS EXTERNOS */}
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 border border-white/20 align-middle">
                RECURSOS EXTERNOS
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <TextareaAutosize
                  value={value.externosNombres}
                  onChange={(e) => updateField("externosNombres", e.target.value)}
                  disabled={readOnly}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder="Ej. Manuel Pérez"
                />
              </td>
              <td className="bg-[#174373] text-white p-3 text-[10px] leading-tight text-left border border-white/20">
                <strong className="block mb-1">PAPEL/RESPONSABILIDAD EN ESTE EQUIPO:</strong>
                <span className="text-white/80">(No el título del trabajo de la persona... ¿cuál es su papel en el equipo? Ejemplos... Consultor, Fabricante Equipo Original, experto técnico para el tema xx, entrenador del método PDCA, etc)</span>
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <TextareaAutosize
                  value={value.externosRoles}
                  onChange={(e) => updateField("externosRoles", e.target.value)}
                  disabled={readOnly}
                  className="min-h-[100px] w-full resize-none border-none shadow-none bg-transparent font-medium text-xs text-center focus-visible:ring-1 focus-visible:ring-black/20 p-2"
                  placeholder="Ej. REGIONAL"
                />
              </td>
            </tr>

            {/* FECHAS REUNIONES */}
            <tr>
              <td className="bg-[#174373] text-white font-bold p-2 text-[10px] border border-white/20 text-right pr-4 align-middle">
                Fecha de la reunión inicial:
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-2 border border-[#174373]/20">
                <DatePicker
                  date={value.fechaReunionInicial && isValid(parseISO(value.fechaReunionInicial)) ? parseISO(value.fechaReunionInicial) : undefined}
                  setDate={(date) => updateField("fechaReunionInicial", date ? format(date, "yyyy-MM-dd") : "")}
                  placeholder="Seleccionar"
                  disabled={readOnly}
                  className="h-8 w-full text-xs font-bold justify-center shadow-none focus-visible:ring-1 focus-visible:ring-black/20 bg-transparent border-black/10 hover:bg-transparent"
                />
              </td>
              <td className="bg-[#174373] text-white font-bold p-2 text-[10px] border border-white/20 text-right pr-4 align-middle">
                Reunión de revisión de rutina:
              </td>
              <td className="bg-[#F2F8FC] dark:bg-secondary p-0 border border-[#174373]/20">
                <Input
                  value={value.reunionRutina}
                  onChange={(e) => updateField("reunionRutina", e.target.value)}
                  disabled={readOnly}
                  className="h-9 w-full text-xs font-bold text-center border-none shadow-none bg-transparent focus-visible:ring-1 focus-visible:ring-black/20"
                  placeholder="Ej. Semanal Miércoles 14:00 Hrs"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
