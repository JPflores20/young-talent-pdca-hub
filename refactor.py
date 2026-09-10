import re
import os

source_file = 'src/components/pdca-dialog.tsx'

with open(source_file, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Fix relative imports for the extracted files
imports_block = lines[0:103]
fixed_imports_block = []
for line in imports_block:
    line = line.replace('from "./pdca-comments"', 'from "../pdca-comments"')
    line = line.replace('from "./pdca-history"', 'from "../pdca-history"')
    line = line.replace('from "./kpi-tree"', 'from "../kpi-tree"')
    line = line.replace('from "./action-kanban"', 'from "../action-kanban"')
    line = line.replace('from "./GopThemesSection"', 'from "../GopThemesSection"')
    line = line.replace('from "./image-upload-section"', 'from "../image-upload-section"')
    fixed_imports_block.append(line)

# Add some types that might be needed in subcomponents but were defined in pdca-dialog.tsx
types_and_constants = []
for line in lines[103:140]:
    types_and_constants.append(line)
    
header = "".join(fixed_imports_block) + "".join(types_and_constants)

patterns = {
    'StepInstructions': '^function StepInstructions',
    'TeamMembersInput': '^function TeamMembersInput',
    'CategoryBox': '^const CategoryBox =',
    'IshikawaSection': '^export function IshikawaSection',
    'IshikawaInteractive': '^function IshikawaInteractive',
    'ParetoInteractive': '^function ParetoInteractive',
    'ParetoSection': '^function ParetoSection',
    'AutoResizeTextarea': '^function AutoResizeTextarea',
    'PrioritizationMatrix': '^function PrioritizationMatrix',
    'TimeSeriesYTD': '^function TimeSeriesYTD',
    'SCORE_OPTIONS': '^const SCORE_OPTIONS =',
    'newImpactRow': '^function newImpactRow',
    'calcImpact': '^function calcImpact',
    'calcProduct': '^function calcProduct',
    'ImpactMatrixTable': '^function ImpactMatrixTable',
    'FiveWhysSection': '^function FiveWhysSection',
    'FiveWhysInteractive': '^function FiveWhysInteractive',
    'StepHeader': '^function StepHeader',
    'isPhaseStepsCompleted': '^const isPhaseStepsCompleted',
    'CustomStepper': '^function CustomStepper',
    'VpoCheckpointTable': '^function VpoCheckpointTable',
    'PdcaDialog': '^export function PdcaDialog',
    'FlavorCorrelationSection': '^export function FlavorCorrelationSection',
}

indices = []
for i, line in enumerate(lines):
    for name, pattern in patterns.items():
        if re.match(pattern, line):
            indices.append((i, name))
indices.sort(key=lambda x: x[0])

# Extract components text
components_text = {}
for i in range(len(indices)):
    start_idx = indices[i][0]
    end_idx = indices[i+1][0] if i + 1 < len(indices) else len(lines)
    components_text[indices[i][1]] = "".join(lines[start_idx:end_idx])

# Define file mappings
file_mappings = {
    'step-instructions.tsx': ['StepInstructions'],
    'team-members-input.tsx': ['TeamMembersInput'],
    'ishikawa-section.tsx': ['CategoryBox', 'IshikawaSection', 'IshikawaInteractive', 'PrioritizationMatrix'],
    'pareto-section.tsx': ['ParetoInteractive', 'ParetoSection'],
    'auto-resize-textarea.tsx': ['AutoResizeTextarea'],
    'time-series-ytd.tsx': ['TimeSeriesYTD'],
    'impact-matrix-table.tsx': ['SCORE_OPTIONS', 'newImpactRow', 'calcImpact', 'calcProduct', 'ImpactMatrixTable'],
    'five-whys-section.tsx': ['FiveWhysSection', 'FiveWhysInteractive'],
    'pdca-dialog-step-header.tsx': ['StepHeader'],
    'pdca-dialog-stepper.tsx': ['isPhaseStepsCompleted', 'CustomStepper'],
    'vpo-checkpoint-table.tsx': ['VpoCheckpointTable'],
    'flavor-correlation-section.tsx': ['FlavorCorrelationSection']
}

out_dir = 'src/components/pdca-dialog'
os.makedirs(out_dir, exist_ok=True)

for filename, comp_names in file_mappings.items():
    content = header
    
    # We must make sure components are exported
    body = ""
    for name in comp_names:
        comp_text = components_text[name]
        if comp_text.startswith('function '):
            comp_text = comp_text.replace('function ' + name, 'export function ' + name, 1)
        elif comp_text.startswith('const ' + name):
            comp_text = comp_text.replace('const ' + name, 'export const ' + name, 1)
        body += comp_text + "\n"
        
    with open(os.path.join(out_dir, filename), 'w', encoding='utf-8') as f:
        f.write(content + body)

# Finally, rewrite pdca-dialog.tsx
new_pdca_dialog_lines = []
new_pdca_dialog_lines.extend(lines[0:141]) # imports and constants

# add imports for extracted components
new_pdca_dialog_lines.append('import { StepInstructions } from "./pdca-dialog/step-instructions";\n')
new_pdca_dialog_lines.append('import { TeamMembersInput } from "./pdca-dialog/team-members-input";\n')
new_pdca_dialog_lines.append('import { IshikawaSection } from "./pdca-dialog/ishikawa-section";\n')
new_pdca_dialog_lines.append('import { ParetoSection } from "./pdca-dialog/pareto-section";\n')
new_pdca_dialog_lines.append('import { TimeSeriesYTD } from "./pdca-dialog/time-series-ytd";\n')
new_pdca_dialog_lines.append('import { ImpactMatrixTable, newImpactRow } from "./pdca-dialog/impact-matrix-table";\n')
new_pdca_dialog_lines.append('import { FiveWhysSection } from "./pdca-dialog/five-whys-section";\n')
new_pdca_dialog_lines.append('import { CustomStepper } from "./pdca-dialog/pdca-dialog-stepper";\n')
new_pdca_dialog_lines.append('import { VpoCheckpointTable } from "./pdca-dialog/vpo-checkpoint-table";\n')
new_pdca_dialog_lines.append('import { FlavorCorrelationSection } from "./pdca-dialog/flavor-correlation-section";\n')

# PdcaDialog text
new_pdca_dialog_lines.append(components_text['PdcaDialog'])

with open(source_file, 'w', encoding='utf-8') as f:
    f.writelines(new_pdca_dialog_lines)

print("Refactoring complete.")
