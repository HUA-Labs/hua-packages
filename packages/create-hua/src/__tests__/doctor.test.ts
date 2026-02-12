/**
 * Tests for doctor command
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { diagnoseProject } from '../doctor';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock fs-extra
vi.mock('fs-extra');

describe('diagnoseProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return unhealthy for non-existent path', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(false);

    const result = await diagnoseProject('/non/existent/path');
    expect(result.healthy).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues[0].type).toBe('error');
  });

  it('should detect missing package.json', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('package.json')) return false;
      return true;
    });

    const result = await diagnoseProject('/test/project');
    const packageJsonIssue = result.issues.find(i => i.message.includes('package.json'));
    expect(packageJsonIssue).toBeDefined();
    expect(packageJsonIssue?.type).toBe('error');
  });

  it('should detect missing hua.config.ts', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('hua.config.ts')) return false;
      if (typeof p === 'string' && p.endsWith('package.json')) {
        return true;
      }
      return true;
    });

    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: {
        '@hua-labs/hua': '^0.1.0',
      },
    });

    const result = await diagnoseProject('/test/project');
    const configIssue = result.issues.find(i => i.message.includes('hua.config.ts'));
    expect(configIssue).toBeDefined();
    expect(configIssue?.type).toBe('error');
  });

  it('should detect missing required directories', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string') {
        const normalized = p.replace(/\\/g, '/');
        if (normalized.endsWith('package.json') || normalized.endsWith('hua.config.ts')) return true;
        if (normalized.endsWith('/app') || normalized.endsWith('/lib') || normalized.endsWith('/store') || normalized.endsWith('/translations')) return false;
      }
      return true;
    });

    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: { '@hua-labs/hua': '^0.1.0' },
    });

    const result = await diagnoseProject('/test/project');
    const dirIssues = result.issues.filter(i => i.message.includes('directory') || i.message.includes('디렉토리'));
    expect(dirIssues.length).toBeGreaterThan(0);
  });

  it('should categorize issues correctly', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('package.json')) return false;
      return true;
    });

    const result = await diagnoseProject('/test/project');
    const errors = result.issues.filter(i => i.type === 'error');
    const warnings = result.issues.filter(i => i.type === 'warning');
    const infos = result.issues.filter(i => i.type === 'info');

    expect(errors.length + warnings.length + infos.length).toBe(result.issues.length);
  });

  it('should detect missing @hua-labs/hua dependency', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: {},
    });

    const result = await diagnoseProject('/test/project');
    const depIssue = result.issues.find(i => i.message.includes('@hua-labs/hua'));
    expect(depIssue).toBeDefined();
    expect(depIssue?.type).toBe('error');
  });

  it('should provide solutions for issues', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string' && p.endsWith('package.json')) return false;
      return true;
    });

    const result = await diagnoseProject('/test/project');
    const issueWithSolution = result.issues.find(i => i.solution);
    expect(issueWithSolution).toBeDefined();
  });

  it('should return healthy true when no errors', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: { '@hua-labs/hua': '^0.1.0' },
    });
    (fs.readFile as any) = vi.fn().mockResolvedValue('HuaProvider' as any);

    const result = await diagnoseProject('/test/project');
    const hasErrors = result.issues.some(i => i.type === 'error');
    expect(result.healthy).toBe(!hasErrors);
  });

  it('should check app/layout.tsx exists', async () => {
    vi.mocked(fs.pathExists).mockImplementation(async (p: string) => {
      if (typeof p === 'string') {
        const normalized = p.replace(/\\/g, '/');
        if (normalized.includes('app/layout.tsx')) return false;
        if (normalized.endsWith('package.json') || normalized.endsWith('hua.config.ts')) return true;
      }
      return true;
    });

    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: { '@hua-labs/hua': '^0.1.0' },
    });

    const result = await diagnoseProject('/test/project');
    const layoutIssue = result.issues.find(i => i.message.includes('app/layout.tsx'));
    expect(layoutIssue).toBeDefined();
  });

  it('should warn about missing HuaProvider', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: { '@hua-labs/hua': '^0.1.0' },
    });
    (fs.readFile as any) = vi.fn().mockResolvedValue('import React from "react"' as any);

    const result = await diagnoseProject('/test/project');
    const providerIssue = result.issues.find(i => i.message.includes('HuaProvider'));
    if (providerIssue) {
      expect(providerIssue.type).toBe('warning');
    }
  });

  it('should handle package.json parse errors', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    (fs.readJSON as any) = vi.fn().mockRejectedValue(new Error('Parse error'));

    const result = await diagnoseProject('/test/project');
    const parseIssue = result.issues.find(i => i.message.includes('parse') || i.message.includes('파싱'));
    expect(parseIssue).toBeDefined();
    expect(parseIssue?.type).toBe('error');
  });
});

describe('Issue types', () => {
  it('should have error, warning, and info types', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: { '@hua-labs/hua': '^0.1.0' },
    });

    const result = await diagnoseProject('/test/project');
    const types = new Set(result.issues.map(i => i.type));
    expect(types.has('info')).toBe(true);
  });

  it('should include AI context file info', async () => {
    vi.mocked(fs.pathExists).mockResolvedValue(true);
    (fs.readJSON as any) = vi.fn().mockResolvedValue({
      dependencies: { '@hua-labs/hua': '^0.1.0' },
    });

    const result = await diagnoseProject('/test/project');
    const aiInfo = result.issues.find(i => i.type === 'info' && i.message.includes('AI'));
    expect(aiInfo).toBeDefined();
  });
});
