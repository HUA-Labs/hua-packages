/**
 * @hua-labs/hua/framework - SSR Translations Utils
 * 
 * 서버 사이드에서 번역 파일을 로드하는 유틸리티 함수
 * Next.js App Router의 서버 컴포넌트에서만 사용 가능합니다.
 * 
 * @example
 * ```tsx
 * // app/layout.tsx
 * import { getSSRTranslations } from '@hua-labs/hua/framework/server';
 * import huaConfig from '../hua.config';
 * 
 * export default async function RootLayout({ children }) {
 *   const initialTranslations = await getSSRTranslations(huaUxConfig);
 *   
 *   return (
 *     <html>
 *       <body>
 *         <HuaProvider config={{ i18n: { initialTranslations } }}>
 *           {children}
 *         </HuaProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

// 서버 전용 모듈임을 명시 (클라이언트 번들에서 제외)
import 'server-only';

import fs from 'fs';
import path from 'path';
import type { HuaConfig } from '../types';
import { createLogger } from '../../utils/logger';

const log = createLogger('hua:i18n:ssr');

/**
 * SSR 번역 데이터 로드
 * 
 * 서버 사이드에서 모든 지원 언어와 네임스페이스의 번역 파일을 로드합니다.
 * 
 * @param config - HuaConfig 객체 (i18n 설정 포함)
 * @param translationsDir - 번역 파일 디렉토리 경로 (기본값: 'translations')
 * @returns 초기 번역 데이터 객체
 */
export async function getSSRTranslations(
  config: HuaConfig,
  translationsDir: string = 'translations'
): Promise<Record<string, Record<string, Record<string, string>>>> {
  if (!config.i18n) {
    return {};
  }

  const namespaces = config.i18n.namespaces || ['common'];
  const languages = config.i18n.supportedLanguages || ['ko'];
  
  // HuaConfig의 supportedLanguages는 string[]이므로 그대로 사용
  const languageCodes: string[] = languages;

  const initialTranslations: Record<
    string,
    Record<string, Record<string, string>>
  > = {};

  // 번역 파일 디렉토리 경로 (프로젝트 루트 기준)
  const translationsPath = path.join(process.cwd(), translationsDir);

  // 각 언어와 네임스페이스에 대해 번역 데이터 로드
  for (const lang of languageCodes) {
    initialTranslations[lang] = {};
    
    for (const namespace of namespaces) {
      try {
        const filePath = path.join(translationsPath, lang, `${namespace}.json`);
        
        if (!fs.existsSync(filePath)) {
          // fallback 언어 시도
          const fallbackPath = path.join(translationsPath, 'ko', `${namespace}.json`);
          if (fs.existsSync(fallbackPath)) {
            const data = JSON.parse(fs.readFileSync(fallbackPath, 'utf-8'));
            initialTranslations[lang][namespace] = data as Record<string, string>;
            continue;
          }
          
          // 파일이 없으면 빈 객체
          initialTranslations[lang][namespace] = {};
          continue;
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        initialTranslations[lang][namespace] = data as Record<string, string>;
      } catch (error) {
        // 에러 발생 시 빈 객체 (개발 환경에서만 경고)
        if (process.env.NODE_ENV === 'development') {
          log.warn('Failed to load SSR translation', { lang, namespace, error: String(error) });
        }
        initialTranslations[lang][namespace] = {};
      }
    }
  }

  return initialTranslations;
}
