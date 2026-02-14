import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingHero } from '../LandingHero'

function renderHero(props: React.ComponentProps<typeof LandingHero>, theme = 'marketing' as const) {
  return render(
    <LandingProvider theme={theme}>
      <LandingHero {...props} />
    </LandingProvider>
  )
}

describe('LandingHero', () => {
  it('should render title', () => {
    renderHero({ title: 'Ship faster' })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ship faster')
  })

  it('should render subtitle', () => {
    renderHero({ title: 'Title', subtitle: 'Build in minutes' })
    expect(screen.getByText('Build in minutes')).toBeInTheDocument()
  })

  it('should render description', () => {
    renderHero({ title: 'Title', description: 'Detailed description here' })
    expect(screen.getByText('Detailed description here')).toBeInTheDocument()
  })

  it('should render primary and secondary actions', () => {
    renderHero({
      title: 'Title',
      primaryAction: <button>Get Started</button>,
      secondaryAction: <button>Learn More</button>,
    })
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('should render scroll indicator when enabled', () => {
    const { container } = renderHero({ title: 'Title', scrollIndicator: true })
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('should not render scroll indicator by default', () => {
    const { container } = renderHero({ title: 'Title' })
    expect(container.querySelector('.animate-bounce')).not.toBeInTheDocument()
  })

  it('should apply full size for marketing theme', () => {
    const { container } = renderHero({ title: 'Title' }, 'marketing')
    expect(container.querySelector('section')).toHaveClass('min-h-screen')
  })

  it('should apply xl size for corporate theme', () => {
    const { container } = renderHero({ title: 'Title' }, 'corporate')
    const section = container.querySelector('section')
    expect(section).not.toHaveClass('min-h-screen')
  })

  it('should allow size override', () => {
    const { container } = renderHero({ title: 'Title', size: 'xl' }, 'marketing')
    expect(container.querySelector('section')).not.toHaveClass('min-h-screen')
  })

  it('should render dark background for product theme', () => {
    const { container } = renderHero({ title: 'Title' }, 'product')
    expect(container.querySelector('section')).toHaveClass('bg-gray-950')
  })

  it('should accept ReactNode as title', () => {
    renderHero({ title: <span data-testid="custom-title">Custom</span> })
    expect(screen.getByTestId('custom-title')).toBeInTheDocument()
  })

  it('should pass className to section', () => {
    const { container } = renderHero({ title: 'T', className: 'my-custom-class' })
    expect(container.querySelector('section')).toHaveClass('my-custom-class')
  })
})
