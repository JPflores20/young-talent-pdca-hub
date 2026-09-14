import React from "react";

export function StepInstructions({ title = "Instrucciones", children }: { title?: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#1F497D] text-white p-2.5 text-xs leading-relaxed font-sans rounded-sm shadow-sm mb-4">
      <p className="mb-1 font-bold">{title}:</p>
      {children}
    </div>
  );
}
