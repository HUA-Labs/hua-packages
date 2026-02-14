import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingAbout } from '../LandingAbout'

function renderAbout(
  props: Partial<React.ComponentProps<typeof LandingAbout>> = {},
  theme = 'portfolio' as const
) {
  const defaultProps = {
    name: 'Jane Doe',
    role: 'Software Engineer',
    bio: 'Building amazing products with modern web technologies.',
  }
  return render(
    <LandingProvider theme={theme}>
      <LandingAbout {...defaultProps} {...props} />
    </LandingProvider>
  )
}

describe('LandingAbout', () => {
  it('should render name, role, and bio', () => {
    renderAbout()
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Building amazing products with modern web technologies.')).toBeInTheDocument()
  })

  it('should render avatar when provided', () => {
    renderAbout({ avatar: '/avatar.jpg' })
    const avatar = screen.getByAltText('Jane Doe')
    expect(avatar).toBeInTheDocument()
    expect(avatar.tagName).toBe('IMG')
  })

  it('should not render avatar when not provided', () => {
    renderAbout({ avatar: undefined })
    const avatar = screen.queryByAltText('Jane Doe')
    expect(avatar).not.toBeInTheDocument()
  })

  it('should render social links', () => {
    const socialLinks = [
      { icon: 'github', href: 'https://github.com/janedoe', label: 'GitHub' },
      { icon: 'linkedin', href: 'https://linkedin.com/in/janedoe', label: 'LinkedIn' },
      { icon: 'twitter', href: 'https://twitter.com/janedoe', label: 'Twitter' },
    ]
    renderAbout({ socialLinks })
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(3)
    expect(links[0]).toHaveAttribute('href', 'https://github.com/janedoe')
    expect(links[0]).toHaveAttribute('aria-label', 'GitHub')
  })

  it('should apply custom className', () => {
    const { container } = renderAbout({ className: 'about-custom' })
    expect(container.querySelector('.about-custom')).toBeInTheDocument()
  })

  it('should work with motion override', () => {
    renderAbout({ motion: { type: 'fadeIn', duration: 1000 } })
    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
  })
})
