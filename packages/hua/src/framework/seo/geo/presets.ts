/**
 * @hua-labs/hua/framework - GEO Presets
 *
 * Pre-configured GEO presets for common use cases
 * 일반적인 사용 사례를 위한 사전 구성된 GEO 프리셋
 */

import type { GEOConfig } from './types';

/**
 * GEO Presets
 * 일반적인 소프트웨어 타입을 위한 사전 구성된 설정
 */
export const GEO_PRESETS = {
  /**
   * Next.js Framework preset
   * Next.js 프레임워크용 프리셋
   */
  NEXTJS_FRAMEWORK: {
    applicationType: 'DeveloperApplication' as const,
    programmingLanguage: ['TypeScript'] as const,
    technologyStack: ['Next.js', 'React'] as const,
    applicationCategory: 'Developer Tool' as const,
  },

  /**
   * UI Library preset
   * UI 라이브러리용 프리셋
   */
  UI_LIBRARY: {
    applicationType: 'DeveloperApplication' as const,
    applicationCategory: 'Component Library' as const,
  },

  /**
   * React Application preset
   * React 애플리케이션용 프리셋
   */
  REACT_APP: {
    applicationType: 'WebApplication' as const,
    programmingLanguage: ['TypeScript', 'JavaScript'] as const,
    technologyStack: ['React'] as const,
  },

  /**
   * NPM Package preset
   * NPM 패키지용 프리셋
   */
  NPM_PACKAGE: {
    applicationType: 'DeveloperApplication' as const,
    applicationCategory: 'Developer Tool' as const,
  },
} as const satisfies Record<string, Partial<GEOConfig>>;

/**
 * Type helper for preset values
 */
export type GEOPreset = typeof GEO_PRESETS[keyof typeof GEO_PRESETS];
