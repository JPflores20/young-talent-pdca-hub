import React from "react";
import { ItfR2d2Evaluation } from "@/data/pdca-types";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PdcaItfR2d2Props {
  evaluation: ItfR2d2Evaluation;
  onChange: (ev: ItfR2d2Evaluation) => void;
  disabled?: boolean;
  currentUser?: { name?: string; email?: string } | null;
}

const EVALUATION_OPTIONS = [
  { value: "0", label: "0 (No cumple)" },
  { value: "1", label: "1 (Necesita mejorar)" },
  { value: "2", label: "2 (Cumplimiento mínimo)" },
  { value: "3", label: "3 (Excelente)" },
  { value: "4", label: "4 (Benchmark)" },
];

export const PdcaItfR2d2: React.FC<PdcaItfR2d2Props> = ({ evaluation, onChange, disabled, currentUser }) => {
  const updateField = (
    key: keyof ItfR2d2Evaluation,
    field: "check" | "score" | "comment",
    value: any
  ) => {
    let newEvaluators = Array.isArray(evaluation.evaluators) ? [...evaluation.evaluators] : [];
    
    // Convert old string array to object array just in case
    newEvaluators = newEvaluators.map(e => typeof e === 'string' ? { name: e, timestamp: new Date().toISOString() } : e);

    const evaluatorName = currentUser?.name || currentUser?.email || "";
    
    if (evaluatorName) {
      const existingIndex = newEvaluators.findIndex(e => e.name === evaluatorName);
      if (existingIndex >= 0) {
        // Update timestamp for existing evaluator
        newEvaluators[existingIndex] = { name: evaluatorName, timestamp: new Date().toISOString() };
      } else {
        // Add new evaluator
        newEvaluators.push({ name: evaluatorName, timestamp: new Date().toISOString() });
      }
    }

    onChange({
      ...evaluation,
      evaluators: newEvaluators,
      [key]: {
        ...(evaluation[key] || { check: false, score: 0, comment: "" }),
        [field]: value,
      },
    });
  };

  const renderRow = (
    key: keyof ItfR2d2Evaluation,
    letter: string,
    titleEn: string,
    titleEs: string,
    description: string[]
  ) => {
    const data = evaluation[key] || { check: false, score: 0, comment: "" };

    return (
      <div className="flex flex-col md:flex-row items-stretch gap-2 mb-4 border-b border-border pb-4 last:border-0 last:pb-0">
        <div className="flex-shrink-0 flex items-center justify-center bg-blue-500 text-white font-bold text-4xl w-16 h-full min-h-[100px] rounded-md shadow-sm">
          {letter}
        </div>
        <div className="w-48 bg-card rounded-md shadow-sm border border-border p-3">
          <p className="font-bold text-sm text-foreground">{titleEn}</p>
          <p className="text-xs text-muted-foreground">{titleEs}</p>
        </div>
        <div className="flex-1 bg-cyan-700 text-white rounded-md shadow-sm p-3 text-xs leading-relaxed">
          <ul className="list-disc pl-4 space-y-1">
            {description.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-64 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs font-semibold">¿Cumple?</Label>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={data.check}
                disabled={disabled}
                onChange={(e) => updateField(key, "check", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">Puntuación</Label>
            <Select
              disabled={disabled}
              value={data.score.toString()}
              onValueChange={(val) => updateField(key, "score", parseInt(val))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Evaluar..." />
              </SelectTrigger>
              <SelectContent>
                {EVALUATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[10px] uppercase text-muted-foreground mb-1 block">¿Cómo lo estamos haciendo?</Label>
            <Textarea
              disabled={disabled}
              value={data.comment}
              onChange={(e) => updateField(key, "comment", e.target.value)}
              className="min-h-[60px] text-xs resize-y"
              placeholder="Escribe comentarios aquí..."
            />
          </div>
        </div>
      </div>
    );
  };

  const totalScore = Object.entries(evaluation).reduce((acc, [key, curr]) => {
    if (key === 'evaluators' || !curr || typeof curr !== 'object') return acc;
    return acc + ((curr as any).score || 0) * 5;
  }, 0);
  
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mt-6">
      <div className="bg-blue-900 text-white p-3 flex justify-between items-center">
        <h3 className="font-bold text-lg tracking-wide">PDCA / ITF R2D2 + 1</h3>
        <div className="bg-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
          Puntuación Total: {totalScore} / 100
        </div>
      </div>
      <div className="p-4 bg-muted/20">
        {renderRow(
          "rightPeople",
          "R",
          "Right People",
          "Gente Correcta",
          [
            "Evite demasiados chefs y no suficientes cocineros",
            "Los ojos externos pueden ser muy perspicaces.",
            "¡El Front Line es tu amigo!",
            "El rol de consultor es una opción"
          ]
        )}
        {renderRow(
          "rightProblem",
          "R",
          "Right Problem",
          "Problema Correcto",
          [
            "Alinee con un objetivo y un cronograma realistas, pero adecuadamente extendidos para lograrlo",
            "Acuerde cómo medirá el éxito; puede que no sea a través del KPI principal al principio",
            "Los buenos equipos de ITF y PDCA no dudan en volver a escribir la definición de su problema"
          ]
        )}
        {renderRow(
          "dataWillSetYouFree",
          "D",
          "Data will set you free",
          "Datos te liberaran",
          [
            "¿Tienes datos? Córtalo y córtalo / ¿No tienes datos? Ve a buscarlo",
            "Manténgalo simple ... los paretos para reducir el enfoque del equipo rápidamente",
            "Comience a usar Plan de acción del PDCA inmediatamente"
          ]
        )}
        {renderRow(
          "dontReinventTheWheel",
          "D",
          "Dont re-invent the wheel",
          "No re-inventar la rueda",
          [
            "Buenas prácticas operativas (GOP)",
            "Recomendaciones de proveedores",
            "Amigos de ABI en todo el mundo",
            "Lista de Verificación SDCA"
          ]
        )}
        {renderRow(
          "noHippos",
          "+1",
          "No hippos",
          "No te quedes atascado en el barro",
          [
            "Lista de verificación SDCA debe ser rapida.",
            "Multiples PDCAs como ramificaciones",
            "Zona involucrada",
            "Nuevos miembros al equipo",
            "Re-definir objetivos. Obtener mas datos"
          ]
        )}
      </div>
      <div className="bg-muted/50 border-t border-border p-3 text-xs text-muted-foreground flex items-center gap-2">
        <span className="font-semibold">Evaluado por:</span>
        <span className="italic flex flex-wrap gap-x-4 gap-y-1">
          {evaluation.evaluators && evaluation.evaluators.length > 0
            ? evaluation.evaluators.map((e, idx) => {
                const isObj = typeof e === "object" && e !== null;
                const name = isObj ? e.name : e;
                const dateStr = isObj && e.timestamp ? new Date(e.timestamp).toLocaleString("es-MX", {
                  day: '2-digit', month: '2-digit', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                }) : "";
                
                return (
                  <span key={idx} className="inline-flex items-center gap-1">
                    {name} {dateStr && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">({dateStr})</span>}
                  </span>
                );
              })
            : "Nadie ha evaluado aún"}
        </span>
      </div>
    </div>
  );
};
