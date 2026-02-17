// ========================================
// HUA Motion Core - Scroll Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useScrollReveal } from '../../hooks/useScrollReveal'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import { useScrollToggle } from '../../hooks/useScrollToggle'

// ========================================
// useScrollReveal Tests (~15 tests)
// ========================================

describe('useScrollReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should have isVisible=false and progress=0 initially', () => {
      const { result } = renderHook(() => useScrollReveal())

      expect(result.current.isVisible).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.isAnimating).toBe(false)
    })

    it('should provide ref, style, and control functions', () => {
      const { result } = renderHook(() => useScrollReveal())

      expect(result.current.ref).toBeDefined()
      expect(result.current.style).toBeDefined()
      expect(typeof result.current.start).toBe('function')
      expect(typeof result.current.reset).toBe('function')
      expect(typeof result.current.stop).toBe('function')
    })
  })

  describe('motionType styles', () => {
    it('fadeIn: should have opacity 0 when hidden', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'fadeIn' }))

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transition).toBeDefined()
    })

    it('slideUp: should have opacity 0 and translateY when hidden', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'slideUp' }))

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('translateY(32px)')
      expect(result.current.style.transition).toBeDefined()
    })

    it('slideLeft: should have opacity 0 and translateX(-32px) when hidden', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'slideLeft' }))

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('translateX(-32px)')
    })

    it('slideRight: should have opacity 0 and translateX(32px) when hidden', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'slideRight' }))

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('translateX(32px)')
    })

    it('scaleIn: should have opacity 0 and scale(0.95) when hidden', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'scaleIn' }))

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('scale(0.95)')
    })

    it('bounceIn: should have opacity 0 and scale(0.75) when hidden', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'bounceIn' }))

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toBe('scale(0.75)')
    })

    it('should have opacity 1 and transform none when visible', () => {
      const { result } = renderHook(() => useScrollReveal({ motionType: 'fadeIn' }))

      act(() => {
        result.current.start()
        vi.runAllTimers()
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.style.opacity).toBe(1)
      expect(result.current.style.transform).toBe('none')
    })
  })

  describe('style transition', () => {
    it('should include transition property', () => {
      const { result } = renderHook(() => useScrollReveal({ duration: 500, easing: 'ease-in-out' }))

      expect(result.current.style.transition).toContain('500ms')
      expect(result.current.style.transition).toContain('ease-in-out')
    })
  })

  describe('start() method', () => {
    it('should trigger animation and make visible', () => {
      const { result } = renderHook(() => useScrollReveal())

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)

      act(() => {
        vi.runAllTimers()
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.progress).toBe(1)
      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('reset() method', () => {
    it('should clear visibility and hasTriggered state', () => {
      const { result } = renderHook(() => useScrollReveal())

      act(() => {
        result.current.start()
        vi.runAllTimers()
      })

      expect(result.current.isVisible).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isVisible).toBe(false)
      expect(result.current.progress).toBe(0)
      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('stop() method', () => {
    it('should stop animation', () => {
      const { result } = renderHook(() => useScrollReveal())

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('callbacks', () => {
    it('should call onStart when animation starts', () => {
      const onStart = vi.fn()
      const { result } = renderHook(() => useScrollReveal({ onStart }))

      act(() => {
        result.current.start()
      })

      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('should call onComplete when animation completes', () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useScrollReveal({ onComplete }))

      act(() => {
        result.current.start()
        vi.runAllTimers()
      })

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should call onStop when stopped', () => {
      const onStop = vi.fn()
      const { result } = renderHook(() => useScrollReveal({ onStop }))

      act(() => {
        result.current.start()
        result.current.stop()
      })

      expect(onStop).toHaveBeenCalledTimes(1)
    })

    it('should call onReset when reset', () => {
      const onReset = vi.fn()
      const { result } = renderHook(() => useScrollReveal({ onReset }))

      act(() => {
        result.current.reset()
      })

      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })
})

// ========================================
// useScrollProgress Tests (~10 tests)
// ========================================

describe('useScrollProgress', () => {
  describe('initial state', () => {
    it('should have progress=0 and mounted=true initially', () => {
      const { result } = renderHook(() => useScrollProgress())

      expect(result.current.progress).toBe(0)
      expect(result.current.mounted).toBe(true)
    })

    it('should have mounted=true after render', async () => {
      const { result, rerender } = renderHook(() => useScrollProgress())

      expect(result.current.mounted).toBe(true)

      await act(async () => {
        await Promise.resolve()
      })

      rerender()

      expect(result.current.mounted).toBe(true)
    })
  })

  describe('default progress', () => {
    it('should start with progress=0', () => {
      const { result } = renderHook(() => useScrollProgress())

      expect(result.current.progress).toBe(0)
    })
  })

  describe('target option', () => {
    it('should accept custom target height', () => {
      const { result } = renderHook(() => useScrollProgress({ target: 1000 }))

      expect(result.current).toBeDefined()
      expect(result.current.progress).toBeGreaterThanOrEqual(0)
      expect(result.current.progress).toBeLessThanOrEqual(100)
    })
  })

  describe('offset option', () => {
    it('should accept offset value', () => {
      const { result } = renderHook(() => useScrollProgress({ offset: 100 }))

      expect(result.current).toBeDefined()
      expect(result.current.progress).toBeGreaterThanOrEqual(0)
      expect(result.current.progress).toBeLessThanOrEqual(100)
    })
  })

  describe('showOnMount option', () => {
    it('should set initial progress based on showOnMount', () => {
      const { result } = renderHook(() => useScrollProgress({ showOnMount: true }))

      expect(result.current.progress).toBe(0)
    })

    it('should work with showOnMount=false', () => {
      const { result } = renderHook(() => useScrollProgress({ showOnMount: false }))

      expect(result.current.progress).toBe(0)
    })
  })

  describe('progress bounds', () => {
    it('should clamp progress between 0 and 100', () => {
      const { result } = renderHook(() => useScrollProgress())

      expect(result.current.progress).toBeGreaterThanOrEqual(0)
      expect(result.current.progress).toBeLessThanOrEqual(100)
    })
  })

  describe('return values', () => {
    it('should return progress and mounted', () => {
      const { result } = renderHook(() => useScrollProgress())

      expect(result.current).toHaveProperty('progress')
      expect(result.current).toHaveProperty('mounted')
    })
  })

  describe('custom target and offset', () => {
    it('should work with both target and offset', () => {
      const { result } = renderHook(() => useScrollProgress({ target: 2000, offset: 200 }))

      expect(result.current.progress).toBeGreaterThanOrEqual(0)
      expect(result.current.progress).toBeLessThanOrEqual(100)
    })
  })
})

// ========================================
// useScrollToggle Tests (~12 tests)
// ========================================

describe('useScrollToggle', () => {
  describe('initial state', () => {
    it('should have isVisible=false initially', () => {
      const { result } = renderHook(() => useScrollToggle())

      expect(result.current.isVisible).toBe(false)
      expect(result.current.isAnimating).toBe(false)
      expect(result.current.progress).toBe(0)
    })
  })

  describe('style values', () => {
    it('should have correct hidden values (hideScale=0.8, hideOpacity=0)', () => {
      const { result } = renderHook(() => useScrollToggle())

      expect(result.current.style.opacity).toBe(0)
      expect(result.current.style.transform).toContain('scale(0.8)')
    })

    it('should have correct visible values when visible', () => {
      const { result } = renderHook(() => useScrollToggle())

      act(() => {
        result.current.start()
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.style.opacity).toBe(1)
      expect(result.current.style.transform).toContain('scale(1)')
    })
  })

  describe('start() method', () => {
    it('should make visible', () => {
      const { result } = renderHook(() => useScrollToggle())

      act(() => {
        result.current.start()
      })

      expect(result.current.isVisible).toBe(true)
      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('reset() method', () => {
    it('should make hidden', () => {
      const { result } = renderHook(() => useScrollToggle())

      act(() => {
        result.current.start()
      })

      expect(result.current.isVisible).toBe(true)

      act(() => {
        result.current.reset()
      })

      expect(result.current.isVisible).toBe(false)
      expect(result.current.isAnimating).toBe(false)
      expect(result.current.progress).toBe(0)
    })
  })

  describe('stop() method', () => {
    it('should stop animating', () => {
      const { result } = renderHook(() => useScrollToggle())

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('pause() method', () => {
    it('should pause animation', () => {
      const { result } = renderHook(() => useScrollToggle())

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)

      act(() => {
        result.current.pause()
      })

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('resume() method', () => {
    it('should resume animation', () => {
      const { result } = renderHook(() => useScrollToggle())

      act(() => {
        result.current.start()
        result.current.pause()
      })

      expect(result.current.isAnimating).toBe(false)

      act(() => {
        result.current.resume()
      })

      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('custom show/hide values', () => {
    it('should use custom showScale', () => {
      const { result } = renderHook(() => useScrollToggle({ showScale: 1.2 }))

      act(() => {
        result.current.start()
      })

      expect(result.current.style.transform).toContain('scale(1.2)')
    })

    it('should use custom hideScale', () => {
      const { result } = renderHook(() => useScrollToggle({ hideScale: 0.5 }))

      expect(result.current.style.transform).toContain('scale(0.5)')
    })

    it('should use custom showOpacity', () => {
      const { result } = renderHook(() => useScrollToggle({ showOpacity: 0.9 }))

      act(() => {
        result.current.start()
      })

      expect(result.current.style.opacity).toBe(0.9)
    })

    it('should use custom hideOpacity', () => {
      const { result } = renderHook(() => useScrollToggle({ hideOpacity: 0.3 }))

      expect(result.current.style.opacity).toBe(0.3)
    })

    it('should use custom translateY values', () => {
      const { result } = renderHook(() => useScrollToggle({ hideTranslateY: 50 }))

      expect(result.current.style.transform).toContain('50px')
    })
  })
})
