import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { PdcaComment } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const PDCA_STEPS = [
  "General",
  "Paso 1: Definición del problema",
  "Paso 2: Meta",
  "Paso 3: Análisis y desdoblamiento",
  "Paso 4: Mapeo de Proceso",
  "Paso 5: VPO Checkpoints",
  "Paso 6: Ishikawa",
  "Paso 7: 5 Por Qués",
  "Paso 8.1: Matriz de impacto",
  "Paso 8.2: Plan de acción",
  "Paso 9: Gemba (Evidencias)",
  "Paso 10: KPI Final",
  "Paso 11: Gemba Final",
];

interface PdcaCommentsProps {
  comments: PdcaComment[];
  onAddComment: (text: string, stepTitle?: string) => void;
  onDeleteComment?: (id: string) => void;
}

export function PdcaComments({ comments, onAddComment, onDeleteComment }: PdcaCommentsProps) {
  const [newText, setNewText] = useState("");
  const [selectedStep, setSelectedStep] = useState<string>("General");
  const { currentUser } = useAuth();

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAddComment(newText.trim(), selectedStep === "General" ? undefined : selectedStep);
    setNewText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="size-5 text-primary" />
        <h3 className="font-semibold text-lg">Comentarios y Foro</h3>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 italic">No hay comentarios aún. ¡Sé el primero en participar!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex gap-3 bg-secondary/30 p-3 rounded-lg border border-border/50 text-sm">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold shadow-sm">
                {c.userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{c.userName}</span>
                    {c.stepTitle && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 bg-background">
                        {c.stepTitle}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{c.timestamp}</span>
                </div>
                <p className="mt-1 text-foreground/90 whitespace-pre-wrap">{c.text}</p>
              </div>
              {onDeleteComment && (currentUser?.role === "admin" || currentUser?.email === c.userId) && (
                <button onClick={() => onDeleteComment(c.id)} className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2 border-t border-border">
        <div className="flex gap-2">
          <Select value={selectedStep} onValueChange={setSelectedStep}>
            <SelectTrigger className="w-[200px] h-8 text-xs shrink-0">
              <SelectValue placeholder="Selecciona un paso" />
            </SelectTrigger>
            <SelectContent>
              {PDCA_STEPS.map((step) => (
                <SelectItem key={step} value={step} className="text-xs">
                  {step}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder={`Escribe un comentario sobre ${selectedStep === "General" ? "el PDCA en general" : selectedStep}...`}
            className="min-h-[40px] h-[40px] py-2 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button onClick={handleAdd} disabled={!newText.trim()} className="shrink-0 h-[40px] px-3">
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
