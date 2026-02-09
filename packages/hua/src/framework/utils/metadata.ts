/**
 * @hua-labs/hua/framework - Metadata Utilities
 * 
 * Next.js Metadata 생성 유틸리티 (Next.js 없이도 사용 가능)
 * 
 * Next.js가 설치되어 있으면 Next.js Metadata 타입을 사용하고,
 * 없으면 일반 메타데이터 객체 타입을 사용합니다.
 * 
 * Works with or without Next.js:
 * - With Next.js: Returns Next.js Metadata type
 * - Without Next.js: Returns generic metadata object type
 */

// Next.js Metadata 타입 - 조건부 타입으로 타입 안전성 향상
// Next.js Metadata type - Improved type safety with conditional type
type MetadataType = 
  // Next.js가 설치되어 있으면 실제 Metadata 타입 사용
  // Use actual Metadata type if Next.js is installed
  typeof import('next') extends { Metadata: infer T } ? T
  // 없으면 일반 메타데이터 객체 타입 사용
  // Use generic metadata object type if not installed
  : {
      title?: string;
      description?: string;
      keywords?: string[];
      openGraph?: {
        title?: string;
        description?: string;
        type?: 'website' | 'article' | 'product';
        images?: Array<{ url: string }>;
      };
      twitter?: {
        card?: 'summary' | 'summary_large_image';
        title?: string;
        description?: string;
        images?: string[];
      };
    };

/**
 * SEO 설정 타입
 */
export interface SEOConfig {
  keywords?: string[];
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'product';
}

/**
 * 페이지 메타데이터 생성
 * 
 * Next.js App Router의 `export const metadata`에서 사용할 수 있는 메타데이터를 생성합니다.
 * CRA/Vite 등 일반 React 앱에서도 사용 가능합니다 (React Helmet 등과 함께).
 * 
 * Generates metadata that can be used in Next.js App Router's `export const metadata`.
 * Also works in plain React apps (CRA/Vite) with React Helmet, etc.
 * 
 * @param options - 메타데이터 옵션
 * @param options.title - 페이지 제목
 * @param options.description - 페이지 설명
 * @param options.seo - SEO 설정 (선택적)
 * @returns Next.js Metadata 객체 (Next.js가 있으면) 또는 일반 메타데이터 객체 (없으면)
 * 
 * @example
 * ```tsx
 * // Next.js App Router
 * // app/page.tsx
 * import { generatePageMetadata } from '@hua-labs/hua/framework';
 * 
 * export const metadata = generatePageMetadata({
 *   title: '홈',
 *   description: '환영합니다',
 *   seo: {
 *     keywords: ['키워드1', '키워드2'],
 *     ogImage: '/og-image.png',
 *   },
 * });
 * 
 * export default function HomePage() {
 *   return <div>...</div>;
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // CRA/Vite (React Helmet 사용)
 * import { Helmet } from 'react-helmet-async';
 * import { generatePageMetadata } from '@hua-labs/hua/framework';
 * 
 * export default function HomePage() {
 *   const metadata = generatePageMetadata({
 *     title: 'Home',
 *     description: 'Welcome',
 *   });
 * 
 *   return (
 *     <>
 *       <Helmet>
 *         <title>{metadata.title}</title>
 *         <meta name="description" content={metadata.description} />
 *       </Helmet>
 *       <div>...</div>
 *     </>
 *   );
 * }
 * ```
 */
export function generatePageMetadata(options: {
  title: string;
  description?: string;
  seo?: SEOConfig;
}): MetadataType {
  const { title, description, seo } = options;

  // 메타데이터 객체 직접 구성 (타입 안전하게)
  // Build metadata object directly (type-safe)
  const metadata: Record<string, unknown> = {
    title,
    description,
  };

  // Keywords 추가
  if (seo?.keywords && seo.keywords.length > 0) {
    metadata.keywords = seo.keywords;
  }

  // Open Graph 메타데이터
  if (seo?.ogImage || seo?.ogTitle || seo?.ogDescription || seo?.ogType) {
    metadata.openGraph = {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      type: seo.ogType || 'website',
      ...(seo.ogImage && { images: [{ url: seo.ogImage }] }),
    };
  }

  // Twitter Card 메타데이터 (Open Graph가 있으면 자동으로 사용)
  if (seo?.ogImage) {
    metadata.twitter = {
      card: 'summary_large_image',
      ...(seo.ogTitle && { title: seo.ogTitle }),
      ...(seo.ogDescription && { description: seo.ogDescription }),
      ...(seo.ogImage && { images: [seo.ogImage] }),
    };
  }

  // MetadataType으로 타입 단언 (조건부 타입이 컴파일 타임에 올바르게 추론됨)
  // Type assertion to MetadataType (conditional type is correctly inferred at compile time)
  return metadata as MetadataType;
}
