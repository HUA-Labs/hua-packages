/**
 * hua-motion-core - Utility Hooks Tests
 * Tests for: useMotionState, useInView, useMouse, useReducedMotion, useWindowSize
 */

import { renderHook, act } from '@testing-library/react'
import { useMotionState } from '../../hooks/useMotionState'
import { useInView } from '../../hooks/useInView'
import { useMouse } from '../../hooks/useMouse'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import { useWindowSize } from '../../hooks/useWindowSize'

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {}
  disconnect() {}
  unobserve() {}
}

global.IntersectionObserver = MockIntersectionObserver as any

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('useMotionState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should have initial state as idle with progress 0 and mounted true', () => {
    const { result } = renderHook(() => useMotionState())

    expect(result.current.state).toBe('idle')
    expect(result.current.progress).toBe(0)
    expect(result.current.mounted).toBe(true)
    expect(result.current.direction).toBe('forward')
  })

  it('should set mounted to true after mount', () => {
    const { result } = renderHook(() => useMotionState())

    act(() => {
      vi.runAllTimers()
    })

    expect(result.current.mounted).toBe(true)
  })

  it('should set state to playing when play is called', () => {
    const { result, rerender } = renderHook(() => useMotionState())

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    act(() => {
      result.current.play()
    })

    expect(result.current.state).toBe('playing')
  })

  it('should set state to paused when pause is called', () => {
    const { result, rerender } = renderHook(() => useMotionState())

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    act(() => {
      result.current.play()
    })

    act(() => {
      result.current.pause()
    })

    expect(result.current.state).toBe('paused')
  })

  it('should reset to idle when stop is called', () => {
    const { result, rerender } = renderHook(() => useMotionState())

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    act(() => {
      result.current.play()
      result.current.stop()
    })

    expect(result.current.state).toBe('idle')
    expect(result.current.progress).toBe(0)
    expect(result.current.elapsed).toBe(0)
  })

  it('should reset direction when reset is called', () => {
    const { result, rerender } = renderHook(() =>
      useMotionState({ direction: 'forward' })
    )

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    act(() => {
      result.current.reverse()
      result.current.reset()
    })

    expect(result.current.direction).toBe('forward')
    expect(result.current.state).toBe('idle')
  })

  it('should toggle direction when reverse is called', () => {
    const { result, rerender } = renderHook(() => useMotionState())

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    const initialDirection = result.current.direction

    act(() => {
      result.current.reverse()
    })

    expect(result.current.direction).toBe(initialDirection === 'forward' ? 'reverse' : 'forward')
  })

  it('should set progress to 50 when seek(50) is called', () => {
    const { result, rerender } = renderHook(() => useMotionState())

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    act(() => {
      result.current.seek(50)
    })

    expect(result.current.progress).toBe(50)
  })

  it('should set state directly when setState is called', () => {
    const { result } = renderHook(() => useMotionState())

    act(() => {
      result.current.setState('error')
    })

    expect(result.current.state).toBe('error')
  })

  it('should auto-play when autoStart is true', () => {
    const { result, rerender } = renderHook(() =>
      useMotionState({ autoStart: true })
    )

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    expect(result.current.state).toBe('playing')
  })

  it('should calculate remaining time correctly', () => {
    const duration = 1000
    const { result } = renderHook(() =>
      useMotionState({ duration })
    )

    expect(result.current.remaining).toBe(duration)
  })

  it('should loop when loop is true', () => {
    const { result, rerender } = renderHook(() =>
      useMotionState({ loop: true, duration: 100, autoStart: true })
    )

    act(() => {
      vi.runAllTimers()
    })

    rerender()

    // With loop, state should not become 'completed'
    // This test verifies loop option is accepted
    expect(result.current.state).toBe('playing')
  })

  it('should provide all required control functions', () => {
    const { result } = renderHook(() => useMotionState())

    expect(typeof result.current.play).toBe('function')
    expect(typeof result.current.pause).toBe('function')
    expect(typeof result.current.stop).toBe('function')
    expect(typeof result.current.reset).toBe('function')
    expect(typeof result.current.reverse).toBe('function')
    expect(typeof result.current.seek).toBe('function')
    expect(typeof result.current.setState).toBe('function')
  })

  it('should accept custom duration and delay options', () => {
    const { result } = renderHook(() =>
      useMotionState({ duration: 2000, delay: 500 })
    )

    expect(result.current.remaining).toBe(2000)
  })

  it('should accept custom initial state', () => {
    const { result } = renderHook(() =>
      useMotionState({ initialState: 'paused' })
    )

    expect(result.current.state).toBe('idle') // showOnMount=false by default
  })

  it('should show initial state when showOnMount is true', () => {
    const { result } = renderHook(() =>
      useMotionState({ initialState: 'playing', showOnMount: true })
    )

    expect(result.current.state).toBe('playing')
  })
})

