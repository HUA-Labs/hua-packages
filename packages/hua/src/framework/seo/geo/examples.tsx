/**
 * @hua-labs/hua/framework - GEO Usage Examples
 *
 * Examples of using GEO (Generative Engine Optimization) to make your
 * application discoverable by AI search engines
 *
 * AI 검색 엔진이 애플리케이션을 잘 찾고 추천하도록 GEO 사용 예시
 *
 * These examples demonstrate various use cases including:
 * - Basic GEO configuration
 * - Using presets
 * - Error handling
 * - Dynamic content
 * - Minimal configuration
 */

import Script from 'next/script';
import { generateGEOMetadata, renderJSONLD, createAIContext } from './generateGEOMetadata';
import { generateFAQPageLD, generateHowToLD } from './structuredData';

/**
 * Example 1: Basic GEO for a software project
 *
 * AI 검색 엔진이 소프트웨어 프로젝트를 정확하게 이해하도록 기본 GEO 메타데이터 생성
 */
export function Example1_BasicGEO() {
  const geoMetadata = generateGEOMetadata({
    name: 'hua',
    alternateName: ['@hua-labs/hua', 'HUA Framework'],
    description:
      'Privacy-first UX framework for Next.js with built-in i18n, motion, and accessibility',
    version: '1.0.0',
    applicationCategory: ['UX Framework', 'Developer Tool'],
    programmingLanguage: ['TypeScript', 'React', 'Next.js'],
    applicationType: 'DeveloperApplication',
    url: 'https://github.com/HUA-Labs/HUA-Labs-public', // TODO: Update when domain is available
    documentationUrl: 'https://github.com/HUA-Labs/HUA-Labs-public', // TODO: Update when domain is available
    codeRepository: 'https://github.com/HUA-Labs/HUA-Labs-public',
    license: 'MIT',
    author: {
      name: 'hua-labs',
      url: 'https://github.com/HUA-Labs/HUA-Labs-public', // TODO: Update when domain is available
    },
    features: [
      'Privacy-first architecture (no tracking, no analytics by default)',
      'Built-in internationalization (i18n) with hua-i18n',
      'Smooth motion animations with hua-motion',
      'WCAG 2.1 compliant accessibility features',
      'Automatic error handling with ErrorBoundary',
      'Loading state optimization (300ms flicker prevention)',
      'AI-friendly documentation (Korean/English bilingual)',
    ],
    useCases: [
      'Building multilingual Next.js applications',
      'Creating accessible web applications',
      'Rapid prototyping with privacy-first defaults',
      'Enterprise applications requiring WCAG compliance',
    ],
    keywords: [
      'nextjs',
      'react',
      'ux framework',
      'i18n',
      'internationalization',
      'accessibility',
      'a11y',
      'wcag',
      'motion',
      'animation',
      'privacy',
      'gdpr',
      'typescript',
    ],
    softwareRequirements: ['Next.js 14+', 'React 18+', 'TypeScript 5+'],
    operatingSystem: ['Windows', 'macOS', 'Linux'],
    relatedTo: [
      'Next.js',
      'React',
      'hua-i18n',
      'hua-motion',
      'hua-state',
      'Tailwind CSS',
    ],
  });

  return (
    <head>
      {/* Meta tags */}
      {geoMetadata.meta.map((meta) => (
        <meta key={meta.name} name={meta.name} content={meta.content} />
      ))}

      {/* Open Graph tags */}
      {geoMetadata.openGraph?.map((og) => (
        <meta key={og.property} property={og.property} content={og.content} />
      ))}

      {/* Twitter Card tags */}
      {geoMetadata.twitter?.map((tw) => (
        <meta key={tw.name} name={tw.name} content={tw.content} />
      ))}

      {/* JSON-LD structured data */}
      {geoMetadata.jsonLd.map((ld, index) => (
        <Script key={index} {...renderJSONLD(ld)} />
      ))}
    </head>
  );
}

/**
 * Example 2: Next.js App Router metadata
 *
 * Next.js App Router의 generateMetadata()와 함께 사용
 */
