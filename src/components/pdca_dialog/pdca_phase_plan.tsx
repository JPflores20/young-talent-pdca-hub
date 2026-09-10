import React from "react";
import { PdcaGoalDefinition, PdcaParticipants } from "@/components/pdca-goal-definition";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../pdca-dialog/step-instructions";
import { TeamMembersInput } from "../pdca-dialog/team-members-input";
import { VpoCheckpointTable } from "../pdca-dialog/vpo-checkpoint-table";
import type { DefinicionMeta, ParticipantesData, VpoCheckpointItem } from "@/data/pdca";

interface PhasePlanProps {
  goal_definition: DefinicionMeta;
  on_goal_definition_change: (data: DefinicionMeta) => void;
  participants_info: ParticipantesData;
  on_participants_info_change: (data: ParticipantesData) => void;
  team_members_list: string[];
  on_team_members_change: (members: string[]) => void;
  problem_description: string;
  vpo_checkpoints: VpoCheckpointItem[];
  on_vpo_checkpoints_change: (checkpoints: VpoCheckpointItem[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
  is_editable: boolean;
}

export const PdcaPhasePlan: React.FC<PhasePlanProps> = ({
  goal_definition, on_goal_definition_change,
  participants_info, on_participants_info_change,
  team_members_list, on_team_members_change,
  problem_description,
  vpo_checkpoints, on_vpo_checkpoints_change,
  completed_steps, on_toggle_step,
  is_editable,
}) => {
  return (
    <div className="space-y-6">
      <StepCard
        title="PASO 1: DEFINICIÓN DE LA META Y PARTICIPANTES"
        isStepCompleted={completed_steps.has("step-1")}
        onToggleStep={() => on_toggle_step("step-1")}
      >
        <StepInstructions>
          <p className="mb-2"><strong>1. DEFINICIÓN DE LA META:</strong> Establece el KPI a mejorar con unidad de medida, valores antes/después y fecha de compromiso.</p>
          <p><strong>2. PARTICIPANTES:</strong> Registra el equipo multidisciplinario local y externo.</p>
        </StepInstructions>

        <div className="space-y-6 mt-4">
          <PdcaGoalDefinition
            value={goal_definition}
            onChange={on_goal_definition_change}
            readOnly={!is_editable}
          />
          <PdcaParticipants
            value={participants_info}
            onChange={on_participants_info_change}
            readOnly={!is_editable}
          />
          <TeamMembersInput
            members={team_members_list}
            onChange={on_team_members_change}
          />
        </div>
      </StepCard>

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
