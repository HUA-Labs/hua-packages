/**
 * Postbuild script to add "use client" directive to client-only entry points.
 *
 * This is needed because tsup strips the "use client" directive from source files,
 * and Turbopack (Next.js) requires it for client components.
 *
 * Only adds to main entry points, not to:
 * - framework/server (server-only)
 * - framework/config (works on both server and client)
 * - presets (config files)
 * - framework/seo/geo (server utilities)
 * - chunk files (may contain shared code)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '..', 'dist');

// Only add "use client" to ESM entry points (.mjs)
// CJS files (.js) don't need the directive — adding it can confuse Turbopack
// into treating CJS as ESM client components, causing "exports is not defined"
const clientFiles = [
  'index.mjs',
  'framework/index.mjs',
];

const USE_CLIENT = '"use client";\n';

for (const file of clientFiles) {
  const filePath = join(distDir, file);

  if (!existsSync(filePath)) {
    console.log(`⏭️  Skipping ${file} (not found)`);
    continue;
  }

  const content = readFileSync(filePath, 'utf-8');

  if (content.startsWith('"use client"')) {
    console.log(`✅ ${file} already has "use client"`);
    continue;
  }

  writeFileSync(filePath, USE_CLIENT + content);
  console.log(`✅ Added "use client" to ${file}`);
}

console.log('\n🎉 Postbuild complete!');
