import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingSkills } from '../LandingSkills'
import type { LandingSkillItem } from '../types'

// Mock ResizeObserver for Marquee component
beforeEach(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

const items: LandingSkillItem[] = [
  { name: 'TypeScript', icon: 'code', level: 95, category: 'Language' },
  { name: 'React', icon: 'atom', level: 90, category: 'Framework' },
  { name: 'Node.js', icon: 'cloud', level: 85, category: 'Runtime' },
  { name: 'PostgreSQL', icon: 'database', level: 75, category: 'Database' },
]

function renderSkills(
  props: Partial<React.ComponentProps<typeof LandingSkills>> = {},
  theme = 'portfolio' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingSkills items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingSkills', () => {
  it('should render bars variant', () => {
    renderSkills({ variant: 'bars' })
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
  })

  it('should render grid variant', () => {
    const { container } = renderSkills({ variant: 'grid' })
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(container.querySelector('.grid')).toBeInTheDocument()
    expect(screen.getByText('Language')).toBeInTheDocument()
    expect(screen.getByText('Framework')).toBeInTheDocument()
  })

  it('should render marquee variant', () => {
    renderSkills({ variant: 'marquee' })
    // Marquee renders items multiple times for infinite scroll effect
    expect(screen.getAllByText('TypeScript').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('React').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Node.js').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('PostgreSQL').length).toBeGreaterThanOrEqual(1)
  })

  it('should render title and subtitle', () => {
    renderSkills({ title: 'Technical Skills', subtitle: 'My expertise' })
    expect(screen.getByText('Technical Skills')).toBeInTheDocument()
    expect(screen.getByText('My expertise')).toBeInTheDocument()
  })

  it('should render all skill names', () => {
    renderSkills()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument()
  })

  it('should show skill levels in bars variant', () => {
    renderSkills({ variant: 'bars' })
    expect(screen.getByText('95%')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('should render icons when provided', () => {
    const { container } = renderSkills({ variant: 'grid' })
    // Icons render as SVGs, check they exist by querying for SVG elements
    // Some icons may not be found, but at least some should render
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
