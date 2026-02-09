/**
 * @hua-labs/hua/framework - useMotion
 * 
 * 통합 Motion Hook - motion-core의 useUnifiedMotion을 래핑
 * Unified Motion Hook - Wraps motion-core's useUnifiedMotion
 * 
 * 이 hook은 motion-core의 useUnifiedMotion을 재export하여
 * hua 프레임워크에서 일관된 API를 제공합니다.
 * 
 * This hook re-exports motion-core's useUnifiedMotion to provide
 * a consistent API within the hua framework.
 */

'use client';

import type { BaseMotionReturn, MotionElement, EntranceType } from '@hua-labs/motion-core';
import { useUnifiedMotion } from '@hua-labs/motion-core';
import type { UseUnifiedMotionOptions } from '@hua-labs/motion-core';

/**
 * Motion type (motion-core의 EntranceType과 동일)
 */
export type MotionType = EntranceType;

/**
 * useMotion options (motion-core의 UseUnifiedMotionOptions와 동일)
 */
export type UseMotionOptions = UseUnifiedMotionOptions;

/**
 * 통합 Motion Hook
 * 
 * motion-core의 useUnifiedMotion을 래핑하여 hua 프레임워크에서 사용합니다.
 * 
 * Wraps motion-core's useUnifiedMotion for use in the hua framework.
 * 
 * @param options - Motion options
 * @returns Motion result with ref and control functions
 * 
 * @example
 * ```tsx
 * const motion = useMotion({
 *   type: 'fadeIn',
 *   duration: 600,
 *   autoStart: true,
 * });
 * 
 * return <div ref={motion.ref} style={motion.style}>Content</div>;
 * ```
 */
export function useMotion<T extends MotionElement = HTMLDivElement>(
  options: UseMotionOptions
): BaseMotionReturn<T> {
  // motion-core의 useUnifiedMotion을 직접 사용
  // Directly use motion-core's useUnifiedMotion
  return useUnifiedMotion<T>(options);
}
