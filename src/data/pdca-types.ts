/**
 * Tipos e interfaces del dominio PDCA.
 * Este módulo contiene EXCLUSIVAMENTE definiciones de tipos TypeScript.
 * Soporta tanto camelCase como snake_case para máxima retrocompatibilidad.
 */

export type Phase = "Plan" | "Do" | "Check" | "Act";

export type ActionItem = {
  id: string;
  // Campos nuevos (tabla de Plan de Acción)
  tema?: string;
  causaRaiz?: string;
  causaRaiz2?: string;
  accion?: string;
  accion2?: string;
  comentarios?: string;
  herramientaSdca?: string;
  // Campos legacy (compatibilidad)
  what?: string;
  who?: string;
  when?: string;
  status: "Pendiente" | "En progreso" | "Completada";
  responsable?: string;
  fecha?: string;
  done?: boolean;
  // Campos de matriz de impacto integrados
  seguridad?: number | "";
  calidadHigiene?: number | "";
  costo?: number | "";
  medioAmbiente?: number | "";
  servicio?: number | "";
  resultados?: number | "";
  priorizar?: "SI" | "NO" | "";
  quickWin?: "SI" | "NO" | "";
  technologyRequired?: "SI" | "NO" | "";
};

export type PdcaComment = {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  text: string;
  timestamp: string;
  stepTitle?: string | undefined;
  step_title?: string | undefined;
};

export type PdcaHistoryEvent = {
  id: string;
  userId?: string;
  user_id?: string;
  userName?: string;
  user_name?: string;
  action: string;
  timestamp: string;
};

export type GopThemeItem = {
  id: number;
  tema: string;
  meses: boolean[];
  focus_items?: string;
  focusItems?: string;
  focusType?: string;
  status: "Not Started" | "In Progress" | "Complete" | "";
};

export type ImpactMatrixRow = {
  id: string;
  issue?: string;
  root_cause?: string;
  rootCause?: string;
  accion: string;
  seguridad: number | "";
  calidad_higiene?: number | "";
  calidadHigiene?: number | "";
  costo: number | "";
  medio_ambiente?: number | "";
  medioAmbiente?: number | "";
  servicio: number | "";
  priorizar: "SI" | "NO" | "";
};

export type IshikawaItem = {
  id: string;
  title?: string;
  effect: string;
  causes: Record<string, string[]>;
  prioritization: unknown[];
  prioritization_custom_criterion?: string;
  prioritizationCustomCriterion?: string;
  custom_labels?: Record<string, string>;
  customLabels?: Record<string, string>;
  images?: string[];
};

export type FiveWhysTableData = {
  id: string;
  title: string;
  rows: unknown[];
};

export type ParticipantesData = {
  locales_nombres?: string;
  localesNombres?: string;
  locales_roles?: string;
  localesRoles?: string;
  externos_nombres?: string;
  externosNombres?: string;
  externos_roles?: string;
  externosRoles?: string;
  fecha_reunion_inicial?: string;
  fechaReunionInicial?: string;
  reunion_rutina?: string;
  reunionRutina?: string;
};

export type DefinicionMeta = {
  kpi: string;
  pis: string;
  metodo_calculo?: string;
  metodoCalculo?: string;
  desde_valor?: string;
  desdeValor?: string;
  a_valor?: string;
  aValor?: string;
  hasta_fecha?: string;
  hastaFecha?: string;
  unidad_medida?: string;
  unidadMedida?: string;
  benchmark: string;
  mejora: "lower" | "higher" | "menor" | "mayor" | string;
  responsable: string;
  facilitador_lider?: string;
  facilitadorLider?: string;
};

export type VpoCheckpointItem = {
  id: string;
  pilar: string;
  checkpoint: string;
  evidencia: string;
  status: "YES" | "NO" | "N/A" | "";
};

export type ParetoItem = { id: number; area: string; gap: number };

export type FlavorCorrelationPoint = { id: number; x: number; y: number };

export type FlavorCorrelationChart = {
  id: string;
  title: string;
  series_name?: string;
  seriesName?: string;
  pearson: string;
  points: FlavorCorrelationPoint[];
  y_min?: number;
  yMin?: number;
  y_max?: number | "";
  yMax?: number | "";
};

