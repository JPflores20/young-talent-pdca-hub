import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepInstructions } from "@/components/pdca_dialog/common/step-instructions";

interface TimeSeriesHeaderProps {
  unit: string;
  onUnitChange?: ((val: string) => void) | undefined;
  yMin: number;
  onYMinChange?: ((val: number) => void) | undefined;
  yMax: string;
  onYMaxChange?: ((val: string) => void) | undefined;
  onChange?: ((newSeries: { mes: string; target: number; actual: number | null }[]) => void) | undefined;
}

export function TimeSeriesHeader({
  unit,
  onUnitChange,
  yMin,
  onYMinChange,
  yMax,
  onYMaxChange,
  onChange,
}: TimeSeriesHeaderProps) {
  return (
    <>
      <StepInstructions>
        <p className="mb-1">1. Rellena el campo gris con su problema.</p>
        <p className="mb-1">
          2. Completa el período de tiempo con tu período de tiempo deseado (años, meses, semanas,
          días, etc.)
        </p>
        <p>3. Rellena las columnas "Objetivo" y "Actual" con tus datos.</p>
      </StepInstructions>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Unidad de Medida:
            </span>
            <Input
              value={unit}
              onChange={(e) => {
                if (onUnitChange) onUnitChange(e.target.value);
              }}
              placeholder="ej. $, %, HL"
              className="w-28 h-7 text-xs font-bold"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20 hidden md:flex">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Eje Y —
            </span>
            <span className="text-xs text-muted-foreground">Min:</span>
            <Input
              type="number"
              value={yMin}
              onChange={(e) => onYMinChange?.(Number(e.target.value))}
              className="w-20 h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">Max:</span>
            <Input
              type="text"
              value={yMax}
              onChange={(e) => onYMaxChange?.(e.target.value)}
              placeholder="auto"
              className="w-20 h-7 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Plantilla Rápida:
          </span>
          <Select
            onValueChange={(val) => {
              if (
                window.confirm(
                  "Cambiar la plantilla reemplazará los datos actuales en la tabla. ¿Deseas continuar?",
                )
              ) {
                if (val === "meses") {
                  if (onChange)
                    onChange([
                      { mes: "Ene", target: 0, actual: null },
                      { mes: "Feb", target: 0, actual: null },
                      { mes: "Mar", target: 0, actual: null },
                      { mes: "Abr", target: 0, actual: null },
                      { mes: "May", target: 0, actual: null },
                      { mes: "Jun", target: 0, actual: null },
                      { mes: "Jul", target: 0, actual: null },
                      { mes: "Ago", target: 0, actual: null },
                      { mes: "Sep", target: 0, actual: null },
                      { mes: "Oct", target: 0, actual: null },
                      { mes: "Nov", target: 0, actual: null },
                      { mes: "Dic", target: 0, actual: null },
                    ]);
                } else if (val.startsWith("sem-")) {
                  const month = val.split("-")[1];
                  if (onChange)
                    onChange([
                      { mes: `${month} Sem 1`, target: 0, actual: null },
                      { mes: `${month} Sem 2`, target: 0, actual: null },
                      { mes: `${month} Sem 3`, target: 0, actual: null },
                      { mes: `${month} Sem 4`, target: 0, actual: null },
                      { mes: `${month} Sem 5`, target: 0, actual: null },
                    ]);
                }
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs w-[180px] bg-secondary/30">
              <SelectValue placeholder="Elegir..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meses">12 Meses (Anual)</SelectItem>
              <SelectItem value="sem-Ene">Enero (Semanas)</SelectItem>
              <SelectItem value="sem-Feb">Febrero (Semanas)</SelectItem>
              <SelectItem value="sem-Mar">Marzo (Semanas)</SelectItem>
              <SelectItem value="sem-Abr">Abril (Semanas)</SelectItem>
              <SelectItem value="sem-May">Mayo (Semanas)</SelectItem>
              <SelectItem value="sem-Jun">Junio (Semanas)</SelectItem>
              <SelectItem value="sem-Jul">Julio (Semanas)</SelectItem>
              <SelectItem value="sem-Ago">Agosto (Semanas)</SelectItem>
              <SelectItem value="sem-Sep">Septiembre (Semanas)</SelectItem>
              <SelectItem value="sem-Oct">Octubre (Semanas)</SelectItem>
              <SelectItem value="sem-Nov">Noviembre (Semanas)</SelectItem>
              <SelectItem value="sem-Dic">Diciembre (Semanas)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
