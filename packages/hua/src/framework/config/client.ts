/**
 * @hua-labs/hua/framework - Config System (Client-safe)
 *
 * Client-safe configuration functions.
 * fs 모듈을 사용하지 않아 브라우저에서 안전하게 사용 가능합니다.
 */

import type { HuaConfig, Preset } from '../types';
import { validateConfig } from './schema';
import { mergePresetWithConfig, createConfigFromUserConfig } from './merge';
import { initLicense } from '../license';
import { pluginRegistry } from '../plugins';

/**
 * Global config cache
 */
let cachedConfig: HuaConfig | null = null;

/**
 * 프레임워크 설정 정의 / Define framework configuration
 *
 * IntelliSense를 완벽히 지원하는 설정 함수입니다.
 * Provides full IntelliSense support for configuration options.
 *
 * 모든 옵션은 선택사항이며 기본값 또는 Preset과 병합됩니다.
 * All options are optional and will be merged with defaults or Preset.
 *
 * **Zero-Config**: 설정 파일이 없어도 기본값으로 동작합니다.
 * **Zero-Config**: Works with defaults even without a config file.
 *
 * **Preset 우선**: `preset: 'product'`만 지정해도 대부분의 설정이 자동 적용됩니다.
 * **Preset First**: Just specify `preset: 'product'` and most settings are auto-applied.
 *
 * **바이브 코딩 친화적**: AI가 이해하기 쉬운 한글 주석과 명사 중심 설정
 * **Vibe Coding Friendly**: Korean comments and noun-centered settings for AI understanding
 *
 * @param config - 설정 객체 / Configuration object
 * @returns 검증된 설정 객체 / Validated configuration object
 *
 * @example
 * ```ts
 * // 최소 설정 (Preset만) - 바이브 코더용
 * // hua.config.ts
 * import { defineConfig } from '@hua-labs/hua/framework';
 *
 * export default defineConfig({
 *   preset: 'product',  // 끝! 나머지는 자동 설정
 * });
 * ```
 */
export function defineConfig(config: Partial<HuaConfig>): HuaConfig {
  // 라이선스 초기화
  if (config.license) {
    initLicense(config.license);
  }

  // 플러그인 등록 및 초기화
  if (config.plugins && config.plugins.length > 0) {
    config.plugins.forEach(plugin => {
      pluginRegistry.register(plugin);
    });
  }

  // Preset이 지정된 경우 Preset과 병합
  if (config.preset) {
    const { preset, ...userConfig } = config;
    const merged = mergePresetWithConfig(preset, userConfig);
    const validated = validateConfig(merged);

    // 플러그인 초기화 (설정이 완료된 후)
    if (config.plugins && config.plugins.length > 0) {
      pluginRegistry.initializeAll(validated).catch((error: Error) => {
        console.error('[hua] Plugin initialization error:', error);
      });
    }

    return validated;
  }

  // Preset이 없는 경우 사용자 설정만 사용
  const merged = createConfigFromUserConfig(config);
  const validated = validateConfig(merged);

  // 플러그인 초기화 (설정이 완료된 후)
  if (config.plugins && config.plugins.length > 0) {
    pluginRegistry.initializeAll(validated).catch((error: Error) => {
      console.error('[hua] Plugin initialization error:', error);
    });
  }

  return validated;
}

/**
 * Get current configuration
 *
 * 캐시된 설정을 반환하거나, 없으면 기본값을 반환합니다.
 *
 * **클라이언트 안전**: 어디서든 안전하게 호출 가능합니다.
 * **Client Safe**: Safe to call anywhere.
 */
export function getConfig(): HuaConfig {
  // 캐시된 설정이 있으면 반환
  if (cachedConfig) {
    return cachedConfig;
  }

  // 기본값 반환 (product preset)
  cachedConfig = mergePresetWithConfig('product', {});
  return cachedConfig;
}

/**
 * Set configuration (for testing or manual override)
 *
 * 테스트나 수동 오버라이드를 위한 설정 설정 함수
 */
export function setConfig(config: HuaConfig): void {
  cachedConfig = validateConfig(config);
}

/**
 * Reset configuration cache
 *
 * 설정 캐시를 초기화합니다. (주로 테스트용)
 */
export function resetConfig(): void {
  cachedConfig = null;
}

/**
 * Internal: Get cached config reference (for server module)
 */
export function _getCachedConfig(): HuaConfig | null {
  return cachedConfig;
}

/**
 * Internal: Set cached config reference (for server module)
 */
export function _setCachedConfig(config: HuaConfig | null): void {
  cachedConfig = config;
}
