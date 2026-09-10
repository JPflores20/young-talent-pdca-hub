import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  card_title: string;
  is_collapsed: boolean;
  on_toggle_collapse: () => void;
  children: React.ReactNode;
  additional_header_node?: React.ReactNode;
}

export const PdcaCollapsibleCard: React.FC<CollapsibleCardProps> = ({
  card_title,
  is_collapsed,
  on_toggle_collapse,
  children,
  additional_header_node,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200">
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border/70 cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={on_toggle_collapse}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-display text-sm font-bold tracking-wide uppercase text-foreground">
            {card_title}
          </span>
          {additional_header_node}
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          aria-label={is_collapsed ? "Expandir sección" : "Colapsar sección"}
        >
          {is_collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
      </div>

      <div className={cn("p-5 transition-all", is_collapsed && "hidden")}>
        {children}
      </div>
    </div>
  );
};
