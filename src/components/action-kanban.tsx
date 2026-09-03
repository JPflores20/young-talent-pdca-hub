import { useState } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/data/pdca";

const parseTaskDate = (whenStr?: string): Date | undefined => {
  if (!whenStr) return undefined;
  let d = new Date(`${whenStr}T12:00:00`);
  if (!isNaN(d.getTime())) return d;
  d = new Date(whenStr);
  if (!isNaN(d.getTime())) return d;
  return undefined;
};

// Sortable Item Component
function SortableTask({ 
  task, 
  onUpdate, 
  onRemove 
}: { 
  task: ActionItem; 
  onUpdate: (id: string, field: keyof ActionItem, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition-colors"
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex-1 space-y-2">
          <Input
            value={task.what}
            onChange={(e) => onUpdate(task.id, "what", e.target.value)}
            placeholder="¿Qué hacer?"
            className="h-7 text-sm font-medium shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background"
          />
          <div className="flex items-center gap-2">
            <Input
              value={task.who}
              onChange={(e) => onUpdate(task.id, "who", e.target.value)}
              placeholder="¿Quién?"
              className="h-6 w-1/2 text-xs shadow-none px-2"
            />
            <div className="w-1/2">
              <DatePicker
                date={parseTaskDate(task.when)}
                setDate={(date) => {
                  if (date && !isNaN(date.getTime())) {
                    const formatted = date.toISOString().split("T")[0];
                    if (formatted) onUpdate(task.id, "when", formatted);
                  } else {
                    onUpdate(task.id, "when", "");
                  }
                }}
                className="h-6 w-full text-xs shadow-none px-2"
                placeholder="¿Cuándo?"
              />
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onRemove(task.id)}
          className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

const columns = [
  { id: "Pendiente", title: "Por Hacer", color: "border-destructive/30 bg-destructive/5 text-destructive" },
  { id: "En progreso", title: "En Progreso", color: "border-amber-500/30 bg-amber-500/5 text-amber-600" },
  { id: "Completada", title: "Completado", color: "border-emerald-500/30 bg-emerald-500/5 text-emerald-600" },
] as const;

export function ActionKanban({
  acciones,
  setAcciones
}: {
  acciones: ActionItem[];
  setAcciones: (updater: (prev: ActionItem[]) => ActionItem[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find the task and the column it was dropped in
    const activeTask = acciones.find(t => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping on a column directly or another task
    const isOverColumn = columns.some(c => c.id === overId);
    let targetStatus = activeTask.status;

    if (isOverColumn) {
      targetStatus = overId as any;
    } else {
      const overTask = acciones.find(t => t.id === overId);
      if (overTask) {
        targetStatus = overTask.status;
      }
    }

    if (activeTask.status !== targetStatus) {
      // Moved to different column
      setAcciones(prev => prev.map(t => 
        t.id === activeId 
          ? { ...t, status: targetStatus, done: targetStatus === "Completada" } 
          : t
      ));
    } else if (activeId !== overId && !isOverColumn) {
      // Reordered within same column
      setAcciones(prev => {
        const oldIndex = prev.findIndex(t => t.id === activeId);
        const newIndex = prev.findIndex(t => t.id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const addAction = (status: ActionItem["status"]) => {
    setAcciones(prev => [...prev, {
      id: `A-${Date.now()}`,
      what: "",
      who: "",
      when: "",
      status,
      done: status === "Completada"
    }]);
  };

  const updateAction = (id: string, field: keyof ActionItem, value: string) => {
    setAcciones(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  const removeAction = (id: string) => {
    setAcciones(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Tablero Kanban
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Arrastra las tarjetas para cambiar su estatus.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => addAction("Pendiente")}>
          <Plus className="size-4 mr-2" /> Agregar Acción
        </Button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {columns.map(col => {
            const columnTasks = acciones.filter(a => a.status === col.id);
            return (
              <div key={col.id} className="flex flex-col gap-3">
                <div className={cn("rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-center", col.color)}>
                  {col.title} ({columnTasks.length})
                </div>
                
                {/* Column Drop Zone (simulated by having a SortableContext) */}
                <SortableContext 
                  id={col.id}
                  items={columnTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 min-h-[150px] bg-secondary/20 rounded-lg p-2 flex flex-col gap-2">
                    {columnTasks.map(task => (
                      <SortableTask 
                        key={task.id} 
                        task={task} 
                        onUpdate={updateAction}
                        onRemove={removeAction}
                      />
                    ))}
                    <button 
                      onClick={() => addAction(col.id as any)}
                      className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-colors"
                    >
                      <Plus className="size-3" /> Agregar
                    </button>
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
