import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider, useLandingTheme } from '../LandingProvider'
import type { LandingTheme } from '../types'

function ThemeConsumer() {
  const theme = useLandingTheme()
  return <div data-testid="theme-name">{theme.name}</div>
}

describe('LandingProvider', () => {
  it('should provide marketing theme by name', () => {
    render(
      <LandingProvider theme="marketing">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('marketing')
  })

  it('should provide corporate theme by name', () => {
    render(
      <LandingProvider theme="corporate">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('corporate')
  })

  it('should provide product theme by name', () => {
    render(
      <LandingProvider theme="product">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('product')
  })

  it('should provide dashboard theme by name', () => {
    render(
      <LandingProvider theme="dashboard">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('dashboard')
  })

  it('should provide app theme by name', () => {
    render(
      <LandingProvider theme="app">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('app')
  })

  it('should provide immersive theme by name', () => {
    render(
      <LandingProvider theme="immersive">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('immersive')
  })

  it('should provide portfolio theme by name', () => {
    render(
      <LandingProvider theme="portfolio">
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('portfolio')
  })

  it('should accept custom theme object', () => {
    const m = { type: 'fadeIn' as const, duration: 500, easing: 'ease', delay: 0 }
    const custom: LandingTheme = {
      name: 'custom' as LandingTheme['name'],
      colors: {
        background: '0 0% 100%',
        foreground: '0 0% 0%',
        muted: '220 13% 91%',
        mutedForeground: '220 9% 46%',
        primary: '217 91% 60%',
        primaryForeground: '0 0% 100%',
        secondary: '220 14% 96%',
        secondaryForeground: '0 0% 0%',
        card: '0 0% 100%',
        cardForeground: '0 0% 0%',
        border: '220 13% 91%',
        sectionAlt: '220 14% 96%',
      },
      hero: { background: 'dark', size: 'full', motion: m },
      features: { card: 'glow', staggerDelay: 100, motion: m, decorator: false },
      stats: { numberSize: 'text-4xl', countUp: true, staggerDelay: 100, motion: m },
      cta: { background: 'dark', motion: m },
      testimonials: { variant: 'grid', staggerDelay: 100, motion: m },
      logoCloud: { variant: 'grid', speed: 40 },
      showcase: { staggerDelay: 100, motion: m },
    }

    render(
      <LandingProvider theme={custom}>
        <ThemeConsumer />
      </LandingProvider>
    )
    expect(screen.getByTestId('theme-name')).toHaveTextContent('custom')
  })

  it('should throw when used outside provider', () => {
    // Suppress console.error from React error boundary
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<ThemeConsumer />)).toThrow('useLandingTheme must be used within <Landing.Provider>')
    spy.mockRestore()
  })

  it('should render children', () => {
    render(
      <LandingProvider theme="marketing">
        <div data-testid="child">Hello</div>
      </LandingProvider>
    )
    expect(screen.getByTestId('child')).toHaveTextContent('Hello')
  })
})