export async function Example2_NextjsMetadata() {
  const geoMeta = generateGEOMetadata({
    name: 'My App',
    description: 'Built with hua for privacy-first UX',
    features: ['i18n', 'Dark mode', 'Responsive design'],
    keywords: ['nextjs', 'react', 'privacy', 'accessibility'],
  });

  // Next.js Metadata 객체로 변환
  return {
    title: 'My App',
    description: geoMeta.meta.find((m) => m.name === 'description')?.content,
    keywords: geoMeta.meta.find((m) => m.name === 'keywords')?.content,
    openGraph: {
      title: geoMeta.openGraph?.find((og) => og.property === 'og:title')?.content,
      description: geoMeta.openGraph?.find((og) => og.property === 'og:description')
        ?.content,
    },
    // JSON-LD는 layout.tsx나 page.tsx에서 Script 컴포넌트로 추가
    other: {
      'script:ld+json': JSON.stringify(geoMeta.jsonLd),
    },
  };
}

/**
 * Example 3: FAQ Page with structured data
 *
 * AI가 자주 묻는 질문에 답변할 수 있도록 FAQ 구조화된 데이터 추가
 */
export function Example3_FAQPage() {
  const faqLd = generateFAQPageLD([
    {
      question: 'What is hua?',
      answer:
        'hua is a privacy-first UX framework for Next.js applications. It provides built-in internationalization (i18n), motion animations, accessibility features (WCAG 2.1 compliant), automatic error handling, and loading state optimization.',
    },
    {
      question: 'How do I install hua?',
      answer:
        'You can create a new hua project using the CLI: npx create-hua my-app. Or install it in an existing Next.js project: pnpm add @hua-labs/hua',
    },
    {
      question: 'Is hua free to use?',
      answer:
        'Yes, hua is open-source and available under the MIT license. You can use it freely in both personal and commercial projects.',
    },
    {
      question: 'What makes hua privacy-first?',
      answer:
        'hua has no tracking, no analytics, and no data collection by default. It respects user privacy and follows GDPR/CCPA principles. You have full control over what data your application collects.',
    },
    {
      question: 'Does hua support TypeScript?',
      answer:
        'Yes, hua is written in TypeScript and provides full type safety. All components, hooks, and utilities come with TypeScript definitions.',
    },
  ]);

  return (
    <head>
      <Script {...renderJSONLD(faqLd)} />
    </head>
  );
}

/**
 * Example 4: HowTo Guide with structured data
 *
 * AI가 튜토리얼을 이해하고 추천할 수 있도록 HowTo 구조화된 데이터 추가
 */
export function Example4_HowToGuide() {
  const howToLd = generateHowToLD({
    name: 'How to add internationalization (i18n) to your Next.js app with hua',
    description:
      'Step-by-step guide to implementing multilingual support in your Next.js application using hua',
    totalTime: 'PT10M', // 10 minutes
    steps: [
      {
        name: 'Create a new hua project',
        text: 'Run the CLI command: npx create-hua my-app. This creates a new Next.js project with hua pre-configured.',
      },
      {
        name: 'Configure supported locales',
        text: 'Edit hua.config.ts and add your locales to the i18n.locales array. For example: locales: ["en", "ko", "ja"]',
      },
      {
        name: 'Create translation files',
        text: 'Add JSON translation files in the messages/ directory. Create one file per locale: messages/en.json, messages/ko.json, etc.',
      },
      {
        name: 'Use translations in components',
        text: 'Import useI18n hook and use the t() function to translate text: const { t } = useI18n(); return <h1>{t("welcome")}</h1>',
      },
      {
        name: 'Add language switcher',
        text: 'Use the LocaleSwitcher component to let users change languages: <LocaleSwitcher />',
      },
    ],
  });

  return (
    <head>
      <Script {...renderJSONLD(howToLd)} />
    </head>
  );
}

/**
 * Example 5: AI Context for Chatbots
 *
 * ChatGPT, Claude 같은 AI 챗봇이 맥락을 이해하기 쉬운 설명 생성
 */
export function Example5_AIContext() {
  const context = createAIContext({
    name: 'hua',
    description: 'Privacy-first UX framework for Next.js',
    features: [
      'Internationalization (i18n)',
      'Motion animations',
      'WCAG 2.1 accessibility',
      'Error boundaries',
      'Loading state optimization',
    ],
    useCases: [
      'Multilingual web applications',
      'Accessible enterprise applications',
      'Privacy-compliant consumer apps',
    ],
    programmingLanguage: ['TypeScript', 'React', 'Next.js'],
    softwareRequirements: ['Next.js 14+', 'React 18+'],
  });

  // Returns:
  // "hua is a Privacy-first UX framework for Next.js. Key features include:
  // Internationalization (i18n), Motion animations, WCAG 2.1 accessibility, Error
  // boundaries, Loading state optimization. Common use cases: Multilingual web
  // applications, Accessible enterprise applications, Privacy-compliant consumer
  // apps. Built with: TypeScript, React, Next.js. Requires: Next.js 14+, React 18+."

  return (
    <head>
      <meta name="ai:context" content={context} />
    </head>
  );
}

