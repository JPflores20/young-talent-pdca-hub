import React, { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({ value, onChange, disabled, placeholder, minHeight }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Sync external changes (e.g. when loading from database)
  React.useEffect(() => {
    if (!editorRef.current) return;

    if (!isMounted.current) {
      editorRef.current.innerHTML = value || "";
      isMounted.current = true;
      return;
    }

    if (value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const execCmd = (cmd: string, arg?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, arg);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("bold");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("italic");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertUnorderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            execCmd("insertOrderedList");
          }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>
      </div>
      {/* Área editable */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight: minHeight || "120px" }}
        className="p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder || "Describe el problema observado..."}
      />
    </div>
  );
}
