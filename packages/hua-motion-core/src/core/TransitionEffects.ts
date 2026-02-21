/**
 * HUA Motion Core - 전환 효과 시스템
 *
 * CSS Motion API를 활용한 고성능 전환 효과들
 * GPU 가속 및 레이어 분리 최적화 포함
 */

import { motionEngine, MotionOptions } from './MotionEngine'

export type TransitionType =
  | 'fade'
  | 'slide'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'flip'
  | 'morph'
  | 'cube'
  | 'zoom'

export interface TransitionOptions extends Omit<MotionOptions, 'easing'> {
  type: TransitionType
  easing?: (t: number) => number // easing을 다시 추가
  distance?: number // slide 거리 (px)
  scale?: number // scale 시작/끝 값
  perspective?: number // 3D 효과를 위한 원근감
  onTransitionStart?: () => void
  onTransitionComplete?: () => void
}

export class TransitionEffects {
  private static instance: TransitionEffects
  private activeTransitions = new Map<string, string>()

  static getInstance(): TransitionEffects {
    if (!TransitionEffects.instance) {
      TransitionEffects.instance = new TransitionEffects()
    }
    return TransitionEffects.instance
  }

  /**
   * 공통 전환 실행 헬퍼
   */
  private async executeTransition(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>,
    config: {
      setup: () => void
      keyframes: [Record<string, number>, Record<string, number>]
      onUpdate: (progress: number) => void
      onCleanup: () => void
    }
  ): Promise<void> {
    const transitionId = this.generateTransitionId()

    config.setup()
    this.enableGPUAcceleration(element)

    let resolveTransition!: () => void
    const completed = new Promise<void>((resolve) => {
      resolveTransition = resolve
    })

    const motionId = await motionEngine.motion(
      element,
      [
        { progress: 0, properties: config.keyframes[0] },
        { progress: 1, properties: config.keyframes[1] }
      ],
      {
        duration: options.duration,
        easing: options.easing || this.getDefaultEasing(),
        delay: options.delay,
        onStart: options.onTransitionStart,
        onUpdate: config.onUpdate,
        onComplete: () => {
          config.onCleanup()
          options.onTransitionComplete?.()
          this.activeTransitions.delete(transitionId)
          resolveTransition()
        }
      }
    )

    this.activeTransitions.set(transitionId, motionId)
    return completed
  }

  /**
   * 페이드 인/아웃 전환
   */
  async fade(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>
  ): Promise<void> {
    const initialOpacity = parseFloat(getComputedStyle(element).opacity) || 1
    const targetOpacity = options.direction === 'reverse' ? 0 : 1

    return this.executeTransition(element, options, {
      setup: () => {
        if (options.direction === 'reverse') {
          element.style.opacity = initialOpacity.toString()
        } else {
          element.style.opacity = '0'
        }
      },
      keyframes: [
        { opacity: options.direction === 'reverse' ? initialOpacity : 0 },
        { opacity: targetOpacity }
      ],
      onUpdate: (progress) => {
        const currentOpacity = options.direction === 'reverse'
          ? initialOpacity * (1 - progress)
          : targetOpacity * progress
        element.style.opacity = currentOpacity.toString()
      },
      onCleanup: () => {}
    })
  }

  /**
   * 슬라이드 전환
   */
  async slide(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>
  ): Promise<void> {
    const distance = options.distance || 100
    const initialTransform = getComputedStyle(element).transform
    const isReverse = options.direction === 'reverse'

    return this.executeTransition(element, options, {
      setup: () => {
        if (!isReverse) {
          element.style.transform = `translateX(${distance}px)`
        }
      },
      keyframes: [
        { translateX: isReverse ? 0 : distance },
        { translateX: isReverse ? distance : 0 }
      ],
      onUpdate: (progress) => {
        const currentTranslateX = isReverse
          ? distance * progress
          : distance * (1 - progress)
        element.style.transform = `translateX(${currentTranslateX}px)`
      },
      onCleanup: () => {
        element.style.transform = initialTransform
      }
    })
  }

  /**
   * 스케일 전환
   */
  async scale(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>
  ): Promise<void> {
    const scaleValue = options.scale || 0.8
    const initialTransform = getComputedStyle(element).transform
    const isReverse = options.direction === 'reverse'

    return this.executeTransition(element, options, {
      setup: () => {
        if (!isReverse) {
          element.style.transform = `scale(${scaleValue})`
        }
      },
      keyframes: [
        { scale: isReverse ? 1 : scaleValue },
        { scale: isReverse ? scaleValue : 1 }
      ],
      onUpdate: (progress) => {
        const currentScale = isReverse
          ? 1 - (1 - scaleValue) * progress
          : scaleValue + (1 - scaleValue) * progress
        element.style.transform = `scale(${currentScale})`
      },
      onCleanup: () => {
        element.style.transform = initialTransform
      }
    })
  }

