import { useEffect, useState } from "react";
import {
  Check,
  UploadCloud,
  Paperclip,
  Plus,
  TrendingDown,
  Save,
  ArrowRight,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { PhaseBadge } from "@/components/pdca-badge";
import { phases, type ActionItem, type Pdca, type Phase } from "@/data/pdca";

const emptyDraft: Pdca = {
  id: "PDCA-2026-NUEVO",
  titulo: "",
  area: "",
  fase: "Plan",
  actualizado: "25 Ago 2026",
  progreso: 0,
  problema: "",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Indicador principal", antes: 0, despues: 0, unidad: "%" },
  serie: [
    { mes: "May", valor: 0 },
    { mes: "Jun", valor: 0 },
    { mes: "Jul", valor: 0 },
    { mes: "Ago", valor: 0 },
  ],
};

function Stepper({
  current,
  onSelect,
}: {
  current: Phase;
  onSelect: (p: Phase) => void;
}) {
  const currentIndex = phases.indexOf(current);
  return (
    <div className="flex items-stretch gap-1 rounded-xl border border-border bg-secondary/60 p-1.5">
      {phases.map((phase, i) => {
        const isDone = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <button
            key={phase}
            type="button"
            onClick={() => onSelect(phase)}
            className={cn(
              "flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors",
              isCurrent
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-background/80 text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border text-xs font-bold",
                isCurrent
                  ? "border-brand-yellow bg-brand-yellow text-brand-yellow-foreground"
                  : isDone
                    ? "border-phase-act bg-phase-act/15 text-phase-act"
                    : "border-border bg-background",
              )}
            >
              {isDone ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block font-display text-sm font-semibold uppercase tracking-wide">
                {phase}
              </span>
              <span
                className={cn(
                  "hidden truncate text-[11px] sm:block",
                  isCurrent ? "text-primary-foreground/75" : "text-muted-foreground/80",
                )}
              >
                {["Planear", "Ejecutar", "Verificar", "Estandarizar"][i]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PdcaDialog({
  pdca,
  open,
  onOpenChange,
}: {
  pdca: Pdca | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const data = pdca ?? emptyDraft;
  const [tab, setTab] = useState<Phase>(data.fase);
  const [acciones, setAcciones] = useState<ActionItem[]>(data.acciones);

  useEffect(() => {
    setTab(data.fase);
    setAcciones(data.acciones);
  }, [data]);

  const completadas = acciones.filter((a) => a.done).length;
  const nextPhase = phases[Math.min(phases.indexOf(data.fase) + 1, 3)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader className="space-y-3 border-b border-border bg-secondary/40 px-6 py-5 text-left">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
              {data.id}
            </span>
            <PhaseBadge phase={data.fase} />
            <span className="text-xs text-muted-foreground">
              Última actualización: {data.actualizado}
            </span>
          </div>
          <DialogTitle className="font-display text-2xl">
            {data.titulo || "Nuevo PDCA"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          <Stepper current={tab} onSelect={setTab} />

          {tab === "Plan" && (
            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título del proyecto</Label>
                  <Input id="titulo" defaultValue={data.titulo} placeholder="Ej. Reducción de merma en L3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
                  <Input id="area" defaultValue={data.area} placeholder="Ej. Ingeniería de Procesos" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="problema">Definición del problema</Label>
                <Textarea
                  id="problema"
                  rows={4}
                  defaultValue={data.problema}
                  placeholder="Describe el problema con datos, magnitud e impacto."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="causa">Análisis de causa raíz</Label>
                <Textarea
                  id="causa"
                  rows={5}
                  defaultValue={data.causaRaiz}
                  placeholder="5 Por Qués, Ishikawa, Pareto…"
                />
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                    Plan de acción (5W1H)
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => toast("Fila agregada al plan de acción")}>
                    <Plus /> Agregar acción
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>¿Qué?</TableHead>
                      <TableHead className="w-40">¿Quién?</TableHead>
                      <TableHead className="w-32">¿Cuándo?</TableHead>
                      <TableHead className="w-36">Estatus</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acciones.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                          Aún no hay acciones definidas.
                        </TableCell>
                      </TableRow>
                    )}
                    {acciones.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.what}</TableCell>
                        <TableCell className="text-muted-foreground">{a.who}</TableCell>
                        <TableCell className="text-muted-foreground">{a.when}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-semibold",
                              a.status === "Completada"
                                ? "border-phase-act/35 bg-phase-act/15 text-phase-act"
                                : a.status === "En progreso"
                                  ? "border-phase-do/50 bg-phase-do/25 text-brand-yellow-foreground"
                                  : "border-border bg-muted text-muted-foreground",
                            )}
                          >
                            {a.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {tab === "Do" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                  Ejecución del plan de acción
                </h3>
                <span className="text-sm text-muted-foreground">
                  {completadas} de {acciones.length} tareas completadas
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand-yellow transition-all"
                  style={{
                    width: `${acciones.length ? (completadas / acciones.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <ul className="space-y-2">
                {acciones.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]"
                  >
                    <Checkbox
                      id={a.id}
                      checked={a.done}
                      onCheckedChange={(v) =>
                        setAcciones((prev) =>
                          prev.map((x) => (x.id === a.id ? { ...x, done: Boolean(v) } : x)),
                        )
                      }
                      className="mt-0.5"
                    />
                    <label htmlFor={a.id} className="flex-1 cursor-pointer">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          a.done && "text-muted-foreground line-through",
                        )}
                      >
                        {a.what}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        Responsable: {a.who} · Compromiso: {a.when}
                      </span>
                    </label>
                  </li>
                ))}
                {acciones.length === 0 && (
                  <li className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    Define acciones en la fase Plan para verlas aquí.
                  </li>
                )}
              </ul>
            </div>
          )}

          {tab === "Check" && (
            <div className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                    Evidencia
                  </h3>
                  <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-primary/35 bg-primary/5 px-4 py-8 text-center">
                    <UploadCloud className="size-6 text-primary" />
                    <p className="text-sm font-medium">Arrastra archivos o haz clic para subir</p>
                    <p className="text-xs text-muted-foreground">PDF, XLSX, PNG o MP4 · máx. 25 MB</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1"
                      onClick={() => toast.success("Evidencia cargada (demo)")}
                    >
                      Seleccionar archivo
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {data.evidencias.map((e) => (
                      <li
                        key={e}
                        className="flex items-center gap-2 rounded-md bg-secondary/70 px-3 py-2 text-sm"
                      >
                        <Paperclip className="size-4 text-primary" />
                        <span className="truncate">{e}</span>
                      </li>
                    ))}
                    {data.evidencias.length === 0 && (
                      <li className="text-xs text-muted-foreground">Sin archivos adjuntos.</li>
                    )}
                  </ul>
                </div>

                <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                      {data.indicador.etiqueta}
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-phase-act/15 px-2 py-0.5 text-xs font-semibold text-phase-act">
                      <TrendingDown className="size-3.5" />
                      {data.indicador.antes} → {data.indicador.despues} {data.indicador.unidad}
                    </span>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.serie} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                        <XAxis dataKey="mes" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                        <RTooltip
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid var(--color-border)",
                            fontSize: 12,
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="valor"
                          stroke="var(--color-primary)"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: "var(--color-brand-yellow)" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificacion">Verificación de resultados</Label>
                <Textarea
                  id="verificacion"
                  rows={5}
                  defaultValue={data.verificacion}
                  placeholder="Compara el resultado obtenido contra la meta y explica desviaciones."
                />
              </div>
            </div>
          )}

          {tab === "Act" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="estandarizacion">Estandarización y cierre</Label>
                <Textarea
                  id="estandarizacion"
                  rows={7}
                  defaultValue={data.estandarizacion}
                  placeholder="Procedimientos actualizados, capacitación, replicación en otras líneas y cierre formal."
                />
              </div>
              <div className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
                <h3 className="font-display text-base font-semibold uppercase tracking-wide">
                  Resultado del ciclo
                </h3>
                <div className="mt-3 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { etapa: "Antes", valor: data.indicador.antes },
                        { etapa: "Después", valor: data.indicador.despues },
                      ]}
                      margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="etapa" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                      <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                      <RTooltip
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="valor" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-card/95 px-6 py-4 backdrop-blur">
          <Button variant="outline" onClick={() => toast.success("Borrador guardado")}>
            <Save /> Guardar borrador
          </Button>
          <Button
            className="bg-primary hover:bg-brand-dark"
            onClick={() => toast.success(`Fase avanzada a ${nextPhase}`)}
          >
            Avanzar fase <ArrowRight />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
