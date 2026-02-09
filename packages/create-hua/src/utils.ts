/**
 * create-hua - Utilities
 *
 * Utility functions for project creation
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { execSync } from 'child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { HUA_VERSION } from './version';

/**
 * Detect which package manager was used to run the CLI
 */
function detectPackageManager(): 'npm' | 'pnpm' | 'yarn' {
  const userAgent = process.env.npm_config_user_agent || '';

  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('yarn')) return 'yarn';
  return 'npm';
}
import {
  NEXTJS_VERSION,
  REACT_VERSION,
  REACT_DOM_VERSION,
  ZUSTAND_VERSION,
  TYPESCRIPT_VERSION,
  TYPES_NODE_VERSION,
  TYPES_REACT_VERSION,
  TYPES_REACT_DOM_VERSION,
  TAILWIND_POSTCSS_VERSION,
  AUTOPREFIXER_VERSION,
  POSTCSS_VERSION,
  TAILWIND_VERSION,
  PHOSPHOR_ICONS_VERSION,
} from './constants/versions';

// Resolve template directory
// When compiled, __dirname points to dist/, so we need to go up to templates/
// When running with tsx, __dirname points to src/, so we need to go up one level
const TEMPLATE_DIR = path.join(__dirname, '../templates/nextjs');

/**
 * AI context generation options
 */
export interface AiContextOptions {
  /**
   * Generate .cursorrules file
   */
  cursorrules: boolean;

  /**
   * Generate ai-context.md file
   */
  aiContext: boolean;

  /**
   * Generate .claude/project-context.md file
   */
  claudeContext: boolean;

  /**
   * Generate .claude/skills/ files
   */
  claudeSkills: boolean;

  /**
   * Language for documentation (ko, en, both)
   */
  language: 'ko' | 'en' | 'both';
}

interface MonorepoContext {
  isMonorepo: boolean;
  rootDir?: string;
  projectLocation?: 'root' | 'apps' | 'packages' | 'other';
}

/**
 * Check if English-only mode is enabled
 */
function isEnglishOnly(): boolean {
  return process.env.LANG === 'en' || process.env.CLI_LANG === 'en' || process.argv.includes('--english-only');
}

/**
 * Get localized message
 */
function t(key: 'projectNamePrompt' | 'projectNameRequired' | 'selectAiContext' | 'documentationLanguage'): string {
  if (isEnglishOnly()) {
    const messages: Record<string, string> = {
      projectNamePrompt: 'What is your project name?',
      projectNameRequired: 'Project name is required',
      selectAiContext: 'Select AI context files to generate:',
      documentationLanguage: 'Documentation language:',
    };
    return messages[key] || key;
  }

  // Bilingual (Korean + English)
  const messages: Record<string, string> = {
    projectNamePrompt: 'What is your project name? / 프로젝트 이름을 입력하세요:',
    projectNameRequired: 'Project name is required / 프로젝트 이름이 필요합니다',
    selectAiContext: 'Select AI context files to generate / 생성할 AI 컨텍스트 파일을 선택하세요:',
    documentationLanguage: 'Documentation language / 문서 언어:',
  };
  return messages[key] || key;
}

/**
 * Prompt for project name
 */
export async function promptProjectName(): Promise<string> {
  // If not interactive, cannot prompt
  if (!isInteractive()) {
    throw new Error('Project name is required when running in non-interactive mode. Please provide it as an argument: npx tsx src/index.ts <project-name>');
  }

  const { projectName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: t('projectNamePrompt'),
      validate: (input: string) => {
        if (!input.trim()) {
          return t('projectNameRequired');
        }
        return true;
      },
    },
  ]);

  return projectName;
}

/**
 * Check if running in interactive mode
 * 
 * For PowerShell and other environments, we check:
 * 1. stdin/stdout are TTY (if available)
 * 2. Not in CI environment
 * 3. Not explicitly set to non-interactive
 * 4. stdin is readable (not piped)
 * 
 * In PowerShell, isTTY might be undefined, so we use a more lenient check.
 */
function isInteractive(): boolean {
  // Explicitly non-interactive via environment variable
  if (process.env.CI || process.env.NON_INTERACTIVE) {
    return false;
  }

  // Explicitly non-interactive via CLI flag
  if (process.argv.includes('--non-interactive')) {
    return false;
  }

  // Check if stdin is TTY (available in most terminals)
  // In PowerShell, this might be undefined, so we check if it's explicitly false
  // If undefined, we assume it might be interactive (PowerShell can be interactive)
  const stdinTTY = process.stdin.isTTY;
  const stdoutTTY = process.stdout.isTTY;

  // If both are explicitly false, definitely not interactive
  if (stdinTTY === false && stdoutTTY === false) {
    return false;
  }

  // If either is true, or both are undefined (PowerShell case), assume interactive
  // This allows inquirer to attempt to use prompts
  // Inquirer will handle the actual TTY check internally
  return stdinTTY !== false && stdoutTTY !== false;
}

