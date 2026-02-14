import type { LandingTheme } from '../types'

export const marketing: LandingTheme = {
  name: 'marketing',
  colors: {
    background: '260 100% 4%',
    foreground: '0 0% 100%',
    muted: '270 30% 10%',
    mutedForeground: '240 4% 65%',
    primary: '258 90% 66%',
    primaryForeground: '0 0% 100%',
    secondary: '258 30% 15%',
    secondaryForeground: '0 0% 95%',
    card: '260 40% 10%',
    cardForeground: '0 0% 100%',
    border: '258 40% 20%',
    sectionAlt: '270 50% 6%',
  },
  hero: {
    background: 'animated-gradient',
    size: 'full',
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
  },
  features: {
    card: 'glow',
    staggerDelay: 80,
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
    decorator: false,
  },
  stats: {
    numberSize: 'text-5xl',
    countUp: true,
    staggerDelay: 80,
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
  },
  cta: {
    background: 'animated-gradient',
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
  },
  testimonials: {
    variant: 'carousel',
    staggerDelay: 80,
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
  },
  logoCloud: {
    variant: 'marquee',
    speed: 60,
  },
  showcase: {
    staggerDelay: 80,
    motion: { type: 'bounceIn', duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', delay: 0 },
  },
}
