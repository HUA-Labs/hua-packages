// #region agent log
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../../..', '.cursor', 'debug.log');
const SERVER_ENDPOINT = 'http://127.0.0.1:7242/ingest/d0fb42a7-faa0-49b2-a581-89f093cbac52';

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

const rootNodeModules = path.join(__dirname, '../../..', 'node_modules');
const tsupPath1 = path.join(rootNodeModules, 'tsup', 'dist', 'cli-default.js');
const tsupPath2 = path.join(rootNodeModules, 'tsx', 'dist', 'cli.mjs');
const tscPath = path.join(rootNodeModules, 'typescript', 'lib', 'tsc.js');
const packageDir = path.join(__dirname, '..');

log({
  location: 'hua-ui/build.js:start',
  message: 'Build script started',
  data: { 
    rootNodeModules,
    tsupPath1,
    tsupPath2,
    tscPath,
    packageDir,
    cwd: process.cwd()
  },
  hypothesisId: 'A'
});

// Check paths
const paths = {
  tsupPath1: { path: tsupPath1, exists: fs.existsSync(tsupPath1) },
  tsupPath2: { path: tsupPath2, exists: fs.existsSync(tsupPath2) },
  tscPath: { path: tscPath, exists: fs.existsSync(tscPath) },
  rootNodeModules: { path: rootNodeModules, exists: fs.existsSync(rootNodeModules) }
};

log({
  location: 'hua-ui/build.js:path-check',
  message: 'Path existence check',
  data: paths,
  hypothesisId: 'A'
});

// Try to find tsup in .pnpm structure
let tsupActualPath = null;
if (!paths.tsupPath1.exists) {
  const pnpmPath = path.join(rootNodeModules, '.pnpm');
  if (fs.existsSync(pnpmPath)) {
    try {
      const pnpmDirs = fs.readdirSync(pnpmPath).filter(d => d.startsWith('tsup@'));
      if (pnpmDirs.length > 0) {
        const tsupInPnpm = path.join(pnpmPath, pnpmDirs[0], 'node_modules', 'tsup', 'dist', 'cli-default.js');
        if (fs.existsSync(tsupInPnpm)) {
          tsupActualPath = tsupInPnpm;
          log({
            location: 'hua-ui/build.js:pnpm-found',
            message: 'Found tsup in .pnpm structure',
            data: { tsupInPnpm, exists: true },
            hypothesisId: 'B'
          });
        }
      }
    } catch (e) {
      log({
        location: 'hua-ui/build.js:pnpm-search-error',
        message: 'Error searching .pnpm',
        data: { error: e.message },
        hypothesisId: 'B'
      });
    }
  }
}

// Try to find tsx in .pnpm structure
let tsxActualPath = null;
if (!paths.tsupPath2.exists) {
  const pnpmPath = path.join(rootNodeModules, '.pnpm');
  if (fs.existsSync(pnpmPath)) {
    try {
      const pnpmDirs = fs.readdirSync(pnpmPath).filter(d => d.startsWith('tsx@'));
      if (pnpmDirs.length > 0) {
        const tsxInPnpm = path.join(pnpmPath, pnpmDirs[0], 'node_modules', 'tsx', 'dist', 'cli.mjs');
        if (fs.existsSync(tsxInPnpm)) {
          tsxActualPath = tsxInPnpm;
          log({
            location: 'hua-ui/build.js:tsx-pnpm-found',
            message: 'Found tsx in .pnpm structure',
            data: { tsxInPnpm, exists: true },
            hypothesisId: 'C'
          });
        }
      }
    } catch (e) {
      log({
        location: 'hua-ui/build.js:tsx-pnpm-search-error',
        message: 'Error searching .pnpm for tsx',
        data: { error: e.message },
        hypothesisId: 'C'
      });
    }
  }
}

