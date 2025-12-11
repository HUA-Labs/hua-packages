#!/usr/bin/env tsx
/**
 * 자동 문서 업데이트 스크립트
 * 
 * 코드 변경사항을 분석하여 관련 문서를 자동으로 업데이트합니다.
 * 
 * 사용법:
 *   pnpm update:docs
 *   pnpm update:docs --check-only
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';

interface DocUpdate {
  type: 'component' | 'api' | 'hook' | 'util';
  path: string;
  name: string;
  needsDoc: boolean;
  hasDoc: boolean;
  docPath?: string;
}

function getCurrentBranch(): string {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'main';
  }
}

function getChangedFiles(baseBranch: string = 'develop'): string[] {
  try {
    const headBranch = getCurrentBranch();
    const output = execSync(
      `git diff --name-only ${baseBranch}...${headBranch}`,
      { encoding: 'utf-8' }
    );
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function findComponentFiles(packagePath: string): DocUpdate[] {
  const updates: DocUpdate[] = [];
  const componentsPath = join(process.cwd(), packagePath.replace(/^\.\.\//, ''), 'src/components');

  if (!existsSync(componentsPath)) {
    return updates;
  }

  function scanDirectory(dir: string, relativePath: string = '') {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, join(relativePath, entry));
      } else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) {
        // 컴포넌트 파일인지 확인
        const content = readFileSync(fullPath, 'utf-8');
        const isComponent = content.includes('export') && (
          content.includes('React.FC') ||
          content.includes('forwardRef') ||
          content.includes('function ') ||
          content.match(/export\s+(const|function)\s+\w+\s*=/)
        );

        if (isComponent) {
          const componentName = basename(entry, '.tsx').replace('.ts', '');
          const docPath = join(packagePath, 'docs', `${componentName}.md`);
          
          updates.push({
            type: 'component',
            path: join(relativePath, entry),
            name: componentName,
            needsDoc: true,
            hasDoc: existsSync(docPath),
            docPath,
          });
        }
      }
    }
  }

  scanDirectory(componentsPath);
  return updates;
}

function findHookFiles(packagePath: string): DocUpdate[] {
  const updates: DocUpdate[] = [];
  const hooksPath = join(packagePath, 'src/hooks');

  if (!existsSync(hooksPath)) {
    return updates;
  }

  function scanDirectory(dir: string, relativePath: string = '') {
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath, join(relativePath, entry));
      } else if (entry.endsWith('.ts') && entry.startsWith('use')) {
        const hookName = basename(entry, '.ts');
        const docPath = join(packagePath, 'docs', `hooks/${hookName}.md`);
        
        updates.push({
          type: 'hook',
          path: join(relativePath, entry),
          name: hookName,
          needsDoc: true,
          hasDoc: existsSync(docPath),
          docPath,
        });
      }
    }
  }

  scanDirectory(hooksPath);
  return updates;
}

function generateComponentDocTemplate(componentName: string, filePath: string): string {
  return `# ${componentName}

## 개요

${componentName} 컴포넌트에 대한 문서입니다.

## 사용법

\`\`\`tsx
import { ${componentName} } from '@hua-labs/ui';

// 기본 사용
<${componentName} />
\`\`\`

## Props

| Prop | Type | Default | 설명 |
|------|------|---------|------|
| - | - | - | - |

## 예제

### 기본 예제

\`\`\`tsx
<${componentName} />
\`\`\`

## 참고

- 파일 위치: \`${filePath}\`
- 생성일: ${new Date().toISOString().split('T')[0]}

---

**참고**: 이 문서는 자동 생성되었습니다. 내용을 검토하고 보완하세요.
`;
}

function generateHookDocTemplate(hookName: string, filePath: string): string {
  return `# ${hookName}

## 개요

${hookName} 훅에 대한 문서입니다.

## 사용법

\`\`\`tsx
import { ${hookName} } from '@hua-labs/motion-core';

const MyComponent = () => {
  const result = ${hookName}();
  
  return <div>{/* ... */}</div>;
};
\`\`\`

## 반환값

| 속성 | Type | 설명 |
|------|------|------|
| - | - | - |

## 예제

### 기본 예제

\`\`\`tsx
const result = ${hookName}();
\`\`\`

## 참고

- 파일 위치: \`${filePath}\`
- 생성일: ${new Date().toISOString().split('T')[0]}

---

**참고**: 이 문서는 자동 생성되었습니다. 내용을 검토하고 보완하세요.
`;
}

