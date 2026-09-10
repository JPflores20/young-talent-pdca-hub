/**
 * Servicio CRUD de Firestore para documentos PDCA.
 *
 * Responsabilidad única: operaciones de lectura, escritura,
 * eliminación y suscripción en tiempo real de PDCAs.
 *
 * Aplica actualizaciones granulares (sólo los campos que cambiaron)
 * usando el módulo de caché para minimizar escrituras a Firestore.
 */
import {
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  query,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Pdca } from "@/data/pdca-types";
import {
  set_pdca_snapshot,
  get_pdca_snapshot,
  remove_pdca_snapshot,
  patch_pdca_snapshot,
  get_shallow_diff,
} from "./pdca-cache";
import {
  PDCA_COLLECTION,
  CONFIG_DOC_ID,
  seed_initial_pdcas,
  is_collection_seeded,
  get_pdca_collection_ref,
} from "./pdca-seed-service";

/**
 * Extrae los documentos PDCA (excluyendo _config) de un snapshot de Firestore.
 */
function extract_pdcas_from_snapshot(snapshot_docs: { id: string; data: () => unknown }[]): Pdca[] {
  return snapshot_docs
    .filter((doc_snap) => doc_snap.id !== CONFIG_DOC_ID)
    .map((doc_snap) => {
      const pdca = doc_snap.data() as Pdca;
      set_pdca_snapshot(pdca.id, pdca);
      return pdca;
    });
}

/**
 * Obtiene todos los PDCAs de Firestore en una sola lectura.
 * Si la colección no ha sido sembrada, la siembra primero.
 */
export async function fetch_pdcas_from_firestore(max_limit?: number): Promise<Pdca[]> {
  try {
    const collection_ref = get_pdca_collection_ref();
    const fetch_query = max_limit ? query(collection_ref, limit(max_limit)) : collection_ref;

    const snapshot = await getDocs(fetch_query);
    const docs = snapshot.docs.map((d) => ({ id: d.id, data: d.data }));

    if (!is_collection_seeded(snapshot.docs)) {
      await seed_initial_pdcas();
      return (await getDocs(fetch_query)).docs
        .filter((d) => d.id !== CONFIG_DOC_ID)
        .map((d) => d.data() as Pdca);
    }

    return extract_pdcas_from_snapshot(snapshot.docs);
  } catch (error) {
    console.error("[pdca-firestore] Error al obtener PDCAs:", error);
    return [];
  }
}

/**
 * Abre un listener en tiempo real sobre la colección PDCA.
 * Retorna la función para cancelar la suscripción (unsubscribe).
 */
export function subscribe_to_pdcas(
  on_update: (pdcas: Pdca[]) => void,
  max_limit?: number,
): () => void {
  const collection_ref = get_pdca_collection_ref();
  const subscribe_query = max_limit ? query(collection_ref, limit(max_limit)) : collection_ref;

  return onSnapshot(
    subscribe_query,
    async (snapshot) => {
      if (!is_collection_seeded(snapshot.docs)) {
        await seed_initial_pdcas();
        on_update(extract_pdcas_from_snapshot(snapshot.docs));
        return;
      }

      on_update(extract_pdcas_from_snapshot(snapshot.docs));
    },
    (error) => {
      console.error("[pdca-firestore] Error en listener en tiempo real:", error);
    },
  );
}

/**
 * Guarda un PDCA en Firestore usando actualización granular cuando es posible.
 * Si no hay snapshot previo en caché, hace un setDoc completo con merge.
 */
export async function save_pdca_to_firestore(pdca: Pdca): Promise<void> {
  try {
    const doc_ref = doc(db, PDCA_COLLECTION, pdca.id);
    const clean_pdca = JSON.parse(JSON.stringify(pdca)) as Record<string, unknown>;

    const original_snapshot = get_pdca_snapshot(pdca.id);
    if (original_snapshot) {
      const original_pdca = JSON.parse(original_snapshot) as Record<string, unknown>;
      const changed_fields = get_shallow_diff(original_pdca, clean_pdca);

      if (Object.keys(changed_fields).length === 0) {
        return;
      }

      await updateDoc(doc_ref, changed_fields);
    } else {
      await setDoc(doc_ref, clean_pdca, { merge: true });
    }

    set_pdca_snapshot(pdca.id, clean_pdca);
  } catch (primary_error) {
    console.error("[pdca-firestore] Error al guardar PDCA:", primary_error);

    try {
      const doc_ref = doc(db, PDCA_COLLECTION, pdca.id);
      const clean_pdca = JSON.parse(JSON.stringify(pdca));
      await setDoc(doc_ref, clean_pdca, { merge: true });
      set_pdca_snapshot(pdca.id, clean_pdca);
    } catch (fallback_error) {
      console.error("[pdca-firestore] Error en fallback de guardado:", fallback_error);
      throw fallback_error;
    }
  }
}

/**
 * Elimina un PDCA de Firestore y limpia su snapshot en caché.
 */
export async function delete_pdca_from_firestore(pdca_id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PDCA_COLLECTION, pdca_id));
    remove_pdca_snapshot(pdca_id);
  } catch (error) {
    console.error("[pdca-firestore] Error al eliminar PDCA:", error);
  }
}

/**
 * Actualiza únicamente el campo `fechaFinalizacion` de un PDCA.
 * Usado desde la vista de lista sin necesidad de abrir el diálogo completo.
 */
export async function update_pdca_deadline(
  pdca_id: string,
  fecha_finalizacion: string | null,
): Promise<void> {
  try {
    const doc_ref = doc(db, PDCA_COLLECTION, pdca_id);
    const deadline_value = fecha_finalizacion ?? "";
    await updateDoc(doc_ref, { fechaFinalizacion: deadline_value });
    patch_pdca_snapshot(pdca_id, { fechaFinalizacion: deadline_value });
  } catch (error) {
    console.error("[pdca-firestore] Error al actualizar fecha límite:", error);
  }
}
