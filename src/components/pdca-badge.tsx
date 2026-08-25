import { cn } from "@/lib/utils";
import { phaseStyles, type Phase } from "@/data/pdca";

export function PhaseBadge({ phase, className }: { phase: Phase; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        phaseStyles[phase],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {phase}
    </span>
  );
}
