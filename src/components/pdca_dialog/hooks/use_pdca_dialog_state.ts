import { useState, useCallback } from "react";
import type {
  Phase,
  ActionItem,
  Pdca,
  ParetoItem,
  VpoCheckpointItem,
  DefinicionMeta,
  ParticipantesData,
  ImpactMatrixRow,
  FiveWhysTableData,
  IshikawaItem,
  PdcaComment,
  PdcaHistoryEvent,
} from "@/data/pdca";
import {
  DEFAULT_VPO_CHECKPOINTS,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_PARTICIPANTES,
} from "@/data/pdca";
import { DEFAULT_DEFINICION_META } from "@/components/pdca-goal-definition";

import { parse_date_string } from "../utils/date_helpers";

export const use_pdca_dialog_state = (
  initial_pdca: Pdca,
  current_user: { name?: string; email?: string } | null,
) => {
  const [active_tab, set_active_tab] = useState<Phase>("Plan");
  const [title_value, set_title_value] = useState<string>(initial_pdca.titulo || "");
  const [area_value, set_area_value] = useState<string>(initial_pdca.area || "cocimientos");
  const [problem_value, set_problem_value] = useState<string>(initial_pdca.problema || "");
  const [root_cause_value, set_root_cause_value] = useState<string>(initial_pdca.causaRaiz || "");
  const [action_items, set_action_items] = useState<ActionItem[]>(initial_pdca.acciones || []);
  const [comments_list, set_comments_list] = useState<PdcaComment[]>(
    initial_pdca.comentarios || [],
  );
  const [history_events, set_history_events] = useState<PdcaHistoryEvent[]>(
    initial_pdca.historial || [],
  );
  const [bottom_tab, set_bottom_tab] = useState<"comments" | "history">("comments");

  const [deadline_date, set_deadline_date] = useState<Date | undefined>(() =>
    parse_date_string(initial_pdca.fechaFinalizacion),
  );
  const [author_name, set_author_name] = useState<string>(
    initial_pdca.autor || current_user?.name || "Usuario",
  );
  const [author_email, set_author_email] = useState<string>(
    initial_pdca.autorEmail || current_user?.email || "",
  );
  const [assigned_users, set_assigned_users] = useState<{ name: string; email: string }[]>(
    initial_pdca.asignados || [],
  );

  const [vpo_checkpoints, set_vpo_checkpoints] = useState<VpoCheckpointItem[]>(
    initial_pdca.vpoCheckpoints || DEFAULT_VPO_CHECKPOINTS,
  );
  const [pareto_drill_downs, set_pareto_drill_downs] = useState<string[]>(
    initial_pdca.paretoDrillDowns || [],
  );
  const [pareto_data_map, set_pareto_data_map] = useState<Record<string, ParetoItem[]>>(
    initial_pdca.paretoDataMap || DEFAULT_PARETO_DATA_MAP,
  );
  const [pareto_unit, set_pareto_unit] = useState<string>(initial_pdca.paretoUnit || "");
  const [pareto_titles, set_pareto_titles] = useState<Record<string, string>>(
    initial_pdca.paretoTitles || {},
  );

  const [target_vs_actual, set_target_vs_actual] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(initial_pdca.targetVsActual || DEFAULT_TARGET_VS_ACTUAL);
  const [target_vs_actual_unit, set_target_vs_actual_unit] = useState<string>(
    initial_pdca.targetVsActualUnit || "",
  );
  const [target_vs_actual_title, set_target_vs_actual_title] = useState<string>(
    initial_pdca.targetVsActualTitle || "CURRENT TIME SERIES",
  );

  const [kpi_final_result_data, set_kpi_final_result_data] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(initial_pdca.kpiFinalResultData || DEFAULT_TARGET_VS_ACTUAL);
  const [kpi_final_result_unit, set_kpi_final_result_unit] = useState<string>(
    initial_pdca.kpiFinalResultUnit || "",
  );
  const [gemba_final_image, set_gemba_final_image] = useState<string | null>(
    initial_pdca.gembaFinalImage || null,
  );
  const [gemba_final_images, set_gemba_final_images] = useState<string[]>(
    initial_pdca.gembaFinalImages ||
      (initial_pdca.gembaFinalImage ? [initial_pdca.gembaFinalImage] : []),
  );
  const [evidence_files, set_evidence_files] = useState<string[]>(initial_pdca.evidencias || []);
  const [kpi_document_files, set_kpi_document_files] = useState<string[]>(
    initial_pdca.kpiDocuments || [],
  );

  const [has_flavor_correlation, set_has_flavor_correlation] = useState<boolean>(
    initial_pdca.hasFlavorCorrelation || false,
  );
  const [flavor_correlation_data, set_flavor_correlation_data] = useState<any>(
    initial_pdca.flavorCorrelationData || null,
  );

  const [has_gop_themes, set_has_gop_themes] = useState<boolean>(
    initial_pdca.hasGopThemes || false,
  );
  const [gop_themes_data, set_gop_themes_data] = useState<any[]>(initial_pdca.gopThemesData || []);
  const [process_mapping_files, set_process_mapping_files] = useState<string[]>(
    initial_pdca.processMappingFiles ||
      (initial_pdca.processMappingImage ? [initial_pdca.processMappingImage] : []),
  );

  const [five_whys_tables, set_five_whys_tables] = useState<FiveWhysTableData[]>(() => {
    if (initial_pdca.fiveWhysTables && initial_pdca.fiveWhysTables.length > 0)
      return initial_pdca.fiveWhysTables;
    return [
      {
        id: "fivewhys-1",
        title: "MÉTODO",
        rows: [
          {
            id: Date.now(),
            q1: "",
            q2: "",
            q3: "",
            q4: "",
            q5: "",
            w1: "",
            w2: "",
            w3: "",
            w4: "",
            w5: "",
            accion: "",
          },
        ],
      },
    ];
  });

  const [impact_matrix, set_impact_matrix] = useState<ImpactMatrixRow[]>(
    initial_pdca.impactMatrix || [],
  );

  const [ishikawas, set_ishikawas] = useState<IshikawaItem[]>(() => {
    if (initial_pdca.ishikawas && initial_pdca.ishikawas.length > 0) return initial_pdca.ishikawas;
    return [
      {
        id: "ishikawa-1",
        effect: initial_pdca.ishikawaEffect || "Efecto / Problema",
        causes: initial_pdca.ishikawaCauses || {
          machine: [],
          method: [],
          material: [],
          manpower: [],
          measurement: [],
          environment: [],
        },
        prioritization: initial_pdca.prioritizationCauses || [],
      },
    ];
  });

  const [kpi_nodes, set_kpi_nodes] = useState<any[]>(initial_pdca.kpiNodes || []);
  const [kpi_edges, set_kpi_edges] = useState<any[]>(initial_pdca.kpiEdges || []);
  const handle_kpi_change = useCallback((nodes: any[], edges: any[]) => {
    set_kpi_nodes(nodes);
    set_kpi_edges(edges);
  }, []);

  const [completed_phases, set_completed_phases] = useState<Set<string>>(
    new Set(initial_pdca.completedPhases || []),
  );
  const [completed_steps, set_completed_steps] = useState<Set<string>>(
    new Set(initial_pdca.completedSteps || []),
  );
  const [definition_goal, set_definition_goal] = useState<DefinicionMeta>(
    initial_pdca.definicionMeta || DEFAULT_DEFINICION_META,
  );
  const [team_members, set_team_members] = useState<string[]>(initial_pdca.equipo || []);
  const [participants_data, set_participants_data] = useState<ParticipantesData>(
    initial_pdca.participantes || DEFAULT_PARTICIPANTES,
  );
  const [statistical_analysis_files, set_statistical_analysis_files] = useState<string[]>(
    initial_pdca.statisticalAnalysisFiles || [],
  );

  return {
    active_tab,
    set_active_tab,
    title_value,
    set_title_value,
    area_value,
    set_area_value,
    problem_value,
    set_problem_value,
    root_cause_value,
    set_root_cause_value,
    action_items,
    set_action_items,
    comments_list,
    set_comments_list,
    history_events,
    set_history_events,
    bottom_tab,
    set_bottom_tab,
    deadline_date,
    set_deadline_date,
    author_name,
    set_author_name,
    author_email,
    set_author_email,
    assigned_users,
    set_assigned_users,
    vpo_checkpoints,
    set_vpo_checkpoints,
    pareto_drill_downs,
    set_pareto_drill_downs,
    pareto_data_map,
    set_pareto_data_map,
    pareto_unit,
    set_pareto_unit,
    pareto_titles,
    set_pareto_titles,
    target_vs_actual,
    set_target_vs_actual,
    target_vs_actual_unit,
    set_target_vs_actual_unit,
    target_vs_actual_title,
    set_target_vs_actual_title,
    kpi_final_result_data,
    set_kpi_final_result_data,
    kpi_final_result_unit,
    set_kpi_final_result_unit,
    gemba_final_image,
    set_gemba_final_image,
    gemba_final_images,
    set_gemba_final_images,
    evidence_files,
    set_evidence_files,
    kpi_document_files,
    set_kpi_document_files,
    has_flavor_correlation,
    set_has_flavor_correlation,
    flavor_correlation_data,
    set_flavor_correlation_data,
    has_gop_themes,
    set_has_gop_themes,
    gop_themes_data,
    set_gop_themes_data,
    process_mapping_files,
    set_process_mapping_files,
    five_whys_tables,
    set_five_whys_tables,
    impact_matrix,
    set_impact_matrix,
    ishikawas,
    set_ishikawas,
    kpi_nodes,
    kpi_edges,
    handle_kpi_change,
    completed_phases,
    set_completed_phases,
    completed_steps,
    set_completed_steps,
    definition_goal,
    set_definition_goal,
    team_members,
    set_team_members,
    participants_data,
    set_participants_data,
    statistical_analysis_files,
    set_statistical_analysis_files,
  };
};
