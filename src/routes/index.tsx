import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Filter, Calendar, Trash2 } from "lucide-react";

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
import { PhaseBadge } from "@/components/pdca-badge";

import { PdcaDialog } from "@/components/pdca-dialog";
import { pdcas, phases, type Pdca, type Phase } from "@/data/pdca";

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
    ],
  }),
  component: MisPdcas,
});

function MisPdcas() {
  const [pdcaList, setPdcaList] = useState<Pdca[]>(pdcas);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Phase | "Todas">("Todas");
  const [selected, setSelected] = useState<Pdca | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      pdcaList.filter(
        (p) =>
          (filter === "Todas" || p.fase === filter) &&
          (p.titulo.toLowerCase().includes(query.toLowerCase()) ||
            p.area.toLowerCase().includes(query.toLowerCase())),
      ),
    [query, filter, pdcaList],
  );

  const requestDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setPdcaList(prev => prev.filter(p => p.id !== deleteId));
      setDeleteId(null);
    }
  };

  const openPdca = (p: Pdca | null) => {
    setSelected(p);
  };

  if (selected) {
    return (
      <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
        <PdcaDialog 
          pdca={selected} 
          open={true} 
          onOpenChange={(open) => { if (!open) setSelected(null); }} 
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Módulo PDCA
          </p>
          <h1 className="mt-1 text-3xl font-bold uppercase">Mis PDCAs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pdcaList.length} ciclos de mejora continua asignados a Ana López.
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
              onClick={() => setFilter(filter === phase ? "Todas" : phase)}
              className={`rounded-xl border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-all hover:shadow-md hover:-translate-y-0.5 border-t-[5px] ${
                filter === phase ? "border-primary ring-1 ring-primary/20" : borderColor
              }`}
            >
              <div className="flex items-center justify-between">
                <PhaseBadge phase={phase} />
                <span className="font-display text-2xl font-bold">
                  {pdcaList.filter((p) => p.fase === phase).length}
                </span>
              </div>
              <p className="mt-3 text-[13px] font-medium leading-tight text-foreground/70">
                {
                  {
                    Plan: "En definición de problema y causa raíz",
                    Do: "Ejecutando el plan de acción",
                    Check: "Verificando resultados con datos",
                    Act: "Estandarizando y cerrando",
                  }[phase]
                }
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por título o área…"
              className="pl-9"
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
              <TableHead className="hidden md:table-cell font-semibold text-foreground/80">Área</TableHead>
              <TableHead className="w-32 font-semibold text-foreground/80">Fase Actual</TableHead>
              <TableHead className="hidden w-36 lg:table-cell font-semibold text-foreground/80">Fecha Límite</TableHead>
              <TableHead className="hidden w-40 lg:table-cell font-semibold text-foreground/80">Actualización</TableHead>
              <TableHead className="w-24 text-right font-semibold text-foreground/80">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow key={p.id} className="cursor-pointer transition-colors hover:bg-secondary/30" onClick={() => setSelected(p)}>
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
                <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                  {p.area}
                </TableCell>
                <TableCell>
                  <PhaseBadge phase={p.fase} />
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {p.fechaFinalizacion ? (
                    <span className="inline-flex items-center gap-1.5 text-foreground font-medium">
                      <Calendar className="size-3.5 text-brand-yellow" /> {p.fechaFinalizacion}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50 italic text-xs">Sin asignar</span>
                  )}
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
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={(e) => requestDelete(e, p.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
