import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Filter, Calendar, Trash2, CalendarClock, X, Target, CheckCircle2, Clock, AlertTriangle, Building, LayoutDashboard, Snowflake, Flame } from "lucide-react";
import { format, isValid, isBefore, startOfDay, parse } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { PhaseBadge } from "@/components/pdca-badge";

import { PdcaDialog } from "@/components/pdca-dialog";
import { 
  deletePdcaFromFirestore,
  updatePdcaDeadline,
} from "@/services/pdca-service";
import { phases, type Phase } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mis PDCAs · VPO Grupo Modelo" },
      {
        name: "description",
        content:
          "Crea, da seguimiento y cierra tus reportes PDCA de mejora continua.",
      },
      { property: "og:title", content: "Mis PDCAs · VPO Grupo Modelo" },
      {
        property: "og:description",
        content: "Gestiona tus ciclos Plan-Do-Check-Act de mejora continua en un solo lugar.",
      },
      { property: "og:image", content: "https://maz-pdca-hub.web.app/logos/MAZ.jpeg" },
      { property: "og:image:secure_url", content: "https://maz-pdca-hub.web.app/logos/MAZ.jpeg" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:image", content: "https://maz-pdca-hub.web.app/logos/MAZ.jpeg" },
    ],
  }),
  component: MisPdcas,
});

