#!/usr/bin/env node
// Try to find node in common Vercel paths or use process.execPath
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const tscPath = path.resolve(__dirname, '../../node_modules/typescript/lib/tsc.js');

if (!fs.existsSync(tscPath)) {
  console.error(`Error: tsc.js not found at ${tscPath}`);
  process.exit(1);
}

try {
  execSync(`node ${tscPath}`, {
    stdio: 'inherit',
    cwd: __dirname
  });
} catch (error) {
  process.exit(1);
}

