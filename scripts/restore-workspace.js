/**
 * restore-workspace.js
 * 
 * npm pack 후에 workspace:* 의존성 복원
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Git을 사용해서 package.json 복원
try {
  execSync('git checkout -- package.json', { cwd: process.cwd(), stdio: 'inherit' });
  console.log('✅ Restored package.json (workspace:* dependencies)');
} catch (error) {
  console.warn('⚠️  Could not restore package.json via git. Please restore manually.');
}