function updateDocs(packagePath: string, checkOnly: boolean = false): {
  created: string[];
  missing: string[];
  updated: string[];
} {
  const result = {
    created: [] as string[],
    missing: [] as string[],
    updated: [] as string[],
  };

  // 컴포넌트 문서 생성
  const components = findComponentFiles(packagePath);
  components.forEach(comp => {
    if (!comp.hasDoc && comp.needsDoc) {
      result.missing.push(comp.path);
      
      if (!checkOnly) {
        // 문서 디렉토리 생성
        const docDir = dirname(comp.docPath!);
        if (!existsSync(docDir)) {
          execSync(`mkdir -p "${docDir}"`, { shell: true });
        }

        // 문서 생성
        const template = generateComponentDocTemplate(comp.name, comp.path);
        writeFileSync(comp.docPath!, template, 'utf-8');
        result.created.push(comp.docPath!);
      }
    }
  });

  // 훅 문서 생성
  const hooks = findHookFiles(packagePath);
  hooks.forEach(hook => {
    if (!hook.hasDoc && hook.needsDoc) {
      result.missing.push(hook.path);
      
      if (!checkOnly) {
        // 문서 디렉토리 생성
        const docDir = dirname(hook.docPath!);
        if (!existsSync(docDir)) {
          execSync(`mkdir -p "${docDir}"`, { shell: true });
        }

        // 문서 생성
        const template = generateHookDocTemplate(hook.name, hook.path);
        writeFileSync(hook.docPath!, template, 'utf-8');
        result.created.push(hook.docPath!);
      }
    }
  });

  return result;
}

function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check-only');

  console.log(`\n📚 자동 문서 업데이트 스크립트\n`);
  console.log(`모드: ${checkOnly ? '검사만' : '생성 및 업데이트'}\n`);

  const packages = [
    join(process.cwd(), 'packages', 'hua-ui'),
    join(process.cwd(), 'packages', 'hua-motion-core'),
    join(process.cwd(), 'packages', 'hua-motion-advanced'),
  ];

  const summary = {
    totalCreated: 0,
    totalMissing: 0,
    packages: [] as Array<{ name: string; created: number; missing: number }>,
  };

  packages.forEach(pkgPath => {
    if (!existsSync(pkgPath)) {
      return;
    }

    const pkgName = basename(pkgPath);
    const result = updateDocs(pkgPath, checkOnly);

    summary.totalCreated += result.created.length;
    summary.totalMissing += result.missing.length;
    summary.packages.push({
      name: pkgName,
      created: result.created.length,
      missing: result.missing.length,
    });

    if (result.created.length > 0 || result.missing.length > 0) {
      console.log(`\n📦 ${pkgName}`);
      if (result.created.length > 0) {
        console.log(`  ✅ 생성된 문서: ${result.created.length}개`);
        result.created.forEach(path => {
          console.log(`     - ${path}`);
        });
      }
      if (result.missing.length > 0 && checkOnly) {
        console.log(`  ⚠️  문서 누락: ${result.missing.length}개`);
        result.missing.slice(0, 10).forEach(path => {
          console.log(`     - ${path}`);
        });
        if (result.missing.length > 10) {
          console.log(`     ... 외 ${result.missing.length - 10}개`);
        }
      }
    }
  });

  console.log(`\n📊 요약`);
  console.log(`  생성된 문서: ${summary.totalCreated}개`);
  console.log(`  문서 누락: ${summary.totalMissing}개`);

  if (checkOnly && summary.totalMissing > 0) {
    console.log(`\n💡 문서를 생성하려면: pnpm update:docs`);
  }
}

// tsx로 실행 시 자동으로 main 함수 호출
main();

export { updateDocs, findComponentFiles, findHookFiles };

