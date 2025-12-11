#!/usr/bin/env node

const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Debug: Log environment information
console.log('[@hua-labs/ui] Build script started');
console.log('[@hua-labs/ui] Current working directory:', process.cwd());
console.log('[@hua-labs/ui] Script directory:', __dirname);
console.log('[@hua-labs/ui] Package directory:', path.join(__dirname, '..'));
console.log('[@hua-labs/ui] Process exec path:', process.execPath);
console.log('[@hua-labs/ui] Node version:', process.version);
console.log('[@hua-labs/ui] Platform:', process.platform);
console.log('[@hua-labs/ui] PATH:', process.env.PATH);

// Try to find node executable in common locations
let nodePath = process.execPath;
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

console.log('[@hua-labs/ui] Platform:', process.platform);
console.log('[@hua-labs/ui] Trying to find node executable...');

// On Windows, use process.execPath directly (most reliable)
if (isWindows) {
  nodePath = process.execPath;
  console.log('[@hua-labs/ui] Windows detected, using process.execPath:', nodePath);
} else {
  // On Linux/Unix, try common paths
  const commonNodePaths = [
    '/usr/bin/node',
    '/usr/local/bin/node',
    '/opt/homebrew/bin/node',
    '/vercel/.nodejs/bin/node',
    process.execPath
  ];

  for (const testPath of commonNodePaths) {
    console.log('[@hua-labs/ui] Checking:', testPath);
    if (fs.existsSync(testPath)) {
      nodePath = testPath;
      console.log('[@hua-labs/ui] Found node at:', nodePath);
      break;
    }
  }

  // Also try which command (Linux/Unix only)
  if (nodePath === process.execPath) {
    try {
      const whichResult = spawnSync('which', ['node'], { encoding: 'utf8', stdio: 'pipe' });
      if (whichResult.stdout && whichResult.stdout.trim()) {
        const foundPath = whichResult.stdout.trim();
        console.log('[@hua-labs/ui] which node found:', foundPath);
        if (fs.existsSync(foundPath)) {
          nodePath = foundPath;
        }
      }
    } catch (e) {
      console.log('[@hua-labs/ui] which command failed:', e.message);
    }
  }
}

console.log('[@hua-labs/ui] Final node path:', nodePath);

// Check if typescript is available
let tscPath;
try {
  tscPath = require.resolve('typescript/lib/tsc.js');
  console.log('[@hua-labs/ui] TypeScript compiler found at:', tscPath);
  
  // Verify file exists
  if (!fs.existsSync(tscPath)) {
    throw new Error(`TypeScript compiler file does not exist: ${tscPath}`);
  }
  console.log('[@hua-labs/ui] TypeScript compiler file exists: YES');
} catch (error) {
  console.error('[@hua-labs/ui] Failed to resolve typescript/lib/tsc.js:', error.message);
  
  // Try alternative paths
  const alternativePaths = [
    path.join(__dirname, '../../..', 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(process.cwd(), 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(__dirname, '..', 'node_modules', 'typescript', 'lib', 'tsc.js')
  ];
  
  console.log('[@hua-labs/ui] Trying alternative paths...');
  for (const altPath of alternativePaths) {
    console.log('[@hua-labs/ui] Checking:', altPath);
    if (fs.existsSync(altPath)) {
      tscPath = altPath;
      console.log('[@hua-labs/ui] Found TypeScript at alternative path:', tscPath);
      break;
    }
  }
  
  if (!tscPath) {
    console.error('[@hua-labs/ui] TypeScript compiler not found in any location');
    process.exit(1);
  }
}

// nodePath is already set above (from the node path detection code)

try {
  console.log(`[@hua-labs/ui] Building with TypeScript compiler at: ${tscPath}`);
  console.log(`[@hua-labs/ui] Using Node.js at: ${nodePath}`);
  
  const packageDir = path.join(__dirname, '..');
  console.log('[@hua-labs/ui] Building in directory:', packageDir);
  
  const result = spawnSync(nodePath, [tscPath], {
    cwd: packageDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: ''
    },
    shell: false
  });
  
  if (result.error) {
    console.error('[@hua-labs/ui] spawnSync error:', result.error);
    throw result.error;
  }
  
  if (result.status !== 0) {
    console.error(`[@hua-labs/ui] TypeScript compiler exited with code: ${result.status}`);
    process.exit(result.status || 1);
  }
  
  console.log('[@hua-labs/ui] Build completed successfully');
} catch (error) {
  console.error(`[@hua-labs/ui] Build failed: ${error.message}`);
  console.error('[@hua-labs/ui] Error stack:', error.stack);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

