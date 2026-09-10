/**
 * Caché en memoria para documentos PDCA.
 *
 * Responsabilidad única: almacenar snapshots serializados de PDCAs
 * y calcular diffs granulares para minimizar escrituras a Firestore.
 *
 * No tiene dependencias de Firebase ni de React.
 */

/** Mapa de id → JSON serializado del último estado conocido del PDCA. */
const pdca_snapshot_cache = new Map<string, string>();

/**
 * Guarda o actualiza el snapshot de un PDCA en la caché.
 */
export function set_pdca_snapshot(pdca_id: string, pdca_data: object): void {
  pdca_snapshot_cache.set(pdca_id, JSON.stringify(pdca_data));
}

/**
 * Recupera el snapshot serializado de un PDCA, si existe.
 */
export function get_pdca_snapshot(pdca_id: string): string | undefined {
  return pdca_snapshot_cache.get(pdca_id);
}

/**
 * Elimina el snapshot de un PDCA de la caché.
 */
export function remove_pdca_snapshot(pdca_id: string): void {
  pdca_snapshot_cache.delete(pdca_id);
}

/**
 * Aplica un parche parcial al snapshot en caché de un PDCA.
 * Útil para actualizar un solo campo sin re-serializar el objeto completo.
 */
export function patch_pdca_snapshot(
  pdca_id: string,
  partial_update: Record<string, unknown>,
): void {
  const existing_snapshot = pdca_snapshot_cache.get(pdca_id);
  if (!existing_snapshot) return;

  const parsed = JSON.parse(existing_snapshot) as Record<string, unknown>;
  const updated = { ...parsed, ...partial_update };
  pdca_snapshot_cache.set(pdca_id, JSON.stringify(updated));
}

/**
 * Compara dos valores en profundidad.
 * Retorna `true` si son estructuralmente equivalentes.
 */
export function is_deep_equal(value_a: unknown, value_b: unknown): boolean {
  if (value_a === value_b) return true;

  if (
    typeof value_a !== "object" ||
    typeof value_b !== "object" ||
    value_a == null ||
    value_b == null
  ) {
    return false;
  }

  if (Array.isArray(value_a) !== Array.isArray(value_b)) return false;

  const keys_a = Object.keys(value_a as object);
  const keys_b = Object.keys(value_b as object);

  if (keys_a.length !== keys_b.length) return false;

  return keys_a.every((key) =>
    is_deep_equal(
      (value_a as Record<string, unknown>)[key],
      (value_b as Record<string, unknown>)[key],
    ),
  );
}

/**
 * Calcula las diferencias superficiales entre dos objetos.
 * Retorna un objeto con sólo los campos que cambiaron en `current`.
 */
export function get_shallow_diff(
  original: Record<string, unknown>,
  current: Record<string, unknown>,
): Record<string, unknown> {
  const diff: Record<string, unknown> = {};

  for (const key in current) {
    if (!is_deep_equal(original[key], current[key])) {
      diff[key] = current[key];
    }
  }

  return diff;
}
