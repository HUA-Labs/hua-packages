/**
 * @hua-labs/ui/theme — Lightweight theme subpath
 *
 * ThemeProvider와 useTheme만 포함합니다.
 * Phosphor Icons 등 무거운 의존성 없이 테마 기능만 필요한 경우 사용하세요.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, useTheme } from '@hua-labs/ui/theme'
 * ```
 */
export { ThemeProvider, useTheme } from './components/ThemeProvider'
export type { ThemeProviderProps, ThemeProviderState } from './components/ThemeProvider'
