import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingCTA } from '../LandingCTA'

function renderCTA(
  props: Partial<React.ComponentProps<typeof LandingCTA>> & { title: React.ReactNode },
  theme = 'marketing' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingCTA {...props} />
    </LandingProvider>
  )
}

describe('LandingCTA', () => {
  it('should render title', () => {
    renderCTA({ title: 'Ready to start?' })
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Ready to start?')
  })

  it('should render subtitle', () => {
    renderCTA({ title: 'Go', subtitle: 'Join thousands of users' })
    expect(screen.getByText('Join thousands of users')).toBeInTheDocument()
  })

  it('should render actions', () => {
    renderCTA({
      title: 'Go',
      primaryAction: <button>Sign Up</button>,
      secondaryAction: <button>Contact Sales</button>,
    })
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
    expect(screen.getByText('Contact Sales')).toBeInTheDocument()
  })

  it('should apply dark background for product theme', () => {
    const { container } = renderCTA({ title: 'Go' }, 'product')
    expect(container.querySelector('section')).toHaveClass('bg-gray-950')
  })

  it('should apply gradient-soft for corporate theme', () => {
    const { container } = renderCTA({ title: 'Go' }, 'corporate')
    const bgDiv = container.querySelector('.gradient-bg-soft')
    expect(bgDiv).toBeInTheDocument()
  })

  it('should allow background override', () => {
    const { container } = renderCTA({ title: 'Go', background: 'dark' }, 'marketing')
    expect(container.querySelector('section')).toHaveClass('bg-gray-950')
  })

  it('should accept ReactNode as title', () => {
    renderCTA({ title: <span data-testid="cta-title">Custom CTA</span> })
    expect(screen.getByTestId('cta-title')).toBeInTheDocument()
  })

  it('should pass className to section', () => {
    const { container } = renderCTA({ title: 'Go', className: 'extra-class' })
    expect(container.querySelector('section')).toHaveClass('extra-class')
  })
})
