/**
 * Product Preset
 * 
 * 기본 여백 + 기본 모션 설정
 * 제품 페이지, 대시보드 등 일반적인 제품 UI에 적합
 */

import type { MotionPreset, PresetConfig } from '@hua-labs/motion-core'

/**
 * Product Preset Configuration
 * 
 * - 보수적인 모션 (빠른 전환, 최소한의 딜레이)
 * - 일관된 스페이싱 (md 기본값)
 * - 호버/클릭 인터랙션 최소화
 */
export const productPreset = {
  /**
   * Motion Presets for Product UI
   */
  motion: {
    hero: {
      entrance: 'fadeIn',
      delay: 100,
      duration: 400,
      hover: false,
      click: false
    } as MotionPreset,
    title: {
      entrance: 'slideUp',
      delay: 150,
      duration: 350,
      hover: false,
      click: false
    } as MotionPreset,
    button: {
      entrance: 'scaleIn',
      delay: 200,
      duration: 200,
      hover: true,
      click: true
    } as MotionPreset,
    card: {
      entrance: 'slideUp',
      delay: 100,
      duration: 300,
      hover: true,
      click: false
    } as MotionPreset,
    text: {
      entrance: 'fadeIn',
      delay: 50,
      duration: 300,
      hover: false,
      click: false
    } as MotionPreset
  } as PresetConfig,

  /**
   * Spacing Guidelines
   * 
   * - 기본 스페이싱: md (8px)
   * - 섹션 간격: lg (16px)
   * - 컴포넌트 내부: sm (4px)
   */
  spacing: {
    default: 'md',
    section: 'lg',
    component: 'sm'
  },

  /**
   * i18n Configuration
   */
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en']
  },

  /**
   * Icon Configuration
   *
   * - Phosphor Icons (기본값)
   * - Regular weight (깔끔한 스타일)
   * - 20px 기본 크기
   */
  icons: {
    set: 'phosphor' as const,
    weight: 'regular' as const,
    size: 20,
    color: 'currentColor'
  }
} as const

export type ProductPreset = typeof productPreset
