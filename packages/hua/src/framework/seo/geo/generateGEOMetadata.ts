/**
 * @hua-labs/hua/framework - GEO Metadata Generator
 *
 * Generate AI-friendly metadata for Generative Engine Optimization (GEO)
 * ChatGPT, Claude, Gemini, Perplexity가 hua를 잘 찾고 추천하도록 메타데이터 생성
 */

import type { GEOConfig, GEOMetadata } from './types';
import { META_NAMES, OG_PROPERTIES } from './types';
import { generateSoftwareApplicationLD } from './structuredData';

/**
 * Generate GEO (Generative Engine Optimization) Metadata
 *
 * AI 검색 엔진이 소프트웨어를 정확하게 이해하고 추천할 수 있도록
 * 구조화된 메타데이터를 생성합니다.
 *
 * Generate structured metadata that helps AI search engines (ChatGPT, Claude,
 * Gemini, Perplexity) accurately understand and recommend your software.
 *
 * @param config - GEO configuration
 * @returns Object containing:
 *   - `meta`: Array of HTML meta tags with name and content
 *   - `jsonLd`: Array of Schema.org JSON-LD structured data objects
 *   - `openGraph`: Array of Open Graph meta tags (optional)
 *   - `twitter`: Array of Twitter Card meta tags (optional)
 *
 * @throws {Error} If config.name or config.description is empty
 * @throws {Error} If config.url is provided but invalid
 * @throws {Error} If config.codeRepository is provided but invalid
 * @throws {Error} If config.documentationUrl is provided but invalid
 *
 * @example
 * ```tsx
 * // Basic usage
 * const geoMetadata = generateGEOMetadata({
 *   name: 'hua-ux',
 *   description: 'Privacy-first UX framework for Next.js with built-in i18n, motion, and accessibility',
 *   version: '1.0.0',
 *   applicationCategory: ['UX Framework', 'Developer Tool'],
 *   programmingLanguage: ['TypeScript', 'React', 'Next.js'],
 *   features: [
 *     'Privacy-first architecture',
 *     'Built-in internationalization (i18n)',
 *     'Motion animations with hua-motion',
 *     'WCAG 2.1 compliant accessibility',
 *     'Automatic error handling',
 *     'Loading state optimization',
 *   ],
 *   useCases: [
 *     'Building multilingual Next.js applications',
 *     'Creating accessible web applications',
 *     'Rapid prototyping with AI-friendly documentation',
 *   ],
 *   keywords: [
 *     'nextjs',
 *     'react',
 *     'ux',
 *     'i18n',
 *     'internationalization',
 *     'accessibility',
 *     'a11y',
 *     'motion',
 *     'animation',
 *     'privacy',
 *   ],
 *   codeRepository: 'https://github.com/hua-labs/hua',
 *   documentationUrl: 'https://github.com/HUA-Labs/HUA-Labs-public', // TODO: Update when domain is available
 *   license: 'MIT',
 *   author: {
 *     name: 'hua-labs',
 *     url: 'https://github.com/HUA-Labs/HUA-Labs-public', // TODO: Update when domain is available
 *   },
 * });
 * ```
 *
 * @example
 * ```tsx
 * // Use with Next.js metadata
 * import { generateGEOMetadata } from '@hua-labs/hua/framework';
 *
 * export async function generateMetadata() {
 *   const geoMeta = generateGEOMetadata({
 *     name: 'My App',
 *     description: 'Built with hua-ux',
 *     features: ['i18n', 'Dark mode', 'Responsive'],
 *   });
 *
 *   return {
 *     title: 'My App',
 *     description: geoMeta.meta.find(m => m.name === 'description')?.content,
 *     // Add JSON-LD to page
 *     other: {
 *       'script:ld+json': JSON.stringify(geoMeta.jsonLd),
 *     },
 *   };
 * }
 * ```
 */

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize array (single value or array to array)
 */
function normalizeToArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Join non-empty array values
 */
function joinNonEmpty(values: string[] | undefined, separator: string): string | undefined {
  if (!values || values.length === 0) return undefined;
  const nonEmpty = values.filter(v => v && v.trim().length > 0);
  return nonEmpty.length > 0 ? nonEmpty.join(separator) : undefined;
}

