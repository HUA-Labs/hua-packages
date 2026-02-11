/**
 * create-hua - Shared Utilities
 *
 * Common functions used across multiple modules.
 * Single source of truth for version checks, i18n, and validation.
 */

/**
 * Minimum required Node.js version
 */
export const MIN_NODE_VERSION = '22.0.0';

/**
 * AI context file definitions
 *
 * Maps option keys to their file/directory paths in the generated project.
 */
export const AI_CONTEXT_FILES: Array<{
  key: keyof AiContextOptionFlags;
  label: string;
  paths: string[];
}> = [
  { key: 'cursorRules', label: '.cursor/rules/', paths: ['.cursor'] },
  { key: 'aiContext', label: 'ai-context.md', paths: ['ai-context.md'] },
  { key: 'agentsMd', label: 'AGENTS.md', paths: ['AGENTS.md'] },
  { key: 'skillsMd', label: 'skills.md', paths: ['skills.md'] },
  { key: 'claudeContext', label: '.claude/project-context.md', paths: ['.claude/project-context.md'] },
  { key: 'claudeSkills', label: '.claude/skills/', paths: ['.claude/skills'] },
];

/**
 * Boolean flags from AiContextOptions (excludes `language`)
 */
export interface AiContextOptionFlags {
  cursorRules: boolean;
  aiContext: boolean;
  agentsMd: boolean;
  skillsMd: boolean;
  claudeContext: boolean;
  claudeSkills: boolean;
}

// ---------------------------------------------------------------------------
// Version helpers
// ---------------------------------------------------------------------------

/**
 * Parse a semver-ish version string into numeric parts.
 *
 * Strips leading `v` and any pre-release suffix so that
 * "v22.1.0-beta" → [22, 1, 0].
 */
export function parseVersion(v: string): number[] {
  return v
    .replace(/^v/, '')
    .split('.')
    .map((s) => parseInt(s, 10) || 0);
}

/**
 * Compare two version strings.
 *
 * @returns  1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1: string, v2: string): number {
  const v1Parts = parseVersion(v1);
  const v2Parts = parseVersion(v2);

  for (let i = 0; i < 3; i++) {
    if ((v1Parts[i] ?? 0) > (v2Parts[i] ?? 0)) return 1;
    if ((v1Parts[i] ?? 0) < (v2Parts[i] ?? 0)) return -1;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// i18n helpers
// ---------------------------------------------------------------------------

/**
 * Check if English-only mode is enabled
 */
export function isEnglishOnly(): boolean {
  return (
    process.env.LANG === 'en' ||
    process.env.CLI_LANG === 'en' ||
    process.argv.includes('--english-only')
  );
}

type MessageKey =
  | 'projectNamePrompt'
  | 'projectNameRequired'
  | 'selectAiContext'
  | 'documentationLanguage'
  | 'projectNameInvalidUppercase'
  | 'projectNameInvalidSpaces'
  | 'projectNameInvalidStartChar'
  | 'projectNameInvalidChars';

const MESSAGES_EN: Record<MessageKey, string> = {
  projectNamePrompt: 'What is your project name?',
  projectNameRequired: 'Project name is required',
  selectAiContext: 'Select AI context files to generate:',
  documentationLanguage: 'Documentation language:',
  projectNameInvalidUppercase: 'No uppercase letters allowed',
  projectNameInvalidSpaces: 'No spaces allowed',
  projectNameInvalidStartChar: 'Cannot start with . or _',
  projectNameInvalidChars: 'Only lowercase letters, numbers, hyphens, dots, and @ are allowed',
};

const MESSAGES_BI: Record<MessageKey, string> = {
  projectNamePrompt: 'What is your project name? / 프로젝트 이름을 입력하세요:',
  projectNameRequired: 'Project name is required / 프로젝트 이름이 필요합니다',
  selectAiContext: 'Select AI context files to generate / 생성할 AI 컨텍스트 파일을 선택하세요:',
  documentationLanguage: 'Documentation language / 문서 언어:',
  projectNameInvalidUppercase: 'No uppercase letters / 대문자는 사용할 수 없습니다',
  projectNameInvalidSpaces: 'No spaces allowed / 공백은 사용할 수 없습니다',
  projectNameInvalidStartChar: 'Cannot start with . or _ / .이나 _로 시작할 수 없습니다',
  projectNameInvalidChars: 'Only lowercase, numbers, hyphens allowed / 소문자, 숫자, 하이픈만 사용 가능합니다',
};

/**
 * Get localized message (bilingual by default, English-only when configured)
 */
export function t(key: MessageKey): string {
  if (isEnglishOnly()) {
    return MESSAGES_EN[key] ?? key;
  }
  return MESSAGES_BI[key] ?? key;
}

// ---------------------------------------------------------------------------
// Interactive detection
// ---------------------------------------------------------------------------

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
export function isInteractive(): boolean {
  if (process.env.CI || process.env.NON_INTERACTIVE) {
    return false;
  }
  if (process.argv.includes('--non-interactive')) {
    return false;
  }

  const stdinTTY = process.stdin.isTTY;
  const stdoutTTY = process.stdout.isTTY;

  if (stdinTTY === false && stdoutTTY === false) {
    return false;
  }

  return stdinTTY !== false && stdoutTTY !== false;
}

// ---------------------------------------------------------------------------
// Project name validation
// ---------------------------------------------------------------------------

/**
 * Validate a project name against npm package naming conventions.
 */
export function validateProjectName(name: string): { valid: boolean; message?: string } {
  if (!name || !name.trim()) {
    return { valid: false, message: t('projectNameRequired') };
  }
  if (/[A-Z]/.test(name)) {
    return { valid: false, message: t('projectNameInvalidUppercase') };
  }
  if (/\s/.test(name)) {
    return { valid: false, message: t('projectNameInvalidSpaces') };
  }
  if (/^[._]/.test(name)) {
    return { valid: false, message: t('projectNameInvalidStartChar') };
  }
  if (!/^[a-z0-9@][a-z0-9._-]*$/.test(name)) {
    return { valid: false, message: t('projectNameInvalidChars') };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// AI context file listing helper
// ---------------------------------------------------------------------------

/**
 * Build a list of AI context file labels that are enabled in the given options.
 */
export function listEnabledAiFiles(opts: AiContextOptionFlags): string[] {
  return AI_CONTEXT_FILES
    .filter((entry) => opts[entry.key])
    .map((entry) => entry.label);
}
