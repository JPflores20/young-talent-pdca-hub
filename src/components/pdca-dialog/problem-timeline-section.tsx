import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AutoResizeTextarea } from "./auto-resize-textarea";

interface ProblemTimelineSectionProps {
  timelineOption: "A" | "B";
  onOptionChange: (val: "A" | "B") => void;
  timelineFilter: "day" | "week" | "month" | "3months";
  onFilterChange: (val: "day" | "week" | "month" | "3months") => void;
  events: { id: string; time: string; description: string }[];
  onEventsChange: (events: { id: string; time: string; description: string }[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

export const ProblemTimelineSection: React.FC<ProblemTimelineSectionProps> = ({
  timelineOption,
  onOptionChange,
  timelineFilter,
  onFilterChange,
  events,
  onEventsChange,
  isStepCompleted,
  onToggleStep,
}) => {
  const handleAddEvent = () => {
    onEventsChange([...events, { id: crypto.randomUUID(), time: "", description: "" }]);
  };

  const handleUpdateEvent = (id: string, field: "time" | "description", value: string) => {
    onEventsChange(events.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const handleRemoveEvent = (id: string) => {
    onEventsChange(events.filter((e) => e.id !== id));
  };

  return (
    <Card className={cn("mt-6", isStepCompleted && "border-green-500 bg-green-50/10")}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          Línea de tiempo del problema
          {isStepCompleted && <CheckCircle2 className="size-5 text-green-500" />}
        </CardTitle>
        {onToggleStep && (
          <Button
            variant={isStepCompleted ? "outline" : "default"}
            size="sm"
            onClick={onToggleStep}
            className={
              isStepCompleted
                ? "text-green-600 border-green-200 hover:bg-green-50"
                : "bg-blue-600 hover:bg-blue-700"
            }
          >
            {isStepCompleted ? "Completado" : "Marcar como Completado"}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex-1 space-y-3">
            <Label className="text-sm font-semibold">Opción de Visualización</Label>
            <RadioGroup
              value={timelineOption}
              onValueChange={(val) => onOptionChange(val as "A" | "B")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="A" id="option-a" />
                <Label htmlFor="option-a">Opción A (Flujo visual)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="B" id="option-b" />
                <Label htmlFor="option-b">Opción B (Tabla)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex-1 space-y-3">
            <Label className="text-sm font-semibold">Filtro Temporal</Label>
            <Select value={timelineFilter} onValueChange={onFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar filtro..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Por día</SelectItem>
                <SelectItem value="week">Por semana</SelectItem>
                <SelectItem value="month">Por mes</SelectItem>
                <SelectItem value="3months">Por 3 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {timelineOption === "A" ? (
          <div className="border rounded-lg p-6 bg-white overflow-x-auto">
            <div style={{ minWidth: Math.max(600, events.length * 160) + "px" }}>
              <div className="relative">
                {/* Central Axis Background */}
                <div
                  className="absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2 bg-slate-800 z-0 flex items-center px-8"
                  style={{ clipPath: "polygon(0% 0%, 95% 0%, 100% 50%, 95% 100%, 0% 100%)" }}
                >
                  {events.length === 0 && (
                    <span className="text-sm text-slate-400 w-full text-center">
                      Agrega eventos para ver la línea de tiempo
                    </span>
                  )}
                </div>

                {/* Events Grid */}
                <div className="flex justify-between relative z-10 min-h-[400px]">
                  {events.map((event, index) => {
                    const isTop = index % 2 === 0;
                    const sideIndex = Math.floor(index / 2);
                    const isFar = sideIndex % 2 === 0;
                    const lineClass = isFar ? "h-24" : "h-6";

                    return (
                      <div
                        key={event.id}
                        className="relative flex-1 flex justify-center w-32 group"
                      >
                        {/* Timeline Date/Time Input */}
                        <div className="absolute top-1/2 -translate-y-1/2 w-24 h-8 flex items-center justify-center z-20">
                          <input
                            value={event.time}
                            onChange={(ev) => handleUpdateEvent(event.id, "time", ev.target.value)}
                            placeholder="..."
                            className="text-sm w-full text-center bg-transparent border-none outline-none focus:ring-1 focus:ring-white placeholder:text-gray-400 text-white"
                          />
                        </div>
                        {isTop ? (
                          <div className="absolute bottom-[calc(50%+16px)] flex flex-col items-center justify-end">
                            <AutoResizeTextarea
                              value={event.description}
                              onChange={(val) => handleUpdateEvent(event.id, "description", val)}
                              placeholder="Descripción..."
                              className="bg-blue-300 w-32 min-h-[4rem] p-2 rounded-sm border border-blue-400 text-xs shadow-sm text-center resize-none outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-blue-600/70 text-gray-900 leading-tight block"
                            />
                            <div className={`w-px bg-blue-400 relative ${lineClass}`}>
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-2 h-2 border-t-2 border-r-2 border-blue-400 rotate-[135deg]" />
                            </div>
                          </div>
                        ) : (
                          <div className="absolute top-[calc(50%+16px)] flex flex-col items-center justify-start">
                            <div className={`w-px bg-blue-400 relative ${lineClass}`}>
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full w-2 h-2 border-b-2 border-l-2 border-blue-400 rotate-[135deg]" />
                            </div>
                            <AutoResizeTextarea
                              value={event.description}
                              onChange={(val) => handleUpdateEvent(event.id, "description", val)}
                              placeholder="Descripción..."
                              className="bg-blue-300 w-32 min-h-[4rem] p-2 rounded-sm border border-blue-400 text-xs shadow-sm text-center resize-none outline-none focus:ring-2 focus:ring-blue-600 placeholder:text-blue-600/70 text-gray-900 leading-tight block"
                            />
                          </div>
                        )}
                        {/* Remove button visible on hover */}
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-20 w-6 h-6 -right-4 top-1/2 -translate-y-1/2"
                          onClick={() => handleRemoveEvent(event.id)}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#0070C0] text-white">
                <tr>
                  <th className="px-4 py-3 w-1/4 font-semibold border-r border-blue-600">
                    Periodo ({timelineFilter})
                  </th>
                  <th className="px-4 py-3 font-semibold border-r border-blue-600">
                    Descripción / Evento
                  </th>
                  <th className="px-4 py-3 w-16 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => (
                  <tr key={event.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border-r">
                      <Input
                        value={event.time}
                        onChange={(e) => handleUpdateEvent(event.id, "time", e.target.value)}
                        placeholder={`Ej: ${timelineFilter === "day" ? "Lun" : "Semana 1"}...`}
                        className="border-none shadow-none focus-visible:ring-1 h-8"
                      />
                    </td>
                    <td className="px-4 py-2 border-r">
                      <AutoResizeTextarea
                        value={event.description}
                        onChange={(val) => handleUpdateEvent(event.id, "description", val)}
                        placeholder="Descripción del evento..."
                        className="border-none shadow-none focus-visible:ring-1 min-h-[32px] pt-1.5"
                      />
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEvent(event.id)}
                      >
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                      No hay eventos en la línea de tiempo.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <Button onClick={handleAddEvent} variant="outline" className="gap-2">
            <Plus className="size-4" /> Agregar Evento
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
