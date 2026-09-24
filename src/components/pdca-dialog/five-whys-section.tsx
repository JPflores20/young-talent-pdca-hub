import { useEffect, useState, useMemo, useCallback, useRef, Fragment } from "react";
import {
  Check,
  UploadCloud,
  Paperclip,
  Plus,
  Save,
  ArrowRight,
  ArrowDown,
  MinusCircle,
  X,
  RefreshCw,
  FileText,
  Maximize2,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ComposedChart,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceArea,
  Cell,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PdcaComments } from "../pdca-comments";
import { PdcaHistory } from "../pdca-history";
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
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PhaseBadge } from "@/components/pdca-badge";
import {
  phases,
  DEFAULT_TARGET_VS_ACTUAL,
  DEFAULT_PARETO_DATA_MAP,
  DEFAULT_VPO_CHECKPOINTS,
  DEFAULT_PARTICIPANTES,
  type ParticipantesData,
  type ActionItem,
  type Pdca,
  type Phase,
  type ParetoItem,
  type VpoCheckpointItem,
  type DefinicionMeta,
  type ImpactMatrixRow,
  type FiveWhysTableData,
  type IshikawaItem,
} from "@/data/pdca";
import {
  PdcaGoalDefinition,
  PdcaParticipants,
  DEFAULT_DEFINICION_META,
} from "@/components/pdca-goal-definition";
import { KpiTreeInteractive } from "../kpi-tree";
import { ActionKanban } from "../action-kanban";
// Removed firestore imports
import { db } from "@/lib/firebase";
import { GopThemesSection } from "../GopThemesSection";
import { ImageUploadSection, MultiImageUploadSection } from "../image-upload-section";
import { DatePicker } from "@/components/ui/date-picker";
import { savePdcaToFirestore } from "@/services/pdca-service";
import { useAuth } from "@/context/auth-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StepCard } from "@/components/ui/step-card";
import { AutoResizeTextarea } from "./auto-resize-textarea";

// ─── Comprimir imagen antes de subir ─────────────────────────────────────────
function compressImage(file: File, maxWidth = 2048, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compresión fallida"))),
          "image/jpeg",
          quality,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// ─── Subir imagen a Firebase Storage ─────────────────────────────────────────
async function uploadToFirebase(file: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `uploads/five_whys_evidencias/${uniqueId}.${fileExt}`;
  const storageRef = ref(storage, fileName);

  let blobToUpload: Blob = file;
  if (file.type.startsWith("image/")) {
    blobToUpload = await compressImage(file);
  }

  const uploadTask = uploadBytesResumable(storageRef, blobToUpload);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(uploadTask.snapshot.ref)),
    );
  });
}

