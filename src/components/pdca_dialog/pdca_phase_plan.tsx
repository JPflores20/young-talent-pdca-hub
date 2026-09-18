import React, { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { PdcaGoalDefinition, PdcaParticipants } from "@/components/pdca-goal-definition";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../pdca-dialog/step-instructions";
import { TeamMembersInput } from "../pdca-dialog/team-members-input";
import { VpoCheckpointTable } from "../pdca-dialog/vpo-checkpoint-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DefinicionMeta, ParticipantesData, VpoCheckpointItem } from "@/data/pdca";

// ─── Áreas disponibles ────────────────────────────────────────────────────────
const AREAS = [
  { value: "cocimientos", label: "Cocimientos" },
  { value: "fermentacion", label: "Fermentación" },
  { value: "filtracion", label: "Filtración" },
  { value: "envasado", label: "Envasado" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "logistica", label: "Logística" },
  { value: "calidad", label: "Calidad" },
];

// ─── Editor de texto enriquecido mínimo ──────────────────────────────────────
function RichTextEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Sync external changes (e.g. when loading from database)
  React.useEffect(() => {
    if (!editorRef.current) return;

    if (!isMounted.current) {
      editorRef.current.innerHTML = value || "";
      isMounted.current = true;
      return;
    }

    if (value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCmd = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("bold");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("italic");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertUnorderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertOrderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>
      </div>
      {/* Área editable */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[120px] p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder="Describe el problema observado..."
      />
    </div>
  );
}

// ─── Props del componente ─────────────────────────────────────────────────────
interface PhasePlanProps {
  // Meta fields
  title_value: string;
  on_title_change: (v: string) => void;
  area_value: string;
  on_area_change: (v: string) => void;
  deadline_date?: Date;
  on_deadline_change: (d?: Date) => void;
  author_name: string;
  author_email: string;
  on_author_change: (email: string, name: string) => void;
  assigned_users: { name: string; email: string }[];
  on_toggle_assigned_user: (u: { name: string; email: string }) => void;
  available_users: { name: string; email: string }[];
  is_admin_user: boolean;
  // Equipo / integrantes
  team_members_list: string[];
  on_team_members_change: (members: string[]) => void;
  // Descripción del problema
  problem_description: string;
  on_problem_change: (v: string) => void;
  // Definición de la meta
  goal_definition: DefinicionMeta;
  on_goal_definition_change: (data: DefinicionMeta) => void;
  participants_info: ParticipantesData;
  on_participants_info_change: (data: ParticipantesData) => void;
  // VPO
  vpo_checkpoints: VpoCheckpointItem[];
  on_vpo_checkpoints_change: (checkpoints: VpoCheckpointItem[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
  is_editable: boolean;
}

// ─── Componente principal ─────────────────────────────────────────────────────
export const PdcaPhasePlan: React.FC<PhasePlanProps> = ({
  title_value,
  on_title_change,
  area_value,
  on_area_change,
  deadline_date,
  on_deadline_change,
  author_name,
  author_email,
  on_author_change,
  assigned_users,
  on_toggle_assigned_user,
  available_users,
  is_admin_user,
  team_members_list,
  on_team_members_change,
  problem_description,
  on_problem_change,
  goal_definition,
  on_goal_definition_change,
  participants_info,
  on_participants_info_change,
  vpo_checkpoints,
  on_vpo_checkpoints_change,
  completed_steps,
  on_toggle_step,
  is_editable,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 1: PROBLEM STATEMENT ─────────────────────────────────── */}
      <StepCard
        title="PASO 1: PROBLEM STATEMENT"
        isStepCompleted={completed_steps.has("step-1")}
        onToggleStep={() => on_toggle_step("step-1")}
      >
        <StepInstructions>
          <p>
            Define el alcance del problema, el equipo responsable y los datos de contexto del PDCA.
          </p>
        </StepInstructions>

        <div className="space-y-5 mt-4">
          {/* Fila: Título, Área, Fecha Límite, Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-xs font-semibold">Título del proyecto</Label>
              <Input
                value={title_value}
                onChange={(e) => on_title_change(e.target.value)}
                disabled={!is_editable}
                placeholder="Ej: Reducción de mermas en cocimientos"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Área</Label>
              <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fecha Límite</Label>
              <DatePicker
                date={deadline_date}
                setDate={on_deadline_change}
                placeholder="Seleccionar fecha límite"
                disabled={!is_admin_user}
                className="h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Autor Original</Label>
              {is_admin_user ? (
                <Select
                  value={author_email}
                  onValueChange={(email) => {
                    const found = available_users.find((u) => u.email === email);
                    on_author_change(email, found?.name || "Usuario");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Seleccionar autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(available_users ?? []).map((u) => (
                      <SelectItem key={u.email} value={u.email}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={author_name} disabled className="h-9 text-xs" />
              )}
            </div>
          </div>

          {/* Usuarios Asignados */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Usuarios Asignados (Co-responsables)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2"
                >
                  {(assigned_users ?? []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">Seleccionar usuarios...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(assigned_users ?? []).map((u) => (
                        <Badge key={u.email} variant="secondary" className="text-[11px] py-0">
                          {u.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {(available_users ?? []).map((u) => {
                    const assigned = (assigned_users ?? []).some((a) => a.email === u.email);
                    return (
                      <div
                        key={u.email}
                        onClick={() => on_toggle_assigned_user(u)}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                      >
                        <span>{u.name}</span>
                        {assigned && (
                          <Badge variant="outline" className="text-[10px]">
                            Asignado
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Equipo / Integrantes */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Equipo / Integrantes</Label>
            <TeamMembersInput members={team_members_list} onChange={on_team_members_change} />
          </div>

          {/* Descripción del Problema */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Descripción del Problema</Label>
            <RichTextEditor
              value={problem_description}
              onChange={on_problem_change}
              disabled={!is_editable}
            />
          </div>

          {/* Definición de la Meta (VPO Standard) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Definición de la Meta (VPO Standard)</Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                ⏱ Formato oficial A3 / A8 InBev
              </span>
            </div>
            <PdcaGoalDefinition
              value={goal_definition}
              onChange={on_goal_definition_change}
              readOnly={!is_editable}
            />
          </div>
        </div>
      </StepCard>

      {/* ── PASO 2: Participantes y VPO ───────────────────────────────── */}
      <PdcaParticipants
        value={participants_info}
        onChange={on_participants_info_change}
        readOnly={!is_editable}
      />

      <VpoCheckpointTable
        checkpoints={vpo_checkpoints}
        onChange={on_vpo_checkpoints_change}
        problemaTexto={problem_description}
        completedSteps={completed_steps}
        onToggleStep={on_toggle_step}
      />
    </div>
  );
};
