import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../common/step-instructions";
import { AREAS } from "@/data/pdca";
import { RichTextEditor } from "../common/rich-text-editor";
import { TeamMembersInput } from "./step-01-meta/team-members-input";
import { PdcaGoalDefinition, PdcaParticipants } from "./step-01-meta/pdca-goal-definition";
import { VpoCheckpointTable } from "./step-01-meta/vpo-checkpoint-table";
import { TimeSeriesYTD } from "./step-02-linea-tiempo/time-series-ytd";
import type { PhasePlanProps } from "./pdca-phase-plan-types";

export const PdcaPhasePlanSubphase1: React.FC<PhasePlanProps> = ({
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
  na_steps,
  on_toggle_step,
  on_toggle_na,
  is_editable,
  target_vs_actual,
  on_target_vs_actual_change,
  target_vs_actual_unit,
  on_target_vs_actual_unit_change,
  target_vs_actual_title,
  on_target_vs_actual_title_change,
  target_vs_actual_ymin,
  on_target_vs_actual_ymin_change,
  target_vs_actual_ymax,
  on_target_vs_actual_ymax_change,
}) => {
  return (
    <div className="space-y-6">
      {/* ── PASO 1: Meta y Participantes ──────────────────────────────── */}
      <StepCard
        title="PASO 1: METADATOS DEL PDCA Y EQUIPO"
        isStepCompleted={completed_steps.has("step-1")}
        onToggleStep={() => on_toggle_step("step-1")}
        isNa={na_steps?.has("step-1")}
        onToggleNa={() => on_toggle_na?.("step-1")}
      >
        <StepInstructions>
          Complete los campos principales del proyecto PDCA (Título, Área, Fecha Límite, etc.) 
          y asigne a los miembros del equipo que participarán.
        </StepInstructions>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-bold text-slate-700">TÍTULO DEL PROYECTO</Label>
              <Input
                value={title_value}
                onChange={(e) => on_title_change(e.target.value)}
                placeholder="Ej. Reducción de mermas en línea 3..."
                disabled={!is_editable}
                className="mt-1 font-semibold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold text-slate-700">ÁREA / DEPARTAMENTO</Label>
                <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar..." />
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
              <div>
                <Label className="text-xs font-bold text-slate-700">FECHA COMPROMISO</Label>
                <div className="mt-1">
                  <DatePicker date={deadline_date} setDate={on_deadline_change} disabled={!is_editable} />
                </div>
              </div>
            </div>

            {/* Asignación de Usuarios (solo Admin) */}
            {is_admin_user && (
              <div className="pt-2 border-t mt-4">
                <Label className="text-xs font-bold text-slate-700">USUARIOS ASIGNADOS AL PDCA</Label>
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal" disabled={!is_editable}>
                        {assigned_users.length > 0
                          ? `${assigned_users.length} usuario(s) asignado(s)`
                          : "Asignar usuarios..."}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0" align="start">
                      <div className="p-2 border-b font-semibold text-sm">
                        Selecciona usuarios:
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {available_users.map((u) => {
                          const isSelected = assigned_users.some(a => a.email === u.email);
                          return (
                            <div 
                              key={u.email}
                              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => on_toggle_assigned_user(u)}
                            >
                              <input 
                                type="checkbox" 
                                checked={isSelected} 
                                readOnly 
                                className="pointer-events-none"
                              />
                              <div className="flex flex-col">
                                <span>{u.name}</span>
                                <span className="text-xs text-muted-foreground">{u.email}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                  {assigned_users.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {assigned_users.map((u) => (
                        <Badge key={u.email} variant="secondary" className="text-xs">
                          {u.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div>
            <Label className="text-xs font-bold text-slate-700">MIEMBROS DEL EQUIPO (Nombres)</Label>
            <div className="mt-1">
              <TeamMembersInput
                members={team_members_list}
                onChange={on_team_members_change}
                disabled={!is_editable}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Estos nombres aparecerán en la sección de Participantes (Paso 4). Escribe y presiona Enter.
            </p>
          </div>
        </div>
      </StepCard>

      {/* ── PASO 2: Descripción del Problema ────────────────────────── */}
      <StepCard
        title="PASO 2: DESCRIPCIÓN DEL PROBLEMA"
        isStepCompleted={completed_steps.has("step-2")}
        onToggleStep={() => on_toggle_step("step-2")}
        isNa={na_steps?.has("step-2")}
        onToggleNa={() => on_toggle_na?.("step-2")}
      >
        <StepInstructions>
          Defina el problema que se está abordando. Sea claro, conciso y base su descripción en hechos medibles.
        </StepInstructions>
        <div className="mt-4">
          <RichTextEditor
            value={problem_description}
            onChange={on_problem_change}
            disabled={!is_editable}
          />
        </div>
      </StepCard>

      {/* ── PASO 3: Definición de la Meta ────────────────────────────── */}
      <StepCard
        title="PASO 3: DEFINICIÓN DE LA META"
        isStepCompleted={completed_steps.has("step-3")}
        onToggleStep={() => on_toggle_step("step-3")}
        isNa={na_steps?.has("step-3")}
        onToggleNa={() => on_toggle_na?.("step-3")}
      >
        <PdcaGoalDefinition
          value={goal_definition}
          onChange={on_goal_definition_change}
          readOnly={!is_editable}
        />
      </StepCard>

      <StepCard
        title="PASO 4: PARTICIPANTES"
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
        isNa={na_steps?.has("step-4")}
        onToggleNa={() => on_toggle_na?.("step-4")}
      >
        <PdcaParticipants
          value={participants_info || {
            localesNombres: team_members_list?.join("\n") || "",
            localesRoles: "",
            invitadosNombres: "",
            invitadosRoles: "",
            patrocinadorInfo: "",
          }}
          onChange={on_participants_info_change}
        />
      </StepCard>

      {/* ── PASO 5: VPO Checkpoints ──────────────────────────────────── */}
      <StepCard
        title="PASO 5: VALIDACIÓN VPO (CHECKPOINTS)"
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
        isNa={na_steps?.has("step-5")}
        onToggleNa={() => on_toggle_na?.("step-5")}
      >
        <VpoCheckpointTable
          checkpoints={vpo_checkpoints}
          onChange={on_vpo_checkpoints_change}
          problemaTexto={problem_description}
          completedSteps={completed_steps}
          naSteps={na_steps}
          onToggleStep={on_toggle_step}
          onToggleNa={on_toggle_na}
        />
      </StepCard>

      {/* ── PASO 7: Situación Actual ───────────────────────────────── */}
      <TimeSeriesYTD
        value={target_vs_actual}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
        title="PASO 7: SITUACIÓN ACTUAL"
        chartTitle={target_vs_actual_title}
        onTitleChange={on_target_vs_actual_title_change}
        yMin={target_vs_actual_ymin}
        onYMinChange={on_target_vs_actual_ymin_change}
        yMax={target_vs_actual_ymax}
        onYMaxChange={on_target_vs_actual_ymax_change}
        isStepCompleted={completed_steps.has("step-12")}
        onToggleStep={() => on_toggle_step("step-12")}
        isNa={na_steps?.has("step-12")}
        onToggleNa={() => on_toggle_na?.("step-12")}
      />
    </div>
  );
};
