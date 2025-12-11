#!/usr/bin/env node

#!/usr/bin/env node

const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Debug: Log environment information
console.log('[@hua-labs/motion] Build script started');
console.log('[@hua-labs/motion] Process exec path:', process.execPath);
console.log('[@hua-labs/motion] Platform:', process.platform);
console.log('[@hua-labs/motion] PATH:', process.env.PATH);

// Try to find node executable in common locations
let nodePath = process.execPath;
const commonNodePaths = [
  '/usr/bin/node',
  '/usr/local/bin/node',
  '/opt/homebrew/bin/node',
  process.execPath
];

console.log('[@hua-labs/motion] Trying to find node executable...');
for (const testPath of commonNodePaths) {
  console.log('[@hua-labs/motion] Checking:', testPath);
  if (fs.existsSync(testPath)) {
    nodePath = testPath;
    console.log('[@hua-labs/motion] Found node at:', nodePath);
    break;
  }
}

// Also try which/where command
try {
  const whichResult = spawnSync('which', ['node'], { encoding: 'utf8', stdio: 'pipe' });
  if (whichResult.stdout && whichResult.stdout.trim()) {
    const foundPath = whichResult.stdout.trim();
    console.log('[@hua-labs/motion] which node found:', foundPath);
    if (fs.existsSync(foundPath)) {
      nodePath = foundPath;
    }
  }
} catch (e) {
  try {
    const whereResult = spawnSync('where', ['node'], { encoding: 'utf8', stdio: 'pipe' });
    if (whereResult.stdout && whereResult.stdout.trim()) {
      const foundPath = whereResult.stdout.trim().split('\n')[0];
      console.log('[@hua-labs/motion] where node found:', foundPath);
      if (fs.existsSync(foundPath)) {
        nodePath = foundPath;
      }
    }
  } catch (e2) {
    console.log('[@hua-labs/motion] where command also failed');
  }
}

console.log('[@hua-labs/motion] Final node path:', nodePath);

// Use require.resolve to get absolute path to tsc.js
const tscPath = require.resolve('typescript/lib/tsc.js');
// nodePath is already set above

try {
  console.log(`[@hua-labs/motion] Building with TypeScript compiler at: ${tscPath}`);
  console.log(`[@hua-labs/motion] Using Node.js at: ${nodePath}`);
  
  const result = spawnSync(nodePath, [tscPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: ''
    },
    shell: false
  });
  
  if (result.error) {
    throw result.error;
  }
  
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
  
  console.log('[@hua-labs/motion] Build completed successfully');
} catch (error) {
  console.error(`[@hua-labs/motion] Build failed: ${error.message}`);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

