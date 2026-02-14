import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LandingProvider } from '../LandingProvider'
import { LandingProjects } from '../LandingProjects'
import type { LandingProjectItem } from '../types'

const items: LandingProjectItem[] = [
  {
    title: 'Project Alpha',
    description: 'A revolutionary app for productivity.',
    image: '/project1.png',
    tags: ['React', 'TypeScript'],
    href: 'https://alpha.com',
    github: 'https://github.com/user/alpha',
  },
  {
    title: 'Project Beta',
    description: 'Next-gen platform for collaboration.',
    image: '/project2.png',
    tags: ['Next.js', 'TypeScript'],
    href: 'https://beta.com',
  },
  {
    title: 'Project Gamma',
    description: 'Open-source library for animations.',
    tags: ['React', 'Animation'],
    github: 'https://github.com/user/gamma',
  },
]

function renderProjects(
  props: Partial<React.ComponentProps<typeof LandingProjects>> = {},
  theme = 'portfolio' as const
) {
  return render(
    <LandingProvider theme={theme}>
      <LandingProjects items={items} {...props} />
    </LandingProvider>
  )
}

describe('LandingProjects', () => {
  it('should render all project items', () => {
    renderProjects()
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByText('Project Beta')).toBeInTheDocument()
    expect(screen.getByText('Project Gamma')).toBeInTheDocument()
  })

  it('should render title and subtitle', () => {
    renderProjects({ title: 'My Projects', subtitle: 'Things I have built' })
    expect(screen.getByText('My Projects')).toBeInTheDocument()
    expect(screen.getByText('Things I have built')).toBeInTheDocument()
  })

  it('should render tags', () => {
    renderProjects()
    expect(screen.getAllByText('React')).toHaveLength(2)
    expect(screen.getAllByText('TypeScript')).toHaveLength(2)
    expect(screen.getByText('Next.js')).toBeInTheDocument()
    expect(screen.getByText('Animation')).toBeInTheDocument()
  })

  it('should show tag filter buttons when filter is enabled', () => {
    renderProjects({ filter: true })
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'React' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next.js' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Animation' })).toBeInTheDocument()
  })

  it('should filter projects by tag', async () => {
    const user = userEvent.setup()
    renderProjects({ filter: true })

    // Click on React tag
    await user.click(screen.getByRole('button', { name: 'React' }))

    // Only projects with React tag should be visible
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Project Beta')).not.toBeInTheDocument()
    expect(screen.getByText('Project Gamma')).toBeInTheDocument()

    // Click All to reset
    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Project Beta')).toBeInTheDocument()
  })

  it('should render project links', () => {
    renderProjects()
    const viewLinks = screen.getAllByText('View Project')
    expect(viewLinks).toHaveLength(2) // Alpha and Beta have href
    const githubLinks = screen.getAllByText('GitHub')
    expect(githubLinks).toHaveLength(2) // Alpha and Gamma have github
  })

  it('should render with different grid columns', () => {
    const { container, rerender } = renderProjects({ columns: 2 })
    expect(container.querySelector('.md\\:grid-cols-2')).toBeInTheDocument()

    rerender(
      <LandingProvider theme="portfolio">
        <LandingProjects items={items} columns={3} />
      </LandingProvider>
    )
    expect(container.querySelector('.lg\\:grid-cols-3')).toBeInTheDocument()
  })
})
