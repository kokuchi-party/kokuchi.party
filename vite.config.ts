import { paraglide } from "@inlang/paraglide-js-adapter-vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, mergeConfig } from "vite";
import { defineConfig as defineVitestConfig } from "vitest/config";

const config = defineConfig({
  plugins: [
    sveltekit(),
    paraglide({
      project: "./project.inlang",
      outdir: "./src/lib/paraglide"
    })
  ]
});

const testConfig = defineVitestConfig({
  test: {
    globals: true,
    include: ["**/*.test.ts"]
  }
});

export default mergeConfig(config, testConfig);
