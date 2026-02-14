"use client"

import React, { useMemo } from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { Marquee } from '../components/advanced/Marquee'
import { useLandingTheme } from './LandingProvider'
import type { LandingLogoCloudProps, LandingMotionOverride } from './types'

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

export function LandingLogoCloud({
  logos,
  title,
  variant: variantProp,
  speed: speedProp,
  logoHeight = 40,
  motion: motionOverride,
  className,
  ...rest
}: LandingLogoCloudProps) {
  const theme = useLandingTheme()
  const variant = variantProp ?? theme.logoCloud.variant
  const speed = speedProp ?? theme.logoCloud.speed

  // fadeIn motion for the section entrance
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.features.motion, ...motionOverride }
    : { type: 'fadeIn', duration: 800, easing: 'ease-out', delay: 0 }

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type,
    duration: motion.duration,
    delay: motion.delay,
  })

  const fallbackStyle = useMemo<React.CSSProperties>(() => {
    if (scrollReveal) return {}
    return {
      opacity: 0,
      transform: getInitialTransform(motion.type),
      animation: `landing-logocloud-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
    }
  }, [scrollReveal, motion])

  const logoElements = logos.map((logo, i) => {
    const img = (
      <img
        key={i}
        src={logo.src}
        alt={logo.alt}
        className="object-contain opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
        style={{ height: logoHeight, width: 'auto' }}
      />
    )
    if (logo.href) {
      return (
        <a key={i} href={logo.href} target="_blank" rel="noopener noreferrer" className="inline-flex">
          {img}
        </a>
      )
    }
    return img
  })

  const header = title ? { title, subtitle: undefined } : undefined

  return (
    <Section header={header} spacing="sm" className={merge("py-12 sm:py-16", className)} {...rest}>
      <div
        ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
        style={scrollReveal?.style ?? fallbackStyle}
      >
        {variant === 'marquee' ? (
          <Marquee speed={speed} pauseOnHover gradient gap={48}>
            {logoElements}
          </Marquee>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {logoElements}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-logocloud-enter {
          to { opacity: 1; transform: none; }
        }
      `}} />
    </Section>
  )
}
