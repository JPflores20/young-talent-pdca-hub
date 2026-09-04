import { PdcaHistoryEvent } from "@/data/pdca";
import { History, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface PdcaHistoryProps {
  history: PdcaHistoryEvent[];
}

export function PdcaHistory({ history }: PdcaHistoryProps) {
  // Sort descending by timestamp (assuming timestamp is ISO string)
  const sortedHistory = [...history].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="size-5 text-primary" />
        <h3 className="font-semibold text-lg">Historial de Actividad</h3>
      </div>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
        {sortedHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4 italic">No hay registros de historial aún.</p>
        ) : (
          sortedHistory.map((item, index) => {
            const date = new Date(item.timestamp);
            const dateFormatted = isNaN(date.getTime()) ? item.timestamp : format(date, "dd MMM yyyy, HH:mm", { locale: es });
            
            return (
              <div key={item.id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-background bg-secondary/80 text-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Clock className="size-4" />
                </div>
                
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-border bg-card shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-primary">{item.userName}</span>
                    <time className="text-xs text-muted-foreground font-medium">{dateFormatted}</time>
                  </div>
                  <p className="text-sm text-foreground/90">{item.action}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
