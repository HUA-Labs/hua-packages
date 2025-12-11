#!/usr/bin/env node
// Direct TypeScript compilation using require.resolve
// This avoids PATH issues by using Node.js require resolution

const path = require('path');
const fs = require('fs');

// Resolve TypeScript compiler
let tscPath;
try {
  tscPath = require.resolve('typescript/lib/tsc.js');
} catch (error) {
  // Try alternative paths
  const alternativePaths = [
    path.join(__dirname, '../../..', 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(process.cwd(), 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(__dirname, '..', 'node_modules', 'typescript', 'lib', 'tsc.js')
  ];
  
  for (const altPath of alternativePaths) {
    if (fs.existsSync(altPath)) {
      tscPath = altPath;
      break;
    }
  }
  
  if (!tscPath) {
    console.error('[@hua-labs/ui] TypeScript compiler not found');
    process.exit(1);
  }
}

// Change to package directory
const packageDir = path.join(__dirname, '..');
process.chdir(packageDir);

// Execute tsc by spawning it with the current node process
const { spawnSync } = require('child_process');

const result = spawnSync(process.execPath, [tscPath], {
  cwd: packageDir,
  stdio: 'inherit',
  env: process.env
});

if (result.error) {
  console.error('[@hua-labs/ui] Failed to execute TypeScript compiler:', result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status || 1);
}

