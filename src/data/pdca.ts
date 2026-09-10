/**
 * Barrel de compatibilidad — `src/data/pdca.ts`
 *
 * Re-exporta todo desde los módulos refactorizados para que los
 * imports existentes (`from "@/data/pdca"`) sigan funcionando
 * sin cambios durante la migración progresiva.
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
} from "./pdca-types";

// Constantes y valores por defecto
export {
  PHASES,
  phases,
  PHASE_STYLES,
  phaseStyles,
  DEFAULT_PARTICIPANTES,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
} from "./pdca-defaults";

// Datos de seed (sólo usar en servicios, no en componentes)
export { SEED_PDCAS as pdcas } from "./pdca-seed";
