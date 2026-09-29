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
 * Verifica recursivamente si un valor sanitizado para Firestore aún contiene
 * arrays anidados dentro de elementos de array (lo cual Firestore no permite).
 * Emite advertencias de consola con la ruta exacta del campo problemático.
 */
function find_firestore_violations(val: any, path = "", in_arr = false): void {
  if (!val || typeof val !== "object") return;
  if (Array.isArray(val)) {
    if (in_arr) {
      console.error(`[pdca-firestore] VIOLATION: array inside array at path: ${path}`);
      return;
    }
    val.forEach((item: any, idx: number) => find_firestore_violations(item, `${path}[${idx}]`, true));
    return;
  }
  Object.entries(val).forEach(([k, v]) => find_firestore_violations(v, path ? `${path}.${k}` : k, in_arr));
}

/**
 * Serializa recursivamente cualquier array u objeto que se encuentre dentro de
 * un elemento de array para cumplir con las restricciones de Firestore.
 * También elimina valores `undefined` (via JSON.parse/stringify previo).
 *
 * Regla de Firestore: se puede tener arrays en el documento raíz, dentro de objetos
 * anidados, etc. — lo que NO se permite es un array dentro de un elemento de array.
 *
 * @param val  - El valor a sanitizar
 * @param depth_in_array - true cuando este valor es un descendiente directo de un elemento de array
 */
function firestore_safe(val: any, depth_in_array = false): any {
  if (val === undefined || val === null) return null;
  const t = typeof val;
  if (t === "number" || t === "boolean" || t === "string") return val;

  if (Array.isArray(val)) {
    if (depth_in_array) {
      // Arrays dentro de elementos de array → serializar a string JSON
      return JSON.stringify(val);
    }
    // Array de nivel raíz o dentro de objeto-en-raíz → procesar cada elemento
    return val.map((item: any) => firestore_safe(item, true));
  }

  if (t === "object") {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (depth_in_array) {
        // Propiedad de un objeto que está dentro de un array element
        // → Si el valor es array u objeto con arrays, serializar
        if (Array.isArray(v)) {
          res[k] = JSON.stringify(v);
        } else if (v && typeof v === "object" && contains_array(v)) {
          res[k] = JSON.stringify(v);
        } else {
          res[k] = firestore_safe(v, true);
        }
      } else {
        // Propiedad de objeto raíz (o anidado fuera de array)
        // Los valores array aquí son arrays de nivel raíz → procesar normalmente
        res[k] = firestore_safe(v, false);
      }
    }
    return res;
  }

  return val;
}

/** Retorna true si `obj` (un objeto plano) contiene algún array en cualquier nivel */
function contains_array(obj: object): boolean {
  for (const v of Object.values(obj)) {
    if (Array.isArray(v)) return true;
    if (v && typeof v === "object" && contains_array(v as object)) return true;
  }
  return false;
}

function deep_restore_value(val: any): any {
  if (!val || typeof val !== "object") {
    if (typeof val === "string" && (val.startsWith("[") || val.startsWith("{"))) {
      try {
        const parsed = JSON.parse(val);
        return deep_restore_value(parsed);
      } catch {
        return val;
      }
    }
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => deep_restore_value(item));
  }

  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(val)) {
    res[k] = deep_restore_value(v);
  }
  return res;
}

/**
 * Normaliza y sanitiza un PDCA antes de guardarlo en Firestore.
 * Firestore NO permite arreglos anidados dentro de elementos de arreglos.
 * Esta función serializa a JSON cualquier sub-array u objeto-con-arrays que esté
 * dentro de un elemento de array, y remueve valores `undefined`.
 */
export function prepare_pdca_for_firestore(pdca: Pdca): Record<string, unknown> {
  // JSON.parse/stringify elimina undefined y hace deep-clone
  const clean = JSON.parse(JSON.stringify(pdca)) as Record<string, any>;
  const sanitized = firestore_safe(clean, false);

  // WORKAROUND: Firestore arroja "Property array contains an invalid nested entity"
  // en evidenciasSolucion aunque no haya arreglos anidados. Esto suele ser un bug
  // del SDK de Firestore con base64 strings muy largos dentro de arreglos de objetos.
  // Lo forzamos a string para evitar la validación de arreglos de Firestore.
  if (Array.isArray(sanitized.evidenciasSolucion)) {
    sanitized.evidenciasSolucion = JSON.stringify(sanitized.evidenciasSolucion);
  }
  if (Array.isArray(sanitized.evidencias_solucion)) {
    sanitized.evidencias_solucion = JSON.stringify(sanitized.evidencias_solucion);
  }

  // Siempre verificar violations para diagnosticar el error en producción
  find_firestore_violations(sanitized);

  return sanitized;
}

/**
 * Restaura los objetos/arreglos serializados al leer un PDCA de Firestore.
 */
