#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { spawnSync } from 'child_process';
import { parse as parseYaml } from 'yaml';

const VALID_TASKS = new Map([
  ['build', 'build'],
  ['type-check', 'typeCheck'],
  ['test', 'test'],
  ['lint', 'lint'],
]);

function getRepoRoot() {
  return resolve(import.meta.dirname, '..');
}

function loadRegistry(root) {
  const registryPath = join(root, 'config', 'workspaceRegistry.yaml');
  if (!existsSync(registryPath)) {
    throw new Error(`workspace registry not found: ${registryPath}`);
  }
  const parsed = parseYaml(readFileSync(registryPath, 'utf8'));
  if (!parsed || !Array.isArray(parsed.entries)) {
    throw new Error('workspace registry has invalid shape');
  }
  return parsed;
}

function loadActualProjects(root) {
  const projects = [];

  for (const folder of ['packages', 'apps']) {
    const base = join(root, folder);
    if (!existsSync(base)) continue;

    for (const child of readdirSync(base)) {
      const projectPath = join(base, child);
      const packageJsonPath = join(projectPath, 'package.json');
      if (!existsSync(packageJsonPath)) continue;

      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      projects.push({
        name: pkg.name,
        path: `${folder}/${child}`,
        kind: folder === 'packages' ? 'package' : 'app',
        scripts: pkg.scripts || {},
      });
    }
  }

  return projects;
}

function parseArgs(argv) {
  const [, , task, ...rest] = argv;
  if (!task || !VALID_TASKS.has(task)) {
    throw new Error(`usage: node scripts/run-workspace-task.mjs <${[...VALID_TASKS.keys()].join('|')}> [--kind package|app] [--dry-run]`);
  }

  let kind = null;
  let dryRun = false;

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === '--kind') {
      kind = rest[i + 1] || null;
      i += 1;
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    throw new Error(`unknown argument: ${arg}`);
  }

  return { task, kind, dryRun };
}

function main() {
  const { task, kind, dryRun } = parseArgs(process.argv);
  const ciField = VALID_TASKS.get(task);
  const root = getRepoRoot();
  const registry = loadRegistry(root);
  const actualProjects = loadActualProjects(root);
  const actualByName = new Map(actualProjects.map(project => [project.name, project]));

  const selectedEntries = registry.entries
    .filter(entry => entry.ci && entry.ci[ciField] === true)
    .filter(entry => !kind || entry.kind === kind);

  if (selectedEntries.length === 0) {
    console.log(`No registry entries matched task '${task}'${kind ? ` and kind '${kind}'` : ''}.`);
    return;
  }

  const missing = [];
  const scriptName = task;

  for (const entry of selectedEntries) {
    const actual = actualByName.get(entry.name);
    if (!actual) {
      missing.push(`${entry.name}: not found in workspace`);
      continue;
    }
    if (!actual.scripts[scriptName]) {
      missing.push(`${entry.name}: missing script '${scriptName}'`);
    }
  }

  if (missing.length > 0) {
    console.error('Workspace registry / script mismatch:');
    for (const item of missing) {
      console.error(`- ${item}`);
    }
    process.exit(1);
  }

  const args = [];
  for (const entry of selectedEntries) {
    args.push('--filter', entry.name);
  }
  args.push('run', scriptName);

  console.log(`Running workspace task '${task}' for ${selectedEntries.length} entries`);
  console.log(selectedEntries.map(entry => `- ${entry.name} (${entry.path})`).join('\n'));
  console.log(`pnpm ${args.join(' ')}`);

  if (dryRun) {
    return;
  }

  const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
  const result = spawnSync(pnpmBin, args, {
    cwd: root,
    stdio: 'inherit',
  });

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }

  if (result.error) {
    throw result.error;
  }
}

main();
