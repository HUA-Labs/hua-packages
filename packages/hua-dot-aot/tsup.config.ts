import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    vite: 'src/vite.ts',
    babel: 'src/babel.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['vite', '@babel/core', '@babel/types'],
});
