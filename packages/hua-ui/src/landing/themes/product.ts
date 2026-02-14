import type { LandingTheme } from '../types'

export const product: LandingTheme = {
  name: 'product',
  colors: {
    background: '240 6% 4%',
    foreground: '0 0% 98%',
    muted: '240 5% 11%',
    mutedForeground: '240 4% 64%',
    primary: '188 96% 42%',
    primaryForeground: '0 0% 100%',
    secondary: '188 20% 12%',
    secondaryForeground: '0 0% 98%',
    card: '240 5% 10%',
    cardForeground: '0 0% 98%',
    border: '240 4% 16%',
    sectionAlt: '240 6% 7%',
  },
  hero: {
    background: 'dark',
    size: 'full',
    motion: { type: 'slideUp', duration: 700, easing: 'ease-in-out', delay: 0 },
  },
  features: {
    card: 'feature-glass',
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 700, easing: 'ease-in-out', delay: 0 },
    decorator: false,
  },
  stats: {
    numberSize: 'text-6xl',
    countUp: true,
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 700, easing: 'ease-in-out', delay: 0 },
  },
  cta: {
    background: 'dark',
    motion: { type: 'slideUp', duration: 700, easing: 'ease-in-out', delay: 0 },
  },
  testimonials: {
    variant: 'carousel',
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 700, easing: 'ease-in-out', delay: 0 },
  },
  logoCloud: {
    variant: 'marquee',
    speed: 40,
  },
  showcase: {
    staggerDelay: 120,
    motion: { type: 'slideUp', duration: 700, easing: 'ease-in-out', delay: 0 },
  },
}
