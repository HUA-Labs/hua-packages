/**
 * create-hua - Project Creation
 *
 * Creates a new hua project from template
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import { copyTemplate, generatePackageJson, generateConfig, generateAiContextFiles, validateGeneratedProject, isEmptyDir, type AiContextOptions } from './utils';
import { isEnglishOnly, listEnabledAiFiles } from './shared';

/**
 * Resolve project path
 *
 * If running from within the monorepo (packages/create-hua), create project in monorepo root.
 * Otherwise, create in current working directory.
 */
export function resolveProjectPath(projectName: string): string {
  const cwd = process.cwd();

  const normalizedCwd = path.normalize(cwd).replace(/\\/g, '/');
  if (normalizedCwd.includes('/packages/') && normalizedCwd.includes('/create-hua')) {
    const packagesIndex = normalizedCwd.indexOf('/packages/');
    const monorepoRoot = normalizedCwd.substring(0, packagesIndex);
    return path.resolve(monorepoRoot, projectName);
  }

  return path.resolve(cwd, projectName);
}

/**
 * Format AI context file list for dry-run output
 */
function formatAiFilesList(aiContextOptions?: AiContextOptions): string[] {
  if (!aiContextOptions) return [];
  return listEnabledAiFiles(aiContextOptions);
}

export async function createProject(
  projectName: string,
  aiContextOptions?: AiContextOptions,
  options?: { dryRun?: boolean; skipPrerequisites?: boolean }
): Promise<void> {
  const projectPath = resolveProjectPath(projectName);
  const isDryRun = options?.dryRun ?? false;
  const isEn = isEnglishOnly();

  if (process.env.NODE_ENV !== 'production' && !isDryRun) {
    console.log(chalk.gray(`Project will be created at: ${projectPath}`));
  }

  // Check if directory already exists and is not empty
  if (!isDryRun && await fs.pathExists(projectPath) && !(await isEmptyDir(projectPath))) {
    console.error(chalk.red(
      isEn
        ? `Directory "${projectPath}" already exists and is not empty`
        : `디렉토리 "${projectPath}"가 이미 존재하며 비어있지 않습니다`
    ));
    console.error(chalk.yellow(
      isEn
        ? 'Try a different project name or remove the existing directory'
        : '다른 프로젝트 이름을 사용하거나 기존 디렉토리를 삭제하세요'
    ));
    process.exit(1);
  }

  // Prerequisites check (skip in dry-run mode)
  if (!isDryRun && !options?.skipPrerequisites) {
    const { checkPrerequisites } = await import('./utils');
    try {
      await checkPrerequisites();
    } catch (error) {
      console.error(chalk.red('\nPrerequisites check failed'));
      throw error;
    }
  }

  if (isDryRun) {
    console.log(chalk.blue(`\nDry-run mode: Preview of project creation for "${projectName}"\n`));
  } else {
    console.log(chalk.blue(`\nCreating hua project: ${projectName}...\n`));
  }

  try {
    // Step 1/5: Creating project structure
    console.log(chalk.blue('Step 1/5: Creating project structure...'));
    if (!isDryRun) {
      await fs.ensureDir(projectPath);
    } else {
      console.log(chalk.gray(`  Would create directory: ${projectPath}`));
    }
    console.log(chalk.green('  Project structure ready'));

    // Step 2/5: Copying template files
    console.log(chalk.blue('\nStep 2/5: Copying template files...'));
    if (!isDryRun) {
      const shouldSkipAiContext = aiContextOptions
        ? !aiContextOptions.cursorRules && !aiContextOptions.aiContext && !aiContextOptions.agentsMd && !aiContextOptions.skillsMd && !aiContextOptions.claudeContext && !aiContextOptions.claudeSkills
        : false;
      await copyTemplate(projectPath, { skipAiContext: shouldSkipAiContext });
    } else {
      console.log(chalk.gray('  Would copy template files from templates/nextjs/'));
      const aiFiles = formatAiFilesList(aiContextOptions);
      if (aiFiles.length > 0) {
        console.log(chalk.gray(`  Would include AI context files: ${aiFiles.join(', ')}`));
      }
    }
    console.log(chalk.green('  Template files copied'));

    // Step 3/5: Generating configuration
    console.log(chalk.blue('\nStep 3/5: Generating configuration...'));
    if (!isDryRun) {
      await generatePackageJson(projectPath, projectName);
      await generateConfig(projectPath);
    } else {
      console.log(chalk.gray('  Would generate package.json'));
      console.log(chalk.gray('  Would generate hua.config.ts'));
    }
    console.log(chalk.green('  Configuration generated'));

    // Step 4/5: Generating AI context files
    console.log(chalk.blue('\nStep 4/5: Generating AI context files...'));
    if (!isDryRun) {
      await generateAiContextFiles(projectPath, projectName, aiContextOptions);
    } else {
      const aiFiles = formatAiFilesList(aiContextOptions);
      if (aiFiles.length > 0) {
        console.log(chalk.gray(`  Would generate: ${aiFiles.join(', ')}`));
      } else {
        console.log(chalk.gray('  No AI context files selected'));
      }
    }
    console.log(chalk.green('  AI context files generated'));

    // Step 5/5: Validating project
    console.log(chalk.blue('\nStep 5/5: Validating project...'));
    if (!isDryRun) {
      await validateGeneratedProject(projectPath);

      const { validateTranslationFiles } = await import('./utils');
      await validateTranslationFiles(projectPath);

      console.log(chalk.green('  Project validation passed'));
    } else {
      console.log(chalk.gray('  Would validate: package.json, tsconfig.json, required directories'));
      console.log(chalk.green('  Validation would pass'));
    }

    if (isDryRun) {
      console.log(chalk.green(`\nDry-run completed successfully!`));
      console.log(chalk.cyan(`\nPreview Summary:`));
      console.log(chalk.white(`  Project name: ${projectName}`));
      console.log(chalk.white(`  Location: ${projectPath}`));
      if (aiContextOptions) {
        const aiFiles = formatAiFilesList(aiContextOptions);
        console.log(chalk.white(`  AI Context: ${aiFiles.length > 0 ? aiFiles.join(', ') : 'None'}`));
        console.log(chalk.white(`  Language: ${aiContextOptions.language}`));
      }
      console.log(chalk.cyan(`\nRun without --dry-run to create the project`));
      return;
    }

    // Generate and display summary
    const { generateSummary, displaySummary, displayNextSteps } = await import('./utils');
    const summary = await generateSummary(projectPath, aiContextOptions);

    console.log(chalk.green(`\nProject created successfully!`));
    displaySummary(summary);
    displayNextSteps(projectPath, aiContextOptions);

  } catch (error) {
    console.error(chalk.red(`\n${isEn ? 'Error creating project' : '프로젝트 생성 중 오류 발생'}:`));

    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (process.env.NODE_ENV !== 'production' || process.env.DEBUG) {
        console.error(chalk.gray(error.stack));
      }
    } else {
      console.error(error);
    }

    if (!isDryRun && await fs.pathExists(projectPath)) {
      console.log(chalk.yellow('\nCleaning up...'));
      await fs.remove(projectPath);
    }
    throw error;
  }
}