export function parse_pdca_from_firestore(data: Record<string, any>): Pdca {
  if (!data || typeof data !== "object") return data as Pdca;
  const restored = deep_restore_value(data);

  if (Array.isArray(restored.fiveWhysTables)) {
    restored.fiveWhysTables = restored.fiveWhysTables.map((t: any) => ({
      ...t,
      rows: typeof t.rows === "string" ? JSON.parse(t.rows) : t.rows || [],
    }));
  }
  if (Array.isArray(restored.five_whys_tables)) {
    restored.five_whys_tables = restored.five_whys_tables.map((t: any) => ({
      ...t,
      rows: typeof t.rows === "string" ? JSON.parse(t.rows) : t.rows || [],
    }));
  }

  if (Array.isArray(restored.ishikawas)) {
    restored.ishikawas = restored.ishikawas.map((ish: any) => ({
      ...ish,
      causes: typeof ish.causes === "string" ? JSON.parse(ish.causes) : ish.causes || {},
      prioritization: typeof ish.prioritization === "string" ? JSON.parse(ish.prioritization) : ish.prioritization || [],
      images: typeof ish.images === "string" ? JSON.parse(ish.images) : ish.images || [],
    }));
  }

  // Restore evidenciasSolucion (workaround)
  if (typeof restored.evidenciasSolucion === "string") {
    try { restored.evidenciasSolucion = JSON.parse(restored.evidenciasSolucion); } catch (e) { restored.evidenciasSolucion = []; }
  }
  if (typeof restored.evidencias_solucion === "string") {
    try { restored.evidencias_solucion = JSON.parse(restored.evidencias_solucion); } catch (e) { restored.evidencias_solucion = []; }
  }

  return restored as Pdca;
}

/**
 * Extrae los documentos PDCA (excluyendo _config) de un snapshot de Firestore.
 */
function extract_pdcas_from_snapshot(snapshot_docs: { id: string; data: () => unknown }[]): Pdca[] {
  return snapshot_docs
    .filter((doc_snap) => doc_snap.id !== CONFIG_DOC_ID)
    .map((doc_snap) => {
      const raw = doc_snap.data() as Record<string, any>;
      const pdca = parse_pdca_from_firestore(raw);
      set_pdca_snapshot(pdca.id, pdca);
      return pdca;
    });
}

let is_seeding = false;
let has_attempted_seed = false;

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
      if (!is_seeding && !has_attempted_seed) {
        is_seeding = true;
        has_attempted_seed = true;
        try {
          await seed_initial_pdcas();
        } catch (e) {
          console.error("[pdca-firestore] Error seeding:", e);
        } finally {
          is_seeding = false;
        }
      }
      return (await getDocs(fetch_query)).docs
        .filter((d) => d.id !== CONFIG_DOC_ID)
        .map((d) => parse_pdca_from_firestore(d.data() as Record<string, any>));
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
        if (!is_seeding && !has_attempted_seed) {
          is_seeding = true;
          has_attempted_seed = true;
          try {
            await seed_initial_pdcas();
          } catch (e) {
            console.error("[pdca-firestore] Error seeding:", e);
          } finally {
            is_seeding = false;
          }
        }
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
    const clean_pdca = prepare_pdca_for_firestore(pdca);

    const original_snapshot = get_pdca_snapshot(pdca.id);
    if (original_snapshot) {
      const original_pdca = prepare_pdca_for_firestore(JSON.parse(original_snapshot));
      const changed_fields = get_shallow_diff(original_pdca, clean_pdca);

      if (Object.keys(changed_fields).length === 0) {
        return;
      }

      console.log("[pdca-firestore] updateDoc changed_fields keys:", Object.keys(changed_fields));
      console.log("[pdca-firestore] EXACT changed_fields JSON:", JSON.stringify(changed_fields));
      
      await updateDoc(doc_ref, changed_fields);
    } else {
      console.log("[pdca-firestore] setDoc full payload keys:", Object.keys(clean_pdca));
      console.log("[pdca-firestore] EXACT clean_pdca JSON:", JSON.stringify(clean_pdca));
      await setDoc(doc_ref, clean_pdca, { merge: true });
    }

    set_pdca_snapshot(pdca.id, parse_pdca_from_firestore(clean_pdca));
  } catch (primary_error: any) {
    console.error("[pdca-firestore] Error al guardar PDCA:", primary_error);
    console.error("[pdca-firestore] Error details:", {
      message: primary_error?.message,
      code: primary_error?.code,
      details: primary_error?.details,
      serverResponse: primary_error?.serverResponse,
    });

    try {
      const doc_ref = doc(db, PDCA_COLLECTION, pdca.id);
      const clean_pdca = prepare_pdca_for_firestore(pdca);

      // Log the full JSON of top-level arrays to identify the violating field
      for (const [key, val] of Object.entries(clean_pdca)) {
        if (Array.isArray(val)) {
          try {
            // Deep-scan for nested arrays at all depths
            const scan = (arr: any[], path: string) => {
              arr.forEach((item: any, idx: number) => {
                if (Array.isArray(item)) {
                  console.error(`[pdca-firestore] ❌ VIOLATION: ${path}[${idx}] is an array inside an array`);
                } else if (item && typeof item === "object") {
                  Object.entries(item).forEach(([k, v]) => {
                    if (Array.isArray(v)) {
                      console.error(`[pdca-firestore] ❌ VIOLATION: ${path}[${idx}].${k} is an array inside an array element`);
                    } else if (v && typeof v === "object") {
                      Object.entries(v as object).forEach(([k2, v2]) => {
                        if (Array.isArray(v2)) {
                          console.error(`[pdca-firestore] ❌ VIOLATION: ${path}[${idx}].${k}.${k2} is an array (3 levels deep)`);
                        }
                      });
                    }
                  });
                }
              });
            };
            scan(val as any[], key);
          } catch (_) {}
        }
      }

      console.log("[pdca-firestore] Attempting fallback setDoc with clean_pdca JSON snippet...");
      await setDoc(doc_ref, clean_pdca, { merge: true });
      set_pdca_snapshot(pdca.id, parse_pdca_from_firestore(clean_pdca));
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
