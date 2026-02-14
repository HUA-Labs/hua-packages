export { LandingProvider, useLandingTheme } from './LandingProvider'
export { LandingHero } from './LandingHero'
export { LandingFeatures } from './LandingFeatures'
export { LandingStats } from './LandingStats'
export { LandingCTA } from './LandingCTA'
export { LandingTestimonials } from './LandingTestimonials'
export { LandingLogoCloud } from './LandingLogoCloud'
export { LandingShowcase } from './LandingShowcase'
export { LandingAbout } from './LandingAbout'
export { LandingProjects } from './LandingProjects'
export { LandingSkills } from './LandingSkills'
export { LandingExperience } from './LandingExperience'
export { LandingMetrics } from './LandingMetrics'
export { LandingContact } from './LandingContact'
export { createLandingTheme, resolveTheme, corporate, marketing, product, dashboard, app, immersive, portfolio } from './themes'

export type {
  LandingThemeName,
  LandingTheme,
  LandingColorTokens,
  LandingMotionOverride,
  LandingProviderProps,
  LandingHeroProps,
  LandingFeaturesProps,
  LandingFeatureItem,
  LandingStatsProps,
  LandingStatItem,
  LandingCTAProps,
  LandingTestimonialsProps,
  LandingTestimonialItem,
  LandingLogoCloudProps,
  LandingLogoItem,
  LandingShowcaseProps,
  LandingShowcaseItem,
  LandingAboutProps,
  LandingSocialLink,
  LandingProjectsProps,
  LandingProjectItem,
  LandingSkillsProps,
  LandingSkillItem,
  LandingExperienceProps,
  LandingExperienceItem,
  LandingMetricsProps,
  LandingMetricItem,
  LandingMetricsTab,
  LandingContactProps,
  DeepPartial,
} from './types'

// ── Landing namespace (convenience) ─────────────

import { LandingProvider } from './LandingProvider'
import { LandingHero } from './LandingHero'
import { LandingFeatures } from './LandingFeatures'
import { LandingStats } from './LandingStats'
import { LandingCTA } from './LandingCTA'
import { LandingTestimonials } from './LandingTestimonials'
import { LandingLogoCloud } from './LandingLogoCloud'
import { LandingShowcase } from './LandingShowcase'
import { LandingAbout } from './LandingAbout'
import { LandingProjects } from './LandingProjects'
import { LandingSkills } from './LandingSkills'
import { LandingExperience } from './LandingExperience'
import { LandingMetrics } from './LandingMetrics'
import { LandingContact } from './LandingContact'

export const Landing = {
  Provider: LandingProvider,
  Hero: LandingHero,
  Features: LandingFeatures,
  Stats: LandingStats,
  CTA: LandingCTA,
  Testimonials: LandingTestimonials,
  LogoCloud: LandingLogoCloud,
  Showcase: LandingShowcase,
  About: LandingAbout,
  Projects: LandingProjects,
  Skills: LandingSkills,
  Experience: LandingExperience,
  Metrics: LandingMetrics,
  Contact: LandingContact,
} as const
