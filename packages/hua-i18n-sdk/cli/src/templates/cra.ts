import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createCraConfig(answers: any, cwd: string): Promise<void> {
  // i18n 설정 파일 생성
  const configContent = `// src/lib/i18n-config.ts
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

  await fs.ensureDir(path.join(cwd, 'src', 'lib'));
  await fs.writeFile(path.join(cwd, 'src', 'lib', 'i18n-config.ts'), configContent);
  console.log(chalk.green('✅ Created src/lib/i18n-config.ts'));

  // App.tsx 업데이트
  await updateAppTsx(cwd);
  
  // Provider 컴포넌트 생성
  await createProviderComponent(cwd);
}

async function updateAppTsx(cwd: string): Promise<void> {
  const appContent = `import React from 'react';
import { I18nProvider } from 'hua-i18n-sdk';
import i18nConfig from './lib/i18n-config';
import './App.css';

function App() {
  return (
    <I18nProvider config={i18nConfig}>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to React</h1>
          <p>Edit src/App.tsx and save to reload.</p>
        </header>
      </div>
    </I18nProvider>
  );
}

export default App;
`;

  await fs.writeFile(path.join(cwd, 'src', 'App.tsx'), appContent);
  console.log(chalk.green('✅ Updated src/App.tsx'));
}

async function createProviderComponent(cwd: string): Promise<void> {
  const providerContent = `// src/components/I18nProvider.tsx
import React from 'react';
import { I18nProvider as BaseI18nProvider } from 'hua-i18n-sdk';
import i18nConfig from '../lib/i18n-config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseI18nProvider config={i18nConfig}>
      {children}
    </BaseI18nProvider>
  );
}
`;

  await fs.ensureDir(path.join(cwd, 'src', 'components'));
  await fs.writeFile(path.join(cwd, 'src', 'components', 'I18nProvider.tsx'), providerContent);
  console.log(chalk.green('✅ Created src/components/I18nProvider.tsx'));
} 