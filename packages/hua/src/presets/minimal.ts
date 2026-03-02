/**
 * Minimal Preset
 *
 * 모션 최소화 — fadeIn only, 짧은 duration, 거의 no delay
 * 모션을 거의 사용하지 않는 앱이나 접근성 우선 환경에 적합
 */

import type { MotionPreset, PresetConfig } from '@hua-labs/motion-core'

/**
 * Minimal Preset Configuration
 *
 * - fadeIn만 사용 (가장 부드러운 최소 모션)
 * - 짧은 duration (150-200ms)
 * - delay 없음 (즉각 반응)
 * - hover/click 인터랙션 최소화
 */
export const minimalPreset = {
  /**
   * Motion Presets for Minimal UI
   */
  motion: {
    hero: {
      entrance: 'fadeIn',
      delay: 0,
      duration: 200,
      hover: false,
      click: false
    } as MotionPreset,
    title: {
      entrance: 'fadeIn',
      delay: 0,
      duration: 150,
      hover: false,
      click: false
    } as MotionPreset,
    button: {
      entrance: 'fadeIn',
      delay: 0,
      duration: 150,
      hover: true,
      click: true
    } as MotionPreset,
    card: {
      entrance: 'fadeIn',
      delay: 0,
      duration: 200,
      hover: false,
      click: false
    } as MotionPreset,
    text: {
      entrance: 'fadeIn',
      delay: 0,
      duration: 150,
      hover: false,
      click: false
    } as MotionPreset
  } as PresetConfig,

  /**
   * Spacing Guidelines
   *
   * - 기본 스페이싱: md (8px)
   * - 섹션 간격: md (8px)
   * - 컴포넌트 내부: sm (4px)
   */
  spacing: {
    default: 'md',
    section: 'md',
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

export type MinimalPreset = typeof minimalPreset
