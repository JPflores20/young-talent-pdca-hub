/**
 * Barrel de compatibilidad — `src/services/pdca-service.ts`
 *
 * Re-exporta las funciones públicas de los módulos refactorizados
 * para que los imports existentes (`from "@/services/pdca-service"`)
 * sigan funcionando sin cambios durante la migración progresiva.
 */

// CRUD de Firestore
export {
  fetch_pdcas_from_firestore,
  subscribe_to_pdcas,
  save_pdca_to_firestore,
  delete_pdca_from_firestore,
  update_pdca_deadline,
} from "./pdca-firestore";

// Aliases con los nombres originales (camelCase) para backwards compat
export {
  fetch_pdcas_from_firestore as fetchPdcasFromFirestore,
  subscribe_to_pdcas as subscribeToPdcas,
  save_pdca_to_firestore as savePdcaToFirestore,
  delete_pdca_from_firestore as deletePdcaFromFirestore,
  update_pdca_deadline as updatePdcaDeadline,
} from "./pdca-firestore";
