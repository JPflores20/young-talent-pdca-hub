export type Phase = "Plan" | "Do" | "Check" | "Act";

export type ActionItem = {
  id: string;
  what: string;
  who: string;
  when: string;
  status: "Pendiente" | "En progreso" | "Completada";
  done: boolean;
};

export type Pdca = {
  id: string;
  titulo: string;
  area: string;
  fase: Phase;
  actualizado: string;
  progreso: number;
  problema: string;
  causaRaiz: string;
  acciones: ActionItem[];
  verificacion: string;
  evidencias: string[];
  estandarizacion: string;
  indicador: { etiqueta: string; antes: number; despues: number; unidad: string };
  serie: { mes: string; valor: number }[];
  fechaFinalizacion?: string;
  kpiNodes?: any[];
  kpiEdges?: any[];
  completedPhases?: string[];
  completedSteps?: string[];
  ishikawaCauses?: Record<string, string[]>;
  ishikawaEffect?: string;
  fiveWhys?: string[];
  targetVsActual?: { mes: string; target: number; actual: number | null }[];
  paretoDataMap?: Record<string, ParetoItem[]>;
  paretoDrillDowns?: string[];
  autor?: string;
  autorEmail?: string;
  vpoCheckpoints?: VpoCheckpointItem[];
};

export type VpoCheckpointItem = {
  id: string;
  pilar: string;
  checkpoint: string;
  evidencia: string;
  status: "YES" | "NO" | "N/A" | "";
};

export const DEFAULT_VPO_CHECKPOINTS: VpoCheckpointItem[] = [
  {
    id: "vpo-1",
    pilar: "Mapeo de procesos",
    checkpoint: "¿Existe un mapa de procesos de nivel 4 (nivel de tareas) para el proceso afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-2",
    pilar: "Creación & ejecución de estándares",
    checkpoint: "¿Se han establecido los estándares operativos (SOP) para todas las tareas críticas de nivel 4 definidas en el mapa de procesos del proceso afectado? ¿Se han establecido y ejecutado los mantenimientos planificados de alta calidad con la frecuencia adecuada para todos los equipos afectados?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-3",
    pilar: "Creación & ejecución de estándares",
    checkpoint: "¿Se han realizado OWDs en los SOPs de tareas críticas relacionadas con el proceso afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-4",
    pilar: "Proceso de revisión de rutina",
    checkpoint: "¿El producto/proceso afectado es monitoreado rutinariamente a través de checklists?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-5",
    pilar: "Gestión del conocimiento",
    checkpoint: "¿Has implementado las GOPs relacionadas con tu problema KPI/PI o Proceso?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-6",
    pilar: "5S",
    checkpoint: "¿Están las 5S totalmente integradas en el área del problema, y específicamente para las tareas de trabajo asociadas con el problema? ¿Se ha asignado el dueño de las 5S, se ha hecho un checklist diario y se han realizado auditorías mensualmente?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-7",
    pilar: "Indicadores de producto y proceso",
    checkpoint: "¿Existe un árbol de KPI para el problema KPI o KPI relacionado con el problema PI? ¿Es adecuado para mostrar todos los IP y SIC que impactan en el KPI?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-8",
    pilar: "Proceso de revisión de rutina",
    checkpoint: "¿Existe un Indicador de Producto/Proceso (PI) para monitorear rutinariamente el Producto/Proceso afectado? ¿Incluye el PI un plan de reacción a seguir si el PI alcanza el límite amarillo/rojo?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-9",
    pilar: "Proceso de revisión de rutina",
    checkpoint: "¿Se han utilizado los gráficos SIC para recopilar datos de todos los puntos de medición, y se han utilizado los datos para identificar/resolver la causa raíz del problema?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-10",
    pilar: "Solución de problemas",
    checkpoint: "¿Existen disparadores de 5-por qué y relatos de anomalías para tratar las desviaciones relacionadas con el producto/proceso afectado? ¿Se generan y completan los reportes de 5-por qué y relato de anomalías cuando se disparan los gatillos?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-11",
    pilar: "Proceso de revisión de rutina",
    checkpoint: "¿Se revisa rutinariamente el producto/proceso afectado en el MCRS de tu departamento?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-12",
    pilar: "Descripción del negocio",
    checkpoint: "¿Existe un Acuerdo de Nivel de Servicio definido y rastreado para el Producto/Proceso afectado? (Consulte la Descripción de Negocio y Matriz de Criticidad)",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-13",
    pilar: "Proceso de revisión del rendimiento",
    checkpoint: "¿Se ha generado un GaPA para el KPI afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-14",
    pilar: "Gestión del conocimiento",
    checkpoint: "¿Se ha utilizado el benchmarking interno/externo para identificar las mejores prácticas existentes en relación con el producto o proceso afectado? Tip: consulte el archivo Global VPO Master Performance para encontrar información de ranking de muchos KPI, tanto los de Sostenibilidad como otros de interés por departamento o categoría de VOP.",
    evidencia: "",
    status: "",
  },
];

export type ParetoItem = { id: number; area: string; gap: number };

