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

/** 깊은 병합 (source가 target을 덮어씀) */
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    } else {
      target[key] = source[key];
    }
  }
}

/** 낮은 우선순위 깊은 병합 (target에 이미 있는 키는 덮어쓰지 않음) */
function deepMergeLowPriority(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    if (!(key in target)) {
      target[key] = source[key];
    } else if (
      source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) &&
      target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])
    ) {
      deepMergeLowPriority(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
    }
  }
}

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
    const langDir = path.join(translationsPath, lang);

    for (const namespace of namespaces) {
      try {
        // docs-* 개별 네임스페이스는 docs에 머지되므로 스킵
        if (namespace.includes('-') && namespaces.includes(namespace.split('-')[0])) {
          continue;
        }

        const filePath = path.join(translationsPath, lang, `${namespace}.json`);

        // {namespace}-*.json 머지 지원 (API 라우트와 동일한 동작)
        // 예: docs 네임스페이스 요청 시 docs-common.json, docs-core.json 등을 병합
        if (fs.existsSync(langDir)) {
          const prefixFiles = fs.readdirSync(langDir).filter(
            (f: string) => f.startsWith(`${namespace}-`) && f.endsWith('.json')
          );

          if (prefixFiles.length > 0) {
            const merged: Record<string, unknown> = {};

            // {namespace}-common.json 먼저 (기본 구조)
            const commonFile = `${namespace}-common.json`;
            const commonPath = path.join(langDir, commonFile);
            if (fs.existsSync(commonPath)) {
              deepMerge(merged, JSON.parse(fs.readFileSync(commonPath, 'utf-8')));
            }

            // 나머지 {namespace}-*.json 파일들
            for (const file of prefixFiles) {
              if (file === commonFile) continue;
              const subPath = path.join(langDir, file);
              try {
                deepMerge(merged, JSON.parse(fs.readFileSync(subPath, 'utf-8')));
              } catch {
                // 개별 파일 실패는 무시
              }
            }

            // 원본 {namespace}.json을 낮은 우선순위로 병합 (fallback)
            if (fs.existsSync(filePath)) {
              deepMergeLowPriority(merged, JSON.parse(fs.readFileSync(filePath, 'utf-8')));
            }

            initialTranslations[lang][namespace] = merged as Record<string, string>;
            continue;
          }
        }

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
