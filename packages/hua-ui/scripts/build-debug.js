#!/usr/bin/env node
// Debug script to test if node can execute and find files
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/d0fb42a7-faa0-49b2-a581-89f093cbac52';
const LOG_PATH = path.join(__dirname, '../../..', '.cursor', 'debug.log');

function logDebug(data) {
  const logEntry = JSON.stringify({
    ...data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: process.env.RUN_ID || 'run1'
  }) + '\n';
  
  try {
    fs.appendFileSync(LOG_PATH, logEntry, 'utf8');
  } catch (err) {
    // Fallback to HTTP if file write fails
    try {
      require('http').request(SERVER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, () => {}).end(logEntry);
    } catch (e) {}
  }
}

// #region agent log
logDebug({
  location: 'build-debug.js:start',
  message: 'Debug script started',
  data: {
    cwd: process.cwd(),
    nodePath: process.execPath,
    nodeVersion: process.version,
    platform: process.platform,
    env: {
      PATH: process.env.PATH,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV
    }
  },
  hypothesisId: 'A'
});
// #endregion

// Check if files exist
const rootDir = path.join(__dirname, '../../..');
const tsupPath = path.join(rootDir, 'node_modules', 'tsup', 'dist', 'cli-default.js');
const tsxPath = path.join(rootDir, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const tscPath = path.join(rootDir, 'node_modules', 'typescript', 'lib', 'tsc.js');

// #region agent log
logDebug({
  location: 'build-debug.js:file-check',
  message: 'Checking file existence',
  data: {
    rootDir,
    tsupPath,
    tsupExists: fs.existsSync(tsupPath),
    tsxPath,
    tsxExists: fs.existsSync(tsxPath),
    tscPath,
    tscExists: fs.existsSync(tscPath)
  },
  hypothesisId: 'B'
});
// #endregion

// Try to execute node directly
console.log('[@hua-labs/ui] Testing node execution...');
console.log('[@hua-labs/ui] Node path:', process.execPath);
console.log('[@hua-labs/ui] Current directory:', process.cwd());
console.log('[@hua-labs/ui] Platform:', process.platform);

// #region agent log
logDebug({
  location: 'build-debug.js:before-spawn',
  message: 'Before spawn test',
  data: {
    execPath: process.execPath,
    cwd: process.cwd()
  },
  hypothesisId: 'C'
});
// #endregion

// Test spawn
const testResult = spawnSync(process.execPath, ['--version'], {
  stdio: 'pipe',
  env: process.env
});

// #region agent log
logDebug({
  location: 'build-debug.js:spawn-result',
  message: 'Spawn test result',
  data: {
    status: testResult.status,
    error: testResult.error?.message,
    stdout: testResult.stdout?.toString(),
    stderr: testResult.stderr?.toString()
  },
  hypothesisId: 'C'
});
// #endregion

if (testResult.error) {
  console.error('[@hua-labs/ui] Spawn error:', testResult.error.message);
  process.exit(1);
}

console.log('[@hua-labs/ui] Node version:', testResult.stdout.toString().trim());
console.log('[@hua-labs/ui] All checks passed!');

// Now execute the actual build
console.log('[@hua-labs/ui] Starting actual build...');

// #region agent log
logDebug({
  location: 'build-debug.js:before-build',
  message: 'Before executing build commands',
  data: {
    tsupPath,
    tsupExists: fs.existsSync(tsupPath),
    tsxPath,
    tsxExists: fs.existsSync(tsxPath),
    tscPath,
    tscExists: fs.existsSync(tscPath)
  },
  hypothesisId: 'D'
});
// #endregion

// Execute tsup first
if (!fs.existsSync(tsxPath) || !fs.existsSync(tsupPath)) {
  console.error('[@hua-labs/ui] Missing required files:', {
    tsx: tsxPath,
    tsxExists: fs.existsSync(tsxPath),
    tsup: tsupPath,
    tsupExists: fs.existsSync(tsupPath)
  });
  process.exit(1);
}

console.log('[@hua-labs/ui] Executing tsup...');
const tsupResult = spawnSync(process.execPath, [tsxPath, tsupPath], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: process.env
});

// #region agent log
logDebug({
  location: 'build-debug.js:tsup-result',
  message: 'tsup execution result',
  data: {
    status: tsupResult.status,
    error: tsupResult.error?.message,
    signal: tsupResult.signal
  },
  hypothesisId: 'D'
});
// #endregion

if (tsupResult.error) {
  console.error('[@hua-labs/ui] tsup error:', tsupResult.error.message);
  process.exit(1);
}

if (tsupResult.status !== 0) {
  console.error('[@hua-labs/ui] tsup exited with code:', tsupResult.status);
  process.exit(tsupResult.status || 1);
}

// Execute tsc for type declarations
if (!fs.existsSync(tscPath)) {
  console.error('[@hua-labs/ui] TypeScript compiler not found at:', tscPath);
  process.exit(1);
}

console.log('[@hua-labs/ui] Executing tsc for type declarations...');
const tscResult = spawnSync(process.execPath, [tscPath, '--emitDeclarationOnly'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: process.env
});

// #region agent log
logDebug({
  location: 'build-debug.js:tsc-result',
  message: 'tsc execution result',
  data: {
    status: tscResult.status,
    error: tscResult.error?.message,
    signal: tscResult.signal
  },
  hypothesisId: 'D'
});
// #endregion

if (tscResult.error) {
  console.error('[@hua-labs/ui] tsc error:', tscResult.error.message);
  process.exit(1);
}

if (tscResult.status !== 0) {
  console.error('[@hua-labs/ui] tsc exited with code:', tscResult.status);
  process.exit(tscResult.status || 1);
}

console.log('[@hua-labs/ui] Build completed successfully!');

