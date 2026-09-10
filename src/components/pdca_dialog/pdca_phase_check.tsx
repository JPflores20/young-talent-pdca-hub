import React from "react";
import { IshikawaSection } from "../pdca-dialog/ishikawa-section";
import { FiveWhysSection } from "../pdca-dialog/five-whys-section";
import type { IshikawaItem, FiveWhysTableData } from "@/data/pdca";

interface PhaseCheckProps {
  ishikawas: IshikawaItem[];
  on_ishikawas_change: (items: IshikawaItem[]) => void;
  five_whys_tables: FiveWhysTableData[];
  on_five_whys_tables_change: (tables: FiveWhysTableData[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
}

export const PdcaPhaseCheck: React.FC<PhaseCheckProps> = ({
  ishikawas, on_ishikawas_change,
  five_whys_tables, on_five_whys_tables_change,
  completed_steps, on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      <IshikawaSection
        ishikawas={ishikawas}
        onChange={on_ishikawas_change}
        isStepCompleted={completed_steps.has("step-6")}
        onToggleStep={() => on_toggle_step("step-6")}
      />

      <FiveWhysSection
        tables={five_whys_tables}
        onChange={on_five_whys_tables_change}
        isStepCompleted={completed_steps.has("step-7")}
        onToggleStep={() => on_toggle_step("step-7")}
      />
    </div>
  );
};
