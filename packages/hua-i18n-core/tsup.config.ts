import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', server: 'src/server.ts' },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['react'],
});
