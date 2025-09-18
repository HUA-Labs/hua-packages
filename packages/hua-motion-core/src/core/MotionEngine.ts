/**
 * HUA Motion Core - 의존성 제로 모션 엔진
 * 
 * 순수 JavaScript로 구현된 고성능 모션 엔진
 * GPU 가속, 레이어 분리, 성능 최적화 포함
 */

export interface MotionFrame {
  progress: number // 0 ~ 1
  properties: {
    opacity?: number
    transform?: string
    scale?: number
    translateX?: number
    translateY?: number
    rotate?: number
    rotateX?: number
    rotateY?: number
    rotateZ?: number
    skewX?: number
    skewY?: number
  }
}

export interface MotionOptions {
  duration: number
  easing: (t: number) => number
  delay?: number
  direction?: 'forward' | 'reverse' | 'alternate'
  iterations?: number
  fill?: 'none' | 'forwards' | 'backwards' | 'both'
  onStart?: () => void
  onUpdate?: (progress: number) => void
  onComplete?: () => void
  onCancel?: () => void
}

export interface Motion {
  id: string
  element: HTMLElement
  isRunning: boolean
  isPaused: boolean
  currentProgress: number
  startTime: number
  pauseTime: number
  options: MotionOptions
}

export class MotionEngine {
  private motions = new Map<string, Motion>()
  private isRunning = false
  private animationFrameId: number | null = null

  /**
   * 모션 시작
   */
  motion(
    element: HTMLElement, 
    motionFrames: MotionFrame[], 
    options: MotionOptions
  ): Promise<void> {
    return new Promise((resolve) => {
      const motionId = this.generateMotionId()
      
      // GPU 가속 활성화
      this.enableGPUAcceleration(element)
      
      // 레이어 분리
      this.createLayer(element)
      
      const motion: Motion = {
        id: motionId,
        element,
        isRunning: true,
        isPaused: false,
        currentProgress: 0,
        startTime: Date.now() + (options.delay || 0),
        pauseTime: 0,
        options: {
          ...options,
          onComplete: () => {
            options.onComplete?.()
            resolve()
            this.motions.delete(motionId)
          }
        }
      }

      this.motions.set(motionId, motion)
      
      if (!this.isRunning) {
        this.startAnimationLoop()
      }

      options.onStart?.()
    })
  }

  /**
   * 모션 중지
   */
  stop(motionId: string): void {
    const motion = this.motions.get(motionId)
    if (motion) {
      motion.isRunning = false
      motion.options.onCancel?.()
      this.motions.delete(motionId)
    }
  }

  /**
   * 모션 일시정지
   */
  pause(motionId: string): void {
    const motion = this.motions.get(motionId)
    if (motion && motion.isRunning && !motion.isPaused) {
      motion.isPaused = true
      motion.pauseTime = Date.now()
    }
  }

  /**
   * 모션 재개
   */
  resume(motionId: string): void {
    const motion = this.motions.get(motionId)
    if (motion && motion.isPaused) {
      motion.isPaused = false
      if (motion.pauseTime > 0) {
        motion.startTime += Date.now() - motion.pauseTime
      }
    }
  }

  /**
   * 모든 모션 중지
   */
  stopAll(): void {
    this.motions.forEach((motion) => {
      motion.isRunning = false
      motion.options.onCancel?.()
    })
    this.motions.clear()
    this.stopAnimationLoop()
  }

  /**
   * 모션 상태 확인
   */
  getMotion(motionId: string): Motion | undefined {
    return this.motions.get(motionId)
  }

  /**
   * 실행 중인 모션 수
   */
  getActiveMotionCount(): number {
    return this.motions.size
  }

  /**
   * 애니메이션 루프 시작
   */
  private startAnimationLoop(): void {
    if (this.isRunning) return
    
    this.isRunning = true
    this.animate()
  }

  /**
   * 애니메이션 루프 중지
   */
  private stopAnimationLoop(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.isRunning = false
  }

  /**
   * 메인 애니메이션 루프
   */
  private animate(): void {
    if (!this.isRunning || this.motions.size === 0) {
      this.stopAnimationLoop()
      return
    }

    const currentTime = Date.now()
    const completedMotions: string[] = []

    this.motions.forEach((motion) => {
      if (!motion.isRunning || motion.isPaused) return

      const elapsed = currentTime - motion.startTime
      if (elapsed < 0) return // 아직 시작하지 않음

      const progress = Math.min(elapsed / motion.options.duration, 1)
      const easedProgress = motion.options.easing(progress)
      
      motion.currentProgress = easedProgress
      
      // 모션 프레임 적용
      this.applyMotionFrame(motion.element, easedProgress)
      
      // 콜백 호출
      motion.options.onUpdate?.(easedProgress)
      
      // 완료된 모션 체크
      if (progress >= 1) {
        completedMotions.push(motion.id)
        motion.isRunning = false
        motion.options.onComplete?.()
      }
    })

    // 완료된 모션 제거
    completedMotions.forEach(id => this.motions.delete(id))

    // 다음 프레임 요청
    this.animationFrameId = requestAnimationFrame(() => this.animate())
  }

  /**
   * 모션 프레임 적용
   */
  private applyMotionFrame(element: HTMLElement, progress: number): void {
    // GPU 가속을 위한 transform 사용
    const transforms: string[] = []
    
    // 기본 transform 속성들
    if (element.style.transform) {
      transforms.push(element.style.transform)
    }
    
    // progress에 따른 transform 계산
    // 여기서는 기본적인 예시만 구현
    // 실제로는 motionFrames를 받아서 처리해야 함
    
    element.style.transform = transforms.join(' ')
  }

  /**
   * GPU 가속 활성화
   */
  private enableGPUAcceleration(element: HTMLElement): void {
    // will-change 속성 설정으로 GPU 가속 활성화
    element.style.willChange = 'transform, opacity'
    
    // transform3d로 강제 GPU 가속
    element.style.transform = 'translateZ(0)'
  }

  /**
   * 레이어 분리
   */
  private createLayer(element: HTMLElement): void {
    // 새로운 레이어 생성으로 성능 향상
    element.style.transform = 'translateZ(0)'
    element.style.backfaceVisibility = 'hidden'
  }

  /**
   * 고유 모션 ID 생성
   */
  private generateMotionId(): string {
    return `motion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 정리
   */
  destroy(): void {
    this.stopAll()
    this.stopAnimationLoop()
  }
}

// 싱글톤 인스턴스
export const motionEngine = new MotionEngine()
