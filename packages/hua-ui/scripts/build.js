const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const tsupPath = path.join(__dirname, '../../..', 'node_modules', 'tsup', 'dist', 'cli-default.js');
const tscPath = path.join(__dirname, '../../..', 'node_modules', 'typescript', 'lib', 'tsc.js');

try {
  if (!fs.existsSync(tsupPath)) {
    throw new Error(`tsup not found at ${tsupPath}`);
  }
  execSync('node', [tsupPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  if (!fs.existsSync(tscPath)) {
    throw new Error(`TypeScript compiler not found at ${tscPath}`);
  }
  execSync('node', [tscPath, '--emitDeclarationOnly'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
} catch (error) {
  console.error(`[@hua-labs/ui] Build failed: ${error.message}`);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

