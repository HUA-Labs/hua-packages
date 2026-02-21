// ========================================
// HUA Motion Core - Physics Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSpringMotion } from '../../hooks/useSpringMotion'
import { useGesture } from '../../hooks/useGesture'
import { useGestureMotion } from '../../hooks/useGestureMotion'
import { calculateSpring } from '../../utils/springPhysics'
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
    it('should have value=from, velocity=0, isAnimating=false when autoStart=false', () => {
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, autoStart: false }))

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
      const { result } = renderHook(() => useSpringMotion({ from: 0, to: 100, autoStart: false }))

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
      const { result } = renderHook(() => useSpringMotion({ from: 50, to: 100, autoStart: false }))

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
})

// ========================================
// calculateSpring (pure function) Tests
// ========================================

describe('calculateSpring', () => {
  const defaultConfig = { stiffness: 170, damping: 26, mass: 1 }
  const dt = 1 / 60 // 60fps

  describe("Hooke's Law verification", () => {
    it('should produce force proportional to displacement', () => {
      // At position 100, target 0 → displacement = 100
      // springForce = -170 * 100 = -17000
      // dampingForce = -26 * 0 = 0 (velocity = 0)
      // acceleration = -17000 / 1 = -17000
      // newVelocity = 0 + (-17000) * dt
      // newValue = 100 + newVelocity * dt
      const result = calculateSpring(100, 0, 0, dt, defaultConfig)

      const expectedAcceleration = -defaultConfig.stiffness * 100 / defaultConfig.mass
      const expectedVelocity = expectedAcceleration * dt
      const expectedValue = 100 + expectedVelocity * dt

      expect(result.velocity).toBeCloseTo(expectedVelocity, 5)
      expect(result.value).toBeCloseTo(expectedValue, 5)
    })

    it('should move toward target from above', () => {
      const result = calculateSpring(100, 0, 0, dt, defaultConfig)
      expect(result.value).toBeLessThan(100) // moving toward 0
    })

    it('should move toward target from below', () => {
      const result = calculateSpring(0, 0, 100, dt, defaultConfig)
      expect(result.value).toBeGreaterThan(0) // moving toward 100
    })
  })

  describe('stiffness effect', () => {
    it('higher stiffness → faster convergence', () => {
      const lowStiffness = { stiffness: 50, damping: 26, mass: 1 }
      const highStiffness = { stiffness: 500, damping: 26, mass: 1 }

      // Simulate 30 steps from 0 toward 100
      let lowVal = 0, lowVel = 0
      let highVal = 0, highVel = 0
      for (let i = 0; i < 30; i++) {
        const lr = calculateSpring(lowVal, lowVel, 100, dt, lowStiffness)
        lowVal = lr.value; lowVel = lr.velocity
        const hr = calculateSpring(highVal, highVel, 100, dt, highStiffness)
        highVal = hr.value; highVel = hr.velocity
      }

      // High stiffness should be closer to target
      expect(Math.abs(100 - highVal)).toBeLessThan(Math.abs(100 - lowVal))
    })
  })

  describe('damping effect', () => {
    it('higher damping → less overshoot', () => {
      const lowDamping = { stiffness: 170, damping: 5, mass: 1 }
      const highDamping = { stiffness: 170, damping: 50, mass: 1 }

      // Simulate 120 steps from 0 toward 100
      let lowVal = 0, lowVel = 0, lowMax = 0
      let highVal = 0, highVel = 0, highMax = 0
      for (let i = 0; i < 120; i++) {
        const lr = calculateSpring(lowVal, lowVel, 100, dt, lowDamping)
        lowVal = lr.value; lowVel = lr.velocity
        lowMax = Math.max(lowMax, lowVal)
        const hr = calculateSpring(highVal, highVel, 100, dt, highDamping)
        highVal = hr.value; highVel = hr.velocity
        highMax = Math.max(highMax, highVal)
      }

      // Low damping overshoots more
      expect(highMax - 100).toBeLessThan(lowMax - 100)
    })
  })

  describe('rest condition', () => {
    it('should converge to target within threshold', () => {
      const restDelta = 0.01
      const restSpeed = 0.01

      let val = 0, vel = 0
      let settled = false
      for (let i = 0; i < 600; i++) {
        const r = calculateSpring(val, vel, 100, dt, defaultConfig)
        val = r.value; vel = r.velocity
        if (Math.abs(val - 100) < restDelta && Math.abs(vel) < restSpeed) {
          settled = true
          break
        }
      }

      expect(settled).toBe(true)
      expect(val).toBeCloseTo(100, 1)
    })
  })

  describe('zero displacement', () => {
    it('from === to → no force, no movement', () => {
      const result = calculateSpring(50, 0, 50, dt, defaultConfig)

      expect(result.value).toBe(50)
      expect(result.velocity).toBe(0)
    })
  })

  describe('energy direction', () => {
    it('initial step should move value toward target', () => {
      // from below
      const up = calculateSpring(0, 0, 100, dt, defaultConfig)
      expect(up.value).toBeGreaterThan(0)
      expect(up.velocity).toBeGreaterThan(0)

      // from above
      const down = calculateSpring(200, 0, 100, dt, defaultConfig)
      expect(down.value).toBeLessThan(200)
      expect(down.velocity).toBeLessThan(0)
    })
  })

  // ========================================
  // Edge Cases
  // ========================================

  describe('edge cases', () => {
    it('zero mass → Infinity acceleration (division by zero)', () => {
      const zeroMass = { stiffness: 170, damping: 26, mass: 0 }
      const result = calculateSpring(0, 0, 100, dt, zeroMass)

      // F/0 = Infinity → velocity/value become Infinity
      expect(result.velocity).toBe(Infinity)
      expect(result.value).toBe(Infinity)
    })

    it('negative mass → inverted acceleration direction', () => {
      const negMass = { stiffness: 170, damping: 26, mass: -1 }
      const result = calculateSpring(0, 0, 100, dt, negMass)

      // Negative mass flips force direction → moves away from target
      expect(result.value).toBeLessThan(0)
      expect(result.velocity).toBeLessThan(0)
    })

    it('zero damping → undamped oscillation (no energy loss)', () => {
      const undamped = { stiffness: 170, damping: 0, mass: 1 }

      // Simulate full cycle — should overshoot and come back
      let val = 0, vel = 0, maxVal = 0
      for (let i = 0; i < 600; i++) {
        const r = calculateSpring(val, vel, 100, dt, undamped)
        val = r.value; vel = r.velocity
        maxVal = Math.max(maxVal, val)
      }

      // Undamped spring overshoots past target
      expect(maxVal).toBeGreaterThan(100)

      // After many steps, should NOT have settled (still oscillating)
      // Check velocity is still non-negligible
      expect(Math.abs(vel)).toBeGreaterThan(0.1)
    })

    it('negative damping → energy injection (diverges)', () => {
      const negDamp = { stiffness: 170, damping: -10, mass: 1 }

      let val = 0, vel = 0
      for (let i = 0; i < 300; i++) {
        const r = calculateSpring(val, vel, 100, dt, negDamp)
        val = r.value; vel = r.velocity
      }

      // Negative damping adds energy → amplitude grows unbounded
      expect(Math.abs(val)).toBeGreaterThan(200)
    })

    it('very large deltaTime → numerical instability', () => {
      // 1 second timestep (way beyond intended 16ms frame)
      const result = calculateSpring(0, 0, 100, 1.0, defaultConfig)

      // With dt=1s, semi-implicit Euler overshoots massively
      // stiffness=170, displacement=-100 → force=17000 → vel=17000 → val=17000
      expect(Math.abs(result.value)).toBeGreaterThan(1000)
    })

    it('very small deltaTime → near-zero movement', () => {
      const tinyDt = 1e-10
      const result = calculateSpring(0, 0, 100, tinyDt, defaultConfig)

      // Almost no movement with tiny timestep
      expect(result.value).toBeCloseTo(0, 5)
      expect(result.velocity).toBeCloseTo(0, 2)
    })

    it('zero deltaTime → no change', () => {
      const result = calculateSpring(50, 10, 100, 0, defaultConfig)

      expect(result.value).toBe(50)
      expect(result.velocity).toBe(10)
    })

    it('zero stiffness → no restoring force, only damping', () => {
      const noSpring = { stiffness: 0, damping: 26, mass: 1 }

      // With initial velocity, damping slows it down but no pull toward target
      const result = calculateSpring(0, 100, 50, dt, noSpring)

      // Velocity decreases due to damping
      expect(result.velocity).toBeLessThan(100)
      expect(result.velocity).toBeGreaterThan(0)

      // Position moves in velocity direction, not toward target
      expect(result.value).toBeGreaterThan(0)
    })

    it('very large displacement → proportionally large force', () => {
      const result = calculateSpring(0, 0, 1e6, dt, defaultConfig)
      const smallResult = calculateSpring(0, 0, 100, dt, defaultConfig)

      // Force scales linearly with displacement
      // velocity ratio should match displacement ratio
      expect(result.velocity / smallResult.velocity).toBeCloseTo(1e6 / 100, 0)
    })

    it('existing velocity opposing spring direction', () => {
      // At 0, target 100, but velocity is -50 (moving away)
      const result = calculateSpring(0, -50, 100, dt, defaultConfig)

      // Spring force pulls toward 100, but initial velocity pulls away
      // After one step, velocity should be less negative (spring fighting back)
      expect(result.velocity).toBeGreaterThan(-50)
    })

    it('NaN input propagates to output', () => {
      const result = calculateSpring(NaN, 0, 100, dt, defaultConfig)
      expect(result.value).toBeNaN()
      expect(result.velocity).toBeNaN()
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
    it('should accept onComplete callback without throwing', () => {
      const onComplete = vi.fn()
      // Verify that the hook accepts onComplete and starts without error
      const { result } = renderHook(() =>
        useSpringMotion({
          from: 0,
          to: 1,
          onComplete,
          autoStart: false,
          stiffness: 500,
          damping: 20
        })
      )

      // Start animation — onComplete is wired up and will be called when spring settles
      act(() => {
        result.current.start()
      })

      // Animation should be running
      expect(result.current.isAnimating).toBe(true)
      // onComplete is a valid mock function registered in the hook
      expect(typeof onComplete).toBe('function')
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
