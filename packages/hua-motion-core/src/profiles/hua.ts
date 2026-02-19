import type { MotionProfile } from './types'

/**
 * HUA 프로필 — 스르륵 쫀뜩한 브랜드 시그니처.
 *
 * 특징:
 * - CSS ease-out 기반이되 끝에 미세한 오버슈트 (1.04~1.06)
 * - 도착점을 살짝 지나쳤다가 돌아오는 탄성
 * - 바운스 없이 쫀뜩 (높은 감쇠 + 높은 강성)
 * - neutral보다 짧은 duration, 좁은 distance → 더 정교한 느낌
 */
export const hua: MotionProfile = {
  name: 'hua',

  base: {
    duration: 640,
    easing: 'cubic-bezier(0.22, 0.68, 0.35, 1.10)',
    threshold: 0.12,
    triggerOnce: true,
  },

  entrance: {
    slide: {
      distance: 28,
      easing: 'cubic-bezier(0.22, 0.68, 0.35, 1.14)',
    },
    fade: {
      initialOpacity: 0,
    },
    scale: {
      from: 0.97,
    },
    bounce: {
      intensity: 0.2,
      easing: 'cubic-bezier(0.22, 0.68, 0.35, 1.12)',
    },
  },

  stagger: {
    perItem: 80,
    baseDelay: 0,
  },

  interaction: {
    hover: {
      scale: 1.008,
      y: -1,
      duration: 180,
      easing: 'cubic-bezier(0.22, 0.68, 0.35, 1.10)',
    },
  },

  spring: {
    mass: 1,
    stiffness: 180,
    damping: 18,
    restDelta: 0.005,
    restSpeed: 0.005,
  },

  reducedMotion: 'fade-only',
}
