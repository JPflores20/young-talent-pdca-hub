import React, { useRef } from "react";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProcessMappingSectionProps {
  image: string | null;
  onChange: (base64: string | null) => void;
  title?: string;
  subtitle?: string;
  description?: string;
  isStepCompleted?: boolean;
  onToggleStep?: () => void;
}

export function ProcessMappingSection({ 
  image, 
  onChange,
  title = "Process Mapping",
  subtitle = "Sube tu Process Mapping",
  description = "Adjunta una foto o imagen de tu mapa de proceso (se comprimirá automáticamente).",
  isStepCompleted,
  onToggleStep
}: ProcessMappingSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      
      // Compress the image before saving
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        
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
        
        // JPEG 0.7 gives good compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        onChange(compressedBase64);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-3 mb-2">
        {onToggleStep ? (
          <button 
            type="button" 
            onClick={onToggleStep}
            className={`flex items-center justify-center size-6 rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              isStepCompleted 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "border-muted-foreground/30 text-transparent hover:border-emerald-500/50 hover:bg-emerald-500/10"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : null}
        <h3 className={`font-display text-base font-semibold uppercase tracking-wide flex items-center gap-2 ${isStepCompleted ? "text-emerald-600 dark:text-emerald-400" : ""}`}>
          <span>{title}</span>
          {isStepCompleted && (
            <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
              Completado
            </span>
          )}
        </h3>
      </div>

      <div className="mt-2 relative rounded-xl overflow-hidden border border-border/50 bg-secondary/10 flex flex-col items-center justify-center p-6 min-h-[200px]">
        {image ? (
          <div className="relative w-full flex justify-center group">
            <img 
              src={image} 
              alt={title} 
              className="max-h-[500px] object-contain rounded-md border shadow-sm"
            />
            <Button 
              variant="destructive" 
              size="icon" 
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full h-8 w-8"
              onClick={() => onChange(null)}
              title="Eliminar imagen"
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="size-12 rounded-full bg-background border shadow-sm flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="size-5 text-primary/60" />
            </div>
            <h4 className="font-semibold text-foreground">{subtitle}</h4>
            <p className="text-sm max-w-sm mx-auto mt-1 text-muted-foreground mb-4">
              {description}
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
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
    </div>
  );
}
