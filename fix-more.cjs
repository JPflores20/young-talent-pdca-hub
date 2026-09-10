const fs = require('fs');
const path = require('path');

const outDir = 'src/components/pdca-dialog';

// 1. pdca-dialog-stepper.tsx
const stepperPath = path.join(outDir, 'pdca-dialog-stepper.tsx');
let stepperContent = fs.readFileSync(stepperPath, 'utf8');
const constantsToInject = 
const PHASE_STEPS_MAP: Record<string, string[]> = {
  Plan: ["step-1", "step-2"],
  Do: ["step-3", "step-4", "step-5", "step-flavor", "step-gop"],
  Check: ["step-6", "step-7"],
  Act: ["step-8", "step-9"],
};

const customPhases = [
  { id: "Plan", label: "1. Definición", sub: "Pasos 1 y 2" },
  { id: "Do", label: "2. Análisis", sub: "Pasos 3, 4 y 5" },
  { id: "Check", label: "3. Causa Raíz", sub: "Pasos 6 y 7" },
  { id: "Act", label: "4. Ejecución", sub: "Pasos 8 y 9" }
] as const;
;
if (!stepperContent.includes('const customPhases')) {
    stepperContent = stepperContent.replace('export const isPhaseStepsCompleted', constantsToInject + '\\nexport const isPhaseStepsCompleted');
    fs.writeFileSync(stepperPath, stepperContent, 'utf8');
}

// 2. vpo-checkpoint-table.tsx
const vpoPath = path.join(outDir, 'vpo-checkpoint-table.tsx');
let vpoContent = fs.readFileSync(vpoPath, 'utf8');
if (!vpoContent.includes('const PILAR_STYLE_MAP')) {
    const pilarStyles = 
const PILAR_STYLE_MAP: Record<string, { badge: string; dot: string }> = {
  "Seguridad": { badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800", dot: "bg-red-500" },
  "Calidad": { badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", dot: "bg-blue-500" },
  "Medio Ambiente": { badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-500" },
  "Mantenimiento": { badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800", dot: "bg-amber-500" },
  "Operaciones": { badge: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800", dot: "bg-purple-500" },
  "Logística": { badge: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800", dot: "bg-cyan-500" },
  "Gestión": { badge: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700", dot: "bg-slate-500" },
  "default": { badge: "bg-secondary text-secondary-foreground border-border", dot: "bg-muted-foreground" }
};
;
    vpoContent = vpoContent.replace('export function VpoCheckpointTable', pilarStyles + '\\nexport function VpoCheckpointTable');
    fs.writeFileSync(vpoPath, vpoContent, 'utf8');
}

// 3. remove html2pdf.js from all
const files = fs.readdirSync(outDir).filter(f => f.endsWith('.tsx'));
for (const filename of files) {
    const filepath = path.join(outDir, filename);
    let content = fs.readFileSync(filepath, 'utf8');
    content = content.replace(/import html2pdf from "html2pdf.js";\\n/g, '');
    fs.writeFileSync(filepath, content, 'utf8');
}
