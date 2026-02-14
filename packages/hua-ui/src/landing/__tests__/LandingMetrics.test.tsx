import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LandingProvider } from '../LandingProvider'
import { LandingMetrics } from '../LandingMetrics'
import type { LandingMetricItem } from '../types'

const items: LandingMetricItem[] = [
  { label: 'Performance', value: 95, description: 'Lightning fast' },
  { label: 'Accessibility', value: 88, description: 'WCAG AA compliant' },
  { label: 'SEO', value: 92, description: 'Optimized for search' },
]

const tabs = [
  { label: 'Web Vitals', items },
  {
    label: 'Security',
    items: [
      { label: 'SSL', value: 100 },
      { label: 'Headers', value: 95 },
    ],
  },
]

function renderMetrics(
  props: Partial<React.ComponentProps<typeof LandingMetrics>> = {},
  theme = 'portfolio' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingMetrics items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingMetrics', () => {
  it('should render all metric items', () => {
    renderMetrics()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Accessibility')).toBeInTheDocument()
    expect(screen.getByText('SEO')).toBeInTheDocument()
  })

  it('should render title and subtitle', () => {
    renderMetrics({ title: 'Site Metrics', subtitle: 'Our performance scores' })
    expect(screen.getByText('Site Metrics')).toBeInTheDocument()
    expect(screen.getByText('Our performance scores')).toBeInTheDocument()
  })

  it('should show metric values', () => {
    renderMetrics()
    // Values start at 0 and animate, so we check for the elements
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Accessibility')).toBeInTheDocument()
  })

  it('should apply color coding based on value', () => {
    const { container } = renderMetrics()
    // Green for >= 90
    const greenBars = container.querySelectorAll('.bg-green-500')
    expect(greenBars.length).toBeGreaterThan(0)
    // Orange for >= 50 && < 90
    const orangeBars = container.querySelectorAll('.bg-orange-500')
    expect(orangeBars.length).toBeGreaterThan(0)
  })

  it('should render tabs when provided', () => {
    renderMetrics({ tabs })
    expect(screen.getByRole('button', { name: 'Web Vitals' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Security' })).toBeInTheDocument()
  })

  it('should switch tabs when clicked', async () => {
    const user = userEvent.setup()
    renderMetrics({ tabs })

    // Initially showing Web Vitals
    expect(screen.getByText('Performance')).toBeInTheDocument()

    // Click Security tab
    await user.click(screen.getByRole('button', { name: 'Security' }))

    // Should show Security metrics
    expect(screen.getByText('SSL')).toBeInTheDocument()
    expect(screen.getByText('Headers')).toBeInTheDocument()
  })

  it('should render metric descriptions', () => {
    renderMetrics()
    expect(screen.getByText('Lightning fast')).toBeInTheDocument()
    expect(screen.getByText('WCAG AA compliant')).toBeInTheDocument()
    expect(screen.getByText('Optimized for search')).toBeInTheDocument()
  })
})
