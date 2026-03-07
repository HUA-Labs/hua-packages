"use client"

import React, { useState, useEffect } from 'react'
import { merge } from '../lib/utils'
import { dot } from '@hua-labs/dot'
import { mergeStyles } from '../hooks/useDotMap'
import { Section } from '../components/Section'
import { useLandingTheme } from './LandingProvider'
import type { LandingMetricsProps, LandingMetricItem, LandingMotionOverride } from './types'

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

function getMetricColor(value: number): { bar: string; text: string } {
  if (value >= 90) return { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400' }
  if (value >= 50) return { bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' }
  return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' }
}

function MetricBar({ item, delay = 0 }: { item: LandingMetricItem; delay?: number }) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const color = getMetricColor(item.value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(item.value)
    }, delay)
    return () => clearTimeout(timer)
  }, [item.value, delay])

  return (
    <div style={dot("space-y-2")}>
      <div style={dot("flex justify-between items-center")}>
        <span style={dot("text-sm font-medium")}>{item.label}</span>
        <span style={dot(merge("text-2xl font-bold", color.text))}>
          {Math.round(animatedValue)}
        </span>
      </div>
      <div style={dot("h-2 bg-secondary rounded-full overflow-hidden")}>
        <div
          style={mergeStyles(dot(merge("h-full rounded-full transition-all duration-1000 ease-out", color.bar)), { width: `${animatedValue}%` })}
        />
      </div>
      {item.description && (
        <p style={dot("text-xs text-muted-foreground")}>{item.description}</p>
      )}
    </div>
  )
}

export function LandingMetrics({
  items,
  title,
  subtitle,
  tabs,
  motion: motionOverride,
  className,
  ...rest
}: LandingMetricsProps) {
  const theme = useLandingTheme()
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.stats.motion, ...motionOverride }
    : theme.stats.motion

  const [activeTab, setActiveTab] = useState(0)

  const scrollReveal = useScrollReveal?.({
    motionType: motion.type as 'fadeIn' | 'slideUp',
    duration: motion.duration,
    delay: motion.delay,
  })

  const fallbackStyle: React.CSSProperties = scrollReveal ? {} : {
    opacity: 0,
    transform: motion.type === 'slideUp' ? 'translateY(32px)' : 'none',
    animation: `landing-metrics-enter ${motion.duration}ms ${motion.easing} ${motion.delay}ms forwards`,
  }

  const displayItems = tabs ? tabs[activeTab].items : items

  const header = (title || subtitle)
    ? { title: title ?? '', subtitle }
    : undefined

  return (
    <Section header={header} dot={className} {...rest}>
      <div
        ref={scrollReveal?.ref as React.Ref<HTMLDivElement>}
        style={mergeStyles(dot("max-w-3xl mx-auto"), scrollReveal?.style ?? fallbackStyle)}
      >
        {/* Tabs */}
        {tabs && tabs.length > 1 && (
          <div style={dot("flex gap-2 mb-8 justify-center")}>
            {tabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                style={dot(merge(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  activeTab === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                ))}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Metrics */}
        <div style={dot("space-y-6")}>
          {displayItems.map((item, i) => (
            <MetricBar key={i} item={item} delay={i * 100} />
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes landing-metrics-enter {
          to { opacity: 1; transform: none; }
        }
      `}} />
    </Section>
  )
}