// Check if node is available
let nodePath = 'node';
try {
  const nodeCheck = execSync('which node', { encoding: 'utf8', stdio: 'pipe' }).trim();
  if (nodeCheck) {
    nodePath = nodeCheck;
  }
} catch (e) {
  try {
    const nodeCheck = execSync('where node', { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (nodeCheck) {
      nodePath = nodeCheck.split('\n')[0];
    }
  } catch (e2) {
    // Use default 'node'
  }
}

log({
  location: 'hua-ui/build.js:node-check',
  message: 'Node path check',
  data: { nodePath, processExecPath: process.execPath, hasSpaces: process.execPath.includes(' ') },
  hypothesisId: 'G'
});

try {
  // Use process.execPath (most reliable)
  // execSync with array automatically handles spaces, but we need to ensure proper encoding
  const execNode = process.execPath;
  
  // Set encoding explicitly for Windows
  // Use 'pipe' instead of 'inherit' to avoid Windows stdio encoding issues
  const execOptions = {
    cwd: packageDir,
    stdio: 'pipe',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '',
      PYTHONIOENCODING: 'utf-8'
    },
    encoding: 'utf8',
    shell: false
  };
  
  // Helper to execute and handle output using spawnSync (supports array args)
  function execWithOutput(command, args, options) {
    const result = spawnSync(command, args, options);
    
    if (result.stdout) {
      process.stdout.write(result.stdout.toString('utf8'));
    }
    if (result.stderr) {
      process.stderr.write(result.stderr.toString('utf8'));
    }
    
    if (result.error) {
      throw result.error;
    }
    
    if (result.status !== 0) {
      const error = new Error(`Command failed with exit code ${result.status}`);
      error.status = result.status;
      error.stdout = result.stdout;
      error.stderr = result.stderr;
      throw error;
    }
    
    return result;
  }
  
  // Try method 1: node + tsx + tsup (current approach)
  if (tsxActualPath || paths.tsupPath2.exists) {
    const tsxPath = tsxActualPath || tsupPath2;
    const tsupTarget = tsupActualPath || tsupPath1;
    
    log({
      location: 'hua-ui/build.js:try-tsx',
      message: 'Attempting tsup via tsx',
      data: { 
        execNode,
        execNodeLength: execNode.length,
        tsxPath, 
        tsupTarget, 
        tsxExists: fs.existsSync(tsxPath), 
        tsupExists: fs.existsSync(tsupTarget) 
      },
      hypothesisId: 'D'
    });
    
    if (fs.existsSync(tsxPath) && fs.existsSync(tsupTarget)) {
      execWithOutput(execNode, [tsxPath, tsupTarget], execOptions);
      log({
        location: 'hua-ui/build.js:tsx-success',
        message: 'tsup via tsx succeeded',
        hypothesisId: 'D'
      });
    } else {
      throw new Error(`tsx or tsup not found: tsx=${fs.existsSync(tsxPath)}, tsup=${fs.existsSync(tsupTarget)}`);
    }
  } else {
    // Fallback: try direct node execution
    if (tsupActualPath || paths.tsupPath1.exists) {
      const tsupPath = tsupActualPath || tsupPath1;
      log({
        location: 'hua-ui/build.js:try-direct',
        message: 'Attempting direct node execution',
        data: { execNode, tsupPath, exists: fs.existsSync(tsupPath) },
        hypothesisId: 'E'
      });
      
      execWithOutput(execNode, [tsupPath], execOptions);
      log({
        location: 'hua-ui/build.js:direct-success',
        message: 'Direct node execution succeeded',
        hypothesisId: 'E'
      });
    } else {
      throw new Error(`tsup not found at any location`);
    }
  }
  
  // Run tsc
  if (!paths.tscPath.exists) {
    throw new Error(`TypeScript compiler not found at ${tscPath}`);
  }
  
  log({
    location: 'hua-ui/build.js:tsc-start',
    message: 'Running tsc',
    data: { tscPath },
    hypothesisId: 'F'
  });
  
  execWithOutput(execNode, [tscPath, '--emitDeclarationOnly'], execOptions);
  
  log({
    location: 'hua-ui/build.js:tsc-success',
    message: 'tsc succeeded',
    hypothesisId: 'F'
  });
} catch (error) {
  log({
    location: 'hua-ui/build.js:error',
    message: 'Build failed',
    data: {
      error: error.message,
      stderr: error.stderr?.toString().substring(0, 1000),
      stdout: error.stdout?.toString().substring(0, 1000),
      code: error.status || error.code
    },
    hypothesisId: 'G'
  });
  
  console.error(`[@hua-labs/ui] Build failed: ${error.message}`);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

