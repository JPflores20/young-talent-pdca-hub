import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import type { FiveWhysTableData } from "@/data/pdca";
import { FiveWhysInteractive } from "./five-whys-interactive";

export function FiveWhysSection({
  tables,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}: {
  tables: FiveWhysTableData[];
  onChange: (tables: FiveWhysTableData[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}) {
  const addTable = () => {
    const newId = `fivewhys-${Date.now()}`;
    onChange([
      ...tables,
      {
        id: newId,
        title: "MÉTODO",
        rows: [
          {
            id: Date.now(),
            q1: "",
            q2: "",
            q3: "",
            q4: "",
            q5: "",
            w1: "",
            w2: "",
            w3: "",
            w4: "",
            w5: "",
            accion: "",
          },
        ],
      },
    ]);
  };

  const updateTable = (id: string, newRows: any[]) => {
    onChange(tables.map((t) => (t.id === id ? { ...t, rows: newRows } : t)));
  };

  const updateTitle = (id: string, newTitle: string) => {
    onChange(tables.map((t) => (t.id === id ? { ...t, title: newTitle } : t)));
  };

  const removeTable = (id: string) => {
    if (tables.length === 1) return;
    onChange(tables.filter((t) => t.id !== id));
  };

  return (
    <StepCard
      className="overflow-hidden"
      title="PASO 15: 5 WHY'S"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-8">
        {tables.map((table, index) => (
          <div key={table.id} className="pt-4">
            <FiveWhysInteractive
              value={table.rows}
              onChange={(rows) => updateTable(table.id, rows)}
              title={table.title}
              onTitleChange={(title) => updateTitle(table.id, title)}
              index={index}
              onRemoveTable={tables.length > 1 ? () => removeTable(table.id) : undefined}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4 border-t border-border mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={addTable}
          className="border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <Plus className="size-4 mr-2" /> Agregar otra tabla 5 Whys
        </Button>
      </div>
    </StepCard>
  );
}
