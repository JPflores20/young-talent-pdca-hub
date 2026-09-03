import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ClipboardList, CheckCircle2, Clock, Target, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PhaseBadge } from "@/components/pdca-badge";
import { usePdcas } from "@/context/pdca-context";
import { useAuth } from "@/context/auth-context";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de mejora continua · PDCA Hub" },
      {
        name: "description",
        content:
          "Resumen de avance de los ciclos PDCA del programa de Grupo Modelo.",
      },
      { property: "og:title", content: "Dashboard de mejora continua · PDCA Hub" },
      {
        property: "og:description",
        content: "Indicadores de avance, fases activas y últimos movimientos de tus PDCAs.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { currentUser } = useAuth();
  // Use the shared context — no additional Firestore subscription needed
  const { pdcaList: userPdcas } = usePdcas();

  const activos = useMemo(() => userPdcas.filter((p) => p.fase !== "Act").length, [userPdcas]);
  const cerrados = useMemo(() => userPdcas.filter((p) => p.fase === "Act").length, [userPdcas]);
  const avance = useMemo(() => {
    if (userPdcas.length === 0) return 0;
    return Math.round(userPdcas.reduce((a, p) => a + p.progreso, 0) / userPdcas.length);
  }, [userPdcas]);

  const tareas = useMemo(() => userPdcas.flatMap((p) => p.acciones || []), [userPdcas]);
  const pendientes = useMemo(() => tareas.filter((t) => !t.done).length, [tareas]);

  const kpis = [
    { label: "PDCAs activos", value: activos, icon: ClipboardList, hint: "En Plan, Do o Check" },
    { label: "En cierre / Act", value: cerrados, icon: CheckCircle2, hint: "Listos para estandarizar" },
    { label: "Avance promedio", value: `${avance}%`, icon: Target, hint: "Todos los ciclos" },
    { label: "Tareas pendientes", value: pendientes, icon: Clock, hint: "Planes de acción abiertos" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Módulo PDCA
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buen día, <span className="font-semibold text-foreground">{currentUser?.name || "Usuario"}</span>. Este es el estatus de {currentUser?.role === "admin" ? "todos los" : "tus"} proyectos de mejora continua.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/">
            Ir a Mis PDCAs <ArrowRight className="ml-1 size-4" />
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
            {userPdcas.map((p) => (
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
            {userPdcas.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay PDCAs registrados para mostrar.
              </li>
            )}
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
            {tareas.filter((t) => !t.done).length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">
                No hay compromisos pendientes.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
