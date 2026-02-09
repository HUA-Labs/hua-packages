/**
 * Root Layout with GEO (Generative Engine Optimization)
 * 
 * AI 검색 엔진 최적화를 위한 예제 레이아웃
 * Example layout with AI search engine optimization
 * 
 * 사용 방법:
 * 1. 이 파일을 app/layout.tsx로 복사
 * 2. GEO 설정을 프로젝트에 맞게 수정
 * 3. JSON-LD 스크립트를 추가하려면 Script 컴포넌트 import
 */

import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import "./globals.css";
import { HuaUxLayout } from "@hua-labs/hua/framework";
import { generateGEOMetadata, renderJSONLD } from "@hua-labs/hua/framework";

// GEO 메타데이터 생성
// Generate GEO metadata for AI search engines
const geoMetadata = generateGEOMetadata({
  name: 'My App',
  description: 'Built with hua framework - A modern UX framework for Next.js',
  version: '1.0.0',
  applicationCategory: ['UX Framework', 'Developer Tool'],
  programmingLanguage: ['TypeScript', 'React', 'Next.js'],
  features: [
    'Internationalization (i18n)',
    'Motion animations',
    'Accessibility (WCAG 2.1)',
    'Error handling',
    'Loading state optimization',
  ],
  useCases: [
    'Building multilingual Next.js applications',
    'Creating accessible web applications',
    'Rapid prototyping with AI-friendly documentation',
  ],
  keywords: [
    'nextjs',
    'react',
    'ux',
    'i18n',
    'internationalization',
    'accessibility',
    'a11y',
    'motion',
    'animation',
    'framework',
  ],
  codeRepository: 'https://github.com/your-org/your-app',
  documentationUrl: 'https://your-app.com/docs',
  license: 'MIT',
  author: {
    name: 'Your Organization',
    url: 'https://your-org.com',
  },
});

// Next.js Metadata와 GEO 통합
// Integrate GEO with Next.js Metadata
export const metadata: Metadata = {
  title: geoMetadata.meta.find((m) => m.name === 'description')?.content || 'My App',
  description: geoMetadata.meta.find((m) => m.name === 'description')?.content,
  keywords: geoMetadata.meta.find((m) => m.name === 'keywords')?.content?.split(', '),
  openGraph: {
    title: geoMetadata.openGraph?.find((og) => og.property === 'og:title')?.content,
    description: geoMetadata.openGraph?.find((og) => og.property === 'og:description')?.content,
    type: 'website',
  },
  twitter: {
    card: geoMetadata.twitter?.find((t) => t.name === 'twitter:card')?.content as 'summary_large_image',
    title: geoMetadata.twitter?.find((t) => t.name === 'twitter:title')?.content,
    description: geoMetadata.twitter?.find((t) => t.name === 'twitter:description')?.content,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 동적 언어 설정 (middleware에서 설정한 헤더 사용)
  // Dynamic language setting (use header set by middleware)
  const headersList = headers();
  const language = headersList.get('x-language') || 'ko'; // 기본값: 'ko'

  return (
    <html lang={language}>
      <head>
        {/* JSON-LD Structured Data for AI search engines */}
        {/* AI 검색 엔진을 위한 구조화된 데이터 */}
        {geoMetadata.jsonLd.map((jsonLd, index) => (
          <Script
            key={index}
            {...renderJSONLD(jsonLd)}
          />
        ))}
      </head>
      <body className="antialiased">
        <HuaUxLayout>{children}</HuaUxLayout>
      </body>
    </html>
  );
}
