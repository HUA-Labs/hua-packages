import { getActualWorkspaceProjects, loadWorkspaceRegistry } from './lib/workspace-registry.ts';

function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|');
}

function main(): void {
  const registry = loadWorkspaceRegistry();
  const actualProjects = getActualWorkspaceProjects();
  const actualByName = new Map(actualProjects.map(project => [project.name, project]));

  const rows = registry.entries
    .map(entry => {
      const actual = actualByName.get(entry.name);
      return {
        name: entry.name,
        path: entry.path,
        kind: entry.kind,
        tier: entry.tier,
        accessClass: entry.accessClass,
        lifecycle: entry.lifecycle,
        releaseMode: entry.release.mode,
        publicMirrorMode: entry.publicMirror.mode,
        ci: [
          entry.ci.build ? 'build' : null,
          entry.ci.typeCheck ? 'type' : null,
          entry.ci.test ? 'test' : null,
          entry.ci.lint ? 'lint' : null,
        ].filter(Boolean).join(','),
        private: actual?.private ? 'yes' : 'no',
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

  console.log('# Workspace Report');
  console.log('');
  console.log(`Generated: ${registry.updated}`);
  console.log('');
  console.log('| Name | Path | Kind | Tier | Access | Lifecycle | Release | Mirror | CI | private |');
  console.log('|---|---|---|---|---|---|---|---|---|---|');

  for (const row of rows) {
    console.log(
      `| ${escapeCell(row.name)} | ${escapeCell(row.path)} | ${row.kind} | ${row.tier} | ${row.accessClass} | ${row.lifecycle} | ${row.releaseMode} | ${row.publicMirrorMode} | ${row.ci || '-'} | ${row.private} |`
    );
  }
}

main();
