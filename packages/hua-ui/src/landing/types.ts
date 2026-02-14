import type { ReactNode } from 'react'
import type { SectionProps, SectionHeaderConfig } from '../components/Section'

// ── Theme ────────────────────────────────────────

export type LandingThemeName = 'corporate' | 'marketing' | 'product' | 'dashboard' | 'app' | 'immersive' | 'portfolio'

export interface LandingMotionOverride {
  type?: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'
  duration?: number
  easing?: string
  delay?: number
}

export interface LandingColorTokens {
  /** HSL triple — 페이지 배경 (e.g. "0 0% 100%") */
  background: string
  /** HSL triple — 기본 텍스트 */
  foreground: string
  /** HSL triple — 뮤트 배경 */
  muted: string
  /** HSL triple — 보조 텍스트 */
  mutedForeground: string
  /** HSL triple — 브랜드/강조색 */
  primary: string
  /** HSL triple — 강조색 위 텍스트 */
  primaryForeground: string
  /** HSL triple — 보조 색상 */
  secondary: string
  /** HSL triple — 보조 색상 위 텍스트 */
  secondaryForeground: string
  /** HSL triple — 카드 배경 */
  card: string
  /** HSL triple — 카드 텍스트 */
  cardForeground: string
  /** HSL triple — 테두리 */
  border: string
  /** HSL triple — 교차 섹션 배경 */
  sectionAlt: string
}

export interface LandingTheme {
  name: LandingThemeName
  /** 테마 색상 팔레트 */
  colors: LandingColorTokens
  hero: {
    /** 배경 스타일 */
    background: 'gradient' | 'animated-gradient' | 'dark'
    /** 히어로 사이즈 */
    size: 'xl' | 'full'
    /** 입장 모션 */
    motion: Required<LandingMotionOverride>
  }
  features: {
    /** 카드 타입 */
    card: 'spotlight' | 'glow' | 'feature-glass'
    /** stagger 딜레이 (ms) */
    staggerDelay: number
    /** 모션 타입 */
    motion: Required<LandingMotionOverride>
    /** 섹션 데코레이터 */
    decorator: boolean
  }
  stats: {
    /** 숫자 사이즈 Tailwind class */
    numberSize: string
    /** count-up 활성화 */
    countUp: boolean
    /** stagger 딜레이 (ms) */
    staggerDelay: number
    /** 모션 타입 */
    motion: Required<LandingMotionOverride>
  }
  cta: {
    /** 배경 스타일 */
    background: 'gradient-soft' | 'animated-gradient' | 'dark'
    /** 입장 모션 */
    motion: Required<LandingMotionOverride>
  }
  testimonials: {
    /** 기본 표시 방식 */
    variant: 'carousel' | 'grid' | 'marquee'
    /** stagger 딜레이 (ms) */
    staggerDelay: number
    /** 모션 타입 */
    motion: Required<LandingMotionOverride>
  }
  logoCloud: {
    /** 기본 표시 방식 */
    variant: 'marquee' | 'grid'
    /** Marquee 속도 (px/s) */
    speed: number
  }
  showcase: {
    /** stagger 딜레이 (ms) */
    staggerDelay: number
    /** 모션 타입 */
    motion: Required<LandingMotionOverride>
  }
}

// ── Provider ─────────────────────────────────────

export interface LandingProviderProps {
  theme: LandingThemeName | LandingTheme
  children: ReactNode
}

// ── Hero ─────────────────────────────────────────

export interface LandingHeroProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  description?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  /** 히어로 사이즈 오버라이드 */
  size?: 'xl' | 'full'
  /** 배경 오버라이드 */
  background?: 'gradient' | 'animated-gradient' | 'dark'
  /** AnimatedGradient 색상 */
  gradientColors?: string[]
  /** 스크롤 표시기 */
  scrollIndicator?: boolean
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
}

// ── Features ─────────────────────────────────────

export interface LandingFeatureItem {
  icon?: string
  title: string
  description: string
}

export interface LandingFeaturesProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingFeatureItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 그리드 열 수 @default items.length에 따라 자동 */
  columns?: 2 | 3 | 4
  /** 카드 타입 오버라이드 */
  card?: 'spotlight' | 'glow' | 'feature-glass'
  /** 섹션 props 오버라이드 */
  sectionProps?: Partial<SectionProps>
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
  /** 데코레이터 오버라이드 */
  decorator?: boolean
}

