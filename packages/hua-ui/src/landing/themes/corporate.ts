import type { LandingTheme } from '../types'

export const corporate: LandingTheme = {
  name: 'corporate',
  colors: {
    background: '0 0% 100%',
    foreground: '222 47% 11%',
    muted: '210 40% 96%',
    mutedForeground: '215 16% 47%',
    primary: '217 91% 53%',
    primaryForeground: '0 0% 100%',
    secondary: '215 16% 93%',
    secondaryForeground: '222 47% 11%',
    card: '0 0% 100%',
    cardForeground: '222 47% 11%',
    border: '214 32% 91%',
    sectionAlt: '210 40% 98%',
  },
  hero: {
    background: 'gradient',
    size: 'xl',
    motion: { type: 'fadeIn', duration: 900, easing: 'ease-out', delay: 0 },
  },
  features: {
    card: 'spotlight',
    staggerDelay: 150,
    motion: { type: 'fadeIn', duration: 900, easing: 'ease-out', delay: 0 },
    decorator: true,
  },
  stats: {
    numberSize: 'text-4xl',
    countUp: false,
    staggerDelay: 150,
    motion: { type: 'fadeIn', duration: 900, easing: 'ease-out', delay: 0 },
  },
  cta: {
    background: 'gradient-soft',
    motion: { type: 'fadeIn', duration: 900, easing: 'ease-out', delay: 0 },
  },
  testimonials: {
    variant: 'grid',
    staggerDelay: 150,
    motion: { type: 'fadeIn', duration: 900, easing: 'ease-out', delay: 0 },
  },
  logoCloud: {
    variant: 'grid',
    speed: 40,
  },
  showcase: {
    staggerDelay: 150,
    motion: { type: 'fadeIn', duration: 900, easing: 'ease-out', delay: 0 },
  },
}
