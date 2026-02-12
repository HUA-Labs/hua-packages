/**
 * Tests for shared utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  parseVersion,
  compareVersions,
  validateProjectName,
  isEnglishOnly,
  isInteractive,
  listEnabledAiFiles,
  t,
  AI_CONTEXT_FILES,
  MIN_NODE_VERSION,
  type AiContextOptionFlags,
} from '../shared';

describe('parseVersion', () => {
  it('should parse basic version', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
  });

  it('should strip leading v', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
  });

  it('should strip prerelease suffix', () => {
    expect(parseVersion('1.2.3-alpha.1')).toEqual([1, 2, 3]);
  });

  it('should handle single digit versions', () => {
    expect(parseVersion('1.0.0')).toEqual([1, 0, 0]);
  });

  it('should handle multi-digit versions', () => {
    expect(parseVersion('22.1.0')).toEqual([22, 1, 0]);
  });
});

describe('compareVersions', () => {
  it('should return -1 when v1 < v2', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBe(-1);
  });

  it('should return 1 when v1 > v2', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBe(1);
  });

  it('should return 0 when versions are equal', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });

  it('should compare minor versions correctly', () => {
    expect(compareVersions('1.2.3', '1.2.4')).toBe(-1);
  });

  it('should compare major versions correctly', () => {
    expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
  });

  it('should handle version with v prefix', () => {
    expect(compareVersions('v1.0.0', 'v1.0.0')).toBe(0);
  });
});

describe('validateProjectName', () => {
  it('should accept valid lowercase name', () => {
    const result = validateProjectName('my-app');
    expect(result.valid).toBe(true);
  });

  it('should reject uppercase letters', () => {
    const result = validateProjectName('MyApp');
    expect(result.valid).toBe(false);
  });

  it('should reject leading dot', () => {
    const result = validateProjectName('.hidden');
    expect(result.valid).toBe(false);
  });

  it('should reject leading underscore', () => {
    const result = validateProjectName('_private');
    expect(result.valid).toBe(false);
  });

  it('should reject empty string', () => {
    const result = validateProjectName('');
    expect(result.valid).toBe(false);
  });

  it('should reject spaces', () => {
    const result = validateProjectName('my app');
    expect(result.valid).toBe(false);
  });

  it('should accept scoped packages', () => {
    const result = validateProjectName('@scope/name');
    expect(result.valid).toBe(true);
  });

  it('should accept hyphens', () => {
    const result = validateProjectName('my-awesome-app');
    expect(result.valid).toBe(true);
  });

  it('should accept numbers', () => {
    const result = validateProjectName('app123');
    expect(result.valid).toBe(true);
  });

  it('should accept dots in middle', () => {
    const result = validateProjectName('my.app');
    expect(result.valid).toBe(true);
  });
});

describe('isEnglishOnly', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalArgv: string[];

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalArgv = [...process.argv];
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  it('should return true when LANG is en', () => {
    process.env.LANG = 'en';
    expect(isEnglishOnly()).toBe(true);
  });

  it('should return true when CLI_LANG is en', () => {
    process.env.CLI_LANG = 'en';
    expect(isEnglishOnly()).toBe(true);
  });

  it('should return true when --english-only flag is present', () => {
    process.argv.push('--english-only');
    expect(isEnglishOnly()).toBe(true);
  });

  it('should return false when no english-only settings', () => {
    delete process.env.LANG;
    delete process.env.CLI_LANG;
    process.argv = process.argv.filter(arg => arg !== '--english-only');
    expect(isEnglishOnly()).toBe(false);
  });
});

describe('isInteractive', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let originalArgv: string[];

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalArgv = [...process.argv];
  });

  afterEach(() => {
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  it('should return false in CI environment', () => {
    process.env.CI = 'true';
    expect(isInteractive()).toBe(false);
  });

  it('should return false when NON_INTERACTIVE is set', () => {
    process.env.NON_INTERACTIVE = 'true';
    expect(isInteractive()).toBe(false);
  });

  it('should return false with --non-interactive flag', () => {
    process.argv.push('--non-interactive');
    expect(isInteractive()).toBe(false);
  });

  it('should return boolean based on TTY', () => {
    delete process.env.CI;
    delete process.env.NON_INTERACTIVE;
    process.argv = process.argv.filter(arg => arg !== '--non-interactive');
    const result = isInteractive();
    expect(typeof result).toBe('boolean');
  });
});

describe('listEnabledAiFiles', () => {
  it('should return empty array when no files enabled', () => {
    const opts: AiContextOptionFlags = {
      cursorRules: false,
      aiContext: false,
      agentsMd: false,
      skillsMd: false,
      claudeContext: false,
      claudeSkills: false,
    };
    expect(listEnabledAiFiles(opts)).toEqual([]);
  });

  it('should return enabled file labels', () => {
    const opts: AiContextOptionFlags = {
      cursorRules: true,
      aiContext: true,
      agentsMd: false,
      skillsMd: false,
      claudeContext: false,
      claudeSkills: false,
    };
    const result = listEnabledAiFiles(opts);
    expect(result).toContain('.cursor/rules/');
    expect(result).toContain('ai-context.md');
    expect(result.length).toBe(2);
  });

  it('should return all file labels when all enabled', () => {
    const opts: AiContextOptionFlags = {
      cursorRules: true,
      aiContext: true,
      agentsMd: true,
      skillsMd: true,
      claudeContext: true,
      claudeSkills: true,
    };
    const result = listEnabledAiFiles(opts);
    expect(result.length).toBe(6);
  });
});

describe('t', () => {
  it('should return string for valid message keys', () => {
    expect(typeof t('projectNamePrompt')).toBe('string');
    expect(typeof t('projectNameRequired')).toBe('string');
    expect(typeof t('selectAiContext')).toBe('string');
  });

  it('should return non-empty strings', () => {
    expect(t('projectNamePrompt').length).toBeGreaterThan(0);
  });
});

describe('AI_CONTEXT_FILES', () => {
  it('should be an array', () => {
    expect(Array.isArray(AI_CONTEXT_FILES)).toBe(true);
  });

  it('should have expected structure', () => {
    expect(AI_CONTEXT_FILES.length).toBeGreaterThan(0);
    AI_CONTEXT_FILES.forEach(entry => {
      expect(entry).toHaveProperty('key');
      expect(entry).toHaveProperty('label');
      expect(entry).toHaveProperty('paths');
      expect(Array.isArray(entry.paths)).toBe(true);
    });
  });

  it('should contain cursorRules entry', () => {
    const entry = AI_CONTEXT_FILES.find(e => e.key === 'cursorRules');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('.cursor/rules/');
  });

  it('should contain claudeSkills entry', () => {
    const entry = AI_CONTEXT_FILES.find(e => e.key === 'claudeSkills');
    expect(entry).toBeDefined();
    expect(entry?.label).toBe('.claude/skills/');
  });
});

describe('MIN_NODE_VERSION', () => {
  it('should be a string', () => {
    expect(typeof MIN_NODE_VERSION).toBe('string');
  });

  it('should be 22.0.0', () => {
    expect(MIN_NODE_VERSION).toBe('22.0.0');
  });
});
