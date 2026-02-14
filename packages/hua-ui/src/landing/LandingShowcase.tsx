"use client"

import React from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { Container } from '../components/Container'
import { useLandingTheme } from './LandingProvider'
import type { LandingShowcaseProps, LandingMotionOverride } from './types'

interface StaggerResult {
  containerRef: React.RefObject<HTMLDivElement | null>
  styles: React.CSSProperties[]
  isVisible: boolean
}
interface StaggerOptions {
  count: number
  staggerDelay?: number
  duration?: number
  motionType?: string
  easing?: string
}

let useStagger: ((opts: StaggerOptions) => StaggerResult) | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useStagger = require('@hua-labs/motion-core').useStagger
} catch {
  // motion-core unavailable
}

export function LandingShowcase({
  items,
  title,
  subtitle,
  motion: motionOverride,
  staggerDelay: staggerProp,
  className,
  ...rest
}: LandingShowcaseProps) {
  const theme = useLandingTheme()
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.showcase.motion, ...motionOverride }
    : theme.showcase.motion
  const staggerDelay = staggerProp ?? theme.showcase.staggerDelay

  const stagger = useStagger?.({
    count: items.length,
    staggerDelay,
    duration: motion.duration,
    motionType: motion.type,
    easing: motion.easing,
  })

  const header = (title || subtitle)
    ? { title: title ?? '', subtitle }
    : undefined

  return (
    <Section header={header} className={className} {...rest}>
      <div ref={stagger?.containerRef} className="space-y-16 sm:space-y-24">
        {items.map((item, i) => {
          const isEven = i % 2 === 0
          return (
            <Container key={i} size="lg" padding="none" className="px-4">
              <div
                className={merge(
                  "flex flex-col gap-8 items-center",
                  isEven ? "md:flex-row" : "md:flex-row-reverse"
                )}
                style={stagger?.styles[i]}
              >
                {/* Image */}
                <div className="flex-1 w-full">
                  <div className="relative overflow-hidden rounded-xl border border-border/30 shadow-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>

                {/* Text */}
                <div className="flex-1 w-full space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-bold">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </Container>
          )
        })}
      </div>
    </Section>
  )
}
