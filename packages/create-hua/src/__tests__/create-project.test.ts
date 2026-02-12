/**
 * Tests for project creation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveProjectPath, createProject } from '../create-project';
import * as path from 'path';
import * as fs from 'fs-extra';

// Mock fs-extra
vi.mock('fs-extra');

// Mock utils
vi.mock('../utils', () => ({
  copyTemplate: vi.fn(),
  generatePackageJson: vi.fn(),
  generateConfig: vi.fn(),
  generateAiContextFiles: vi.fn(),
  validateGeneratedProject: vi.fn(),
  validateTranslationFiles: vi.fn(),
  isEmptyDir: vi.fn().mockResolvedValue(true),
  checkPrerequisites: vi.fn(),
  generateSummary: vi.fn().mockResolvedValue({}),
  displaySummary: vi.fn(),
  displayNextSteps: vi.fn(),
}));

describe('resolveProjectPath', () => {
  let originalCwd: string;

  beforeEach(() => {
    originalCwd = process.cwd();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should resolve path in current directory', () => {
    const result = resolveProjectPath('my-app');
    expect(result).toContain('my-app');
    expect(path.isAbsolute(result)).toBe(true);
  });

  it('should handle monorepo context correctly', () => {
    // Mock being inside packages/create-hua
    const spy = vi.spyOn(process, 'cwd').mockReturnValue('C:/hua/packages/create-hua');

    const result = resolveProjectPath('test-project');
    expect(result).toBeTruthy();

    spy.mockRestore();
  });

  it('should return absolute path', () => {
    const result = resolveProjectPath('my-app');
    expect(path.isAbsolute(result)).toBe(true);
  });
});

describe('createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.remove).mockResolvedValue(undefined);
  });

  it('should handle dry-run mode without creating files', async () => {
    await createProject('test-app', undefined, { dryRun: true });

    expect(fs.ensureDir).not.toHaveBeenCalled();
  });

  it('should create project structure', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await createProject('test-app', undefined, { skipPrerequisites: true });

    expect(fs.ensureDir).toHaveBeenCalled();
  });

  it('should error on existing non-empty directory', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    const { isEmptyDir } = await import('../utils');
    vi.mocked(isEmptyDir).mockResolvedValue(false);

    await expect(
      createProject('existing-app', undefined, { skipPrerequisites: true })
    ).rejects.toThrow();
  });

  it('should skip prerequisites when flag is set', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await createProject('test-app', undefined, { skipPrerequisites: true });

    const { checkPrerequisites } = await import('../utils');
    expect(checkPrerequisites).not.toHaveBeenCalled();
  });

  it('should generate AI context files when provided', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const aiOptions = {
      cursorRules: true,
      aiContext: true,
      agentsMd: false,
      skillsMd: false,
      claudeContext: false,
      claudeSkills: false,
      language: 'en' as const,
    };

    await createProject('test-app', aiOptions, { skipPrerequisites: true });

    const { generateAiContextFiles } = await import('../utils');
    expect(generateAiContextFiles).toHaveBeenCalled();
  });

  it('should cleanup on error', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);
    vi.mocked(fs.ensureDir).mockRejectedValue(new Error('Test error'));

    await expect(
      createProject('test-app', undefined, { skipPrerequisites: true })
    ).rejects.toThrow();
  });

  it('should validate generated project', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await createProject('test-app', undefined, { skipPrerequisites: true });

    const { validateGeneratedProject } = await import('../utils');
    expect(validateGeneratedProject).toHaveBeenCalled();
  });

  it('should handle dry-run with AI context options', async () => {
    const aiOptions = {
      cursorRules: true,
      aiContext: false,
      agentsMd: false,
      skillsMd: false,
      claudeContext: false,
      claudeSkills: false,
      language: 'ko' as const,
    };

    await createProject('test-app', aiOptions, { dryRun: true });

    expect(fs.ensureDir).not.toHaveBeenCalled();
  });

  it('should copy template files', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await createProject('test-app', undefined, { skipPrerequisites: true });

    const { copyTemplate } = await import('../utils');
    expect(copyTemplate).toHaveBeenCalled();
  });

  it('should generate package.json', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await createProject('test-app', undefined, { skipPrerequisites: true });

    const { generatePackageJson } = await import('../utils');
    expect(generatePackageJson).toHaveBeenCalled();
  });

  it('should generate config file', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    await createProject('test-app', undefined, { skipPrerequisites: true });

    const { generateConfig } = await import('../utils');
    expect(generateConfig).toHaveBeenCalled();
  });
});