/**
 * Check if directory is empty
 */
export async function isEmptyDir(dirPath: string): Promise<boolean> {
  if (!(await fs.pathExists(dirPath))) {
    return true;
  }
  const files = await fs.readdir(dirPath);
  return files.length === 0;
}

/**
 * Prompt for AI context generation options
 */
export async function promptAiContextOptions(): Promise<AiContextOptions> {
  // If not interactive, use defaults
  if (!isInteractive()) {
    console.log('Running in non-interactive mode, using default options...');
    return {
      cursorrules: true,
      aiContext: true,
      claudeContext: true,
      claudeSkills: false,
      language: 'both',
    };
  }

  // Use inquirer with proper error handling
  try {
    const isEn = isEnglishOnly();
    const answers = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'options',
        message: t('selectAiContext'),
        choices: [
          {
            name: isEn ? '.cursorrules (Cursor IDE rules)' : '.cursorrules (Cursor IDE rules) / Cursor IDE 규칙',
            value: 'cursorrules',
            checked: true,
          },
          {
            name: isEn ? 'ai-context.md (General AI context)' : 'ai-context.md (General AI context) / 범용 AI 컨텍스트',
            value: 'aiContext',
            checked: true,
          },
          {
            name: isEn ? '.claude/project-context.md (Claude context)' : '.claude/project-context.md (Claude context) / Claude 컨텍스트',
            value: 'claudeContext',
            checked: true,
          },
          {
            name: isEn ? '.claude/skills/ (Claude skills)' : '.claude/skills/ (Claude skills) / Claude 스킬',
            value: 'claudeSkills',
            checked: false,
          },
        ],
      },
      {
        type: 'list',
        name: 'language',
        message: t('documentationLanguage'),
        choices: [
          { name: isEn ? 'Korean only' : 'Korean only / 한국어만', value: 'ko' },
          { name: isEn ? 'English only' : 'English only / 영어만', value: 'en' },
          { name: isEn ? 'Both Korean and English' : 'Both Korean and English / 한국어와 영어 모두', value: 'both' },
        ],
        default: 'both',
      },
    ]);

    return {
      cursorrules: answers.options.includes('cursorrules'),
      aiContext: answers.options.includes('aiContext'),
      claudeContext: answers.options.includes('claudeContext'),
      claudeSkills: answers.options.includes('claudeSkills'),
      language: answers.language || 'both',
    };
  } catch (error) {
    // If inquirer fails (e.g., in non-interactive environment), use defaults
    console.warn('Failed to get interactive input, using default options...');
    return {
      cursorrules: true,
      aiContext: true,
      claudeContext: true,
      claudeSkills: false,
      language: 'both',
    };
  }
}

/**
 * Copy template files to project directory
 * 
 * @param projectPath - Target project directory
 * @param options - Copy options
 * @param options.skipAiContext - Skip AI context files (.cursorrules, ai-context.md, .claude/)
 */
export async function copyTemplate(
  projectPath: string,
  options?: { skipAiContext?: boolean }
): Promise<void> {
  await fs.copy(TEMPLATE_DIR, projectPath, {
    filter: (src: string) => {
      // Use relative path to avoid issues with template being inside node_modules
      const relativePath = path.relative(TEMPLATE_DIR, src);

      // Skip node_modules and .git within the template
      if (relativePath.includes('node_modules') || relativePath.includes('.git')) {
        return false;
      }

      // Conditionally skip AI context files
      if (options?.skipAiContext) {
        if (relativePath === '.cursorrules' ||
          relativePath === 'ai-context.md' ||
          relativePath.startsWith('.claude')) {
          return false;
        }
      }

      return true;
    },
  });
}

/**
 * Get hua package version
 *
 * 모노레포 내부에서는 workspace 버전을, 외부에서는 npm 버전을 사용
 *
 * 감지 우선순위:
 * 1. 환경 변수 (HUA_WORKSPACE_VERSION)
 * 2. pnpm-workspace.yaml 파일 존재 여부 (더 견고한 방법)
 * 3. 폴더 이름 기반 감지 (하위 호환성)
 * 4. hua 패키지의 package.json에서 버전 읽기 (자동화)
 * 5. npm 버전 (기본값)
 */
