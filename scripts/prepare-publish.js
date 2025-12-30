/**
 * prepare-publish.js
 * 
 * npm pack 전에 workspace:* 의존성을 실제 버전으로 변환
 */

const fs = require('fs');
const path = require('path');

// npm pack은 패키지 디렉토리에서 실행되므로 process.cwd()가 패키지 경로
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// workspace:* 의존성을 실제 버전으로 변환
function resolveWorkspaceDeps(deps) {
  if (!deps) return deps;
  
  const resolved = { ...deps };
  const monorepoRoot = path.join(__dirname, '..');
  
  for (const [depName, depVersion] of Object.entries(deps)) {
    if (depVersion === 'workspace:*') {
      // 모노레포에서 해당 패키지의 버전 찾기
      const packageName = depName.replace('@hua-labs/', '');
      // 패키지 디렉토리명은 hua- 접두사가 있을 수 있음
      const possiblePaths = [
        path.join(monorepoRoot, 'packages', packageName, 'package.json'),
        path.join(monorepoRoot, 'packages', `hua-${packageName}`, 'package.json'),
        path.join(monorepoRoot, 'packages', packageName.replace('hua-', ''), 'package.json'),
      ];
      
      let depPackagePath = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          depPackagePath = possiblePath;
          break;
        }
      }
      
      if (depPackagePath) {
        const depPackageJson = JSON.parse(fs.readFileSync(depPackagePath, 'utf8'));
        resolved[depName] = `^${depPackageJson.version}`;
        console.log(`   ${depName}: workspace:* → ^${depPackageJson.version}`);
      } else {
        // packages 외부에서 찾기 (예: apps, tools)
        // 간단하게 ^0.1.0으로 설정 (실제로는 더 정교한 로직 필요)
        resolved[depName] = '^0.1.0';
        console.log(`   ${depName}: workspace:* → ^0.1.0 (not found in packages)`);
      }
    }
  }
  
  return resolved;
}

// dependencies와 devDependencies 모두 변환
if (packageJson.dependencies) {
  packageJson.dependencies = resolveWorkspaceDeps(packageJson.dependencies);
}
if (packageJson.devDependencies) {
  packageJson.devDependencies = resolveWorkspaceDeps(packageJson.devDependencies);
}
if (packageJson.peerDependencies) {
  // peerDependencies는 그대로 유지
}

// 변환된 package.json 저장
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// 변환 결과 확인
const changedDeps = Object.entries(packageJson.dependencies || {})
  .filter(([name, version]) => version !== 'workspace:*' && name.startsWith('@hua-labs/'));
console.log('✅ Prepared package.json for publishing (workspace:* → versions)');
if (changedDeps.length > 0) {
  console.log('   Changed dependencies:', changedDeps.map(([name, version]) => `${name}: ${version}`).join(', '));
}
