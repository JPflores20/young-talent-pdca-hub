import React, { useRef } from "react";
import { Bold, Italic, List, ListOrdered, Plus, X } from "lucide-react";
import { PdcaGoalDefinition, PdcaParticipants } from "./step-01-meta/pdca-goal-definition";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../common/step-instructions";
import { TeamMembersInput } from "./step-01-meta/team-members-input";
import { VpoCheckpointTable } from "./step-01-meta/vpo-checkpoint-table";
import { TimeSeriesYTD } from "./step-02-linea-tiempo/time-series-ytd";
import { ImageUploadSection, MultiImageUploadSection, ALL_ACCEPT_STRING } from "@/components/image-upload-section";
import { ParetoSection } from "./step-03-pareto/pareto-section";
import { IshikawaSection } from "./step-04-ishikawa/ishikawa-section";
import { FiveWhysSection } from "./step-05-cinco-porques/five-whys-section";
import { FlavorCorrelationSection } from "./step-06-correlacion/flavor-correlation-section";
import { GopThemesSection } from "./step-07-gops/GopThemesSection";
import { ColeccionDatosTable } from "./step-08-coleccion-datos/coleccion-datos-table";
import { VozConsumidorTable } from "./step-09-voz-consumidor/voz-consumidor-table";
import { AnalisisRiesgosTable } from "./step-11-analisis-riesgos/analisis-riesgos-table";
import { RendimientoActualStep } from "./step-13-rendimiento-actual/rendimiento-actual-step";
import { ConclusionesCausaRaizTable } from "./step-14-conclusiones-causa-raiz/conclusiones-causa-raiz-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AREAS } from "@/data/pdca";
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

