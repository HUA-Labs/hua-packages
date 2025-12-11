import { spawnSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

// Debug: Log environment information
console.log('[@hua-labs/ui] Build script started');
console.log('[@hua-labs/ui] Current working directory:', process.cwd());
console.log('[@hua-labs/ui] Script directory:', __dirname);
console.log('[@hua-labs/ui] Package directory:', path.join(__dirname, '..'));
console.log('[@hua-labs/ui] Process exec path:', process.execPath);
console.log('[@hua-labs/ui] Node version:', process.version);
console.log('[@hua-labs/ui] Platform:', process.platform);

// Use require.resolve to get absolute path to tsc.js
let tscPath: string;
try {
  // @ts-ignore - require.resolve is available in Node.js
  tscPath = require.resolve('typescript/lib/tsc.js');
  console.log('[@hua-labs/ui] TypeScript compiler found at:', tscPath);
  
  // Verify file exists
  if (!fs.existsSync(tscPath)) {
    throw new Error(`TypeScript compiler file does not exist: ${tscPath}`);
  }
  console.log('[@hua-labs/ui] TypeScript compiler file exists: YES');
} catch (error: any) {
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
  
  if (!tscPath!) {
    console.error('[@hua-labs/ui] TypeScript compiler not found in any location');
    process.exit(1);
  }
}

// Use process.execPath to get absolute path to current Node.js executable
const nodePath = process.execPath;

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
} catch (error: any) {
  console.error(`[@hua-labs/ui] Build failed: ${error.message}`);
  console.error('[@hua-labs/ui] Error stack:', error.stack);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

