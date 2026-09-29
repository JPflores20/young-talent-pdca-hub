
const fs = require('fs');
const f = 'src/components/pdca_dialog/pdca_phase_plan.tsx';
let c = fs.readFileSync(f, 'utf8');

c = c.replace('import { Badge } from "@/components/ui/badge";', 'import { Badge } from "@/components/ui/badge";\nimport { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";');

const startDiv = '<div className="space-y-6">';
const startAccordion = '<div className="space-y-6">\n      <Accordion type="single" collapsible defaultValue="subfase-1" className="w-full space-y-4">\n        <AccordionItem value="subfase-1" className="border rounded-md bg-white shadow-sm overflow-hidden">\n          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">\n            Subfase 1: Identificación del Problema (Pasos 1-7)\n          </AccordionTrigger>\n          <AccordionContent className="p-4 space-y-6 bg-slate-50">\n';
c = c.replace(startDiv, startAccordion);

const paso8CommentMatch = c.match(/\{\/\*\s*.*PASO 8:.*?\*\/\}/);
if (paso8CommentMatch) {
  const paso8Comment = paso8CommentMatch[0];
  const replacePaso8 = '</AccordionContent>\n        </AccordionItem>\n        <AccordionItem value="subfase-2" className="border rounded-md bg-white shadow-sm overflow-hidden">\n          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">\n            Subfase 2: Análisis (Pasos 8-18)\n          </AccordionTrigger>\n          <AccordionContent className="p-4 space-y-6 bg-slate-50">\n      ' + paso8Comment;
  c = c.replace(paso8Comment, replacePaso8);
} else {
  console.log('Failed to find Paso 8 comment');
}

const endPattern = /([\s\S]*?)(\s*<\/div>\s*\);\s*};\s*)$/;
const match = c.match(endPattern);
if (match) {
  c = match[1] + '\n        </AccordionContent>\n        </AccordionItem>\n      </Accordion>' + match[2];
} else {
  console.log('Failed to match end of file');
}

fs.writeFileSync(f, c, 'utf8');
console.log('Successfully wrapped phases in Accordion');

