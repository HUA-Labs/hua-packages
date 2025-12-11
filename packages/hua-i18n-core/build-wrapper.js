#!/usr/bin/env node
// #region agent log
const logPath = require('path').join(require('path').dirname(require.main.filename), '../../.cursor/debug.log');
const log = (data) => {
  try {
    const fs = require('fs');
    const logEntry = JSON.stringify({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      location: 'build-wrapper.js:entry',
      message: data.message || 'build-wrapper.js execution',
      data: data,
      sessionId: 'debug-session',
      runId: 'run1',
      hypothesisId: data.hypothesisId || 'A'
    }) + '\n';
    fs.appendFileSync(logPath, logEntry, 'utf8');
    fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: logEntry.trim()
    }).catch(() => {});
  } catch (e) {}
};
// #endregion

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// #region agent log
log({
  hypothesisId: 'A',
  message: 'build-wrapper.js started',
  data: {
    __dirname,
    processExecPath: process.execPath,
    processCwd: process.cwd(),
    processArgv: process.argv,
    nodeVersion: process.version,
    platform: process.platform,
    envPath: process.env.PATH
  }
});
// #endregion

const tscPath = path.resolve(__dirname, '../../node_modules/typescript/lib/tsc.js');

// #region agent log
log({
  hypothesisId: 'B',
  message: 'tsc path resolved',
  data: {
    tscPath,
    tscExists: fs.existsSync(tscPath),
    nodeModulesExists: fs.existsSync(path.resolve(__dirname, '../../node_modules')),
    typescriptExists: fs.existsSync(path.resolve(__dirname, '../../node_modules/typescript'))
  }
});
// #endregion

if (!fs.existsSync(tscPath)) {
  // #region agent log
  log({
    hypothesisId: 'C',
    message: 'tsc.js not found',
    data: { tscPath, resolvedPath: path.resolve(tscPath) }
  });
  // #endregion
  console.error(`Error: tsc.js not found at ${tscPath}`);
  process.exit(1);
}

// #region agent log
log({
  hypothesisId: 'D',
  message: 'attempting to execute tsc',
  data: {
    command: `${process.execPath} ${tscPath}`,
    nodeExecPath: process.execPath,
    cwd: __dirname
  }
});
// #endregion

try {
  // Use process.execPath to avoid PATH issues
  execSync(`${process.execPath} ${tscPath}`, {
    stdio: 'inherit',
    cwd: __dirname,
    env: { ...process.env, PATH: process.env.PATH || '' }
  });
  // #region agent log
  log({
    hypothesisId: 'E',
    message: 'tsc execution succeeded',
    data: { tscPath }
  });
  // #endregion
} catch (error) {
  // #region agent log
  log({
    hypothesisId: 'F',
    message: 'tsc execution failed',
    data: {
      error: error.message,
      code: error.code,
      signal: error.signal,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString()
    }
  });
  // #endregion
  process.exit(1);
}

