/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Configuración dedicada de Vitest.
 * Separada de vite.config.ts para no interferir con el wrapper
 * de Lovable (@lovable.dev/vite-tanstack-config).
 *
 * Para correr las pruebas: `npx vitest` o `npm run test`
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/__tests__/**",
        "src/test-setup.ts",
        "src/test-utils.tsx",
        "src/routeTree.gen.ts",
        "src/router.tsx",
        "src/entry-client.tsx",
        "src/start.ts",
        "src/server.ts",
      ],
    },
  },
});