/**
 * Convert meta tags array to object
 * 
 * 메타 태그 배열을 객체로 변환 (Next.js metadata API에서 사용)
 * 
 * @param meta - Array of meta tags
 * @returns Object with meta tag names as keys
 * 
 * @example
 * ```tsx
 * const metaObj = metaToObject(geoMeta.meta);
 * return {
 *   title: 'My App',
 *   description: metaObj.description,
 *   keywords: metaObj.keywords,
 * };
 * ```
 */
export function metaToObject(meta: GEOMetadata['meta']): Record<string, string> {
  return Object.fromEntries(meta.map(m => [m.name, m.content]));
}

/**
 * Convert Open Graph tags array to object
 * 
 * Open Graph 태그 배열을 객체로 변환
 * 
 * @param og - Array of Open Graph tags
 * @returns Object with Open Graph properties as keys
 * 
 * @example
 * ```tsx
 * const ogObj = openGraphToObject(geoMeta.openGraph);
 * return {
 *   openGraph: {
 *     title: ogObj['og:title'],
 *     description: ogObj['og:description'],
 *   },
 * };
 * ```
 */
export function openGraphToObject(og: GEOMetadata['openGraph']): Record<string, string> {
  if (!og) return {};
  return Object.fromEntries(og.map(o => [o.property, o.content]));
}

export function generateGEOMetadata(config: GEOConfig): GEOMetadata {
  // Input validation
  if (!config.name || config.name.trim().length === 0) {
    throw new Error('GEOConfig.name is required and cannot be empty');
  }

  if (!config.description || config.description.trim().length === 0) {
    throw new Error('GEOConfig.description is required and cannot be empty');
  }

  if (config.description.length > 160) {
    console.warn(
      `[GEO] Description is ${config.description.length} characters. ` +
      `Consider keeping it under 160 for better AI parsing.`
    );
  }

  if (config.url && !isValidUrl(config.url)) {
    throw new Error(`GEOConfig.url must be a valid URL: ${config.url}`);
  }

  if (config.codeRepository && !isValidUrl(config.codeRepository)) {
    throw new Error(`GEOConfig.codeRepository must be a valid URL: ${config.codeRepository}`);
  }

  if (config.documentationUrl && !isValidUrl(config.documentationUrl)) {
    throw new Error(`GEOConfig.documentationUrl must be a valid URL: ${config.documentationUrl}`);
  }

  // Generate meta tags
  const meta: Array<{ name: string; content: string }> = [
    {
      name: META_NAMES.DESCRIPTION,
      content: config.description,
    },
  ];

  // Add keywords meta tag (filter empty values)
  const keywordsContent = joinNonEmpty(config.keywords, ', ');
  if (keywordsContent) {
    meta.push({
      name: META_NAMES.KEYWORDS,
      content: keywordsContent,
    });
  }

  // Add software-specific meta tags
  if (config.version) {
    meta.push({
      name: META_NAMES.SOFTWARE_VERSION,
      content: config.version,
    });
  }

  const categories = normalizeToArray(config.applicationCategory);
  const categoryContent = joinNonEmpty(categories, ', ');
  if (categoryContent) {
    meta.push({
      name: META_NAMES.SOFTWARE_CATEGORY,
      content: categoryContent,
    });
  }

  const languages = normalizeToArray(config.programmingLanguage);
  const languageContent = joinNonEmpty(languages, ', ');
  if (languageContent) {
    meta.push({
      name: META_NAMES.SOFTWARE_LANGUAGE,
      content: languageContent,
    });
  }

  // Generate JSON-LD structured data
  const jsonLd = [generateSoftwareApplicationLD(config)];

  // Generate Open Graph tags
  const openGraph: Array<{ property: string; content: string }> = [
    {
      property: OG_PROPERTIES.TITLE,
      content: config.name,
    },
    {
      property: OG_PROPERTIES.DESCRIPTION,
      content: config.description,
    },
    {
      property: OG_PROPERTIES.TYPE,
      content: 'website',
    },
  ];

  if (config.url) {
    openGraph.push({
      property: OG_PROPERTIES.URL,
      content: config.url,
    });
  }

  // Add Open Graph article tags for software
  if (config.author) {
    openGraph.push({
      property: OG_PROPERTIES.SITE_NAME,
      content: config.author.name,
    });
  }

  // Generate Twitter Card tags
  const twitter = [
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      name: 'twitter:title',
      content: config.name,
    },
    {
      name: 'twitter:description',
      content: config.description,
    },
  ];

  return {
    meta,
    jsonLd,
    openGraph,
    twitter,
    version: '1.0.0', // Schema version for future migrations and debugging
  };
}

