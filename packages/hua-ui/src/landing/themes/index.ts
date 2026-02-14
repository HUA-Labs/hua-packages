import type { LandingTheme, LandingThemeName, DeepPartial } from '../types'
import { corporate } from './corporate'
import { marketing } from './marketing'
import { product } from './product'
import { dashboard } from './dashboard'
import { app } from './app'
import { immersive } from './immersive'
import { portfolio } from './portfolio'

const themeRegistry: Record<LandingThemeName, LandingTheme> = {
  corporate,
  marketing,
  product,
  dashboard,
  app,
  immersive,
  portfolio,
}

export function resolveTheme(theme: LandingThemeName | LandingTheme): LandingTheme {
  if (typeof theme === 'string') {
    return themeRegistry[theme]
  }
  return theme
}

/** 기존 테마를 기반으로 커스텀 테마 생성 */
export function createLandingTheme(
  base: LandingThemeName,
  overrides: DeepPartial<Omit<LandingTheme, 'name'>> & { name: string }
): LandingTheme {
  const baseTheme = themeRegistry[base]
  return {
    ...baseTheme,
    name: overrides.name as LandingThemeName,
    colors: { ...baseTheme.colors, ...overrides.colors },
    hero: { ...baseTheme.hero, ...overrides.hero },
    features: { ...baseTheme.features, ...overrides.features },
    stats: { ...baseTheme.stats, ...overrides.stats },
    cta: { ...baseTheme.cta, ...overrides.cta },
    testimonials: { ...baseTheme.testimonials, ...overrides.testimonials },
    logoCloud: { ...baseTheme.logoCloud, ...overrides.logoCloud },
    showcase: { ...baseTheme.showcase, ...overrides.showcase },
  } as LandingTheme
}

export { corporate, marketing, product, dashboard, app, immersive, portfolio }
