import { toast } from "sonner";

/**
 * Utilidad desacoplada y segura para exportar el contenido del PDCA a PDF.
 * Usa importación dinámica para evitar conflictos en SSR.
 */
export const export_element_to_pdf = async (
  element_id: string,
  document_identifier: string,
): Promise<boolean> => {
  const dom_element = document.getElementById(element_id);
  if (!dom_element) {
    toast.error("No se encontró el contenedor del documento a exportar.");
    return false;
  }

  const export_options = {
    margin: 10,
    filename: `PDCA_${document_identifier || "Reporte"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  try {
    const html2pdf_module = await import("html2pdf.js");
    const html2pdf_factory = (html2pdf_module as any).default || html2pdf_module;
    (html2pdf_factory() as any).set(export_options).from(dom_element).save();
    toast.success("Generando archivo PDF...");
    return true;
  } catch (export_error) {
    console.error("Error al exportar documento a PDF:", export_error);
    toast.error("Ocurrió un error al intentar generar el PDF.");
    return false;
  }
};
