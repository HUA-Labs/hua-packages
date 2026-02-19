import type { MotionProfile } from './types'

/**
 * neutral 프로필 — 기존 하드코딩 디폴트와 동일.
 * Provider 없을 때 fallback으로 사용되므로 하위 호환 100% 보장.
 */
export const neutral: MotionProfile = {
  name: 'neutral',

  base: {
    duration: 700,
    easing: 'ease-out',
    threshold: 0.1,
    triggerOnce: true,
  },

  entrance: {
    slide: {
      distance: 32,
      easing: 'ease-out',
    },
    fade: {
      initialOpacity: 0,
    },
    scale: {
      from: 0.95,
    },
    bounce: {
      intensity: 0.3,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  stagger: {
    perItem: 100,
    baseDelay: 0,
  },

  interaction: {
    hover: {
      scale: 1.05,
      y: -2,
      duration: 200,
      easing: 'ease-out',
    },
  },

  spring: {
    mass: 1,
    stiffness: 100,
    damping: 10,
    restDelta: 0.01,
    restSpeed: 0.01,
  },

  reducedMotion: 'fade-only',
}
