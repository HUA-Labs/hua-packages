import { defineConfig } from 'tsup';

const entry = {
  index: 'src/index.ts',
  advanced: 'src/advanced.ts',
  'advanced-dashboard': 'src/advanced/dashboard.ts',
  'advanced-motion': 'src/advanced/motion.ts',
  form: 'src/form.ts',
  navigation: 'src/navigation.ts',
  feedback: 'src/feedback.ts',
};

const shared = {
  entry,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  target: 'es2019',
  external: ['react', 'react-dom', 'clsx', 'tailwind-merge', '@hua-labs/motion-core', '@hua-labs/motion-advanced', 'lucide-react', '@phosphor-icons/react'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
};

export default defineConfig([
  {
    ...shared,
    dts: {
      compilerOptions: {
        incremental: false,
      },
    },
    format: ['esm'],
    splitting: true,
    outDir: 'dist',
  },
  {
    ...shared,
    dts: false,
    format: ['cjs'],
    splitting: false,
    outDir: 'dist',
  },
]);
