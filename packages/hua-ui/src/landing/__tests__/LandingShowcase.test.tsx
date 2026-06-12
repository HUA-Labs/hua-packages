import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingShowcase } from '../LandingShowcase'
import type { LandingShowcaseItem } from '../types'

const items: LandingShowcaseItem[] = [
  { image: '/screen1.png', title: 'Feature One', description: 'Description for feature one.' },
  { image: '/screen2.png', title: 'Feature Two', description: 'Description for feature two.' },
  { image: '/screen3.png', title: 'Feature Three', description: 'Description for feature three.' },
]

function renderShowcase(
  props: Partial<React.ComponentProps<typeof LandingShowcase>> = {},
  theme = 'marketing' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingShowcase items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingShowcase', () => {
  it('should render all showcase items', () => {
    renderShowcase()
    for (const item of items) {
      expect(screen.getByText(item.title)).toBeInTheDocument()
      expect(screen.getByText(item.description)).toBeInTheDocument()
    }
  })

  it('should render images with alt text', () => {
    renderShowcase()
    for (const item of items) {
      expect(screen.getByAltText(item.title)).toBeInTheDocument()
    }
  })

  it('should render section title and subtitle', () => {
    renderShowcase({ title: 'Product Tour', subtitle: 'See it in action' })
    expect(screen.getByText('Product Tour')).toBeInTheDocument()
    expect(screen.getByText('See it in action')).toBeInTheDocument()
  })

  it('should alternate layout direction', () => {
    renderShowcase()
    const getRowForTitle = (title: string) =>
      screen.getByText(title).parentElement?.parentElement as HTMLElement
    expect(getRowForTitle('Feature One')).toHaveDotStyle('md:flex-row')
    expect(getRowForTitle('Feature Two')).toHaveDotStyle('md:flex-row-reverse')
    expect(getRowForTitle('Feature Three')).toHaveDotStyle('md:flex-row')
  })

  it('should render h3 for item titles', () => {
    renderShowcase()
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings).toHaveLength(items.length)
  })

  it('should render rounded image containers', () => {
    renderShowcase()
    for (const item of items) {
      const imageFrame = screen.getByAltText(item.title).parentElement as HTMLElement
      expect(imageFrame).toHaveDotStyle('rounded-xl')
    }
  })

  it('should pass className to section', () => {
    const { container } = renderShowcase({ className: 'showcase-custom' })
    expect(container.querySelector('.showcase-custom')).toBeInTheDocument()
  })

  it('should work with corporate theme', () => {
    renderShowcase({}, 'corporate')
    expect(screen.getByText('Feature One')).toBeInTheDocument()
  })

  it('should work with product theme', () => {
    renderShowcase({}, 'product')
    expect(screen.getByText('Feature One')).toBeInTheDocument()
  })
})
