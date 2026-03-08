import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { parse as parseYaml } from 'yaml';

export type WorkspaceKind = 'package' | 'app';
export type WorkspaceTier =
  | 'spine'
  | 'support'
  | 'bundle-internal'
  | 'tooling'
  | 'product'
  | 'internal-site';
export type AccessClass =
  | 'public-oss'
  | 'framework-entitled'
  | 'internal-core'
  | 'hosted-only'
  | 'private-app'
  | 'private-internal';
export type Lifecycle =
  | 'grow'
  | 'maintain'
  | 'freeze-candidate'
  | 'pre-release'
  | 'reserved';
export type ReleaseMode =
  | 'public-npm'
  | 'private-workspace'
  | 'app-deploy'
  | 'private-app'
  | 'no-publish';
export type PublicMirrorMode = 'include' | 'exclude' | 'defer';

export interface WorkspaceRegistryEntry {
  name: string;
  path: string;
  kind: WorkspaceKind;
  tier: WorkspaceTier;
  accessClass: AccessClass;
  lifecycle: Lifecycle;
  release: {
    mode: ReleaseMode;
  };
  publicMirror: {
    mode: PublicMirrorMode;
  };
  ci: {
    build: boolean;
    typeCheck: boolean;
    test: boolean;
    lint: boolean;
  };
}

export interface WorkspaceRegistryFile {
  version: number;
  updated: string;
  purpose?: string;
  defaults?: Partial<WorkspaceRegistryEntry>;
  entries: WorkspaceRegistryEntry[];
}

export interface WorkspaceProject {
  name: string;
  path: string;
  kind: WorkspaceKind;
  private: boolean;
  scripts: Record<string, string>;
}

export interface RegistryCheckResult {
  errors: string[];
  warnings: string[];
  registry: WorkspaceRegistryFile;
  actualProjects: WorkspaceProject[];
}

export const VALID_KINDS = new Set<WorkspaceKind>(['package', 'app']);
export const VALID_TIERS = new Set<WorkspaceTier>([
  'spine',
  'support',
  'bundle-internal',
  'tooling',
  'product',
  'internal-site',
]);
export const VALID_ACCESS_CLASSES = new Set<AccessClass>([
  'public-oss',
  'framework-entitled',
  'internal-core',
  'hosted-only',
  'private-app',
  'private-internal',
]);
export const VALID_LIFECYCLES = new Set<Lifecycle>([
  'grow',
  'maintain',
  'freeze-candidate',
  'pre-release',
  'reserved',
]);
export const VALID_RELEASE_MODES = new Set<ReleaseMode>([
  'public-npm',
  'private-workspace',
  'app-deploy',
  'private-app',
  'no-publish',
]);
export const VALID_PUBLIC_MIRROR_MODES = new Set<PublicMirrorMode>([
  'include',
  'exclude',
  'defer',
]);

export function getRepoRoot(): string {
  return resolve(import.meta.dirname, '..', '..');
}

export function loadWorkspaceRegistry(root = getRepoRoot()): WorkspaceRegistryFile {
  const registryPath = join(root, 'config', 'workspaceRegistry.yaml');
  if (!existsSync(registryPath)) {
    throw new Error(`workspace registry not found: ${registryPath}`);
  }

  const raw = readFileSync(registryPath, 'utf8');
  const parsed = parseYaml(raw) as WorkspaceRegistryFile;

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.entries)) {
    throw new Error('workspace registry has invalid shape');
  }

  return parsed;
}

export function getActualWorkspaceProjects(root = getRepoRoot()): WorkspaceProject[] {
  const projects: WorkspaceProject[] = [];

  for (const folder of ['packages', 'apps'] as const) {
    const base = join(root, folder);
    if (!existsSync(base)) continue;

    for (const child of readdirSync(base)) {
      const projectPath = join(base, child);
      const packageJsonPath = join(projectPath, 'package.json');
      if (!existsSync(packageJsonPath)) continue;

      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
        name: string;
        private?: boolean;
        scripts?: Record<string, string>;
      };

      projects.push({
        name: pkg.name,
        path: `${folder}/${child}`,
        kind: folder === 'packages' ? 'package' : 'app',
        private: pkg.private === true,
        scripts: pkg.scripts ?? {},
      });
    }
  }

  return projects.sort((a, b) => a.path.localeCompare(b.path));
}

