"use client"

import React, { createContext, useContext, useMemo } from 'react'
import { resolveTheme } from './themes'
import type { LandingProviderProps, LandingTheme, LandingColorTokens } from './types'

const LandingContext = createContext<LandingTheme | null>(null)

export function useLandingTheme(): LandingTheme {
  const ctx = useContext(LandingContext)
  if (!ctx) {
    throw new Error('useLandingTheme must be used within <Landing.Provider>')
  }
  return ctx
}

function buildCssVars(c: LandingColorTokens): React.CSSProperties {
  return {
    // Tailwind v4 @theme vars (--color-*)
    '--color-primary': `hsl(${c.primary})`,
    '--color-primary-foreground': `hsl(${c.primaryForeground})`,
    '--color-background': `hsl(${c.background})`,
    '--color-foreground': `hsl(${c.foreground})`,
    '--color-muted': `hsl(${c.muted})`,
    '--color-muted-foreground': `hsl(${c.mutedForeground})`,
    '--color-secondary': `hsl(${c.secondary})`,
    '--color-secondary-foreground': `hsl(${c.secondaryForeground})`,
    '--color-card': `hsl(${c.card})`,
    '--color-card-foreground': `hsl(${c.cardForeground})`,
    '--color-border': `hsl(${c.border})`,
    '--color-input': `hsl(${c.border})`,
    '--color-ring': `hsl(${c.primary})`,
    // Legacy hsl(var(--*)) pattern vars
    '--primary': c.primary,
    '--primary-foreground': c.primaryForeground,
    '--background': c.background,
    '--foreground': c.foreground,
    '--muted': c.muted,
    '--muted-foreground': c.mutedForeground,
    '--secondary': c.secondary,
    '--secondary-foreground': c.secondaryForeground,
    '--card': c.card,
    '--card-foreground': c.cardForeground,
    '--border': c.border,
    '--input': c.border,
    '--ring': c.primary,
    // Landing-specific
    '--landing-section-alt': `hsl(${c.sectionAlt})`,
  } as React.CSSProperties
}

export function LandingProvider({ theme, children }: LandingProviderProps) {
  const resolved = useMemo(() => resolveTheme(theme), [theme])

  const style = useMemo<React.CSSProperties>(() => ({
    backgroundColor: `hsl(${resolved.colors.background})`,
    color: `hsl(${resolved.colors.foreground})`,
    ...buildCssVars(resolved.colors),
  }), [resolved.colors])

  return (
    <LandingContext.Provider value={resolved}>
      <div style={style}>
        {children}
      </div>
    </LandingContext.Provider>
  )
}