function getHuaVersion(): string {
  // 1. 환경 변수 우선 확인
  if (process.env.HUA_WORKSPACE_VERSION === 'workspace') {
    return 'workspace:*';
  }

  // 2. pnpm-workspace.yaml 파일 존재 여부로 모노레포 감지 (더 견고한 방법)
  try {
    const fs = require('fs');
    const path = require('path');
    let currentDir = process.cwd();
    const maxDepth = 10; // 최대 10단계 상위 디렉토리까지 확인

    for (let i = 0; i < maxDepth; i++) {
      const workspaceFile = path.join(currentDir, 'pnpm-workspace.yaml');
      if (fs.existsSync(workspaceFile)) {
        return 'workspace:*';
      }
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // 루트 도달
      currentDir = parentDir;
    }
  } catch (error) {
    // fs 모듈을 사용할 수 없는 경우 (Edge Runtime 등) 무시
  }

  // 3. 하위 호환성: 폴더 이름 기반 감지 (기존 방식)
  const cwd = process.cwd();
  if (cwd.includes('hua-platform') && !cwd.includes('node_modules')) {
    return 'workspace:*';
  }

  // 4. hua 패키지의 package.json에서 버전 읽기 (자동화)
  // create-hua 패키지에서 hua 패키지의 package.json을 읽어서 버전 추출
  try {
    const fs = require('fs');
    const path = require('path');

    // create-hua의 위치에서 hua 패키지 찾기
    // __dirname은 dist/utils.js 또는 src/utils.ts의 위치
    // dist/utils.js인 경우: packages/create-hua/dist/utils.js
    // src/utils.ts인 경우: packages/create-hua/src/utils.ts
    const currentFile = __dirname;
    const createHuaRoot = path.resolve(currentFile, '../..');
    const huaPackageJson = path.join(createHuaRoot, '../hua/package.json');

    if (fs.existsSync(huaPackageJson)) {
      const huaPackage = JSON.parse(fs.readFileSync(huaPackageJson, 'utf-8'));
      const version = huaPackage.version;
      if (version) {
        // 버전 앞에 ^ 추가 (예: 0.1.0 -> ^0.1.0)
        return `^${version}`;
      }
    }
  } catch (error) {
    // 파일을 읽을 수 없는 경우 무시하고 다음 단계로
  }

  // 5. 빌드 시점에 생성된 버전 상수 사용 (npm 배포 후)
  // 빌드 스크립트에서 hua 패키지의 버전을 읽어서 생성한 상수
  return HUA_VERSION;
}

/**
 * Detect monorepo context by looking for workspace markers in parent directories
 */
