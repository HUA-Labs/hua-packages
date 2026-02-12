/**
 * TransitionEffects 테스트
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { TransitionEffects } from '../../core/TransitionEffects'

describe('TransitionEffects', () => {
  let transitions: TransitionEffects
  let element: HTMLElement

  beforeEach(() => {
    // Reset singleton for test isolation
    ;(TransitionEffects as any).instance = undefined
    transitions = TransitionEffects.getInstance()
    element = document.createElement('div')
    document.body.appendChild(element)
  })

  afterEach(() => {
    transitions.destroy()
    ;(TransitionEffects as any).instance = undefined
    document.body.removeChild(element)
  })

  describe('getInstance()', () => {
    it('should return singleton', () => {
      const instance1 = TransitionEffects.getInstance()
      const instance2 = TransitionEffects.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('fade()', () => {
    it('should return a promise', () => {
      const result = transitions.fade(element, {
        duration: 1000
      })

      expect(result).toBeInstanceOf(Promise)
    })

    it('should set initial opacity to 0 when direction is forward', async () => {
      transitions.fade(element, {
        duration: 1000
      })

      // Wait for promise to resolve and setup to complete
      await vi.waitFor(() => {
        expect(element.style.opacity).toBe('0')
      })
    })

    it('should set initial opacity to current when direction is reverse', async () => {
      element.style.opacity = '0.5'

      transitions.fade(element, {
        duration: 1000,
        direction: 'reverse'
      })

      await vi.waitFor(() => {
        expect(element.style.opacity).toBe('0.5')
      })
    })

    it('should set GPU acceleration (willChange)', async () => {
      transitions.fade(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.willChange).toBe('transform, opacity')
      })
    })

    it('should call onTransitionStart', async () => {
      const onTransitionStart = vi.fn()

      transitions.fade(element, {
        duration: 1000,
        onTransitionStart
      })

      await vi.waitFor(() => {
        expect(onTransitionStart).toHaveBeenCalled()
      })
    })

    it('should call onTransitionComplete', async () => {
      const onTransitionComplete = vi.fn()

      const promise = transitions.fade(element, {
        duration: 10, // Short duration for test
        onTransitionComplete
      })

      await promise

      expect(onTransitionComplete).toHaveBeenCalled()
    })
  })

  describe('slide()', () => {
    it('should return a promise', () => {
      const result = transitions.slide(element, {
        duration: 1000
      })

      expect(result).toBeInstanceOf(Promise)
    })

    it('should set initial translateX', () => {
      transitions.slide(element, {
        duration: 1000,
        distance: 200
      })

      // The transform should be set synchronously
      expect(element.style.transform).toContain('translateX(200px)')
    })

    it('should use default distance if not provided', async () => {
      transitions.slide(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.transform).toContain('translateX(100px)')
      })
    })

    it('should set GPU acceleration', async () => {
      transitions.slide(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.willChange).toBe('transform, opacity')
      })
    })
  })

  describe('scale()', () => {
    it('should return a promise', () => {
      const result = transitions.scale(element, {
        duration: 1000
      })

      expect(result).toBeInstanceOf(Promise)
    })

    it('should set initial scale transform', async () => {
      transitions.scale(element, {
        duration: 1000,
        scale: 0.5
      })

      await vi.waitFor(() => {
        expect(element.style.transform).toContain('scale(0.5)')
      })
    })

    it('should use default scale if not provided', async () => {
      transitions.scale(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.transform).toContain('scale(0.8)')
      })
    })

    it('should set GPU acceleration', async () => {
      transitions.scale(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.willChange).toBe('transform, opacity')
      })
    })
  })

  describe('flip()', () => {
    it('should return a promise', () => {
      const result = transitions.flip(element, {
        duration: 1000
      })

      expect(result).toBeInstanceOf(Promise)
    })

    it('should set perspective and preserve-3d', async () => {
      transitions.flip(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.perspective).toBe('1000px')
        expect(element.style.transformStyle).toBe('preserve-3d')
      })
    })

    it('should set initial rotateY transform', async () => {
      transitions.flip(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.transform).toContain('rotateY(90deg)')
      })
    })

    it('should use custom perspective', async () => {
      transitions.flip(element, {
        duration: 1000,
        perspective: 2000
      })

      await vi.waitFor(() => {
        expect(element.style.perspective).toBe('2000px')
      })
    })
  })

  describe('cube()', () => {
    it('should return a promise', () => {
      const result = transitions.cube(element, {
        duration: 1000
      })

      expect(result).toBeInstanceOf(Promise)
    })

    it('should set perspective and preserve-3d', async () => {
      transitions.cube(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.perspective).toBe('1200px')
        expect(element.style.transformStyle).toBe('preserve-3d')
      })
    })

    it('should set both rotateX and rotateY transforms', async () => {
      transitions.cube(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.transform).toContain('rotateX(90deg)')
        expect(element.style.transform).toContain('rotateY(45deg)')
      })
    })
  })

  describe('morph()', () => {
    it('should return a promise', () => {
      const result = transitions.morph(element, {
        duration: 1000
      })

      expect(result).toBeInstanceOf(Promise)
    })

    it('should set scale and rotate', async () => {
      transitions.morph(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.transform).toContain('scale(0.9)')
        expect(element.style.transform).toContain('rotate(5deg)')
      })
    })

    it('should set GPU acceleration', async () => {
      transitions.morph(element, {
        duration: 1000
      })

      await vi.waitFor(() => {
        expect(element.style.willChange).toBe('transform, opacity')
      })
    })
  })

  describe('stopTransition()', () => {
    it('should remove transition from active map', () => {
      // Start transitions
      transitions.fade(element, { duration: 1000 })

      // stopAllTransitions should clear them
      transitions.stopAllTransitions()

      expect(transitions.getActiveTransitionCount()).toBe(0)
    })
  })

  describe('stopAllTransitions()', () => {
    it('should clear all active transitions', () => {
      // Start multiple transitions
      transitions.fade(element, { duration: 1000 })
      transitions.slide(element, { duration: 1000 })
      transitions.scale(element, { duration: 1000 })

      transitions.stopAllTransitions()

      expect(transitions.getActiveTransitionCount()).toBe(0)
    })
  })

  describe('getActiveTransitionCount()', () => {
    it('should reflect active transitions', () => {
      expect(transitions.getActiveTransitionCount()).toBe(0)

      transitions.fade(element, { duration: 1000 })
      transitions.slide(element, { duration: 1000 })

      transitions.stopAllTransitions()
      expect(transitions.getActiveTransitionCount()).toBe(0)
    })
  })

  describe('destroy()', () => {
    it('should stop all transitions', () => {
      transitions.fade(element, { duration: 1000 })
      transitions.slide(element, { duration: 1000 })

      transitions.destroy()

      expect(transitions.getActiveTransitionCount()).toBe(0)
    })
  })

  describe('All transition methods call callbacks', () => {
    it('fade should call callbacks', async () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()

      const promise = transitions.fade(element, {
        duration: 10, // Short duration for test
        onTransitionStart: onStart,
        onTransitionComplete: onComplete
      })

      await vi.waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })

      await promise

      expect(onComplete).toHaveBeenCalled()
    })

    it('slide should call callbacks', async () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()

      const promise = transitions.slide(element, {
        duration: 10,
        onTransitionStart: onStart,
        onTransitionComplete: onComplete
      })

      await vi.waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })

      await promise

      expect(onComplete).toHaveBeenCalled()
    })

    it('scale should call callbacks', async () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()

      const promise = transitions.scale(element, {
        duration: 10,
        onTransitionStart: onStart,
        onTransitionComplete: onComplete
      })

      await vi.waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })

      await promise

      expect(onComplete).toHaveBeenCalled()
    })

    it('flip should call callbacks', async () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()

      const promise = transitions.flip(element, {
        duration: 10,
        onTransitionStart: onStart,
        onTransitionComplete: onComplete
      })

      await vi.waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })

      await promise

      expect(onComplete).toHaveBeenCalled()
    })

    it('cube should call callbacks', async () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()

      const promise = transitions.cube(element, {
        duration: 10,
        onTransitionStart: onStart,
        onTransitionComplete: onComplete
      })

      await vi.waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })

      await promise

      expect(onComplete).toHaveBeenCalled()
    })

    it('morph should call callbacks', async () => {
      const onStart = vi.fn()
      const onComplete = vi.fn()

      const promise = transitions.morph(element, {
        duration: 10,
        onTransitionStart: onStart,
        onTransitionComplete: onComplete
      })

      await vi.waitFor(() => {
        expect(onStart).toHaveBeenCalled()
      })

      await promise

      expect(onComplete).toHaveBeenCalled()
    })
  })
})
