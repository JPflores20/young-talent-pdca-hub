import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { PdcaComment } from "@/data/pdca";
import { useAuth } from "@/context/auth-context";

interface PdcaCommentsProps {
  comments: PdcaComment[];
  onAddComment: (text: string) => void;
  onDeleteComment?: (id: string) => void;
}

export function PdcaComments({ comments, onAddComment, onDeleteComment }: PdcaCommentsProps) {
  const [newText, setNewText] = useState("");
  const { currentUser } = useAuth();

  const handleAdd = () => {
    if (!newText.trim()) return;
    onAddComment(newText.trim());
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
                  <span className="font-semibold truncate">{c.userName}</span>
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

      <div className="flex gap-2 pt-2 border-t border-border">
        <Textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          placeholder="Escribe un comentario o duda sobre este PDCA..."
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
  );
}
