import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  card_title: string;
  is_collapsed?: boolean;
  on_toggle_collapse?: () => void;
  children: React.ReactNode;
  additional_header_node?: React.ReactNode;
}

export const PdcaCollapsibleCard: React.FC<CollapsibleCardProps> = ({
  card_title,
  is_collapsed = true, // Por defecto nacen cerradas
  on_toggle_collapse,
  children,
  additional_header_node,
}) => {
  // ESTADO LOCAL: Aísla la tarjeta de los autoguardados del padre.
  // Solo usa 'is_collapsed' para el valor inicial de la primera vez que carga.
  const [internalCollapsed, setInternalCollapsed] = useState(is_collapsed);

  const handleToggle = () => {
    setInternalCollapsed(!internalCollapsed);
    if (on_toggle_collapse) {
      on_toggle_collapse();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200">
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border/70 cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={handleToggle}
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
          aria-label={internalCollapsed ? "Expandir sección" : "Colapsar sección"}
        >
          {internalCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
        </button>
      </div>

      <div className={cn("p-5 transition-all", internalCollapsed && "hidden")}>
        {children}
      </div>
    </div>
  );
};