const fs = require('fs');
const path = require('path');

const filePath = path.join('src', 'components', 'pdca_dialog', 'tabla-resultados-finales.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
const importsToAdd = 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
;
content = content.replace('import { Button } from "@/components/ui/button";', 'import { Button } from "@/components/ui/button";' + importsToAdd);

// 2. Replace mejoroPI
content = content.replace(
  /<select[\s\S]*?value=\{data\.mejoroPI[\s\S]*?<\/select>/,
  \<Select
                    value={data.mejoroPI || "-"}
                    onValueChange={(v) => updateData({ mejoroPI: v === "-" ? "" : v })}
                  >
                    <SelectTrigger
                      className={\\\w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full \\\\}
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Sí" className="text-green-700 font-bold">Sí</SelectItem>
                      <SelectItem value="No" className="text-red-700 font-bold">No</SelectItem>
                    </SelectContent>
                  </Select>\
);

// 3. Replace mejoroKPI
content = content.replace(
  /<select[\s\S]*?value=\{data\.mejoroKPI[\s\S]*?<\/select>/,
  \<Select
                    value={data.mejoroKPI || "-"}
                    onValueChange={(v) => updateData({ mejoroKPI: v === "-" ? "" : v })}
                  >
                    <SelectTrigger
                      className={\\\w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full \\\\}
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Sí" className="text-green-700 font-bold">Sí</SelectItem>
                      <SelectItem value="No" className="text-red-700 font-bold">No</SelectItem>
                    </SelectContent>
                  </Select>\
);

// 4. Replace verdeEs (kpi)
content = content.replace(
  /<select[\s\S]*?value=\{data\.kpi\?\.verdeEs[\s\S]*?<\/select>/,
  \<Select
                    value={data.kpi?.verdeEs || "-"}
                    onValueChange={(v) => updateKpi("verdeEs", v === "-" ? "" : v)}
                  >
                    <SelectTrigger
                      className="w-full h-full min-h-[30px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center text-slate-900 font-medium focus:ring-0 [&>span]:text-center [&>span]:w-full"
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Más alto">Más alto</SelectItem>
                      <SelectItem value="Lower">Más bajo</SelectItem>
                    </SelectContent>
                  </Select>\
);

// 5. Replace verdeEs (pis)
content = content.replace(
  /<select[\s\S]*?value=\{row\.verdeEs\}[\s\S]*?<\/select>/,
  \<Select
                          value={row.verdeEs || "-"}
                          onValueChange={(v) => updatePiRow(row.id, "verdeEs", v === "-" ? "" : v)}
                        >
                          <SelectTrigger
                            className="w-full h-8 rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center text-slate-900 font-medium focus:ring-0 [&>span]:text-center [&>span]:w-full"
                          >
                            <SelectValue placeholder="-" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="-">-</SelectItem>
                            <SelectItem value="Más alto">Más alto</SelectItem>
                            <SelectItem value="Lower">Más bajo</SelectItem>
                          </SelectContent>
                        </Select>\
);

fs.writeFileSync(filePath, content);
console.log('Done replacing selects');
