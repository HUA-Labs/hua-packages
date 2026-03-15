import type { StyleObject, DotConfig } from '../types';
import { ANIMATE_ENTER_EXIT, FADE_OPACITY_STEPS, SLIDE_SPACING_STEPS } from '../tokens/animations';

/**
 * Resolve animation tokens:
 * - animate-spin  → { animation: 'spin 1s linear infinite' }
 * - animate-none  → { animation: 'none' }
 * - animate-in    → enter keyframe trigger (tailwindcss-animate)
 * - animate-out   → exit keyframe trigger (tailwindcss-animate)
 */
export function resolveAnimation(_prefix: string, value: string, config: DotConfig): StyleObject {
  // tailwindcss-animate: animate-in / animate-out
  const enterExit = ANIMATE_ENTER_EXIT[value];
  if (enterExit !== undefined) {
    return { ...enterExit };
  }

  // Standard Tailwind animation tokens (spin, ping, pulse, bounce, none)
  const anim = config.tokens.animation[value];
  if (anim !== undefined) {
    return { animation: anim };
  }
  return {};
}

/**
 * Resolve fade-in / fade-out enter/exit opacity CSS variables.
 *
 * tailwindcss-animate pattern:
 * - `fade-in`       → `--tw-enter-opacity: 1`   (bare, full opacity start)
 * - `fade-in-0`     → `--tw-enter-opacity: 0`
 * - `fade-in-50`    → `--tw-enter-opacity: 0.5`
 * - `fade-out`      → `--tw-exit-opacity: 1`
 * - `fade-out-0`    → `--tw-exit-opacity: 0`
 *
 * Prefix is 'fade', value is 'in', 'in-0', 'in-50', 'out', 'out-0', etc.
 */
export function resolveFadeAnimation(_prefix: string, value: string, _config: DotConfig): StyleObject {
  // 'in' bare → --tw-enter-opacity: 1
  if (value === 'in') {
    return { '--tw-enter-opacity': '1' } as StyleObject;
  }
  // 'out' bare → --tw-exit-opacity: 1
  if (value === 'out') {
    return { '--tw-exit-opacity': '1' } as StyleObject;
  }

  // 'in-{n}' → parse step
  if (value.startsWith('in-')) {
    const step = value.slice(3);
    const opacity = FADE_OPACITY_STEPS[step];
    if (opacity !== undefined) {
      return { '--tw-enter-opacity': opacity } as StyleObject;
    }
    return {};
  }

  // 'out-{n}' → parse step
  if (value.startsWith('out-')) {
    const step = value.slice(4);
    const opacity = FADE_OPACITY_STEPS[step];
    if (opacity !== undefined) {
      return { '--tw-exit-opacity': opacity } as StyleObject;
    }
    return {};
  }

  return {};
}

/**
 * Resolve zoom-in / zoom-out enter/exit scale CSS variables.
 *
 * tailwindcss-animate pattern:
 * - `zoom-in`     → `--tw-enter-scale: 1`
 * - `zoom-in-50`  → `--tw-enter-scale: 0.5`
 * - `zoom-out`    → `--tw-exit-scale: 1`
 * - `zoom-out-50` → `--tw-exit-scale: 0.5`
 *
 * Prefix is 'zoom', value is 'in', 'in-0', 'in-50', 'out', 'out-0', etc.
 * Shares the same numeric step table as fade (0–100).
 */
export function resolveZoomAnimation(_prefix: string, value: string, _config: DotConfig): StyleObject {
  if (value === 'in') {
    return { '--tw-enter-scale': '1' } as StyleObject;
  }
  if (value === 'out') {
    return { '--tw-exit-scale': '1' } as StyleObject;
  }
  if (value.startsWith('in-')) {
    const step = value.slice(3);
    const scale = FADE_OPACITY_STEPS[step]; // same 0–100 → decimal mapping
    if (scale !== undefined) {
      return { '--tw-enter-scale': scale } as StyleObject;
    }
    return {};
  }
  if (value.startsWith('out-')) {
    const step = value.slice(4);
    const scale = FADE_OPACITY_STEPS[step];
    if (scale !== undefined) {
      return { '--tw-exit-scale': scale } as StyleObject;
    }
    return {};
  }
  return {};
}

/**
 * Resolve slide-in-from-{direction}-{amount} CSS variable.
 *
 * tailwindcss-animate pattern:
 * - `slide-in-from-top-2`    → `--tw-enter-translate-y: -8px`
 * - `slide-in-from-bottom-2` → `--tw-enter-translate-y: 8px`
 * - `slide-in-from-left-2`   → `--tw-enter-translate-x: -8px`
 * - `slide-in-from-right-2`  → `--tw-enter-translate-x: 8px`
 *
 * The prefix encodes the direction (e.g. 'slide-in-from-top'),
 * the value is the spacing step (e.g. '2' → '8px').
 *
 * Bare prefix with no amount sets the variable to '100%' (full slide).
 */
export function resolveSlideIn(prefix: string, value: string, _config: DotConfig): StyleObject {
  const direction = prefix.replace('slide-in-from-', '') as 'top' | 'bottom' | 'left' | 'right';

  // Determine CSS variable and sign based on direction
  const isVertical = direction === 'top' || direction === 'bottom';
  const cssVar = isVertical ? '--tw-enter-translate-y' : '--tw-enter-translate-x';
  const negative = direction === 'top' || direction === 'left';

  // Bare prefix (no amount) → 100%
  if (value === '') {
    const raw = '100%';
    return { [cssVar]: negative ? `-${raw}` : raw } as StyleObject;
  }

  const spacing = SLIDE_SPACING_STEPS[value];
  if (spacing === undefined) return {};

  // Zero value has no sign
  if (spacing === '0px' || spacing === '0') {
    return { [cssVar]: spacing } as StyleObject;
  }

  return { [cssVar]: negative ? `-${spacing}` : spacing } as StyleObject;
}

/**
 * Resolve slide-out-to-{direction}-{amount} CSS variable.
 *
 * tailwindcss-animate pattern:
 * - `slide-out-to-top-2`    → `--tw-exit-translate-y: -8px`
 * - `slide-out-to-bottom-2` → `--tw-exit-translate-y: 8px`
 * - `slide-out-to-left-2`   → `--tw-exit-translate-x: -8px`
 * - `slide-out-to-right-2`  → `--tw-exit-translate-x: 8px`
 */
export function resolveSlideOut(prefix: string, value: string, _config: DotConfig): StyleObject {
  const direction = prefix.replace('slide-out-to-', '') as 'top' | 'bottom' | 'left' | 'right';

  const isVertical = direction === 'top' || direction === 'bottom';
  const cssVar = isVertical ? '--tw-exit-translate-y' : '--tw-exit-translate-x';
  const negative = direction === 'top' || direction === 'left';

  if (value === '') {
    const raw = '100%';
    return { [cssVar]: negative ? `-${raw}` : raw } as StyleObject;
  }

  const spacing = SLIDE_SPACING_STEPS[value];
  if (spacing === undefined) return {};

  if (spacing === '0px' || spacing === '0') {
    return { [cssVar]: spacing } as StyleObject;
  }

  return { [cssVar]: negative ? `-${spacing}` : spacing } as StyleObject;
}
