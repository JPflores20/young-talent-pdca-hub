import re

file_path = 'src/components/pdca_dialog/tabla-resultados-finales.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

imports_to_add = '''
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
'''

content = content.replace(
    'import { Button } from "@/components/ui/button";',
    'import { Button } from "@/components/ui/button";' + imports_to_add
)

# 2. Replace mejoroPI
content = re.sub(
    r'<select[\s\S]*?value=\{data\.mejoroPI[\s\S]*?</select>',
    '''<Select
                    value={data.mejoroPI || "-"}
                    onValueChange={(v) => updateData({ mejoroPI: v === "-" ? "" : v })}
                  >
                    <SelectTrigger
                      className={w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full }
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Sí" className="text-green-700 font-bold">Sí</SelectItem>
                      <SelectItem value="No" className="text-red-700 font-bold">No</SelectItem>
                    </SelectContent>
                  </Select>''',
    content
)

# 3. Replace mejoroKPI
content = re.sub(
    r'<select[\s\S]*?value=\{data\.mejoroKPI[\s\S]*?</select>',
    '''<Select
                    value={data.mejoroKPI || "-"}
                    onValueChange={(v) => updateData({ mejoroKPI: v === "-" ? "" : v })}
                  >
                    <SelectTrigger
                      className={w-full h-full min-h-[60px] rounded-none border-0 shadow-none hover:bg-black/5 flex justify-center text-center focus:ring-0 [&>span]:text-center [&>span]:w-full }
                    >
                      <SelectValue placeholder="-" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="-">-</SelectItem>
                      <SelectItem value="Sí" className="text-green-700 font-bold">Sí</SelectItem>
                      <SelectItem value="No" className="text-red-700 font-bold">No</SelectItem>
                    </SelectContent>
                  </Select>''',
    content
)

# 4. Replace verdeEs (kpi)
content = re.sub(
    r'<select[\s\S]*?value=\{data\.kpi\?\.verdeEs[\s\S]*?</select>',
    '''<Select
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
                  </Select>''',
    content
)

# 5. Replace verdeEs (pis)
content = re.sub(
    r'<select[\s\S]*?value=\{row\.verdeEs\}[\s\S]*?</select>',
    '''<Select
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
                        </Select>''',
    content
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
