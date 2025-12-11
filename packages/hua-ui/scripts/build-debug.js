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
  const errorMsg = {
    tsx: tsxPath,
    tsxExists: fs.existsSync(tsxPath),
    tsup: tsupPath,
    tsupExists: fs.existsSync(tsupPath)
  };
  console.error('[@hua-labs/ui] Missing required files:', errorMsg);
  // #region agent log
  logDebug({
    location: 'build-debug.js:missing-files',
    message: 'Missing required build files',
    data: errorMsg,
    hypothesisId: 'E'
  });
  // #endregion
  process.exit(1);
}

console.log('[@hua-labs/ui] Executing tsup...');
console.log('[@hua-labs/ui] tsup command:', `${process.execPath} ${tsxPath} ${tsupPath}`);
console.log('[@hua-labs/ui] Working directory:', path.join(__dirname, '..'));

// #region agent log
logDebug({
  location: 'build-debug.js:tsup-start',
  message: 'Starting tsup execution',
  data: {
    execPath: process.execPath,
    tsxPath,
    tsupPath,
    cwd: path.join(__dirname, '..'),
    command: `${process.execPath} ${tsxPath} ${tsupPath}`
  },
  hypothesisId: 'D'
});
// #endregion

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
    errorCode: tsupResult.error?.code,
    signal: tsupResult.signal,
    stdout: tsupResult.stdout?.toString()?.substring(0, 500), // First 500 chars
    stderr: tsupResult.stderr?.toString()?.substring(0, 500) // First 500 chars
  },
  hypothesisId: 'D'
});
// #endregion

if (tsupResult.error) {
  console.error('[@hua-labs/ui] tsup error:', tsupResult.error.message);
  console.error('[@hua-labs/ui] tsup error code:', tsupResult.error.code);
  // #region agent log
  logDebug({
    location: 'build-debug.js:tsup-error',
    message: 'tsup execution failed with error',
    data: {
      error: tsupResult.error.message,
      code: tsupResult.error.code,
      stack: tsupResult.error.stack
    },
    hypothesisId: 'E'
  });
  // #endregion
  process.exit(1);
}

if (tsupResult.status !== 0) {
  console.error('[@hua-labs/ui] tsup exited with code:', tsupResult.status);
  console.error('[@hua-labs/ui] tsup signal:', tsupResult.signal);
  // #region agent log
  logDebug({
    location: 'build-debug.js:tsup-exit-nonzero',
    message: 'tsup exited with non-zero status',
    data: {
      status: tsupResult.status,
      signal: tsupResult.signal
    },
    hypothesisId: 'E'
  });
  // #endregion
  process.exit(tsupResult.status || 1);
}

console.log('[@hua-labs/ui] tsup completed successfully');

// Execute tsc for type declarations
if (!fs.existsSync(tscPath)) {
  console.error('[@hua-labs/ui] TypeScript compiler not found at:', tscPath);
  // #region agent log
  logDebug({
    location: 'build-debug.js:tsc-missing',
    message: 'TypeScript compiler file not found',
    data: { tscPath, exists: fs.existsSync(tscPath) },
    hypothesisId: 'E'
  });
  // #endregion
  process.exit(1);
}

console.log('[@hua-labs/ui] Executing tsc for type declarations...');
console.log('[@hua-labs/ui] tsc command:', `${process.execPath} ${tscPath} --emitDeclarationOnly`);
console.log('[@hua-labs/ui] Working directory:', path.join(__dirname, '..'));

// #region agent log
logDebug({
  location: 'build-debug.js:tsc-start',
  message: 'Starting tsc execution',
  data: {
    execPath: process.execPath,
    tscPath,
    cwd: path.join(__dirname, '..'),
    command: `${process.execPath} ${tscPath} --emitDeclarationOnly`
  },
  hypothesisId: 'D'
});
// #endregion

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
    errorCode: tscResult.error?.code,
    signal: tscResult.signal,
    stdout: tscResult.stdout?.toString()?.substring(0, 500), // First 500 chars
    stderr: tscResult.stderr?.toString()?.substring(0, 500) // First 500 chars
  },
  hypothesisId: 'D'
});
// #endregion

if (tscResult.error) {
  console.error('[@hua-labs/ui] tsc error:', tscResult.error.message);
  console.error('[@hua-labs/ui] tsc error code:', tscResult.error.code);
  // #region agent log
  logDebug({
    location: 'build-debug.js:tsc-error',
    message: 'tsc execution failed with error',
    data: {
      error: tscResult.error.message,
      code: tscResult.error.code,
      stack: tscResult.error.stack
    },
    hypothesisId: 'E'
  });
  // #endregion
  process.exit(1);
}

if (tscResult.status !== 0) {
  console.error('[@hua-labs/ui] tsc exited with code:', tscResult.status);
  console.error('[@hua-labs/ui] tsc signal:', tscResult.signal);
  // #region agent log
  logDebug({
    location: 'build-debug.js:tsc-exit-nonzero',
    message: 'tsc exited with non-zero status',
    data: {
      status: tscResult.status,
      signal: tscResult.signal
    },
    hypothesisId: 'E'
  });
  // #endregion
  process.exit(tscResult.status || 1);
}

console.log('[@hua-labs/ui] tsc completed successfully');
console.log('[@hua-labs/ui] Build completed successfully!');

// #region agent log
logDebug({
  location: 'build-debug.js:build-success',
  message: 'Build completed successfully',
  data: {
    tsupStatus: tsupResult.status,
    tscStatus: tscResult.status
  },
  hypothesisId: 'D'
});
// #endregion

