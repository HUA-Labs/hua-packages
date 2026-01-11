/**
 * HUA UI Demo Site - hua-ux Configuration
 *
 * @see https://github.com/HUA-Labs/hua-platform/packages/hua-ux
 */
import { defineConfig } from '@hua-labs/hua-ux/framework/config';

export default defineConfig({
  // 데모 사이트용 프리셋
  preset: 'product',

  // 다국어 설정
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common', 'components'],
    translationLoader: 'static',
    debug: false,
  },

  // 아이콘 설정
  icons: {
    set: 'phosphor',
    weight: 'regular',
    size: 20,
  },

  // 모션 설정
  motion: {
    style: 'smooth',
    enableAnimations: true,
  },

  // 상태 관리
  state: {
    persist: true,
    ssr: true,
  },

  // HUA UI 브랜딩
  branding: {
    name: 'HUA UI',
    colors: {
      primary: '#3B82F6',    // blue-500 - 메인 브랜드 컬러
      secondary: '#8B5CF6',  // purple-500 - 보조 컬러
      accent: '#EC4899',     // pink-500 - 강조 컬러
    },
  },
});
