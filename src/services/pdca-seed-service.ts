/**
 * Servicio de seeding inicial de Firestore.
 *
 * Responsabilidad única: detectar si la colección PDCA está vacía
 * y poblarla con los datos de seed la primera vez.
 *
 * Separado del servicio de CRUD para mantener el principio de
 * responsabilidad única y facilitar las pruebas.
 */
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SEED_PDCAS } from "@/data/pdca-seed";
import { set_pdca_snapshot } from "./pdca-cache";

export const PDCA_COLLECTION = "pdcas";
export const CONFIG_DOC_ID = "_config";

/**
 * Siembra la colección con los PDCAs de ejemplo y marca el flag `isSeeded`.
 * Sólo debe llamarse cuando `isSeeded` es false.
 */
export async function seed_initial_pdcas(): Promise<void> {
  for (const pdca of SEED_PDCAS) {
    await setDoc(doc(db, PDCA_COLLECTION, pdca.id), pdca);
    set_pdca_snapshot(pdca.id, pdca);
  }

  await setDoc(doc(db, PDCA_COLLECTION, CONFIG_DOC_ID), {
    isSeeded: true,
  });

  console.info(`[pdca-seed-service] Seeding completado: ${SEED_PDCAS.length} PDCAs insertados.`);
}

/**
 * Verifica si el documento _config indica que la colección ya fue sembrada.
 */
export function is_collection_seeded(
  snapshot_docs: { id: string; data: () => Record<string, unknown> }[],
): boolean {
  const config_doc = snapshot_docs.find((d) => d.id === CONFIG_DOC_ID);
  return config_doc?.data()?.["isSeeded"] === true;
}

/**
 * Retorna la referencia a la colección principal de PDCAs.
 */
export function get_pdca_collection_ref() {
  return collection(db, PDCA_COLLECTION);
}
