import { defineConfig } from 'tsup';

const entry = {
  index: 'src/index.ts',
  core: 'src/entries/core.ts',
  page: 'src/entries/page.ts',
  element: 'src/entries/element.ts',
  scroll: 'src/entries/scroll.ts',
  experiments: 'src/entries/experiments.ts',
};

const shared = {
  entry,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  target: 'es2019',
  external: ['react', 'react-dom', '@hua-labs/motion-core', '@hua-labs/motion-advanced'],
  esbuildOptions(options: any) {
    options.jsx = 'automatic';
  },
};

export default defineConfig([
  {
    ...shared,
    format: ['esm'],
    splitting: true,
    dts: {
      compilerOptions: {
        incremental: false,
        skipLibCheck: true,
        moduleResolution: 'bundler',
      },
    },
    outDir: 'dist',
  },
  {
    ...shared,
    format: ['cjs'],
    splitting: false,
    dts: false,
    outDir: 'dist',
  },
]);

