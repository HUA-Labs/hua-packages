// #region agent log
const fs = require('fs');
const path = require('path');
const LOG_PATH = path.join(__dirname, '../../..', '.cursor', 'debug.log');
const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d';

function log(data) {
  const logEntry = JSON.stringify({
    ...data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: process.env.RUN_ID || 'run1'
  }) + '\n';
  
  try {
    fs.appendFileSync(LOG_PATH, logEntry);
  } catch (err) {
    try {
      require('http').request(SERVER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, () => {}).end(logEntry);
    } catch (e) {}
  }
}
// #endregion

const { execSync } = require('child_process');

let tscPath = path.join(__dirname, '../../..', 'node_modules', 'typescript', 'lib', 'tsc.js');
const packageDir = path.join(__dirname, '..');

log({
  location: 'hua-i18n-core/build.js:start',
  message: 'Build script started',
  data: { 
    tscPath,
    packageDir,
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform
  },
  hypothesisId: 'A'
});

// Check if tsc exists
let tscExists = fs.existsSync(tscPath);
log({
  location: 'hua-i18n-core/build.js:path-check',
  message: 'TypeScript compiler path check',
  data: { tscPath, exists: tscExists },
  hypothesisId: 'B'
});

// Check node_modules structure
const rootNodeModules = path.join(__dirname, '../../..', 'node_modules');
const rootNodeModulesExists = fs.existsSync(rootNodeModules);
log({
  location: 'hua-i18n-core/build.js:node-modules-check',
  message: 'Root node_modules check',
  data: { rootNodeModules, exists: rootNodeModulesExists },
  hypothesisId: 'C'
});

// Check .pnpm structure if exists
let pnpmTscPath = null;
if (!tscExists && rootNodeModulesExists) {
  const pnpmPath = path.join(rootNodeModules, '.pnpm');
  if (fs.existsSync(pnpmPath)) {
    try {
      const pnpmDirs = fs.readdirSync(pnpmPath).filter(d => d.startsWith('typescript@'));
      if (pnpmDirs.length > 0) {
        pnpmTscPath = path.join(pnpmPath, pnpmDirs[0], 'node_modules', 'typescript', 'lib', 'tsc.js');
        const pnpmTscExists = fs.existsSync(pnpmTscPath);
        log({
          location: 'hua-i18n-core/build.js:pnpm-check',
          message: 'Found TypeScript in .pnpm structure',
          data: { pnpmTscPath, exists: pnpmTscExists },
          hypothesisId: 'D'
        });
        if (pnpmTscExists) {
          tscPath = pnpmTscPath;
          tscExists = true;
        }
      }
    } catch (e) {
      log({
        location: 'hua-i18n-core/build.js:pnpm-error',
        message: 'Error checking .pnpm structure',
        data: { error: e.message },
        hypothesisId: 'D'
      });
    }
  }
}

try {
  if (!tscExists) {
    throw new Error(`TypeScript compiler not found at ${tscPath}`);
  }
  
  const finalTscPath = tscPath;
  log({
    location: 'hua-i18n-core/build.js:exec-start',
    message: 'Executing TypeScript compiler',
    data: { finalTscPath, packageDir },
    hypothesisId: 'E'
  });
  
  execSync('node', [finalTscPath], {
    cwd: packageDir,
    stdio: 'inherit'
  });
  
  log({
    location: 'hua-i18n-core/build.js:success',
    message: 'Build completed successfully',
    hypothesisId: 'E'
  });
} catch (error) {
  log({
    location: 'hua-i18n-core/build.js:error',
    message: 'Build failed',
    data: {
      error: error.message,
      stderr: error.stderr?.toString().substring(0, 1000),
      stdout: error.stdout?.toString().substring(0, 1000),
      code: error.status || error.code
    },
    hypothesisId: 'F'
  });
  
  console.error(`[@hua-labs/i18n-core] Build failed: ${error.message}`);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

