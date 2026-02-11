/**
 * Home Page with GEO and SEO Metadata
 * 
 * GEO 및 SEO 메타데이터가 포함된 홈 페이지 예제
 * Example home page with GEO and SEO metadata
 * 
 * 사용 방법:
 * 1. Server Component로 page.tsx 생성
 * 2. Client Component로 page-content.tsx 생성
 * 3. 이 예제를 참고하여 구현
 */

// ============================================
// app/page.tsx (Server Component)
// ============================================
import { generatePageMetadata, generateGEOMetadata, renderJSONLD } from '@hua-labs/hua/framework';
import Script from 'next/script';
import { HomePageContent } from './page-content';

// 페이지별 GEO 메타데이터 생성
// Generate page-specific GEO metadata
const pageGeoMetadata = generateGEOMetadata({
  name: 'Home - My App',
  description: 'Welcome to My App - Built with hua framework',
  applicationCategory: 'WebApplication',
  keywords: ['home', 'welcome', 'nextjs', 'react'],
});

// Next.js Metadata 생성 (GEO와 통합)
// Generate Next.js Metadata (integrated with GEO)
export const metadata = generatePageMetadata({
  title: 'Home',
  description: pageGeoMetadata.meta.find((m) => m.name === 'description')?.content || 'Welcome',
  seo: {
    keywords: ['home', 'welcome'],
    ogImage: '/og-home.png',
  },
});

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script {...renderJSONLD(pageGeoMetadata.jsonLd[0])} />
      <HomePageContent />
    </>
  );
}

// ============================================
// app/page-content.tsx (Client Component)
// ============================================
'use client';

import { HuaPage } from "@hua-labs/hua/framework";
import { Button, Card } from "@hua-labs/hua/ui";
import { useTranslation } from '@hua-labs/hua/i18n';

export function HomePageContent() {
  const { t } = useTranslation('common');
  
  return (
    <HuaPage title={t('title')} description={t('welcome')}>
      <div className="min-h-screen flex items-center justify-center p-8">
        <Card className="max-w-2xl w-full">
          <div className="p-8 text-center space-y-6">
            <h1 className="text-4xl font-bold">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('welcome')}
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="default">{t('getStarted')}</Button>
              <Button variant="outline">{t('learnMore')}</Button>
            </div>
          </div>
        </Card>
      </div>
    </HuaPage>
  );
}
