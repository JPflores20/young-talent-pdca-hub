/**
 * pareto_interactive.tsx
 * Componente orquestador de un único Pareto interactivo.
 * Responsabilidad única: gestionar el estado local y coordinar sub-componentes.
 */
import { useState } from "react";
import { ArrowRight, Plus, X, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../pdca-dialog/step-instructions";
import { ParetoDataTable } from "./pareto_data_table";
import { ParetoChart } from "./pareto_chart";
import { ParetoImportDialog } from "./pareto_import_dialog";
import {
  compute_pareto_data,
  format_pareto_value,
  parse_excel_paste,
  compute_total_gap,
} from "./pareto_data_utils";
import type { ParetoInteractiveProps, ParetoItem } from "./pareto_types";

export function ParetoInteractive({
  title = "Análisis de Pareto (PASO 5)",
  subtitle = "Desglosa el KPI para encontrar el 80/20.",
  level = 0,
  pareto_items = [],
  on_items_change,
  on_bar_click,
  on_close,
  unit = "",
  on_unit_change,
  is_step_completed,
  on_toggle_step,
  on_add_root,
  chart_title: external_chart_title,
  on_chart_title_change: external_on_chart_title_change,
}: ParetoInteractiveProps) {
  const [is_paste_open, set_is_paste_open] = useState(false);
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const [local_chart_title, set_local_chart_title] = useState("");
  const [y_axis_min, set_y_axis_min] = useState<number>(0);
  const [y_axis_max, set_y_axis_max] = useState<number | "auto">("auto");

  // Support both controlled (from ParetoSection's title_map) and uncontrolled modes
  const chart_title = external_chart_title !== undefined ? external_chart_title : local_chart_title;
  const set_chart_title = (title: string) => {
    if (external_on_chart_title_change) {
      external_on_chart_title_change(title);
    } else {
      set_local_chart_title(title);
    }
  };

  const pareto_computed = compute_pareto_data(pareto_items);
  const total_gap = compute_total_gap(pareto_items);
  const format_value = (val: unknown) => format_pareto_value(val, unit);

  function add_empty_row() {
    on_items_change?.([...pareto_items, { id: Date.now(), area: "", gap: 0 }]);
  }

  function update_row(id: number, field: "area" | "gap", value: string | number) {
    on_items_change?.(
      pareto_items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function remove_row(id: number) {
    on_items_change?.(pareto_items.filter((item) => item.id !== id));
  }

  function handle_excel_import(raw_text: string) {
    const merged = parse_excel_paste(raw_text, pareto_items);
    if (on_items_change && merged.length > 0) {
      on_items_change(merged);
      toast.success("Datos importados y agrupados correctamente");
    }
  }

  const chart_data = pareto_computed.map((item) => ({ ...item, cum_pct: item.cum_pct }));

  return (
    <StepCard
      className="col-span-full animate-in fade-in zoom-in-95"
      title={
        <>
          {level > 0 && <ArrowRight className="size-4 text-muted-foreground" />} {title}
        </>
      }
      isStepCompleted={level === 0 ? is_step_completed : undefined}
      onToggleStep={level === 0 ? on_toggle_step : undefined}
      headerRight={
        <div className="flex gap-2 flex-wrap">
          {on_close && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4 mr-2" /> Cerrar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar Pareto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer y eliminará también sus desgloses.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={on_close}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {on_add_root && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                on_add_root();
              }}
            >
              <Plus className="size-4 mr-2" /> Nuevo Pareto
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              set_is_paste_open(true);
            }}
          >
            <FileText className="size-4 mr-2" /> Importar Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              add_empty_row();
            }}
          >
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
          <ParetoImportDialog
            is_open={is_paste_open}
            on_open_change={set_is_paste_open}
            on_import={handle_excel_import}
          />
        </div>
      }
    >
      <p className="text-sm text-muted-foreground ml-[36px] mb-4">
        {subtitle} {on_bar_click && "Haz clic en una barra para desglosarla."}
      </p>

      {level === 0 && (
        <StepInstructions>
          <p className="mb-2">
            1. Usa la columna de categorías para identificar los KPI o IP. Este será tu eje X.
          </p>
          <p className="mb-2">2. Introduce tus datos (Valor / Gap) en las mismas unidades.</p>
          <p className="mb-2">3. El gráfico de Pareto se genera automáticamente.</p>
          <p>4. Haz clic en una barra para crear un sub-Pareto (Nivel 2).</p>
        </StepInstructions>
      )}

      {level === 0 && (
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Unidad de Medida:
          </span>
          <Input
            value={unit}
            onChange={(e) => on_unit_change?.(e.target.value)}
            placeholder="ej. $, %, HL"
            className="w-28 h-7 text-xs font-bold"
          />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <ParetoDataTable
          pareto_data={pareto_computed}
          raw_items={pareto_items}
          on_row_update={update_row}
          on_row_remove={remove_row}
          format_value={format_value}
          total_gap={total_gap}
        />
        {!is_fullscreen && (
          <ParetoChart
            chart_data={chart_data}
            chart_title={chart_title}
            on_chart_title_change={set_chart_title}
            y_axis_min={y_axis_min}
            y_axis_max={y_axis_max}
            on_y_axis_min_change={set_y_axis_min}
            on_y_axis_max_change={set_y_axis_max}
            on_bar_click={on_bar_click}
            unit={unit}
            format_value={format_value}
            on_expand={() => set_is_fullscreen(true)}
          />
        )}
      </div>

      <Dialog open={is_fullscreen} onOpenChange={set_is_fullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-4 sm:p-6 flex flex-col bg-background">
          <DialogHeader>
            <DialogTitle>{chart_title || title || "Pareto"}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full h-full relative pt-4 min-h-0">
            <ParetoChart
              chart_data={chart_data}
              chart_title={chart_title}
              on_chart_title_change={set_chart_title}
              y_axis_min={y_axis_min}
              y_axis_max={y_axis_max}
              on_y_axis_min_change={set_y_axis_min}
              on_y_axis_max_change={set_y_axis_max}
              on_bar_click={(cat) => {
                on_bar_click?.(cat);
                set_is_fullscreen(false);
              }}
              unit={unit}
              format_value={format_value}
              is_fullscreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </StepCard>
  );
}
