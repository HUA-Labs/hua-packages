const { spawnSync } = require('child_process');
const path = require('path');

// Use require.resolve to get absolute path to tsc.js
const tscPath = require.resolve('typescript/lib/tsc.js');
// Use process.execPath to get absolute path to current Node.js executable
const nodePath = process.execPath;

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

