#!/usr/bin/env tsx
/**
 * Template Validation Script
 *
 * Validates that the Next.js template includes all required files
 * and that critical files contain necessary Next.js 16 patterns.
 *
 * Run before build to catch template issues early.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const TEMPLATE_DIR = join(__dirname, '../templates/nextjs');

interface TemplateConfig {
  required: string[];
  optional: string[];
  mustContain: Record<string, string[]>;
}

const TEMPLATE_CONFIG: TemplateConfig = {
  // Files that MUST exist in the template
  // Note: package.json, .gitignore, hua.config.ts are generated dynamically by create-project.ts
  required: [
    'app/layout.tsx',
    'app/page.tsx',
    'app/globals.css',
    'app/api/translations/[language]/[namespace]/route.ts',
    'lib/utils.ts',
    'lib/i18n-setup.ts',
    'store/useAppStore.ts',
    'translations/ko/common.json',
    'translations/en/common.json',
    'next.config.ts',
    'tailwind.config.js',
    'tsconfig.json',
  ],

  // Files that are optional (user can add later)
  optional: [
    'public/favicon.ico',
    'public/logo.svg',
    'public/next.svg',
    'middleware.ts.example',
    'app/layout-with-geo.example.tsx',
    'app/page-with-geo.example.tsx',
  ],

  // Files that must contain specific patterns (Next.js 16 compatibility)
  mustContain: {
    'app/layout.tsx': [
      'HuaProvider',
      'hua.config',
      'getSSRTranslations',
    ],
    'app/api/translations/[language]/[namespace]/route.ts': [
      'async function GET',
      'await params',
      'Promise<{ language: string; namespace: string }>',
    ],
  },
};

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
}

function validateRequiredFiles(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(chalk.blue('\n📋 Validating required files...'));

  for (const file of TEMPLATE_CONFIG.required) {
    const fullPath = join(TEMPLATE_DIR, file);
    if (!existsSync(fullPath)) {
      errors.push(`Missing required file: ${file}`);
      console.log(chalk.red(`  ❌ ${file}`));
    } else {
      console.log(chalk.green(`  ✓ ${file}`));
    }
  }

  console.log(chalk.blue('\n📋 Checking optional files...'));

  for (const file of TEMPLATE_CONFIG.optional) {
    const fullPath = join(TEMPLATE_DIR, file);
    if (!existsSync(fullPath)) {
      console.log(chalk.gray(`  ⊝ ${file} (optional)`));
    } else {
      console.log(chalk.green(`  ✓ ${file} (optional)`));
    }
  }

  return { errors, warnings };
}

function validateFileContents(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(chalk.blue('\n🔍 Validating file contents (Next.js 16 compatibility)...'));

  for (const [file, patterns] of Object.entries(TEMPLATE_CONFIG.mustContain)) {
    const fullPath = join(TEMPLATE_DIR, file);

    if (!existsSync(fullPath)) {
      errors.push(`Cannot validate ${file}: file not found`);
      console.log(chalk.red(`  ❌ ${file} - not found`));
      continue;
    }

    const content = readFileSync(fullPath, 'utf-8');
    let fileHasErrors = false;

    console.log(chalk.cyan(`\n  Checking ${file}:`));

    for (const pattern of patterns) {
      if (!content.includes(pattern)) {
        errors.push(`${file} must contain: ${pattern}`);
        console.log(chalk.red(`    ❌ Missing: ${pattern}`));
        fileHasErrors = true;
      } else {
        console.log(chalk.green(`    ✓ Found: ${pattern}`));
      }
    }

    if (!fileHasErrors) {
      console.log(chalk.green(`  ✓ ${file} - all patterns found`));
    }
  }

  return { errors, warnings };
}

function validatePackageJson(): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  console.log(chalk.blue('\n📦 Validating package.json...'));

  const packageJsonPath = join(TEMPLATE_DIR, 'package.json');
  if (!existsSync(packageJsonPath)) {
    console.log(chalk.gray('  ⊝ package.json is generated dynamically - skipping validation'));
    return { errors, warnings };
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  // Check required scripts
  const requiredScripts = ['dev', 'build', 'start', 'lint'];
  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) {
      errors.push(`Missing required script in package.json: ${script}`);
      console.log(chalk.red(`  ❌ Missing script: ${script}`));
    } else {
      console.log(chalk.green(`  ✓ Script: ${script}`));
    }
  }

  // Check for placeholder values that need to be replaced
  if (packageJson.name === 'my-app') {
    // This is OK - it's a placeholder that gets replaced
    console.log(chalk.gray(`  ⊝ Using placeholder name: ${packageJson.name}`));
  }

  return { errors, warnings };
}

function main() {
  console.log(chalk.bold.blue('\n🔍 Template Validation\n'));
  console.log(chalk.gray(`Template directory: ${TEMPLATE_DIR}\n`));

  const result: ValidationResult = {
    success: true,
    errors: [],
    warnings: [],
  };

  // Run all validations
  const fileValidation = validateRequiredFiles();
  result.errors.push(...fileValidation.errors);
  result.warnings.push(...fileValidation.warnings);

  const contentValidation = validateFileContents();
  result.errors.push(...contentValidation.errors);
  result.warnings.push(...contentValidation.warnings);

  const packageValidation = validatePackageJson();
  result.errors.push(...packageValidation.errors);
  result.warnings.push(...packageValidation.warnings);

  // Print summary
  console.log(chalk.bold.blue('\n📊 Validation Summary\n'));

  if (result.warnings.length > 0) {
    console.log(chalk.yellow(`⚠️  Warnings: ${result.warnings.length}`));
    result.warnings.forEach((warning) => {
      console.log(chalk.yellow(`  • ${warning}`));
    });
    console.log();
  }

  if (result.errors.length > 0) {
    console.log(chalk.red(`❌ Errors: ${result.errors.length}`));
    result.errors.forEach((error) => {
      console.log(chalk.red(`  • ${error}`));
    });
    console.log();
    console.log(chalk.red('❌ Template validation failed\n'));
    process.exit(1);
  }

  console.log(chalk.green('✅ Template validation passed\n'));
  process.exit(0);
}

main();
