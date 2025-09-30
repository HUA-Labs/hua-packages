import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { detectProjectType, ProjectType } from '../utils/detect';
import { createNextJsConfig } from '../templates/nextjs';
import { createCraConfig } from '../templates/cra';
import { createViteConfig } from '../templates/vite';
import { createTranslationFiles } from '../templates/translations';

interface InitOptions {
  yes?: boolean;
  nextjs?: boolean;
  cra?: boolean;
  vite?: boolean;
}

export async function initCommand(options: InitOptions): Promise<void> {
  const cwd = process.cwd();
  
  // 프로젝트 타입 감지
  const detectedType = detectProjectType(cwd);
  let projectType: ProjectType;
  
  if (options.yes) {
    // 자동 모드
    projectType = detectedType || 'nextjs';
    console.log(chalk.yellow(`Auto-detected project type: ${projectType}`));
  } else {
    // 인터랙티브 모드
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project are you setting up?',
        choices: [
          { name: 'Next.js', value: 'nextjs' },
          { name: 'Create React App', value: 'cra' },
          { name: 'Vite', value: 'vite' },
          { name: 'Other React project', value: 'react' }
        ],
        default: detectedType || 'nextjs'
      },
      {
        type: 'input',
        name: 'defaultLanguage',
        message: 'What is your default language?',
        default: 'ko'
      },
      {
        type: 'input',
        name: 'fallbackLanguage',
        message: 'What is your fallback language?',
        default: 'en'
      },
      {
        type: 'confirm',
        name: 'createTranslations',
        message: 'Create sample translation files?',
        default: true
      }
    ]);
    
    projectType = answers.projectType;
    
    // 설정 생성
    await createProjectConfig(projectType, answers, cwd);
  }
  
  // 번역 파일 생성
  if (options.yes || (await inquirer.prompt([{
    type: 'confirm',
    name: 'createTranslations',
    message: 'Create sample translation files?',
    default: true
  }])).createTranslations) {
    await createTranslationFiles(cwd);
  }
  
  // 완료 메시지
  console.log(chalk.green('\n✅ hua-i18n-sdk setup completed successfully!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log('1. Install the SDK: npm install hua-i18n-sdk');
  console.log('2. Import and use in your components');
  console.log('3. Check the generated configuration files');
  console.log('\nFor more information, visit: https://github.com/HUA-Labs/i18n-sdk');
}

async function createProjectConfig(
  projectType: ProjectType, 
  answers: any, 
  cwd: string
): Promise<void> {
  console.log(chalk.blue(`\n📝 Creating configuration for ${projectType}...`));
  
  switch (projectType) {
    case 'nextjs':
      await createNextJsConfig(answers, cwd);
      break;
    case 'cra':
      await createCraConfig(answers, cwd);
      break;
    case 'vite':
      await createViteConfig(answers, cwd);
      break;
    default:
      await createGenericConfig(answers, cwd);
      break;
  }
}

async function createGenericConfig(answers: any, cwd: string): Promise<void> {
  const configContent = `// lib/i18n-config.ts
import { createI18nConfig } from 'hua-i18n-sdk';

export const i18nConfig = createI18nConfig({
  defaultLanguage: '${answers.defaultLanguage}',
  fallbackLanguage: '${answers.fallbackLanguage}',
  supportedLanguages: [
    { code: '${answers.defaultLanguage}', name: 'Default', nativeName: 'Default' },
    { code: '${answers.fallbackLanguage}', name: 'Fallback', nativeName: 'Fallback' },
  ],
  namespaces: ['common'],
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const module = await import(\`../translations/\${language}/\${namespace}.json\`);
      return module.default;
    } catch (error) {
      console.warn(\`Failed to load translations for \${language}:\${namespace}\`, error);
      return {};
    }
  },
  debug: process.env.NODE_ENV === 'development',
});

export default i18nConfig;
`;

  await fs.ensureDir(path.join(cwd, 'lib'));
  await fs.writeFile(path.join(cwd, 'lib', 'i18n-config.ts'), configContent);
  console.log(chalk.green('✅ Created lib/i18n-config.ts'));
} 