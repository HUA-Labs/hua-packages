import { defineConfig } from '@hua-labs/hua-ux/framework';

/**
 * hua-ux 프레임워크 설정
 * 
 * Preset을 선택하면 대부분의 설정이 자동으로 적용됩니다.
 * - 'product': 제품 페이지용 (전문적, 효율적)
 * - 'marketing': 마케팅 페이지용 (화려함, 눈에 띄는)
 * 
 * **바이브 모드 (간단)**: `preset: 'product'`
 * **개발자 모드 (세부 설정)**: `preset: { type: 'product', motion: {...} }`
 */
export default defineConfig({
  /**
   * 프리셋 선택
   * 
   * Preset을 선택하면 motion, spacing, i18n 등이 자동 설정됩니다.
   * 
   * 바이브 모드 (간단):
   *   preset: 'product'
   * 
   * 개발자 모드 (세부 설정):
   *   preset: {
   *     type: 'product',
   *     motion: { duration: 300 },
   *   }
   */
  preset: 'product',
  
  /**
   * 다국어 설정
   */
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
  
  /**
   * 모션/애니메이션 설정
   * 
   * 바이브 코더용 (명사 중심):
   *   motion: { style: 'smooth' }  // 'smooth' | 'dramatic' | 'minimal'
   * 
   * 개발자용 (기술적):
   *   motion: {
   *     defaultPreset: 'product',
   *     enableAnimations: true,
   *     duration: 300,
   *   }
   */
  motion: {
    defaultPreset: 'product',
    enableAnimations: true,
    // style: 'smooth',  // 바이브 코더용: 'smooth' | 'dramatic' | 'minimal'
  },
  
  /**
   * 상태 관리 설정
   */
  state: {
    persist: true,
    ssr: true,
  },
  
  /**
   * 브랜딩 설정 (화이트 라벨링)
   * 
   * 색상, 타이포그래피 등을 설정하면 모든 컴포넌트에 자동 적용됩니다.
   * 
   * branding: {
   *   colors: {
   *     primary: '#3B82F6',
   *     secondary: '#8B5CF6',
   *   },
   * }
   */
  // branding: {
  //   colors: {
  //     primary: '#3B82F6',
  //   },
  // },
  
  /**
   * 라이선스 설정 (Pro/Enterprise 플러그인 사용 시)
   * 
   * license: {
   *   apiKey: process.env.HUA_UX_LICENSE_KEY,
   * }
   */
  // license: {
  //   apiKey: process.env.HUA_UX_LICENSE_KEY,
  // },
  
  /**
   * 플러그인 설정 (Pro/Enterprise 기능)
   * 
   * plugins: [
   *   motionProPlugin,
   *   i18nProPlugin,
   * ]
   */
  // plugins: [],
});