export function checkWorkspaceRegistry(root = getRepoRoot()): RegistryCheckResult {
  const registry = loadWorkspaceRegistry(root);
  const actualProjects = getActualWorkspaceProjects(root);
  const errors: string[] = [];
  const warnings: string[] = [];

  const actualByName = new Map(actualProjects.map(project => [project.name, project]));
  const actualByPath = new Map(actualProjects.map(project => [project.path, project]));

  const seenNames = new Set<string>();
  const seenPaths = new Set<string>();

  for (const entry of registry.entries) {
    if (seenNames.has(entry.name)) {
      errors.push(`duplicate registry name: ${entry.name}`);
    }
    seenNames.add(entry.name);

    if (seenPaths.has(entry.path)) {
      errors.push(`duplicate registry path: ${entry.path}`);
    }
    seenPaths.add(entry.path);

    if (!VALID_KINDS.has(entry.kind)) {
      errors.push(`${entry.name}: invalid kind '${entry.kind}'`);
    }
    if (!VALID_TIERS.has(entry.tier)) {
      errors.push(`${entry.name}: invalid tier '${entry.tier}'`);
    }
    if (!VALID_ACCESS_CLASSES.has(entry.accessClass)) {
      errors.push(`${entry.name}: invalid accessClass '${entry.accessClass}'`);
    }
    if (!VALID_LIFECYCLES.has(entry.lifecycle)) {
      errors.push(`${entry.name}: invalid lifecycle '${entry.lifecycle}'`);
    }
    if (!entry.release || !VALID_RELEASE_MODES.has(entry.release.mode)) {
      errors.push(`${entry.name}: invalid release.mode '${entry.release?.mode}'`);
    }
    if (!entry.publicMirror || !VALID_PUBLIC_MIRROR_MODES.has(entry.publicMirror.mode)) {
      errors.push(`${entry.name}: invalid publicMirror.mode '${entry.publicMirror?.mode}'`);
    }

    for (const key of ['build', 'typeCheck', 'test', 'lint'] as const) {
      if (typeof entry.ci?.[key] !== 'boolean') {
        errors.push(`${entry.name}: ci.${key} must be boolean`);
      }
    }

    const actual = actualByName.get(entry.name) ?? actualByPath.get(entry.path);
    if (!actual) {
      errors.push(`${entry.name}: registry entry does not match any workspace project (${entry.path})`);
      continue;
    }

    if (actual.name !== entry.name) {
      errors.push(`${entry.name}: package.json name mismatch at ${entry.path} (actual: ${actual.name})`);
    }
    if (actual.path !== entry.path) {
      errors.push(`${entry.name}: path mismatch (registry: ${entry.path}, actual: ${actual.path})`);
    }
    if (actual.kind !== entry.kind) {
      errors.push(`${entry.name}: kind mismatch (registry: ${entry.kind}, actual: ${actual.kind})`);
    }

    for (const [flag, scriptName] of [
      ['build', 'build'],
      ['typeCheck', 'type-check'],
      ['test', 'test'],
      ['lint', 'lint'],
    ] as const) {
      if (entry.ci[flag] && !actual.scripts[scriptName]) {
        errors.push(`${entry.name}: ci.${flag}=true but script '${scriptName}' is missing`);
      }
    }

    if (entry.release.mode === 'public-npm' && actual.kind !== 'package') {
      errors.push(`${entry.name}: public-npm release is only valid for packages`);
    }
    if (entry.release.mode === 'public-npm' && actual.private) {
      errors.push(`${entry.name}: release.mode=public-npm but package.json is private`);
    }
    if (entry.accessClass === 'public-oss' && actual.kind === 'package' && actual.private) {
      errors.push(`${entry.name}: accessClass=public-oss but package.json is private`);
    }

    if (entry.accessClass === 'framework-entitled' && !actual.private) {
      warnings.push(`${entry.name}: framework-entitled is usually private/dist-only, but package.json is public`);
    }
    if (entry.publicMirror.mode === 'include' && actual.kind !== 'package') {
      warnings.push(`${entry.name}: publicMirror.include is unusual for non-package workspaces`);
    }
    if (entry.publicMirror.mode === 'include' && entry.release.mode !== 'public-npm') {
      warnings.push(`${entry.name}: publicMirror.include does not match release.mode=${entry.release.mode}`);
    }
    if (entry.accessClass === 'hosted-only' && actual.kind !== 'app') {
      warnings.push(`${entry.name}: hosted-only usually maps to an app/service, not a package`);
    }
    if (entry.lifecycle === 'freeze-candidate' && entry.tier === 'spine') {
      warnings.push(`${entry.name}: spine package marked as freeze-candidate`);
    }
  }

  for (const project of actualProjects) {
    const hasEntry = registry.entries.some(entry => entry.name === project.name && entry.path === project.path);
    if (!hasEntry) {
      errors.push(`workspace project missing from registry: ${project.name} (${project.path})`);
    }
  }

  return { errors, warnings, registry, actualProjects };
}
