import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  getRepoRoot,
  loadWorkspaceRegistry,
  type PublicMirrorMode,
  type WorkspaceRegistryEntry,
} from './lib/workspace-registry.ts';

interface AuditResult {
  warnings: string[];
  notes: string[];
}

function extractSyncExcludedPaths(scriptContent: string): Set<string> {
  const excluded = new Set<string>();

  for (const match of scriptContent.matchAll(/--path\s+([^\s\\]+)\s*\\/g)) {
    const rawPath = match[1]?.trim();
    if (!rawPath) continue;
    excluded.add(rawPath.replace(/\/$/, ''));
  }

  const privatePathsBlock = scriptContent.match(/PRIVATE_PATHS=\(([\s\S]*?)\n\)/);
  if (privatePathsBlock) {
    for (const match of privatePathsBlock[1].matchAll(/"([^"]+)"/g)) {
      const rawPath = match[1]?.trim();
      if (!rawPath) continue;
      excluded.add(rawPath.replace(/\/$/, ''));
    }
  }

  return excluded;
}

function formatDecision(entry: WorkspaceRegistryEntry): string {
  return `${entry.name} (${entry.path}, ${entry.release.mode}, ${entry.accessClass}, mirror:${entry.publicMirror.mode})`;
}

function describeSyncBehavior(mode: PublicMirrorMode, excludedInSync: boolean): string {
  if (mode === 'defer') {
    return excludedInSync ? 'currently excluded by sync' : 'currently included by sync';
  }
  return excludedInSync ? 'excluded by sync' : 'included by sync';
}

function auditMirrorPolicy(root = getRepoRoot()): AuditResult {
  const warnings: string[] = [];
  const notes: string[] = [];

  const registry = loadWorkspaceRegistry(root);
  const syncScriptPath = join(root, 'scripts', 'sync-to-public.sh');
  if (!existsSync(syncScriptPath)) {
    throw new Error(`sync script not found: ${syncScriptPath}`);
  }

  const syncScript = readFileSync(syncScriptPath, 'utf8');
  const excludedPaths = extractSyncExcludedPaths(syncScript);

  for (const entry of registry.entries) {
    const decision = entry.publicMirror.mode;
    const excludedInSync = excludedPaths.has(entry.path);

    if (decision === 'include' && excludedInSync) {
      warnings.push(`sync excludes a public candidate: ${formatDecision(entry)}`);
    }

    if (decision === 'exclude' && !excludedInSync) {
      warnings.push(`sync does not exclude a non-public entry: ${formatDecision(entry)}`);
    }

    if (decision === 'defer') {
      notes.push(`mirror decision deferred: ${formatDecision(entry)} (${describeSyncBehavior(decision, excludedInSync)})`);
    }
  }

  const changesetConfigPath = join(root, '.changeset', 'config.json');
  if (existsSync(changesetConfigPath)) {
    const config = JSON.parse(readFileSync(changesetConfigPath, 'utf8')) as {
      ignore?: string[];
    };
    const ignored = new Set(config.ignore ?? []);

    for (const entry of registry.entries) {
      if (entry.kind !== 'package') continue;

      const decision = entry.publicMirror.mode;
      const ignoredInChangeset = ignored.has(entry.name);

      if (decision === 'include' && ignoredInChangeset) {
        notes.push(`changeset currently ignores a public candidate: ${formatDecision(entry)}`);
      }

      if (decision === 'exclude' && !ignoredInChangeset) {
        notes.push(`changeset does not ignore a non-public package: ${formatDecision(entry)}`);
      }

      if (decision === 'defer') {
        notes.push(
          `changeset review still deferred for package: ${formatDecision(entry)} (${ignoredInChangeset ? 'currently ignored' : 'currently not ignored'})`
        );
      }
    }
  }

  return { warnings, notes };
}

function main(): void {
  const result = auditMirrorPolicy();

  console.log('Public mirror audit');
  console.log('- mode: warning-only');

  if (result.warnings.length === 0) {
    console.log('- sync policy mismatches: 0');
  } else {
    console.log(`- sync policy mismatches: ${result.warnings.length}`);
    for (const warning of result.warnings) {
      console.log(`  WARN  ${warning}`);
    }
  }

  if (result.notes.length === 0) {
    console.log('- changeset notes: 0');
  } else {
    console.log(`- changeset notes: ${result.notes.length}`);
    for (const note of result.notes) {
      console.log(`  NOTE  ${note}`);
    }
  }

  console.log('- status: completed');
}

main();
