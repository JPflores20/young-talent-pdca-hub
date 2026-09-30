import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PdcaPhasePlanSubphase1 } from "./pdca-phase-plan-subphase-1";
import { PdcaPhasePlanSubphase2 } from "./pdca-phase-plan-subphase-2";
import type { PhasePlanProps } from "./pdca-phase-plan-types";

// ─── Componente principal ─────────────────────────────────────────────────────
export const PdcaPhasePlan: React.FC<PhasePlanProps> = (props) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-extrabold text-slate-800 border-b pb-2">FASE PLAN</h2>
      
      <Accordion type="multiple" defaultValue={["subfase-1"]} className="space-y-4">
        <AccordionItem value="subfase-1" className="border rounded-md bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            Subfase 1: Preparación (Pasos 1-7)
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50">
            <PdcaPhasePlanSubphase1 {...props} />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="subfase-2" className="border rounded-md bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            Subfase 2: Análisis (Pasos 8-17)
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50">
            <PdcaPhasePlanSubphase2 {...props} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
