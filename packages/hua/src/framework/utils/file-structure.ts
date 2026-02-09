/**
 * @hua-labs/hua/framework - File Structure Validation
 * 
 * Validates project file structure according to framework conventions
 * 
 * **서버 전용**: 이 모듈은 Node.js 환경에서만 사용 가능합니다.
 * **Server Only**: This module is only available in Node.js environment.
 */

// 서버 환경에서만 fs 사용
let existsSync: typeof import('fs')['existsSync'];
let join: typeof import('path')['join'];

if (typeof window === 'undefined' && typeof require !== 'undefined') {
  // Node.js 환경
  const fs = require('fs');
  const path = require('path');
  existsSync = fs.existsSync;
  join = path.join;
} else {
  // 클라이언트 환경: 더미 함수 (사용 시 에러)
  existsSync = () => {
    throw new Error('validateFileStructure is only available in Node.js environment');
  };
  join = (...args: string[]) => args.join('/');
}

/**
 * Expected directory structure
 */
const REQUIRED_DIRS = [
  'app',
  'components',
  'lib',
] as const;

const OPTIONAL_DIRS = [
  'hooks',
  'store',
  'translations',
] as const;

/**
 * File structure validation result
 */
export interface FileStructureResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
}

/**
 * Validate project file structure
 * 
 * @example
 * ```ts
 * const result = validateFileStructure(process.cwd());
 * if (!result.valid) {
 *   console.error('Missing directories:', result.missing);
 * }
 * ```
 */
export function validateFileStructure(projectRoot: string): FileStructureResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required directories
  for (const dir of REQUIRED_DIRS) {
    const dirPath = join(projectRoot, dir);
    if (!existsSync(dirPath)) {
      missing.push(dir);
    }
  }

  // Check optional directories (warnings only)
  for (const dir of OPTIONAL_DIRS) {
    const dirPath = join(projectRoot, dir);
    if (!existsSync(dirPath)) {
      warnings.push(`Optional directory "${dir}" not found`);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}
