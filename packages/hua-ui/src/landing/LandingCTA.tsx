"use client"

import React, { useMemo } from 'react'
import { merge } from '../lib/utils'
import { Container } from '../components/Container'
import { AnimatedGradient } from '../components/advanced/AnimatedGradient'
import { useLandingTheme } from './LandingProvider'
import type { LandingCTAProps, LandingMotionOverride } from './types'

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

interface ScrollRevealResult {
  ref: React.RefObject<HTMLElement | null>
  style: React.CSSProperties
  isVisible: boolean
}

interface ScrollRevealOptions {
  motionType?: string
  duration?: number
  delay?: number
}

let useScrollReveal: ((opts: ScrollRevealOptions) => ScrollRevealResult) | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useScrollReveal = require('@hua-labs/motion-core').useScrollReveal
} catch {
  // motion-core unavailable
}

export function LandingCTA({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  background: bgProp,
  gradientColors,
  motion: motionOverride,
  className,
  ...rest
}: LandingCTAProps) {
  const theme = useLandingTheme()
  const bg = bgProp ?? theme.cta.background
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.cta.motion, ...motionOverride }
    : theme.cta.motion

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type as 'fadeIn' | 'slideUp' | 'bounceIn',
    duration: motion.duration,
    delay: motion.delay,
  })

  const fallbackStyle = useMemo<React.CSSProperties>(() => {
    if (scrollReveal) return {}
    return {
      opacity: 0,
      transform: getInitialTransform(motion.type),
      animation: `landing-cta-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
    }
  }, [scrollReveal, motion])

  return (
    <section
      className={merge(
        "relative overflow-hidden py-20 sm:py-28",
        bg === 'dark' && 'bg-gray-950 text-white',
        className
      )}
      {...rest}
    >
      {/* Background */}
      {bg === 'gradient-soft' && (
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

      <Container size="md" padding="none" centered className="relative z-10 px-6">
        <div
          ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
          style={scrollReveal?.style ?? fallbackStyle}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4">
            {title}
          </h2>

          {subtitle && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {subtitle}
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

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-cta-enter {
          to { opacity: 1; transform: none; }
        }
      `}} />
    </section>
  )
}
