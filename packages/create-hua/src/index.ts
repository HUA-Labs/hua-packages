/**
 * create-hua-ux - Main Logic
 * 
 * Project creation logic
 */

import { createProject } from './create-project';
import { promptProjectName, promptAiContextOptions, type AiContextOptions } from './utils';
import { checkVersion } from './version-check';

/**
 * Parse CLI arguments for AI context options and other flags
 */
function parseAiContextOptions(): {
  options?: AiContextOptions;
  dryRun?: boolean;
  install?: boolean;
} {
  const args = process.argv.slice(2);
  const flags = {
    '--no-cursorrules': false,
    '--no-ai-context': false,
    '--no-claude-context': false,
    '--claude-skills': false,
    '--lang': 'both',
    '--dry-run': false,
    '--install': false,
    '--non-interactive': false,
  };

  // Simple flag parsing
  if (args.includes('--no-cursorrules')) flags['--no-cursorrules'] = true;
  if (args.includes('--no-ai-context')) flags['--no-ai-context'] = true;
  if (args.includes('--no-claude-context')) flags['--no-claude-context'] = true;
  if (args.includes('--claude-skills')) flags['--claude-skills'] = true;
  if (args.includes('--dry-run')) flags['--dry-run'] = true;
  if (args.includes('--install')) flags['--install'] = true;
  if (args.includes('--non-interactive')) flags['--non-interactive'] = true;

  const langIndex = args.indexOf('--lang');
  if (langIndex !== -1 && args[langIndex + 1]) {
    const lang = args[langIndex + 1];
    if (['ko', 'en', 'both'].includes(lang)) {
      flags['--lang'] = lang;
    }
  }

  const result: {
    options?: AiContextOptions;
    dryRun?: boolean;
    install?: boolean;
    nonInteractive?: boolean;
  } = {};

  // If any flags are set, return parsed options
  if (args.some(arg => arg.startsWith('--'))) {
    result.options = {
      cursorrules: !flags['--no-cursorrules'],
      aiContext: !flags['--no-ai-context'],
      claudeContext: !flags['--no-claude-context'],
      claudeSkills: flags['--claude-skills'],
      language: flags['--lang'] as 'ko' | 'en' | 'both',
    };
    result.dryRun = flags['--dry-run'];
    result.install = flags['--install'];
    result.nonInteractive = flags['--non-interactive'];
  }

  return result;
}

export async function main(): Promise<void> {
  // Check version (skip in CI/test environments)
  if (!process.env.CI && !process.env.NON_INTERACTIVE) {
    await checkVersion().catch(() => {
      // Silently continue if version check fails
    });
  }

  // Check for doctor command
  const args = process.argv.slice(2);
  if (args[0] === 'doctor') {
    const { runDoctor } = await import('./doctor');
    const projectPath = args[1] || process.cwd();
    await runDoctor(projectPath);
    return;
  }

  // Get project name from args (first non-flag argument)
  const projectName = args.find(arg => !arg.startsWith('--'));

  if (!projectName) {
    try {
      const name = await promptProjectName();
      if (!name) {
        const isEn = process.env.LANG === 'en' || process.env.CLI_LANG === 'en' || process.argv.includes('--english-only');
        console.error(isEn ? 'Project name is required' : 'Project name is required / 프로젝트 이름이 필요합니다');
        console.error('Usage: npx @hua-labs/create-hua-ux <project-name> [--claude-skills] [--lang ko|en|both] [--dry-run] [--install] [--non-interactive] [--english-only]');
        process.exit(1);
      }
      // AI context generation options
      const aiContextOptions = await promptAiContextOptions();
      const parsed = parseAiContextOptions();
      await createProject(name, aiContextOptions, {
        dryRun: parsed.dryRun,
        skipPrerequisites: parsed.dryRun, // Skip prerequisites in dry-run
      });
      return;
    } catch (error) {
      if (error instanceof Error && error.message.includes('User force closed')) {
        process.exit(0);
      }
      throw error;
    }
  }

  // Parse CLI options or prompt
  const parsed = parseAiContextOptions();
  let aiContextOptions: AiContextOptions;

  if (parsed.options) {
    // Use CLI options if provided
    aiContextOptions = parsed.options;
  } else {
    // Try to prompt, fallback to defaults if not interactive
    try {
      aiContextOptions = await promptAiContextOptions();
    } catch (error) {
      console.warn('Failed to get interactive options, using defaults');
      aiContextOptions = {
        cursorrules: true,
        aiContext: true,
        claudeContext: true,
        claudeSkills: false,
        language: 'both',
      };
    }
  }

  await createProject(projectName, aiContextOptions, {
    dryRun: parsed.dryRun,
    skipPrerequisites: parsed.dryRun,
  });

  // Auto-install if --install flag is set
  if (parsed.install && !parsed.dryRun) {
    const { execSync } = await import('child_process');
    const { resolveProjectPath } = await import('./create-project');
    const projectPath = resolveProjectPath(projectName);
    const chalk = (await import('chalk')).default;

    console.log(chalk.blue('\n📦 Installing dependencies...'));
    try {
      execSync('pnpm install', {
        cwd: projectPath,
        stdio: 'inherit',
      });
      console.log(chalk.green('✅ Dependencies installed'));
    } catch (error) {
      console.error(chalk.red('❌ Failed to install dependencies'));
      throw error;
    }
  }
}

// Export for use in bin file
export { createProject };
