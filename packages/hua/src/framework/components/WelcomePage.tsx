/**
 * @hua-labs/hua/framework - WelcomePage
 *
 * Default welcome page component for new projects
 * Inspired by Next.js welcome page design
 * Features: Motion animations, i18n support, responsive design
 */

'use client';

import React from 'react';
import { HuaPage } from './HuaPage';
import { Card, Badge } from '@hua-labs/ui';
import { useTranslation } from '@hua-labs/i18n-core';
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core';
import type { HuaPageProps } from '../types';

export interface WelcomePageProps extends Omit<HuaPageProps, 'children'> {
  /**
   * Project name to display
   */
  projectName?: string;

  /**
   * Show framework features
   */
  showFeatures?: boolean;

  /**
   * Show quick links
   */
  showQuickLinks?: boolean;

  /**
   * Custom content to display
   */
  children?: React.ReactNode;
}

/**
 * WelcomePage Component
 *
 * Default welcome page for new hua projects.
 * Displays project information, framework features, and quick links.
 *
 * @example
 * ```tsx
 * // app/page.tsx
 * import { WelcomePage } from '@hua-labs/hua/framework';
 *
 * export default function HomePage() {
 *   return <WelcomePage projectName="My App" />;
 * }
 * ```
 */
export function WelcomePage({
  projectName = 'My App',
  showFeatures = true,
  showQuickLinks = true,
  children,
  ...pageProps
}: WelcomePageProps) {
  const { t, currentLanguage } = useTranslation();
  const isKo = currentLanguage === 'ko';

  // Motion animations
  const heroMotion = useFadeIn({ duration: 600 });
  const codeBlockMotion = useSlideUp({ duration: 500, delay: 200 });
  const footerMotion = useFadeIn({ duration: 500, delay: 400 });

  const features = [
    {
      title: isKo ? 'UI 컴포넌트' : 'UI Components',
      description: isKo ? '사전 구성된 컴포넌트' : 'Pre-built, accessible components',
      icon: '✨',
    },
    {
      title: isKo ? 'i18n 지원' : 'i18n Support',
      description: isKo ? '기본 제공 다국어 지원' : 'Multi-language support out of the box',
      icon: '🌐',
    },
    {
      title: isKo ? '모션' : 'Motion',
      description: isKo ? '부드러운 애니메이션' : 'Smooth animations and transitions',
      icon: '💫',
    },
    {
      title: isKo ? 'AI-First' : 'AI-First',
      description: isKo ? 'AI와 잘 맞는 프레임워크' : 'Built for vibe coding with AI',
      icon: '🤖',
    },
  ];

  const quickLinks = [
    {
      title: isKo ? '문서' : 'Docs',
      description: isKo ? 'hua 사용 방법 알아보기' : 'Learn how to use hua',
      href: 'https://hua-labs.com/docs',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
    },
    {
      title: isKo ? '샘플' : 'Templates',
      description: isKo ? '예제 템플릿으로 시작하기' : 'Start with example templates',
      href: 'https://github.com/HUA-Labs/HUA-UX-template',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      ),
    },
    {
      title: 'GitHub',
      description: isKo ? '소스 코드 보기 및 기여하기' : 'View source and contribute',
      href: 'https://github.com/HUA-Labs/HUA-Labs-public',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
  ];

  return (
    <HuaPage
      title={t('welcome.title' as any, 'Welcome')}
      description={t('welcome.description' as any, `Get started by editing app/page.tsx`)}
      vibe="clean"
      {...pageProps}
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-8 font-sans bg-background text-foreground">
        <main className="max-w-4xl w-full flex flex-col items-center gap-12">
          {/* Logo & Title */}
          <div
            ref={heroMotion.ref}
            style={heroMotion.style}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              {/* HUA Logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                H
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                {projectName}
              </h1>
              <Badge variant="secondary" className="text-xs font-mono">
                alpha
              </Badge>
            </div>
            <p className="text-muted-foreground text-center max-w-md">
              {isKo
                ? 'UI, 모션, i18n을 통합한 React UX 프레임워크로 빠르게 작업하세요'
                : 'Get started with a React UX framework that unifies UI, motion, and i18n'}
            </p>
          </div>

          {/* Get Started Code Block */}
          <div ref={codeBlockMotion.ref} style={codeBlockMotion.style} className="w-full max-w-xl">
            <div className="rounded-xl border border-border bg-secondary/30 p-1">
              <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-auto font-mono">app/page.tsx</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="text-muted-foreground">
                  <span className="text-purple-500">{'// '}</span>
                  {isKo ? '이 파일을 수정해서 시작하세요' : 'Edit this file to get started'}
                </div>
                <div className="mt-2">
                  <span className="text-pink-500">export default</span>
                  <span className="text-blue-500"> function</span>
                  <span className="text-yellow-500"> Page</span>
                  <span className="text-foreground">() {'{'}</span>
                </div>
                <div className="pl-4">
                  <span className="text-pink-500">return</span>
                  <span className="text-foreground"> {'<'}</span>
                  <span className="text-green-500">h1</span>
                  <span className="text-foreground">{'>'}Hello, World!{'</'}</span>
                  <span className="text-green-500">h1</span>
                  <span className="text-foreground">{'>'}</span>
                </div>
                <div className="text-foreground">{'}'}</div>
              </div>
            </div>
          </div>

          {/* Custom Content */}
          {children && (
            <div className="flex justify-center w-full">
              {children}
            </div>
          )}

          {/* Features Grid */}
          {showFeatures && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="p-4 text-center hover:bg-secondary/50 transition-colors cursor-default border-border animate-fadeIn"
                  style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Links */}
          {showQuickLinks && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              {quickLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group animate-slideUp"
                  style={{ animationDelay: `${500 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  <Card className="p-5 h-full hover:bg-secondary/50 transition-all hover:border-primary/50 border-border">
                    <div className="flex items-start gap-3">
                      <div className="text-muted-foreground group-hover:text-primary transition-colors">
                        {link.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm flex items-center gap-1">
                          {link.title}
                          <svg
                            className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {link.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          ref={footerMotion.ref}
          style={footerMotion.style}
          className="mt-16 flex flex-col items-center gap-4 text-xs text-muted-foreground"
        >
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="https://hua-labs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              HUA Labs
            </a>
            <span className="text-border">|</span>
            <a
              href="https://hua-labs.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {isKo ? '문서' : 'Docs'}
            </a>
            <span className="text-border">|</span>
            <a
              href="https://github.com/HUA-Labs"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <span className="text-border">|</span>
            <a
              href="mailto:hello@hua-labs.com"
              className="hover:text-foreground transition-colors"
            >
              hello@hua-labs.com
            </a>
          </div>
          <p>
            {isKo ? '사랑으로' : 'Built with'}{' '}
            <span className="font-mono text-foreground">@hua-labs/hua</span>
          </p>
        </footer>
      </div>
    </HuaPage>
  );
}
