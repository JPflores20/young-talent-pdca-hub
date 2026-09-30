import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function CategoryBox({
  cat,
  causesList,
  onAdd,
  onRemove,
  onLabelChange,
}: {
  cat: { id: string; label: string; position: "top" | "bottom" };
  causesList: string[];
  onAdd: (id: string, value: string) => void;
  onRemove: (id: string, index: number) => void;
  onLabelChange?: (id: string, newLabel: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd(cat.id, inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="w-full flex flex-col rounded-md border border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-secondary/60 px-1 py-1 border-b border-border text-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground focus-within:bg-secondary/80">
        <input
          type="text"
          value={cat.label}
          onChange={(e) => onLabelChange?.(cat.id, e.target.value)}
          className="w-full bg-transparent text-center outline-none uppercase font-display"
        />
      </div>
      <div className="p-2 flex flex-col gap-1.5 min-h-[60px]">
        {causesList.map((cause, i) => (
          <div
            key={i}
            className="group relative flex items-start gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary leading-tight"
          >
            <span className="flex-1 break-words">{cause}</span>
            <button
              type="button"
              onClick={() => onRemove(cat.id, i)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/60 hover:text-destructive shrink-0 mt-0.5"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="+ Causa (Enter)"
          className="h-6 text-[11px] px-1.5 shadow-none border-dashed bg-transparent focus-visible:ring-1"
        />
      </div>
    </div>
  );
}
