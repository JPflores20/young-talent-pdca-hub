import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
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
import { 
  subscribeToPdcas, 
  deletePdcaFromFirestore 
} from "@/services/pdca-service";
import { phases, type Pdca, type Phase } from "@/data/pdca";

import { useAuth } from "@/context/auth-context";

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
  const [pdcaList, setPdcaList] = useState<Pdca[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Phase | "Todas">("Todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToPdcas((updatedPdcas) => {
      setPdcaList(updatedPdcas);
    });
    return () => unsubscribe();
  }, []);

  const userPdcas = useMemo(() => {
    if (!currentUser) return pdcaList;
    if (currentUser.role === "admin") return pdcaList;

    const userEmailLower = currentUser.email.toLowerCase();
    return pdcaList.filter((p) => {
      if (!p.autorEmail) return true;
      return p.autorEmail.toLowerCase() === userEmailLower || p.autor === currentUser.name;
    });
  }, [pdcaList, currentUser]);

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return pdcaList.find((p) => p.id === selectedId) || null;
  }, [selectedId, pdcaList]);

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
