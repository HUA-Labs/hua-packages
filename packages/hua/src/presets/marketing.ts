/**
 * Marketing Preset
 * 
 * 랜딩 페이지 모션 중심 설정
 * 마케팅 페이지, 랜딩 페이지에 적합
 */

import type { MotionPreset, PresetConfig } from '@hua-labs/motion-core'

/**
 * Marketing Preset Configuration
 * 
 * - 드라마틱한 모션 (느린 전환, 긴 딜레이)
 * - 넓은 스페이싱 (xl 기본값)
 * - 호버/클릭 인터랙션 강조
 */
export const marketingPreset = {
  /**
   * Motion Presets for Marketing UI
   */
  motion: {
    hero: {
      entrance: 'fadeIn',
      delay: 300,
      duration: 1000,
      hover: false,
      click: false
    } as MotionPreset,
    title: {
      entrance: 'slideUp',
      delay: 500,
      duration: 800,
      hover: false,
      click: false
    } as MotionPreset,
    button: {
      entrance: 'scaleIn',
      delay: 700,
      duration: 400,
      hover: true,
      click: true
    } as MotionPreset,
    card: {
      entrance: 'slideUp',
      delay: 600,
      duration: 600,
      hover: true,
      click: false
    } as MotionPreset,
    text: {
      entrance: 'fadeIn',
      delay: 400,
      duration: 700,
      hover: false,
      click: false
    } as MotionPreset,
    image: {
      entrance: 'scaleIn',
      delay: 500,
      duration: 800,
      hover: true,
      click: false
    } as MotionPreset
  } as PresetConfig,

  /**
   * Spacing Guidelines
   * 
   * - 기본 스페이싱: xl (24px)
   * - 섹션 간격: xl (32px+)
   * - 컴포넌트 내부: md (8px)
   */
  spacing: {
    default: 'xl',
    section: 'xl',
    component: 'md'
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
   * - Bold weight (임팩트 있는 스타일)
   * - 24px 기본 크기 (마케팅용으로 크게)
   */
  icons: {
    set: 'phosphor' as const,
    weight: 'bold' as const,
    size: 24,
    color: 'currentColor'
  }
} as const

export type MarketingPreset = typeof marketingPreset
