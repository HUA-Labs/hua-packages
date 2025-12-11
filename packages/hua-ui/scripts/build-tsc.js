#!/usr/bin/env node
// This script is executed by Node.js, so process.execPath is always available

const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// #region agent log
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
// #endregion

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

// #region agent log
logDebug({
  location: 'build-tsc.js:start',
  message: 'Build script started',
  data: {
    cwd: process.cwd(),
    scriptDir: __dirname,
    packageDir: path.join(__dirname, '..'),
    execPath: process.execPath,
    nodeVersion: process.version,
    platform: process.platform,
    path: process.env.PATH,
    buildCommand: process.env.npm_lifecycle_script || 'unknown'
  },
  hypothesisId: 'A'
});
// #endregion

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

// #region agent log
logDebug({
  location: 'build-tsc.js:node-detection-start',
  message: 'Starting node path detection',
  data: { platform: process.platform, initialPath: process.execPath },
  hypothesisId: 'B'
});
// #endregion

log('[@hua-labs/ui] Platform: ' + process.platform);
log('[@hua-labs/ui] Trying to find node executable...');

// On Windows, use process.execPath directly (most reliable)
if (isWindows) {
  nodePath = process.execPath;
  log('[@hua-labs/ui] Windows detected, using process.execPath: ' + nodePath);
  // #region agent log
  logDebug({
    location: 'build-tsc.js:node-detection-windows',
    message: 'Windows node path selected',
    data: { nodePath },
    hypothesisId: 'B'
  });
  // #endregion
} else {
  // On Linux/Unix, try common paths
  const commonNodePaths = [
    '/usr/bin/node',
    '/usr/local/bin/node',
    '/opt/homebrew/bin/node',
    '/vercel/.nodejs/bin/node',
    process.execPath
  ];

  // #region agent log
  logDebug({
    location: 'build-tsc.js:node-detection-linux-start',
    message: 'Linux node path detection started',
    data: { commonPaths: commonNodePaths },
    hypothesisId: 'B'
  });
  // #endregion

  for (const testPath of commonNodePaths) {
    log('[@hua-labs/ui] Checking: ' + testPath);
    const exists = fs.existsSync(testPath);
    // #region agent log
    logDebug({
      location: 'build-tsc.js:node-path-check',
      message: 'Checking node path',
      data: { testPath, exists },
      hypothesisId: 'B'
    });
    // #endregion
    if (exists) {
      nodePath = testPath;
      log('[@hua-labs/ui] Found node at: ' + nodePath);
      break;
    }
  }

  // Also try which command (Linux/Unix only)
  if (nodePath === process.execPath) {
    try {
      const whichResult = spawnSync('which', ['node'], { encoding: 'utf8', stdio: 'pipe' });
      // #region agent log
      logDebug({
        location: 'build-tsc.js:which-command',
        message: 'which command result',
        data: {
          stdout: whichResult.stdout?.toString(),
          stderr: whichResult.stderr?.toString(),
          code: whichResult.status
        },
        hypothesisId: 'B'
      });
      // #endregion
      if (whichResult.stdout && whichResult.stdout.trim()) {
        const foundPath = whichResult.stdout.trim();
        log('[@hua-labs/ui] which node found: ' + foundPath);
        if (fs.existsSync(foundPath)) {
          nodePath = foundPath;
        }
      }
    } catch (e) {
      log('[@hua-labs/ui] which command failed: ' + e.message);
      // #region agent log
      logDebug({
        location: 'build-tsc.js:which-error',
        message: 'which command error',
        data: { error: e.message },
        hypothesisId: 'B'
      });
      // #endregion
    }
  }
}

// #region agent log
logDebug({
  location: 'build-tsc.js:node-detection-complete',
  message: 'Node path detection complete',
  data: { finalNodePath: nodePath },
  hypothesisId: 'B'
});
// #endregion

log('[@hua-labs/ui] Final node path: ' + nodePath);

