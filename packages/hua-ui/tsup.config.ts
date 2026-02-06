import { defineConfig } from 'tsup';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const coreEntry = {
  index: 'src/index.ts',
  advanced: 'src/advanced.ts',
  'advanced-dashboard': 'src/advanced/dashboard.ts',
  'advanced-motion': 'src/advanced/motion.ts',
  'advanced-emotion': 'src/components/advanced/emotion/index.ts',
  form: 'src/form.ts',
  navigation: 'src/navigation.ts',
  feedback: 'src/feedback.ts',
  sdui: 'src/sdui/index.ts',
};

const shared = {
  sourcemap: true,
  treeshake: true,
  minify: true,
  target: 'es2019',
  external: ['react', 'react-dom', 'clsx', 'tailwind-merge', '@hua-labs/motion-core', '@hua-labs/motion-advanced', 'lucide-react', '@phosphor-icons/react'],
  esbuildOptions(options: { jsx: string }) {
    options.jsx = 'automatic';
  },
};

async function addUseClientDirective() {
  const distDir = join(import.meta.dirname, 'dist');
  const files = await readdir(distDir);
  const jsFiles = files.filter(f => f.endsWith('.mjs') || f.endsWith('.js'));

  for (const file of jsFiles) {
    const filePath = join(distDir, file);
    const content = await readFile(filePath, 'utf-8');
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) continue;
    await writeFile(filePath, '"use client";\n' + content, 'utf-8');
  }
}

export default defineConfig([
  // Core ESM (without iconsax)
  {
    ...shared,
    entry: coreEntry,
    dts: {
      compilerOptions: {
        incremental: false,
      },
    },
    format: ['esm'],
    splitting: true,
    outDir: 'dist',
    clean: true,
  },
  // Core CJS (without iconsax)
  {
    ...shared,
    entry: coreEntry,
    dts: false,
    format: ['cjs'],
    splitting: false,
    outDir: 'dist',
    clean: false,
  },
  // Iconsax ESM (separate entry, no splitting to avoid 600+ chunks)
  {
    ...shared,
    entry: { iconsax: 'src/iconsax.ts' },
    dts: {
      compilerOptions: {
        incremental: false,
      },
    },
    format: ['esm'],
    splitting: false,
    outDir: 'dist',
    clean: false,
  },
  // Iconsax CJS (separate entry, last build - adds "use client" to all files)
  {
    ...shared,
    entry: { iconsax: 'src/iconsax.ts' },
    dts: false,
    format: ['cjs'],
    splitting: false,
    outDir: 'dist',
    clean: false,
    async onSuccess() {
      await addUseClientDirective();
    },
  },
]);