async function detectMonorepoContext(projectPath: string): Promise<MonorepoContext> {
  const visited = new Set<string>();
  let currentDir = path.dirname(projectPath);

  const buildResult = (rootDir: string): MonorepoContext => {
    const relativePath = path.relative(rootDir, projectPath);
    const segments = relativePath.split(path.sep).filter(Boolean);
    let projectLocation: MonorepoContext['projectLocation'] = 'other';

    if (segments.length === 0) {
      projectLocation = 'root';
    } else if (segments[0] === 'apps') {
      projectLocation = 'apps';
    } else if (segments[0] === 'packages') {
      projectLocation = 'packages';
    }

    return {
      isMonorepo: true,
      rootDir,
      projectLocation,
    };
  };

  for (let depth = 0; depth < 10; depth++) {
    if (!currentDir || visited.has(currentDir)) {
      break;
    }
    visited.add(currentDir);

    const workspaceFile = path.join(currentDir, 'pnpm-workspace.yaml');
    if (await fs.pathExists(workspaceFile)) {
      return buildResult(currentDir);
    }

    const packageJsonPath = path.join(currentDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJSON(packageJsonPath);
        if (packageJson.workspaces) {
          return buildResult(currentDir);
        }
      } catch {
        // Ignore JSON parse errors and move up
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  // Fallback: check immediate parent for monorepo structure hints
  const parentDir = path.dirname(projectPath);
  const hasPackagesDir = await fs.pathExists(path.join(parentDir, 'packages'));
  const hasAppsDir = await fs.pathExists(path.join(parentDir, 'apps'));
  if (hasPackagesDir || hasAppsDir) {
    return buildResult(parentDir);
  }

  return { isMonorepo: false };
}

function toPosixRelative(from: string, target: string): string {
  let relativePath = path.relative(from, target).replace(/\\/g, '/');
  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`;
  }
  return relativePath;
}

/**
 * Generate package.json
 */
export async function generatePackageJson(
  projectPath: string,
  projectName: string
): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');

  // 기존 package.json이 있다면 삭제 (템플릿에서 복사된 파일이 있을 수 있음)
  if (await fs.pathExists(packageJsonPath)) {
    await fs.remove(packageJsonPath);
  }

  // @hua-labs/hua가 i18n-core, i18n-core-zustand, motion-core, state를
  // 전부 transitive dependency로 제공하므로 직접 추가하지 않음.
  // 직접 추가하면 npm이 별도 복사본을 설치하여 React Context 중복 문제 발생.
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev --webpack',
      build: 'next build',
      start: 'next start',
      lint: "next lint",
      'lint:fix': 'next lint --fix',
    },
    dependencies: {
      '@hua-labs/hua': getHuaVersion(),
      '@phosphor-icons/react': PHOSPHOR_ICONS_VERSION,
      next: NEXTJS_VERSION,
      react: REACT_VERSION,
      'react-dom': REACT_DOM_VERSION,
      zustand: ZUSTAND_VERSION,
    },
    devDependencies: {
      '@types/node': TYPES_NODE_VERSION,
      '@types/react': TYPES_REACT_VERSION,
      '@types/react-dom': TYPES_REACT_DOM_VERSION,
      '@tailwindcss/postcss': TAILWIND_POSTCSS_VERSION,
      autoprefixer: AUTOPREFIXER_VERSION,
      postcss: POSTCSS_VERSION,
      tailwindcss: TAILWIND_VERSION,
      typescript: TYPESCRIPT_VERSION,
    },
  };

  await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
}

/**
 * Generate Tailwind config based on monorepo context
 */
async function generateTailwindConfig(projectPath: string): Promise<void> {
  const tailwindConfigPath = path.join(projectPath, 'tailwind.config.js');
  const context = await detectMonorepoContext(projectPath);

  const contentEntries = new Set<string>([
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ]);

  if (context.isMonorepo && context.rootDir) {
    const packageMappings = [
      { dir: 'hua-ui', glob: 'src/**/*.{ts,tsx}' },
      { dir: 'hua', glob: 'src/**/*.{ts,tsx}' },
      { dir: 'hua-motion-core', glob: 'src/**/*.{ts,tsx}' },
    ];

    for (const pkg of packageMappings) {
      const packageDir = path.join(context.rootDir, 'packages', pkg.dir);
      if (!(await fs.pathExists(packageDir))) {
        continue;
      }
      const absoluteGlob = path.join(packageDir, pkg.glob);
      contentEntries.add(toPosixRelative(projectPath, absoluteGlob));
    }
  } else {
    [
      './node_modules/@hua-labs/ui/**/*.{ts,tsx}',
      './node_modules/@hua-labs/hua/**/*.{ts,tsx}',
      './node_modules/@hua-labs/motion-core/**/*.{ts,tsx}',
    ].forEach(entry => contentEntries.add(entry));
  }

  const safelistEntries = [
    '{ pattern: /^(bg|text|border)-(?:primary|secondary|accent|neutral|success|warning|danger)(?:-(?:50|100|200|300|400|500|600|700|800|900))?$/ }',
    '{ pattern: /^(px|py)-(?:0|1|2|3|4|5|6|8|10)$/ }',
    '{ pattern: /^text-(?:xs|sm|base|lg|xl|2xl)$/ }',
    '{ pattern: /^rounded-(?:none|sm|md|lg|xl|2xl|3xl|full)$/ }',
    '{ pattern: /^shadow-(?:sm|md|lg|xl|2xl)$/ }',
    '{ pattern: /^transition(?:-(?:all|colors|opacity|transform))?$/ }',
    '{ pattern: /^duration-(?:75|100|150|200|300)$/ }',
    '{ pattern: /^ease-(?:linear|in|out|in-out)$/ }',
    "'modal-open'",
    "'modal-close'",
    "'modal-backdrop'",
    "'drawer-open'",
    "'drawer-side'",
    "'drawer-content'",
    "'card-glow'",
    "'card-gradient'",
  ];

  const contentArray = Array.from(contentEntries).sort().map(entry => `    '${entry}'`).join(',\n');
  const safelistArray = safelistEntries.map(entry => `  ${entry}`).join(',\n');

  const configContent = `/**
 * This file is generated by create-hua.
 * It ensures Tailwind scans hua-ui/hua sources in both monorepo and standalone installs.
 */
const componentSafelist = [
${safelistArray}
];

module.exports = {
  content: [
${contentArray}
  ],
  safelist: componentSafelist,
  theme: {
    extend: {},
  },
  plugins: [],
};
`;

  await fs.writeFile(tailwindConfigPath, configContent, 'utf-8');
}

/**
 * Generate hua.config.ts
 */
export async function generateConfig(projectPath: string): Promise<void> {
  const configContent = `import { defineConfig } from '@hua-labs/hua/framework/config';

/**
 * hua 프레임워크 설정
 * 
 * Preset을 선택하면 대부분의 설정이 자동으로 적용됩니다.
 * - 'product': 제품 페이지용 (전문적, 효율적)
 * - 'marketing': 마케팅 페이지용 (화려함, 눈에 띄는)
 * 
 * **바이브 모드 (간단)**: \`preset: 'product'\`
 * **개발자 모드 (세부 설정)**: \`preset: { type: 'product', motion: {...} }\`
 */
export default defineConfig({
  /**
   * 프리셋 선택
   * 
   * Preset을 선택하면 motion, spacing, i18n 등이 자동 설정됩니다.
   * 
   * 바이브 모드 (간단):
   *   preset: 'product'
   * 
   * 개발자 모드 (세부 설정):
   *   preset: {
   *     type: 'product',
   *     motion: { duration: 300 },
   *   }
   */
  preset: 'product',
  
  /**
   * 다국어 설정
   */
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  
  /**
   * 모션/애니메이션 설정
   * 
   * 바이브 코더용 (명사 중심):
   *   motion: { style: 'smooth' }  // 'smooth' | 'dramatic' | 'minimal'
   * 
   * 개발자용 (기술적):
   *   motion: {
   *     defaultPreset: 'product',
   *     enableAnimations: true,
   *     duration: 300,
   *   }
   */
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
    // style: 'smooth',  // 바이브 코더용: 'smooth' | 'dramatic' | 'minimal'
  },
  
  /**
   * 상태 관리 설정
   */
  state: {
    persist: true,
    ssr: true,
  },
  
  /**
   * 브랜딩 설정 (화이트 라벨링)
   * 
   * 색상, 타이포그래피 등을 설정하면 모든 컴포넌트에 자동 적용됩니다.
   * 
   * branding: {
   *   colors: {
   *     primary: '#3B82F6',
   *     secondary: '#8B5CF6',
   *   },
   * }
   */
  // branding: {
  //   colors: {
  //     primary: '#3B82F6',
  //   },
  // },
  
  /**
   * 라이선스 설정 (Pro/Enterprise 플러그인 사용 시)
   * 
   * license: {
   *   apiKey: process.env.HUA_LICENSE_KEY,
   * }
   */
  // license: {
  //   apiKey: process.env.HUA_LICENSE_KEY,
  // },
  
  /**
   * 플러그인 설정 (Pro/Enterprise 기능)
   * 
   * plugins: [
   *   motionProPlugin,
   *   i18nProPlugin,
   * ]
   */
  // plugins: [],
});
`;

  await fs.writeFile(
    path.join(projectPath, 'hua.config.ts'),
    configContent
  );

  try {
    await generateTailwindConfig(projectPath);
  } catch (error) {
    console.warn(
      chalk.yellow(
        `⚠️  Failed to generate Tailwind config: ${error instanceof Error ? error.message : String(error)}`
      )
    );
  }
}

/**
 * Generate AI context files
 * 
 * Cursor, Claude 등 다양한 AI 도구를 위한 컨텍스트 파일 생성
 * 템플릿 파일을 복사한 후 프로젝트별 정보를 동적으로 추가합니다.
 */
export async function generateAiContextFiles(
  projectPath: string,
  projectName?: string,
  options?: AiContextOptions
): Promise<void> {
  const opts = options || {
    cursorrules: true,
    aiContext: true,
    claudeContext: true,
    claudeSkills: false,
    language: 'both',
  };

  // 옵션에 따라 파일 삭제 (생성하지 않을 파일)
  if (!opts.cursorrules) {
    const cursorrulesPath = path.join(projectPath, '.cursorrules');
    if (await fs.pathExists(cursorrulesPath)) {
      await fs.remove(cursorrulesPath);
    }
  }

  if (!opts.aiContext) {
    const aiContextPath = path.join(projectPath, 'ai-context.md');
    if (await fs.pathExists(aiContextPath)) {
      await fs.remove(aiContextPath);
    }
  }

  if (!opts.claudeContext) {
    const claudeContextPath = path.join(projectPath, '.claude', 'project-context.md');
    if (await fs.pathExists(claudeContextPath)) {
      await fs.remove(claudeContextPath);
    }
  }

  if (!opts.claudeSkills) {
    const claudeSkillsPath = path.join(projectPath, '.claude', 'skills');
    if (await fs.pathExists(claudeSkillsPath)) {
      await fs.remove(claudeSkillsPath);
    }
  }

  // 프로젝트별 커스터마이징
  if (projectName) {
    // ai-context.md에 프로젝트 이름 추가
    if (opts.aiContext) {
      const aiContextPath = path.join(projectPath, 'ai-context.md');
      if (await fs.pathExists(aiContextPath)) {
        let content = await fs.readFile(aiContextPath, 'utf-8');
        // Add project name to document header
        content = content.replace(
          /^# hua Project AI Context/,
          `# ${projectName} - hua Project AI Context\n\n**Project Name**: ${projectName}`
        );
        await fs.writeFile(aiContextPath, content, 'utf-8');
      }
    }

    // .claude/project-context.md에도 프로젝트 이름 추가
    if (opts.claudeContext) {
      const claudeContextPath = path.join(projectPath, '.claude', 'project-context.md');
      if (await fs.pathExists(claudeContextPath)) {
        let content = await fs.readFile(claudeContextPath, 'utf-8');
        content = content.replace(
          /^# hua Project Context/,
          `# ${projectName} - hua Project Context\n\n**Project Name**: ${projectName}`
        );
        await fs.writeFile(claudeContextPath, content, 'utf-8');
      }
    }
  }

  // package.json에서 실제 설치된 패키지 버전 정보 추출하여 컨텍스트에 추가
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    try {
      const packageJson = await fs.readJSON(packageJsonPath);
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};

      // 버전 정보를 ai-context.md에 추가
      if (opts.aiContext) {
        const aiContextPath = path.join(projectPath, 'ai-context.md');
        if (await fs.pathExists(aiContextPath)) {
          let content = await fs.readFile(aiContextPath, 'utf-8');

          // 의존성 정보 섹션 추가
          const depsSection = `
## 설치된 패키지 버전 / Installed Package Versions

### 핵심 의존성 / Core Dependencies
${Object.entries(dependencies)
              .filter(([name]) => name.startsWith('@hua-labs/') || name === 'next' || name === 'react')
              .map(([name, version]) => `- \`${name}\`: ${version}`)
              .join('\n')}