export const DEFAULT_PARETO_DATA_MAP: Record<string, ParetoItem[]> = {
  "root": [
    { id: 1, area: "Cocimientos", gap: 0.07 },
    { id: 2, area: "Cuartos frios", gap: 2.10 },
    { id: 3, area: "Envasado", gap: 0.65 },
  ]
};

export const DEFAULT_TARGET_VS_ACTUAL = [
  { mes: "Ene", target: 2.1, actual: 2.59 },
  { mes: "Feb", target: 2.1, actual: 2.58 },
  { mes: "Mar", target: 2.1, actual: 2.58 },
  { mes: "Abr", target: 2.1, actual: 2.57 },
  { mes: "May", target: 2.1, actual: 2.47 },
  { mes: "Jun", target: 2.1, actual: null },
  { mes: "Jul", target: 2.1, actual: null },
  { mes: "Ago", target: 2.1, actual: null },
  { mes: "Sep", target: 2.1, actual: null },
  { mes: "Oct", target: 2.1, actual: null },
  { mes: "Nov", target: 2.1, actual: null },
  { mes: "Dic", target: 2.1, actual: null },
];

export const phases: Phase[] = ["Plan", "Do", "Check", "Act"];

export const phaseStyles: Record<Phase, string> = {
  Plan: "bg-phase-plan/12 text-phase-plan border-phase-plan/30",
  Do: "bg-phase-do/25 text-brand-yellow-foreground border-phase-do/50",
  Check: "bg-phase-check/15 text-phase-check border-phase-check/35",
  Act: "bg-phase-act/15 text-phase-act border-phase-act/35",
};

