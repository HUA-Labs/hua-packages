/**
 * create-hua-ux - Doctor Command
 * 
 * Diagnoses project health and provides solutions
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { checkPrerequisites, validateTemplate, validateGeneratedProject, validateTranslationFiles } from './utils';

/**
 * Check if English-only mode is enabled
 */
function isEnglishOnly(): boolean {
  return process.env.LANG === 'en' || process.env.CLI_LANG === 'en' || process.argv.includes('--english-only');
}

/**
 * Diagnose project health
 */
export async function diagnoseProject(projectPath: string): Promise<{
  healthy: boolean;
  issues: Array<{ type: 'error' | 'warning'; message: string; solution?: string }>;
}> {
  const isEn = isEnglishOnly();
  const issues: Array<{ type: 'error' | 'warning'; message: string; solution?: string }> = [];

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
        ? 'This might not be a valid hua-ux project. Run create-hua-ux to initialize.'
        : '유효한 hua-ux 프로젝트가 아닐 수 있습니다. create-hua-ux를 실행하여 초기화하세요.',
    });
  } else {
    try {
      const packageJson = await fs.readJSON(packageJsonPath);

      // Check for hua-ux dependency
      if (!packageJson.dependencies?.['@hua-labs/hua-ux']) {
        issues.push({
          type: 'error',
          message: isEn ? '@hua-labs/hua-ux not found in dependencies' : '의존성에 @hua-labs/hua-ux가 없습니다',
          solution: isEn
            ? 'Run: pnpm install @hua-labs/hua-ux'
            : '실행: pnpm install @hua-labs/hua-ux',
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

  // Check hua-ux.config.ts
  const configPath = path.join(projectPath, 'hua-ux.config.ts');
  if (!(await fs.pathExists(configPath))) {
    issues.push({
      type: 'error',
      message: isEn ? 'hua-ux.config.ts not found' : 'hua-ux.config.ts를 찾을 수 없습니다',
      solution: isEn
        ? 'This file is required for hua-ux framework. Re-run create-hua-ux.'
        : '이 파일은 hua-ux 프레임워크에 필요합니다. create-hua-ux를 다시 실행하세요.',
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
          ? 'Re-run create-hua-ux to restore project structure'
          : '프로젝트 구조를 복원하려면 create-hua-ux를 다시 실행하세요',
      });
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
    const requiredVersion = '22.0.0';
    const parseVersion = (v: string): number[] => {
      return v.replace(/^v/, '').split('.').map(Number);
    };
    const compareVersions = (v1: string, v2: string): number => {
      const v1Parts = parseVersion(v1);
      const v2Parts = parseVersion(v2);
      for (let i = 0; i < 3; i++) {
        if (v1Parts[i] > v2Parts[i]) return 1;
        if (v1Parts[i] < v2Parts[i]) return -1;
      }
      return 0;
    };

    if (compareVersions(nodeVersion, requiredVersion) < 0) {
      issues.push({
        type: 'warning',
        message: isEn
          ? `Node.js ${requiredVersion}+ recommended. Current: ${nodeVersion}`
          : `Node.js ${requiredVersion}+ 권장. 현재: ${nodeVersion}`,
        solution: isEn
          ? 'Update Node.js: https://nodejs.org/'
          : 'Node.js 업데이트: https://nodejs.org/',
      });
    }
  } catch (error) {
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

  console.log(chalk.blue(`\n🔍 Diagnosing project: ${projectPath}\n`));

  try {
    // Check prerequisites
    console.log(chalk.blue('📋 Checking prerequisites...'));
    try {
      await checkPrerequisites();
      console.log(chalk.green('✅ Prerequisites OK'));
    } catch (error) {
      console.log(chalk.yellow('⚠️  Prerequisites check failed (non-critical)'));
    }

    // Diagnose project
    console.log(chalk.blue('\n🔬 Diagnosing project structure...'));
    const diagnosis = await diagnoseProject(projectPath);

    if (diagnosis.healthy && diagnosis.issues.length === 0) {
      console.log(chalk.green('\n✅ Project is healthy! No issues found.'));
      return;
    }

    // Display issues
    const errors = diagnosis.issues.filter(i => i.type === 'error');
    const warnings = diagnosis.issues.filter(i => i.type === 'warning');

    if (errors.length > 0) {
      console.log(chalk.red(`\n❌ Found ${errors.length} error(s):`));
      errors.forEach((issue, index) => {
        console.log(chalk.red(`  ${index + 1}. ${issue.message}`));
        if (issue.solution) {
          console.log(chalk.yellow(`     💡 ${issue.solution}`));
        }
      });
    }

    if (warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Found ${warnings.length} warning(s):`));
      warnings.forEach((issue, index) => {
        console.log(chalk.yellow(`  ${index + 1}. ${issue.message}`));
        if (issue.solution) {
          console.log(chalk.cyan(`     💡 ${issue.solution}`));
        }
      });
    }

    if (!diagnosis.healthy) {
      console.log(chalk.red('\n❌ Project has critical issues that need to be fixed.'));
      process.exit(1);
    } else {
      console.log(chalk.yellow('\n⚠️  Project has warnings but should work.'));
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Doctor command failed:'));
    console.error(error);
    process.exit(1);
  }
}
