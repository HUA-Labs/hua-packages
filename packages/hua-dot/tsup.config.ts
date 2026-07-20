import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    native: "src/native.ts",
    flutter: "src/flutter.ts",
    class: "src/class.ts",
    "codegen/index": "src/codegen/index.ts",
    "codegen/cli": "src/codegen/cli.ts",
  },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
});
