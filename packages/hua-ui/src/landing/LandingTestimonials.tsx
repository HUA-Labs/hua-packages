"use client"

import React from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { Carousel } from '../components/advanced/Carousel'
import { Marquee } from '../components/advanced/Marquee'
import { Avatar } from '../components/Avatar'
import { useLandingTheme } from './LandingProvider'
import type { LandingTestimonialsProps, LandingTestimonialItem, LandingMotionOverride } from './types'

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

function TestimonialCard({ item, style }: { item: LandingTestimonialItem; style?: React.CSSProperties }) {
  return (
    <div
      className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-6 flex flex-col gap-4"
      style={style}
    >
      <blockquote className="text-foreground/90 leading-relaxed flex-1">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        {item.avatar && (
          <Avatar size="sm" src={item.avatar} alt={item.author} />
        )}
        <div>
          <p className="font-semibold text-sm">{item.author}</p>
          {(item.role || item.company) && (
            <p className="text-xs text-muted-foreground">
              {item.role}{item.role && item.company && ', '}{item.company}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const gridColsMap = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
} as const

export function LandingTestimonials({
  items,
  title,
  subtitle,
  variant: variantProp,
  columns: colsProp,
  autoPlay = true,
  interval = 5000,
  motion: motionOverride,
  staggerDelay: staggerProp,
  className,
  ...rest
}: LandingTestimonialsProps) {
  const theme = useLandingTheme()
  const variant = variantProp ?? theme.testimonials.variant
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.testimonials.motion, ...motionOverride }
    : theme.testimonials.motion
  const staggerDelay = staggerProp ?? theme.testimonials.staggerDelay

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

  if (variant === 'marquee') {
    return (
      <Section header={header} className={className} {...rest}>
        <Marquee speed={50} pauseOnHover gradient>
          {items.map((item, i) => (
            <div key={i} className="w-80 shrink-0">
              <TestimonialCard item={item} />
            </div>
          ))}
        </Marquee>
      </Section>
    )
  }

  if (variant === 'carousel') {
    return (
      <Section header={header} className={className} {...rest}>
        <Carousel
          autoPlay={autoPlay}
          interval={interval}
          loop
          transition="fade"
          indicators="dots"
        >
          {items.map((item, i) => (
            <div key={i} className="flex justify-center px-4">
              <div className="max-w-2xl w-full">
                <TestimonialCard item={item} />
              </div>
            </div>
          ))}
        </Carousel>
      </Section>
    )
  }

  // grid variant
  const cols = colsProp ?? (items.length <= 2 ? 2 : 3) as 2 | 3
  return (
    <Section header={header} className={className} {...rest}>
      <div
        ref={stagger?.containerRef}
        className={merge("grid gap-6", gridColsMap[cols])}
      >
        {items.map((item, i) => (
          <TestimonialCard
            key={i}
            item={item}
            style={stagger?.styles[i]}
          />
        ))}
      </div>
    </Section>
  )
}
