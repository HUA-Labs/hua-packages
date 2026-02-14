"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { useLandingTheme } from './LandingProvider'
import type { LandingStatsProps, LandingStatItem } from './types'

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

// ── Count-up hook ───────────────────────────────

function parseStatValue(value: string): { numeric: number; prefix: string; suffix: string } {
  const match = value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
  if (!match) return { numeric: 0, prefix: '', suffix: value }
  return {
    prefix: match[1],
    numeric: parseFloat(match[2]),
    suffix: match[3],
  }
}

function useCountUp(target: number, isVisible: boolean, duration = 1500): number {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)

  const animate = useCallback(() => {
    const start = performance.now()
    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4)
      setCurrent(eased * target)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [target, duration])

  useEffect(() => {
    if (!isVisible) return
    animate()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isVisible, animate])

  return current
}

// ── StatItem component ──────────────────────────

function StatItemDisplay({
  item,
  numberSize,
  countUp,
  isVisible,
  style,
}: {
  item: LandingStatItem
  numberSize: string
  countUp: boolean
  isVisible: boolean
  style?: React.CSSProperties
}) {
  const { numeric, prefix: parsedPrefix, suffix: parsedSuffix } = parseStatValue(item.value)
  const counted = useCountUp(numeric, countUp && isVisible)

  const displayPrefix = item.prefix ?? parsedPrefix
  const displaySuffix = item.suffix ?? parsedSuffix
  const displayValue = countUp
    ? `${displayPrefix}${Number.isInteger(numeric) ? Math.round(counted) : counted.toFixed(1)}${displaySuffix}`
    : item.value

  return (
    <div className="text-center" style={style}>
      <div className={merge("font-extrabold stat-number", numberSize)}>
        {displayValue}
      </div>
      <div className="text-muted-foreground mt-2 text-sm sm:text-base">
        {item.label}
      </div>
    </div>
  )
}

// ── LandingStats ────────────────────────────────

export function LandingStats({
  items,
  title,
  subtitle,
  countUp: countUpProp,
  numberSize: numberSizeProp,
  sectionProps,
  motion: motionOverride,
  staggerDelay: staggerDelayProp,
  className,
  ...rest
}: LandingStatsProps) {
  const theme = useLandingTheme()
  const countUp = countUpProp ?? theme.stats.countUp
  const numberSize = numberSizeProp ?? theme.stats.numberSize
  const staggerDelay = staggerDelayProp ?? theme.stats.staggerDelay
  const motion = motionOverride
    ? { ...theme.stats.motion, ...motionOverride }
    : theme.stats.motion

  const header = (title || subtitle) ? { title: title ?? '', subtitle, decorator: false } : undefined

  const stagger = useStagger?.({
    count: items.length,
    staggerDelay,
    duration: motion.duration,
    motionType: motion.type as 'fadeIn' | 'slideUp' | 'bounceIn',
    easing: motion.easing,
  })

  const gridCols = items.length <= 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : items.length <= 3
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-2 sm:grid-cols-4'

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
        className={merge("grid gap-8 lg:gap-12", gridCols)}
      >
        {items.map((item, i) => (
          <StatItemDisplay
            key={i}
            item={item}
            numberSize={numberSize}
            countUp={countUp}
            isVisible={stagger?.isVisible ?? true}
            style={stagger?.styles[i]}
          />
        ))}
      </div>
    </Section>
  )
}