export type Pdca = {
  id: string;
  titulo: string;
  area: string;
  fase: Phase;
  actualizado: string;
  progreso: number;
  problema: string;
  // Soporte dual causa_raiz / causaRaiz
  causa_raiz?: string;
  causaRaiz?: string;
  acciones: ActionItem[];
  verificacion: string;
  evidencias: string[];
  estandarizacion: string;
  indicador: { etiqueta: string; antes: number; despues: number; unidad: string };
  serie: { mes: string; valor: number }[];
  // Fecha finalización
  fecha_finalizacion?: string;
  fechaFinalizacion?: string;
  // KPI Tree
  kpi_nodes?: unknown[];
  kpiNodes?: unknown[];
  kpi_edges?: unknown[];
  kpiEdges?: unknown[];
  kpi_tree_image?: string;
  kpiTreeImage?: string;
  // Verificaciones
  completed_phases?: string[];
  completedPhases?: string[];
  completed_steps?: string[];
  completedSteps?: string[];
  // Ishikawa
  ishikawa_causes?: Record<string, string[]>;
  ishikawaCauses?: Record<string, string[]>;
  ishikawa_effect?: string;
  ishikawaEffect?: string;
  ishikawas?: IshikawaItem[];
  prioritization_causes?: unknown[];
  prioritizationCauses?: unknown[];
  // 5 Whys
  five_whys?: unknown[];
  fiveWhys?: unknown[];
  five_whys_tables?: FiveWhysTableData[];
  fiveWhysTables?: FiveWhysTableData[];
  // Target vs Actual
  target_vs_actual?: { mes: string; target: number; actual: number | null }[];
  targetVsActual?: { mes: string; target: number; actual: number | null }[];
  target_vs_actual_unit?: string;
  targetVsActualUnit?: string;
  target_vs_actual_title?: string;
  targetVsActualTitle?: string;
  // Pareto
  pareto_data_map?: Record<string, ParetoItem[]>;
  paretoDataMap?: Record<string, ParetoItem[]>;
  pareto_drill_downs?: string[];
  paretoDrillDowns?: string[];
  pareto_unit?: string;
  paretoUnit?: string;
  pareto_titles?: Record<string, string>;
  paretoTitles?: Record<string, string>;
  // Autor y Asignados
  autor?: string;
  autor_email?: string;
  autorEmail?: string;
  asignados?: { name: string; email: string }[];
  // Paso 1 y 2
  vpo_checkpoints?: VpoCheckpointItem[];
  vpoCheckpoints?: VpoCheckpointItem[];
  definicion_meta?: DefinicionMeta;
  definicionMeta?: DefinicionMeta;
  participantes?: ParticipantesData;
  equipo?: string[];
  impact_matrix?: ImpactMatrixRow[];
  impactMatrix?: ImpactMatrixRow[];
  // Flavors y GOP
  has_flavor_correlation?: boolean;
  hasFlavorCorrelation?: boolean;
  flavor_correlation_data?: FlavorCorrelationChart[];
  flavorCorrelationData?: FlavorCorrelationChart[];
  has_gop_themes?: boolean;
  hasGopThemes?: boolean;
  gop_themes_data?: GopThemeItem[];
  gopThemesData?: GopThemeItem[];
  process_mapping_image?: string | null;
  processMappingImage?: string | null;
  process_mapping_files?: string[];
  processMappingFiles?: string[];
  // Resultados finales
  kpi_final_result_data?: { mes: string; target: number; actual: number | null }[];
  kpiFinalResultData?: { mes: string; target: number; actual: number | null }[];
  kpi_final_result_unit?: string;
  kpiFinalResultUnit?: string;
  gemba_final_image?: string | null;
  gembaFinalImage?: string | null;
  gemba_final_images?: string[];
  gembaFinalImages?: string[];
  kpi_documents?: string[];
  kpiDocuments?: string[];
  // Comentarios e Historial
  comentarios?: PdcaComment[];
  historial?: PdcaHistoryEvent[];
  // Análisis Estadístico
  statisticalAnalysisFiles?: string[];
  statistical_analysis_files?: string[];
  itf_r2d2_evaluation?: ItfR2d2Evaluation;
  itfR2d2Evaluation?: ItfR2d2Evaluation;
};

export type ItfR2d2Evaluation = {
  rightPeople: { check: boolean; score: number; comment: string };
  rightProblem: { check: boolean; score: number; comment: string };
  dataWillSetYouFree: { check: boolean; score: number; comment: string };
  dontReinventTheWheel: { check: boolean; score: number; comment: string };
  noHippos: { check: boolean; score: number; comment: string };
  evaluators?: { name: string; timestamp: string }[];
};
