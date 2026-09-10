import { useState, useMemo } from "react";
import type {
  Pdca,
  Phase,
  ActionItem,
  PdcaComment,
  PdcaHistoryEvent,
  VpoCheckpointItem,
  ParetoItem,
  FiveWhysTableData,
  ImpactMatrixRow,
  IshikawaItem,
  DefinicionMeta,
  ParticipantesData,
} from "@/data/pdca-types";
import { parseISO, isValid } from "date-fns";
import { DEFAULT_VPO_CHECKPOINTS, DEFAULT_TARGET_VS_ACTUAL } from "@/data/pdca-defaults";

function parseDateString(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  const parsedDate = parseISO(dateString);
  return isValid(parsedDate) ? parsedDate : undefined;
}

export function usePdcaDialogState(data: Pdca, currentUser: any) {
  const [tab, setTab] = useState<Phase>(data.fase || "Plan");
  const [titulo, setTitulo] = useState<string>(data.titulo || "");
  const [area, setArea] = useState<string>(data.area || "cocimientos");
  const [problema, setProblema] = useState<string>(data.problema || "");
  const [causaRaiz, setCausaRaiz] = useState<string>(data.causaRaiz || "");
  const [acciones, setAcciones] = useState<ActionItem[]>(data.acciones || []);
  const [comentarios, setComentarios] = useState<PdcaComment[]>(data.comentarios || []);
  const [historial, setHistorial] = useState<PdcaHistoryEvent[]>(data.historial || []);
  const [bottomTab, setBottomTab] = useState<"comments" | "history">("comments");
  const [fechaFin, setFechaFin] = useState<Date | undefined>(() =>
    parseDateString(data.fechaFinalizacion),
  );
  const [autor, setAutor] = useState<string>(data.autor || currentUser?.name || "Usuario");
  const [autorEmail, setAutorEmail] = useState<string>(data.autorEmail || currentUser?.email || "");
  const [asignados, setAsignados] = useState<{ name: string; email: string }[]>(
    data.asignados || [],
  );

  const [vpoCheckpoints, setVpoCheckpoints] = useState<VpoCheckpointItem[]>(
    data.vpoCheckpoints && data.vpoCheckpoints.length > 0
      ? data.vpoCheckpoints
      : DEFAULT_VPO_CHECKPOINTS,
  );
  const [paretoDrillDowns, setParetoDrillDowns] = useState<string[]>(data.paretoDrillDowns || []);
  const [paretoDataMap, setParetoDataMap] = useState<Record<string, ParetoItem[]>>(
    data.paretoDataMap || {},
  );
  const [paretoUnit, setParetoUnit] = useState<string>(data.paretoUnit || "");
  const [paretoTitles, setParetoTitles] = useState<Record<string, string>>(data.paretoTitles || {});

  const [targetVsActual, setTargetVsActual] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(
    data.targetVsActual && data.targetVsActual.length > 0
      ? data.targetVsActual
      : DEFAULT_TARGET_VS_ACTUAL,
  );
  const [targetVsActualUnit, setTargetVsActualUnit] = useState<string>(
    data.targetVsActualUnit || "",
  );
  const [kpiFinalResultData, setKpiFinalResultData] = useState<
    { mes: string; target: number; actual: number | null }[]
  >(
    data.kpiFinalResultData && data.kpiFinalResultData.length > 0
      ? data.kpiFinalResultData
      : DEFAULT_TARGET_VS_ACTUAL,
  );
  const [kpiFinalResultUnit, setKpiFinalResultUnit] = useState<string>(
    data.kpiFinalResultUnit || "",
  );

  const [gembaFinalImage, setGembaFinalImage] = useState<string | null>(
    data.gembaFinalImage || null,
  );
  const [evidencias, setEvidencias] = useState<string[]>(data.evidencias || []);
  const [kpiDocuments, setKpiDocuments] = useState<string[]>(data.kpiDocuments || []);
  const [hasFlavorCorrelation, setHasFlavorCorrelation] = useState<boolean>(
    data.hasFlavorCorrelation || false,
  );
  const [flavorCorrelationTitle, setFlavorCorrelationTitle] = useState<string>(
    data.flavorCorrelationData?.title || "Correlación de Flavors",
  );
  const [flavorCorrelationData, setFlavorCorrelationData] = useState<any>(
    data.flavorCorrelationData || null,
  );
  const [hasGopThemes, setHasGopThemes] = useState<boolean>(data.hasGopThemes || false);
  const [gopThemesData, setGopThemesData] = useState<any[]>(data.gopThemesData || []);
  const [gopThemesColumns, setGopThemesColumns] = useState<{ id: string; name: string }[]>(
    data.gopThemesColumns || [],
  );
  const [processMappingImages, setProcessMappingImages] = useState<string[]>(
    data.processMappingImage ? [data.processMappingImage] : [],
  );

  const [fiveWhysTables, setFiveWhysTables] = useState<FiveWhysTableData[]>(() => {
    if (data.fiveWhysTables && data.fiveWhysTables.length > 0) return data.fiveWhysTables;
    return [
      {
        id: "five-whys-1",
        title: "Problema/Desviación (Y)",
        description: "",
        rows: [
          { why1: "", why2: "", why3: "", why4: "", why5: "", rootCause: "", effect: "" },
          { why1: "", why2: "", why3: "", why4: "", why5: "", rootCause: "", effect: "" },
          { why1: "", why2: "", why3: "", why4: "", why5: "", rootCause: "", effect: "" },
          { why1: "", why2: "", why3: "", why4: "", why5: "", rootCause: "", effect: "" },
          { why1: "", why2: "", why3: "", why4: "", why5: "", rootCause: "", effect: "" },
        ],
        isCompleted: false,
      },
    ];
  });
  const [fiveWhysImages, setFiveWhysImages] = useState<string[]>(data.fiveWhysImages || []);

  const [impactMatrix, setImpactMatrix] = useState<ImpactMatrixRow[]>(
    () => data.impactMatrix || [],
  );

  const [ishikawas, setIshikawas] = useState<IshikawaItem[]>(() => {
    if (data.ishikawas && data.ishikawas.length > 0) return data.ishikawas;
    return [
      {
        id: "ishikawa-1",
        title: "Análisis de Causa",
        categories: {
          manoDeObra: [],
          medioAmbiente: [],
          maquina: [],
          metodo: [],
          medicion: [],
          material: [],
        },
        isCompleted: false,
      },
    ];
  });

  const [kpiNodes, setKpiNodes] = useState<any[]>(data.kpiNodes || []);
  const [kpiEdges, setKpiEdges] = useState<any[]>(data.kpiEdges || []);

  const [completedPhases, setCompletedPhases] = useState<Set<string>>(
    new Set(data.completedPhases || []),
  );
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    new Set(data.completedSteps || []),
  );

  const [definicionMeta, setDefinicionMeta] = useState<DefinicionMeta>(
    data.definicionMeta || ({} as DefinicionMeta),
  );
  const [equipo, setEquipo] = useState<string[]>(data.equipo || []);
  const [participantes, setParticipantes] = useState<ParticipantesData>(
    data.participantes || ({} as ParticipantesData),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  return {
    tab,
    setTab,
    titulo,
    setTitulo,
    area,
    setArea,
    problema,
    setProblema,
    causaRaiz,
    setCausaRaiz,
    acciones,
    setAcciones,
    comentarios,
    setComentarios,
    historial,
    setHistorial,
    bottomTab,
    setBottomTab,
    fechaFin,
    setFechaFin,
    autor,
    setAutor,
    autorEmail,
    setAutorEmail,
    asignados,
    setAsignados,
    vpoCheckpoints,
    setVpoCheckpoints,
    paretoDrillDowns,
    setParetoDrillDowns,
    paretoDataMap,
    setParetoDataMap,
    paretoUnit,
    setParetoUnit,
    paretoTitles,
    setParetoTitles,
    targetVsActual,
    setTargetVsActual,
    targetVsActualUnit,
    setTargetVsActualUnit,
    kpiFinalResultData,
    setKpiFinalResultData,
    kpiFinalResultUnit,
    setKpiFinalResultUnit,
    gembaFinalImage,
    setGembaFinalImage,
    evidencias,
    setEvidencias,
    kpiDocuments,
    setKpiDocuments,
    hasFlavorCorrelation,
    setHasFlavorCorrelation,
    flavorCorrelationTitle,
    setFlavorCorrelationTitle,
    flavorCorrelationData,
    setFlavorCorrelationData,
    hasGopThemes,
    setHasGopThemes,
    gopThemesData,
    setGopThemesData,
    gopThemesColumns,
    setGopThemesColumns,
    processMappingImages,
    setProcessMappingImages,
    fiveWhysTables,
    setFiveWhysTables,
    fiveWhysImages,
    setFiveWhysImages,
    impactMatrix,
    setImpactMatrix,
    ishikawas,
    setIshikawas,
    kpiNodes,
    setKpiNodes,
    kpiEdges,
    setKpiEdges,
    completedPhases,
    setCompletedPhases,
    completedSteps,
    setCompletedSteps,
    definicionMeta,
    setDefinicionMeta,
    equipo,
    setEquipo,
    participantes,
    setParticipantes,
    isSaving,
    setIsSaving,
    hasUnsavedChanges,
    setHasUnsavedChanges,
  };
}
