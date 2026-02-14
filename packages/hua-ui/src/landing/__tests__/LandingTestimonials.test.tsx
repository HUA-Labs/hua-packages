import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingTestimonials } from '../LandingTestimonials'
import type { LandingTestimonialItem } from '../types'

beforeAll(() => {
  // Marquee uses ResizeObserver
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const items: LandingTestimonialItem[] = [
  { quote: 'Amazing product!', author: 'Alice', role: 'CEO', company: 'Acme' },
  { quote: 'Changed our workflow.', author: 'Bob', company: 'Corp' },
  { quote: 'Highly recommend.', author: 'Charlie' },
]

function renderTestimonials(
  props: Partial<React.ComponentProps<typeof LandingTestimonials>> = {},
  theme = 'marketing' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingTestimonials items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingTestimonials', () => {
  it('should render all testimonial quotes', () => {
    renderTestimonials({ variant: 'grid' })
    for (const item of items) {
      expect(screen.getByText(`\u201C${item.quote}\u201D`)).toBeInTheDocument()
    }
  })

  it('should render author names', () => {
    renderTestimonials({ variant: 'grid' })
    for (const item of items) {
      expect(screen.getByText(item.author)).toBeInTheDocument()
    }
  })

  it('should render role and company', () => {
    renderTestimonials({ variant: 'grid' })
    expect(screen.getByText('CEO, Acme')).toBeInTheDocument()
    expect(screen.getByText('Corp')).toBeInTheDocument()
  })

  it('should render section title', () => {
    renderTestimonials({ variant: 'grid', title: 'What people say' })
    expect(screen.getByText('What people say')).toBeInTheDocument()
  })

  it('should render grid variant with columns', () => {
    const { container } = renderTestimonials({ variant: 'grid', columns: 3 })
    const grid = container.querySelector('.lg\\:grid-cols-3')
    expect(grid).toBeInTheDocument()
  })

  it('should render carousel variant', () => {
    const { container } = renderTestimonials({ variant: 'carousel' })
    const arrows = container.querySelectorAll('button')
    expect(arrows.length).toBeGreaterThan(0)
  })

  it('should render marquee variant', () => {
    renderTestimonials({ variant: 'marquee' })
    const quotes = screen.getAllByText(`\u201C${items[0].quote}\u201D`)
    expect(quotes.length).toBeGreaterThanOrEqual(1)
  })

  it('should use grid variant for corporate theme', () => {
    const { container } = renderTestimonials({}, 'corporate')
    const grid = container.querySelector('.grid')
    expect(grid).toBeInTheDocument()
  })

  it('should use carousel variant for marketing theme', () => {
    const { container } = renderTestimonials({}, 'marketing')
    const arrows = container.querySelectorAll('button')
    expect(arrows.length).toBeGreaterThan(0)
  })

  it('should pass className to section', () => {
    const { container } = renderTestimonials({ variant: 'grid', className: 'custom-class' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
