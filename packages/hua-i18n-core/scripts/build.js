// #region agent log
// Immediate console log to verify script execution
console.error('[@hua-labs/i18n-core] build.js: Script started at', new Date().toISOString());
console.error('[@hua-labs/i18n-core] build.js: __dirname =', __dirname);
console.error('[@hua-labs/i18n-core] build.js: process.cwd() =', process.cwd());
console.error('[@hua-labs/i18n-core] build.js: process.platform =', process.platform);
console.error('[@hua-labs/i18n-core] build.js: process.version =', process.version);

const fs = require('fs');
const path = require('path');

// Try to create log directory if it doesn't exist
const LOG_DIR = path.join(__dirname, '../../..', '.cursor');
const LOG_PATH = path.join(LOG_DIR, 'debug.log');
const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d';

function log(data) {
  const logEntry = JSON.stringify({
    ...data,
    timestamp: Date.now(),
    sessionId: 'debug-session',
    runId: process.env.RUN_ID || 'run1'
  }) + '\n';
  
  // Always log to console first for immediate visibility
  console.error('[@hua-labs/i18n-core] LOG:', JSON.stringify(data, null, 2));
  
  try {
    // Ensure log directory exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_PATH, logEntry);
  } catch (err) {
    // If file write fails, try HTTP (but don't fail if that also fails)
    try {
      const http = require('http');
      const url = new URL(SERVER_ENDPOINT);
      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      };
      const req = http.request(options, () => {});
      req.on('error', () => {});
      req.write(logEntry);
      req.end();
    } catch (e) {
      // Silently fail - we already logged to console
    }
  }
}
// #endregion

// Log immediately after function definition
log({
  location: 'hua-i18n-core/build.js:module-load',
  message: 'Module loaded successfully',
  data: { 
    nodeVersion: process.version,
    platform: process.platform,
    cwd: process.cwd(),
    __dirname: __dirname
  },
  hypothesisId: 'A'
});

const { execSync } = require('child_process');

log({
  location: 'hua-i18n-core/build.js:requires-loaded',
  message: 'All requires loaded successfully',
  data: { 
    execSyncType: typeof execSync,
    fsType: typeof fs,
    pathType: typeof path
  },
  hypothesisId: 'A'
});

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

