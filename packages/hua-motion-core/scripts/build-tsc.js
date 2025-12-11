const { execSync } = require('child_process');
const path = require('path');

// Use require.resolve to get absolute path to tsc.js
const tscPath = require.resolve('typescript/lib/tsc.js');

try {
  console.log(`[@hua-labs/motion-core] Building with TypeScript compiler at: ${tscPath}`);
  
  execSync('node', [tscPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: ''
    }
  });
  
  console.log('[@hua-labs/motion-core] Build completed successfully');
} catch (error) {
  console.error(`[@hua-labs/motion-core] Build failed: ${error.message}`);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

