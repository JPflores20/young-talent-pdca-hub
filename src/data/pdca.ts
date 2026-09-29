/**
 * Barrel de compatibilidad Ã¢â‚¬â€ `src/data/pdca.ts`
 *
 * Re-exporta todo desde los mÃƒÂ³dulos refactorizados para que los
 * imports existentes (`from "@/data/pdca"`) sigan funcionando
 * sin cambios durante la migraciÃƒÂ³n progresiva.
 *
 * Una vez que todos los archivos hayan sido migrados para importar
 * directamente desde `pdca-types`, `pdca-defaults` o `pdca-seed`,
 * este archivo puede eliminarse.
 */

// Tipos
export type {
  Phase,
  ActionItem,
  PdcaComment,
  PdcaHistoryEvent,
  GopThemeItem,
  ImpactMatrixRow,
  IshikawaItem,
  FiveWhysTableData,
  ParticipantesData,
  DefinicionMeta,
  VpoCheckpointItem,
  ParetoItem,
  FlavorCorrelationPoint,
  FlavorCorrelationChart,
  Pdca,
  VozDelConsumidorItem,
  AnalisisRiesgoItem,
  ConclusionCausaRaizItem,
  RendimientoActualPiItem,
  PruebaEjecutadaItem,
  NuevoPerformanceItem,
  ColeccionDatosItem,
  TablaEstandarizacionItem,
  TablaEstandarizacionVpoItem,
  ResultadosFinalesData,
  EvidenciaSolucionItem,
  ItfR2d2Evaluation,
  ConclusionesKpiData,
  ConclusionesPiItem,
} from "./pdca-types";

// Constantes y valores por defecto
export {
  PHASES,
  phases,
  AREAS,
  type AreaOption,
  PHASE_STYLES,
  phaseStyles,
  DEFAULT_PARTICIPANTES,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
} from "./pdca-defaults";

// Datos de seed (sÃƒÂ³lo usar en servicios, no en componentes)
export { SEED_PDCAS as pdcas } from "./pdca-seed";
