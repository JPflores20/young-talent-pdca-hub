
const fs = require('fs');
const f = 'src/components/pdca_dialog/hooks/use_pdca_dialog_state.ts';
let c = fs.readFileSync(f, 'utf8');

const target1 = 'const [nuevo_performance_image, set_nuevo_performance_image] = useState<string | undefined>(';
const lines1 = c.split('\\n');
const idx1 = lines1.findIndex(l => l.includes('set_nuevo_performance_image'));

if (idx1 !== -1) {
    const insertState = \  const [nuevo_pareto_image, set_nuevo_pareto_image] = useState<string | undefined>(
    initial_pdca.nuevo_pareto_image || initial_pdca.nuevo_pareto_image,
  );
  const [nueva_correlacion_image, set_nueva_correlacion_image] = useState<string | undefined>(
    initial_pdca.nueva_correlacion_image || initial_pdca.nueva_correlacion_image,
  );\;
    lines1.splice(idx1 + 3, 0, insertState);
}

const target2 = 'nuevo_performance_image,';
const idx2 = lines1.findIndex((l, i) => i > idx1 + 5 && l.includes(target2));

if (idx2 !== -1) {
    const insertReturn = \    nuevo_pareto_image,
    set_nuevo_pareto_image,
    nueva_correlacion_image,
    set_nueva_correlacion_image,\;
    lines1.splice(idx2 + 2, 0, insertReturn);
}

fs.writeFileSync(f, lines1.join('\\n'), 'utf8');

