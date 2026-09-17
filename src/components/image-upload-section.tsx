import React, { useRef } from "react";
import { UploadCloud, Image as ImageIcon, X, Plus, ZoomIn, ZoomOut, RotateCcw, FileSpreadsheet, FileText, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
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
  DialogTitle,
} from "@/components/ui/dialog";
import { StepCard } from "@/components/ui/step-card";

interface ImageUploadSectionProps {
  image: string | null;
  onChange: (base64: string | null) => void;
  title?: string;
  subtitle?: string;
  description?: string;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

export function ImageUploadSection({ 
  image, 
  onChange,
  title = "Imagen Adjunta",
  subtitle = "Sube tu imagen",
  description = "Adjunta una foto o imagen (se comprimirá y guardará automáticamente).",
  isStepCompleted,
  onToggleStep
}: ImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    try {
      setIsUploading(true);
      
      const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("@/lib/firebase");
      
      const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);

      const compressedFile = await compressImage(file);
      
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `uploads/pdca_images/${uniqueId}.${fileExt}`;
      const storageRef = ref(storage, fileName);

      const uploadTask = uploadBytesResumable(storageRef, compressedFile);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
          console.error("Error al subir archivo:", error);
          setIsUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(downloadURL);
          setIsUploading(false);
        }
      );
    } catch (err) {
      console.error("Error procesando imagen:", err);
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!image && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (image || isUploading) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Helper to compress image before uploading
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 2048;
          const MAX_HEIGHT = 2048;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Error al comprimir la imagen"));
          }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
        };
        img.onerror = () => reject(new Error("Error cargando imagen"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error leyendo archivo"));
      reader.readAsDataURL(file);
    });
  };

  return (
    <StepCard 
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
    >

      <div 
        className={`mt-2 relative rounded-xl overflow-hidden border ${isDragging ? 'border-primary border-dashed bg-primary/10' : 'border-border/50 bg-secondary/10'} transition-colors flex flex-col items-center justify-center p-6 min-h-[200px]`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {image ? (
          <div className="relative w-full flex justify-center group">
            <Dialog>
              <DialogTrigger asChild>
                <img 
                  src={image} 
                  alt={title} 
                  className="max-h-[500px] object-contain rounded-md border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  title="Clic para ver imagen completa"
                />
              </DialogTrigger>
              <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center !rounded-none">
                <DialogTitle className="sr-only">Ver imagen completa</DialogTitle>
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <TransformWrapper initialScale={1} minScale={0.5} maxScale={10} centerZoomedOut={true}>
                    {({ zoomIn, zoomOut, resetTransform }) => (
                      <>
                        <div className="absolute bottom-4 right-4 z-50 flex gap-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md border shadow-sm">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => zoomIn()}>
                            <ZoomIn className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => zoomOut()}>
                            <ZoomOut className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => resetTransform()}>
                            <RotateCcw className="size-4" />
                          </Button>
                        </div>
                            <TransformComponent wrapperClass="w-full h-screen !flex items-center justify-center cursor-move">
                              <img 
                                src={image} 
                                alt={title} 
                                className="w-full h-full object-contain bg-white shadow-2xl" 
                                style={{ willChange: "transform", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
                              />
                            </TransformComponent>
                      </>
                    )}
                  </TransformWrapper>
                </div>
              </DialogContent>
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8 shadow-md"
                  title="Eliminar imagen"
                >
                  <X className="size-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Estás seguro de que deseas eliminar esta imagen? Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onChange(null)}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : isUploading ? (
          <div className="text-center py-8">
            <div className="size-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground">Subiendo imagen...</p>
            <p className="text-xs text-muted-foreground mt-1">Por favor espera un momento</p>
          </div>
        ) : (
          <div className="text-center pointer-events-none">
            <div className={`size-12 rounded-full ${isDragging ? 'bg-primary/20 text-primary' : 'bg-background text-primary/60'} border shadow-sm flex items-center justify-center mx-auto mb-3 transition-colors`}>
              <ImageIcon className="size-5" />
            </div>
            <h4 className="font-semibold text-foreground">{isDragging ? 'Suelta la imagen aquí' : subtitle}</h4>
            <p className="text-sm max-w-sm mx-auto mt-1 text-muted-foreground mb-4">
              {isDragging ? 'Se subirá y comprimirá automáticamente.' : description}
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="gap-2 pointer-events-auto"
              disabled={isUploading}
            >
              <UploadCloud className="size-4" />
              Seleccionar archivo
            </Button>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
    </StepCard>
  );
}

const OFFICE_MIME_TYPES = [
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

export const ALL_ACCEPT_STRING = 'image/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,.xlsx,.xls,.pptx,.ppt';

function getFileTypeInfo(url: string): { type: 'image' | 'pdf' | 'excel' | 'powerpoint' | 'document'; label: string } {
  const lower = url.toLowerCase();
  if (lower.includes('.pdf')) return { type: 'pdf', label: 'PDF' };
  if (lower.includes('.xlsx') || lower.includes('.xls')) return { type: 'excel', label: 'Excel' };
  if (lower.includes('.pptx') || lower.includes('.ppt')) return { type: 'powerpoint', label: 'PowerPoint' };
  if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png') || lower.includes('.gif') || lower.includes('.webp') || lower.includes('.svg') || lower.includes('.bmp')) return { type: 'image', label: 'Imagen' };
  // Firebase URLs may not have file extensions – check for common image hosting patterns
  if (lower.includes('firebasestorage') && !lower.includes('.pdf') && !lower.includes('.xls') && !lower.includes('.ppt')) return { type: 'image', label: 'Imagen' };
  return { type: 'document', label: 'Documento' };
}

function FileTypeIcon({ fileType, className }: { fileType: string; className?: string }) {
  switch (fileType) {
    case 'pdf':
      return <div className={`rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center ${className}`}><FileText className="size-5 text-red-600 dark:text-red-400" /></div>;
    case 'excel':
      return <div className={`rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center ${className}`}><FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" /></div>;
    case 'powerpoint':
      return <div className={`rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center ${className}`}><Presentation className="size-5 text-orange-600 dark:text-orange-400" /></div>;
    default:
      return <div className={`rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}><FileText className="size-5 text-gray-600 dark:text-gray-400" /></div>;
  }
}

interface MultiImageUploadSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
  title?: string;
  subtitle?: string;
  description?: string;
  maxImages?: number;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
  /** Custom accept string for the file input. When set, also updates file validation. */
  acceptTypes?: string;
}

export function MultiImageUploadSection({ 
  images = [], 
  onChange,
  title = "Imágenes Adjuntas",
  subtitle = "Sube tus imágenes",
  description = "Adjunta fotos o imágenes (se comprimirán y guardarán automáticamente).",
  maxImages = 6,
  isStepCompleted,
  onToggleStep,
  acceptTypes,
}: MultiImageUploadSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const resolvedAccept = acceptTypes || 'image/*,application/pdf';
  
  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(f => {
      if (f.type.startsWith('image/')) return true;
      if (f.type === 'application/pdf') return true;
      if (acceptTypes && OFFICE_MIME_TYPES.includes(f.type)) return true;
      // Fallback: check extension
      const ext = f.name.split('.').pop()?.toLowerCase();
      if (ext && ['pdf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return true;
      return false;
    });
    if (!validFiles.length) return;

    const remainingSlots = maxImages - images.length;
    const filesToUpload = validFiles.slice(0, remainingSlots);

    if (filesToUpload.length === 0) return;

    try {
      setIsUploading(true);
      
      const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
      const { storage } = await import("@/lib/firebase");
      
      const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement("canvas");
              let width = img.width;
              let height = img.height;
              const MAX_WIDTH = 2048;
              const MAX_HEIGHT = 2048;
              if (width > height) {
                if (width > MAX_WIDTH) {
                  height *= MAX_WIDTH / width;
                  width = MAX_WIDTH;
                }
              } else {
                if (height > MAX_HEIGHT) {
                  width *= MAX_HEIGHT / height;
                  height = MAX_HEIGHT;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              ctx?.drawImage(img, 0, 0, width, height);
              canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Error al comprimir la imagen"));
              }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
            };
            img.onerror = () => reject(new Error("Error cargando imagen"));
            img.src = event.target?.result as string;
          };
          reader.onerror = () => reject(new Error("Error leyendo archivo"));
          reader.readAsDataURL(file);
        });
      };

      const newUrls: string[] = [];

      for (const file of filesToUpload) {
        const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
        let finalFile: Blob = file;
        let fileExt = file.name.split('.').pop() || 'file';

        if (file.type.startsWith('image/')) {
          finalFile = await compressImage(file);
          fileExt = file.name.split('.').pop() || 'jpg';
        }

        const fileName = `uploads/pdca_images/${uniqueId}.${fileExt}`;
        const storageRef = ref(storage, fileName);

        const uploadTask = await uploadBytesResumable(storageRef, finalFile);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        newUrls.push(downloadURL);
      }
      
      onChange([...images, ...newUrls]);
    } catch (err) {
      console.error("Error procesando imágenes:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading && images.length < maxImages) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (isUploading || images.length >= maxImages) return;
    
    const files = Array.from(e.dataTransfer.files || []);
    processFiles(files);
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, i) => i !== indexToRemove));
  };

  return (
    <StepCard 
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      headerRight={
        <span className="text-xs normal-case font-normal text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full mr-2">
          {images.length} de {maxImages}
        </span>
      }
    >
      {(subtitle || description) && (
        <div className="mb-4">
          {subtitle && <p className="text-sm font-semibold text-foreground">{subtitle}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={resolvedAccept} 
        multiple
        className="hidden" 
      />

      {images.length === 0 ? (
        <div 
          className={`relative rounded-xl border-2 border-dashed ${isDragging ? 'border-primary bg-primary/10' : 'border-border/60 bg-secondary/10 hover:bg-secondary/30'} transition-all flex flex-col items-center justify-center p-10 min-h-[200px] cursor-pointer group`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="text-center">
              <div className="size-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-foreground">Subiendo imágenes...</p>
              <p className="text-xs text-muted-foreground mt-1">Por favor espera</p>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center pointer-events-none">
              <div className={`size-14 rounded-full ${isDragging ? 'bg-primary/20 text-primary scale-110' : 'bg-background text-primary/60'} border shadow-sm flex items-center justify-center mb-4 transition-all group-hover:scale-105 group-hover:border-primary/40 group-hover:text-primary`}>
                <UploadCloud className="size-6 transition-colors" />
              </div>
              <h4 className="font-semibold text-foreground">{isDragging ? 'Suelta las imágenes aquí' : 'No hay evidencias'}</h4>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                {isDragging ? 'Se subirán y comprimirán automáticamente.' : `Haz clic aquí o arrastra para adjuntar tus fotos o capturas (hasta ${maxImages}).`}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, i) => {
            const fileInfo = getFileTypeInfo(img);
            return (
            <div key={i} className="relative aspect-video rounded-xl overflow-hidden border bg-black/5 group shadow-sm">
              {fileInfo.type !== 'image' ? (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                  onClick={() => window.open(img, '_blank')}
                  title={`Clic para abrir ${fileInfo.label} en nueva pestaña`}
                >
                  <FileTypeIcon fileType={fileInfo.type} className="size-12 mb-2" />
                  <span className="text-xs font-semibold text-foreground">
                    {fileInfo.label}
                  </span>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <img 
                      src={img} 
                      alt={`Evidencia ${i + 1}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                      title="Clic para ver imagen completa"
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black/95 border-none shadow-none flex items-center justify-center !rounded-none">
                    <DialogTitle className="sr-only">Ver evidencia {i + 1}</DialogTitle>
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                      <TransformWrapper initialScale={1} minScale={0.5} maxScale={10} centerZoomedOut={true}>
                        {({ zoomIn, zoomOut, resetTransform }) => (
                          <>
                            <div className="absolute bottom-4 right-4 z-50 flex gap-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-md border shadow-sm">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => zoomIn()}>
                                <ZoomIn className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => zoomOut()}>
                                <ZoomOut className="size-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={() => resetTransform()}>
                                <RotateCcw className="size-4" />
                              </Button>
                            </div>
                            <TransformComponent wrapperClass="w-full h-screen !flex items-center justify-center cursor-move">
                              <img 
                                src={img} 
                                alt={`Evidencia ${i + 1}`} 
                                className="w-full h-full object-contain bg-white shadow-2xl"
                                style={{ willChange: "transform", transform: "translateZ(0)", backfaceVisibility: "hidden" }}
                              />
                            </TransformComponent>
                          </>
                        )}
                      </TransformWrapper>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all rounded-full h-7 w-7 shadow-md scale-90 hover:scale-100"
                    title="Eliminar imagen"
                  >
                    <X className="size-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      ¿Estás seguro de que deseas eliminar esta imagen de evidencia? Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => removeImage(i)}>Eliminar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          );
          })}
          
          {images.length < maxImages && (
            <div 
              className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed ${isDragging ? 'border-primary bg-primary/10' : 'border-border/60 bg-secondary/10 hover:bg-secondary/30'} transition-all flex flex-col items-center justify-center p-4 cursor-pointer group`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="text-center">
                  <div className="size-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-foreground">Subiendo...</p>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center pointer-events-none">
                  <div className={`size-10 rounded-full ${isDragging ? 'bg-primary/20 text-primary scale-110' : 'bg-background text-primary/60'} border shadow-sm flex items-center justify-center mb-2 transition-all group-hover:scale-105 group-hover:text-primary`}>
                    <Plus className="size-4 transition-colors" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{isDragging ? 'Soltar aquí' : 'Añadir más'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </StepCard>
  );
}
