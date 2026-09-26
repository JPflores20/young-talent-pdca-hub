import React from "react";
import {
  ConclusionesKpiData,
  ConclusionesPiItem,
} from "@/data/pdca";
import { StepCard } from "@/components/ui/step-card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Info } from "lucide-react";

export interface ConclusionesStepProps {
  isStepCompleted: boolean;
  onToggleStep: () => void;
  isNa?: boolean;
  onToggleNa?: () => void;
  isEditable: boolean;
  kpiData: ConclusionesKpiData | undefined;
  onKpiDataChange: (data: ConclusionesKpiData) => void;
  piItems: ConclusionesPiItem[];
  onPiItemsChange: (items: ConclusionesPiItem[]) => void;
  storyboardHtml?: string;
  onStoryboardHtmlChange?: (html: string) => void;
  storyboardImage?: string;
  onStoryboardImageChange?: (img?: string) => void;
}

export const ConclusionesStep: React.FC<ConclusionesStepProps> = ({
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
  isEditable,
  kpiData,
  onKpiDataChange,
  piItems,
  onPiItemsChange,
  storyboardHtml,
  onStoryboardHtmlChange,
  storyboardImage,
  onStoryboardImageChange,
}) => {
  const data = kpiData || {
    fechaFinalizacion: "",
    mejoroPi: "",
    mejoroKpi: "",
    kpiName: "",
    kpiDe: "",
    kpiA: "",
    kpiVerdeEs: "Más alto",
    kpiMejora: "",
  };

  const handleKpiChange = (field: keyof ConclusionesKpiData, value: string) => {
    onKpiDataChange({ ...data, [field]: value });
  };

  const handleAddPi = () => {
    const newItem: ConclusionesPiItem = {
      id: crypto.randomUUID(),
      piName: "",
      piDe: "",
      piA: "",
      piVerdeEs: "Más alto",
      piMejora: "",
    };
    onPiItemsChange([...(piItems || []), newItem]);
  };

  const handleUpdatePi = (id: string, field: keyof ConclusionesPiItem, value: string) => {
    onPiItemsChange(
      (piItems || []).map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeletePi = (id: string) => {
    onPiItemsChange((piItems || []).filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title="PASO 30: CONCLUSIONES"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="p-4 space-y-6">
        <Accordion type="single" collapsible className="w-full bg-[#f8f9fa] rounded-md border">
          <AccordionItem value="instructions" className="border-b-0">
            <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-[#e9ecef] transition-colors">
              <div className="flex items-center gap-2 text-[#6c757d]">
                <div className="h-5 w-5 rounded-full bg-[#e2e3e5] flex items-center justify-center text-xs font-bold text-[#6c757d]">
                  i
                </div>
                <span className="font-bold text-sm">Instrucciones</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="font-bold">Instrucciones</p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Llene la fecha de finalización</li>
                <li>Llene la información general del KPI incluyendo el valor inicial del KPI, el valor final del KPI. Si un aumento del valor equivale a una mejora del KPI, seleccione "Más alto". De lo contrario, seleccione "Más bajo".</li>
                <li>Si su PDCA tenía un enfoque más limitado en un PI específico, entonces llene la información del PI para mostrar el PI antes y después del PDCA.</li>
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-4">
          <div className="border rounded-md overflow-hidden bg-white shadow-sm">
            <Table className="text-xs">
              <TableBody>
                <TableRow>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center w-1/3">
                    Fecha de finalización:
                  </TableCell>
                  <TableCell className="p-0 border-r border-border w-1/3">
                    <DatePicker
                      date={data.fechaFinalizacion ? new Date(data.fechaFinalizacion + "T12:00:00") : undefined}
                      setDate={(d) => handleKpiChange("fechaFinalizacion", d ? format(d, "yyyy-MM-dd") : "")}
                      className="h-10 text-xs shadow-none border-0 rounded-none w-full bg-transparent border-transparent hover:bg-transparent"
                    />
                  </TableCell>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center w-1/6">
                    KPI
                  </TableCell>
                  <TableCell className="p-0 w-1/6">
                    <Input
                      value={data.kpiName}
                      onChange={(e) => handleKpiChange("kpiName", e.target.value)}
                      className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
                    ¿Este PDCA/ITF mejoró los PI?
                  </TableCell>
                  <TableCell className="p-0 border-r border-border">
                    <textarea
                      value={data.mejoroPi}
                      onChange={(e) => handleKpiChange("mejoroPi", e.target.value)}
                      className="w-full h-full min-h-[60px] resize-none text-xs p-2 focus-visible:outline-none border-0"
                    />
                  </TableCell>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
                    De:
                  </TableCell>
                  <TableCell className="p-0">
                    <Input
                      value={data.kpiDe}
                      onChange={(e) => handleKpiChange("kpiDe", e.target.value)}
                      className="h-full text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell rowSpan={3} className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center">
                    ¿Este PDCA/ITF mejoró los KPI(s)?
                  </TableCell>
                  <TableCell rowSpan={3} className="p-0 border-r border-border">
                    <textarea
                      value={data.mejoroKpi}
                      onChange={(e) => handleKpiChange("mejoroKpi", e.target.value)}
                      className="w-full h-full min-h-[100px] resize-none text-xs p-2 focus-visible:outline-none border-0"
                    />
                  </TableCell>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
                    A:
                  </TableCell>
                  <TableCell className="p-0">
                    <Input
                      value={data.kpiA}
                      onChange={(e) => handleKpiChange("kpiA", e.target.value)}
                      className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
                    Verde es:
                  </TableCell>
                  <TableCell className="p-0">
                    <Select
                      value={data.kpiVerdeEs || "Más alto"}
                      onValueChange={(v) => handleKpiChange("kpiVerdeEs", v)}
                    >
                      <SelectTrigger className="h-10 text-xs border-0 rounded-none shadow-none focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Más alto">Más alto</SelectItem>
                        <SelectItem value="Más bajo">Más bajo</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="bg-[#0078D7] text-white font-bold border-r border-white/20 p-2 text-center h-10">
                    % de Mejora
                  </TableCell>
                  <TableCell className="p-0 bg-[#00B050]">
                    <Input
                      value={data.kpiMejora}
                      onChange={(e) => handleKpiChange("kpiMejora", e.target.value)}
                      className="h-10 text-xs font-bold text-white shadow-none border-0 rounded-none text-center focus-visible:ring-0 bg-transparent placeholder:text-white/70"
                      placeholder="%"
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="space-y-2">
            <div className="flex justify-end">
              <Button onClick={handleAddPi} variant="outline" size="sm" className="h-8">
                <Plus className="size-4 mr-2" /> Agregar PI
              </Button>
            </div>
            <div className="border rounded-md overflow-hidden bg-white shadow-sm">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                    <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">PI</TableHead>
                    <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">De:</TableHead>
                    <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">A:</TableHead>
                    <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">Verde es:</TableHead>
                    <TableHead className="font-bold text-white text-center h-10">% de Mejora</TableHead>
                    <TableHead className="w-8 h-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!piItems || piItems.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No hay PI agregados.
                      </TableCell>
                    </TableRow>
                  )}
                  {piItems?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-0 border-r border-border">
                        <Input
                          value={item.piName}
                          onChange={(e) => handleUpdatePi(item.id, "piName", e.target.value)}
                          className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-0 border-r border-border">
                        <Input
                          value={item.piDe}
                          onChange={(e) => handleUpdatePi(item.id, "piDe", e.target.value)}
                          className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-0 border-r border-border">
                        <Input
                          value={item.piA}
                          onChange={(e) => handleUpdatePi(item.id, "piA", e.target.value)}
                          className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-0 border-r border-border">
                        <Select
                          value={item.piVerdeEs || "Más alto"}
                          onValueChange={(v) => handleUpdatePi(item.id, "piVerdeEs", v)}
                        >
                          <SelectTrigger className="h-10 text-xs border-0 rounded-none shadow-none focus:ring-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Más alto">Más alto</SelectItem>
                            <SelectItem value="Más bajo">Más bajo</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-0 bg-[#00B050]">
                        <Input
                          value={item.piMejora}
                          onChange={(e) => handleUpdatePi(item.id, "piMejora", e.target.value)}
                          className="h-10 text-xs font-bold text-white shadow-none border-0 rounded-none text-center focus-visible:ring-0 bg-transparent placeholder:text-white/70"
                          placeholder="%"
                        />
                      </TableCell>
                      <TableCell className="p-0 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeletePi(item.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t">
          <p className="text-sm font-bold text-center mb-4">
            Para la conclusión - Crear el Storyboard de PDCA (insertar texto, capturas de pantalla, etc. para el resumen)
          </p>
          <RichTextEditor
            value={storyboardHtml || ""}
            onChange={onStoryboardHtmlChange || (() => {})}
            disabled={!isEditable}
            placeholder="Pega el texto del Storyboard de PDCA aquí..."
            minHeight="200px"
          />
          <div className="mt-4">
            <p className="text-xs font-bold mb-2">Subir imagen del Storyboard (opcional)</p>
            {storyboardImage ? (
              <div className="relative border rounded-md overflow-hidden bg-black/5 group">
                <img src={storyboardImage} alt="Storyboard" className="w-full h-auto object-contain max-h-[500px]" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all h-8 w-8"
                  onClick={() => onStoryboardImageChange?.(undefined)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-md p-8 text-center bg-secondary/10 hover:bg-secondary/20 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="storyboard-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        onStoryboardImageChange?.(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label htmlFor="storyboard-upload" className="cursor-pointer flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Plus className="size-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Haz clic para subir imagen</span>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </StepCard>
  );
};