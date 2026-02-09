/**
 * Version Check Utility
 *
 * Checks if the user is running an outdated version of create-hua
 * and provides clear instructions to clear npx cache if needed.
 *
 * This helps prevent users from getting old templates due to npx cache.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

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
      timeout: 5000, // 5 second timeout
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
 * Compare versions (simple semver comparison)
 */
function isVersionOutdated(current: string, latest: string): boolean {
  if (current === latest) return false;
  if (current === 'unknown') return true;

  // Simple comparison - if they're different and current is not latest, it's outdated
  // For alpha versions, any difference means potentially outdated
  return current !== latest;
}

/**
 * Display cache clearing instructions based on OS
 */
function displayCacheClearInstructions() {
  const platform = process.platform;

  console.log(chalk.cyan('\n   📝 To clear npx cache:\n'));

  if (platform === 'win32') {
    // Windows
    console.log(chalk.cyan('   Windows:'));
    console.log(chalk.white('   npm cache clean --force'));
    console.log(chalk.white('   del /s /q "%LOCALAPPDATA%\\npm-cache"'));
    console.log(chalk.white('   rmdir /s /q "%APPDATA%\\npm-cache"'));
  } else {
    // macOS / Linux
    console.log(chalk.cyan('   macOS/Linux:'));
    console.log(chalk.white('   npm cache clean --force'));
    console.log(chalk.white('   rm -rf ~/.npm/_npx'));
  }

  console.log(chalk.cyan('\n   Then create your project with:'));
  console.log(chalk.white('   npm create hua@latest my-app'));
  console.log();
}

/**
 * Check version and display warning if outdated
 */
export async function checkVersion(): Promise<VersionCheckResult> {
  const currentVersion = getCurrentVersion();
  const latestVersion = await getLatestVersion();

  if (!latestVersion) {
    // Network error or npm unreachable - skip check silently
    return {
      currentVersion,
      latestVersion: 'unknown',
      isOutdated: false,
      error: 'Unable to check latest version (network error)',
    };
  }

  const isOutdated = isVersionOutdated(currentVersion, latestVersion);

  if (isOutdated) {
    console.log(chalk.yellow('\n⚠️  Warning: You are using an outdated version of create-hua'));
    console.log(chalk.yellow(`   Current:  ${currentVersion}`));
    console.log(chalk.yellow(`   Latest:   ${latestVersion}`));
    console.log();
    console.log(chalk.yellow('   This may result in receiving old templates with known issues.'));

    displayCacheClearInstructions();

    console.log(chalk.gray('   Continuing in 5 seconds...\n'));

    // Wait 5 seconds to let user read the warning
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } else {
    console.log(chalk.green(`✓ Using latest version: ${currentVersion}\n`));
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
