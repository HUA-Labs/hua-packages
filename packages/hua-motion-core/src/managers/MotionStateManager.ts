import { MotionState, MotionElement } from '../types'

/**
 * MotionStateManager - 모션 상태 관리 클래스
 * 
 * 상태 충돌 문제 해결을 위해 3가지 상태를 분리:
 * - internalVisibility: 내부 로직 (초기화, 리셋 등)
 * - triggeredVisibility: 외부 트리거 (Intersection Observer)
 * - finalVisibility: 최종 계산된 상태
 */
export class MotionStateManager {
  private states: Map<string, MotionState> = new Map()
  private listeners: Map<string, Set<(state: MotionState) => void>> = new Map()

  /**
   * 요소의 상태를 초기화
   */
  initializeElement(elementId: string, config: MotionElement): void {
    const initialState: MotionState = {
      internalVisibility: false, // 초기에 숨김 상태로 시작 (스크롤 리빌용)
      triggeredVisibility: false, // Intersection Observer가 아직 트리거되지 않음
      finalVisibility: false, // 초기에 숨김 상태로 시작
      opacity: 0, // 초기에 투명 상태로 시작
      translateY: 20, // 초기에 아래로 이동된 상태로 시작
      translateX: 0,
      scale: 0.95, // 초기에 약간 축소된 상태로 시작
      rotation: 0,
      isHovered: false,
      isClicked: false,
      isAnimating: false
    }

    this.states.set(elementId, initialState)
    this.computeFinalState(elementId)
  }

  /**
   * 내부 가시성 상태 업데이트 (초기화, 리셋 등)
   */
  setInternalVisibility(elementId: string, visible: boolean): void {
    const state = this.states.get(elementId)
    if (!state) return

    state.internalVisibility = visible
    this.computeFinalState(elementId)
    this.notifyListeners(elementId, state)
  }

  /**
   * 외부 트리거 가시성 상태 업데이트 (Intersection Observer)
   */
  setTriggeredVisibility(elementId: string, visible: boolean): void {
    const state = this.states.get(elementId)
    if (!state) return

    state.triggeredVisibility = visible
    this.computeFinalState(elementId)
    this.notifyListeners(elementId, state)
  }

  /**
   * 모션 값 업데이트
   */
  updateMotionValues(elementId: string, values: Partial<MotionState>): void {
    const state = this.states.get(elementId)
    if (!state) return

    Object.assign(state, values)
    this.notifyListeners(elementId, state)
  }

  /**
   * 최종 상태 계산
   */
  private computeFinalState(elementId: string): void {
    const state = this.states.get(elementId)
    if (!state) return

    // 내부 또는 외부 트리거 중 하나라도 true면 최종적으로 보임
    state.finalVisibility = state.internalVisibility || state.triggeredVisibility

    // 모션 중 상태 업데이트
    state.isAnimating = state.finalVisibility && (state.opacity < 1 || state.translateY > 0)
  }

  /**
   * 현재 상태 조회
   */
  getState(elementId: string): MotionState | undefined {
    return this.states.get(elementId)
  }

  /**
   * 모든 상태 조회
   */
  getAllStates(): Map<string, MotionState> {
    return new Map(this.states)
  }

  /**
   * 상태 변경 리스너 등록
   */
  subscribe(elementId: string, listener: (state: MotionState) => void): () => void {
    if (!this.listeners.has(elementId)) {
      this.listeners.set(elementId, new Set())
    }

    this.listeners.get(elementId)!.add(listener)

    // 구독 해제 함수 반환
    return () => {
      const listeners = this.listeners.get(elementId)
      if (listeners) {
        listeners.delete(listener)
      }
    }
  }

  /**
   * 리스너들에게 상태 변경 알림
   */
  notifyListeners(elementId: string, state: MotionState): void {
    const listeners = this.listeners.get(elementId)
    if (!listeners) return

    listeners.forEach(listener => {
      try {
        listener(state)
      } catch (error) {
        console.error(`MotionStateManager listener error for ${elementId}:`, error)
      }
    })
  }

  /**
   * 모든 상태 초기화
   */
  reset(): void {
    this.states.clear()
    this.listeners.clear()
  }

  /**
   * 특정 요소 상태 초기화
   */
  resetElement(elementId: string): void {
    this.states.delete(elementId)
    this.listeners.delete(elementId)
  }

  /**
   * 디버그용 상태 출력
   */
  debug(): void {
    console.log('MotionStateManager Debug:')
    this.states.forEach((state, elementId) => {
      console.log(`  ${elementId}:`, {
        internalVisibility: state.internalVisibility,
        triggeredVisibility: state.triggeredVisibility,
        finalVisibility: state.finalVisibility,
        opacity: state.opacity,
        translateY: state.translateY,
        isAnimating: state.isAnimating
      })
    })
  }
}

// 싱글톤 인스턴스
export const motionStateManager = new MotionStateManager()