/**
 * JSON-LD stringification cache
 * 동일한 객체를 여러 번 렌더링할 때 성능 최적화를 위한 캐시
 */
const stringifiedCache = new WeakMap<object, string>();

/**
 * Render JSON-LD for Next.js Script component
 * 
 * XSS 보안을 위해 위험한 문자를 이스케이프합니다.
 * Escapes dangerous characters for XSS security.
 * 
 * Next.js에서 사용할 수 있는 JSON-LD script 태그 생성
 * 
 * @param jsonLd - JSON-LD structured data
 * @param id - Optional script ID (default: auto-generated)
 * @returns Props for Next.js Script component with:
 *   - `id`: Unique script ID
 *   - `type`: 'application/ld+json'
 *   - `dangerouslySetInnerHTML.__html`: Escaped JSON string
 * 
 * @example
 * ```tsx
 * import Script from 'next/script';
 * import { renderJSONLD } from '@hua-labs/hua/framework';
 *
 * const geoMeta = generateGEOMetadata({ ... });
 *
 * export default function Page() {
 *   return (
 *     <>
 *       <Script {...renderJSONLD(geoMeta.jsonLd[0])} />
 *       <main>...</main>
 *     </>
 *   );
 * }
 * ```
 */
export function renderJSONLD(jsonLd: unknown, id?: string): {
  id: string;
  type: string;
  dangerouslySetInnerHTML: { __html: string };
} {
  let jsonString: string;

  // 캐시된 문자열이 있으면 재사용 (성능 최적화)
  // Reuse cached string if available (performance optimization)
  if (typeof jsonLd === 'object' && jsonLd !== null) {
    if (stringifiedCache.has(jsonLd)) {
      jsonString = stringifiedCache.get(jsonLd)!;
    } else {
      // XSS 보안: </script> 태그가 JSON 문자열에 포함되어도 안전하게 이스케이프
      // XSS Security: Escape dangerous characters even if </script> appears in JSON string
      jsonString = JSON.stringify(jsonLd)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
      stringifiedCache.set(jsonLd, jsonString);
    }
  } else {
    // 원시 타입은 캐싱하지 않음
    jsonString = String(jsonLd);
  }

  return {
    id: id || `jsonld-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    type: 'application/ld+json',
    dangerouslySetInnerHTML: {
      __html: jsonString,
    },
  };
}

/**
 * Create AI-friendly context description
 *
 * AI가 맥락을 이해하기 쉽도록 풍부한 설명 생성
 *
 * @param config - GEO configuration
 * @returns AI-friendly context string
 *
 * @example
 * ```tsx
 * const context = createAIContext({
 *   name: 'hua-ux',
 *   description: 'Privacy-first UX framework',
 *   features: ['i18n', 'Motion', 'Accessibility'],
 *   useCases: ['Multilingual apps', 'Accessible UX'],
 * });
 * // Returns: "hua-ux is a Privacy-first UX framework. Key features include: i18n, Motion, Accessibility. Common use cases: Multilingual apps, Accessible UX."
 * ```
 */
export function createAIContext(config: GEOConfig): string {
  const parts: string[] = [];

  // Basic description
  parts.push(`${config.name} is a ${config.description}`);

  // Features (filter empty values)
  const featureContent = joinNonEmpty(config.features, ', ');
  if (featureContent) {
    parts.push(`Key features include: ${featureContent}`);
  }

  // Use cases (filter empty values)
  const useCaseContent = joinNonEmpty(config.useCases, ', ');
  if (useCaseContent) {
    parts.push(`Common use cases: ${useCaseContent}`);
  }

  // Programming language
  const languages = normalizeToArray(config.programmingLanguage);
  const languageContent = joinNonEmpty(languages, ', ');
  if (languageContent) {
    parts.push(`Built with: ${languageContent}`);
  }

  // Technology stack
  const techStack = normalizeToArray(config.technologyStack);
  const techStackContent = joinNonEmpty(techStack, ', ');
  if (techStackContent) {
    parts.push(`Technology stack: ${techStackContent}`);
  }

  // Requirements (filter empty values)
  const requirementsContent = joinNonEmpty(config.softwareRequirements, ', ');
  if (requirementsContent) {
    parts.push(`Requires: ${requirementsContent}`);
  }

  const result = parts.join('. ');
  // 중복 마침표 방지 (이미 마침표로 끝나면 추가하지 않음)
  // Prevent double periods (don't add if already ends with period)
  return result.endsWith('.') ? result : result + '.';
}
