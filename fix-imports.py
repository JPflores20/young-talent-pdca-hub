import os
import re

out_dir = 'src/components/pdca-dialog'

for filename in os.listdir(out_dir):
    if not filename.endswith('.tsx'): continue
    filepath = os.path.join(out_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Remove lines from 104 to 140 that we injected blindly.
    # Actually, we can just look for const PHASE_STEPS_MAP and const getEmptyDraft and remove them.
    new_lines = []
    skip = False
    for line in lines:
        if line.startswith('const PHASE_STEPS_MAP'):
            skip = True
        if skip and line.startswith('function '):
            skip = False
        if skip and line.startswith('export function '):
            skip = False
        if skip and line.startswith('export const '):
            skip = False
        if skip and line.startswith('const CategoryBox'):
            skip = False
        if skip and line.startswith('const isPhaseStepsCompleted'):
            skip = False
        if skip and line.startswith('const SCORE_OPTIONS'):
            skip = False
        
        if not skip:
            new_lines.append(line)
            
    content = "".join(new_lines)
    
    # Inject internal imports if missing
    internal_imports = ""
    if 'StepInstructions' in content and filename != 'step-instructions.tsx':
        internal_imports += 'import { StepInstructions } from "./step-instructions";\n'
    if 'AutoResizeTextarea' in content and filename != 'auto-resize-textarea.tsx':
        internal_imports += 'import { AutoResizeTextarea } from "./auto-resize-textarea";\n'
    if 'PrioritizationMatrix' in content and filename != 'ishikawa-section.tsx':
        internal_imports += 'import { PrioritizationMatrix } from "./ishikawa-section";\n'
    if 'PILAR_STYLE_MAP' in content:
        # PILAR_STYLE_MAP is not in the file? wait, it was inside pdca-dialog.tsx originally. Let's see if we can find where it was defined.
        pass

    # We also need to fix missing 'html2pdf.js'. We can just ignore the error if we are not using it, or remove the import from the header block if unused.
    # Actually, the header block imports html2pdf.js. We can remove it from files that don't use it, or just let it be. Wait, the error is Cannot find module 'html2pdf.js'. That means the type definitions are missing or it's not installed, but it was in pdca-dialog.tsx! Wait, pdca-dialog.tsx used it. If I leave it, it's fine, I can just add @ts-ignore or let it be. But wait, it breaks the build. I'll just remove import html2pdf from "html2pdf.js"; from all extracted files because they don't need it! pdca-dialog.tsx needs it.
    content = re.sub(r'import html2pdf from "html2pdf.js";\n', '', content)
    
    # PILAR_STYLE_MAP is missing in vpo-checkpoint-table. Let's define it there.
    if filename == 'vpo-checkpoint-table.tsx':
        if 'const PILAR_STYLE_MAP' not in content:
            pilar_styles = '''
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
'''
            # inject after imports
            content = content.replace('import { StepCard } from "@/components/ui/step-card";', 'import { StepCard } from "@/components/ui/step-card";\\n' + pilar_styles)
            
    with open(filepath, 'w', encoding='utf-8') as f:
        # inject internal imports right after the original imports
        # look for last import
        parts = content.split('import { StepCard } from "@/components/ui/step-card";')
        if len(parts) == 2:
            f.write(parts[0] + 'import { StepCard } from "@/components/ui/step-card";\\n' + internal_imports + parts[1])
        else:
            f.write(internal_imports + content)
            
