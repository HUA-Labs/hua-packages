"use client"

import { useState, useMemo, useCallback } from "react"
import { dotMap, dot as dotFn } from "@hua-labs/dot"
import type { DotStyleMap, StyleObject } from "@hua-labs/dot"
import { useDotEnv } from "./useDotEnv"

/**
 * useDotMap — dotMap() 기반 interactive style 관리 훅
 *
 * hover/focus/active/disabled 상태에 따라 inline style을 자동 전환합니다.
 * className 없이 순수 inline style로 동작하여 RN 호환 가능.
 * dark mode + responsive breakpoint 자동 감지.
 *
 * @example
 * const { style, handlers } = useDotMap(
 *   'bg-white hover:bg-gray-100 focus:ring-2 dark:bg-gray-900 md:p-8',
 *   { disabled: isDisabled }
 * );
 * <div style={style} {...handlers} />
 */
export function useDotMap(
  input: string,
  options?: { disabled?: boolean },
): {
  style: StyleObject;
  handlers: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
} {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const env = useDotEnv();

  const styleMap = useMemo((): DotStyleMap => {
    if (!input) return { base: {} };
    return dotMap(input, env);
  }, [input, env]);

  const style = useMemo((): StyleObject => {
    const result: StyleObject = { ...(styleMap.base as StyleObject) };

    if (options?.disabled && styleMap.disabled) {
      Object.assign(result, styleMap.disabled as StyleObject);
    } else {
      if (isHovered && styleMap.hover) {
        Object.assign(result, styleMap.hover as StyleObject);
      }
      if (isFocused) {
        if (styleMap['focus-visible']) {
          Object.assign(result, styleMap['focus-visible'] as StyleObject);
        } else if (styleMap.focus) {
          Object.assign(result, styleMap.focus as StyleObject);
        }
      }
    }

    return result;
  }, [styleMap, isHovered, isFocused, options?.disabled]);

  const handlers = useMemo(() => ({
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  }), []);

  return { style, handlers };
}

/**
 * Merge multiple style sources: variant base styles + dot prop + explicit style.
 * Later sources override earlier ones (CSS cascade equivalent).
 */
export function mergeStyles(
  ...sources: (StyleObject | React.CSSProperties | undefined)[]
): React.CSSProperties {
  const result: Record<string, unknown> = {};
  for (const source of sources) {
    if (source) Object.assign(result, source);
  }
  return result as React.CSSProperties;
}

/**
 * Resolve a dot utility string to a CSSProperties object.
 * Thin wrapper around dot() for React component usage.
 */
export function resolveDot(input?: string): React.CSSProperties {
  if (!input) return {};
  return dotFn(input) as React.CSSProperties;
}

export type { DotStyleMap, StyleObject };