### 개발 의존성 / Dev Dependencies
${Object.entries(devDependencies)
              .filter(([name]) => name.includes('typescript') || name.includes('tailwind') || name.includes('@types'))
              .map(([name, version]) => `- \`${name}\`: ${version}`)
              .join('\n')}
`;

          // 참고 자료 섹션 앞에 추가
          content = content.replace(
            /## 참고 자료/,
            `${depsSection}\n## 참고 자료`
          );

          await fs.writeFile(aiContextPath, content, 'utf-8');
        }
      }
    } catch (error) {
      // package.json 파싱 실패 시 무시 (선택적 기능)
      console.warn('Failed to extract package versions for AI context:', error);
    }
  }
}

/**
 * Check prerequisites before project creation
 * 
 * Verifies Node.js version, pnpm installation, and template integrity
 */
export async function checkPrerequisites(): Promise<void> {
  const isEn = isEnglishOnly();
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Node.js version check
  const nodeVersion = process.version;
  const requiredVersion = '22.0.0';

  // Simple version comparison (major.minor.patch)
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
    errors.push(
      isEn
        ? `Node.js ${requiredVersion}+ required. Current: ${nodeVersion}`
        : `Node.js ${requiredVersion}+ 필요합니다. 현재: ${nodeVersion}`
    );
  }

  // 2. pnpm installation check
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
  } catch {
    errors.push(
      isEn
        ? 'pnpm is required. Install: npm install -g pnpm'
        : 'pnpm이 필요합니다. 설치: npm install -g pnpm'
    );
  }

  // 3. Template validation
  try {
    await validateTemplate();
  } catch (error) {
    errors.push(
      isEn
        ? `Template validation failed: ${error instanceof Error ? error.message : String(error)}`
        : `템플릿 검증 실패: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Display warnings
  if (warnings.length > 0) {
    console.log(chalk.yellow('\n⚠️  Warnings:'));
    warnings.forEach(w => console.log(chalk.yellow(`  - ${w}`)));
  }

  // Throw error if prerequisites not met
  if (errors.length > 0) {
    const errorMessage = isEn
      ? `Prerequisites check failed:\n${errors.map(e => `  ❌ ${e}`).join('\n')}\n\n💡 Tips:\n  - Update Node.js: https://nodejs.org/\n  - Install pnpm: npm install -g pnpm`
      : `사전 검증 실패:\n${errors.map(e => `  ❌ ${e}`).join('\n')}\n\n💡 팁:\n  - Node.js 업데이트: https://nodejs.org/\n  - pnpm 설치: npm install -g pnpm`;

    throw new Error(errorMessage);
  }
}

