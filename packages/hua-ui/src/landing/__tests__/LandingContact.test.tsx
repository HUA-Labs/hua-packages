import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingContact } from '../LandingContact'

const socialLinks = [
  { icon: 'github', href: 'https://github.com/user', label: 'GitHub' },
  { icon: 'linkedin', href: 'https://linkedin.com/in/user', label: 'LinkedIn' },
  { icon: 'twitter', href: 'https://twitter.com/user', label: 'Twitter' },
]

function renderContact(
  props: Partial<React.ComponentProps<typeof LandingContact>> = {},
  theme = 'portfolio' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingContact {...props} />
    </LandingProvider>
  )
}

describe('LandingContact', () => {
  it('should render default title', () => {
    renderContact()
    expect(screen.getByText('Get in Touch')).toBeInTheDocument()
  })

  it('should render custom title and subtitle', () => {
    renderContact({ title: 'Contact Me', subtitle: 'Let\'s work together' })
    expect(screen.getByText('Contact Me')).toBeInTheDocument()
    expect(screen.getByText('Let\'s work together')).toBeInTheDocument()
  })

  it('should render email link', () => {
    renderContact({ email: 'hello@example.com' })
    const emailLink = screen.getByText('hello@example.com')
    expect(emailLink).toBeInTheDocument()
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:hello@example.com')
  })

  it('should render social links', () => {
    renderContact({ socialLinks })
    const links = screen.getAllByRole('link').filter(link => link.getAttribute('aria-label'))
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', 'https://github.com/user')
    expect(links[0]).toHaveAttribute('aria-label', 'GitHub')
    expect(links[1]).toHaveAttribute('href', 'https://linkedin.com/in/user')
    expect(links[2]).toHaveAttribute('href', 'https://twitter.com/user')
  })

  it('should apply custom className', () => {
    const { container } = renderContact({ className: 'contact-custom' })
    expect(container.querySelector('.contact-custom')).toBeInTheDocument()
  })
})
