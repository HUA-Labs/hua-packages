/**
 * Version Check Utility
 *
 * Checks if the user is running an outdated version of create-hua
 * and provides clear instructions to clear npx cache if needed.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { compareVersions } from './shared';

const execAsync = promisify(exec);

interface VersionCheckResult {
  currentVersion: string;
  latestVersion: string;
  isOutdated: boolean;
  error?: string;
}

/**
 * Fetch the latest version from npm registry
 */
async function getLatestVersion(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('npm view create-hua version', {
      timeout: 5000,
    });
    return stdout.trim();
  } catch (error) {
    return null;
  }
}

/**
 * Get current package version
 */
function getCurrentVersion(): string {
  try {
    const packageJson = require('../package.json');
    return packageJson.version;
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Check if current version is outdated using proper semver comparison
 */
function isVersionOutdated(current: string, latest: string): boolean {
  if (current === 'unknown') return true;
  if (current === latest) return false;

  // Use proper semver comparison instead of string equality
  return compareVersions(current, latest) < 0;
}

/**
 * Display cache clearing instructions based on OS
 */
function displayCacheClearInstructions() {
  const platform = process.platform;

  console.log(chalk.cyan('\n   To clear npx cache:\n'));

  if (platform === 'win32') {
    console.log(chalk.cyan('   Windows:'));
    console.log(chalk.white('   npm cache clean --force'));
    console.log(chalk.white('   del /s /q "%LOCALAPPDATA%\\npm-cache"'));
    console.log(chalk.white('   rmdir /s /q "%APPDATA%\\npm-cache"'));
  } else {
    console.log(chalk.cyan('   macOS/Linux:'));
    console.log(chalk.white('   npm cache clean --force'));
    console.log(chalk.white('   rm -rf ~/.npm/_npx'));
  }

  console.log(chalk.cyan('\n   Then create your project with:'));
  console.log(chalk.white('   npm create hua@latest my-app'));
  console.log();
}

/**
 * Check if version check should be skipped
 */
function shouldSkipVersionCheck(): boolean {
  return !!(
    process.env.CI ||
    process.env.NON_INTERACTIVE ||
    process.argv.includes('--skip-version-check')
  );
}

/**
 * Check version and display warning if outdated.
 *
 * No blocking wait - just prints a warning and continues immediately.
 */
export async function checkVersion(): Promise<VersionCheckResult> {
  if (shouldSkipVersionCheck()) {
    const currentVersion = getCurrentVersion();
    return {
      currentVersion,
      latestVersion: 'skipped',
      isOutdated: false,
    };
  }

  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion();

  if (!latestVersion) {
    return {
      currentVersion,
      latestVersion: 'unknown',
      isOutdated: false,
      error: 'Unable to check latest version (network error)',
    };
  }

  const isOutdated = isVersionOutdated(currentVersion, latestVersion);

  if (isOutdated) {
    console.log(chalk.yellow('\nWarning: You are using an outdated version of create-hua'));
    console.log(chalk.yellow(`   Current:  ${currentVersion}`));
    console.log(chalk.yellow(`   Latest:   ${latestVersion}`));
    console.log();
    console.log(chalk.yellow('   This may result in receiving old templates with known issues.'));

    displayCacheClearInstructions();
    // No more 5-second forced wait - just continue
  } else {
    console.log(chalk.green(`Using latest version: ${currentVersion}\n`));
  }

  return {
    currentVersion,
    latestVersion,
    isOutdated,
  };
}

/**
 * Check version without displaying anything (for testing)
 */
export async function checkVersionSilent(): Promise<VersionCheckResult> {
  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion();

  if (!latestVersion) {
    return {
      currentVersion,
      latestVersion: 'unknown',
      isOutdated: false,
      error: 'Unable to check latest version',
    };
  }

  return {
    currentVersion,
    latestVersion,
    isOutdated: isVersionOutdated(currentVersion, latestVersion),
  };
}