/**
 * Example 6: Complete landing page with full GEO
 *
 * 모든 GEO 기능을 사용한 완전한 랜딩 페이지 예시
 */
export function Example6_CompleteLandingPage() {
  // Software metadata
  const geoMeta = generateGEOMetadata({
    name: 'hua',
    description: 'Privacy-first UX framework for Next.js',
    version: '1.0.0',
    applicationCategory: 'UX Framework',
    programmingLanguage: 'TypeScript',
    features: ['i18n', 'Motion', 'Accessibility', 'Error handling', 'Loading optimization'],
    keywords: ['nextjs', 'react', 'ux', 'i18n', 'accessibility', 'privacy'],
    codeRepository: 'https://github.com/hua-labs/hua',
    license: 'MIT',
  });

  // FAQ structured data
  const faqLd = generateFAQPageLD([
    { question: 'What is hua?', answer: 'Privacy-first UX framework for Next.js' },
    { question: 'How to install?', answer: 'npx create-hua my-app' },
  ]);

  // HowTo guide
  const howToLd = generateHowToLD({
    name: 'Getting started with hua',
    steps: [
      { name: 'Install', text: 'npx create-hua my-app' },
      { name: 'Configure', text: 'Edit hua.config.ts' },
      { name: 'Build', text: 'pnpm dev' },
    ],
  });

  // AI context
  const aiContext = createAIContext({
    name: 'hua',
    description: 'Privacy-first UX framework',
    features: ['i18n', 'Motion', 'Accessibility'],
  });

  return (
    <html>
      <head>
        {/* Basic metadata */}
        {geoMeta.meta.map((meta) => (
          <meta key={meta.name} name={meta.name} content={meta.content} />
        ))}

        {/* Open Graph */}
        {geoMeta.openGraph?.map((og) => (
          <meta key={og.property} property={og.property} content={og.content} />
        ))}

        {/* Twitter Card */}
        {geoMeta.twitter?.map((tw) => (
          <meta key={tw.name} name={tw.name} content={tw.content} />
        ))}

        {/* AI context */}
        <meta name="ai:context" content={aiContext} />

        {/* Structured data */}
        <Script {...renderJSONLD(geoMeta.jsonLd[0])} />
        <Script {...renderJSONLD(faqLd)} />
        <Script {...renderJSONLD(howToLd)} />
      </head>
      <body>{/* Your content */}</body>
    </html>
  );
}

/**
 * Example 7: Minimal Configuration
 * 
 * 최소한의 설정으로 GEO 메타데이터 생성
 * Shows minimum required fields
 */
export function Example7_MinimalConfig() {
  const geoMeta = generateGEOMetadata({
    name: 'My App',
    description: 'A simple app',
  });

  return (
    <>
      <Script {...renderJSONLD(geoMeta.jsonLd[0])} />
      <main>
        <h1>Minimal GEO Configuration</h1>
        <p>Only name and description are required.</p>
      </main>
    </>
  );
}

/**
 * Example 8: Error Handling
 * 
 * 에러 처리 예제
 * Shows how to handle validation errors
 */
export function Example8_ErrorHandling() {
  try {
    const geoMeta = generateGEOMetadata({
      name: '', // Invalid!
      description: 'Test',
    });
    return <div>Success</div>;
  } catch (error) {
    console.error('GEO metadata generation failed:', error);
    return (
      <div>
        <h1>Error</h1>
        <p>{(error as Error).message}</p>
      </div>
    );
  }
}

/**
 * Example 9: Dynamic Content
 * 
 * 동적 콘텐츠를 사용한 GEO 메타데이터 생성
 * Shows how to use dynamic data
 */
export function Example9_DynamicContent({
  title,
  features,
}: {
  title: string;
  features: string[];
}) {
  const geoMeta = generateGEOMetadata({
    name: title,
    description: `App with ${features.length} features`,
    features,
  });

  return (
    <>
      <Script {...renderJSONLD(geoMeta.jsonLd[0])} />
      <main>
        <h1>{title}</h1>
        <ul>
          {features.map((feature, i) => (
            <li key={i}>{feature}</li>
          ))}
        </ul>
      </main>
    </>
  );
}
