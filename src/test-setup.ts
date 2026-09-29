/**
 * Setup global para Vitest.
 * Importa los matchers de jest-dom para que estén disponibles
 * en todos los archivos de prueba sin importarlos individualmente.
 */
import "@testing-library/jest-dom";

// Mock global de getBoundingClientRect y ResizeObserver para JSDOM y Recharts
if (typeof window !== "undefined") {
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    const rect = originalGetBoundingClientRect.call(this);
    if (rect.width === 0 && rect.height === 0) {
      return {
        width: 800,
        height: 400,
        top: 0,
        left: 0,
        bottom: 400,
        right: 800,
        x: 0,
        y: 0,
        toJSON: () => {},
      };
    }
    return rect;
  };

  window.ResizeObserver = class ResizeObserver {
    callback: ResizeObserverCallback;
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    observe(target: Element) {
      const rect = target.getBoundingClientRect();
      this.callback(
        [
          {
            target,
            contentRect: rect,
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
            isIntersecting: true,
          } as unknown as ResizeObserverEntry,
        ],
        this
      );
    }
    unobserve() {}
    disconnect() {}
  };
}
