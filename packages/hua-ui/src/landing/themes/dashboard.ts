import type { LandingTheme } from '../types'

export const dashboard: LandingTheme = {
  name: 'dashboard',
  colors: {
    background: '222 47% 11%',
    foreground: '214 32% 91%',
    muted: '222 42% 16%',
    mutedForeground: '215 20% 65%',
    primary: '217 91% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '217 30% 18%',
    secondaryForeground: '214 32% 91%',
    card: '222 47% 14%',
    cardForeground: '214 32% 91%',
    border: '217 30% 22%',
    sectionAlt: '222 42% 14%',
  },
  hero: {
    background: 'gradient',
    size: 'xl',
    motion: { type: 'fadeIn', duration: 650, easing: 'ease-out', delay: 0 },
  },
  features: {
    card: 'feature-glass',
    staggerDelay: 100,
    motion: { type: 'scaleIn', duration: 650, easing: 'ease-out', delay: 0 },
    decorator: false,
  },
  stats: {
    numberSize: 'text-4xl',
    countUp: true,
    staggerDelay: 100,
    motion: { type: 'fadeIn', duration: 650, easing: 'ease-out', delay: 0 },
  },
  cta: {
    background: 'gradient-soft',
    motion: { type: 'fadeIn', duration: 650, easing: 'ease-out', delay: 0 },
  },
  testimonials: {
    variant: 'grid',
    staggerDelay: 100,
    motion: { type: 'scaleIn', duration: 650, easing: 'ease-out', delay: 0 },
  },
  logoCloud: {
    variant: 'marquee',
    speed: 45,
  },
  showcase: {
    staggerDelay: 100,
    motion: { type: 'scaleIn', duration: 650, easing: 'ease-out', delay: 0 },
  },
}
