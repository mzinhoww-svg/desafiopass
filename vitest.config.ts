import { defineConfig } from "vitest/config";

// Testes unitarios puros (logica de scoring na Task 2.1). Ambiente node, sem DOM.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
