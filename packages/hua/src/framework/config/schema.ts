/**
 * @hua-labs/hua/framework - Config Schema
 * 
 * Configuration schema and validation
 */

import type { HuaConfig, Preset } from '../types';

/**
 * Default configuration
 * 
 * Preset을 사용하지 않을 때의 기본값입니다.
 * Preset을 사용하면 이 값은 무시되고 Preset 값이 사용됩니다.
 */
export const defaultConfig: Required<Omit<HuaConfig, 'branding' | 'plugins' | 'license'>> & {
  branding?: HuaConfig['branding'];
  plugins?: HuaConfig['plugins'];
  license?: HuaConfig['license'];
} = {
  preset: 'product',  // 기본 Preset
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    fallbackLanguage: 'en',
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  icons: {
    set: 'phosphor',
    weight: 'regular',
    size: 20,
    color: 'currentColor',
  },
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
  },
  state: {
    persist: true,
    ssr: true,
  },
  fileStructure: {
    enforce: false,
  },
  toast: {
    position: 'top-right',
    maxToasts: 5,
  },
  plugins: [],
  license: undefined,
};

/**
 * Validate configuration
 * 
 * 설정의 유효성을 검증하고 친절한 에러 메시지를 제공합니다.
 * Validates configuration and provides friendly error messages.
 */
export function validateConfig(config: Partial<HuaConfig>): HuaConfig {
  // Preset 검증
  if (config.preset) {
    if (typeof config.preset === 'string') {
      // 바이브 모드: 문자열 Preset
      if (!['product', 'marketing'].includes(config.preset)) {
        throw new Error(
          `[hua] ❌ 잘못된 Preset입니다: "${config.preset}"\n` +
          `[hua] ❌ Invalid preset: "${config.preset}"\n\n` +
          `사용 가능한 Preset: 'product', 'marketing'\n` +
          `Available presets: 'product', 'marketing'\n\n` +
          `💡 해결 방법 / Solution:\n` +
          `   - 'product' 또는 'marketing' 중 하나를 선택하세요.\n` +
          `   - Select either 'product' or 'marketing'.\n\n` +
          `📖 가이드 / Guide: https://github.com/HUA-Labs/hua-platform/tree/main/packages/hua/docs`
        );
      }
    } else {
      // 개발자 모드: 객체 Preset
      if (!['product', 'marketing'].includes(config.preset.type)) {
        throw new Error(
          `[hua] ❌ 잘못된 Preset 타입입니다: "${config.preset.type}"\n` +
          `[hua] ❌ Invalid preset type: "${config.preset.type}"\n\n` +
          `사용 가능한 Preset 타입: 'product', 'marketing'\n` +
          `Available preset types: 'product', 'marketing'\n\n` +
          `💡 해결 방법 / Solution:\n` +
          `   - preset.type을 'product' 또는 'marketing'으로 설정하세요.\n` +
          `   - Set preset.type to either 'product' or 'marketing'.\n\n` +
          `📖 가이드 / Guide: https://github.com/HUA-Labs/hua-platform/tree/main/packages/hua/docs`
        );
      }
    }
  }
  
  // motion.style을 defaultPreset으로 매핑 (바이브 코더용)
  if (config.motion?.style && !config.motion.defaultPreset) {
    const styleToPreset: Record<string, 'product' | 'marketing'> = {
      smooth: 'product',
      minimal: 'product',
      dramatic: 'marketing',
    };
    
    config.motion.defaultPreset = styleToPreset[config.motion.style];
  }

  // 기본값과 병합
  const validated: HuaConfig = {
    preset: config.preset || defaultConfig.preset,
    i18n: {
      ...defaultConfig.i18n,
      ...config.i18n,
    },
    motion: {
      ...defaultConfig.motion,
      ...config.motion,
    },
    state: {
      ...defaultConfig.state,
      ...config.state,
    },
    fileStructure: {
      ...defaultConfig.fileStructure,
      ...config.fileStructure,
    },
  };

  // Validate i18n
  if (validated.i18n) {
    if (!validated.i18n.supportedLanguages.includes(validated.i18n.defaultLanguage)) {
      throw new Error(
        `[hua] ❌ i18n 설정 오류 / i18n configuration error\n\n` +
        `기본 언어 "${validated.i18n.defaultLanguage}"가 지원 언어 목록에 없습니다.\n` +
        `Default language "${validated.i18n.defaultLanguage}" is not in supportedLanguages.\n\n` +
        `현재 지원 언어 / Current supported languages: ${validated.i18n.supportedLanguages.join(', ')}\n\n` +
        `💡 해결 방법 / Solution:\n` +
        `   1. supportedLanguages에 "${validated.i18n.defaultLanguage}"를 추가하세요.\n` +
        `      Add "${validated.i18n.defaultLanguage}" to supportedLanguages.\n` +
        `   2. 또는 defaultLanguage를 지원 언어 중 하나로 변경하세요.\n` +
        `      Or change defaultLanguage to one of the supported languages.\n\n` +
        `📝 예시 / Example:\n` +
        `   i18n: {\n` +
        `     defaultLanguage: 'ko',\n` +
        `     supportedLanguages: ['ko', 'en', 'ja'],  // 'ko' 포함 필수\n` +
        `   }\n\n` +
        `📖 가이드 / Guide: https://github.com/HUA-Labs/hua-platform/tree/main/packages/hua/docs`
      );
    }
  }

  return validated;
}
