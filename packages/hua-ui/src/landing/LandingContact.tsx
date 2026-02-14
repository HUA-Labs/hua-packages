"use client"

import React from 'react'
import { Section } from '../components/Section'
import { Container } from '../components/Container'
import { Icon } from '../components/Icon/Icon'
import { useLandingTheme } from './LandingProvider'
import type { LandingContactProps, LandingMotionOverride } from './types'

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

export function LandingContact({
  title = 'Get in Touch',
  subtitle,
  email,
  socialLinks,
  motion: motionOverride,
  className,
  ...rest
}: LandingContactProps) {
  const theme = useLandingTheme()
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.cta.motion, ...motionOverride }
    : theme.cta.motion

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type as 'fadeIn' | 'slideUp',
    duration: motion.duration,
    delay: motion.delay,
  })

  const fallbackStyle: React.CSSProperties = scrollReveal ? {} : {
    opacity: 0,
    transform: motion.type === 'slideUp' ? 'translateY(32px)' : 'none',
    animation: `landing-contact-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
  }

  const header = (title || subtitle)
    ? { title: title ?? '', subtitle }
    : undefined

  return (
    <Section header={header} className={className} {...rest}>
      <Container size="md" padding="none" centered>
        <div
          ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
          style={scrollReveal?.style ?? fallbackStyle}
          className="text-center space-y-6"
        >
          {/* Email */}
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-block text-2xl sm:text-3xl font-bold text-primary hover:underline"
            >
              {email}
            </a>
          )}

          {/* Social Links */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex gap-4 justify-center">
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
                  aria-label={link.label}
                >
                  <Icon name={link.icon as any} size={24} />
                </a>
              ))}
            </div>
          )}
        </div>
      </Container>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-contact-enter {
          to { opacity: 1; transform: none; }
        }
      `}} />
    </Section>
  )
}
