import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Motion } from '../../components/Motion'

// Uses global IntersectionObserver mock from setup.ts

describe('Motion', () => {
  it('should render children', () => {
    render(<Motion>Hello Motion</Motion>)
    expect(screen.getByText('Hello Motion')).toBeDefined()
  })

  it('should render as div by default', () => {
    const { container } = render(<Motion>content</Motion>)
    expect(container.querySelector('div')).not.toBeNull()
  })

  it('should render with as="section"', () => {
    const { container } = render(<Motion as="section">content</Motion>)
    expect(container.querySelector('section')).not.toBeNull()
  })

  it('should render with as="span"', () => {
    const { container } = render(<Motion as="span">content</Motion>)
    expect(container.querySelector('span')).not.toBeNull()
  })

  it('should render with as="article"', () => {
    const { container } = render(<Motion as="article">content</Motion>)
    expect(container.querySelector('article')).not.toBeNull()
  })

  it('should apply motion styles (opacity)', () => {
    const { container } = render(<Motion>content</Motion>)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.opacity).toBeDefined()
  })

  it('should merge className', () => {
    const { container } = render(<Motion className="my-class">content</Motion>)
    const el = container.firstElementChild as HTMLElement
    expect(el.classList.contains('my-class')).toBe(true)
  })

  it('should merge user style with motion style', () => {
    const { container } = render(
      <Motion style={{ color: 'red' }}>content</Motion>
    )
    const el = container.firstElementChild as HTMLElement
    expect(el.style.color).toBe('red')
  })

  it('should pass through HTML attributes', () => {
    const { container } = render(
      <Motion data-testid="motion-el" id="test-motion">content</Motion>
    )
    const el = container.querySelector('#test-motion')
    expect(el).not.toBeNull()
    expect(el!.getAttribute('data-testid')).toBe('motion-el')
  })

  it('should work in scroll mode with boolean', () => {
    render(<Motion scroll>scroll content</Motion>)
    expect(screen.getByText('scroll content')).toBeDefined()
  })

  it('should work in scroll mode with options', () => {
    render(
      <Motion scroll={{ motionType: 'slideUp', threshold: 0.2 }} delay={200}>
        scroll opts
      </Motion>
    )
    expect(screen.getByText('scroll opts')).toBeDefined()
  })

  it('should apply initial opacity 0', () => {
    const { container } = render(<Motion type="fadeIn">fade</Motion>)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.opacity).toBe('0')
  })
})
