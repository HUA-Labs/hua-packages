import { defineConfig } from 'tsup';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function addUseClientDirective() {
  const distDir = join(import.meta.dirname, 'dist');
  const files = await readdir(distDir);
  // Only add "use client" to ESM entry points (.mjs)
  // CJS files (.js) must NOT have "use client" — Turbopack treats CJS+use-client
  // as ESM client modules, causing "exports is not defined" at runtime
  const esmFiles = files.filter(f => f.endsWith('.mjs'));

  for (const file of esmFiles) {
    const filePath = join(distDir, file);
    const content = await readFile(filePath, 'utf-8');
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) continue;
    await writeFile(filePath, '"use client";\n' + content, 'utf-8');
  }
}

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  async onSuccess() {
    await addUseClientDirective();
  },
});
