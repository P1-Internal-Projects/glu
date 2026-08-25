import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * The starter kit ships this config with monorepo-relative aliases
 * (`../../packages/puck-css/src/...`) that only resolve inside the P1 monorepo.
 * Standalone those paths do not exist, and aliasing @puckeditor/core and
 * pds-toolkit-react at them breaks every test that touches the editor — so the
 * real packages are used instead, with local mocks added only where a test
 * genuinely needs one.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
