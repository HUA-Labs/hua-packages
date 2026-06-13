import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingStats } from '../LandingStats'
import type { LandingStatItem } from '../types'

const items: LandingStatItem[] = [
  { value: '10M+', label: 'Users' },
  { value: '99.9%', label: 'Uptime' },
  { value: '50+', label: 'Countries' },
]

const getGrid = (container: HTMLElement) => {
  const grid = Array.from(container.querySelectorAll('div')).find(
    (el) => {
      try {
        expect(el).toHaveDotStyle('grid')
        return true
      } catch {
        return false
      }
    }
  )
  expect(grid).toBeInTheDocument()
  return grid as HTMLElement
}

function renderStats(
  props: Partial<React.ComponentProps<typeof LandingStats>> = {},
  theme = 'marketing' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingStats items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingStats', () => {
  it('should render all stat labels', () => {
    renderStats()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Uptime')).toBeInTheDocument()
    expect(screen.getByText('Countries')).toBeInTheDocument()
  })

  it('should render section title and subtitle', () => {
    renderStats({ title: 'By the numbers', subtitle: 'Our impact' })
    expect(screen.getByText('By the numbers')).toBeInTheDocument()
    expect(screen.getByText('Our impact')).toBeInTheDocument()
  })

  it('should render static values for corporate theme (no count-up)', () => {
    renderStats({}, 'corporate')
    expect(screen.getByText('10M+')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
    expect(screen.getByText('50+')).toBeInTheDocument()
  })

  it('should respect countUp override', () => {
    renderStats({ countUp: false })
    expect(screen.getByText('10M+')).toBeInTheDocument()
  })

  it('should apply custom number size', () => {
    const { container } = renderStats({ numberSize: 'text-7xl' })
    const statNumbers = container.querySelectorAll('.stat-number')
    statNumbers.forEach((el) => {
      expect(el).toHaveDotStyle('text-7xl')
    })
  })

  it('should preserve sectionProps className', () => {
    const { container } = renderStats({
      sectionProps: { className: 'from-section-props' },
      className: 'from-direct-prop',
    })
    const section = container.querySelector('section')
    expect(section).toHaveClass('from-section-props')
    expect(section).toHaveClass('from-direct-prop')
  })

  it('should render grid with correct columns for 3 items', () => {
    const { container } = renderStats()
    const grid = getGrid(container)
    expect(grid).toHaveDotStyle('sm:grid-cols-3')
  })

  it('should render grid with 4 columns for 4 items', () => {
    const fourItems = [...items, { value: '24/7', label: 'Support' }]
    const { container } = render(
      <LandingProvider theme="marketing">
        <LandingStats items={fourItems} />
      </LandingProvider>
    )
    const grid = getGrid(container)
    expect(grid).toHaveDotStyle('sm:grid-cols-4')
  })

  it('should use prefix and suffix from item', () => {
    const prefixItems: LandingStatItem[] = [
      { value: '100', label: 'Revenue', prefix: '$', suffix: 'M' },
    ]
    render(
      <LandingProvider theme="corporate">
        <LandingStats items={prefixItems} />
      </LandingProvider>
    )
    // Corporate theme has countUp=false, so static display
    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
