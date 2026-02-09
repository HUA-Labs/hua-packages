/**
 * @hua-labs/hua/framework - Server Component Helpers for GEO
 *
 * Next.js 16 Server Component에 최적화된 GEO 헬퍼
 * GEO helpers optimized for Next.js 16 Server Components with async APIs
 *
 * Next.js 16에서는 params, searchParams, cookies, headers 등이 모두 async입니다.
 * In Next.js 16, params, searchParams, cookies, headers are all async.
 *
 * @example
 * ```tsx
 * // app/layout.tsx (Server Component)
 * import { generateGEOForMetadata } from '@hua-labs/hua/framework';
 *
 * export async function generateMetadata() {
 *   return generateGEOForMetadata({
 *     name: 'My App',
 *     description: 'Built with hua',
 *     features: ['i18n', 'Accessibility'],
 *   });
 * }
 * ```
 */

import type { Metadata } from 'next';
import type { GEOConfig, GEOMetadata } from './types';
import { generateGEOMetadata, metaToObject, openGraphToObject } from './generateGEOMetadata';

/**
 * Generate Next.js Metadata object from GEO config (Server Component only)
 *
 * Next.js Metadata API와 GEO를 통합하여 서버 컴포넌트에서 바로 사용 가능
 * Next.js 16에서는 generateMetadata가 async 함수여야 합니다.
 *
 * @param config - GEO configuration
 * @returns Next.js Metadata object
 *
 * @example
 * ```tsx
 * // app/layout.tsx (Next.js 16)
 * import { generateGEOForMetadata } from '@hua-labs/hua/framework';
 *
 * export async function generateMetadata() {
 *   return generateGEOForMetadata({
 *     name: 'hua',
 *     description: 'Privacy-first UX framework for Next.js',
 *     features: ['i18n', 'Motion', 'Accessibility'],
 *     keywords: ['nextjs', 'react', 'i18n'],
 *     codeRepository: 'https://github.com/hua-labs/hua',
 *     license: 'MIT',
 *   });
 * }
 * ```
 */