// ── Stats ────────────────────────────────────────

export interface LandingStatItem {
  value: string
  label: string
  /** 접두사 (예: "$") */
  prefix?: string
  /** 접미사 (예: "+", "M") */
  suffix?: string
}

export interface LandingStatsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingStatItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** count-up 오버라이드 */
  countUp?: boolean
  /** 숫자 사이즈 오버라이드 */
  numberSize?: string
  /** 섹션 props 오버라이드 */
  sectionProps?: Partial<SectionProps>
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
}

// ── CTA ──────────────────────────────────────────

export interface LandingCTAProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
  /** 배경 오버라이드 */
  background?: 'gradient-soft' | 'animated-gradient' | 'dark'
  /** AnimatedGradient 색상 */
  gradientColors?: string[]
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
}

// ── Testimonials ────────────────────────────────

export interface LandingTestimonialItem {
  quote: string
  author: string
  role?: string
  company?: string
  avatar?: string
}

export interface LandingTestimonialsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingTestimonialItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 표시 방식 @default 'carousel' */
  variant?: 'carousel' | 'grid' | 'marquee'
  /** 그리드 열 수 @default 자동 */
  columns?: 2 | 3
  /** Carousel 자동 재생 @default true */
  autoPlay?: boolean
  /** Carousel 재생 간격 (ms) @default 5000 */
  interval?: number
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
}

// ── LogoCloud ───────────────────────────────────

export interface LandingLogoItem {
  src: string
  alt: string
  href?: string
}

export interface LandingLogoCloudProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  logos: LandingLogoItem[]
  /** 섹션 제목 */
  title?: string
  /** 표시 방식 @default 'marquee' */
  variant?: 'marquee' | 'grid'
  /** Marquee 속도 (px/s) @default 50 */
  speed?: number
  /** 로고 최대 높이 (px) @default 40 */
  logoHeight?: number
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
}

// ── Showcase ────────────────────────────────────

export interface LandingShowcaseItem {
  image: string
  title: string
  description: string
}

export interface LandingShowcaseProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingShowcaseItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
}

// ── About ───────────────────────────────────────

export interface LandingSocialLink {
  icon: string
  href: string
  label: string
}

export interface LandingAboutProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  name: string
  role: string
  bio: string | ReactNode
  avatar?: string
  socialLinks?: LandingSocialLink[]
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
}

// ── Projects ────────────────────────────────────

export interface LandingProjectItem {
  title: string
  description: string
  image?: string
  tags?: string[]
  href?: string
  github?: string
}

export interface LandingProjectsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingProjectItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 그리드 열 수 @default 3 */
  columns?: 2 | 3
  /** 태그 필터 활성화 @default false */
  filter?: boolean
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
}

// ── Skills ──────────────────────────────────────

export interface LandingSkillItem {
  name: string
  level?: number
  icon?: string
  category?: string
}

export interface LandingSkillsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingSkillItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 표시 방식 @default 'grid' */
  variant?: 'bars' | 'grid' | 'marquee'
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
}

// ── Experience ──────────────────────────────────

export interface LandingExperienceItem {
  title: string
  company: string
  period: string
  description?: string
  current?: boolean
}

export interface LandingExperienceProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingExperienceItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
  /** stagger 딜레이 오버라이드 */
  staggerDelay?: number
}

// ── Metrics ─────────────────────────────────────

export interface LandingMetricItem {
  label: string
  value: number
  description?: string
}

export interface LandingMetricsTab {
  label: string
  items: LandingMetricItem[]
}

export interface LandingMetricsProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  items: LandingMetricItem[]
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 탭 그룹 (옵션) */
  tabs?: LandingMetricsTab[]
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
}

// ── Contact ─────────────────────────────────────

export interface LandingContactProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** 섹션 제목 */
  title?: string
  /** 섹션 부제목 */
  subtitle?: string
  /** 이메일 주소 */
  email?: string
  /** 소셜 링크 목록 */
  socialLinks?: LandingSocialLink[]
  /** 모션 오버라이드 */
  motion?: LandingMotionOverride
}

// ── Theme creation helper ────────────────────────

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}
