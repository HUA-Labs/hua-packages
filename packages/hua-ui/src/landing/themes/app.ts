import type { LandingTheme } from '../types'

export const app: LandingTheme = {
  name: 'app',
  colors: {
    background: '0 0% 100%',
    foreground: '215 28% 17%',
    muted: '270 100% 96%',
    mutedForeground: '220 9% 46%',
    primary: '258 90% 66%',
    primaryForeground: '0 0% 100%',
    secondary: '258 20% 93%',
    secondaryForeground: '215 28% 17%',
    card: '0 0% 100%',
    cardForeground: '215 28% 17%',
    border: '220 13% 91%',
    sectionAlt: '270 100% 98%',
  },
  hero: {
    background: 'gradient',
    size: 'full',
    motion: { type: 'slideUp', duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  features: {
    card: 'feature-glass',
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
    decorator: false,
  },
  stats: {
    numberSize: 'text-5xl',
    countUp: true,
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  cta: {
    background: 'gradient-soft',
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
  },
  testimonials: {
    variant: 'carousel',
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
  logoCloud: {
    variant: 'marquee',
    speed: 50,
  },
  showcase: {
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 600, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', delay: 0 },
  },
}
