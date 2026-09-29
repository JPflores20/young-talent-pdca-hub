import React, { useRef } from "react";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

const FONT_SIZES = [
  { label: "8", value: "1" },
  { label: "10", value: "2" },
  { label: "12", value: "3" },
  { label: "14", value: "4" },
  { label: "18", value: "5" },
  { label: "24", value: "6" },
  { label: "36", value: "7" },
];

interface RichTextEditorProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  disabled,
  placeholder = "Escribe aquí...",
  minHeight = "140px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

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
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30 flex-wrap">
        {/* Bold */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd("bold"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Negrita"
        >
          <Bold className="size-3.5" />
        </button>
        {/* Italic */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd("italic"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Itálica"
        >
          <Italic className="size-3.5" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Unordered list */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd("insertUnorderedList"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista de viñetas"
        >
          <List className="size-3.5" />
        </button>
        {/* Ordered list */}
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd("insertOrderedList"); }}
          className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Lista numerada"
        >
          <ListOrdered className="size-3.5" />
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Font size */}
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-medium">Tamaño:</span>
          <select
            className="h-6 rounded border border-border bg-background text-xs px-1 focus:outline-none cursor-pointer"
            defaultValue="3"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              execCmd("fontSize", e.target.value);
            }}
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight }}
        className="p-3 text-sm focus:outline-none prose prose-sm max-w-none"
        data-placeholder={placeholder}
      />

      {/* Placeholder style */}
      <style>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
