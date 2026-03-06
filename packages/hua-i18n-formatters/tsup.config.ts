import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'date/index': 'src/date/index.ts',
    'number/index': 'src/number/index.ts',
    'currency/index': 'src/currency/index.ts',
  },
  format: ['esm', 'cjs'],
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.cjs' };
  },
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['react', '@hua-labs/i18n-core'],
});
