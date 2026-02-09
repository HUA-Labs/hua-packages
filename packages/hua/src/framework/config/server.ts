/**
 * @hua-labs/hua/framework - Config System (Server-only)
 *
 * Server-only configuration loading.
 * fs 모듈을 사용하므로 서버 환경에서만 사용 가능합니다.
 *
 * ⚠️ 이 파일은 절대 클라이언트 번들에 포함되면 안 됩니다.
 * 반드시 서버 컴포넌트나 API 라우트에서만 import 하세요.
 */

import type { HuaConfig } from '../types';
import { validateConfig } from './schema';
import { mergePresetWithConfig, createConfigFromUserConfig } from './merge';
import { _getCachedConfig, _setCachedConfig } from './client';

/**
 * Load configuration from file
 *
 * 동적으로 설정 파일을 로드합니다.
 *
 * **로드 순서**:
 * 1. `hua.config.ts` 시도 (TypeScript)
 * 2. `hua.config.js` 시도 (JavaScript)
 * 3. 없으면 기본값 (product preset)
 *
 * **Zero-Config**: 설정 파일이 없어도 기본값으로 동작합니다.
 *
 * **주의사항**:
 * - 이 함수는 Node.js 환경(빌드 타임)에서만 동작합니다.
 * - 런타임에서는 캐시된 설정을 사용합니다.
 * - **권장**: 설정 파일을 명시적으로 import하여 타입 안전성을 보장하세요.
 *   ```ts
 *   // hua.config.ts
 *   import { defineConfig } from '@hua-labs/hua/framework';
 *   export default defineConfig({ preset: 'product' });
 *
 *   // app/layout.tsx 또는 다른 서버 컴포넌트에서
 *   import config from '../hua.config';
 *   import { setConfig } from '@hua-labs/hua/framework';
 *   setConfig(config);
 *   ```
 *
 * **Fallback 용도**: 이 함수는 설정 파일이 명시적으로 import되지 않은 경우에만 사용됩니다.
 * 프로덕션 환경에서는 설정 파일을 명시적으로 import하는 것을 권장합니다.
 */
export function loadConfig(): HuaConfig {
  const cachedConfig = _getCachedConfig();
  if (cachedConfig) {
    return cachedConfig;
  }

  // Node.js 환경에서만 동적 로드 시도 (서버 사이드에서만)
  // 클라이언트에서는 기본 설정 반환
  if (typeof window !== 'undefined') {
    // 브라우저 환경: 기본 설정 반환
    const defaultConfig = mergePresetWithConfig('product', {});
    _setCachedConfig(defaultConfig);
    return defaultConfig;
  }

  // Node.js 환경에서만 동적 로드 시도
  if (typeof process !== 'undefined' && process.cwd && typeof require !== 'undefined') {
    try {
      // webpack이 분석하지 못하도록 eval 사용
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const dynamicRequire = eval('require') as NodeRequire;
      const fs = dynamicRequire('fs') as typeof import('fs');
      const path = dynamicRequire('path') as typeof import('path');
      const projectRoot = process.cwd();

      // 설정 파일 경로 후보
      const configPaths = [
        path.join(projectRoot, 'hua.config.ts'),
        path.join(projectRoot, 'hua.config.js'),
        path.join(projectRoot, 'hua.config.mjs'),
      ];

      // 첫 번째로 발견된 설정 파일 사용
      for (const configPath of configPaths) {
        if (fs.existsSync(configPath)) {
          try {
            if (typeof require !== 'undefined' && typeof require.resolve === 'function') {
              try {
                const configModule = dynamicRequire(configPath);
                const userConfig = configModule.default || configModule;

                // Preset 병합 처리
                if (userConfig && typeof userConfig === 'object') {
                  let loadedConfig: HuaConfig;
                  if (userConfig.preset) {
                    const { preset, ...rest } = userConfig;
                    loadedConfig = mergePresetWithConfig(preset, rest);
                  } else {
                    loadedConfig = createConfigFromUserConfig(userConfig);
                  }

                  loadedConfig = validateConfig(loadedConfig);
                  _setCachedConfig(loadedConfig);
                  return loadedConfig;
                }
              } catch (requireError) {
                // require 실패 (TypeScript 파일 등)
                // 기본값 사용
                break;
              }
            }
          } catch (fileError) {
            // 파일 읽기 실패
            continue;
          }
        }
      }
    } catch (error) {
      // fs, path 등이 없는 환경 (브라우저, Edge Runtime 등)
      // 기본값 사용
    }
  }

  // 기본값 (product preset)
  // 설정 파일이 없거나 로드 실패 시
  const defaultConfig = mergePresetWithConfig('product', {});
  _setCachedConfig(defaultConfig);
  return defaultConfig;
}
