import type { Metadata, Viewport } from 'next';
import { ThemeProvider, ScrollToTop } from '@hua-labs/hua-ux';
import { HuaUxLayout, SkipToContent } from '@hua-labs/hua-ux/framework';
import { setConfig } from '@hua-labs/hua-ux/framework/config';
import { getSSRTranslations } from '@hua-labs/hua-ux/framework/server';
import Header from './components/Header';
import Footer from './components/Footer';
import huaUxConfig from '../../hua-ux.config';
import './globals.css';

// 설정 초기화 (서버 사이드)
setConfig(huaUxConfig);

export const metadata: Metadata = {
  title: {
    default: 'HUA UI - Component Library',
    template: '%s | HUA UI',
  },
  description: 'HUA Labs의 가볍고 스마트한 UI 컴포넌트 라이브러리',
  keywords: ['HUA UI', 'React', 'UI Components', 'Design System', 'Tailwind CSS'],
  authors: [{ name: 'HUA Labs' }],
  creator: 'HUA Labs',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SSR 번역 데이터 로드
  const initialTranslations = await getSSRTranslations(huaUxConfig, 'public/translations');

  // config에 initialTranslations 추가
  const configWithSSR: Partial<typeof huaUxConfig> = {
    ...huaUxConfig,
    i18n: huaUxConfig.i18n
      ? {
          ...huaUxConfig.i18n,
          initialTranslations,
        }
      : undefined,
  };

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Google Sans Flex - 영문 폰트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <ThemeProvider
          defaultTheme="system"
          storageKey="hua-ui-theme"
          enableSystem
          enableTransition
        >
          <HuaUxLayout config={configWithSSR}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-blue-900/20 dark:to-purple-900/20 relative overflow-hidden">
              {/* 배경 장식 */}
              <div className="absolute inset-0 opacity-50" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
              <div className="relative z-10">
                <SkipToContent targetId="main-content" className="sr-only" />
                <Header />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
              </div>
              <ScrollToTop
                variant="primary"
                size="md"
                threshold={300}
              />
            </div>
          </HuaUxLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