export const pdcas: Pdca[] = [
  {
    id: "PDCA-2026-014",
    titulo: "Reducción de merma en línea de envasado L3",
    area: "Producción / Envasado",
    fase: "Do",
    actualizado: "24 Ago 2026",
    fechaFinalizacion: "2026-10-31",
    progreso: 45,
    problema:
      "La línea de envasado L3 presenta una merma de botella de 2.8% contra un objetivo de 1.5%, generando un sobrecosto estimado de $180,000 MXN mensuales.",
    causaRaiz:
      "Análisis 5 Por Qués + Ishikawa: el desajuste del tornillo alimentador provoca golpes entre botellas al ingresar al llenador. Causa raíz: no existe estándar de ajuste tras cambio de formato y el personal del turno nocturno no está certificado en el setup.",
    acciones: [
      {
        id: "a1",
        what: "Levantar estándar visual de ajuste del tornillo alimentador",
        who: "Ana López",
        when: "12 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "a2",
        what: "Certificar a 6 operadores del turno nocturno en cambio de formato",
        who: "Miguel Ortega",
        when: "22 Ago 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "a3",
        what: "Instalar guarda-guía en curva de entrada al llenador",
        who: "Mantenimiento L3",
        when: "29 Ago 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "a4",
        what: "Registrar merma por hora en tablero SIC durante 3 semanas",
        who: "Ana López",
        when: "05 Sep 2026",
        status: "Pendiente",
        done: false,
      },
    ],
    verificacion:
      "Semanas 34 y 35: merma promedio de 1.9% (‑0.9 pp vs. línea base). El turno nocturno pasó de 3.4% a 2.1%. Se mantiene seguimiento hasta cerrar 4 semanas consecutivas bajo 1.8%.",
    evidencias: ["estandar_visual_L3.pdf", "matriz_certificacion_nocturno.xlsx"],
    estandarizacion:
      "Incorporar el estándar de ajuste al OPL de la línea, actualizar la lista de verificación de arranque y replicar en L2 durante septiembre.",
    indicador: { etiqueta: "Merma de botella", antes: 2.8, despues: 1.9, unidad: "%" },
    serie: [
      { mes: "May", valor: 2.9 },
      { mes: "Jun", valor: 2.8 },
      { mes: "Jul", valor: 2.6 },
      { mes: "Ago", valor: 1.9 },
    ],
  },
  {
    id: "PDCA-2026-011",
    titulo: "Disminución de tiempo de setup en cambio de SKU",
    area: "Ingeniería de Procesos",
    fase: "Check",
    actualizado: "21 Ago 2026",
    progreso: 72,
    problema:
      "El cambio de SKU en la llenadora toma 68 minutos en promedio contra un benchmark corporativo de 40 minutos.",
    causaRaiz:
      "Estudio SMED: el 41% del tiempo es actividad interna que podría convertirse en externa (preparación de herramientas y refacciones fuera de línea).",
    acciones: [
      {
        id: "b1",
        what: "Convertir preparación de herramental a actividad externa (carro SMED)",
        who: "Ana López",
        when: "08 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "b2",
        what: "Estandarizar secuencia de 2 personas con reparto de tareas",
        who: "Jorge Rivas",
        when: "14 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "b3",
        what: "Medir 10 cambios y validar estabilidad del nuevo estándar",
        who: "Ana López",
        when: "26 Ago 2026",
        status: "En progreso",
        done: false,
      },
    ],
    verificacion:
      "10 cambios medidos: promedio de 46 min (‑32%). Desviación estándar de 5.2 min, aceptable para estandarizar.",
    evidencias: ["video_smed_cambio_sku.mp4", "bitacora_10_cambios.xlsx"],
    estandarizacion: "",
    indicador: { etiqueta: "Tiempo de setup", antes: 68, despues: 46, unidad: "min" },
    serie: [
      { mes: "May", valor: 68 },
      { mes: "Jun", valor: 64 },
      { mes: "Jul", valor: 55 },
      { mes: "Ago", valor: 46 },
    ],
  },
  {
    id: "PDCA-2026-018",
    titulo: "Automatización del reporte diario de OEE",
    area: "Ingeniería de Software",
    fase: "Plan",
    actualizado: "25 Ago 2026",
    progreso: 15,
    problema:
      "El reporte diario de OEE se consolida manualmente en Excel y toma 90 minutos por turno, con 12% de registros con error de captura.",
    causaRaiz:
      "No existe integración entre el historian de planta y el tablero de indicadores; la captura es doble y sin validación.",
    acciones: [
      {
        id: "c1",
        what: "Mapear fuentes de datos y definir contrato de API con TI Planta",
        who: "Ana López",
        when: "29 Ago 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "c2",
        what: "Prototipar ETL nocturno con validaciones de rango",
        who: "Ana López",
        when: "10 Sep 2026",
        status: "Pendiente",
        done: false,
      },
      {
        id: "c3",
        what: "Publicar tablero piloto para 2 líneas",
        who: "Diego Fuentes",
        when: "24 Sep 2026",
        status: "Pendiente",
        done: false,
      },
    ],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "Horas de captura / semana", antes: 10.5, despues: 10.5, unidad: "h" },
    serie: [
      { mes: "May", valor: 10.5 },
      { mes: "Jun", valor: 10.5 },
      { mes: "Jul", valor: 10.5 },
      { mes: "Ago", valor: 10.5 },
    ],
  },
  {
    id: "PDCA-2026-007",
    titulo: "Estandarización de inspección de calidad en tapa corona",
    area: "Calidad",
    fase: "Act",
    actualizado: "18 Ago 2026",
    progreso: 96,
    problema:
      "Rechazos por torque de tapa fuera de especificación representaban 0.7% del lote embotellado.",
    causaRaiz:
      "Frecuencia de muestreo insuficiente y torquímetros sin calibración vigente en 2 de 5 estaciones.",
    acciones: [
      {
        id: "d1",
        what: "Reprogramar calibración trimestral de torquímetros",
        who: "Laura Méndez",
        when: "22 Jul 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "d2",
        what: "Aumentar muestreo a cada 30 min en arranque de turno",
        who: "Ana López",
        when: "01 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "d3",
        what: "Capacitar a inspectores en nuevo formato de registro",
        who: "Calidad L1-L3",
        when: "12 Ago 2026",
        status: "Completada",
        done: true,
      },
    ],
    verificacion:
      "Cuatro semanas consecutivas con rechazo de 0.15%. Auditoría interna de calidad sin hallazgos mayores.",
    evidencias: ["certificados_calibracion.pdf", "auditoria_interna_ago.pdf"],
    estandarizacion:
      "Actualizado el procedimiento PRO-CAL-014, incluido en inducción de nuevos inspectores y replicado a las 5 estaciones. Cierre firmado por Jefatura de Calidad.",
    indicador: { etiqueta: "Rechazo por torque", antes: 0.7, despues: 0.15, unidad: "%" },
    serie: [
      { mes: "May", valor: 0.72 },
      { mes: "Jun", valor: 0.6 },
      { mes: "Jul", valor: 0.31 },
      { mes: "Ago", valor: 0.15 },
    ],
  },
  {
    id: "PDCA-2026-021",
    titulo: "Reducción de retrabajos en despliegues del portal de becarios",
    area: "Ingeniería de Software",
    fase: "Do",
    actualizado: "23 Ago 2026",
    progreso: 38,
    problema:
      "El 30% de los despliegues del portal requieren hotfix dentro de las primeras 24 horas.",
    causaRaiz:
      "No hay ambiente de staging con datos representativos ni pruebas automatizadas de regresión en el flujo de captura.",
    acciones: [
      {
        id: "e1",
        what: "Provisionar staging con dataset anonimizado",
        who: "Diego Fuentes",
        when: "15 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "e2",
        what: "Cubrir con pruebas E2E los 5 flujos críticos",
        who: "Ana López",
        when: "02 Sep 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "e3",
        what: "Definir checklist de release y responsable de guardia",
        who: "Sofía Naranjo",
        when: "09 Sep 2026",
        status: "Pendiente",
        done: false,
      },
    ],
    verificacion: "",
    evidencias: ["cobertura_e2e_parcial.png"],
    estandarizacion: "",
    indicador: { etiqueta: "Despliegues con hotfix", antes: 30, despues: 30, unidad: "%" },
    serie: [
      { mes: "May", valor: 32 },
      { mes: "Jun", valor: 31 },
      { mes: "Jul", valor: 30 },
      { mes: "Ago", valor: 30 },
    ],
  },
];
