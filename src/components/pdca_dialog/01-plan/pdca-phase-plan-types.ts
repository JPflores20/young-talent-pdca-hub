import type {
  DefinicionMeta,
  ParticipantesData,
  VpoCheckpointItem,
  ParetoItem,
  IshikawaItem,
  FiveWhysTableData,
  GopThemeItem,
  RendimientoActualPiItem,
} from "@/data/pdca";

export interface PhasePlanProps {
  // Meta fields
  title_value: string;
  on_title_change: (v: string) => void;
  area_value: string;
  on_area_change: (v: string) => void;
  deadline_date?: Date;
  on_deadline_change: (d?: Date) => void;
  author_name: string;
  author_email: string;
  on_author_change: (email: string, name: string) => void;
  assigned_users: { name: string; email: string }[];
  on_toggle_assigned_user: (u: { name: string; email: string }) => void;
  available_users: { name: string; email: string }[];
  is_admin_user: boolean;
  // Equipo / integrantes
  team_members_list: string[];
  on_team_members_change: (members: string[]) => void;
  // Descripción del problema
  problem_description: string;
  on_problem_change: (v: string) => void;
  // Definición de la meta
  goal_definition: DefinicionMeta;
  on_goal_definition_change: (data: DefinicionMeta) => void;
  participants_info: ParticipantesData;
  on_participants_info_change: (data: ParticipantesData) => void;
  // VPO
  vpo_checkpoints: VpoCheckpointItem[];
  on_vpo_checkpoints_change: (checkpoints: VpoCheckpointItem[]) => void;
  completed_steps: Set<string>;
  na_steps?: Set<string>;
  on_toggle_step: (step_id: string) => void;
  on_toggle_na?: (step_id: string) => void;
  is_editable: boolean;
  
  // Nuevos props migrados
  process_mapping_files?: string[] | undefined;
  sipoc_map_files?: string[] | undefined;
  on_sipoc_map_files_change?: ((files: string[]) => void) | undefined;
  on_process_mapping_files_change?: ((files: string[]) => void) | undefined;
  baseline_image?: string | undefined;
  on_baseline_image_change?: ((img: string | undefined) => void) | undefined;
  coleccion_datos?: any[] | undefined;
  on_coleccion_datos_change?: ((data: any[]) => void) | undefined;
  pareto_drill_downs?: string[] | undefined;
  on_pareto_drill_downs_change?: ((drills: string[]) => void) | undefined;
  pareto_data_map?: Record<string, ParetoItem[]> | undefined;
  on_pareto_data_map_change?: ((map: Record<string, ParetoItem[]>) => void) | undefined;
  pareto_unit?: string | undefined;
  on_pareto_unit_change?: ((unit: string) => void) | undefined;
  pareto_titles?: Record<string, string> | undefined;
  on_pareto_titles_change?: ((titles: Record<string, string>) => void) | undefined;
  target_vs_actual?: { mes: string; target: number; actual: number | null }[] | undefined;
  on_target_vs_actual_change?: ((val: any) => void) | undefined;
  target_vs_actual_unit?: string | undefined;
  on_target_vs_actual_unit_change?: ((unit: string) => void) | undefined;
  target_vs_actual_title?: string | undefined;
  on_target_vs_actual_title_change?: ((title: string) => void) | undefined;
  target_vs_actual_ymin?: number | undefined;
  on_target_vs_actual_ymin_change?: ((val: number) => void) | undefined;
  target_vs_actual_ymax?: string | undefined;
  on_target_vs_actual_ymax_change?: ((val: string) => void) | undefined;
  ishikawas?: IshikawaItem[] | undefined;
  on_ishikawas_change?: ((items: IshikawaItem[]) => void) | undefined;
  five_whys_tables?: FiveWhysTableData[] | undefined;
  on_five_whys_tables_change?: ((tables: FiveWhysTableData[]) => void) | undefined;
  voz_consumidor?: any[] | undefined;
  on_voz_consumidor_change?: ((items: any[]) => void) | undefined;
  analisis_riesgos_proyecto?: any[] | undefined;
  on_analisis_riesgos_proyecto_change?: ((items: any[]) => void) | undefined;
  especificacion_procesos_image?: string | undefined;
  on_especificacion_procesos_image_change?: ((img?: string) => void) | undefined;
  benchmark_image?: string | undefined;
  on_benchmark_image_change?: ((img?: string) => void) | undefined;
  conclusiones_causa_raiz?: any[] | undefined;
  on_conclusiones_causa_raiz_change?: ((items: any[]) => void) | undefined;
  has_flavor_correlation?: boolean | undefined;
  set_has_flavor_correlation?: ((val: boolean) => void) | undefined;
  gop_themes_data?: GopThemeItem[] | undefined;
  on_gop_themes_data_change?: ((data: GopThemeItem[]) => void) | undefined;
  rendimiento_actual_pis?: RendimientoActualPiItem[] | undefined;
  on_rendimiento_actual_pis_change?: ((items: RendimientoActualPiItem[]) => void) | undefined;
  rendimiento_actual_image?: string | undefined;
  on_rendimiento_actual_image_change?: ((image: string | undefined) => void) | undefined;
}