/**
 * Validate template files integrity
 * 
 * Checks if all required template files exist before project creation
 */
export async function validateTemplate(): Promise<void> {
  // Check if template directory exists
  if (!(await fs.pathExists(TEMPLATE_DIR))) {
    const isEn = isEnglishOnly();
    throw new Error(
      isEn
        ? `Template directory not found: ${TEMPLATE_DIR}`
        : `템플릿 디렉토리를 찾을 수 없습니다: ${TEMPLATE_DIR}`
    );
  }

  // Note: package.json is generated dynamically, not in template
  const requiredFiles = [
    'tsconfig.json',
    'next.config.ts',
    'tailwind.config.js',
    'app/layout.tsx',
    'app/page.tsx',
    'app/globals.css',
    'lib/i18n-setup.ts',
    'lib/utils.ts',
    'store/useAppStore.ts',
    'translations/ko/common.json',
    'translations/en/common.json',
    'ai-context.md',
    '.cursorrules',
  ];

  const missingFiles: string[] = [];

  for (const file of requiredFiles) {
    const filePath = path.join(TEMPLATE_DIR, file);
    if (!(await fs.pathExists(filePath))) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    const isEn = isEnglishOnly();
    throw new Error(
      isEn
        ? `Template files missing: ${missingFiles.join(', ')}`
        : `템플릿 파일 누락: ${missingFiles.join(', ')}`
    );
  }
}

