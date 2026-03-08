import { checkWorkspaceRegistry } from './lib/workspace-registry.ts';

function main(): void {
  const result = checkWorkspaceRegistry();

  console.log('Workspace registry check');
  console.log(`- registry entries: ${result.registry.entries.length}`);
  console.log(`- workspace projects: ${result.actualProjects.length}`);

  if (result.warnings.length > 0) {
    console.log(`- warnings: ${result.warnings.length}`);
    for (const warning of result.warnings) {
      console.log(`  WARN  ${warning}`);
    }
  }

  if (result.errors.length > 0) {
    console.log(`- errors: ${result.errors.length}`);
    for (const error of result.errors) {
      console.log(`  ERROR ${error}`);
    }
    process.exit(1);
  }

  console.log('- status: ok');
}

main();
