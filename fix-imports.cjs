const fs = require("fs");
const path = require("path");

const outDir = "src/components/pdca-dialog";
const files = fs.readdirSync(outDir).filter((f) => f.endsWith(".tsx"));

for (const filename of files) {
  const filepath = path.join(outDir, filename);
  let content = fs.readFileSync(filepath, "utf8");

  let lines = content.split("\n");
  let newLines = [];
  let skip = false;
  for (let line of lines) {
    if (line.startsWith("const PHASE_STEPS_MAP")) skip = true;
    if (
      skip &&
      (line.startsWith("function ") ||
        line.startsWith("export function ") ||
        line.startsWith("export const ") ||
        line.startsWith("const CategoryBox") ||
        line.startsWith("const isPhaseStepsCompleted") ||
        line.startsWith("const SCORE_OPTIONS"))
    ) {
      skip = false;
    }
    if (!skip) {
      newLines.push(line);
    }
  }

  content = newLines.join("\n");

  let internalImports = "";
  if (content.includes("StepInstructions") && filename !== "step-instructions.tsx") {
    internalImports += 'import { StepInstructions } from "./step-instructions";\n';
  }
  if (content.includes("AutoResizeTextarea") && filename !== "auto-resize-textarea.tsx") {
    internalImports += 'import { AutoResizeTextarea } from "./auto-resize-textarea";\n';
  }
  if (content.includes("PrioritizationMatrix") && filename !== "ishikawa-section.tsx") {
    internalImports += 'import { PrioritizationMatrix } from "./ishikawa-section";\n';
  }

  content = content.replace(/import html2pdf from "html2pdf.js";\n/g, "");

  if (filename === "vpo-checkpoint-table.tsx" && !content.includes("PILAR_STYLE_MAP")) {
    const pilarStyles = [
      "const PILAR_STYLE_MAP: Record<string, { badge: string; dot: string }> = {",
      '  "Seguridad": { badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800", dot: "bg-red-500" },',
      '  "Calidad": { badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", dot: "bg-blue-500" },',
      '  "Medio Ambiente": { badge: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-500" },',
      '  "Mantenimiento": { badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800", dot: "bg-amber-500" },',
      '  "Operaciones": { badge: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800", dot: "bg-purple-500" },',
      '  "Log�stica": { badge: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800", dot: "bg-cyan-500" },',
      '  "Gesti�n": { badge: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700", dot: "bg-slate-500" },',
      '  "default": { badge: "bg-secondary text-secondary-foreground border-border", dot: "bg-muted-foreground" }',
      "};",
    ].join("\\n");
    content = content.replace(
      'import { StepCard } from "@/components/ui/step-card";',
      'import { StepCard } from "@/components/ui/step-card";\n' + pilarStyles,
    );
  }

  let parts = content.split('import { StepCard } from "@/components/ui/step-card";');
  if (parts.length === 2) {
    fs.writeFileSync(
      filepath,
      parts[0] +
        'import { StepCard } from "@/components/ui/step-card";\n' +
        internalImports +
        parts[1],
      "utf8",
    );
  } else {
    fs.writeFileSync(filepath, internalImports + content, "utf8");
  }
}
