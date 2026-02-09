/**
 * @hua-labs/hua/framework - Config System
 *
 * Configuration loading and management
 *
 * ⚠️ 이 파일은 클라이언트 안전한 함수만 export합니다.
 * loadConfig는 서버 전용이므로 @hua-labs/hua/framework/server에서 import하세요.
 *
 * @example
 * ```ts
 * // 클라이언트/서버 공통 사용
 * import { defineConfig, getConfig, setConfig } from '@hua-labs/hua/framework';
 *
 * // 서버 전용 (loadConfig)
 * import { loadConfig } from '@hua-labs/hua/framework/server';
 * ```
 */

// Client-safe exports only
export {
  defineConfig,
  getConfig,
  setConfig,
  resetConfig,
} from './client';

// Re-export schema utilities (client-safe)
export { defaultConfig, validateConfig } from './schema';

// Re-export merge utilities (client-safe)
export { mergePresetWithConfig, createConfigFromUserConfig } from './merge';