/**
 * Validate generated project
 * 
 * 프로젝트 생성 후 필수 파일과 설정이 올바르게 생성되었는지 검증
 */
export async function validateGeneratedProject(projectPath: string): Promise<void> {
  const errors: string[] = [];

  // 1. package.json 검증
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (!(await fs.pathExists(packageJsonPath))) {
    const isEn = isEnglishOnly();
    errors.push(isEn ? 'package.json file was not created' : 'package.json 파일이 생성되지 않았습니다.');
  } else {
    try {
      const packageJson = await fs.readJSON(packageJsonPath);

      // lint 스크립트 검증
      if (packageJson.scripts?.lint !== 'next lint') {
        errors.push(`package.json의 lint 스크립트가 올바르지 않습니다. 예상: "next lint", 실제: "${packageJson.scripts?.lint}"`);
      }

      // 필수 의존성 검증
      const requiredDeps = ['@hua-labs/hua', 'next', 'react', 'react-dom'];
      for (const dep of requiredDeps) {
        if (!packageJson.dependencies?.[dep]) {
          errors.push(`필수 의존성 ${dep}이 package.json에 없습니다.`);
        }
      }
    } catch (error) {
      errors.push(`package.json 파싱 실패: ${error}`);
    }
  }

  // 2. hua.config.ts 검증
  const configPath = path.join(projectPath, 'hua.config.ts');
  if (!(await fs.pathExists(configPath))) {
    const isEn = isEnglishOnly();
    errors.push(isEn ? 'hua.config.ts file was not created' : 'hua.config.ts 파일이 생성되지 않았습니다.');
  }

  // 3. 필수 디렉토리 검증
  const requiredDirs = ['app', 'lib', 'store', 'translations'];
  for (const dir of requiredDirs) {
    const dirPath = path.join(projectPath, dir);
    if (!(await fs.pathExists(dirPath))) {
      const isEn = isEnglishOnly();
      errors.push(isEn ? `Required directory ${dir} was not created` : `필수 디렉토리 ${dir}가 생성되지 않았습니다.`);
    }
  }

  // 4. 필수 파일 검증
  const requiredFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'tsconfig.json',
    'next.config.ts',
  ];
  for (const file of requiredFiles) {
    const filePath = path.join(projectPath, file);
    if (!(await fs.pathExists(filePath))) {
      const isEn = isEnglishOnly();
      errors.push(isEn ? `Required file ${file} was not created` : `필수 파일 ${file}이 생성되지 않았습니다.`);
    }
  }

  // 에러가 있으면 예외 발생
  if (errors.length > 0) {
    const isEn = isEnglishOnly();
    throw new Error(isEn
      ? `Project validation failed:\n${errors.map(e => `  ❌ ${e}`).join('\n')}\n\n💡 Tips:\n  - Check file permissions\n  - Ensure disk space is available\n  - Try running again`
      : `프로젝트 검증 실패:\n${errors.map(e => `  ❌ ${e}`).join('\n')}\n\n💡 팁:\n  - 파일 권한 확인\n  - 디스크 공간 확인\n  - 다시 실행해보세요`);
  }
}

/**
 * Validate translation files JSON syntax
 */