// Check if typescript is available
let tscPath;
try {
  tscPath = require.resolve('typescript/lib/tsc.js');
  log('[@hua-labs/ui] TypeScript compiler found at: ' + tscPath);
  
  // #region agent log
  logDebug({
    location: 'build-tsc.js:tsc-resolve-success',
    message: 'TypeScript compiler resolved',
    data: { tscPath, exists: fs.existsSync(tscPath) },
    hypothesisId: 'C'
  });
  // #endregion
  
  // Verify file exists
  if (!fs.existsSync(tscPath)) {
    throw new Error(`TypeScript compiler file does not exist: ${tscPath}`);
  }
  log('[@hua-labs/ui] TypeScript compiler file exists: YES');
} catch (error) {
  log('[@hua-labs/ui] Failed to resolve typescript/lib/tsc.js: ' + error.message);
  
  // #region agent log
  logDebug({
    location: 'build-tsc.js:tsc-resolve-failed',
    message: 'TypeScript compiler resolve failed',
    data: { error: error.message },
    hypothesisId: 'C'
  });
  // #endregion
  
  // Try alternative paths
  const alternativePaths = [
    path.join(__dirname, '../../..', 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(process.cwd(), 'node_modules', 'typescript', 'lib', 'tsc.js'),
    path.join(__dirname, '..', 'node_modules', 'typescript', 'lib', 'tsc.js')
  ];
  
  // #region agent log
  logDebug({
    location: 'build-tsc.js:tsc-alternative-paths',
    message: 'Trying alternative TypeScript paths',
    data: { alternativePaths },
    hypothesisId: 'C'
  });
  // #endregion
  
  log('[@hua-labs/ui] Trying alternative paths...');
  for (const altPath of alternativePaths) {
    log('[@hua-labs/ui] Checking: ' + altPath);
    const exists = fs.existsSync(altPath);
    // #region agent log
    logDebug({
      location: 'build-tsc.js:tsc-alt-check',
      message: 'Checking alternative TypeScript path',
      data: { altPath, exists },
      hypothesisId: 'C'
    });
    // #endregion
    if (exists) {
      tscPath = altPath;
      log('[@hua-labs/ui] Found TypeScript at alternative path: ' + tscPath);
      break;
    }
  }
  
  if (!tscPath) {
    log('[@hua-labs/ui] TypeScript compiler not found in any location');
    // #region agent log
    logDebug({
      location: 'build-tsc.js:tsc-not-found',
      message: 'TypeScript compiler not found',
      data: { checkedPaths: alternativePaths },
      hypothesisId: 'C'
    });
    // #endregion
    process.exit(1);
  }
}

// nodePath is already set above (from the node path detection code)

try {
  log('[@hua-labs/ui] Building with TypeScript compiler at: ' + tscPath);
  log('[@hua-labs/ui] Using Node.js at: ' + nodePath);
  
  const packageDir = path.join(__dirname, '..');
  log('[@hua-labs/ui] Building in directory: ' + packageDir);
  
  // #region agent log
  logDebug({
    location: 'build-tsc.js:spawn-before',
    message: 'About to spawn tsc',
    data: { nodePath, tscPath, packageDir, env: { PATH: process.env.PATH } },
    hypothesisId: 'D'
  });
  // #endregion
  
  const result = spawnSync(nodePath, [tscPath], {
    cwd: packageDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: ''
    },
    shell: false
  });
  
  // #region agent log
  logDebug({
    location: 'build-tsc.js:spawn-after',
    message: 'spawnSync completed',
    data: {
      status: result.status,
      error: result.error?.message,
      signal: result.signal
    },
    hypothesisId: 'D'
  });
  // #endregion
  
  if (result.error) {
    log('[@hua-labs/ui] spawnSync error: ' + result.error.message);
    // #region agent log
    logDebug({
      location: 'build-tsc.js:spawn-error',
      message: 'spawnSync error occurred',
      data: { error: result.error.message, code: result.error.code },
      hypothesisId: 'D'
    });
    // #endregion
    throw result.error;
  }
  
  if (result.status !== 0) {
    log('[@hua-labs/ui] TypeScript compiler exited with code: ' + result.status);
    // #region agent log
    logDebug({
      location: 'build-tsc.js:tsc-exit-nonzero',
      message: 'TypeScript compiler exited with non-zero code',
      data: { status: result.status },
      hypothesisId: 'D'
    });
    // #endregion
    process.exit(result.status || 1);
  }
  
  log('[@hua-labs/ui] Build completed successfully');
  // #region agent log
  logDebug({
    location: 'build-tsc.js:build-success',
    message: 'Build completed successfully',
    data: {},
    hypothesisId: 'D'
  });
  // #endregion
} catch (error) {
  log('[@hua-labs/ui] Build failed: ' + error.message);
  log('[@hua-labs/ui] Error stack: ' + (error.stack || ''));
  if (error.stderr) log('[@hua-labs/ui] stderr: ' + error.stderr.toString());
  if (error.stdout) log('[@hua-labs/ui] stdout: ' + error.stdout.toString());
  // #region agent log
  logDebug({
    location: 'build-tsc.js:build-failed',
    message: 'Build failed with exception',
    data: {
      error: error.message,
      stack: error.stack,
      stderr: error.stderr?.toString(),
      stdout: error.stdout?.toString()
    },
    hypothesisId: 'D'
  });
  // #endregion
  process.exit(1);
}

