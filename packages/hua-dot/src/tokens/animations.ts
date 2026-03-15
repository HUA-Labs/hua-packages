/** Animation shorthand values (name + duration + timing + iteration) */
export const ANIMATION: Record<string, string> = {
  'none': 'none',
  'spin': 'spin 1s linear infinite',
  'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
  'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'bounce': 'bounce 1s infinite',
} as const;

/**
 * tailwindcss-animate entry/exit animation triggers.
 *
 * `animate-in` starts a composable enter animation using the `enter` keyframe.
 * CSS variables (`--tw-enter-*`) set by sibling utilities (fade-in, slide-in-from-*)
 * are picked up by the keyframe to produce the composed effect.
 *
 * `animate-out` works identically with the `exit` keyframe.
 */
export const ANIMATE_ENTER_EXIT: Record<string, Record<string, string>> = {
  'in': {
    animationName: 'enter',
    animationDuration: '150ms',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'both',
  },
  'out': {
    animationName: 'exit',
    animationDuration: '150ms',
    animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    animationFillMode: 'both',
  },
} as const;

/**
 * Opacity step values for fade-in-{n} / fade-out-{n}.
 *
 * Supported: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50,
 *            55, 60, 65, 70, 75, 80, 85, 90, 95, 100.
 *
 * Maps n → decimal string (e.g. 50 → '0.5').
 * fade-in (bare, no suffix) → 1.
 */
export const FADE_OPACITY_STEPS: Record<string, string> = {
  '0': '0',
  '5': '0.05',
  '10': '0.1',
  '15': '0.15',
  '20': '0.2',
  '25': '0.25',
  '30': '0.3',
  '35': '0.35',
  '40': '0.4',
  '45': '0.45',
  '50': '0.5',
  '55': '0.55',
  '60': '0.6',
  '65': '0.65',
  '70': '0.7',
  '75': '0.75',
  '80': '0.8',
  '85': '0.85',
  '90': '0.9',
  '95': '0.95',
  '100': '1',
} as const;

/**
 * Spacing step values for slide-in/slide-out translate values.
 *
 * Maps Tailwind spacing tokens (0, 0.5, 1 … 96, px, 1/2 … full) to px/% strings.
 */
export const SLIDE_SPACING_STEPS: Record<string, string> = {
  '0': '0px',
  'px': '1px',
  '0.5': '2px',
  '1': '4px',
  '1.5': '6px',
  '2': '8px',
  '2.5': '10px',
  '3': '12px',
  '3.5': '14px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '7': '28px',
  '8': '32px',
  '9': '36px',
  '10': '40px',
  '11': '44px',
  '12': '48px',
  '14': '56px',
  '16': '64px',
  '20': '80px',
  '24': '96px',
  '28': '112px',
  '32': '128px',
  '36': '144px',
  '40': '160px',
  '44': '176px',
  '48': '192px',
  '52': '208px',
  '56': '224px',
  '60': '240px',
  '64': '256px',
  '72': '288px',
  '80': '320px',
  '96': '384px',
  '1/2': '50%',
  '1/3': '33.333333%',
  '2/3': '66.666667%',
  '1/4': '25%',
  '3/4': '75%',
  'full': '100%',
} as const;
