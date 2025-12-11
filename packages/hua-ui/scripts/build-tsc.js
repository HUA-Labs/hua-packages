#!/usr/bin/env node
// This script is executed by Node.js, so process.execPath is always available

const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Debug: Log environment information
// Log to both console and file for debugging
const logFile = process.env.BUILD_LOG_FILE || '/tmp/hua-ui-build.log';
const log = (message) => {
  console.log(message);
  try {
    fs.appendFileSync(logFile, message + '\n', 'utf8');
  } catch (e) {
    // Ignore log file errors
  }
};

log('[@hua-labs/ui] Build script started');
log('[@hua-labs/ui] Current working directory: ' + process.cwd());
log('[@hua-labs/ui] Script directory: ' + __dirname);
log('[@hua-labs/ui] Package directory: ' + path.join(__dirname, '..'));
log('[@hua-labs/ui] Process exec path: ' + process.execPath);
log('[@hua-labs/ui] Node version: ' + process.version);
log('[@hua-labs/ui] Platform: ' + process.platform);
log('[@hua-labs/ui] PATH: ' + process.env.PATH);

// Try to find node executable in common locations
let nodePath = process.execPath;
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

log('[@hua-labs/ui] Platform: ' + process.platform);
log('[@hua-labs/ui] Trying to find node executable...');

// On Windows, use process.execPath directly (most reliable)
if (isWindows) {
  nodePath = process.execPath;
  log('[@hua-labs/ui] Windows detected, using process.execPath: ' + nodePath);
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
    log('[@hua-labs/ui] Checking: ' + testPath);
    if (fs.existsSync(testPath)) {
      nodePath = testPath;
      log('[@hua-labs/ui] Found node at: ' + nodePath);
      break;
    }
  }

  // Also try which command (Linux/Unix only)
  if (nodePath === process.execPath) {
    try {
      const whichResult = spawnSync('which', ['node'], { encoding: 'utf8', stdio: 'pipe' });
      if (whichResult.stdout && whichResult.stdout.trim()) {
        const foundPath = whichResult.stdout.trim();
        log('[@hua-labs/ui] which node found: ' + foundPath);
        if (fs.existsSync(foundPath)) {
          nodePath = foundPath;
        }
      }
    } catch (e) {
      log('[@hua-labs/ui] which command failed: ' + e.message);
    }
  }
}

log('[@hua-labs/ui] Final node path: ' + nodePath);

// Check if typescript is available
let tscPath;
try {
  tscPath = require.resolve('typescript/lib/tsc.js');
  log('[@hua-labs/ui] TypeScript compiler found at: ' + tscPath);
  
  // Verify file exists
  if (!fs.existsSync(tscPath)) {
    throw new Error(`TypeScript compiler file does not exist: ${tscPath}`);
  }
  log('[@hua-labs/ui] TypeScript compiler file exists: YES');
} catch (error) {
  log('[@hua-labs/ui] Failed to resolve typescript/lib/tsc.js: ' + error.message);
  
  // Try alternative paths
  const alternativePaths = [
    path.join(__dirname, '../../..', 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(process.cwd(), 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(__dirname, '..', 'node_modules', 'typescript', 'lib', 'tsc.js')
  ];
  
  log('[@hua-labs/ui] Trying alternative paths...');
  for (const altPath of alternativePaths) {
    log('[@hua-labs/ui] Checking: ' + altPath);
    if (fs.existsSync(altPath)) {
      tscPath = altPath;
      log('[@hua-labs/ui] Found TypeScript at alternative path: ' + tscPath);
      break;
    }
  }
  
  if (!tscPath) {
    log('[@hua-labs/ui] TypeScript compiler not found in any location');
    process.exit(1);
  }
}

// nodePath is already set above (from the node path detection code)

try {
  log('[@hua-labs/ui] Building with TypeScript compiler at: ' + tscPath);
  log('[@hua-labs/ui] Using Node.js at: ' + nodePath);
  
  const packageDir = path.join(__dirname, '..');
  log('[@hua-labs/ui] Building in directory: ' + packageDir);
  
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
    log('[@hua-labs/ui] spawnSync error: ' + result.error.message);
    throw result.error;
  }
  
  if (result.status !== 0) {
    log('[@hua-labs/ui] TypeScript compiler exited with code: ' + result.status);
    process.exit(result.status || 1);
  }
  
  log('[@hua-labs/ui] Build completed successfully');
} catch (error) {
  log('[@hua-labs/ui] Build failed: ' + error.message);
  log('[@hua-labs/ui] Error stack: ' + (error.stack || ''));
  if (error.stderr) log('[@hua-labs/ui] stderr: ' + error.stderr.toString());
  if (error.stdout) log('[@hua-labs/ui] stdout: ' + error.stdout.toString());
  process.exit(1);
}

