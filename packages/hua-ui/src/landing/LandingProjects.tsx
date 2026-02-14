"use client"

import React, { useState, useMemo } from 'react'
import { merge } from '../lib/utils'
import { Section } from '../components/Section'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon/Icon'
import { useLandingTheme } from './LandingProvider'
import type { LandingProjectsProps, LandingProjectItem, LandingMotionOverride } from './types'

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
let TiltCard: React.ComponentType<any> | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mc = require('@hua-labs/motion-core')
  useStagger = mc.useStagger
  TiltCard = mc.TiltCard
} catch {
  // motion-core unavailable
}

const gridColsMap = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
} as const

function ProjectCard({ item, style }: { item: LandingProjectItem; style?: React.CSSProperties }) {
  const CardComponent = TiltCard || Card

  return (
    <CardComponent
      className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl overflow-hidden group hover:shadow-lg transition-shadow"
      style={style}
    >
      {item.image && (
        <div className="relative overflow-hidden aspect-video">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex gap-3">
          {item.href && (
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View Project <Icon name="arrowRight" size={16} />
            </a>
          )}
          {item.github && (
            <a
              href={item.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <Icon name="github" size={16} /> GitHub
            </a>
          )}
        </div>
      </div>
    </CardComponent>
  )
}

export function LandingProjects({
  items,
  title,
  subtitle,
  columns = 3,
  filter = false,
  motion: motionOverride,
  staggerDelay: staggerProp,
  className,
  ...rest
}: LandingProjectsProps) {
  const theme = useLandingTheme()
  const motion: Required<LandingMotionOverride> = motionOverride
    ? { ...theme.features.motion, ...motionOverride }
    : theme.features.motion
  const staggerDelay = staggerProp ?? theme.features.staggerDelay

  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    items.forEach(item => {
      item.tags?.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [items])

  const filteredItems = useMemo(() => {
    if (!selectedTag) return items
    return items.filter(item => item.tags?.includes(selectedTag))
  }, [items, selectedTag])

  const stagger = useStagger?.({
    count: filteredItems.length,
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
      {/* Tag Filter */}
      {filter && allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setSelectedTag(null)}
            className={merge(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              !selectedTag
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={merge(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                selectedTag === tag
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      <div
        ref={stagger?.containerRef}
        className={merge("grid gap-6", gridColsMap[columns])}
      >
        {filteredItems.map((item, i) => (
          <ProjectCard
            key={i}
            item={item}
            style={stagger?.styles[i]}
          />
        ))}
      </div>
    </Section>
  )
}