  /**
   * 플립 전환 (3D 회전)
   */
  async flip(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>
  ): Promise<void> {
    const perspective = options.perspective || 1000
    const initialTransform = getComputedStyle(element).transform
    const isReverse = options.direction === 'reverse'

    return this.executeTransition(element, options, {
      setup: () => {
        element.style.perspective = `${perspective}px`
        element.style.transformStyle = 'preserve-3d'
        if (!isReverse) {
          element.style.transform = `rotateY(90deg)`
        }
      },
      keyframes: [
        { rotateY: isReverse ? 0 : 90 },
        { rotateY: isReverse ? 90 : 0 }
      ],
      onUpdate: (progress) => {
        const currentRotateY = isReverse
          ? 90 * progress
          : 90 * (1 - progress)
        element.style.transform = `rotateY(${currentRotateY}deg)`
      },
      onCleanup: () => {
        element.style.transform = initialTransform
        element.style.perspective = ''
        element.style.transformStyle = ''
      }
    })
  }

  /**
   * 큐브 전환 (3D 큐브 회전)
   */
  async cube(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>
  ): Promise<void> {
    const perspective = options.perspective || 1200
    const initialTransform = getComputedStyle(element).transform
    const isReverse = options.direction === 'reverse'

    return this.executeTransition(element, options, {
      setup: () => {
        element.style.perspective = `${perspective}px`
        element.style.transformStyle = 'preserve-3d'
        if (!isReverse) {
          element.style.transform = `rotateX(90deg) rotateY(45deg)`
        }
      },
      keyframes: [
        { rotateX: isReverse ? 0 : 90, rotateY: isReverse ? 0 : 45 },
        { rotateX: isReverse ? 90 : 0, rotateY: isReverse ? 45 : 0 }
      ],
      onUpdate: (progress) => {
        const currentRotateX = isReverse
          ? 90 * progress
          : 90 * (1 - progress)
        const currentRotateY = isReverse
          ? 45 * progress
          : 45 * (1 - progress)
        element.style.transform = `rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg)`
      },
      onCleanup: () => {
        element.style.transform = initialTransform
        element.style.perspective = ''
        element.style.transformStyle = ''
      }
    })
  }

  /**
   * 모프 전환 (복합 변형)
   */
  async morph(
    element: HTMLElement,
    options: Omit<TransitionOptions, 'type'>
  ): Promise<void> {
    const initialTransform = getComputedStyle(element).transform
    const isReverse = options.direction === 'reverse'

    return this.executeTransition(element, options, {
      setup: () => {
        if (!isReverse) {
          element.style.transform = `scale(0.9) rotate(5deg)`
        }
      },
      keyframes: [
        { scale: isReverse ? 1 : 0.9, rotate: isReverse ? 0 : 5 },
        { scale: isReverse ? 0.9 : 1, rotate: isReverse ? 5 : 0 }
      ],
      onUpdate: (progress) => {
        const currentScale = isReverse
          ? 1 - 0.1 * progress
          : 0.9 + 0.1 * progress
        const currentRotate = isReverse
          ? 5 * progress
          : 5 * (1 - progress)
        element.style.transform = `scale(${currentScale}) rotate(${currentRotate}deg)`
      },
      onCleanup: () => {
        element.style.transform = initialTransform
      }
    })
  }

  /**
   * 전환 중지
   */
  stopTransition(transitionId: string): void {
    const motionId = this.activeTransitions.get(transitionId)
    if (motionId) {
      motionEngine.stop(motionId)
      this.activeTransitions.delete(transitionId)
    }
  }

  /**
   * 모든 전환 중지
   */
  stopAllTransitions(): void {
    this.activeTransitions.forEach((motionId) => {
      motionEngine.stop(motionId)
    })
    this.activeTransitions.clear()
  }

  /**
   * 활성 전환 수 확인
   */
  getActiveTransitionCount(): number {
    return this.activeTransitions.size
  }

  /**
   * GPU 가속 활성화
   */
  private enableGPUAcceleration(element: HTMLElement): void {
    element.style.willChange = 'transform, opacity'
    // Preserve existing transform and append translateZ(0) for GPU acceleration
    const currentTransform = element.style.transform
    if (currentTransform && currentTransform !== 'none' && currentTransform !== '') {
      // Only append if translateZ is not already present
      if (!currentTransform.includes('translateZ')) {
        element.style.transform = `${currentTransform} translateZ(0)`
      }
    } else {
      element.style.transform = 'translateZ(0)'
    }
  }

  /**
   * 기본 이징 함수
   */
  private getDefaultEasing(): (t: number) => number {
    return (t: number) => t * t * (3 - 2 * t) // smooth easing
  }

  /**
   * 고유 전환 ID 생성
   */
  private generateTransitionId(): string {
    return `transition_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 정리
   */
  destroy(): void {
    this.stopAllTransitions()
  }
}

// 싱글톤 인스턴스
export const transitionEffects = TransitionEffects.getInstance()