function MisPdcas() {
  const { currentUser } = useAuth();
  // ← Single shared listener from PdcaProvider, no duplicate subscription
  const { pdcaList, allPdcas } = usePdcas();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Phase | "Todas">("Todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deadlinePickerOpenId, setDeadlinePickerOpenId] = useState<string | null>(null);

  const isAdmin = currentUser?.role === "admin";
  // Admin sees all PDCAs; regular user sees only their own (already filtered by context)
  const userPdcas = isAdmin ? allPdcas : pdcaList;

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return userPdcas.find((p) => p.id === selectedId) || null;
  }, [selectedId, userPdcas]);

  const metrics = useMemo(() => {
    let activos = 0;
    let cerrados = 0;
    let bloqueFrio = 0;
    let cocimientos = 0;
    let vencidos = 0;
    let aTiempo = 0;

    const today = startOfDay(new Date());

    userPdcas.forEach(p => {
      const isClosed = p.fase === "Act" && p.progreso === 100;
      if (isClosed) {
        cerrados++;
      } else {
        activos++;
        if (p.fechaFinalizacion) {
          try {
            const deadlineDate = parse(p.fechaFinalizacion, "dd/MM/yyyy", new Date());
            if (isValid(deadlineDate)) {
              if (isBefore(deadlineDate, today)) {
                vencidos++;
              } else {
                aTiempo++;
              }
            }
          } catch (e) {}
        }
      }

      const areaStr = p.area.toLowerCase();
      if (areaStr.includes("frio") || areaStr.includes("frío")) {
        bloqueFrio++;
      } else if (areaStr.includes("cocimiento")) {
        cocimientos++;
      }
    });

    return { activos, cerrados, bloqueFrio, cocimientos, vencidos, aTiempo };
  }, [userPdcas]);

  const rows = useMemo(
    () =>
      userPdcas.filter((p) => {
        const matchPhase = filter === "Todas" || p.fase === filter;
        const q = query.toLowerCase();
        const matchQuery =
          !q ||
          p.titulo.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          (p.autor && p.autor.toLowerCase().includes(q)) ||
          (p.autorEmail && p.autorEmail.toLowerCase().includes(q));

        return matchPhase && matchQuery;
      }),
    [query, filter, userPdcas],
  );

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deletePdcaFromFirestore(deleteId);
      setDeleteId(null);
    }
  };

  const handleDeadlineChange = async (pdcaId: string, date: Date | undefined) => {
    const formatted = date && isValid(date) ? format(date, "dd/MM/yyyy", { locale: es }) : "";
    await updatePdcaDeadline(pdcaId, formatted || null);
    setDeadlinePickerOpenId(null);
  };

  const handleRemoveDeadline = async (e: React.MouseEvent, pdcaId: string) => {
    e.stopPropagation();
    await updatePdcaDeadline(pdcaId, null);
  };

  const openPdca = (p: Pdca | null) => {
    if (p) {
      setSelectedId(p.id);
      setIsCreatingNew(false);
    } else {
      setSelectedId(null);
      setIsCreatingNew(true);
    }
  };

  if (selected || isCreatingNew) {
    return (
      <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
        <PdcaDialog 
          pdca={selected} 
          open={true} 
          onOpenChange={(open) => { 
            if (!open) {
              setSelectedId(null);
              setIsCreatingNew(false);
            } 
          }} 
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1700px] px-6 py-6 sm:px-10 lg:px-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Módulo PDCA
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">Mis PDCAs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {userPdcas.length} ciclos de mejora continua {currentUser?.role === 'admin' ? 'registrados en la plataforma (Vista Global Admin).' : `asignados a ${currentUser?.name || 'ti'}.`}
          </p>
        </div>
        <Button size="lg" className="bg-primary shadow-sm hover:bg-brand-dark" onClick={() => openPdca(null)}>
          <Plus /> Crear Nuevo PDCA
        </Button>
      </header>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {phases.map((phase) => {
          const borderColor = {
            Plan: "border-t-phase-plan",
            Do: "border-t-phase-do",
            Check: "border-t-phase-check",
            Act: "border-t-phase-act",
          }[phase];
          
          return (
            <button
              key={phase}
              type="button"
              onClick={() => setFilter(phase)}
              className={`rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] text-left transition-all hover:scale-[1.01] border-t-4 ${borderColor} ${
                filter === phase ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <PhaseBadge phase={phase} />
                <span className="text-2xl font-bold">
                  {userPdcas.filter((p) => p.fase === phase).length}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Proyectos en fase {phase}
              </p>
            </button>
          );
        })}
      </div>

      {userPdcas.length > 0 && (
        <div className="mt-8 mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Target className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PDCAs Activos</p>
              <h3 className="text-2xl font-bold">{metrics.activos}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">PDCAs Cerrados</p>
              <h3 className="text-2xl font-bold">{metrics.cerrados}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Building className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Por Área (Activos)</p>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400"><Snowflake className="size-3"/> {metrics.bloqueFrio}</span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400"><Flame className="size-3"/> {metrics.cocimientos}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="size-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">Tiempos (Activos)</p>
              <div className="flex items-center gap-3 text-sm font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Clock className="size-3"/> {metrics.aTiempo}</span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><CalendarClock className="size-3"/> {metrics.vencidos}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={currentUser?.role === "admin" ? "Buscar por título, área o autor..." : "Buscar por título o área..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter("Todas")}
            disabled={filter === "Todas"}
          >
            <Filter /> {filter === "Todas" ? "Todas las fases" : `Fase: ${filter}`}
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/80 hover:bg-secondary/80">
              <TableHead className="font-semibold text-foreground/80">Título del Proyecto</TableHead>
              {currentUser?.role === "admin" && (
                <TableHead className="hidden sm:table-cell font-semibold text-foreground/80">Autor / Creador</TableHead>
              )}
              <TableHead className="hidden md:table-cell font-semibold text-foreground/80">Área</TableHead>
              <TableHead className="w-32 font-semibold text-foreground/80">Fase Actual</TableHead>
              <TableHead className="hidden w-36 lg:table-cell font-semibold text-foreground/80">Fecha Límite</TableHead>
              <TableHead className="hidden w-40 lg:table-cell font-semibold text-foreground/80">Actualización</TableHead>
              <TableHead className="w-24 text-right font-semibold text-foreground/80">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className="cursor-pointer transition-colors hover:bg-secondary/30" onClick={() => setSelectedId(p.id)}>
                <TableCell>
                  <span className="block font-semibold">{p.titulo}</span>
                  <span className="mt-0.5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    {p.id}
                    <span className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-secondary sm:block">
                      <span
                        className="block h-full rounded-full bg-primary"
                        style={{ width: `${p.progreso}%` }}
                      />
                    </span>
                    <span className="hidden sm:inline">{p.progreso}%</span>
                  </span>
                </TableCell>
                {currentUser?.role === "admin" && (
                  <TableCell className="hidden sm:table-cell text-xs">
                    <span className="font-medium text-foreground block">{p.autor || "Sin autor"}</span>
                    {p.autorEmail && <span className="text-[11px] text-muted-foreground block">{p.autorEmail}</span>}
                  </TableCell>
                )}
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {p.area}
                </TableCell>
                <TableCell>
                  <PhaseBadge phase={p.fase} />
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {(() => {
                    const deadlineStr = p.fechaFinalizacion?.trim();
                    let deadlineDate: Date | undefined;
                    if (deadlineStr) {
                      const parts = deadlineStr.split("/");
                      if (parts.length === 3) {
                        const parsed = new Date(+parts[2], +parts[1] - 1, +parts[0]);
                        if (isValid(parsed)) deadlineDate = parsed;
                      }
                    }
                    const isExpired = deadlineDate ? isBefore(startOfDay(deadlineDate), startOfDay(new Date())) : false;

                    if (isAdmin) {
                      return (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Popover
                            open={deadlinePickerOpenId === p.id}
                            onOpenChange={(open) => setDeadlinePickerOpenId(open ? p.id : null)}
                          >
                            <PopoverTrigger asChild>
                              <button
                                className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:bg-secondary border ${
                                  isExpired
                                    ? "border-red-400/50 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20"
                                    : deadlineDate
                                    ? "border-border text-foreground bg-transparent"
                                    : "border-dashed border-muted-foreground/40 text-muted-foreground/60 italic"
                                }`}
                              >
                                <CalendarClock className="size-3.5 shrink-0" />
                                {deadlineDate ? (
                                  <>
                                    {deadlineStr}
                                    {isExpired && <span className="ml-1 text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded">Vencida</span>}
                                  </>
                                ) : (
                                  "Asignar fecha"
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start" side="bottom">
                              <CalendarUI
                                mode="single"
                                selected={deadlineDate}
                                onSelect={(date) => handleDeadlineChange(p.id, date)}
                                locale={es}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {deadlineDate && (
                            <button
                              title="Quitar fecha límite"
                              onClick={(e) => handleRemoveDeadline(e, p.id)}
                              className="rounded p-0.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <X className="size-3" />
                            </button>
                          )}
                        </div>
                      );
                    }

                    // Non-admin: read-only display
                    return deadlineDate ? (
                      <span className={`inline-flex items-center gap-1.5 font-medium ${isExpired ? "text-red-500" : "text-foreground"}`}>
                        <Calendar className={`size-3.5 ${isExpired ? "text-red-500" : "text-brand-yellow"}`} />
                        {deadlineStr}
                        {isExpired && <span className="text-[10px] font-bold uppercase bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-1 rounded">Vencida</span>}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/50 italic text-xs">Sin asignar</span>
                    );
                  })()}
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    {p.actualizado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                      Abrir
                    </Button>
                    {currentUser?.role === "admin" && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={(e) => requestDelete(e, p.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No hay PDCAs que coincidan con la búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar PDCA?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este PDCA y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
