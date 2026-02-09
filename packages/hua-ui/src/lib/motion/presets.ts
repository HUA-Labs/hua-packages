/**
 * HUA-UI 마이크로 모션 프리셋
 *
 * 핵심 철학: "스륵 부드럽고 아주 조금 쫀득"
 * - 스륵: 자연스럽고 부드러운 시작/끝
 * - 쫀득: 약간의 오버슈트로 생동감
 */

import type { MicroMotionPreset, SpringConfig, MicroMotionConfig } from './types'

/**
 * 스프링 물리 프리셋
 * CSS cubic-bezier로 근사화된 값들
 */
export const SPRING_CONFIGS: Record<MicroMotionPreset, SpringConfig> = {
  subtle: {
    stiffness: 400,
    damping: 30,
    mass: 1,
  },
  soft: {
    stiffness: 300,
    damping: 25,
    mass: 1,
  },
  springy: {
    stiffness: 350,
    damping: 20,
    mass: 0.8,
  },
  bouncy: {
    stiffness: 400,
    damping: 15,
    mass: 0.7,
  },
  snappy: {
    stiffness: 500,
    damping: 35,
    mass: 0.5,
  },
}

/**
 * CSS easing 함수 (스프링 근사)
 * 각 프리셋에 맞는 cubic-bezier 값
 */
export const EASING_FUNCTIONS: Record<MicroMotionPreset, string> = {
  // 미세한 반응 - 거의 linear에 가까움
  subtle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  // 부드러운 ease-out
  soft: 'cubic-bezier(0.22, 1, 0.36, 1)',
  // 약간의 오버슈트 (쫀득!)
  springy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  // 더 큰 오버슈트
  bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  // 빠르고 날카로운
  snappy: 'cubic-bezier(0.19, 1, 0.22, 1)',
}

/**
 * 기본 지속시간 (ms)
 */
export const DURATIONS: Record<MicroMotionPreset, number> = {
  subtle: 150,
  soft: 250,
  springy: 300,
  bouncy: 400,
  snappy: 180,
}

/**
 * HUA-UI 기본 마이크로 모션 설정
 * "스륵 쫀득"의 정수 - 아주 미세하게!
 */
export const HUA_DEFAULT_MOTION: MicroMotionConfig = {
  preset: 'springy',
  duration: 180,
  scale: 0.008,     // 0.8% 스케일 변화 (아주아주 미세)
  translateY: -0.5, // 0.5px 위로 살짝
}

/**
 * 컴포넌트별 기본 모션 설정
 * 아주 미세한 반동으로 생동감 있게
 */
export const COMPONENT_MOTION_DEFAULTS = {
  button: {
    preset: 'springy' as MicroMotionPreset,
    duration: 180,
    scale: 0.008,      // 0.8% - 아주아주 미세
    translateY: -0.5,  // 0.5px
  },
  card: {
    preset: 'soft' as MicroMotionPreset,
    duration: 220,
    scale: 0.005,      // 0.5%
    translateY: -1,
  },
  menuItem: {
    preset: 'subtle' as MicroMotionPreset,
    duration: 150,
    translateX: 1,     // 1px
  },
  modal: {
    preset: 'springy' as MicroMotionPreset,
    duration: 250,
    scale: 0.01,
  },
  dropdown: {
    preset: 'soft' as MicroMotionPreset,
    duration: 180,
    translateY: -2,
  },
  tooltip: {
    preset: 'snappy' as MicroMotionPreset,
    duration: 120,
    scale: 0.02,
  },
  checkbox: {
    preset: 'springy' as MicroMotionPreset,
    duration: 200,
    scale: 0.03,       // 체크박스는 조금 더
  },
  switch: {
    preset: 'springy' as MicroMotionPreset,
    duration: 180,
  },
}

/**
 * CSS 변수로 사용할 수 있는 기본값들
 * 미세한 스프링 반동 느낌
 */
export const CSS_MOTION_VARS = {
  '--hua-motion-duration': '180ms',
  '--hua-motion-easing': EASING_FUNCTIONS.springy,
  '--hua-motion-scale-hover': '1.008',   // 0.8% 확대 (아주아주 미세)
  '--hua-motion-scale-active': '0.992',  // 0.8% 축소
  '--hua-motion-translate-y': '-0.5px',
} as const
