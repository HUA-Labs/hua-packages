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

