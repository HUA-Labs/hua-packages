import { SlideOptions, BaseMotionReturn, MotionElement } from '../types'
import { useSlideUp } from './useSlideUp'

/**
 * useSlideLeft - 오른쪽에서 왼쪽으로 슬라이드하며 나타나는 애니메이션 훅
 *
 * useSlideUp의 wrapper로, direction: 'left'를 기본값으로 사용합니다.
 * IntersectionObserver를 통해 뷰포트 진입 시 자동으로 애니메이션이 시작됩니다.
 *
 * @example
 * ```tsx
 * const slideLeft = useSlideLeft({ duration: 700, distance: 50 });
 *
 * return (
 *   <div ref={slideLeft.ref} style={slideLeft.style}>
 *     Content slides in from right
 *   </div>
 * );
 * ```
 */
export function useSlideLeft<T extends MotionElement = HTMLDivElement>(
  options: Omit<SlideOptions, 'direction'> = {}
): BaseMotionReturn<T> {
  return useSlideUp<T>({ ...options, direction: 'left' })
}
