/**
 * Constantes y valores por defecto del dominio PDCA.
 * Contiene: listas de fases, estilos de fase y valores DEFAULT_*
 * usados para inicializar formularios y documentos vacíos.
 */
import type { Phase, ParticipantesData, VpoCheckpointItem, ParetoItem } from "./pdca-types";

export const PHASES: Phase[] = ["Plan", "Do", "Check", "Act", "Evaluacion"];

/** @deprecated Usar PHASES. Mantenido por compatibilidad durante la migración. */
export const phases = PHASES;

export const PHASE_STYLES: Record<Phase, string> = {
  Plan: "bg-phase-plan/12 text-phase-plan border-phase-plan/30",
  Do: "bg-phase-do/25 text-brand-yellow-foreground border-phase-do/50",
  Check: "bg-phase-check/15 text-phase-check border-phase-check/35",
  Act: "bg-phase-act/15 text-phase-act border-phase-act/35",
  Evaluacion: "bg-primary/15 text-primary border-primary/35",
};

/** @deprecated Usar PHASE_STYLES. Mantenido por compatibilidad durante la migración. */
export const phaseStyles = PHASE_STYLES;

export const DEFAULT_PARTICIPANTES: ParticipantesData = {
  locales_nombres: "",
  locales_roles: "",
  externos_nombres: "",
  externos_roles: "",
  fecha_reunion_inicial: "",
  reunion_rutina: "",
};

export const DEFAULT_TARGET_VS_ACTUAL: {
  mes: string;
  target: number;
  actual: number | null;
}[] = [
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

export const DEFAULT_PARETO_DATA_MAP: Record<string, ParetoItem[]> = {
  root: [
    { id: 1, area: "Cocimientos", gap: 0.07 },
    { id: 2, area: "Cuartos frios", gap: 2.1 },
    { id: 3, area: "Envasado", gap: 0.65 },
  ],
};

export const DEFAULT_VPO_CHECKPOINTS: VpoCheckpointItem[] = [
  {
    id: "vpo-1",
    pilar: "Mapeo de procesos",
    checkpoint:
      "¿Existe un mapa de procesos de nivel 4 (nivel de tareas) para el proceso afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-2",
    pilar: "Creación & ejecución de estándares",
    checkpoint:
      "¿Se han establecido los estándares operativos (SOP) para todas las tareas críticas de nivel 4 definidas en el mapa de procesos del proceso afectado? ¿Se han establecido y ejecutado los mantenimientos planificados de alta calidad con la frecuencia adecuada para todos los equipos afectados?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-3",
    pilar: "Creación & ejecución de estándares",
    checkpoint:
      "¿Se han realizado OWDs en los SOPs de tareas críticas relacionadas con el proceso afectado?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-4",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿El producto/proceso afectado es monitoreado rutinariamente a través de checklists?",
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
    checkpoint:
      "¿Están las 5S totalmente integradas en el área del problema, y específicamente para las tareas de trabajo asociadas con el problema? ¿Se ha asignado el dueño de las 5S, se ha hecho un checklist diario y se han realizado auditorías mensualmente?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-7",
    pilar: "Indicadores de producto y proceso",
    checkpoint:
      "¿Existe un árbol de KPI para el problema KPI o KPI relacionado con el problema PI? ¿Es adecuado para mostrar todos los IP y SIC que impactan en el KPI?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-8",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿Existe un Indicador de Producto/Proceso (PI) para monitorear rutinariamente el Producto/Proceso afectado? ¿Incluye el PI un plan de reacción a seguir si el PI alcanza el límite amarillo/rojo?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-9",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿Se han utilizado los gráficos SIC para recopilar datos de todos los puntos de medición, y se han utilizado los datos para identificar/resolver la causa raíz del problema?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-10",
    pilar: "Solución de problemas",
    checkpoint:
      "¿Existen disparadores de 5-por qué y relatos de anomalías para tratar las desviaciones relacionadas con el producto/proceso afectado? ¿Se generan y completan los reportes de 5-por qué y relato de anomalías cuando se disparan los gatillos?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-11",
    pilar: "Proceso de revisión de rutina",
    checkpoint:
      "¿Se revisa rutinariamente el producto/proceso afectado en el MCRS de tu departamento?",
    evidencia: "",
    status: "",
  },
  {
    id: "vpo-12",
    pilar: "Descripción del negocio",
    checkpoint:
      "¿Existe un Acuerdo de Nivel de Servicio definido y rastreado para el Producto/Proceso afectado? (Consulte la Descripción de Negocio y Matriz de Criticidad)",
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
    checkpoint:
      "¿Se ha utilizado el benchmarking interno/externo para identificar las mejores prácticas existentes en relación con el producto o proceso afectado?",
    evidencia: "",
    status: "",
  },
];
