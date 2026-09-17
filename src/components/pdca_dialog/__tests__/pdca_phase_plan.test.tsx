import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaPhasePlan } from "../pdca_phase_plan";
import { DEFAULT_DEFINICION_META } from "@/components/pdca-goal-definition";
import { DEFAULT_PARTICIPANTES, DEFAULT_VPO_CHECKPOINTS } from "@/data/pdca";

describe("PdcaPhasePlan", () => {
  it("debe renderizar la sección de meta y participantes", () => {
    render(
      <PdcaPhasePlan
        goal_definition={DEFAULT_DEFINICION_META}
        on_goal_definition_change={vi.fn()}
        participants_info={DEFAULT_PARTICIPANTES}
        on_participants_info_change={vi.fn()}
        team_members_list={["Miembro A", "Miembro B"]}
        on_team_members_change={vi.fn()}
        problem_description="Descripción de prueba"
        vpo_checkpoints={DEFAULT_VPO_CHECKPOINTS}
        on_vpo_checkpoints_change={vi.fn()}
        completed_steps={new Set()}
        on_toggle_step={vi.fn()}
        is_editable={true}
      />,
    );

    expect(screen.getByText(/PASO 1: DEFINICIÓN DE LA META Y PARTICIPANTES/i)).toBeDefined();
    expect(screen.getByText(/PASO 2: PHASE SDCA CHECKLIST/i)).toBeDefined();
  });
});
