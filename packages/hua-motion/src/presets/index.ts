// ========================================
// HUA Animation SDK - Preset System
// ========================================

import type { AnimationPreset, PresetConfig, PageType, PageAnimationsConfig } from '../types'

// ========================================
// 기본 애니메이션 프리셋
// ========================================

export const ANIMATION_PRESETS: PresetConfig = {
  hero: {
    entrance: 'fadeIn',
    delay: 200,
    duration: 800,
    hover: false,
    click: false
  },
  title: {
    entrance: 'slideUp',
    delay: 400,
    duration: 700,
    hover: false,
    click: false
  },
  button: {
    entrance: 'scaleIn',
    delay: 600,
    duration: 300,
    hover: true,
    click: true
  },
  card: {
    entrance: 'slideUp',
    delay: 800,
    duration: 500,
    hover: true,
    click: false
  },
  text: {
    entrance: 'fadeIn',
    delay: 200,
    duration: 600,
    hover: false,
    click: false
  },
  image: {
    entrance: 'scaleIn',
    delay: 400,
    duration: 600,
    hover: true,
    click: false
  }
}

// ========================================
// 페이지별 프리셋 (1단계: useSimplePageAnimation)
// ========================================

export const PAGE_ANIMATIONS: Record<PageType, PageAnimationsConfig> = {
  // 홈페이지
  home: {
    hero: { type: 'hero' },
    title: { type: 'title' },
    description: { type: 'text' },
    cta: { type: 'button' },
    feature1: { type: 'card' },
    feature2: { type: 'card' },
    feature3: { type: 'card' }
  },
  
  // 대시보드
  dashboard: {
    header: { type: 'hero' },
    sidebar: { type: 'card', entrance: 'slideLeft' },
    main: { type: 'text', entrance: 'fadeIn' },
    card1: { type: 'card' },
    card2: { type: 'card' },
    card3: { type: 'card' },
    chart: { type: 'image' }
  },
  
  // 제품 페이지
  product: {
    hero: { type: 'hero' },
    title: { type: 'title' },
    image: { type: 'image' },
    description: { type: 'text' },
    price: { type: 'text' },
    buyButton: { type: 'button' },
    features: { type: 'card' }
  },
  
  // 블로그
  blog: {
    header: { type: 'hero' },
    title: { type: 'title' },
    content: { type: 'text' },
    sidebar: { type: 'card', entrance: 'slideRight' },
    related1: { type: 'card' },
    related2: { type: 'card' },
    related3: { type: 'card' }
  }
}

// ========================================
// 프리셋 유틸리티 함수
// ========================================

/**
 * 프리셋과 커스텀 설정을 병합
 */
export function mergeWithPreset(
  preset: AnimationPreset,
  custom: Partial<AnimationPreset> = {}
): AnimationPreset {
  return {
    ...preset,
    ...custom
  }
}

/**
 * 페이지 타입으로 프리셋 가져오기
 */
export function getPagePreset(pageType: PageType): PageAnimationsConfig {
  return PAGE_ANIMATIONS[pageType]
}

/**
 * 애니메이션 타입으로 기본 프리셋 가져오기
 */
export function getAnimationPreset(type: string): AnimationPreset {
  return ANIMATION_PRESETS[type] || ANIMATION_PRESETS.text
} 