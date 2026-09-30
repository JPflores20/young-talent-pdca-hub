import { DEFAULT_VPO_CHECKPOINTS, type Pdca } from "@/data/pdca";

export const create_empty_pdca_draft = (tipo: "PDCA" | "RDA" = "PDCA"): Pdca => ({
  id: `${tipo}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
  tipo,
  titulo: "",
  area: "cocimientos",
  fase: "Plan",
  actualizado: new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }),
  progreso: 0,
  problema: "",
  causaRaiz: "",
  acciones: [],
  verificacion: "",
  evidencias: [],
  estandarizacion: "",
  indicador: { etiqueta: "Indicador principal", antes: 0, despues: 0, unidad: "%" },
  serie: [
    { mes: "May", valor: 0 },
    { mes: "Jun", valor: 0 },
    { mes: "Jul", valor: 0 },
    { mes: "Ago", valor: 0 },
  ],
  vpoCheckpoints: DEFAULT_VPO_CHECKPOINTS.map((item) => ({ ...item, status: "", evidencia: "" })),
  equipo: [],
});
