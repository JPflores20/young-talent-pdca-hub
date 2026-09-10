/**
 * Factory y hook para manejar el estado borrador de un PDCA.
 */
import { useState, useEffect } from "react";
import type { Pdca } from "@/data/pdca-types";
import {
  DEFAULT_PARTICIPANTES,
  DEFAULT_VPO_CHECKPOINTS,
  DEFAULT_TARGET_VS_ACTUAL,
} from "@/data/pdca-defaults";

/**
 * Genera un objeto PDCA vacío (borrador) con todos sus valores por defecto.
 */
export function get_empty_draft(current_user?: { name?: string; email?: string }): Pdca {
  return {
    id: `PDCA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`,
    titulo: "",
    area: "",
    fase: "Plan",
    actualizado: "Recién creado",
    progreso: 0,
    problema: "",
    causa_raiz: "",
    acciones: [],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: { etiqueta: "", antes: 0, despues: 0, unidad: "" },
    serie: [],
    fecha_finalizacion: "",
    kpi_nodes: [],
    kpi_edges: [],
    completed_phases: [],
    completed_steps: [],
    ishikawa_causes: {
      "Mano de Obra": [],
      "Medio Ambiente": [],
      Maquinaria: [],
      Método: [],
      Materiales: [],
      Medida: [],
    },
    ishikawa_effect: "",
    target_vs_actual: [...DEFAULT_TARGET_VS_ACTUAL],
    target_vs_actual_unit: "",
    pareto_data_map: {},
    pareto_drill_downs: [],
    pareto_unit: "",
    autor: current_user?.name || "Sin autor",
    autor_email: current_user?.email || "",
    asignados: [],
    vpo_checkpoints: [...DEFAULT_VPO_CHECKPOINTS],
    definicion_meta: {
      kpi: "",
      pis: "",
      metodo_calculo: "",
      desde_valor: "",
      a_valor: "",
      hasta_fecha: "",
      unidad_medida: "",
      benchmark: "",
      mejora: "lower",
      responsable: "",
      facilitador_lider: "",
    },
    participantes: { ...DEFAULT_PARTICIPANTES },
    equipo: [],
    prioritization_causes: [],
    ishikawas: [],
    five_whys_tables: [],
    impact_matrix: [],
    has_flavor_correlation: false,
    flavor_correlation_data: [],
    has_gop_themes: false,
    gop_themes_data: [],
    comentarios: [],
    historial: [],
  };
}

/**
 * Hook para mantener el estado borrador del PDCA en el diálogo.
 */
export function use_pdca_draft(
  initial_pdca: Pdca | null,
  current_user?: { name?: string; email?: string },
) {
  const [draft, set_draft] = useState<Pdca>(
    initial_pdca ? { ...initial_pdca } : get_empty_draft(current_user),
  );

  // Sync when initial prop changes (e.g. clicking different items)
  useEffect(() => {
    if (initial_pdca) {
      set_draft({ ...initial_pdca });
    } else {
      set_draft(get_empty_draft(current_user));
    }
    // No dependemos de current_user para no reiniciar el draft
    // si cambia, solo cuando cambia el PDCA activo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial_pdca?.id]);

  const update_draft = (updates: Partial<Pdca>) => {
    set_draft((prev) => ({ ...prev, ...updates }));
  };

  return { draft, set_draft, update_draft };
}
