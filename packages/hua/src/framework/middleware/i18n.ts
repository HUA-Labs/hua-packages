/**
 * @hua-labs/hua/framework - i18n Middleware
 * 
 * i18n middleware for automatic language detection and routing
 * 
 * **타입 안전성**: Next.js를 peerDependency로 사용하므로,
 * Next.js 프로젝트에서는 자동으로 타입이 추론됩니다.
 * 
 * **Type Safety**: Next.js is used as a peerDependency,
 * so types are automatically inferred in Next.js projects.
 */

// Next.js types - 조건부 import로 타입 안전성 향상
// Next.js types - Improved type safety with conditional import

/**
 * Base interface for NextRequest (when Next.js is not available)
 */
interface BaseNextRequest {
  headers: {
    get(name: string): string | null;
  };
  cookies: {
    get(name: string): { value: string } | undefined;
  };
  nextUrl: {
    pathname: string;
    searchParams: URLSearchParams;
  };
}

/**
 * NextRequest type - Next.js가 있으면 실제 타입, 없으면 기본 인터페이스
 * 
 * Next.js가 optional peerDependency이므로, 타입 레벨에서만 처리합니다.
 * 실제 Next.js 프로젝트에서는 Next.js의 NextRequest 타입이 자동으로 사용됩니다.
 */
type NextRequest = BaseNextRequest;

/**
 * Base interface for NextResponse (when Next.js is not available)
 */
interface BaseNextResponse {
  headers: Headers;
  next?(): BaseNextResponse;
  redirect?(url: string): BaseNextResponse;
}

/**
 * NextResponse factory function
 * Next.js가 설치되어 있으면 실제 NextResponse를 사용하고, 없으면 폴백 구현을 사용합니다.
 */
let NextResponseFactory: {
  next(): BaseNextResponse;
  redirect(url: string): BaseNextResponse;
};

try {
  // Next.js가 설치되어 있으면 실제 NextResponse 사용
  const nextServer = require('next/server');
  NextResponseFactory = nextServer.NextResponse;
} catch {
  // Next.js가 없으면 폴백 구현
  // Fallback implementation if Next.js is not available
  NextResponseFactory = {
    next: () => ({
      headers: new Headers(),
    } as BaseNextResponse),
    redirect: (url: string) => ({
      headers: new Headers(),
    } as BaseNextResponse),
  };
}

/**
 * i18n middleware configuration
 */
export interface I18nMiddlewareConfig {
  /**
   * Default language
   */
  defaultLanguage: string;
  
  /**
   * Supported languages
   */
  supportedLanguages: string[];
  
  /**
   * Language detection strategy
   */
  detectionStrategy?: 'header' | 'cookie' | 'path' | 'query';
}

/**
 * Create i18n middleware for Next.js
 * 
 * **⚠️ Edge Runtime Note**: This middleware runs on Edge Runtime.
 * Make sure your middleware.ts file exports the runtime config:
 * 
 * ```ts
 * export const runtime = 'edge';
 * ```
 * 
 * @example
 * ```ts
 * // middleware.ts
 * import { createI18nMiddleware } from '@hua-labs/hua/framework';
 * 
 * // Edge Runtime 명시 (Vercel 자동 감지 방지)
 * export const runtime = 'edge';
 * 
 * export default createI18nMiddleware({
 *   defaultLanguage: 'ko',
 *   supportedLanguages: ['ko', 'en'],
 * });
 * ```
 * 
 * **Alternative**: If you don't want to use Edge Runtime, you can handle
 * language detection in your API routes or client components instead.
 */
export function createI18nMiddleware(config: I18nMiddlewareConfig) {
  return function i18nMiddleware(request: NextRequest) {
    const { defaultLanguage, supportedLanguages, detectionStrategy = 'header' } = config;
    
    // Get language from various sources
    let language = defaultLanguage;
    
    if (detectionStrategy === 'header') {
      const acceptLanguage = request.headers.get('accept-language');
      if (acceptLanguage) {
        // Simple language detection from Accept-Language header
        const preferredLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase();
        if (supportedLanguages.includes(preferredLang)) {
          language = preferredLang;
        }
      }
    } else if (detectionStrategy === 'cookie') {
      const cookieLang = request.cookies.get('language')?.value;
      if (cookieLang && supportedLanguages.includes(cookieLang)) {
        language = cookieLang;
      }
    } else if (detectionStrategy === 'path') {
      const pathLang = request.nextUrl.pathname.split('/')[1];
      if (pathLang && supportedLanguages.includes(pathLang)) {
        language = pathLang;
      }
    } else if (detectionStrategy === 'query') {
      const queryLang = request.nextUrl.searchParams.get('lang');
      if (queryLang && supportedLanguages.includes(queryLang)) {
        language = queryLang;
      }
    }
    
    // Add language to request headers for use in components
    const response = NextResponseFactory.next();
    response.headers.set('x-language', language);
    
    return response;
  };
}