export async function validateTranslationFiles(projectPath: string): Promise<void> {
  const translationFiles = [
    'translations/ko/common.json',
    'translations/en/common.json',
  ];

  const errors: string[] = [];
  const isEn = isEnglishOnly();

  for (const file of translationFiles) {
    const filePath = path.join(projectPath, file);
    if (await fs.pathExists(filePath)) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        JSON.parse(content);
      } catch (error) {
        if (error instanceof SyntaxError) {
          errors.push(
            isEn
              ? `Invalid JSON in ${file}: ${error.message}`
              : `${file}의 JSON 문법 오류: ${error.message}`
          );
        } else {
          errors.push(
            isEn
              ? `Failed to read ${file}: ${error instanceof Error ? error.message : String(error)}`
              : `${file} 읽기 실패: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      isEn
        ? `Translation files validation failed:\n${errors.map(e => `  ❌ ${e}`).join('\n')}`
        : `번역 파일 검증 실패:\n${errors.map(e => `  ❌ ${e}`).join('\n')}`
    );
  }
}

/**
 * Generate installation summary
 */
export async function generateSummary(
  projectPath: string,
  aiContextOptions?: AiContextOptions
): Promise<{
  directories: number;
  files: number;
  aiContextFiles: string[];
  languages: string[];
}> {
  let directories = 0;
  let files = 0;

  const countItems = async (dirPath: string): Promise<void> => {
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      for (const item of items) {
        // Skip hidden files and common ignore patterns
        if (item.name.startsWith('.') && item.name !== '.cursorrules' && !item.name.startsWith('.claude')) {
          continue;
        }
        if (item.name === 'node_modules' || item.name === '.git') {
          continue;
        }

        const itemPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          directories++;
          await countItems(itemPath);
        } else {
          files++;
        }
      }
    } catch (error) {
      // Ignore permission errors or other issues
    }
  };

  await countItems(projectPath);

  const aiContextFiles: string[] = [];
  if (aiContextOptions) {
    if (aiContextOptions.cursorrules) aiContextFiles.push('.cursorrules');
    if (aiContextOptions.aiContext) aiContextFiles.push('ai-context.md');
    if (aiContextOptions.claudeContext) aiContextFiles.push('.claude/project-context.md');
    if (aiContextOptions.claudeSkills) aiContextFiles.push('.claude/skills/');
  }

  const languages: string[] = [];
  if (aiContextOptions?.language === 'ko' || aiContextOptions?.language === 'both') {
    languages.push('ko');
  }
  if (aiContextOptions?.language === 'en' || aiContextOptions?.language === 'both') {
    languages.push('en');
  }

  return {
    directories,
    files,
    aiContextFiles,
    languages,
  };
}

/**
 * Display installation summary
 */
export function displaySummary(summary: {
  directories: number;
  files: number;
  aiContextFiles: string[];
  languages: string[];
}): void {
  const isEn = isEnglishOnly();

  console.log(chalk.cyan('\n📊 Summary:'));
  console.log(chalk.white(`  📁 Directories: ${summary.directories}`));
  console.log(chalk.white(`  📄 Files: ${summary.files}`));

  if (summary.aiContextFiles.length > 0) {
    console.log(chalk.white(`  🤖 AI Context: ${summary.aiContextFiles.join(', ')}`));
  } else {
    console.log(chalk.gray(`  🤖 AI Context: None`));
  }

  if (summary.languages.length > 0) {
    console.log(chalk.white(`  🌐 Languages: ${summary.languages.join(', ')}`));
  }
}

/**
 * Display next steps with customized guidance
 */
export function displayNextSteps(
  projectPath: string,
  aiContextOptions?: AiContextOptions
): void {
  const isEn = isEnglishOnly();
  const relativePath = path.relative(process.cwd(), projectPath);
  const displayPath = relativePath || path.basename(projectPath);

  const packageManager = detectPackageManager();
  const devCommand = packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`;
  console.log(chalk.cyan(`\n📚 Next Steps:`));
  console.log(chalk.white(`  cd ${displayPath}`));
  console.log(chalk.white(`  ${packageManager} install`));
  console.log(chalk.white(`  ${devCommand}`));

  if (aiContextOptions?.claudeSkills) {
    console.log(chalk.cyan(`\n💡 Claude Skills enabled:`));
    console.log(chalk.white(
      isEn
        ? '  Check .claude/skills/ for framework usage guide'
        : '  .claude/skills/에서 프레임워크 사용 가이드를 확인하세요'
    ));
  }

  if (aiContextOptions?.language === 'both') {
    console.log(chalk.cyan(`\n🌐 Bilingual mode:`));
    console.log(chalk.white(
      isEn
        ? '  Edit translations/ko/ and translations/en/ for your content'
        : '  translations/ko/와 translations/en/에서 번역을 수정하세요'
    ));
  }
}
