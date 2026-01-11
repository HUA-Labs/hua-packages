/**
 * HUA-UI Micro Motion System
 *
 * "스륵 부드럽고 아주 조금 쫀득" - HUA-UI의 고유 모션 아이덴티티
 *
 * @example
 * ```tsx
 * import { useMicroMotion, getMicroMotionClasses } from '@hua-labs/ui'
 *
 * // Hook 사용
 * const { handlers, style } = useMicroMotion({ preset: 'springy' })
 *
 * // 또는 CSS 클래스만 사용
 * const className = getMicroMotionClasses('springy')
 * ```
 */

export * from './types'
export * from './presets'
export * from './useMicroMotion'
