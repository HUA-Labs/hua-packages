"use client"

import React, { useMemo } from 'react'
import { merge } from '../lib/utils'
import { Container } from '../components/Container'
import { AnimatedGradient } from '../components/advanced/AnimatedGradient'
import { useLandingTheme } from './LandingProvider'
import type { LandingHeroProps, LandingMotionOverride } from './types'

function resolveMotion(
  themeMotion: Required<LandingMotionOverride>,
  override?: LandingMotionOverride
): Required<LandingMotionOverride> {
  if (!override) return themeMotion
  return { ...themeMotion, ...override }
}

function getInitialTransform(type: string): string {
  switch (type) {
    case 'slideUp': return 'translateY(32px)'
    case 'slideLeft': return 'translateX(-32px)'
    case 'slideRight': return 'translateX(32px)'
    case 'scaleIn': return 'scale(0.95)'
    case 'bounceIn': return 'scale(0.75)'
    default: return 'none'
  }
}

export function LandingHero({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  size: sizeProp,
  background: bgProp,
  gradientColors,
  scrollIndicator = false,
  motion: motionOverride,
  className,
  ...rest
}: LandingHeroProps) {
  const theme = useLandingTheme()
  const size = sizeProp ?? theme.hero.size
  const bg = bgProp ?? theme.hero.background
  const motion = resolveMotion(theme.hero.motion, motionOverride)

  const contentStyle = useMemo<React.CSSProperties>(() => ({
    opacity: 0,
    transform: getInitialTransform(motion.type),
    animation: `landing-hero-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
  }), [motion])

  return (
    <section
      className={merge(
        "relative overflow-hidden flex items-center justify-center",
        size === 'full' ? 'min-h-screen' : 'py-28 sm:py-36',
        bg === 'dark' && 'bg-gray-950 text-white',
        className
      )}
      {...rest}
    >
      {/* Background layer */}
      {bg === 'gradient' && (
        <div className="absolute inset-0 gradient-bg-soft" aria-hidden="true" />
      )}
      {bg === 'animated-gradient' && (
        <AnimatedGradient
          colors={gradientColors}
          type="mesh"
          className="absolute inset-0 -z-0"
          aria-hidden="true"
        />
      )}
      {bg === 'dark' && (
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(120, 119, 198, 0.08), transparent)',
          }}
          aria-hidden="true"
        />
      )}

      {/* Content */}
      <Container size="lg" padding="none" centered className="relative z-10 px-6">
        <div style={contentStyle} className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            {title}
          </h1>

          {subtitle && (
            <p className="text-xl sm:text-2xl text-muted-foreground mb-4">
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto mb-8">
              {description}
            </p>
          )}

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {primaryAction}
              {secondaryAction}
            </div>
          )}
        </div>
      </Container>

      {/* Scroll indicator */}
      {scrollIndicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      )}

      {/* Keyframe injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-hero-enter {
          to { opacity: 1; transform: none; }
        }
      `}} />
    </section>
  )
}
