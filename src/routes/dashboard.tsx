import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ClipboardList, CheckCircle2, Clock, Target, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/pdca-badge";
import { pdcas } from "@/data/pdca";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de mejora continua · Jóvenes Talentos" },
      {
        name: "description",
        content:
          "Resumen de avance de los ciclos PDCA del programa Jóvenes Talentos de Grupo Modelo.",
      },
      { property: "og:title", content: "Dashboard de mejora continua · Jóvenes Talentos" },
      {
        property: "og:description",
        content: "Indicadores de avance, fases activas y últimos movimientos de tus PDCAs.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const activos = pdcas.filter((p) => p.fase !== "Act").length;
  const cerrados = pdcas.filter((p) => p.fase === "Act").length;
  const avance = Math.round(pdcas.reduce((a, p) => a + p.progreso, 0) / pdcas.length);
  const tareas = pdcas.flatMap((p) => p.acciones);
  const pendientes = tareas.filter((t) => !t.done).length;

  const kpis = [
    { label: "PDCAs activos", value: activos, icon: ClipboardList, hint: "En Plan, Do o Check" },
    { label: "En cierre / Act", value: cerrados, icon: CheckCircle2, hint: "Listos para estandarizar" },
    { label: "Avance promedio", value: `${avance}%`, icon: Target, hint: "Todos los ciclos" },
    { label: "Tareas pendientes", value: pendientes, icon: Clock, hint: "Planes de acción abiertos" },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Jóvenes Talentos
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buen día, Ana. Este es el estatus de tus proyectos de mejora continua.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">
            Ir a Mis PDCAs <ArrowRight />
          </Link>
        </Button>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {k.label}
              </span>
              <span className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                <k.icon className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-4xl font-bold">{k.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{k.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] lg:col-span-2">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Movimientos recientes
          </h2>
          <ul className="mt-4 space-y-3">
            {pdcas.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.area} · actualizado {p.actualizado}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-secondary sm:block">
                    <span
                      className="block h-full rounded-full bg-brand-yellow"
                      style={{ width: `${p.progreso}%` }}
                    />
                  </span>
                  <PhaseBadge phase={p.fase} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">
            Próximos compromisos
          </h2>
          <ul className="mt-4 space-y-3">
            {tareas
              .filter((t) => !t.done)
              .slice(0, 6)
              .map((t) => (
                <li key={t.id} className="border-l-2 border-brand-yellow pl-3">
                  <p className="text-sm font-medium">{t.what}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.who} · {t.when}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
