import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useUnifiedMotion } from '../../hooks/useUnifiedMotion'

// IntersectionObserver mock
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  global.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: mockUnobserve,
    root: null,
    rootMargin: '',
    thresholds: [0],
    takeRecords: () => [],
  }))
})

describe('useUnifiedMotion', () => {
  describe('single type mode (backward compat)', () => {
    it('should return initial hidden style for fadeIn', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({ type: 'fadeIn', autoStart: false })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.isVisible).toBe(false)
    })

    it('should return initial style with translateY for slideUp', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({ type: 'slideUp', autoStart: false, distance: 30 })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('translateY(30px)')
    })

    it('should default to fadeIn when no type or effects provided', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({ autoStart: false })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('none')
    })
  })

  describe('multi-effect mode', () => {
    it('should combine fade + slide transforms', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { fade: true, slide: { direction: 'up', distance: 20 } },
          autoStart: false,
        })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toContain('translateY(20px)')
    })

    it('should combine fade + scale transforms', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { fade: true, scale: { from: 0.8 } },
          autoStart: false,
        })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toContain('scale(0.8)')
    })

    it('should combine slide + scale transforms', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { slide: { direction: 'left', distance: 30 }, scale: { from: 0.9 } },
          autoStart: false,
        })
      )
      const transform = result.current.style.transform as string
      expect(transform).toContain('translateX(30px)')
      expect(transform).toContain('scale(0.9)')
    })

    it('should use bounce easing when bounce effect is set', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { bounce: true },
          autoStart: false,
        })
      )
      expect(result.current.style.transition).toContain('cubic-bezier(0.34, 1.56, 0.64, 1)')
    })

    it('should apply fade with custom targetOpacity', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { fade: { targetOpacity: 0.8 } },
          autoStart: false,
        })
      )
      // initial state: opacity 0
      expect(result.current.style.opacity).toBe(0)
    })

    it('should set opacity to 0 when only slide is used', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { slide: { direction: 'down', distance: 40 } },
          autoStart: false,
        })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toContain('translateY(-40px)')
    })

    it('should set opacity to 0 when only scale is used', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { scale: { from: 0.5 } },
          autoStart: false,
        })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toContain('scale(0.5)')
    })

    it('should set opacity to 0 when only bounce is used', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { bounce: true },
          autoStart: false,
        })
      )
      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toContain('scale(0)')
    })

    it('should handle all four slide directions', () => {
      const directions: Array<'up' | 'down' | 'left' | 'right'> = ['up', 'down', 'left', 'right']
      const expectedTransforms = [
        'translateY(50px)',
        'translateY(-50px)',
        'translateX(50px)',
        'translateX(-50px)',
      ]

      directions.forEach((direction, index) => {
        const { result } = renderHook(() =>
          useUnifiedMotion({
            effects: { slide: { direction } },
            autoStart: false,
          })
        )
        expect(result.current.style.transform).toContain(expectedTransforms[index])
      })
    })

    it('should combine all effects together', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: {
            fade: { targetOpacity: 0.9 },
            slide: { direction: 'up', distance: 25 },
            scale: { from: 0.85, to: 1.05 },
          },
          autoStart: false,
        })
      )
      expect(result.current.style.opacity).toBe(0)
      const transform = result.current.style.transform as string
      expect(transform).toContain('translateY(25px)')
      expect(transform).toContain('scale(0.85)')
    })
  })

  describe('ref handling', () => {
    it('should return a single ref', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { fade: true, slide: true },
          autoStart: false,
        })
      )
      expect(result.current.ref).toBeDefined()
      expect(result.current.ref.current).toBeNull()
    })
  })

  describe('start/stop/reset', () => {
    it('should provide start, stop, reset functions', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({ type: 'fadeIn', autoStart: false })
      )
      expect(typeof result.current.start).toBe('function')
      expect(typeof result.current.stop).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })

    it('should transition to visible style when started (multi-effect)', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { fade: true, scale: { from: 0.8, to: 1 } },
          autoStart: false,
          delay: 0,
        })
      )

      expect(result.current.isVisible).toBe(false)

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.style.opacity).toBe(1)
      expect(result.current.style.transform).toContain('scale(1)')

      vi.useRealTimers()
    })

    it('should respect custom targetOpacity when visible', () => {
      vi.useFakeTimers()
      const { result } = renderHook(() =>
        useUnifiedMotion({
          effects: { fade: { targetOpacity: 0.7 } },
          autoStart: false,
          delay: 0,
        })
      )

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.style.opacity).toBe(0.7)

      vi.useRealTimers()
    })
  })

  describe('effects priority over type', () => {
    it('should use effects when both type and effects are provided', () => {
      const { result } = renderHook(() =>
        useUnifiedMotion({
          type: 'fadeIn',
          effects: { slide: { direction: 'left' } },
          autoStart: false,
        })
      )
      // Should use effects (slide left), not type (fadeIn)
      expect(result.current.style.transform).toContain('translateX')
    })
  })
})
