const fs = require('fs');
const path = 'c:/Users/pepej/Documents/CORONA/REPOS/YOUNG TALENT WEB/young-talent-pdca-hub/src/components/pdca_dialog/pdca_phase_plan.tsx';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
/\{\/\* -- PASO 3: SIPOC MAP \(Placeholder\) --------------------------- \*\/\}[\s\S]*?<\/StepCard>/g,
\{/* -- PASO 3: SIPOC MAP --------------------------- */}
      <MultiImageUploadSection
        images={sipoc_map_files || []}
        onChange={(f) => on_sipoc_map_files_change?.(f)}
        title=\PASO 3: SIPOC MAP\
        subtitle=\Sube tus imágenes o PDFs\
        description=\Adjunta fotos o documentos del SIPOC MAP (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint.\
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has(\step-3\)}
        onToggleStep={() => on_toggle_step(\step-3\)}
        isNa={na_steps?.has(\step-3\)} onToggleNa={() => on_toggle_na?.(\step-3\)}
      />\
);
fs.writeFileSync(path, content, 'utf8');
console.log('Replaced successfully');
