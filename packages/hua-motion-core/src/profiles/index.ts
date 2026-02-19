// ========================================
// Motion Profile System — 메인 export
// ========================================

export type {
  MotionProfile,
  MotionProfileBase,
  MotionProfileEntrance,
  MotionProfileStagger,
  MotionProfileInteraction,
  MotionProfileSpring,
  ReducedMotionStrategy,
  BuiltInProfileName,
  DeepPartial,
} from './types'

export { neutral } from './neutral'
export { hua } from './hua'
export {
  MotionProfileProvider,
  useMotionProfile,
  type MotionProfileProviderProps,
} from './MotionProfileContext'

import { neutral } from './neutral'
import { hua } from './hua'
import type { MotionProfile, BuiltInProfileName, DeepPartial } from './types'

/** 내장 프로필 레지스트리 */
const PROFILES: Record<BuiltInProfileName, MotionProfile> = {
  neutral,
  hua,
}

/** 이름 또는 객체에서 프로필 resolve */
export function resolveProfile(
  profile: BuiltInProfileName | MotionProfile
): MotionProfile {
  if (typeof profile === 'string') {
    return PROFILES[profile] ?? neutral
  }
  return profile
}

/** 프로필에 오버라이드를 깊은 병합 */
export function mergeProfileOverrides(
  base: MotionProfile,
  overrides: DeepPartial<MotionProfile>
): MotionProfile {
  return deepMerge(
    base as unknown as Record<string, unknown>,
    overrides as unknown as Record<string, unknown>
  ) as unknown as MotionProfile
}

/** 재귀적 deep merge (배열은 교체, 객체는 병합) */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...target }

  for (const key of Object.keys(source)) {
    const sourceVal = source[key]
    const targetVal = result[key]

    if (
      sourceVal !== null &&
      sourceVal !== undefined &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      typeof targetVal === 'object' &&
      targetVal !== null &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(
        targetVal as Record<string, unknown>,
        sourceVal as Record<string, unknown>
      )
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal
    }
  }

  return result
}
