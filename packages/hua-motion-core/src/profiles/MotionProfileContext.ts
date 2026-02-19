import { createContext, useContext, createElement, useMemo } from 'react'
import type { MotionProfile, BuiltInProfileName, DeepPartial } from './types'
import { neutral } from './neutral'
import { resolveProfile, mergeProfileOverrides } from './index'

// ========================================
// Context — neutral fallback (Provider 없어도 동작)
// ========================================

const MotionProfileContext = createContext<MotionProfile>(neutral)

// ========================================
// Provider
// ========================================

export interface MotionProfileProviderProps {
  /** 내장 프로필 이름 또는 커스텀 프로필 객체 */
  profile?: BuiltInProfileName | MotionProfile
  /** 선택한 프로필 위에 부분 오버라이드 */
  overrides?: DeepPartial<MotionProfile>
  children: React.ReactNode
}

export function MotionProfileProvider({
  profile = 'neutral',
  overrides,
  children,
}: MotionProfileProviderProps) {
  const resolved = useMemo(() => {
    const base = resolveProfile(profile)
    return overrides ? mergeProfileOverrides(base, overrides) : base
  }, [profile, overrides])

  return createElement(
    MotionProfileContext.Provider,
    { value: resolved },
    children
  )
}

// ========================================
// Hook — 각 모션 훅에서 내부적으로 호출
// ========================================

/**
 * 현재 프로필을 가져옴.
 * Provider 밖에서 호출 시 neutral 프로필 반환 (하위 호환).
 */
export function useMotionProfile(): MotionProfile {
  return useContext(MotionProfileContext)
}
