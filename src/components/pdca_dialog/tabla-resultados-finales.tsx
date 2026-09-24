import React from "react";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResultadosFinalesData } from "@/data/pdca-types";

interface TablaResultadosFinalesProps {
  data: ResultadosFinalesData;
  onChange: (data: ResultadosFinalesData) => void;
}

export const TablaResultadosFinales: React.FC<TablaResultadosFinalesProps> = ({ data, onChange }) => {
  const updateData = (updates: Partial<ResultadosFinalesData>) => {
    onChange({ ...data, ...updates });
  };

  const updateKpi = (field: keyof NonNullable<ResultadosFinalesData["kpi"]>, value: string) => {
    const newKpi = { ...(data.kpi || { de: "", a: "", verdeEs: "", mejoraPct: "" }), [field]: value };
    updateData({ kpi: newKpi });
  };

  const addPiRow = () => {
    const newRows = [...(data.piRows || []), { id: crypto.randomUUID(), pi: "", de: "", a: "", verdeEs: "", mejoraPct: "" }];
    updateData({ piRows: newRows });
  };

  const updatePiRow = (id: string, field: string, value: string) => {
    const newRows = (data.piRows || []).map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    updateData({ piRows: newRows });
  };

  const removePiRow = (id: string) => {
    updateData({ piRows: (data.piRows || []).filter((r) => r.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Left Side: KPI Info */}
        <div className="border border-[#cc0000] rounded-sm overflow-hidden">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="bg-[#cc0000] text-white font-bold p-2 w-[40%] border-r border-[#cc0000]">Fecha de finalización:</td>
                <td className="p-0 border-b border-[#cc0000]">
                  <Input
                    type="date"
                    value={data.fechaFinalizacion || ""}
                    onChange={(e) => updateData({ fechaFinalizacion: e.target.value })}
                    className="border-0 shadow-none h-8 w-full rounded-none"
                  />
                </td>
                <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">KPI</td>
                <td className="border-b border-[#cc0000] p-0 w-[25%] bg-white"></td>
              </tr>
              <tr>
                <td rowSpan={2} className="bg-[#cc0000] text-white font-bold p-2 text-center border-r border-[#cc0000] border-b">
                  ¿Este PDCA/ITF mejoró los PI?
                </td>
                <td rowSpan={2} className="p-0 border-b border-[#cc0000]">
                  <Select
                    value={data.mejoroPI || "-"}
                    onValueChange={(v) => updateData({ mejoroPI: v === "-" ? "" : v })}
                  >
                    <SelectTrigger
                      className={`w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full ${data.mejoroPI === 'Sí' ? 'text-green-700 font-bold' : data.mejoroPI === 'No' ? 'text-red-700 font-bold' : 'text-slate-900 font-medium'}`}
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Sí" className="text-green-700 font-bold">Sí</SelectItem>
                      <SelectItem value="No" className="text-red-700 font-bold">No</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">De:</td>
                <td className="p-0 border-b border-[#cc0000]">
                  <Input
                    value={data.kpi?.de || ""}
                    onChange={(e) => updateKpi("de", e.target.value)}
                    className="border-0 shadow-none h-full min-h-[30px] rounded-none text-center"
                  />
                </td>
              </tr>
              <tr>
                <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">A:</td>
                <td className="p-0 border-b border-[#cc0000]">
                  <Input
                    value={data.kpi?.a || ""}
                    onChange={(e) => updateKpi("a", e.target.value)}
                    className="border-0 shadow-none h-full min-h-[30px] rounded-none text-center"
                  />
                </td>
              </tr>
              <tr>
                <td rowSpan={2} className="bg-[#cc0000] text-white font-bold p-2 text-center border-r border-[#cc0000]">
                  ¿Este PDCA/ITF mejoró los KPI(s)?
                </td>
                <td rowSpan={2} className="p-0">
                  <Select
                    value={data.mejoroKPI || "-"}
                    onValueChange={(v) => updateData({ mejoroKPI: v === "-" ? "" : v })}
                  >
                    <SelectTrigger
                      className={`w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full ${data.mejoroKPI === 'Sí' ? 'text-green-700 font-bold' : data.mejoroKPI === 'No' ? 'text-red-700 font-bold' : 'text-slate-900 font-medium'}`}
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Sí" className="text-green-700 font-bold">Sí</SelectItem>
                      <SelectItem value="No" className="text-red-700 font-bold">No</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-b border-[#cc0000] text-center">Verde es:</td>
                <td className="p-0 border-b border-[#cc0000]">
                  <Select
                    value={data.kpi?.verdeEs || "-"}
                    onValueChange={(v) => updateKpi("verdeEs", v === "-" ? "" : v)}
                  >
                    <SelectTrigger
                      className="w-full h-full min-h-[30px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center text-slate-900 font-medium focus:ring-0 [&>span]:text-center [&>span]:w-full"
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Más alto">Más alto</SelectItem>
                      <SelectItem value="Lower">Más bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
              </tr>
              <tr>
                <td className="bg-[#cc0000] text-white font-bold p-2 border-l border-[#cc0000] text-center">% de Mejora</td>
                <td className="p-0 bg-green-500/20">
                  <Input
                    value={data.kpi?.mejoraPct || ""}
                    onChange={(e) => updateKpi("mejoraPct", e.target.value)}
                    className="border-0 shadow-none h-full min-h-[30px] rounded-none text-center bg-transparent font-bold text-green-700"
                    placeholder="%"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right Side: PI Info */}
        <div className="border border-[#cc0000] rounded-sm overflow-hidden flex flex-col h-full relative">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#cc0000] text-white">
                <tr>
                  <th className="font-bold p-2 border-r border-white/20 text-center">PI</th>
                  <th className="font-bold p-2 border-r border-white/20 text-center">De:</th>
                  <th className="font-bold p-2 border-r border-white/20 text-center">A:</th>
                  <th className="font-bold p-2 border-r border-white/20 text-center">Verde es:</th>
                  <th className="font-bold p-2 text-center">% de Mejora</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {(data.piRows || []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center p-4 text-muted-foreground border-b border-[#cc0000]">
                      No hay PIs registrados.
                    </td>
                  </tr>
                )}
                {(data.piRows || []).map((row, idx) => (
                  <tr key={row.id} className="border-b border-[#cc0000]">
                    <td className="p-0 border-r border-[#cc0000]">
                      <Input
                        value={row.pi}
                        onChange={(e) => updatePiRow(row.id, "pi", e.target.value)}
                        className="border-0 shadow-none h-8 rounded-none text-center"
                      />
                    </td>
                    <td className="p-0 border-r border-[#cc0000]">
                      <Input
                        value={row.de}
                        onChange={(e) => updatePiRow(row.id, "de", e.target.value)}
                        className="border-0 shadow-none h-8 rounded-none text-center"
                      />
                    </td>
                    <td className="p-0 border-r border-[#cc0000]">
                      <Input
                        value={row.a}
                        onChange={(e) => updatePiRow(row.id, "a", e.target.value)}
                        className="border-0 shadow-none h-8 rounded-none text-center"
                      />
                    </td>
                    <td className="p-0 border-r border-[#cc0000]">
                      <Select
                        value={row.verdeEs || "-"}
                        onValueChange={(v) => updatePiRow(row.id, "verdeEs", v === "-" ? "" : v)}
                      >
                        <SelectTrigger
                          className="w-full h-8 rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center text-slate-900 font-medium focus:ring-0 [&>span]:text-center [&>span]:w-full"
                        >
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">-</SelectItem>
                          <SelectItem value="Más alto">Más alto</SelectItem>
                          <SelectItem value="Lower">Más bajo</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-0 bg-green-500/10">
                      <Input
                        value={row.mejoraPct}
                        onChange={(e) => updatePiRow(row.id, "mejoraPct", e.target.value)}
                        className="border-0 shadow-none h-8 rounded-none text-center bg-transparent font-bold text-green-700"
                        placeholder="%"
                      />
                    </td>
                    <td className="p-0 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePiRow(row.id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={addPiRow}
            className="w-full rounded-none h-8 text-xs text-[#cc0000] hover:bg-[#cc0000]/10"
          >
            <Plus className="size-3 mr-2" /> Agregar PI
          </Button>
        </div>
      </div>
    </div>
  );
};
