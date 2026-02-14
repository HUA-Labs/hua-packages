"use client"

import React from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { useLandingTheme } from './LandingProvider'
import type { LandingExperienceProps, LandingExperienceItem, LandingMotionOverride } from './types'

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

function ExperienceItem({ item, style }: { item: LandingExperienceItem; style?: React.CSSProperties }) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0" style={style}>
      {/* Timeline dot */}
      <div
        className={merge(
          "absolute left-0 top-1.5 w-3 h-3 rounded-full border-2",
          item.current
            ? "bg-primary border-primary animate-pulse"
            : "bg-background border-border"
        )}
      />
      {/* Timeline line */}
      <div className="absolute left-[5px] top-4 bottom-0 w-0.5 bg-border" />

      {/* Content */}
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="text-lg font-bold">{item.title}</h3>
          <span className="text-sm text-muted-foreground">{item.period}</span>
        </div>
        <p className="text-base text-foreground/80 font-medium">{item.company}</p>
        {item.description && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            {item.description}
          </p>
        )}
        {item.current && (
          <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
            Current
          </span>
        )}
      </div>
    </div>
  )
}

export function LandingExperience({
  items,
  title,
  subtitle,
  motion: motionOverride,
  staggerDelay: staggerProp,
  className,
  ...rest
}: LandingExperienceProps) {
  const theme = useLandingTheme()
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.features.motion, ...motionOverride }
    : theme.features.motion
  const staggerDelay = staggerProp ?? theme.features.staggerDelay

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
      <div ref={stagger?.containerRef} className="max-w-3xl mx-auto">
        {items.map((item, i) => (
          <ExperienceItem
            key={i}
            item={item}
            style={stagger?.styles[i]}
          />
        ))}
      </div>
    </Section>
  )
}
