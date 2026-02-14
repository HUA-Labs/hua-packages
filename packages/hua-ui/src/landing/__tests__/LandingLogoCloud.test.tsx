import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingLogoCloud } from '../LandingLogoCloud'
import type { LandingLogoItem } from '../types'

beforeAll(() => {
  // Marquee uses ResizeObserver
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

const logos: LandingLogoItem[] = [
  { src: '/logo1.svg', alt: 'Company A' },
  { src: '/logo2.svg', alt: 'Company B' },
  { src: '/logo3.svg', alt: 'Company C', href: 'https://example.com' },
]

function renderLogoCloud(
  props: Partial<React.ComponentProps<typeof LandingLogoCloud>> = {},
  theme = 'marketing' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingLogoCloud logos={logos} {...props} />
    </LandingProvider>
  )
}

describe('LandingLogoCloud', () => {
  it('should render all logos', () => {
    renderLogoCloud({ variant: 'grid' })
    for (const logo of logos) {
      expect(screen.getByAltText(logo.alt)).toBeInTheDocument()
    }
  })

  it('should render title when provided', () => {
    renderLogoCloud({ variant: 'grid', title: 'Trusted by' })
    expect(screen.getByText('Trusted by')).toBeInTheDocument()
  })

  it('should wrap logo in link when href provided', () => {
    renderLogoCloud({ variant: 'grid' })
    const link = screen.getByAltText('Company C').closest('a')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should apply custom logo height', () => {
    renderLogoCloud({ variant: 'grid', logoHeight: 60 })
    const img = screen.getByAltText('Company A')
    expect(img).toHaveStyle({ height: '60px' })
  })

  it('should render grid variant', () => {
    const { container } = renderLogoCloud({ variant: 'grid' })
    expect(container.querySelector('.flex-wrap')).toBeInTheDocument()
  })

  it('should render marquee variant', () => {
    renderLogoCloud({ variant: 'marquee' })
    const imgs = screen.getAllByAltText('Company A')
    expect(imgs.length).toBeGreaterThanOrEqual(1)
  })

  it('should use grid variant for corporate theme', () => {
    const { container } = renderLogoCloud({}, 'corporate')
    expect(container.querySelector('.flex-wrap')).toBeInTheDocument()
  })

  it('should pass className to section', () => {
    const { container } = renderLogoCloud({ variant: 'grid', className: 'extra-class' })
    expect(container.querySelector('.extra-class')).toBeInTheDocument()
  })
})
