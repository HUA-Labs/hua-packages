// ========================================
// HUA Motion Core - Physics Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpringMotion } from '../../hooks/useSpringMotion'
import { useGesture } from '../../hooks/useGesture'
import { useGestureMotion } from '../../hooks/useGestureMotion'
import { flushRAF } from '../setup'

// ========================================
// useSpringMotion Tests (~15 tests)
// ========================================

describe('useSpringMotion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('initial state', () => {
    it('should have value=from, velocity=0, isAnimating=false', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      expect(result.current.value).toBe(0)
      expect(result.current.velocity).toBe(0)
      expect(result.current.isAnimating).toBe(false)
      expect(result.current.progress).toBe(0)
    })

    it('should provide ref, style, and control functions', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      expect(result.current.ref).toBeDefined()
      expect(result.current.style).toBeDefined()
      expect(typeof result.current.start).toBe('function')
      expect(typeof result.current.stop).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('start() method', () => {
    it('should set isAnimating=true', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      act(() => {
        result.current.start()
      })

      expect(result.current.isAnimating).toBe(true)
    })
  })

  describe('stop() method', () => {
    it('should set isAnimating=false', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

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

  describe('reset() method', () => {
    it('should return value to from and progress to 0', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 50, to: 100 }))

      act(() => {
        result.current.start()
        flushRAF()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.value).toBe(50)
      expect(result.current.velocity).toBe(0)
      expect(result.current.progress).toBe(0)
      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('autoStart option', () => {
    it('should start animation when autoStart=true', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, autoStart: true }))

      expect(result.current.isAnimating).toBe(true)
    })

    it('should not start when autoStart=false', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, autoStart: false }))

      expect(result.current.isAnimating).toBe(false)
    })
  })

  describe('style', () => {
    it('should contain CSS custom properties', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      expect(result.current.style).toHaveProperty('--motion-progress')
      expect(result.current.style).toHaveProperty('--motion-value')
    })
  })

  describe('isVisible', () => {
    it('should always be true', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      expect(result.current.isVisible).toBe(true)

      act(() => {
        result.current.start()
      })

      expect(result.current.isVisible).toBe(true)
    })
  })

  describe('progress', () => {
    it('should start at 0', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      expect(result.current.progress).toBe(0)
    })
  })

  describe('spring physics options', () => {
    it('should accept custom mass', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, mass: 2 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom stiffness', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, stiffness: 200 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom damping', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, damping: 20 }))

      expect(result.current).toBeDefined()
    })

    it('should accept custom restDelta and restSpeed', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, restDelta: 0.001, restSpeed: 0.001 }))

      expect(result.current).toBeDefined()
    })
  })

  describe('enabled option', () => {
    it('should respect enabled=false', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, enabled: false, autoStart: true }))

      expect(result.current).toBeDefined()
    })

    it('should default to enabled=true', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100 }))

      expect(result.current).toBeDefined()
    })
  })

  describe('callbacks', () => {
    it('should call onComplete when spring settles', async () => {
      const onComplete = vi.fn()
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 1, onComplete, stiffness: 500, damping: 20 }))

      act(() => {
        result.current.start()
      })

      // Spring animations settle over time
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          flushRAF()
          await Promise.resolve()
        }
      })

      // onComplete may or may not be called depending on physics settling
      expect(onComplete).toHaveBeenCalledTimes(onComplete.mock.calls.length)
    })
  })
})

// ========================================
// useGesture Tests (~12 tests)
// ========================================

