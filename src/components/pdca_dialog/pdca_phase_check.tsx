import React from "react";
import { IshikawaSection } from "../pdca-dialog/ishikawa-section";
import { FiveWhysSection } from "../pdca-dialog/five-whys-section";
import { MultiImageUploadSection, ALL_ACCEPT_STRING } from "../image-upload-section";
import type { IshikawaItem, FiveWhysTableData } from "@/data/pdca";

interface PhaseCheckProps {
  process_mapping_files: string[];
  on_process_mapping_files_change: (files: string[]) => void;
  ishikawas: IshikawaItem[];
  on_ishikawas_change: (items: IshikawaItem[]) => void;
  five_whys_tables: FiveWhysTableData[];
  on_five_whys_tables_change: (tables: FiveWhysTableData[]) => void;
  completed_steps: Set<string>;
  on_toggle_step: (step_id: string) => void;
}

export const PdcaPhaseCheck: React.FC<PhaseCheckProps> = ({
  process_mapping_files, on_process_mapping_files_change,
  ishikawas, on_ishikawas_change,
  five_whys_tables, on_five_whys_tables_change,
  completed_steps, on_toggle_step,
}) => {
  return (
    <div className="space-y-6">
      <MultiImageUploadSection
        images={process_mapping_files}
        onChange={on_process_mapping_files_change}
        title="MAPEO DE PROCESO"
        subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-process-mapping")}
        onToggleStep={() => on_toggle_step("step-process-mapping")}
      />

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
