import { SlideOptions, BaseMotionReturn, MotionElement } from '../types'
import { useSlideUp } from './useSlideUp'

/**
 * useSlideRight - 왼쪽에서 오른쪽으로 슬라이드하며 나타나는 애니메이션 훅
 *
 * useSlideUp의 wrapper로, direction: 'right'를 기본값으로 사용합니다.
 * IntersectionObserver를 통해 뷰포트 진입 시 자동으로 애니메이션이 시작됩니다.
 *
 * @example
 * ```tsx
 * const slideRight = useSlideRight({ duration: 700, distance: 50 });
 *
 * return (
 *   <div ref={slideRight.ref} style={slideRight.style}>
 *     Content slides in from left
 *   </div>
 * );
 * ```
 */
export function useSlideRight<T extends MotionElement = HTMLDivElement>(
  options: Omit<SlideOptions, 'direction'> = {}
): BaseMotionReturn<T> {
  return useSlideUp<T>({ ...options, direction: 'right' })
}
