"use client"

import React from 'react'
import { Section } from '../components/Section'
import { Container } from '../components/Container'
import { Avatar } from '../components/Avatar'
import { Icon } from '../components/Icon/Icon'
import { useLandingTheme } from './LandingProvider'
import type { LandingAboutProps, LandingMotionOverride } from './types'

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

export function LandingAbout({
  name,
  role,
  bio,
  avatar,
  socialLinks,
  motion: motionOverride,
  className,
  ...rest
}: LandingAboutProps) {
  const theme = useLandingTheme()
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.hero.motion, ...motionOverride }
    : theme.hero.motion

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type as 'fadeIn' | 'slideUp',
    duration: motion.duration,
    delay: motion.delay,
  })

  const fallbackStyle: React.CSSProperties = scrollReveal ? {} : {
    opacity: 0,
    transform: motion.type === 'slideUp' ? 'translateY(32px)' : 'none',
    animation: `landing-about-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
  }

  return (
    <Section className={className} {...rest}>
      <Container size="lg" padding="none" centered>
        <div
          ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
          style={scrollReveal?.style ?? fallbackStyle}
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
          {/* Avatar */}
          {avatar && (
            <div className="flex-shrink-0">
              <Avatar
                size="lg"
                src={avatar}
                alt={name}
                className="w-32 h-32 md:w-40 md:h-40"
              />
            </div>
          )}

          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold mb-2">{name}</h2>
            <p className="text-xl text-muted-foreground mb-4">{role}</p>
            <div className="text-foreground/90 leading-relaxed mb-6">
              {typeof bio === 'string' ? <p>{bio}</p> : bio}
            </div>

            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex gap-4 justify-center md:justify-start">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={link.label}
                  >
                    <Icon name={link.icon as any} size={24} />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-about-enter {
          to { opacity: 1; transform: none; }
        }
      `}} />
    </Section>
  )
}
