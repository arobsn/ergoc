import { defineConfig } from "tsdown/config";

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  format: "esm",
  minify: true,
  noExternal: ["meow", "kleur"]
});
