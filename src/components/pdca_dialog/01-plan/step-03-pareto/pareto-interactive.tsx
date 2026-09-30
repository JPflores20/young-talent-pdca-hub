import { useState } from "react";
import { ArrowRight, Plus, X, FileText, Maximize2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "@/components/pdca_dialog/common/step-instructions";
import type { ParetoItem } from "@/data/pdca";
import { build_pareto_data, format_value, ParetoInteractiveProps } from "./pareto-utils";
import { ParetoChart } from "./pareto-chart";

export function ParetoInteractive({
  title = "Analisis de Pareto (PASO 5)",
  subtitle = "Desglosa el KPI para encontrar el 80/20.",
  level = 0,
  data = [],
  onDataChange,
  onBarClick,
  onClose,
  unit = "",
  onUnitChange,
  isStepCompleted, isNa, onToggleStep, onToggleNa,
  onAddRoot,
  chart_title: external_chart_title,
  on_chart_title_change: external_on_title_change,
}: ParetoInteractiveProps) {
  const [is_paste_open, set_is_paste_open] = useState(false);
  const [paste_data, set_paste_data] = useState("");
  const [is_fullscreen, set_is_fullscreen] = useState(false);
  const [internal_title, set_internal_title] = useState("");
  const [y_axis_min, set_y_axis_min] = useState<number>(0);
  const [y_axis_max_str, set_y_axis_max_str] = useState<string>("");

  const chart_title = external_chart_title !== undefined ? external_chart_title : internal_title;
  const on_title_change = external_on_title_change ?? set_internal_title;
  const y_axis_max: number | "auto" = y_axis_max_str === "" ? "auto" : Number(y_axis_max_str);

  const { pareto_rows, total_gap } = build_pareto_data(data);

  const add_row = () => {
    if (onDataChange) {
      onDataChange([...data, { id: Date.now(), area: "", gap: 0 } as ParetoItem]);
    }
  };

  const update_row = (id: number, field: "area" | "gap", value: string | number) => {
    if (onDataChange) {
      onDataChange(data.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    }
  };

  const remove_row = (id: number) => {
    if (onDataChange) {
      onDataChange(data.filter((d) => d.id !== id));
    }
  };

  const handle_import_excel = () => {
    if (!paste_data.trim()) return;
    const agg: Record<string, number> = {};
    for (const line of paste_data.split("\n")) {
      if (!line.trim()) continue;
      const parts = line.split("\t");
      let cat = "";
      let val = 0;

      const p0 = parts[0];
      const p1 = parts[1];

      if (parts.length >= 2) {
        cat = p0 ? p0.trim() : "";
        val = p1 ? parseFloat(p1.replace(/,/g, "").trim() || "0") : 0;
      } else {
        const fb = line.split(",");
        const fb0 = fb[0];
        const fb1 = fb[1];
        if (fb.length >= 2) {
          cat = fb0 ? fb0.trim() : "";
          val = fb1 ? parseFloat(fb1.replace(/,/g, "").trim() || "0") : 0;
        } else {
          cat = line.trim();
          val = 1;
        }
      }

      if (isNaN(val)) val = 0;

      if (cat) {
        const currentAgg = agg[cat] ?? 0;
        agg[cat] = currentAgg + val;
      }
    }

    if (onDataChange) {
      const ex: Record<string, number> = {};
      data.forEach((item) => {
        const area = item.area?.trim();
        if (area) {
          const currentEx = ex[area] ?? 0;
          ex[area] = currentEx + (item.gap ?? 0);
        }
      });

      for (const c in agg) {
        const currentEx = ex[c] ?? 0;
        const currentAgg = agg[c] ?? 0;
        ex[c] = currentEx + currentAgg;
      }

      const new_items = Object.keys(ex).map(
        (c) =>
          ({
            id: Date.now() + Math.random(),
            area: c,
            gap: ex[c] ?? 0,
          }) as ParetoItem,
      );

      onDataChange(new_items);
    }
    set_is_paste_open(false);
    set_paste_data("");
    toast.success("Datos importados correctamente");
  };

  const make_chart = (max_bar_size: number) => (
    <ParetoChart
      pareto_rows={pareto_rows}
      {...(onBarClick ? { on_bar_click: onBarClick } : {})}
      unit={unit}
      y_axis_min={y_axis_min}
      y_axis_max={y_axis_max}
      chart_title={chart_title}
      on_chart_title_change={on_title_change}
      max_bar_size={max_bar_size}
    />
  );

  return (
    <StepCard
      className="col-span-full animate-in fade-in zoom-in-95"
      title={
        <div className="flex items-center gap-2">
          {level > 0 && <ArrowRight className="size-4 text-muted-foreground" />}
          <span>{title}</span>
          <span className="text-muted-foreground/50 font-normal">-</span>
          <Input
            value={chart_title}
            onChange={(e) => on_title_change(e.target.value)}
            placeholder="Nombre del pareto (opcional)"
            className="h-7 text-sm font-medium border-dashed bg-transparent shadow-none
              placeholder:text-muted-foreground/50 focus-visible:bg-background w-64 px-2"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      }
      {...(level === 0 && isStepCompleted !== undefined ? { isStepCompleted } : {})}
      {...(level === 0 && onToggleStep ? { onToggleStep } : {})}
      {...(level === 0 && isNa !== undefined ? { isNa } : {})}
      {...(level === 0 && onToggleNa ? { onToggleNa } : {})}
      headerRight={
        <div className="flex gap-2">
          {onClose && (
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
                  <AlertDialogTitle>Eliminar Pareto</AlertDialogTitle>
                  <AlertDialogDescription>Esta accion no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={onClose}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {onAddRoot && (
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddRoot();
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
              add_row();
            }}
          >
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
          <Dialog open={is_paste_open} onOpenChange={set_is_paste_open}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Importar Datos desde Excel</DialogTitle>
                <DialogDescription>
                  Copia dos columnas (Categoria, Valor) y pegalas aqui.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  value={paste_data}
                  onChange={(e) => set_paste_data(e.target.value)}
                  placeholder={"Ejemplo:\nFalla A\t10\nFalla B\t5"}
                  className="min-h-[200px] text-xs font-mono whitespace-pre"
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => set_is_paste_open(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handle_import_excel}>Importar y Generar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground ml-9 mb-4">
        {subtitle} {onBarClick && "Haz clic en una barra para desglosarla."}
      </p>

      {level === 0 && (
        <StepInstructions>
          <p className="mb-2">1. Identifica las categorias para desglosar el KPI (eje X).</p>
          <p className="mb-2">2. Introduce el valor o gap de cada categoria.</p>
          <p className="mb-2">3. La grafica de Pareto se genera automaticamente.</p>
          <p>4. Haz clic en una barra para crear un Sub-Pareto de nivel 2.</p>
        </StepInstructions>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        {level === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Unidad de Medida:
            </span>
            <Input
              value={unit}
              onChange={(e) => {
                if (onUnitChange) onUnitChange(e.target.value);
              }}
              placeholder="ej. $, %, HL"
              className="w-28 h-7 text-xs font-bold"
            />
          </div>
        )}
        <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Eje Y —</span>
          <span className="text-xs text-muted-foreground">Min:</span>
          <Input
            type="number"
            value={y_axis_min}
            onChange={(e) => set_y_axis_min(Number(e.target.value))}
            className="w-20 h-7 text-xs"
          />
          <span className="text-xs text-muted-foreground">Max:</span>
          <Input
            type="number"
            value={y_axis_max_str}
            onChange={(e) => set_y_axis_max_str(e.target.value)}
            placeholder="auto"
            className="w-20 h-7 text-xs"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Table */}
        <div className="overflow-x-auto border rounded-md">
          <Table className="text-xs">
            <TableHeader className="bg-secondary/40">
              <TableRow>
                <TableHead className="py-2 px-3">AREA / CATEGORIA</TableHead>
                <TableHead className="py-2 px-3 w-24">VALOR (GAP)</TableHead>
                <TableHead className="py-2 px-3 w-20">% IND.</TableHead>
                <TableHead className="py-2 px-3 w-20">% ACUM.</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pareto_rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="py-1.5 px-3">
                    <Input
                      value={row.area ?? ""}
                      onChange={(e) => update_row(row.id ?? 0, "area", e.target.value)}
                      placeholder="Ej. Envasado..."
                      className="h-7 text-xs shadow-none border-0 px-1 bg-transparent
                        hover:bg-secondary/50 focus-visible:bg-background"
                    />
                  </TableCell>
                  <TableCell className="py-1.5 px-3">
                    <Input
                      type="number"
                      value={row.gap ?? ""}
                      onChange={(e) => update_row(row.id ?? 0, "gap", Number(e.target.value))}
                      className="h-7 text-xs shadow-none border-0 px-1 bg-transparent
                        hover:bg-secondary/50 focus-visible:bg-background text-right"
                    />
                  </TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-muted-foreground">
                    {row.ind_pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-1.5 px-3 font-mono text-muted-foreground font-semibold">
                    {row.cum_pct.toFixed(1)}%
                  </TableCell>
                  <TableCell className="py-1.5">
                    {data.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => remove_row(row.id ?? 0)}
                      >
                        <X className="size-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-secondary/20">
                <TableCell className="py-2 px-3 font-bold text-right">TOTAL</TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono text-right">
                  {format_value(total_gap, unit)}
                </TableCell>
                <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Inline chart */}
        {!is_fullscreen && (
          <div className="h-[400px] border rounded-md p-3 flex flex-col relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 h-6 px-2 text-[10px] text-[#0078D7]
                hover:bg-blue-50 dark:hover:bg-blue-950 font-bold z-10"
              onClick={() => set_is_fullscreen(true)}
            >
              <Maximize2 className="mr-1 size-3" /> Expandir
            </Button>
            {make_chart(40)}
          </div>
        )}
      </div>

      {/* Fullscreen */}
      <Dialog open={is_fullscreen} onOpenChange={set_is_fullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-4 sm:p-6 flex flex-col bg-background">
          <DialogHeader>
            <DialogTitle>
              {title} {chart_title ? `- ${chart_title}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full min-h-0 pt-4">
            <ParetoChart
              pareto_rows={pareto_rows}
              {...(onBarClick
                ? {
                    on_bar_click: (cat) => {
                      onBarClick(cat);
                      set_is_fullscreen(false);
                    },
                  }
                : {})}
              unit={unit}
              y_axis_min={y_axis_min}
              y_axis_max={y_axis_max}
              chart_title={""}
              on_chart_title_change={on_title_change}
              max_bar_size={60}
            />
          </div>
        </DialogContent>
      </Dialog>
    </StepCard>
  );
}