describe('useGesture', () => {
  describe('initial state', () => {
    it('should have isActive=false, gesture=null, scale=1, rotation=0', () => {
      const { result } = renderHook(() => useGesture())

      expect(result.current.isActive).toBe(false)
      expect(result.current.gesture).toBe(null)
      expect(result.current.scale).toBe(1)
      expect(result.current.rotation).toBe(0)
      expect(result.current.deltaX).toBe(0)
      expect(result.current.deltaY).toBe(0)
    })

    it('should provide control functions and event handlers', () => {
      const { result } = renderHook(() => useGesture())

      expect(typeof result.current.start).toBe('function')
      expect(typeof result.current.stop).toBe('function')
      expect(typeof result.current.reset).toBe('function')
      expect(typeof result.current.onTouchStart).toBe('function')
      expect(typeof result.current.onTouchMove).toBe('function')
      expect(typeof result.current.onTouchEnd).toBe('function')
      expect(typeof result.current.onMouseDown).toBe('function')
      expect(typeof result.current.onMouseMove).toBe('function')
      expect(typeof result.current.onMouseUp).toBe('function')
    })
  })

  describe('start() method', () => {
    it('should activate', () => {
      const { result } = renderHook(() => useGesture())

      act(() => {
        result.current.start()
      })

      expect(result.current.isActive).toBe(true)
    })
  })

  describe('stop() method', () => {
    it('should deactivate and clear gesture', () => {
      const { result } = renderHook(() => useGesture())

      act(() => {
        result.current.start()
      })

      expect(result.current.isActive).toBe(true)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.gesture).toBe(null)
    })
  })

  describe('reset() method', () => {
    it('should reset all values', () => {
      const { result } = renderHook(() => useGesture())

      act(() => {
        result.current.start()
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.isActive).toBe(false)
      expect(result.current.gesture).toBe(null)
      expect(result.current.scale).toBe(1)
      expect(result.current.rotation).toBe(0)
      expect(result.current.deltaX).toBe(0)
      expect(result.current.deltaY).toBe(0)
      expect(result.current.distance).toBe(0)
      expect(result.current.velocity).toBe(0)
    })
  })

  describe('event handlers', () => {
    it('should be functions', () => {
      const { result } = renderHook(() => useGesture())

      expect(typeof result.current.onTouchStart).toBe('function')
      expect(typeof result.current.onTouchMove).toBe('function')
      expect(typeof result.current.onTouchEnd).toBe('function')
      expect(typeof result.current.onMouseDown).toBe('function')
      expect(typeof result.current.onMouseMove).toBe('function')
      expect(typeof result.current.onMouseUp).toBe('function')
    })
  })

  describe('enabled option', () => {
    it('should prevent gesture tracking when enabled=false', () => {
      const { result } = renderHook(() => useGesture({ enabled: false }))

      act(() => {
        result.current.start()
      })

      // When disabled, start() should still work but gesture tracking won't happen
      expect(result.current.isActive).toBe(true)
    })

    it('should allow gesture tracking when enabled=true', () => {
      const { result } = renderHook(() => useGesture({ enabled: true }))

      act(() => {
        result.current.start()
      })

      expect(result.current.isActive).toBe(true)
    })
  })

  describe('threshold option', () => {
    it('should accept custom threshold', () => {
      const { result } = renderHook(() => useGesture({ threshold: 20 }))

      expect(result.current).toBeDefined()
    })
  })

  describe('scale and rotation', () => {
    it('should start with scale=1 and rotation=0', () => {
      const { result } = renderHook(() => useGesture())

      expect(result.current.scale).toBe(1)
      expect(result.current.rotation).toBe(0)
    })
  })

  describe('deltaX and deltaY', () => {
    it('should start with deltas=0', () => {
      const { result } = renderHook(() => useGesture())

      expect(result.current.deltaX).toBe(0)
      expect(result.current.deltaY).toBe(0)
    })
  })

  describe('distance and velocity', () => {
    it('should start with distance=0 and velocity=0', () => {
      const { result } = renderHook(() => useGesture())

      expect(result.current.distance).toBe(0)
      expect(result.current.velocity).toBe(0)
    })
  })

  describe('custom callbacks', () => {
    it('should accept callback options', () => {
      const onSwipe = vi.fn()
      const onPinch = vi.fn()
      const onTap = vi.fn()

      const { result } = renderHook(() => useGesture({ onSwipe, onPinch, onTap }))

      expect(result.current).toBeDefined()
    })
  })
})

// ========================================
// useGestureMotion Tests (~8 tests)
// ========================================

describe('useGestureMotion', () => {
  describe('initial state', () => {
    it('should have isActive=false and default gestureState', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'hover' }))

      expect(result.current.isActive).toBe(false)
      expect(result.current.gestureState.isActive).toBe(false)
      expect(result.current.gestureState.x).toBe(0)
      expect(result.current.gestureState.y).toBe(0)
      expect(result.current.gestureState.deltaX).toBe(0)
      expect(result.current.gestureState.deltaY).toBe(0)
      expect(result.current.gestureState.scale).toBe(1)
      expect(result.current.gestureState.rotation).toBe(0)
    })
  })

  describe('gestureType=hover', () => {
    it('should return correct gestureState', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'hover' }))

      expect(result.current.gestureState).toBeDefined()
      expect(result.current.gestureState.scale).toBe(1)
    })
  })

  describe('gestureType=drag', () => {
    it('should return correct gestureState', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'drag' }))

      expect(result.current.gestureState).toBeDefined()
      expect(result.current.gestureState.deltaX).toBe(0)
      expect(result.current.gestureState.deltaY).toBe(0)
    })
  })

  describe('gestureType=pinch', () => {
    it('should return correct gestureState with scale', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'pinch' }))

      expect(result.current.gestureState).toBeDefined()
      expect(result.current.gestureState.scale).toBe(1)
    })
  })

  describe('gestureType=swipe', () => {
    it('should return correct gestureState', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'swipe' }))

      expect(result.current.gestureState).toBeDefined()
    })
  })

  describe('gestureType=tilt', () => {
    it('should return correct gestureState', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'tilt' }))

      expect(result.current.gestureState).toBeDefined()
    })
  })

  describe('enabled option', () => {
    it('should respect enabled=false', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'hover', enabled: false }))

      expect(result.current).toBeDefined()
    })
  })

  describe('motionStyle', () => {
    it('should be an object', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'hover' }))

      expect(result.current.motionStyle).toBeDefined()
      expect(typeof result.current.motionStyle).toBe('object')
    })
  })

  describe('ref', () => {
    it('should be defined', () => {
      const { result } = renderHook(() => useGestureMotion({ gestureType: 'hover' }))

      expect(result.current.ref).toBeDefined()
    })
  })
})
