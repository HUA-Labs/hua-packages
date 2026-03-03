'use client';

import { useMemo, useState, useCallback } from 'react';
import { dot, dotMap } from '@hua-labs/dot';
import type { DotOptions, StyleObject, DotStyleMap, DotState } from '@hua-labs/dot';

/**
 * Memoized dot() wrapper for React components.
 *
 * @example
 * const style = useDot('p-4 flex bg-card rounded-lg', { dark });
 * <div style={style}>...</div>
 */
export function useDot(input: string, options?: DotOptions): StyleObject {
  return useMemo(
    () => dot(input, options) as StyleObject,
    [input, options?.dark, options?.breakpoint, options?.target],
  );
}

/** Event handlers returned by useDotMap */
export interface DotEventHandlers {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
}

/** Return type of useDotMap */
export interface UseDotMapResult {
  style: StyleObject;
  handlers: DotEventHandlers;
}

const STATE_KEYS: DotState[] = ['hover', 'focus', 'active', 'focus-visible', 'focus-within', 'disabled'];

/**
 * Memoized dotMap() wrapper with automatic state management.
 *
 * Tracks hover/focus/active states internally and merges the appropriate
 * style overrides, returning a single `style` object + event `handlers`.
 *
 * @example
 * const { style, handlers } = useDotMap('p-4 bg-card hover:bg-muted');
 * <div style={style} {...handlers}>...</div>
 */
export function useDotMap(input: string, options?: DotOptions): UseDotMapResult {
  const map = useMemo(
    () => dotMap(input, options),
    [input, options?.dark, options?.breakpoint, options?.target],
  );

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);

  const onMouseEnter = useCallback(() => setHovered(true), []);
  const onMouseLeave = useCallback(() => { setHovered(false); setActive(false); }, []);
  const onFocus = useCallback(() => setFocused(true), []);
  const onBlur = useCallback(() => setFocused(false), []);
  const onMouseDown = useCallback(() => setActive(true), []);
  const onMouseUp = useCallback(() => setActive(false), []);

  // Determine which state styles have any entries
  const hasStates = useMemo(() => {
    const result: Partial<Record<DotState, boolean>> = {};
    for (const key of STATE_KEYS) {
      if (map[key] && Object.keys(map[key]!).length > 0) {
        result[key] = true;
      }
    }
    return result;
  }, [map]);

  // Merge base + active state styles
  const style = useMemo(() => {
    const merged: StyleObject = { ...(map.base as StyleObject) };
    if (hovered && hasStates.hover) Object.assign(merged, map.hover);
    if (focused && hasStates.focus) Object.assign(merged, map.focus);
    if (focused && hasStates['focus-visible']) Object.assign(merged, map['focus-visible']);
    if (focused && hasStates['focus-within']) Object.assign(merged, map['focus-within']);
    if (active && hasStates.active) Object.assign(merged, map.active);
    return merged;
  }, [map, hovered, focused, active, hasStates]);

  // Only include handlers for states that have style entries
  const handlers = useMemo((): DotEventHandlers => {
    const h: DotEventHandlers = {};
    if (hasStates.hover) {
      h.onMouseEnter = onMouseEnter;
      h.onMouseLeave = onMouseLeave;
    }
    if (hasStates.focus || hasStates['focus-visible'] || hasStates['focus-within']) {
      h.onFocus = onFocus;
      h.onBlur = onBlur;
    }
    if (hasStates.active) {
      h.onMouseDown = onMouseDown;
      h.onMouseUp = onMouseUp;
    }
    return h;
  }, [hasStates, onMouseEnter, onMouseLeave, onFocus, onBlur, onMouseDown, onMouseUp]);

  return { style, handlers };
}
