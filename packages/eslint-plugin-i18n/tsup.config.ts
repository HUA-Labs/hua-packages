import { defineConfig } from 'tsup';

export default defineConfig([
  // Plugin build (CJS + ESM + DTS)
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  // CLI build (CJS only, executable)
  {
    entry: { 'cli/index': 'src/cli/index.ts' },
    format: ['cjs'],
    dts: false,
    sourcemap: false,
    banner: { js: '#!/usr/bin/env node' },
  },
]);
