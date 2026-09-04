import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepCardProps {
  title: React.ReactNode;
  isStepCompleted?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  children: React.ReactNode;
  defaultExpanded?: boolean | undefined;
  className?: string | undefined;
  headerRight?: React.ReactNode;
}

export type { StepCardProps };

export function StepCard({
  title,
  isStepCompleted,
  onToggleStep,
  children,
  defaultExpanded = true,
  className,
  headerRight
}: StepCardProps) {
  const storageKey = React.useMemo(() => {
    if (typeof title === "string") {
      return `pdca_step_${title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;
    }
    return null;
  }, [title]);

  const [isExpanded, setIsExpanded] = React.useState(() => {
    if (storageKey) {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === "true";
      }
    }
    return defaultExpanded;
  });

  const toggleExpanded = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    if (storageKey) {
      localStorage.setItem(storageKey, String(nextState));
    }
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-all", className)}>
      <div 
        className="flex items-center justify-between cursor-pointer select-none group"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-3">
          {onToggleStep !== undefined && (
            <button 
              type="button" 
              onClick={(e) => {
                e.stopPropagation();
                onToggleStep();
              }}
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
          )}
          <h3 className={cn("font-display text-base font-semibold uppercase tracking-wide flex flex-wrap items-center gap-2", isStepCompleted ? "text-emerald-600 dark:text-emerald-400" : "")}>
            <span>{title}</span>
            {isStepCompleted && (
              <span className="text-xs font-normal normal-case px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans">
                Completado
              </span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {headerRight && (
            <div onClick={(e) => e.stopPropagation()}>
              {headerRight}
            </div>
          )}
          <div 
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary/80 transition-colors"
          >
            <ChevronDown className={cn("h-5 w-5 transition-transform duration-200", isExpanded ? "rotate-180" : "rotate-0")} />
          </div>
        </div>
      </div>

      <div className={cn("grid transition-all duration-300 ease-in-out", isExpanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0")}>
        <div className="overflow-hidden">
          <div className="space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
