/**
 * Setup global para Vitest.
 * Importa los matchers de jest-dom para que estén disponibles
 * en todos los archivos de prueba sin importarlos individualmente.
 *
 * Ejemplo de matchers habilitados:
 *   expect(element).toBeInTheDocument()
 *   expect(element).toHaveTextContent("hello")
 */
import "@testing-library/jest-dom";

// Mock global de ResizeObserver para componentes gráficos como Recharts
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
