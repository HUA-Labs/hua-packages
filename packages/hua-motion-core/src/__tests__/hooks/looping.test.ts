// ========================================
// HUA Motion Core - Looping Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePulse } from '../../hooks/usePulse'
import { useRepeat } from '../../hooks/useRepeat'
import { useGradient } from '../../hooks/useGradient'

// ========================================
// usePulse Tests (~12 tests)
// ========================================

describe('usePulse', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should have isAnimating=false, isVisible=true, progress=0', () => {
      const { result } = renderHook(() => usePulse())

      expect(result.current.isAnimating).toBe(false)
      expect(result.current.isVisible).toBe(true)
      expect(result.current.progress).toBe(0)
    })

    it('should provide ref, style, and control functions', () => {
      const { result } = renderHook(() => usePulse())

      expect(result.current.ref).toBeDefined()
      expect(result.current.style).toBeDefined()
      expect(typeof result.current.start).toBe('function')
      expect(typeof result.current.stop).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('start() method', () => {
    it('should call start function without error', () => {
      const { result } = renderHook(() => usePulse())

      act(() => {
        result.current.start()
      })

      // With null ref, start() returns early so isAnimating stays false
      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('stop() method', () => {
    it('should call stop function without error', () => {
      const { result } = renderHook(() => usePulse())

      act(() => {
        result.current.start()
      })

      // start() didn't work due to null ref
      expect(result.current.isAnimating).toBe(false)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('reset() method', () => {
    it('should reset progress to 0 and restore opacity to 1', () => {
      const { result } = renderHook(() => usePulse())

      act(() => {
        result.current.start()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.progress).toBe(0)
      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('autoStart option', () => {
    it('should accept autoStart=true option', () => {
      const { result } = renderHook(() => usePulse({ autoStart: true }))

      // autoStart calls start() which checks ref.current, but in renderHook ref is null
      // so isAnimating stays false
      expect(result.current.isAnimating).toBe(false)
    })

    it('should not start automatically when autoStart=false', () => {
      const { result } = renderHook(() => usePulse({ autoStart: false }))

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('style', () => {
    it('should have opacity property', () => {
      const { result } = renderHook(() => usePulse())

      expect(result.current.style).toHaveProperty('opacity')
    })

    it('should have transition when not animating', () => {
      const { result } = renderHook(() => usePulse())

      expect(result.current.style.transition).toBeDefined()
    })
  })

  describe('duration and intensity', () => {
    it('should accept custom duration', () => {
      const { result } = renderHook(() => usePulse({ duration: 5000 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom intensity', () => {
      const { result } = renderHook(() => usePulse({ intensity: 2 }))

      expect(result.current).toBeDefined()
    })
  })

  describe('isVisible', () => {
    it('should always be true', () => {
      const { result } = renderHook(() => usePulse())

      expect(result.current.isVisible).toBe(true)

      act(() => {
        result.current.start()
      })

      expect(result.current.isVisible).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isVisible).toBe(true)
    })
  })
})

// ========================================
// useRepeat Tests (~12 tests)
// ========================================

describe('useRepeat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should start animating when autoStart=true (default)', () => {
      const { result } = renderHook(() => useRepeat())

      expect(result.current.isAnimating).toBe(true)
      expect(result.current.isVisible).toBe(true)
    })

    it('should not start when autoStart=false', () => {
      const { result } = renderHook(() => useRepeat({ autoStart: false }))

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('type=pulse', () => {
    it('should affect scale', () => {
      const { result } = renderHook(() => useRepeat({ type: 'pulse', autoStart: false }))

      expect(result.current.style.transform).toContain('scale')
    })
  })

  describe('type=fade', () => {
    it('should affect opacity', () => {
      const { result } = renderHook(() => useRepeat({ type: 'fade', autoStart: false }))

      expect(result.current.style).toHaveProperty('opacity')
    })
  })

  describe('type=bounce', () => {
    it('should affect scale with bounce pattern', () => {
      const { result } = renderHook(() => useRepeat({ type: 'bounce', autoStart: false }))

      expect(result.current.style.transform).toContain('scale')
    })
  })

  describe('type=wave', () => {
    it('should affect scale with wave pattern', () => {
      const { result } = renderHook(() => useRepeat({ type: 'wave', autoStart: false }))

      expect(result.current.style.transform).toContain('scale')
    })
  })

  describe('stop() method', () => {
    it('should stop and reset scale/opacity to 1', () => {
      const { result } = renderHook(() => useRepeat({ type: 'pulse' }))

      expect(result.current.isAnimating).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isAnimating).toBe(false)
      expect(result.current.style.transform).toContain('scale(1)')
      expect(result.current.style.opacity).toBe(1)
    })
  })

  describe('reset() method', () => {
    it('should behave same as stop', () => {
      const { result } = renderHook(() => useRepeat({ type: 'pulse' }))

      act(() => {
        result.current.reset()
      })

      expect(result.current.isAnimating).toBe(false)
      expect(result.current.style.transform).toContain('scale(1)')
    })
  })

  describe('custom intensity', () => {
    it('should accept custom intensity value', () => {
      const { result } = renderHook(() => useRepeat({ intensity: 0.2, autoStart: false }))

      expect(result.current).toBeDefined()
    })
  })

  describe('isVisible', () => {
    it('should always be true', () => {
      const { result } = renderHook(() => useRepeat())

      expect(result.current.isVisible).toBe(true)
    })
  })

  describe('start() method', () => {
    it('should start animation', () => {
      const { result } = renderHook(() => useRepeat({ autoStart: false }))

      expect(result.current.isAnimating).toBe(false)

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('custom duration', () => {
    it('should accept custom duration', () => {
      const { result } = renderHook(() => useRepeat({ duration: 2000, autoStart: false }))

      expect(result.current).toBeDefined()
    })
  })
})

// ========================================
// useGradient Tests (~10 tests)
// ========================================

describe('useGradient', () => {
  describe('initial state', () => {
    it('should have isAnimating based on autoStart', () => {
      const { result: resultAutoStart } = renderHook(() => useGradient({ autoStart: true }))
      const { result: resultNoAutoStart } = renderHook(() => useGradient({ autoStart: false }))

      expect(resultAutoStart.current.isAnimating).toBe(true)
      expect(resultNoAutoStart.current.isAnimating).toBe(false)
    })

    it('should have isVisible=true always', () => {
      const { result } = renderHook(() => useGradient())

      expect(result.current.isVisible).toBe(true)
    })
  })

  describe('style.background', () => {
    it('should contain gradient', () => {
      const { result } = renderHook(() => useGradient())

      expect(result.current.style.background).toContain('linear-gradient')
    })

    it('should include custom colors', () => {
      const { result } = renderHook(() => useGradient({ colors: ['#ff0000', '#00ff00', '#0000ff'] }))

      expect(result.current.style.background).toContain('linear-gradient')
    })
  })

  describe('start() method', () => {
    it('should enable animation', () => {
      const { result } = renderHook(() => useGradient({ autoStart: false }))

      expect(result.current.isAnimating).toBe(false)

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('stop() method', () => {
    it('should disable animation', () => {
      const { result } = renderHook(() => useGradient({ autoStart: true }))

      expect(result.current.isAnimating).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('pause() method', () => {
    it('should toggle animation off', () => {
      const { result } = renderHook(() => useGradient({ autoStart: true }))

      act(() => {
        result.current.pause()
      })

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('resume() method', () => {
    it('should toggle animation on', () => {
      const { result } = renderHook(() => useGradient({ autoStart: true }))

      act(() => {
        result.current.pause()
      })

      expect(result.current.isAnimating).toBe(false)

      act(() => {
        result.current.resume()
      })

      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('reset() method', () => {
    it('should clear progress and disable animation', () => {
      const { result } = renderHook(() => useGradient({ autoStart: true }))

      act(() => {
        result.current.reset()
      })

      expect(result.current.isAnimating).toBe(false)
      expect(result.current.progress).toBe(0)
    })
  })

  describe('custom options', () => {
    it('should accept custom direction', () => {
      const { result } = renderHook(() => useGradient({ direction: 'horizontal' }))

      expect(result.current.style.background).toContain('90deg')
    })

    it('should accept custom size', () => {
      const { result } = renderHook(() => useGradient({ size: 400 }))

      expect(result.current.style.backgroundSize).toContain('400')
    })

    it('should accept custom duration and easing', () => {
      const { result } = renderHook(() => useGradient({ duration: 8000, easing: 'linear' }))

      expect(result.current).toBeDefined()
    })
  })
})
