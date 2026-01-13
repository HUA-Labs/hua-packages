#!/usr/bin/env node
/**
 * Post-build script to add "use client" directive to all bundled files
 *
 * Why this is needed:
 * - tsup bundles React components but doesn't preserve "use client" directive
 * - Next.js 16 Turbopack treats files without directive as Server Components
 * - This causes errors when React hooks are detected
 *
 * Run after build: node scripts/add-use-client.js
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const USE_CLIENT = '"use client";\n';

async function addUseClientDirective() {
  try {
    const files = await readdir(DIST_DIR);
    const jsFiles = files.filter(f => f.endsWith('.mjs') || f.endsWith('.js'));

    let modified = 0;

    for (const file of jsFiles) {
      const filePath = join(DIST_DIR, file);
      const content = await readFile(filePath, 'utf-8');

      // Skip if already has "use client"
      if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
        console.log(`⏭️  ${file} - already has directive`);
        continue;
      }

      // Add "use client" at the top
      await writeFile(filePath, USE_CLIENT + content, 'utf-8');
      console.log(`✅ ${file} - added "use client"`);
      modified++;
    }

    console.log(`\n📦 Done! Modified ${modified}/${jsFiles.length} files`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addUseClientDirective();