// ─── Editor de texto enriquecido mínimo ──────────────────────────────────────
function RichTextEditor({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Sync external changes (e.g. when loading from database)
  React.useEffect(() => {
    if (!editorRef.current) return;

    if (!isMounted.current) {
      editorRef.current.innerHTML = value || "";
      isMounted.current = true;
      return;
    }

    if (value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCmd = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("bold");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("italic");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertUnorderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertOrderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>
      </div>
      {/* Área editable */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        className="min-h-[120px] p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder="Describe el problema observado..."
      />
    </div>
  );
}

// ─── Props del componente ─────────────────────────────────────────────────────
interface PhasePlanProps {
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

// ─── Componente principal ─────────────────────────────────────────────────────
export const PdcaPhasePlan: React.FC<PhasePlanProps> = ({
  title_value,
  on_title_change,
  area_value,
  on_area_change,
  deadline_date,
  on_deadline_change,
  author_name,
  author_email,
  on_author_change,
  assigned_users,
  on_toggle_assigned_user,
  available_users,
  is_admin_user,
  team_members_list,
  on_team_members_change,
  problem_description,
  on_problem_change,
  goal_definition,
  on_goal_definition_change,
  participants_info,
  on_participants_info_change,
  vpo_checkpoints,
  on_vpo_checkpoints_change,
  completed_steps, na_steps, on_toggle_step, on_toggle_na,
  is_editable,
  process_mapping_files,
  sipoc_map_files,
  on_sipoc_map_files_change,
  on_process_mapping_files_change,
  baseline_image,
  on_baseline_image_change,
  coleccion_datos,
  on_coleccion_datos_change,
  pareto_drill_downs,
  on_pareto_drill_downs_change,
  pareto_data_map,
  on_pareto_data_map_change,
  pareto_unit,
  on_pareto_unit_change,
  pareto_titles,
  on_pareto_titles_change,
  target_vs_actual,
  on_target_vs_actual_change,
  target_vs_actual_unit,
  on_target_vs_actual_unit_change,
  target_vs_actual_title,
  on_target_vs_actual_title_change,
  target_vs_actual_ymin,
  on_target_vs_actual_ymin_change,
  target_vs_actual_ymax,
  on_target_vs_actual_ymax_change,
  ishikawas,
  on_ishikawas_change,
  five_whys_tables,
  on_five_whys_tables_change,
  voz_consumidor,
  on_voz_consumidor_change,
  analisis_riesgos_proyecto,
  on_analisis_riesgos_proyecto_change,
  especificacion_procesos_image,
  on_especificacion_procesos_image_change,
  benchmark_image,
  on_benchmark_image_change,
  conclusiones_causa_raiz,
  on_conclusiones_causa_raiz_change,
  has_flavor_correlation,
  set_has_flavor_correlation,
  gop_themes_data,
  on_gop_themes_data_change,
  rendimiento_actual_pis,
  on_rendimiento_actual_pis_change,
  rendimiento_actual_image,
  on_rendimiento_actual_image_change,
}) => {
  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["subfase-1", "subfase-2"]} className="w-full space-y-4">
        <AccordionItem value="subfase-1" className="border rounded-md bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            Subfase 1: Identificación del Problema (Pasos 1-7)
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50">
      {/* ── PASO 1: PROYECT STATEMENT ─────────────────────────────────── */}
      <StepCard
        title="PASO 1: PROYECT STATEMENT"
        isStepCompleted={completed_steps.has("step-1")}
        onToggleStep={() => on_toggle_step("step-1")}
        isNa={na_steps?.has("step-1")} onToggleNa={() => on_toggle_na?.("step-1")}
      >
        <StepInstructions>
          <p>
            Define el alcance del problema, el equipo responsable y los datos de contexto del PDCA.
          </p>
        </StepInstructions>

        <div className="space-y-5 mt-4">
          {/* Fila: Título, Área, Fecha Límite, Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-xs font-semibold">TÍTULO DEL PROYECTO</Label>
              <Input
                value={title_value}
                onChange={(e) => on_title_change(e.target.value)}
                disabled={!is_editable}
                placeholder="Ej: Reducción de mermas en cocimientos"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ÁREA</Label>
              <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Seleccionar área" />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">FECHA LÍMITE</Label>
              <DatePicker
                date={deadline_date}
                setDate={on_deadline_change}
                placeholder="Seleccionar fecha límite"
                disabled={!is_admin_user}
                className="h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">AUTOR ORIGINAL</Label>
              {is_admin_user ? (
                <Select
                  value={author_email}
                  onValueChange={(email) => {
                    const found = available_users.find((u) => u.email === email);
                    on_author_change(email, found?.name || "Usuario");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Seleccionar autor" />
                  </SelectTrigger>
                  <SelectContent>
                    {(available_users ?? []).map((u) => (
                      <SelectItem key={u.email} value={u.email}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={author_name} disabled className="h-9 text-xs" />
              )}
            </div>
          </div>

          {/* Usuarios Asignados */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">USUARIOS ASIGNADOS (CO-RESPONSABLES)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2"
                >
                  {(assigned_users ?? []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">Seleccionar usuarios...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(assigned_users ?? []).map((u) => (
                        <Badge key={u.email} variant="secondary" className="text-[11px] py-0">
                          {u.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {(available_users ?? []).map((u) => {
                    const assigned = (assigned_users ?? []).some((a) => a.email === u.email);
                    return (
                      <div
                        key={u.email}
                        onClick={() => on_toggle_assigned_user(u)}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                      >
                        <span>{u.name}</span>
                        {assigned && (
                          <Badge variant="outline" className="text-[10px]">
                            Asignado
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Descripción del Problema */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">DESCRIPCIÓN DEL PROBLEMA</Label>
            <RichTextEditor
              value={problem_description}
              onChange={on_problem_change}
              disabled={!is_editable}
            />
          </div>

          {/* Definición de la Meta (VPO Standard) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">DEFINICIÓN DE LA META (VPO STANDARD)</Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                ⏱ Formato oficial A3 / A8 InBev
              </span>
            </div>
            <PdcaGoalDefinition
              value={goal_definition}
              onChange={on_goal_definition_change}
              readOnly={!is_editable}
            />
          </div>
        </div>
      </StepCard>

      {/* ── PASO 2: Participantes y VPO ───────────────────────────────── */}
      <PdcaParticipants
        value={participants_info}
        onChange={on_participants_info_change}
        readOnly={!is_editable}
      />

      <VpoCheckpointTable
        checkpoints={vpo_checkpoints}
        onChange={on_vpo_checkpoints_change}
        problemaTexto={problem_description}
        completedSteps={completed_steps}
        naSteps={na_steps}
        onToggleStep={on_toggle_step}
        onToggleNa={on_toggle_na}
      />

      {/* ── PASO 3: SIPOC MAP (Placeholder) ─────────────────────────── */}
      <MultiImageUploadSection
        images={sipoc_map_files || []}
        onChange={(f) => on_sipoc_map_files_change?.(f)}
        title="PASO 3: SIPOC MAP"
        subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos del SIPOC MAP (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-3")}
        onToggleStep={() => on_toggle_step("step-3")}
        isNa={na_steps?.has("step-3")} onToggleNa={() => on_toggle_na?.("step-3")}
      />

      {/* ── PASO 4: Mapeo de procesos ───────────────────────────────── */}
      <MultiImageUploadSection
        images={process_mapping_files || []}
        onChange={(f) => on_process_mapping_files_change?.(f)}
        title="PASO 4: MAPEO DE PROCESOS"
        subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
        isNa={na_steps?.has("step-4")} onToggleNa={() => on_toggle_na?.("step-4")}
      />

      {/* ── PASO 5: Voz del Consumidor ────────────────── */}
      <VozConsumidorTable
        items={voz_consumidor || []}
        onChange={on_voz_consumidor_change!}
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
        isNa={na_steps?.has("step-5")} onToggleNa={() => on_toggle_na?.("step-5")}
      />

      {/* ── PASO 6: Análisis de Riesgos ───────────────── */}
      <AnalisisRiesgosTable
        title="PASO 6: ANÁLISIS DE RIESGOS DEL PROYECTO"
        items={analisis_riesgos_proyecto || []}
        onChange={on_analisis_riesgos_proyecto_change!}
        isStepCompleted={completed_steps.has("step-6")}
        onToggleStep={() => on_toggle_step("step-6")}
        isNa={na_steps?.has("step-6")} onToggleNa={() => on_toggle_na?.("step-6")}
      />

      {/* ── PASO 7: Situación Actual ─────────────── */}
      <TimeSeriesYTD
        value={target_vs_actual}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
        title="PASO 7: SITUACIÓN ACTUAL"
        chartTitle={target_vs_actual_title}
        onTitleChange={on_target_vs_actual_title_change}
        yMin={target_vs_actual_ymin}
        onYMinChange={on_target_vs_actual_ymin_change}
        yMax={target_vs_actual_ymax}
        onYMaxChange={on_target_vs_actual_ymax_change}
        isStepCompleted={completed_steps.has("step-12")}
        onToggleStep={() => on_toggle_step("step-12")}
        isNa={na_steps?.has("step-12")} onToggleNa={() => on_toggle_na?.("step-12")}
      />
      </AccordionContent>
        </AccordionItem>
        <AccordionItem value="subfase-2" className="border rounded-md bg-white shadow-sm overflow-hidden">
          <AccordionTrigger className="px-4 py-3 bg-[#0078D7] text-white hover:bg-[#005ea6] hover:no-underline font-bold text-lg">
            Subfase 2: Análisis (Pasos 8-17)
          </AccordionTrigger>
          <AccordionContent className="p-4 space-y-6 bg-slate-50">

      {/* ── PASO 8: Línea base ──────────────────────────────────────── */}
      <ImageUploadSection
        image={baseline_image || null}
        onChange={(img) => on_baseline_image_change?.(img || undefined)}
        title="PASO 8: LÍNEA BASE"
        subtitle="Sube una imagen representativa del baseline"
        isStepCompleted={completed_steps.has("step-7")}
        onToggleStep={() => on_toggle_step("step-7")}
        isNa={na_steps?.has("step-7")} onToggleNa={() => on_toggle_na?.("step-7")}
      />

      {/* ── PASO 9: Data collection Plan ────────────────────────────── */}
      <ColeccionDatosTable 
        items={coleccion_datos || []}
        onChange={(d) => on_coleccion_datos_change?.(d)}
        isStepCompleted={completed_steps.has("step-8")}
        onToggleStep={() => on_toggle_step("step-8")}
        isNa={na_steps?.has("step-8")} onToggleNa={() => on_toggle_na?.("step-8")}
      />

      {/* ── PASO 10: Pareto ──────────────────────────────────────────── */}
      <ParetoSection
        drillDowns={pareto_drill_downs || []}
        setDrillDowns={on_pareto_drill_downs_change!}
        dataMap={pareto_data_map || {}}
        setDataMap={on_pareto_data_map_change!}
        unit={pareto_unit || ""}
        onUnitChange={on_pareto_unit_change!}
        paretoTitles={pareto_titles}
        onParetoTitlesChange={on_pareto_titles_change}
        isStepCompleted={completed_steps.has("step-9")}
        onToggleStep={() => on_toggle_step("step-9")}
        isNa={na_steps?.has("step-9")} onToggleNa={() => on_toggle_na?.("step-9")}
      />

      {/* Correlaciones (Análisis de Flavors) */}
      <div className="pt-2">
        {has_flavor_correlation ? (
          <div className="relative group/flavor pt-4 border-t border-border/40 mt-4">
            {is_admin_user && (
              <div className="absolute top-2 right-2 opacity-0 group-hover/flavor:opacity-100 transition-opacity z-10 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm border border-border/50">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <X className="size-4 mr-2" /> Quitar Análisis
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm">¿QUITAR CORRELACIÓN DE FLAVORS?</h4>
                      <p className="text-xs text-muted-foreground">
                        Esta acción ocultará la sección.
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => set_has_flavor_correlation?.(false)}
                        >
                          Sí, quitar
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <FlavorCorrelationSection
              isStepCompleted={completed_steps.has("step-flavor")}
              onToggleStep={() => on_toggle_step("step-flavor")}
              isNa={na_steps?.has("step-flavor")} onToggleNa={() => on_toggle_na?.("step-flavor")}
            />
          </div>
        ) : (
          is_admin_user && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => set_has_flavor_correlation?.(true)}
                variant="outline"
                className="gap-2 shadow-sm bg-card hover:bg-card/80"
              >
                <Plus className="size-4" /> Agregar Análisis de Flavors (Correlaciones)
              </Button>
            </div>
          )
        )}
      </div>

      {/* ── PASO 11: Especificaciones del Proceso ─────────────────────────── */}
      <ImageUploadSection
        image={especificacion_procesos_image || null}
        onChange={(img) => on_especificacion_procesos_image_change?.(img || undefined)}
        title="PASO 11: ESPECIFICACIONES DEL PROCESO"
        subtitle="Sube una imagen con las especificaciones"
        isStepCompleted={completed_steps.has("step-10")}
        onToggleStep={() => on_toggle_step("step-10")}
        isNa={na_steps?.has("step-10")} onToggleNa={() => on_toggle_na?.("step-10")}
      />

      {/* ── PASO 12: Benchmark ───────────────────────── */}
      <ImageUploadSection
        image={benchmark_image || null}
        onChange={(img) => on_benchmark_image_change?.(img || undefined)}
        title="PASO 12: BENCHMARK"
        subtitle="Sube una imagen representativa del Benchmark"
        isStepCompleted={completed_steps.has("step-11")}
        onToggleStep={() => on_toggle_step("step-11")}
        isNa={na_steps?.has("step-11")} onToggleNa={() => on_toggle_na?.("step-11")}
      />

      {/* ── PASO 13: Rendimiento Actual del Proceso ────────────── */}
      <RendimientoActualStep
        items={rendimiento_actual_pis || []}
        onChange={on_rendimiento_actual_pis_change!}
        image={rendimiento_actual_image}
        onImageChange={on_rendimiento_actual_image_change!}
        isStepCompleted={completed_steps.has("step-13")}
        onToggleStep={() => on_toggle_step("step-13")}
        isNa={na_steps?.has("step-13")} onToggleNa={() => on_toggle_na?.("step-13")}
      />

      {/* ── PASO 14: GOP Themes ───────────────────────────────────────── */}
      <GopThemesSection
        data={gop_themes_data || []}
        onChange={on_gop_themes_data_change!}
        isStepCompleted={completed_steps.has("step-gops")}
        onToggleStep={() => on_toggle_step("step-gops")}
        isNa={na_steps?.has("step-gops")} onToggleNa={() => on_toggle_na?.("step-gops")}
      />

      {/* ── PASO 15: Fishbone ───────────────────────────────────────── */}
      <IshikawaSection
        ishikawas={ishikawas || []}
        onChange={on_ishikawas_change!}
        isStepCompleted={completed_steps.has("step-14")}
        onToggleStep={() => on_toggle_step("step-14")}
        isNa={na_steps?.has("step-14")} onToggleNa={() => on_toggle_na?.("step-14")}
      />

      {/* ── PASO 16: 5 Why's ────────────────────────────────────────── */}
      <FiveWhysSection
        tables={five_whys_tables || []}
        onChange={on_five_whys_tables_change!}
        isStepCompleted={completed_steps.has("step-15")}
        onToggleStep={() => on_toggle_step("step-15")}
        isNa={na_steps?.has("step-15")} onToggleNa={() => on_toggle_na?.("step-15")}
      />
      {/* ── PASO 17: Causas Raíz Definidas ──────────── */}
      <ConclusionesCausaRaizTable
        title="PASO 17: CAUSAS RAÍZ DEFINIDAS"
        items={conclusiones_causa_raiz || []}
        onChange={on_conclusiones_causa_raiz_change!}
        isStepCompleted={completed_steps.has("step-17")}
        onToggleStep={() => on_toggle_step("step-17")}
        isNa={na_steps?.has("step-17")} onToggleNa={() => on_toggle_na?.("step-17")}
      />
        </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
