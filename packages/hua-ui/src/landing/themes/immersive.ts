import type { LandingTheme } from '../types'

export const immersive: LandingTheme = {
  name: 'immersive',
  colors: {
    background: '0 0% 0%',
    foreground: '0 0% 100%',
    muted: '0 0% 7%',
    mutedForeground: '0 0% 45%',
    primary: '252 92% 76%',
    primaryForeground: '0 0% 100%',
    secondary: '252 15% 12%',
    secondaryForeground: '0 0% 95%',
    card: '0 0% 5%',
    cardForeground: '0 0% 100%',
    border: '0 0% 10%',
    sectionAlt: '0 0% 4%',
  },
  hero: {
    background: 'dark',
    size: 'full',
    motion: { type: 'fadeIn', duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0 },
  },
  features: {
    card: 'glow',
    staggerDelay: 200,
    motion: { type: 'slideUp', duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0 },
    decorator: false,
  },
  stats: {
    numberSize: 'text-6xl',
    countUp: true,
    staggerDelay: 200,
    motion: { type: 'fadeIn', duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0 },
  },
  cta: {
    background: 'dark',
    motion: { type: 'fadeIn', duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0 },
  },
  testimonials: {
    variant: 'marquee',
    staggerDelay: 200,
    motion: { type: 'fadeIn', duration: 1200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0 },
  },
  logoCloud: {
    variant: 'marquee',
    speed: 30,
  },
  showcase: {
    staggerDelay: 200,
    motion: { type: 'slideUp', duration: 900, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', delay: 0 },
  },
}
