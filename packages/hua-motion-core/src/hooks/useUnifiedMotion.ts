/**
 * @hua-labs/motion-core - useUnifiedMotion
 * 
 * 통합 Motion Hook - 단일 타입으로 여러 motion hook 중 하나를 선택
 * Unified Motion Hook - Select one of multiple motion hooks with a single type
 * 
 * React Rules of Hooks를 준수하면서 필요한 motion hook만 활성화합니다.
 * Respects React Rules of Hooks while only activating the necessary motion hook.
 */

import { useRef } from 'react';
import type { BaseMotionReturn, MotionElement, EntranceType, BaseMotionOptions } from '../types';
import { useFadeIn } from './useFadeIn';
import { useSlideUp } from './useSlideUp';
import { useSlideLeft } from './useSlideLeft';
import { useSlideRight } from './useSlideRight';
import { useScaleIn } from './useScaleIn';
import { useBounceIn } from './useBounceIn';

/**
 * useUnifiedMotion options
 */
export interface UseUnifiedMotionOptions extends Omit<BaseMotionOptions, 'autoStart'> {
  /**
   * Motion type to use
   */
  type: EntranceType;
  
  /**
   * Auto start animation
   * @default false
   */
  autoStart?: boolean;
}

/**
 * 통합 Motion Hook
 * 
 * 단일 타입으로 여러 motion hook 중 하나를 선택합니다.
 * React Rules of Hooks를 준수하기 위해 모든 hook을 호출하지만,
 * 실제로는 선택된 hook만 활성화됩니다.
 * 
 * Selects one of multiple motion hooks with a single type.
 * All hooks are called to respect React Rules of Hooks,
 * but only the selected hook is actually activated.
 * 
 * @param options - Motion options
 * @returns Motion result with ref and control functions
 * 
 * @example
 * ```tsx
 * const motion = useUnifiedMotion({
 *   type: 'fadeIn',
 *   duration: 600,
 *   autoStart: false,
 * });
 * 
 * return <div ref={motion.ref} style={motion.style}>Content</div>;
 * ```
 */
export function useUnifiedMotion<T extends MotionElement = HTMLDivElement>(
  options: UseUnifiedMotionOptions
): BaseMotionReturn<T> {
  const { type, duration = 600, autoStart = false, delay, easing, ...restOptions } = options;

  // React Rules of Hooks를 준수하기 위해 모든 hook을 호출
  // 하지만 실제로는 선택된 hook만 활성화
  // Call all hooks to respect React Rules of Hooks
  // But only the selected hook is actually activated
  
  const fadeInResult = useFadeIn<T>({
    duration,
    autoStart: false, // 항상 false로 설정하고 수동으로 start 호출
    delay,
    easing,
    ...restOptions,
  });
  
  const slideUpResult = useSlideUp<T>({
    duration,
    autoStart: false,
    delay,
    easing,
    ...restOptions,
  });
  
  const slideLeftResult = useSlideLeft<T>({
    duration,
    autoStart: false,
    delay,
    easing,
    ...restOptions,
  });
  
  const slideRightResult = useSlideRight<T>({
    duration,
    autoStart: false,
    delay,
    easing,
    ...restOptions,
  });
  
  const scaleInResult = useScaleIn<T>({
    duration,
    autoStart: false,
    delay,
    easing,
    ...restOptions,
  });
  
  const bounceInResult = useBounceIn<T>({
    duration,
    autoStart: false,
    delay,
    ...restOptions,
  });

  // 선택된 motion result 반환
  // Return the selected motion result
  switch (type) {
    case 'slideUp':
      return slideUpResult;
    case 'slideLeft':
      return slideLeftResult;
    case 'slideRight':
      return slideRightResult;
    case 'scaleIn':
      return scaleInResult;
    case 'bounceIn':
      return bounceInResult;
    case 'fadeIn':
    default:
      return fadeInResult;
  }
}
