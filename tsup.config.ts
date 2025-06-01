import { defineConfig, type Options } from "tsup";

const baseOptions = {
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true, // generate .d.ts files
  clean: true, // clean output before build
  sourcemap: true,
  minify: false,
  target: "es2022",
  outDir: "dist",
  splitting: false, // usually false for libraries
  treeshake: true,
};

export default [
  defineConfig({
    ...baseOptions,
    outDir: "dist/cjs",
    format: "cjs",
  }),
  defineConfig({
    ...baseOptions,
    outDir: "dist/esm",
    format: "esm",
  }),
];
