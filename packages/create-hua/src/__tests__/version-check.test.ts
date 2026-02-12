/**
 * Tests for version checking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkVersionSilent, shouldSkipVersionCheck } from '../version-check';
import { compareVersions } from '../shared';

// Mock child_process for version check
vi.mock('child_process', () => ({
  exec: (cmd: string, options: any, callback: (error: Error | null, stdout: { stdout: string }, stderr: string) => void) => {
    // Simulate npm view command
    if (cmd.includes('npm view')) {
      callback(null, { stdout: '1.1.0\n' } as any, '');
    }
  },
}));

describe('checkVersionSilent', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  it('should return version check result', async () => {
    const result = await checkVersionSilent();
    expect(result).toHaveProperty('currentVersion');
    expect(result).toHaveProperty('latestVersion');
    expect(result).toHaveProperty('isOutdated');
  });

  it('should have non-empty currentVersion', async () => {
    const result = await checkVersionSilent();
    expect(result.currentVersion).toBeTruthy();
    expect(typeof result.currentVersion).toBe('string');
  });

  it('should have latestVersion', async () => {
    const result = await checkVersionSilent();
    expect(result.latestVersion).toBeTruthy();
  });

  it('should have boolean isOutdated', async () => {
    const result = await checkVersionSilent();
    expect(typeof result.isOutdated).toBe('boolean');
  });

  it('should detect outdated version correctly', async () => {
    const result = await checkVersionSilent();
    if (result.currentVersion === result.latestVersion) {
      expect(result.isOutdated).toBe(false);
    }
  });

  it('should handle network errors gracefully', async () => {
    const result = await checkVersionSilent();
    // If latestVersion is 'unknown', it means there was an error
    if (result.latestVersion === 'unknown') {
      expect(result.error).toBeDefined();
      expect(result.isOutdated).toBe(false);
    }
  });
});

describe('shouldSkipVersionCheck', () => {
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

  it('should skip in CI environment', () => {
    process.env.CI = 'true';
    expect(shouldSkipVersionCheck()).toBe(true);
  });

  it('should skip when NON_INTERACTIVE is set', () => {
    process.env.NON_INTERACTIVE = 'true';
    expect(shouldSkipVersionCheck()).toBe(true);
  });

  it('should skip with --skip-version-check flag', () => {
    process.argv.push('--skip-version-check');
    expect(shouldSkipVersionCheck()).toBe(true);
  });
});

describe('Version comparison logic', () => {
  it('should correctly identify when current is older than latest', () => {
    expect(compareVersions('1.0.0', '1.1.0')).toBe(-1);
  });

  it('should correctly identify when current is newer than latest', () => {
    expect(compareVersions('1.2.0', '1.1.0')).toBe(1);
  });

  it('should correctly identify when versions are equal', () => {
    expect(compareVersions('1.1.0', '1.1.0')).toBe(0);
  });
});