export function generateGEOForMetadata(config: GEOConfig): Metadata {
  const geoMeta = generateGEOMetadata(config);
  const metaObj = metaToObject(geoMeta.meta);
  const ogObj = openGraphToObject(geoMeta.openGraph);

  const metadata: Metadata = {
    title: config.name,
    description: metaObj.description,
    keywords: metaObj.keywords?.split(', '),
    openGraph: {
      title: ogObj['og:title'] || config.name,
      description: ogObj['og:description'] || metaObj.description,
      type: 'website',
      ...(ogObj['og:site_name'] && { siteName: ogObj['og:site_name'] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: config.name,
      description: metaObj.description,
    },
  };

  // Add optional metadata
  const other: Record<string, string> = {};
  if (config.version) other['software:version'] = config.version;
  if (metaObj['software:category']) other['software:category'] = metaObj['software:category'];
  if (metaObj['software:language']) other['software:language'] = metaObj['software:language'];

  if (Object.keys(other).length > 0) {
    metadata.other = other;
  }

  return metadata;
}

/**
 * Generate JSON-LD scripts for Server Component
 *
 * 서버 컴포넌트에서 JSON-LD script 태그를 쉽게 생성
 *
 * @param config - GEO configuration
 * @returns GEO metadata (use jsonLd array to render scripts)
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { generateGEOScripts, renderJSONLD } from '@hua-labs/hua/framework';
 * import Script from 'next/script';
 *
 * export default function RootLayout({ children }) {
 *   const geoMeta = generateGEOScripts({
 *     name: 'My App',
 *     description: 'Built with hua',
 *   });
 *
 *   return (
 *     <html>
 *       <head>
 *         {geoMeta.jsonLd.map((jsonLd, index) => (
 *           <Script key={index} {...renderJSONLD(jsonLd)} />
 *         ))}
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   );
 * }
 * ```
 */
export function generateGEOScripts(config: GEOConfig): GEOMetadata {
  return generateGEOMetadata(config);
}

/**
 * Get GEO metadata for use in Server Components
 *
 * 서버 컴포넌트에서 GEO 메타데이터 가져오기
 *
 * @param config - GEO configuration
 * @returns GEO metadata object
 *
 * @example
 * ```tsx
 * // app/page.tsx (Server Component)
 * import { getGEOMetadata } from '@hua-labs/hua/framework';
 *
 * export default function Page() {
 *   const geoMeta = getGEOMetadata({
 *     name: 'My Page',
 *     description: 'Page description',
 *   });
 *
 *   return (
 *     <div>
 *       <p>{geoMeta.meta.find(m => m.name === 'description')?.content}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function getGEOMetadata(config: GEOConfig): GEOMetadata {
  return generateGEOMetadata(config);
}

/**
 * Async version of generateGEOForMetadata (for dynamic data)
 *
 * 동적 데이터를 위한 비동기 버전 (데이터베이스, API 호출 등)
 *
 * @param configOrPromise - GEO config or Promise that resolves to GEO config
 * @returns Promise resolving to Next.js Metadata object
 *
 * @example
 * ```tsx
 * // app/[slug]/page.tsx
 * import { generateGEOForMetadataAsync } from '@hua-labs/hua/framework';
 *
 * export async function generateMetadata({ params }) {
 *   const data = await fetchPageData(params.slug);
 *
 *   return generateGEOForMetadataAsync({
 *     name: data.title,
 *     description: data.description,
 *     keywords: data.tags,
 *   });
 * }
 * ```
 */
export async function generateGEOForMetadataAsync(
  configOrPromise: GEOConfig | Promise<GEOConfig>
): Promise<Metadata> {
  const config = await Promise.resolve(configOrPromise);
  return generateGEOForMetadata(config);
}

/**
 * Combine multiple GEO configs (useful for merging app-level and page-level GEO)
 *
 * 여러 GEO 설정을 병합 (앱 레벨 + 페이지 레벨 GEO 병합에 유용)
 *
 * @param baseConfig - Base GEO config (app-level)
 * @param pageConfig - Page-specific GEO config
 * @returns Merged GEO config
 *
 * @example
 * ```tsx
 * // app/blog/[slug]/page.tsx
 * import { combineGEOConfigs, generateGEOForMetadata } from '@hua-labs/hua/framework';
 *
 * const appGEO = {
 *   name: 'My App',
 *   description: 'App description',
 *   author: { name: 'My Org' },
 * };
 *
 * export async function generateMetadata({ params }) {
 *   const post = await getPost(params.slug);
 *
 *   const mergedConfig = combineGEOConfigs(appGEO, {
 *     name: post.title,
 *     description: post.excerpt,
 *     keywords: post.tags,
 *   });
 *
 *   return generateGEOForMetadata(mergedConfig);
 * }
 * ```
 */
export function combineGEOConfigs(baseConfig: GEOConfig, pageConfig: Partial<GEOConfig>): GEOConfig {
  return {
    ...baseConfig,
    ...pageConfig,
    // Merge arrays
    keywords: [
      ...(baseConfig.keywords || []),
      ...(pageConfig.keywords || []),
    ].filter(Boolean),
    features: [
      ...(baseConfig.features || []),
      ...(pageConfig.features || []),
    ].filter(Boolean),
    useCases: [
      ...(baseConfig.useCases || []),
      ...(pageConfig.useCases || []),
    ].filter(Boolean),
  };
}

/**
 * Create GEO config from environment variables (for dynamic deployment)
 *
 * 환경 변수에서 GEO 설정 생성 (동적 배포를 위한)
 *
 * @param fallbackConfig - Fallback config if env vars are not set
 * @returns GEO config
 *
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { createGEOFromEnv, generateGEOForMetadata } from '@hua-labs/hua/framework';
 *
 * const geoConfig = createGEOFromEnv({
 *   name: 'Default App Name',
 *   description: 'Default description',
 * });
 *
 * export const metadata = generateGEOForMetadata(geoConfig);
 * ```
 *
 * .env:
 * ```
 * NEXT_PUBLIC_APP_NAME=My App
 * NEXT_PUBLIC_APP_DESCRIPTION=My app description
 * NEXT_PUBLIC_APP_VERSION=1.0.0
 * NEXT_PUBLIC_REPO_URL=https://github.com/user/repo
 * ```
 */
export function createGEOFromEnv(fallbackConfig: GEOConfig): GEOConfig {
  return {
    ...fallbackConfig,
    name: process.env.NEXT_PUBLIC_APP_NAME || fallbackConfig.name,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || fallbackConfig.description,
    version: process.env.NEXT_PUBLIC_APP_VERSION || fallbackConfig.version,
    url: process.env.NEXT_PUBLIC_APP_URL || fallbackConfig.url,
    codeRepository: process.env.NEXT_PUBLIC_REPO_URL || fallbackConfig.codeRepository,
    documentationUrl: process.env.NEXT_PUBLIC_DOCS_URL || fallbackConfig.documentationUrl,
  };
}
