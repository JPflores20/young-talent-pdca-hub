import React, { useRef, useState } from "react";
import { UploadCloud, X, ZoomIn, Loader2, ImageIcon } from "lucide-react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "./step-instructions";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const MAX_FILES = 10;

interface GembaEvidenciasStepProps {
  images: string[];
  onChange: (images: string[]) => void;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
  title?: string;
  description?: string;
}

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
  const fileName = `uploads/gemba_evidencias/${uniqueId}.${fileExt}`;
  const storageRef = ref(storage, fileName);

  const blob = await compressImage(file);
  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(uploadTask.snapshot.ref)),
    );
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function GembaEvidenciasStep({
  images,
  onChange,
  isStepCompleted,
  onToggleStep,
  title = "PASO 9: GEMBA (EVIDENCIAS)",
  description = "Sube fotos del Gemba o documentos que respalden que el plan de acción se ejecutó correctamente.",
}: GembaEvidenciasStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const canAddMore = images.length < MAX_FILES;

  // ── Procesa un array de Files ─────────────────────────────────────────────
  const processFiles = async (files: FileList | File[]) => {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const slots = MAX_FILES - images.length;
    const toProcess = fileArr.slice(0, slots);
    if (toProcess.length === 0) return;

    setUploadingCount((c) => c + toProcess.length);
    const urls: string[] = [];

    await Promise.all(
      toProcess.map(async (file) => {
        try {
          const url = await uploadToFirebase(file);
          urls.push(url);
        } catch (err) {
          console.error("Error subiendo evidencia:", err);
        } finally {
          setUploadingCount((c) => c - 1);
        }
      }),
    );

    onChange([...images, ...urls]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (canAddMore) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx));
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <span className="text-xs text-muted-foreground font-medium">
          {images.length} de {MAX_FILES}
        </span>
      }
    >
      <StepInstructions>
        <p className="text-muted-foreground text-xs">{description}</p>
      </StepInstructions>

      <div className="mt-4 space-y-4">
        {/* Galería de miniaturas */}
        {(images.length > 0 || uploadingCount > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {images.map((url, idx) => (
              <div
                key={url + idx}
                className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted shadow-sm"
              >
                <img
                  src={url}
                  alt={`Evidencia ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLightboxUrl(url)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
                    title="Ver en grande"
                  >
                    <ZoomIn className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="p-1.5 rounded-full bg-white/20 hover:bg-red-500/80 text-white transition-colors"
                    title="Eliminar"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/40 rounded px-1">
                  {idx + 1}
                </span>
              </div>
            ))}

            {Array.from({ length: uploadingCount }).map((_, i) => (
              <div
                key={`uploading-${i}`}
                className="aspect-square rounded-lg border border-dashed border-border bg-muted flex items-center justify-center"
              >
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ))}
          </div>
        )}

        {/* Zona de arrastre */}
        {canAddMore ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-colors select-none",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/40",
            )}
          >
            {images.length === 0 && uploadingCount === 0 ? (
              <>
                <div className="p-4 rounded-full bg-muted">
                  <UploadCloud className="size-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No hay evidencias</p>
                <p className="text-xs text-center text-primary/80 leading-relaxed px-4">
                  Haz clic aquí o arrastra para adjuntar tus fotos o capturas
                  <br />
                  (hasta {MAX_FILES}).
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ImageIcon className="size-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  + Agregar más fotos ({MAX_FILES - images.length} restantes)
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-center text-muted-foreground py-2">
            Límite de {MAX_FILES} evidencias alcanzado. Elimina alguna para añadir otra.
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Lightbox */}
      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center !rounded-none">
          <DialogTitle className="sr-only">Vista de evidencia</DialogTitle>
          <img
            src={lightboxUrl ?? ""}
            alt="Evidencia en grande"
            className="w-full h-full object-contain"
          />
        </DialogContent>
      </Dialog>
    </StepCard>
  );
}
