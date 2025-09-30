import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export async function createNextJsConfig(answers: any, cwd: string): Promise<void> {
  const isAppRouter = fs.existsSync(path.join(cwd, 'app'));
  const isPagesRouter = fs.existsSync(path.join(cwd, 'pages'));
  
  // i18n 설정 파일 생성
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

  // App Router 설정
  if (isAppRouter) {
    await createAppRouterConfig(cwd);
  }
  
  // Pages Router 설정
  if (isPagesRouter) {
    await createPagesRouterConfig(cwd);
  }
  
  // Provider 컴포넌트 생성
  await createProviderComponent(cwd, isAppRouter);
}

async function createAppRouterConfig(cwd: string): Promise<void> {
  const layoutContent = `// app/layout.tsx
import { I18nProvider } from 'hua-i18n-sdk';
import i18nConfig from '../lib/i18n-config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <I18nProvider config={i18nConfig}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
`;

  await fs.ensureDir(path.join(cwd, 'app'));
  await fs.writeFile(path.join(cwd, 'app', 'layout.tsx'), layoutContent);
  console.log(chalk.green('✅ Updated app/layout.tsx'));
}

async function createPagesRouterConfig(cwd: string): Promise<void> {
  const appContent = `// pages/_app.tsx
import type { AppProps } from 'next/app';
import { I18nProvider } from 'hua-i18n-sdk';
import i18nConfig from '../lib/i18n-config';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider config={i18nConfig}>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
`;

  await fs.ensureDir(path.join(cwd, 'pages'));
  await fs.writeFile(path.join(cwd, 'pages', '_app.tsx'), appContent);
  console.log(chalk.green('✅ Updated pages/_app.tsx'));
}

async function createProviderComponent(cwd: string, isAppRouter: boolean): Promise<void> {
  const providerContent = `// components/I18nProvider.tsx
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

  await fs.ensureDir(path.join(cwd, 'components'));
  await fs.writeFile(path.join(cwd, 'components', 'I18nProvider.tsx'), providerContent);
  console.log(chalk.green('✅ Created components/I18nProvider.tsx'));
} 