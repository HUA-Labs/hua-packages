import { useState, useMemo, useCallback } from "react"
import { dot, dotMap } from "@hua-labs/dot/native"

/** RN style object — mirrors @hua-labs/dot's RNStyleObject */
type RNStyleObject = Record<string, string | number | Array<Record<string, string | number>> | { width: number; height: number }>

/** State-aware style map — mirrors @hua-labs/dot's DotStyleMap */
interface DotStyleMap {
  base: RNStyleObject
  hover?: RNStyleObject
  focus?: RNStyleObject
  active?: RNStyleObject
  "focus-visible"?: RNStyleObject
  "focus-within"?: RNStyleObject
  disabled?: RNStyleObject
}

/**
 * Resolve a dot utility string to an RN style object.
 */
export function resolveDot(input?: string): RNStyleObject {
  if (!input) return {}
  return dot(input)
}

/**
 * Merge multiple RN style sources. Later sources override earlier ones.
 */
export function mergeStyles(
  ...sources: (RNStyleObject | Record<string, unknown> | undefined)[]
): RNStyleObject {
  const result: Record<string, unknown> = {}
  for (const source of sources) {
    if (source) Object.assign(result, source)
  }
  return result as RNStyleObject
}

/**
 * useDotMap — RN용 interactive style 관리 훅
 *
 * hover/focus/active/disabled 상태에 따라 RN style을 자동 전환.
 * Pressable의 onHoverIn/onPressIn 등 RN 이벤트 핸들러를 반환.
 *
 * @example
 * const { style, handlers } = useDotMap(
 *   'bg-white hover:bg-gray-100 active:bg-gray-200',
 *   { disabled: isDisabled }
 * );
 * <Pressable style={style} {...handlers} />
 */
export function useDotMap(
  input: string,
  options?: { disabled?: boolean },
): {
  style: RNStyleObject
  handlers: {
    onHoverIn: () => void
    onHoverOut: () => void
    onPressIn: () => void
    onPressOut: () => void
    onFocus: () => void
    onBlur: () => void
  }
} {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const styleMap = useMemo((): DotStyleMap => {
    if (!input) return { base: {} }
    return dotMap(input)
  }, [input])

  const style = useMemo((): RNStyleObject => {
    const result: RNStyleObject = { ...(styleMap.base as RNStyleObject) }

    if (options?.disabled && styleMap.disabled) {
      Object.assign(result, styleMap.disabled as RNStyleObject)
    } else {
      if (isPressed && styleMap.active) {
        Object.assign(result, styleMap.active as RNStyleObject)
      }
      if (isHovered && styleMap.hover) {
        Object.assign(result, styleMap.hover as RNStyleObject)
      }
      if (isFocused) {
        if (styleMap["focus-visible"]) {
          Object.assign(result, styleMap["focus-visible"] as RNStyleObject)
        } else if (styleMap.focus) {
          Object.assign(result, styleMap.focus as RNStyleObject)
        }
      }
    }

    return result
  }, [styleMap, isHovered, isPressed, isFocused, options?.disabled])

  const handlers = useMemo(
    () => ({
      onHoverIn: () => setIsHovered(true),
      onHoverOut: () => setIsHovered(false),
      onPressIn: () => setIsPressed(true),
      onPressOut: () => setIsPressed(false),
      onFocus: () => setIsFocused(true),
      onBlur: () => setIsFocused(false),
    }),
    [],
  )

  return { style, handlers }
}

export type { DotStyleMap, RNStyleObject }
