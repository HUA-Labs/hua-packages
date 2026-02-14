import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStagger } from '../../hooks/useStagger'

// Uses global IntersectionObserver mock from setup.ts

describe('useStagger', () => {
  it('should return styles array with length equal to count', () => {
    const { result } = renderHook(() => useStagger({ count: 5 }))
    expect(result.current.styles).toHaveLength(5)
  })

  it('should return containerRef', () => {
    const { result } = renderHook(() => useStagger({ count: 3 }))
    expect(result.current.containerRef).toBeDefined()
    expect(result.current.containerRef.current).toBeNull()
  })

  it('should start with isVisible false', () => {
    const { result } = renderHook(() => useStagger({ count: 3 }))
    expect(result.current.isVisible).toBe(false)
  })

  it('should have opacity 0 in initial styles', () => {
    const { result } = renderHook(() => useStagger({ count: 3 }))
    result.current.styles.forEach((style) => {
      expect(style.opacity).toBe(0)
    })
  })

  it('should have increasing transition-delay in styles', () => {
    const { result } = renderHook(() =>
      useStagger({ count: 4, staggerDelay: 100, baseDelay: 0 })
    )

    result.current.styles.forEach((style, i) => {
      const transition = style.transition as string
      const expectedDelay = i * 100
      expect(transition).toContain(`${expectedDelay}ms`)
    })
  })

  it('should respect baseDelay', () => {
    const { result } = renderHook(() =>
      useStagger({ count: 3, staggerDelay: 100, baseDelay: 200 })
    )

    const transition0 = result.current.styles[0].transition as string
    expect(transition0).toContain('200ms') // baseDelay + 0 * staggerDelay

    const transition1 = result.current.styles[1].transition as string
    expect(transition1).toContain('300ms') // baseDelay + 1 * staggerDelay

    const transition2 = result.current.styles[2].transition as string
    expect(transition2).toContain('400ms') // baseDelay + 2 * staggerDelay
  })

  it('should apply slideUp initial transform', () => {
    const { result } = renderHook(() =>
      useStagger({ count: 2, motionType: 'slideUp' })
    )
    result.current.styles.forEach((style) => {
      expect(style.transform).toBe('translateY(32px)')
    })
  })

  it('should apply scaleIn initial transform', () => {
    const { result } = renderHook(() =>
      useStagger({ count: 2, motionType: 'scaleIn' })
    )
    result.current.styles.forEach((style) => {
      expect(style.transform).toBe('scale(0.95)')
    })
  })

  it('should apply fadeIn with transform none', () => {
    const { result } = renderHook(() =>
      useStagger({ count: 2, motionType: 'fadeIn' })
    )
    result.current.styles.forEach((style) => {
      expect(style.transform).toBe('none')
    })
  })

  it('should regenerate styles when count changes', () => {
    const { result, rerender } = renderHook(
      ({ count }) => useStagger({ count }),
      { initialProps: { count: 3 } }
    )
    expect(result.current.styles).toHaveLength(3)

    rerender({ count: 5 })
    expect(result.current.styles).toHaveLength(5)
  })

  it('should apply custom duration and easing', () => {
    const { result } = renderHook(() =>
      useStagger({ count: 2, duration: 500, easing: 'ease-in-out' })
    )
    result.current.styles.forEach((style) => {
      const transition = style.transition as string
      expect(transition).toContain('500ms')
      expect(transition).toContain('ease-in-out')
    })
  })
})
