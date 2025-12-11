// #region agent log
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const LOG_PATH = path.join(__dirname, '..', '.cursor', 'debug.log');
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
    // Fallback to HTTP if file write fails
    try {
      require('http').request(SERVER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, () => {}).end(logEntry);
    } catch (e) {}
  }
}

const packageName = process.argv[2];
const buildCommand = process.argv[3];

log({
  location: 'debug-build.js:start',
  message: 'Build started',
  data: { packageName, buildCommand },
  hypothesisId: 'A'
});

try {
  // Check workspace dependencies
  if (packageName === 'my-app' || packageName === 'my-api') {
    log({
      location: 'debug-build.js:check-deps',
      message: 'Checking workspace dependencies',
      data: { packageName },
      hypothesisId: 'C'
    });
    
    const packageJsonPath = path.join(__dirname, '..', 'apps', packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const workspaceDeps = Object.entries(pkg.dependencies || {})
        .filter(([name]) => name.startsWith('@hua-labs/'))
        .map(([name, version]) => ({ name, version }));
      
      // Check if workspace dependencies are built
      const depBuildStatus = {};
      for (const [depName] of workspaceDeps) {
        const depPackageName = depName.replace('@hua-labs/', '');
        const distPath = path.join(__dirname, '..', 'packages', depPackageName, 'dist');
        depBuildStatus[depName] = {
          distExists: fs.existsSync(distPath),
          distPath
        };
      }
      
      log({
        location: 'debug-build.js:workspace-deps',
        message: 'Workspace dependencies found',
        data: { workspaceDeps, depBuildStatus },
        hypothesisId: 'C'
      });
    }
  }
  
  // Check Prisma for my-app
  if (packageName === 'my-app') {
    log({
      location: 'debug-build.js:check-prisma',
      message: 'Checking Prisma schema',
      data: { packageName },
      hypothesisId: 'D'
    });
    
    const prismaSchemaPath = path.join(__dirname, '..', 'apps', packageName, 'prisma', 'schema.prisma');
    const prismaExists = fs.existsSync(prismaSchemaPath);
    const prismaClientPath = path.join(__dirname, '..', 'apps', packageName, 'node_modules', '.prisma', 'client');
    const prismaClientExists = fs.existsSync(prismaClientPath);
    
    log({
      location: 'debug-build.js:prisma-exists',
      message: 'Prisma schema check',
      data: { prismaExists, prismaClientExists, schemaPath: prismaSchemaPath, clientPath: prismaClientPath },
      hypothesisId: 'D'
    });
  }
  
  // Execute build command
  log({
    location: 'debug-build.js:exec-start',
    message: 'Executing build command',
    data: { command: buildCommand, cwd: path.join(__dirname, '..', 'apps', packageName) },
    hypothesisId: 'E'
  });
  
  const result = execSync(buildCommand, {
    cwd: path.join(__dirname, '..', 'apps', packageName),
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  log({
    location: 'debug-build.js:exec-success',
    message: 'Build command succeeded',
    data: { output: result.substring(0, 500) },
    hypothesisId: 'E'
  });
  
  process.exit(0);
} catch (error) {
  log({
    location: 'debug-build.js:exec-error',
    message: 'Build command failed',
    data: {
      error: error.message,
      stderr: error.stderr?.toString().substring(0, 1000),
      stdout: error.stdout?.toString().substring(0, 1000),
      code: error.status || error.code
    },
    hypothesisId: 'E'
  });
  
  console.error(error.message);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}
// #endregion

