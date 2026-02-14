"use client"

import React from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { GlowCard } from '../components/advanced/GlowCard'
import { SpotlightCard } from '../components/advanced/SpotlightCard'
import { FeatureCard } from '../components/FeatureCard'
import { useLandingTheme } from './LandingProvider'
import type { LandingFeaturesProps, LandingFeatureItem, LandingTheme } from './types'

// motion-core optional peer — inline types to avoid DTS resolution
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
  // motion-core 없으면 stagger 없이 정적 렌더링
}

const gridColsMap = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
} as const

function renderCard(
  item: LandingFeatureItem,
  cardType: LandingTheme['features']['card'],
  style?: React.CSSProperties
) {
  switch (cardType) {
    case 'glow':
      return (
        <GlowCard style={style} className="p-6">
          {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-muted-foreground text-sm">{item.description}</p>
        </GlowCard>
      )
    case 'spotlight':
      return (
        <SpotlightCard style={style} className="p-6">
          {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-muted-foreground text-sm">{item.description}</p>
        </SpotlightCard>
      )
    case 'feature-glass':
    default:
      return (
        <FeatureCard
          style={style}
          icon={undefined}
          title={item.title}
          description={item.description}
          variant="glass"
          hover="slide"
        >
          {item.icon && <div className="text-4xl mb-4">{item.icon}</div>}
        </FeatureCard>
      )
  }
}

export function LandingFeatures({
  items,
  title,
  subtitle,
  columns: columnsProp,
  card: cardProp,
  sectionProps,
  motion: motionOverride,
  staggerDelay: staggerDelayProp,
  decorator: decoratorProp,
  className,
  ...rest
}: LandingFeaturesProps) {
  const theme = useLandingTheme()
  const cardType = cardProp ?? theme.features.card
  const staggerDelay = staggerDelayProp ?? theme.features.staggerDelay
  const decorator = decoratorProp ?? theme.features.decorator
  const motion = motionOverride
    ? { ...theme.features.motion, ...motionOverride }
    : theme.features.motion

  const columns = columnsProp ?? (items.length <= 2 ? 2 : items.length <= 3 ? 3 : 4) as 2 | 3 | 4

  const header = (title || subtitle) ? { title: title ?? '', subtitle, decorator } : undefined

  // useStagger if available
  const stagger = useStagger?.({
    count: items.length,
    staggerDelay,
    duration: motion.duration,
    motionType: motion.type as 'fadeIn' | 'slideUp' | 'bounceIn',
    easing: motion.easing,
  })

  return (
    <Section
      header={header}
      spacing="lg"
      {...sectionProps}
      className={merge(className)}
      {...rest}
    >
      <div
        ref={stagger?.containerRef}
        className={merge("grid gap-6 lg:gap-8", gridColsMap[columns])}
      >
        {items.map((item, i) => (
          <div key={i}>
            {renderCard(item, cardType, stagger?.styles[i])}
          </div>
        ))}
      </div>
    </Section>
  )
}
