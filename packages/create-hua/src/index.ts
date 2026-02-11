/**
 * create-hua - Main Logic
 *
 * Project creation logic
 */

import chalk from 'chalk';
import { createProject } from './create-project';
import { promptProjectName, promptAiContextOptions, type AiContextOptions } from './utils';
import { checkVersion } from './version-check';
import { isEnglishOnly, validateProjectName } from './shared';

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
    '--no-cursor-rules': false,
    '--no-ai-context': false,
    '--no-agents-md': false,
    '--no-skills-md': false,
    '--no-claude-context': false,
    '--claude-skills': false,
    '--lang': 'both',
    '--dry-run': false,
    '--install': false,
    '--non-interactive': false,
  };

  if (args.includes('--no-cursor-rules')) flags['--no-cursor-rules'] = true;
  if (args.includes('--no-ai-context')) flags['--no-ai-context'] = true;
  if (args.includes('--no-agents-md')) flags['--no-agents-md'] = true;
  if (args.includes('--no-skills-md')) flags['--no-skills-md'] = true;
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

  if (args.some(arg => arg.startsWith('--'))) {
    result.options = {
      cursorRules: !flags['--no-cursor-rules'],
      aiContext: !flags['--no-ai-context'],
      agentsMd: !flags['--no-agents-md'],
      skillsMd: !flags['--no-skills-md'],
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
  // Check version (skip in CI/test environments or --skip-version-check)
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

  // Validate project name if provided via CLI
  if (projectName) {
    const validation = validateProjectName(projectName);
    if (!validation.valid) {
      const isEn = isEnglishOnly();
      console.error(chalk.red(validation.message!));
      console.error(
        isEn
          ? 'Usage: npx create-hua <project-name> [options]'
          : 'Usage: npx create-hua <project-name> [options]'
      );
      process.exit(1);
    }
  }

  if (!projectName) {
    try {
      const name = await promptProjectName();
      if (!name) {
        const isEn = isEnglishOnly();
        console.error(
          isEn
            ? 'Project name is required'
            : 'Project name is required / 프로젝트 이름이 필요합니다'
        );
        console.error('Usage: npx create-hua <project-name> [--no-cursor-rules] [--no-agents-md] [--no-skills-md] [--claude-skills] [--lang ko|en|both] [--dry-run] [--install] [--non-interactive] [--english-only] [--skip-version-check]');
        process.exit(1);
      }
      const aiContextOptions = await promptAiContextOptions();
      const parsed = parseAiContextOptions();
      await createProject(name, aiContextOptions, {
        dryRun: parsed.dryRun,
        skipPrerequisites: parsed.dryRun,
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
    aiContextOptions = parsed.options;
  } else {
    try {
      aiContextOptions = await promptAiContextOptions();
    } catch (error) {
      console.warn('Failed to get interactive options, using defaults');
      aiContextOptions = {
        cursorRules: true,
        aiContext: true,
        agentsMd: true,
        skillsMd: true,
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

    console.log(chalk.blue('\nInstalling dependencies...'));
    try {
      execSync('pnpm install', {
        cwd: projectPath,
        stdio: 'inherit',
      });
      console.log(chalk.green('Dependencies installed'));
    } catch (error) {
      console.error(chalk.red('Failed to install dependencies'));
      throw error;
    }
  }
}
// Export for use in bin file
export { createProject };
