import type { LandingTheme } from '../types'

export const portfolio: LandingTheme = {
  name: 'portfolio',
  colors: {
    background: '0 0% 4%',
    foreground: '0 0% 98%',
    muted: '0 0% 10%',
    mutedForeground: '0 0% 64%',
    primary: '25 95% 53%',
    primaryForeground: '0 0% 100%',
    secondary: '25 20% 12%',
    secondaryForeground: '0 0% 98%',
    card: '0 0% 8%',
    cardForeground: '0 0% 98%',
    border: '25 30% 15%',
    sectionAlt: '0 0% 6%',
  },
  hero: {
    background: 'dark',
    size: 'full',
    motion: { type: 'slideUp', duration: 800, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  features: {
    card: 'feature-glass',
    staggerDelay: 100,
    motion: { type: 'slideUp', duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
    decorator: false,
  },
  stats: {
    numberSize: 'text-5xl',
    countUp: true,
    staggerDelay: 100,
    motion: { type: 'slideUp', duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  cta: {
    background: 'dark',
    motion: { type: 'slideUp', duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  testimonials: {
    variant: 'grid',
    staggerDelay: 100,
    motion: { type: 'slideUp', duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  logoCloud: {
    variant: 'grid',
    speed: 40,
  },
  showcase: {
    staggerDelay: 100,
    motion: { type: 'slideUp', duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
}
