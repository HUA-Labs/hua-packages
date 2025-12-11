#!/usr/bin/env node

const { spawnSync, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// #region agent log
fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:8',message:'Build script started',data:{platform:process.platform,execPath:process.execPath,path:process.env.PATH},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

// Debug: Log environment information
console.log('[@hua-labs/i18n-core] Build script started');
console.log('[@hua-labs/i18n-core] Process exec path:', process.execPath);
console.log('[@hua-labs/i18n-core] Platform:', process.platform);
console.log('[@hua-labs/i18n-core] PATH:', process.env.PATH);

// Try to find node executable in common locations
let nodePath = process.execPath;
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

console.log('[@hua-labs/i18n-core] Platform:', process.platform);
console.log('[@hua-labs/i18n-core] Trying to find node executable...');

// On Windows, use process.execPath directly (most reliable)
if (isWindows) {
  nodePath = process.execPath;
  console.log('[@hua-labs/i18n-core] Windows detected, using process.execPath:', nodePath);
} else {
  // On Linux/Unix, try common paths
  const commonNodePaths = [
    '/usr/bin/node',
    '/usr/local/bin/node',
    '/opt/homebrew/bin/node',
    '/vercel/.nodejs/bin/node',
    process.execPath
  ];

  for (const testPath of commonNodePaths) {
    console.log('[@hua-labs/i18n-core] Checking:', testPath);
    if (fs.existsSync(testPath)) {
      nodePath = testPath;
      console.log('[@hua-labs/i18n-core] Found node at:', nodePath);
      break;
    }
  }

  // Also try which command (Linux/Unix only)
  if (nodePath === process.execPath) {
    try {
      const whichResult = spawnSync('which', ['node'], { encoding: 'utf8', stdio: 'pipe' });
      if (whichResult.stdout && whichResult.stdout.trim()) {
        const foundPath = whichResult.stdout.trim();
        console.log('[@hua-labs/i18n-core] which node found:', foundPath);
        if (fs.existsSync(foundPath)) {
          nodePath = foundPath;
        }
      }
    } catch (e) {
      console.log('[@hua-labs/i18n-core] which command failed:', e.message);
    }
  }
}

console.log('[@hua-labs/i18n-core] Final node path:', nodePath);

// Use require.resolve to get absolute path to tsc.js
let tscPath;
try {
  tscPath = require.resolve('typescript/lib/tsc.js');
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:64',message:'TypeScript compiler path resolved',data:{tscPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:68',message:'TypeScript compiler path resolution failed',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  throw error;
}

// nodePath is already set above

try {
  console.log(`[@hua-labs/i18n-core] Building with TypeScript compiler at: ${tscPath}`);
  console.log(`[@hua-labs/i18n-core] Using Node.js at: ${nodePath}`);
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:75',message:'Before spawnSync',data:{nodePath,tscPath,cwd:path.join(__dirname,'..')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
  // #endregion
  
  const result = spawnSync(nodePath, [tscPath], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: ''
    },
    shell: false
  });
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:89',message:'After spawnSync',data:{status:result.status,error:result.error?.message,signal:result.signal},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  if (result.error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:93',message:'spawnSync error',data:{error:result.error.message,code:result.error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    throw result.error;
  }
  
  if (result.status !== 0) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:99',message:'Build failed with non-zero exit code',data:{status:result.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    process.exit(result.status || 1);
  }
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:105',message:'Build completed successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
  // #endregion
  
  console.log('[@hua-labs/i18n-core] Build completed successfully');
} catch (error) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/e26607ce-6a75-4b7a-9d1f-af0070217f4d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'build-tsc.js:110',message:'Build exception caught',data:{error:error.message,stack:error.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
  // #endregion
  console.error(`[@hua-labs/i18n-core] Build failed: ${error.message}`);
  if (error.stderr) console.error(error.stderr.toString());
  if (error.stdout) console.error(error.stdout.toString());
  process.exit(1);
}

