import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: false,
    minify: true,
    treeshake: true,
    splitting: true,
    outDir: 'dist',
    clean: true,
    external: ['react', 'react-dom', '@hua-labs/ui', 'clsx', 'tailwind-merge', '@hua-labs/motion-core', '@hua-labs/motion-advanced', 'lucide-react', '@phosphor-icons/react'],
    esbuildOptions(options) {
      options.jsx = 'automatic';
    },
  }
]);
