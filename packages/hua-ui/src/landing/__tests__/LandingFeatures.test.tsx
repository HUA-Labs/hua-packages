import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingFeatures } from '../LandingFeatures'
import type { LandingFeatureItem } from '../types'

const items: LandingFeatureItem[] = [
  { icon: '🚀', title: 'Fast', description: 'Lightning speed' },
  { icon: '🔒', title: 'Secure', description: 'Enterprise grade' },
  { icon: '🎨', title: 'Beautiful', description: 'Modern design' },
]

function renderFeatures(
  props: Partial<React.ComponentProps<typeof LandingFeatures>> = {},
  theme = 'marketing' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingFeatures items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingFeatures', () => {
  it('should render all feature items', () => {
    renderFeatures()
    expect(screen.getByText('Fast')).toBeInTheDocument()
    expect(screen.getByText('Secure')).toBeInTheDocument()
    expect(screen.getByText('Beautiful')).toBeInTheDocument()
  })

  it('should render descriptions', () => {
    renderFeatures()
    expect(screen.getByText('Lightning speed')).toBeInTheDocument()
    expect(screen.getByText('Enterprise grade')).toBeInTheDocument()
  })

  it('should render icons', () => {
    renderFeatures()
    expect(screen.getByText('🚀')).toBeInTheDocument()
    expect(screen.getByText('🔒')).toBeInTheDocument()
  })

  it('should render section title and subtitle', () => {
    renderFeatures({ title: 'Features', subtitle: 'What we offer' })
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('What we offer')).toBeInTheDocument()
  })

  it('should auto-calculate 3 columns for 3 items', () => {
    const { container } = renderFeatures()
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('lg:grid-cols-3')
  })

  it('should use 2 columns for 2 items', () => {
    const twoItems = items.slice(0, 2)
    const { container } = render(
      <LandingProvider theme="marketing">
        <LandingFeatures items={twoItems} />
      </LandingProvider>
    )
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('md:grid-cols-2')
  })

  it('should respect columns override', () => {
    const { container } = renderFeatures({ columns: 4 })
    const grid = container.querySelector('.grid')
    expect(grid).toHaveClass('lg:grid-cols-4')
  })

  it('should render with corporate theme (spotlight cards)', () => {
    renderFeatures({}, 'corporate')
    expect(screen.getByText('Fast')).toBeInTheDocument()
  })

  it('should render with product theme (glass cards)', () => {
    renderFeatures({}, 'product')
    expect(screen.getByText('Fast')).toBeInTheDocument()
  })

  it('should allow card type override', () => {
    renderFeatures({ card: 'spotlight' }, 'marketing')
    expect(screen.getByText('Fast')).toBeInTheDocument()
  })
})