describe('useInView', () => {
  it('should have initial state with inView false and entry null', () => {
    const { result } = renderHook(() => useInView())

    expect(result.current.inView).toBe(false)
    expect(result.current.entry).toBe(null)
  })

  it('should start with inView true when initialInView is true', () => {
    const { result } = renderHook(() =>
      useInView({ initialInView: true })
    )

    expect(result.current.inView).toBe(true)
  })

  it('should provide a ref', () => {
    const { result } = renderHook(() => useInView())

    expect(result.current.ref).toBeDefined()
    expect(typeof result.current.ref).toBe('object')
    expect(result.current.ref.current).toBe(null)
  })

  it('should accept threshold option', () => {
    const { result } = renderHook(() =>
      useInView({ threshold: 0.5 })
    )

    expect(result.current.inView).toBe(false)
  })

  it('should accept rootMargin option', () => {
    const { result } = renderHook(() =>
      useInView({ rootMargin: '10px' })
    )

    expect(result.current.inView).toBe(false)
  })

  it('should accept triggerOnce option', () => {
    const { result } = renderHook(() =>
      useInView({ triggerOnce: true })
    )

    expect(result.current.inView).toBe(false)
  })

  it('should return correct shape', () => {
    const { result } = renderHook(() => useInView())

    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('inView')
    expect(result.current).toHaveProperty('entry')
  })

  it('should handle different threshold values', () => {
    const { result: result1 } = renderHook(() => useInView({ threshold: 0 }))
    const { result: result2 } = renderHook(() => useInView({ threshold: 1 }))

    expect(result1.current.inView).toBe(false)
    expect(result2.current.inView).toBe(false)
  })

  it('should accept array threshold', () => {
    const { result } = renderHook(() =>
      useInView({ threshold: [0, 0.5, 1] })
    )

    expect(result.current.inView).toBe(false)
  })

  it('should cleanup observer on unmount', () => {
    const { unmount } = renderHook(() => useInView())

    expect(() => unmount()).not.toThrow()
  })

  it('should allow triggerOnce false for re-triggering', () => {
    const { result } = renderHook(() =>
      useInView({ triggerOnce: false })
    )

    expect(result.current.inView).toBe(false)
  })

  it('should handle custom root margin formats', () => {
    const { result } = renderHook(() =>
      useInView({ rootMargin: '20px 10px' })
    )

    expect(result.current).toBeDefined()
  })
})

describe('useMouse', () => {
  it('should have initial state with all zeros and isOver false', () => {
    const { result } = renderHook(() => useMouse())

    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
    expect(result.current.elementX).toBe(0)
    expect(result.current.elementY).toBe(0)
    expect(result.current.isOver).toBe(false)
  })

  it('should return correct shape', () => {
    const { result } = renderHook(() => useMouse())

    expect(result.current).toHaveProperty('x')
    expect(result.current).toHaveProperty('y')
    expect(result.current).toHaveProperty('elementX')
    expect(result.current).toHaveProperty('elementY')
    expect(result.current).toHaveProperty('isOver')
  })

  it('should accept throttle option', () => {
    const { result } = renderHook(() =>
      useMouse({ throttle: 100 })
    )

    expect(result.current.x).toBe(0)
  })

  it('should work without targetRef', () => {
    const { result } = renderHook(() => useMouse())

    expect(result.current.isOver).toBe(false)
  })

  it('should accept targetRef option', () => {
    const targetRef = { current: document.createElement('div') }
    const { result } = renderHook(() =>
      useMouse({ targetRef })
    )

    expect(result.current).toBeDefined()
  })

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useMouse())

    expect(() => unmount()).not.toThrow()
  })

  it('should handle zero throttle', () => {
    const { result } = renderHook(() =>
      useMouse({ throttle: 0 })
    )

    expect(result.current.x).toBe(0)
  })

  it('should provide normalized element coordinates', () => {
    const { result } = renderHook(() => useMouse())

    // Initial elementX and elementY should be in valid range
    expect(result.current.elementX).toBeGreaterThanOrEqual(0)
    expect(result.current.elementY).toBeGreaterThanOrEqual(0)
  })
})

describe('useReducedMotion', () => {
  it('should have initial state with prefersReducedMotion false', () => {
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current.prefersReducedMotion).toBe(false)
  })

  it('should return correct shape', () => {
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current).toHaveProperty('prefersReducedMotion')
  })

  it('should call matchMedia with correct query', () => {
    const matchMediaSpy = vi.spyOn(window, 'matchMedia')

    renderHook(() => useReducedMotion())

    expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
  })

  it('should handle SSR safely', () => {
    const { result } = renderHook(() => useReducedMotion())

    expect(result.current.prefersReducedMotion).toBe(false)
  })

  it('should cleanup listener on unmount', () => {
    const { unmount } = renderHook(() => useReducedMotion())

    expect(() => unmount()).not.toThrow()
  })

  it('should return boolean value', () => {
    const { result } = renderHook(() => useReducedMotion())

    expect(typeof result.current.prefersReducedMotion).toBe('boolean')
  })
})

describe('useWindowSize', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    })
  })

  it('should have initial state with window dimensions after mount', () => {
    const { result } = renderHook(() => useWindowSize())

    // After renderHook, effects run and updateSize() sets dimensions
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
    expect(result.current.isMounted).toBe(true)
  })

  it('should accept custom initial width and height but override after mount', () => {
    const { result } = renderHook(() =>
      useWindowSize({ initialWidth: 800, initialHeight: 600 })
    )

    // After mount, updateSize() overrides with window dimensions
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
  })

  it('should set isMounted to true after mount', () => {
    const { result } = renderHook(() => useWindowSize())

    expect(result.current.isMounted).toBe(true)
    expect(result.current.width).toBe(1024)
    expect(result.current.height).toBe(768)
  })

  it('should return correct shape', () => {
    const { result } = renderHook(() => useWindowSize())

    expect(result.current).toHaveProperty('width')
    expect(result.current).toHaveProperty('height')
    expect(result.current).toHaveProperty('isMounted')
  })

  it('should accept debounce option', () => {
    const { result } = renderHook(() =>
      useWindowSize({ debounce: 200 })
    )

    expect(result.current).toBeDefined()
  })

  it('should handle zero debounce', () => {
    const { result } = renderHook(() =>
      useWindowSize({ debounce: 0 })
    )

    expect(result.current).toBeDefined()
  })

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() => useWindowSize())

    expect(() => unmount()).not.toThrow()
  })

  it('should return number values for dimensions', () => {
    const { result } = renderHook(() => useWindowSize())

    expect(typeof result.current.width).toBe('number')
    expect(typeof result.current.height).toBe('number')
  })
})