export function FiveWhysSection({
  tables,
  onChange,
  isStepCompleted,
  onToggleStep,
}: {
  tables: FiveWhysTableData[];
  onChange: (tables: FiveWhysTableData[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}) {
  const addTable = () => {
    const newId = `fivewhys-${Date.now()}`;
    onChange([
      ...tables,
      {
        id: newId,
        title: "MÉTODO",
        rows: [
          {
            id: Date.now(),
            q1: "",
            q2: "",
            q3: "",
            q4: "",
            q5: "",
            w1: "",
            w2: "",
            w3: "",
            w4: "",
            w5: "",
            accion: "",
          },
        ],
      },
    ]);
  };

  const updateTable = (id: string, newRows: any[]) => {
    onChange(tables.map((t) => (t.id === id ? { ...t, rows: newRows } : t)));
  };

  const updateTitle = (id: string, newTitle: string) => {
    onChange(tables.map((t) => (t.id === id ? { ...t, title: newTitle } : t)));
  };

  const removeTable = (id: string) => {
    if (tables.length === 1) return;
    onChange(tables.filter((t) => t.id !== id));
  };

  return (
    <StepCard
      className="overflow-hidden"
      title="PASO 15: 5 WHY'S"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >
      <div className="space-y-8">
        {tables.map((table, index) => (
          <div key={table.id} className="pt-4">
            <FiveWhysInteractive
              value={table.rows}
              onChange={(rows) => updateTable(table.id, rows)}
              title={table.title}
              onTitleChange={(title) => updateTitle(table.id, title)}
              index={index}
              onRemoveTable={tables.length > 1 ? () => removeTable(table.id) : undefined}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={addTable}
          className="border-dashed border-2 hover:border-primary hover:bg-primary/5"
        >
          <Plus className="size-4 mr-2" /> Agregar otra tabla 5 Whys
        </Button>
      </div>
    </StepCard>
  );
}

export function FiveWhysInteractive({
  value,
  onChange,
  title,
  onTitleChange,
  index,
  onRemoveTable,
}: {
  value?: any[];
  onChange?: (whys: any[]) => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  index: number;
  onRemoveTable?: (() => void) | undefined;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [uploadingRows, setUploadingRows] = useState<Set<number>>(new Set());

  const updateRow = (id: number, field: string, val: string) => {
    if (!value || !onChange) return;
    onChange(value.map((r: any) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const addRow = () => {
    if (onChange && value) {
      onChange([
        ...value,
        {
          id: Date.now(),
          q1: "",
          q2: "",
          q3: "",
          q4: "",
          q5: "",
          w1: "",
          w2: "",
          w3: "",
          w4: "",
          w5: "",
          accion: "",
        },
      ]);
    }
  };

  const removeRow = (id: number) => {
    if (onChange && value) {
      if (value.length === 1) return;
      onChange(value.filter((r: any) => r.id !== id));
    }
  };

  const whysCount = Math.max(
    5,
    ...(value || []).flatMap((r: any) =>
      Object.keys(r)
        .filter((k) => k.startsWith("q"))
        .map((k) => parseInt(k.substring(1)))
        .filter((n) => !isNaN(n)),
    ),
  );

  const addWhyColumn = () => {
    if (onChange && value) {
      const nextWhy = whysCount + 1;
      onChange(value.map((r: any) => ({ ...r, [`q${nextWhy}`]: "", [`w${nextWhy}`]: "" })));
    }
  };

  const removeWhyColumn = () => {
    if (onChange && value && whysCount > 5) {
      onChange(
        value.map((r: any) => {
          const newRow = { ...r };
          delete newRow[`q${whysCount}`];
          delete newRow[`w${whysCount}`];
          return newRow;
        }),
      );
    }
  };

  const tableContent = (
    <div
      className={cn(
        "overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background shadow-sm flex-1",
        isFullscreen ? "flex flex-col h-full" : "",
      )}
    >
      <div className="flex justify-between items-center px-2 py-1 bg-white dark:bg-background border-b border-[#0078D7]">
        <input
          type="text"
          value={title || "MÉTODO"}
          onChange={(e) => onTitleChange?.(e.target.value)}
          className="text-[11px] font-bold text-[#0078D7] uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 p-0.5 w-48"
          placeholder="TÍTULO DE LA TABLA"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
              onClick={addWhyColumn}
            >
              <Plus className="mr-1 size-3" /> Añadir Por Qué
            </Button>
            {whysCount > 5 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
                onClick={removeWhyColumn}
              >
                <MinusCircle className="mr-1 size-3" /> Quitar Por Qué
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
            onClick={addRow}
          >
            <Plus className="mr-1 size-3" /> Añadir Causa
          </Button>
          {onRemoveTable && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold"
                >
                  <X className="mr-1 size-3" /> Eliminar Tabla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar tabla 5 Whys?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Se eliminarán permanentemente todas las
                    preguntas y respuestas registradas en esta tabla.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onRemoveTable}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!isFullscreen && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold"
              onClick={() => setIsFullscreen(true)}
            >
              <Maximize2 className="mr-1 size-3" /> Expandir
            </Button>
          )}
          <span className="text-[11px] font-bold text-[#0078D7] uppercase">
            TEMA {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            {Array.from({ length: whysCount }).map((_, i) => (
              <th
                key={i}
                className="font-bold uppercase text-center border-r border-white/20 p-2 text-[10px] min-w-[150px]"
              >
                {i + 1}º POR QUÉ
              </th>
            ))}
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">
              CAUSA RAÍZ
            </th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[150px] border-r border-white/20">
              ACCION(ES)
            </th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {value?.map((row: any) => (
            <Fragment key={row.id}>
              {/* Fila de Preguntas */}
              <tr className="border-b border-white group">
                {Array.from({ length: whysCount }).map((_, i) => (
                  <td
                    key={`q-${i}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      row.isRootCause === "Sí"
                        ? "bg-red-50 dark:bg-red-950/30"
                        : row.isRootCause === "No"
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-blue-100/50 dark:bg-blue-900/20",
                    )}
                  >
                    <AutoResizeTextarea
                      value={row[`q${i + 1}`] || ""}
                      onChange={(val) => updateRow(row.id, `q${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-semibold focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/60 overflow-hidden"
                      placeholder="Pregunta..."
                    />
                  </td>
                ))}
                <td
                  rowSpan={2}
                  className={cn(
                    "p-1 border-r border-white align-middle text-center min-w-[80px]",
                    row.isRootCause === "Sí"
                      ? "bg-red-100 dark:bg-red-900/40"
                      : row.isRootCause === "No"
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-[#E2E2E2] dark:bg-secondary",
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Button
                      variant={row.isRootCause === "Sí" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateRow(row.id, "isRootCause", row.isRootCause === "Sí" ? "" : "Sí")
                      }
                      className={cn(
                        "h-6 w-12 text-[10px] px-0",
                        row.isRootCause === "Sí"
                          ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                          : "hover:bg-red-50 hover:text-red-600",
                      )}
                    >
                      SÍ
                    </Button>
                    <Button
                      variant={row.isRootCause === "No" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        updateRow(row.id, "isRootCause", row.isRootCause === "No" ? "" : "No")
                      }
                      className={cn(
                        "h-6 w-12 text-[10px] px-0",
                        row.isRootCause === "No"
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          : "hover:bg-green-50 hover:text-green-600",
                      )}
                    >
                      NO
                    </Button>
                  </div>
                </td>
                <td
                  rowSpan={2}
                  className={cn(
                    "p-0 border-r border-white align-top",
                    row.isRootCause === "Sí"
                      ? "bg-red-50 dark:bg-red-950/30"
                      : row.isRootCause === "No"
                        ? "bg-green-50 dark:bg-green-950/30"
                        : "bg-[#E2E2E2] dark:bg-secondary",
                  )}
                >
                  <AutoResizeTextarea
                    value={row.accion || ""}
                    onChange={(val) => updateRow(row.id, "accion", val)}
                    className="w-full min-h-[80px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground overflow-hidden"
                  />
                </td>

                <td rowSpan={2} className="bg-background align-middle">
                  {(value?.length || 0) > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive mx-auto block"
                        >
                          <X className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar fila?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar esta fila? Esta acción no se puede
                            deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeRow(row.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
              {/* Fila de Respuestas */}
              <tr className="border-b-[3px] border-[#0078D7] group">
                {Array.from({ length: whysCount }).map((_, i) => (
                  <td
                    key={`w-${i}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      row.isRootCause === "Sí"
                        ? "bg-red-100 dark:bg-red-900/40"
                        : row.isRootCause === "No"
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-[#E2E2E2] dark:bg-secondary",
                    )}
                  >
                    <AutoResizeTextarea
                      value={row[`w${i + 1}`] || ""}
                      onChange={(val) => updateRow(row.id, `w${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/50 overflow-hidden"
                      placeholder="Respuesta..."
                    />
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      
      <div className="mt-6 p-4">
        <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">Evidencias por Acción</h4>
        {(!value || value.filter(r => r.accion && r.accion.trim() !== "").length === 0) ? (
          <p className="text-xs text-muted-foreground italic">No hay acciones definidas en esta tabla.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {value.filter(r => r.accion && r.accion.trim() !== "").map((row, i) => {
              const existing = row.evidencia;
              const isUploading = uploadingRows.has(row.id);
              const isYes = row.isRootCause === "Sí";
              const isNo = row.isRootCause === "No";
              const cardClass = cn(
                "flex flex-col border rounded-xl p-3",
                isYes ? "bg-red-50 border-red-200" : isNo ? "bg-green-50 border-green-200" : "bg-white border-border"
              );
              const dropzoneClass = cn(
                "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group",
                isYes ? "bg-red-100/50 border-red-300" : isNo ? "bg-green-100/50 border-green-300" : "bg-slate-50 border-slate-200"
              );

              return (
                <div key={row.id} className={cardClass}>
                  <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={row.accion}>
                    {i + 1}. {row.accion}
                  </p>
                  <div className={dropzoneClass}>
                    {existing ? (
                      <>
                        {existing.includes("application/pdf") ? (
                          <a href={existing} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-full text-red-500 font-bold hover:bg-red-50">
                            <FileText className="size-8 mr-2" /> PDF
                          </a>
                        ) : (
                          <img src={existing} alt={`Evidencia ${i + 1}`} className="w-full h-full object-contain" />
                        )}
                        <button
                          onClick={() => updateRow(row.id, "evidencia", "")}
                          className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 hover:bg-white shadow-sm"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : isUploading ? (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <RefreshCw className="size-6 mb-1 animate-spin" />
                        <span className="text-[10px] uppercase font-semibold">Subiendo...</span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                        <UploadCloud className="size-6 mb-1" />
                        <span className="text-[10px] uppercase font-semibold">Subir Foto/PDF</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                setUploadingRows((prev) => new Set(prev).add(row.id));
                                const url = await uploadToFirebase(file);
                                updateRow(row.id, "evidencia", url);
                              } catch (error) {
                                console.error("Error subiendo evidencia:", error);
                              } finally {
                                setUploadingRows((prev) => {
                                  const next = new Set(prev);
                                  next.delete(row.id);
                                  return next;
                                });
                              }
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {!isFullscreen && tableContent}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 sm:p-6 flex flex-col gap-2 overflow-hidden bg-muted/20">
          <DialogHeader className="sr-only">
            <DialogTitle>{title || "5 WHYS"}</DialogTitle>
          </DialogHeader>
          {tableContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
