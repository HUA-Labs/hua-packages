import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LandingProvider } from '../LandingProvider'
import { LandingExperience } from '../LandingExperience'
import type { LandingExperienceItem } from '../types'

const items: LandingExperienceItem[] = [
  {
    title: 'Senior Software Engineer',
    company: 'Tech Corp',
    period: '2022 - Present',
    description: 'Leading frontend development team.',
    current: true,
  },
  {
    title: 'Software Engineer',
    company: 'StartupXYZ',
    period: '2020 - 2022',
    description: 'Built scalable web applications.',
  },
  {
    title: 'Junior Developer',
    company: 'Code Studio',
    period: '2018 - 2020',
  },
]

function renderExperience(
  props: Partial<React.ComponentProps<typeof LandingExperience>> = {},
  theme = 'portfolio' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingExperience items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingExperience', () => {
  it('should render all experience items', () => {
    renderExperience()
    expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText('Junior Developer')).toBeInTheDocument()
  })

  it('should render title and subtitle', () => {
    renderExperience({ title: 'Work Experience', subtitle: 'My career journey' })
    expect(screen.getByText('Work Experience')).toBeInTheDocument()
    expect(screen.getByText('My career journey')).toBeInTheDocument()
  })

  it('should render company and period', () => {
    renderExperience()
    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('2022 - Present')).toBeInTheDocument()
    expect(screen.getByText('StartupXYZ')).toBeInTheDocument()
    expect(screen.getByText('2020 - 2022')).toBeInTheDocument()
  })

  it('should mark current items with badge', () => {
    renderExperience()
    expect(screen.getByText('Current')).toBeInTheDocument()
  })

  it('should render descriptions', () => {
    renderExperience()
    expect(screen.getByText('Leading frontend development team.')).toBeInTheDocument()
    expect(screen.getByText('Built scalable web applications.')).toBeInTheDocument()
  })

  it('should render timeline structure with dots and lines', () => {
    const { container } = renderExperience()
    // Check for timeline dots (rounded-full)
    const dots = container.querySelectorAll('.rounded-full')
    expect(dots.length).toBeGreaterThanOrEqual(items.length)
    // Check for timeline line (bg-border)
    const lines = container.querySelectorAll('.bg-border')
    expect(lines.length).toBeGreaterThan(0)
  })
})
