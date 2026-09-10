/**
 * pareto_data_table.tsx
 * Tabla editable de items del Pareto con porcentajes calculados.
 * Responsabilidad única: renderizar y editar la tabla de datos.
 */
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ParetoDataTableProps } from "./pareto_types";

export function ParetoDataTable({
  pareto_data,
  raw_items,
  on_row_update,
  on_row_remove,
  format_value,
  total_gap,
}: ParetoDataTableProps) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <Table className="text-xs">
        <TableHeader className="bg-secondary/40">
          <TableRow>
            <TableHead className="py-2 px-3">Área / Categoría</TableHead>
            <TableHead className="py-2 px-3 w-24">Valor (Gap)</TableHead>
            <TableHead className="py-2 px-3 w-20">% Ind.</TableHead>
            <TableHead className="py-2 px-3 w-20">% Acum.</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pareto_data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="py-1.5 px-3">
                <Input
                  value={row.area}
                  onChange={(e) => on_row_update(row.id, "area", e.target.value)}
                  placeholder="Ej. Envasado..."
                  className="h-7 text-xs shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background"
                />
              </TableCell>
              <TableCell className="py-1.5 px-3">
                <Input
                  type="number"
                  value={row.gap || ""}
                  onChange={(e) =>
                    on_row_update(row.id, "gap", Number(e.target.value))
                  }
                  className="h-7 text-xs shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background text-right"
                />
              </TableCell>
              <TableCell className="py-1.5 px-3 font-mono text-muted-foreground">
                {row.ind_pct.toFixed(1)}%
              </TableCell>
              <TableCell className="py-1.5 px-3 font-mono text-muted-foreground font-semibold">
                {row.cum_pct.toFixed(1)}%
              </TableCell>
              <TableCell className="py-1.5">
                {raw_items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => on_row_remove(row.id)}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-secondary/20">
            <TableCell className="py-2 px-3 font-bold text-right">TOTAL</TableCell>
            <TableCell className="py-2 px-3 font-bold font-mono text-right">
              {format_value(total_gap)}
            </TableCell>
            <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
