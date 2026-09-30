import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StepCard } from "@/components/ui/step-card";
import type { VpoCheckpointItem } from "@/data/pdca";
import { VpoCheckpointRow } from "./vpo-checkpoint-row";
import { VpoCheckpointProgress } from "./vpo-checkpoint-progress";

interface VpoCheckpointTableProps {
  checkpoints: VpoCheckpointItem[];
  onChange: (newCheckpoints: VpoCheckpointItem[]) => void;
  problemaTexto: string;
  completedSteps: Set<string>;
  naSteps?: Set<string> | undefined;
  onToggleStep: (stepId: string) => void;
  onToggleNa?: ((stepId: string) => void) | undefined;
}

export function VpoCheckpointTable({
  checkpoints,
  onChange,
  problemaTexto,
  completedSteps,
  naSteps,
  onToggleStep,
  onToggleNa,
}: VpoCheckpointTableProps) {
  const updateStatus = (id: string, newStatus: "YES" | "NO" | "N/A" | "") => {
    const updated = checkpoints.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item,
    );
    onChange(updated);
  };

  const updateEvidencia = (id: string, text: string) => {
    const updated = checkpoints.map((item) =>
      item.id === id ? { ...item, evidencia: text } : item,
    );
    onChange(updated);
  };

  const yesCount = checkpoints.filter((c) => c.status === "YES").length;
  const scorePct = checkpoints.length > 0 ? Math.round((yesCount / checkpoints.length) * 100) : 0;

  return (
    <StepCard
      title="PASO 2: PHASE SDCA CHECKLIST"
      isStepCompleted={completedSteps.has("step-2")}
      onToggleStep={() => onToggleStep("step-2")}
      isNa={naSteps?.has("step-2")}
      onToggleNa={() => onToggleNa?.("step-2")}
    >
      <VpoCheckpointProgress 
        scorePct={scorePct}
        yesCount={yesCount}
        totalCount={checkpoints.length}
        problemaTexto={problemaTexto}
      />

      {/* Tabla Oficial VPO Checkpoint */}
      <div className="overflow-hidden border border-border/80 rounded-xl shadow-md bg-card">
        <Table className="text-xs border-collapse">
          <TableHeader className="bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white">
            <TableRow className="border-b border-slate-800/80">
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-56 border-r border-slate-800/60">
                BLOQUE PILAR GESTIÓN
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 border-r border-slate-800/60">
                VPO TOOL CHECKPOINT
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-72 border-r border-slate-800/60">
                EVIDENCIAS / COMENTARIOS
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[11px] font-extrabold uppercase tracking-wider text-blue-200 w-44 text-center">
                ESTATUS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {checkpoints.map((item) => (
              <VpoCheckpointRow 
                key={item.id} 
                item={item} 
                updateStatus={updateStatus}
                updateEvidencia={updateEvidencia}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </StepCard>
  );
}
