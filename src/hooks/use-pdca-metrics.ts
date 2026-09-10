/**
 * Hook para calcular las métricas agregadas de los PDCAs de un usuario.
 */
import { useMemo } from "react";
import { startOfDay, isBefore, isValid, parseISO } from "date-fns";
import type { Pdca } from "@/data/pdca-types";

export interface PdcaMetrics {
  activos: number;
  cerrados: number;
  bloque_frio: number;
  cocimientos: number;
  vencidos: number;
  a_tiempo: number;
}

export function use_pdca_metrics(pdcas: Pdca[]): PdcaMetrics {
  return useMemo(() => {
    let activos = 0;
    let cerrados = 0;
    let bloque_frio = 0;
    let cocimientos = 0;
    let vencidos = 0;
    let a_tiempo = 0;

    const today = startOfDay(new Date());

    for (const p of pdcas) {
      const is_closed = p.fase === "Act" && p.progreso === 100;

      if (is_closed) {
        cerrados++;
      } else {
        activos++;
        if (p.fecha_finalizacion) {
          try {
            // Soporte para fechas yyyy-MM-dd
            const parts = p.fecha_finalizacion.split("-");
            if (parts.length === 3) {
              const deadline = new Date(
                parseInt(parts[0]),
                parseInt(parts[1]) - 1,
                parseInt(parts[2]),
              );
              if (isValid(deadline)) {
                if (isBefore(deadline, today)) {
                  vencidos++;
                } else {
                  a_tiempo++;
                }
              }
            } else {
              // Fallback para otros formatos
              const parsed = parseISO(p.fecha_finalizacion);
              if (isValid(parsed)) {
                if (isBefore(parsed, today)) {
                  vencidos++;
                } else {
                  a_tiempo++;
                }
              }
            }
          } catch (e) {
            // Ignorar errores de parseo silenciosamente
          }
        }
      }

      const area_lower = (p.area || "").toLowerCase();
      if (area_lower.includes("frio") || area_lower.includes("frío")) {
        bloque_frio++;
      } else if (area_lower.includes("cocimiento")) {
        cocimientos++;
      }
    }

    return {
      activos,
      cerrados,
      bloque_frio,
      cocimientos,
      vencidos,
      a_tiempo,
    };
  }, [pdcas]);
}
