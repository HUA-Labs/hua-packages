import { cva } from 'class-variance-authority'

/**
 * HUA Spring Easing transition — 시그니처 "쫀득한" 느낌
 * cubic-bezier(0.34, 1.56, 0.64, 1)
 */
const springTransition =
  '[transition:transform_180ms_cubic-bezier(0.34,1.56,0.64,1),box-shadow_200ms_ease-out]'

export const buttonVariants = cva(
  // ── base ──
  'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 min-w-fit focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]',
  {
    variants: {
      /** 스타일 변형 */
      variant: {
        default:
          'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90',
        destructive:
          'bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90 focus-visible:ring-[var(--color-destructive)]',
        outline:
          'border-2 border-[var(--color-border)] bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] focus-visible:ring-offset-0',
        secondary:
          'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:opacity-80',
        ghost:
          'bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)] focus-visible:ring-offset-0',
        link:
          'bg-transparent text-[var(--color-primary)] underline hover:opacity-80 focus-visible:ring-offset-0',
        gradient:
          'bg-gradient-to-r from-[var(--btn-gradient-from,theme(colors.teal.500))] to-[var(--btn-gradient-to,theme(colors.cyan.500))] text-white hover:shadow-lg',
        neon:
          'bg-slate-900 dark:bg-slate-950 text-teal-400 border border-teal-500/50 shadow-lg shadow-[var(--btn-neon-glow,theme(colors.teal.500/20%))] hover:shadow-[var(--btn-neon-glow,theme(colors.teal.500/40%))] hover:border-teal-400',
        glass:
          'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 hover:bg-white/70 dark:hover:bg-slate-900/70',
      },
      /** 크기 */
      size: {
        sm: 'h-8 px-4 py-2 text-sm',
        md: 'h-10 px-6 py-2 text-base',
        lg: 'h-12 px-8 py-3 text-lg',
        xl: 'h-14 px-10 py-4 text-xl',
        icon: 'h-10 w-10 p-0',
      },
      /** 모서리 둥글기 */
      rounded: {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full',
      },
      /** 그림자 */
      shadow: {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
      },
      /** 호버 효과 — springy가 HUA-UI 시그니처 */
      hover: {
        springy: `hover:scale-[1.015] hover:shadow-md active:scale-[0.985] ${springTransition} transform-gpu`,
        scale:
          'hover:scale-[1.015] active:scale-[0.985] transition-transform duration-150 ease-out transform-gpu',
        glow: 'hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-200',
        slide: `hover:-translate-y-0.5 hover:shadow-md ${springTransition} transform-gpu`,
        none: '',
      },
      /** 전체 너비 */
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      rounded: 'md',
      shadow: 'md',
      hover: 'springy',
      fullWidth: false,
    },
  }
)

/** Gradient 프리셋 */
export const gradientPresets: Record<string, string> = {
  blue: 'from-teal-500 to-cyan-500',
  purple: 'from-purple-500 to-pink-500',
  green: 'from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400',
  orange: 'from-orange-500 to-red-500 dark:from-orange-300 dark:to-red-300',
  pink: 'from-pink-500 to-rose-500',
}

export type { VariantProps } from 'class-variance-authority'
