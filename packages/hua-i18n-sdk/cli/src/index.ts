#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { version } from '../package.json';

const program = new Command();

// CLI 설정
program
  .name('hua-i18n-sdk')
  .description('CLI tool for hua-i18n-sdk setup and configuration')
  .version(version);

// init 명령어
program
  .command('init')
  .description('Initialize hua-i18n-sdk in your project')
  .option('-y, --yes', 'Skip prompts and use default values')
  .option('--nextjs', 'Configure for Next.js project')
  .option('--cra', 'Configure for Create React App project')
  .option('--vite', 'Configure for Vite project')
  .action(async (options) => {
    try {
      console.log(chalk.blue('🚀 Initializing hua-i18n-sdk...\n'));
      await initCommand(options);
    } catch (error) {
      console.error(chalk.red('❌ Error during initialization:'), error);
      process.exit(1);
    }
  });

// 도움말 명령어
program
  .command('help')
  .description('Show detailed help information')
  .action(() => {
    console.log(chalk.blue('📚 hua-i18n-sdk CLI Help\n'));
    console.log('Available commands:');
    console.log('  init    - Initialize hua-i18n-sdk in your project');
    console.log('  help    - Show this help message');
    console.log('  version - Show version information\n');
    
    console.log('Examples:');
    console.log('  npx hua-i18n-sdk init');
    console.log('  npx hua-i18n-sdk init --nextjs');
    console.log('  npx hua-i18n-sdk init --yes');
  });

// 명령어 파싱
program.parse(); 