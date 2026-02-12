/**
 * MotionEngine 테스트
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { MotionEngine, MotionOptions } from '../../core/MotionEngine'

describe('MotionEngine', () => {
  let engine: MotionEngine
  let element: HTMLElement

  beforeEach(() => {
    vi.useFakeTimers()
    engine = new MotionEngine()
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    engine.destroy()
    document.body.removeChild(element)
    vi.useRealTimers()
  })

  describe('motion()', () => {
    it('should return a string motionId', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)

      expect(typeof motionId).toBe('string')
      expect(motionId).toMatch(/^motion_/)
    })

    it('should set GPU acceleration on element', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      await engine.motion(element, [], options)

      expect(element.style.willChange).toBe('transform, opacity')
      expect(element.style.transform).toContain('translateZ(0)')
    })

    it('should set backfaceVisibility for layer creation', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      await engine.motion(element, [], options)

      expect(element.style.backfaceVisibility).toBe('hidden')
    })

    it('should call onStart synchronously', async () => {
      const onStart = vi.fn()
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t,
        onStart
      }

      await engine.motion(element, [], options)

      expect(onStart).toHaveBeenCalledTimes(1)
    })

    it('should increase active motion count', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      expect(engine.getActiveMotionCount()).toBe(0)

      await engine.motion(element, [], options)

      expect(engine.getActiveMotionCount()).toBe(1)
    })

    it('should handle delay option', async () => {
      const onUpdate = vi.fn()
      const options: MotionOptions = {
        duration: 1000,
        delay: 500,
        easing: (t) => t,
        onUpdate
      }

      await engine.motion(element, [], options)

      // Advance time before delay completes
      vi.advanceTimersByTime(300)
      await Promise.resolve()

      // Motion should not have started yet
      expect(onUpdate).not.toHaveBeenCalled()
    })

    it('should call onComplete when motion finishes', async () => {
      const onComplete = vi.fn()
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t,
        onComplete
      }

      await engine.motion(element, [], options)

      vi.advanceTimersByTime(1100)
      await Promise.resolve()
      await Promise.resolve()

      expect(onComplete).toHaveBeenCalled()
    })
  })

  describe('stop()', () => {
    it('should remove motion and decrease count', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)
      expect(engine.getActiveMotionCount()).toBe(1)

      engine.stop(motionId)

      expect(engine.getActiveMotionCount()).toBe(0)
    })

    it('should call onCancel callback', async () => {
      const onCancel = vi.fn()
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t,
        onCancel
      }

      const motionId = await engine.motion(element, [], options)
      engine.stop(motionId)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('should handle non-existent motionId gracefully', () => {
      expect(() => {
        engine.stop('non-existent-id')
      }).not.toThrow()
    })
  })

  describe('pause() and resume()', () => {
    it('should set isPaused on motion', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)
      const motion = engine.getMotion(motionId)
      expect(motion?.isPaused).toBe(false)

      engine.pause(motionId)

      const pausedMotion = engine.getMotion(motionId)
      expect(pausedMotion?.isPaused).toBe(true)
    })

    it('should clear isPaused when resumed', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)
      engine.pause(motionId)

      const pausedMotion = engine.getMotion(motionId)
      expect(pausedMotion?.isPaused).toBe(true)

      engine.resume(motionId)

      const resumedMotion = engine.getMotion(motionId)
      expect(resumedMotion?.isPaused).toBe(false)
    })

    it('should adjust startTime when resumed', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)
      const originalMotion = engine.getMotion(motionId)
      const originalStartTime = originalMotion?.startTime

      vi.advanceTimersByTime(500)
      engine.pause(motionId)

      vi.advanceTimersByTime(500)
      engine.resume(motionId)

      const resumedMotion = engine.getMotion(motionId)
      // startTime should be adjusted to account for pause duration
      expect(resumedMotion?.startTime).toBeGreaterThan(originalStartTime || 0)
    })

    it('should not pause already paused motion', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)
      engine.pause(motionId)

      const motion1 = engine.getMotion(motionId)
      const pauseTime1 = motion1?.pauseTime

      engine.pause(motionId)

      const motion2 = engine.getMotion(motionId)
      const pauseTime2 = motion2?.pauseTime

      // Pause time should not change
      expect(pauseTime1).toBe(pauseTime2)
    })
  })

  describe('stopAll()', () => {
    it('should stop all motions and clear map', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      await engine.motion(element, [], options)
      await engine.motion(element, [], options)
      await engine.motion(element, [], options)

      expect(engine.getActiveMotionCount()).toBe(3)

      engine.stopAll()

      expect(engine.getActiveMotionCount()).toBe(0)
    })

    it('should call onCancel for each motion', async () => {
      const onCancel1 = vi.fn()
      const onCancel2 = vi.fn()

      await engine.motion(element, [], {
        duration: 1000,
        easing: (t) => t,
        onCancel: onCancel1
      })

      await engine.motion(element, [], {
        duration: 1000,
        easing: (t) => t,
        onCancel: onCancel2
      })

      engine.stopAll()

      expect(onCancel1).toHaveBeenCalledTimes(1)
      expect(onCancel2).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMotion()', () => {
    it('should return motion state', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const motionId = await engine.motion(element, [], options)
      const motion = engine.getMotion(motionId)

      expect(motion).toBeDefined()
      expect(motion?.id).toBe(motionId)
      expect(motion?.element).toBe(element)
      expect(motion?.isRunning).toBe(true)
    })

    it('should return undefined for non-existent id', () => {
      const motion = engine.getMotion('non-existent-id')

      expect(motion).toBeUndefined()
    })
  })

  describe('getActiveMotionCount()', () => {
    it('should reflect active motions', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      expect(engine.getActiveMotionCount()).toBe(0)

      const id1 = await engine.motion(element, [], options)
      expect(engine.getActiveMotionCount()).toBe(1)

      await engine.motion(element, [], options)
      expect(engine.getActiveMotionCount()).toBe(2)

      engine.stop(id1)
      expect(engine.getActiveMotionCount()).toBe(1)
    })
  })

  describe('destroy()', () => {
    it('should stop all motions', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      await engine.motion(element, [], options)
      await engine.motion(element, [], options)

      expect(engine.getActiveMotionCount()).toBe(2)

      engine.destroy()

      expect(engine.getActiveMotionCount()).toBe(0)
    })

    it('should call onCancel on destroy', async () => {
      const onCancel = vi.fn()
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t,
        onCancel
      }

      await engine.motion(element, [], options)

      engine.destroy()

      expect(onCancel).toHaveBeenCalled()
    })
  })

  describe('Multiple concurrent motions', () => {
    it('should handle multiple motions on same element', async () => {
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      const id1 = await engine.motion(element, [], options)
      const id2 = await engine.motion(element, [], options)

      expect(id1).not.toBe(id2)
      expect(engine.getActiveMotionCount()).toBe(2)
    })

    it('should handle multiple motions on different elements', async () => {
      const element2 = document.createElement('div')
      document.body.appendChild(element2)

      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t
      }

      await engine.motion(element, [], options)
      await engine.motion(element2, [], options)

      expect(engine.getActiveMotionCount()).toBe(2)

      document.body.removeChild(element2)
    })
  })

  describe('onUpdate callback', () => {
    it('should call onUpdate with progress', async () => {
      const onUpdate = vi.fn()
      const options: MotionOptions = {
        duration: 1000,
        easing: (t) => t,
        onUpdate
      }

      await engine.motion(element, [], options)

      vi.advanceTimersByTime(100)
      await Promise.resolve()
      await Promise.resolve()

      expect(onUpdate).toHaveBeenCalled()
      // onUpdate should receive eased progress value (0-1)
      const calls = onUpdate.mock.calls
      if (calls.length > 0) {
        const progress = calls[0][0]
        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(1)
      }
    })
  })
})
