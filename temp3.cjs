
const fs = require('fs');
const f = 'src/data/pdca-types.ts';
let c = fs.readFileSync(f, 'utf8');

c = c.replace(
  /nuevo_pareto_image\\?: string;/g,
  \
uevo_pareto_image?: string;
  nuevo_pareto_data_map?: Record<string, ParetoItem[]>;
  nuevo_pareto_drill_downs?: string[];
  nuevo_pareto_unit?: string;
  nuevo_pareto_titles?: Record<string, string>;\
);

c = c.replace(
  /nueva_correlacion_image\\?: string;/g,
  \
ueva_correlacion_image?: string;
  has_nueva_correlacion?: boolean;
  nueva_correlacion_data?: FlavorCorrelationChart[];\
);

fs.writeFileSync(f, c, 'utf8');

