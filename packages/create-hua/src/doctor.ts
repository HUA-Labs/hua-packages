/**
 * create-hua - Doctor Command
 *
 * Diagnoses project health and provides solutions
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkPrerequisites, validateTranslationFiles } from './utils';
import {
  MIN_NODE_VERSION,
  AI_CONTEXT_FILES,
  isEnglishOnly,
  compareVersions,
} from './shared';

/**
 * Diagnose project health
 */
export async function diagnoseProject(projectPath: string): Promise<{
  healthy: boolean;
  issues: Array<{ type: 'error' | 'warning' | 'info'; message: string; solution?: string }>;
}> {
  const isEn = isEnglishOnly();
  const issues: Array<{ type: 'error' | 'warning' | 'info'; message: string; solution?: string }> = [];

  // Check if project directory exists
  if (!(await fs.pathExists(projectPath))) {
    return {
      healthy: false,
      issues: [{
        type: 'error',
        message: isEn
          ? `Project directory not found: ${projectPath}`
          : `프로젝트 디렉토리를 찾을 수 없습니다: ${projectPath}`,
        solution: isEn
          ? 'Make sure you are in the correct directory or provide the correct path'
          : '올바른 디렉토리에 있는지 확인하거나 올바른 경로를 제공하세요',
      }],
    };
  }

  // Check package.json
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    issues.push({
      type: 'error',
      message: isEn ? 'package.json not found' : 'package.json을 찾을 수 없습니다',
      solution: isEn
        ? 'This might not be a valid hua project. Run create-hua to initialize.'
        : '유효한 hua 프로젝트가 아닐 수 있습니다. create-hua를 실행하여 초기화하세요.',
    });
  } else {
    try {
      const packageJson = await fs.readJSON(packageJsonPath);

      if (!packageJson.dependencies?.['@hua-labs/hua']) {
        issues.push({
          type: 'error',
          message: isEn ? '@hua-labs/hua not found in dependencies' : '의존성에 @hua-labs/hua가 없습니다',
          solution: isEn
            ? 'Run: pnpm install @hua-labs/hua'
            : '실행: pnpm install @hua-labs/hua',
        });
      }
    } catch (error) {
      issues.push({
        type: 'error',
        message: isEn
          ? `Failed to parse package.json: ${error instanceof Error ? error.message : String(error)}`
          : `package.json 파싱 실패: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  // Check hua.config.ts
  const configPath = path.join(projectPath, 'hua.config.ts');
  if (!(await fs.pathExists(configPath))) {
    issues.push({
      type: 'error',
      message: isEn ? 'hua.config.ts not found' : 'hua.config.ts를 찾을 수 없습니다',
      solution: isEn
        ? 'This file is required for hua framework. Re-run create-hua.'
        : '이 파일은 hua 프레임워크에 필요합니다. create-hua를 다시 실행하세요.',
    });
  }

  // Check required directories
  const requiredDirs = ['app', 'lib', 'store', 'translations'];
  for (const dir of requiredDirs) {
    const dirPath = path.join(projectPath, dir);
    if (!(await fs.pathExists(dirPath))) {
      issues.push({
        type: 'warning',
        message: isEn ? `Required directory missing: ${dir}` : `필수 디렉토리 누락: ${dir}`,
        solution: isEn
          ? 'Re-run create-hua to restore project structure'
          : '프로젝트 구조를 복원하려면 create-hua를 다시 실행하세요',
      });
    }
  }

  // Check app/layout.tsx exists
  const layoutPath = path.join(projectPath, 'app/layout.tsx');
  if (!(await fs.pathExists(layoutPath))) {
    issues.push({
      type: 'error',
      message: isEn ? 'app/layout.tsx not found' : 'app/layout.tsx를 찾을 수 없습니다',
      solution: isEn
        ? 'This is required by Next.js. Re-run create-hua to restore.'
        : 'Next.js에 필수 파일입니다. create-hua를 다시 실행하세요.',
    });
  } else {
    // Check HuaProvider usage in layout
    try {
      const layoutContent = await fs.readFile(layoutPath, 'utf-8');
      if (!layoutContent.includes('HuaProvider')) {
        issues.push({
          type: 'warning',
          message: isEn
            ? 'HuaProvider not found in app/layout.tsx'
            : 'app/layout.tsx에 HuaProvider가 없습니다',
          solution: isEn
            ? 'Wrap your app with <HuaProvider> from @hua-labs/hua'
            : '@hua-labs/hua에서 <HuaProvider>로 앱을 감싸세요',
        });
      }
    } catch {
      // Ignore read errors
    }
  }

  // Check app/page.tsx exists
  const pagePath = path.join(projectPath, 'app/page.tsx');
  if (!(await fs.pathExists(pagePath))) {
    issues.push({
      type: 'warning',
      message: isEn ? 'app/page.tsx not found' : 'app/page.tsx를 찾을 수 없습니다',
      solution: isEn
        ? 'Create app/page.tsx for your home page'
        : '홈 페이지를 위해 app/page.tsx를 생성하세요',
    });
  }

  // Check globals.css for hua theme import
  const globalsCssPath = path.join(projectPath, 'app/globals.css');
  if (await fs.pathExists(globalsCssPath)) {
    try {
      const cssContent = await fs.readFile(globalsCssPath, 'utf-8');
      if (!cssContent.includes('recommended-theme') && !cssContent.includes('@hua-labs/hua')) {
        issues.push({
          type: 'warning',
          message: isEn
            ? 'globals.css does not import hua theme'
            : 'globals.css에 hua 테마 import가 없습니다',
          solution: isEn
            ? 'Add @import "@hua-labs/hua/recommended-theme.css" to globals.css'
            : 'globals.css에 @import "@hua-labs/hua/recommended-theme.css"를 추가하세요',
        });
      }
    } catch {
      // Ignore read errors
    }
  }

  // Check translation files
  try {
    await validateTranslationFiles(projectPath);
  } catch (error) {
    issues.push({
      type: 'error',
      message: isEn
        ? `Translation files validation failed: ${error instanceof Error ? error.message : String(error)}`
        : `번역 파일 검증 실패: ${error instanceof Error ? error.message : String(error)}`,
      solution: isEn
        ? 'Check translations/ko/common.json and translations/en/common.json for JSON syntax errors'
        : 'translations/ko/common.json과 translations/en/common.json의 JSON 문법 오류를 확인하세요',
    });
  }

  // Check Node.js and pnpm
  try {
    const nodeVersion = process.version;
    if (compareVersions(nodeVersion, MIN_NODE_VERSION) < 0) {
      issues.push({
        type: 'warning',
        message: isEn
          ? `Node.js ${MIN_NODE_VERSION}+ recommended. Current: ${nodeVersion}`
          : `Node.js ${MIN_NODE_VERSION}+ 권장. 현재: ${nodeVersion}`,
        solution: isEn
          ? 'Update Node.js: https://nodejs.org/'
          : 'Node.js 업데이트: https://nodejs.org/',
      });
    }
  } catch {
    // Ignore
  }

  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch {
    issues.push({
      type: 'warning',
      message: isEn ? 'pnpm not found' : 'pnpm을 찾을 수 없습니다',
      solution: isEn
        ? 'Install pnpm: npm install -g pnpm'
        : 'pnpm 설치: npm install -g pnpm',
    });
  }

  // Report AI context file status
  const aiFileStatus: string[] = [];
  for (const entry of AI_CONTEXT_FILES) {
    for (const p of entry.paths) {
      const fullPath = path.join(projectPath, p);
      if (await fs.pathExists(fullPath)) {
        aiFileStatus.push(entry.label);
      }
    }
  }
  if (aiFileStatus.length > 0) {
    issues.push({
      type: 'info',
      message: isEn
        ? `AI context files present: ${aiFileStatus.join(', ')}`
        : `AI 컨텍스트 파일 감지: ${aiFileStatus.join(', ')}`,
    });
  } else {
    issues.push({
      type: 'info',
      message: isEn
        ? 'No AI context files found. Run create-hua to generate them.'
        : 'AI 컨텍스트 파일이 없습니다. create-hua를 실행하여 생성하세요.',
    });
  }

  return {
    healthy: issues.filter(i => i.type === 'error').length === 0,
    issues,
  };
}

/**
 * Run doctor command
 */
export async function runDoctor(projectPath: string): Promise<void> {
  const isEn = isEnglishOnly();

  console.log(chalk.blue(`\nDiagnosing project: ${projectPath}\n`));

  try {
    // Check prerequisites
    console.log(chalk.blue('Checking prerequisites...'));
    try {
      await checkPrerequisites();
      console.log(chalk.green('  Prerequisites OK'));
    } catch (error) {
      console.log(chalk.yellow('  Prerequisites check failed (non-critical)'));
    }

    // Diagnose project
    console.log(chalk.blue('\nDiagnosing project structure...'));
    const diagnosis = await diagnoseProject(projectPath);

    if (diagnosis.healthy && diagnosis.issues.filter(i => i.type !== 'info').length === 0) {
      console.log(chalk.green('\nProject is healthy! No issues found.'));
    }

    // Display issues
    const errors = diagnosis.issues.filter(i => i.type === 'error');
    const warnings = diagnosis.issues.filter(i => i.type === 'warning');
    const infos = diagnosis.issues.filter(i => i.type === 'info');

    if (errors.length > 0) {
      console.log(chalk.red(`\nFound ${errors.length} error(s):`));
      errors.forEach((issue, index) => {
        console.log(chalk.red(`  ${index + 1}. ${issue.message}`));
        if (issue.solution) {
          console.log(chalk.yellow(`     -> ${issue.solution}`));
        }
      });
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`\nFound ${warnings.length} warning(s):`));
      warnings.forEach((issue, index) => {
        console.log(chalk.yellow(`  ${index + 1}. ${issue.message}`));
        if (issue.solution) {
          console.log(chalk.cyan(`     -> ${issue.solution}`));
        }
      });
    }

    if (infos.length > 0) {
      console.log(chalk.blue(`\nInfo:`));
      infos.forEach((issue) => {
        console.log(chalk.gray(`  - ${issue.message}`));
      });
    }

    if (!diagnosis.healthy) {
      console.log(chalk.red('\nProject has critical issues that need to be fixed.'));
      process.exit(1);
    } else if (warnings.length > 0) {
      console.log(chalk.yellow('\nProject has warnings but should work.'));
    }
  } catch (error) {
    console.error(chalk.red('\nDoctor command failed:'));
    console.error(error);
    process.exit(1);
  }
}
