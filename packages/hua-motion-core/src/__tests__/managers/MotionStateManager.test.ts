/**
 * MotionStateManager 테스트
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { MotionStateManager } from '../../managers/MotionStateManager'
import { MotionElement, MotionState } from '../../types'

describe('MotionStateManager', () => {
  let manager: MotionStateManager

  beforeEach(() => {
    // Create fresh instance for each test
    manager = new MotionStateManager()
  })

  describe('initializeElement()', () => {
    it('should create state with correct defaults', () => {
      const config: MotionElement = document.createElement('div') as MotionElement

      manager.initializeElement('test-element', config)

      const state = manager.getState('test-element')

      expect(state).toBeDefined()
      expect(state?.internalVisibility).toBe(false)
      expect(state?.triggeredVisibility).toBe(false)
      expect(state?.finalVisibility).toBe(false)
      expect(state?.opacity).toBe(0)
      expect(state?.translateY).toBe(20)
      expect(state?.scale).toBe(0.95)
      expect(state?.translateX).toBe(0)
      expect(state?.rotation).toBe(0)
      expect(state?.isHovered).toBe(false)
      expect(state?.isClicked).toBe(false)
      expect(state?.isAnimating).toBe(false)
    })
  })

  describe('getState()', () => {
    it('should return undefined for uninitialized element', () => {
      const state = manager.getState('non-existent')

      expect(state).toBeUndefined()
    })

    it('should return state for initialized element', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      const state = manager.getState('test-element')

      expect(state).toBeDefined()
    })
  })

  describe('setInternalVisibility()', () => {
    it('should update internalVisibility to true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', true)

      const state = manager.getState('test-element')
      expect(state?.internalVisibility).toBe(true)
    })

    it('should set finalVisibility to true when internalVisibility is true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', true)

      const state = manager.getState('test-element')
      expect(state?.finalVisibility).toBe(true)
    })

    it('should do nothing for non-existent element', () => {
      expect(() => {
        manager.setInternalVisibility('non-existent', true)
      }).not.toThrow()
    })
  })

  describe('setTriggeredVisibility()', () => {
    it('should update triggeredVisibility to true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setTriggeredVisibility('test-element', true)

      const state = manager.getState('test-element')
      expect(state?.triggeredVisibility).toBe(true)
    })

    it('should set finalVisibility to true when triggeredVisibility is true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setTriggeredVisibility('test-element', true)

      const state = manager.getState('test-element')
      expect(state?.finalVisibility).toBe(true)
    })

    it('should do nothing for non-existent element', () => {
      expect(() => {
        manager.setTriggeredVisibility('non-existent', true)
      }).not.toThrow()
    })
  })

  describe('finalVisibility logic', () => {
    it('should be true when both internal AND triggered are true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', true)
      manager.setTriggeredVisibility('test-element', true)

      const state = manager.getState('test-element')
      expect(state?.finalVisibility).toBe(true)
    })

    it('should be true when only internal is true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', true)
      manager.setTriggeredVisibility('test-element', false)

      const state = manager.getState('test-element')
      expect(state?.finalVisibility).toBe(true)
    })

    it('should be true when only triggered is true', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', false)
      manager.setTriggeredVisibility('test-element', true)

      const state = manager.getState('test-element')
      expect(state?.finalVisibility).toBe(true)
    })

    it('should be false when both are false', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', false)
      manager.setTriggeredVisibility('test-element', false)

      const state = manager.getState('test-element')
      expect(state?.finalVisibility).toBe(false)
    })
  })

  describe('updateMotionValues()', () => {
    it('should update partial values', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.updateMotionValues('test-element', {
        opacity: 0.5,
        translateY: 10
      })

      const state = manager.getState('test-element')
      expect(state?.opacity).toBe(0.5)
      expect(state?.translateY).toBe(10)
      // Other values should remain unchanged
      expect(state?.scale).toBe(0.95)
    })

    it('should do nothing for non-existent element', () => {
      expect(() => {
        manager.updateMotionValues('non-existent', { opacity: 1 })
      }).not.toThrow()
    })
  })

  describe('subscribe()', () => {
    it('should receive state changes', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      let receivedState: MotionState | undefined

      manager.subscribe('test-element', (state) => {
        receivedState = state
      })

      manager.setInternalVisibility('test-element', true)

      expect(receivedState).toBeDefined()
      expect(receivedState?.internalVisibility).toBe(true)
    })

    it('should return unsubscribe function that works', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      let callCount = 0

      const unsubscribe = manager.subscribe('test-element', () => {
        callCount++
      })

      manager.setInternalVisibility('test-element', true)
      expect(callCount).toBe(1)

      unsubscribe()

      manager.setInternalVisibility('test-element', false)
      // Should not be called again after unsubscribe
      expect(callCount).toBe(1)
    })

    it('should support multiple listeners for same element', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      let callCount1 = 0
      let callCount2 = 0

      manager.subscribe('test-element', () => {
        callCount1++
      })

      manager.subscribe('test-element', () => {
        callCount2++
      })

      manager.setInternalVisibility('test-element', true)

      expect(callCount1).toBe(1)
      expect(callCount2).toBe(1)
    })
  })

  describe('notifyListeners()', () => {
    it('should call all registered listeners', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      let callCount1 = 0
      let callCount2 = 0

      manager.subscribe('test-element', () => {
        callCount1++
      })

      manager.subscribe('test-element', () => {
        callCount2++
      })

      const state = manager.getState('test-element')!
      manager.notifyListeners('test-element', state)

      expect(callCount1).toBe(1)
      expect(callCount2).toBe(1)
    })

    it('should catch listener errors in development mode', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      // Set NODE_ENV to development for this test
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      manager.subscribe('test-element', () => {
        throw new Error('Test error')
      })

      const state = manager.getState('test-element')!

      expect(() => {
        manager.notifyListeners('test-element', state)
      }).not.toThrow()

      // Restore original env
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('getAllStates()', () => {
    it('should return a copy not internal map', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      const states1 = manager.getAllStates()
      const states2 = manager.getAllStates()

      expect(states1).not.toBe(states2)
      expect(states1.size).toBe(states2.size)
    })

    it('should not affect internal state when modified', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      const states = manager.getAllStates()
      states.clear()

      // Internal state should not be affected
      const internalState = manager.getState('test-element')
      expect(internalState).toBeDefined()
    })
  })

  describe('reset()', () => {
    it('should clear all states and listeners', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)
      manager.initializeElement('test-element-2', config)

      let callCount = 0
      manager.subscribe('test-element', () => {
        callCount++
      })

      manager.reset()

      expect(manager.getState('test-element')).toBeUndefined()
      expect(manager.getState('test-element-2')).toBeUndefined()
      expect(manager.getAllStates().size).toBe(0)

      // Listener should not be called after reset
      manager.initializeElement('test-element', config)
      manager.setInternalVisibility('test-element', true)
      expect(callCount).toBe(0)
    })
  })

  describe('resetElement()', () => {
    it('should remove only specified element state and listeners', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element-1', config)
      manager.initializeElement('test-element-2', config)

      manager.resetElement('test-element-1')

      expect(manager.getState('test-element-1')).toBeUndefined()
      expect(manager.getState('test-element-2')).toBeDefined()
    })

    it('should remove listeners for specified element', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      let callCount = 0
      manager.subscribe('test-element', () => {
        callCount++
      })

      manager.resetElement('test-element')

      // Re-initialize and trigger change
      manager.initializeElement('test-element', config)
      manager.setInternalVisibility('test-element', true)

      // Listener should not be called after reset
      expect(callCount).toBe(0)
    })
  })

  describe('Multiple elements', () => {
    it('should handle multiple elements independently', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('element-1', config)
      manager.initializeElement('element-2', config)

      manager.setInternalVisibility('element-1', true)
      manager.setTriggeredVisibility('element-2', true)

      const state1 = manager.getState('element-1')
      const state2 = manager.getState('element-2')

      expect(state1?.internalVisibility).toBe(true)
      expect(state1?.triggeredVisibility).toBe(false)
      expect(state1?.finalVisibility).toBe(true)

      expect(state2?.internalVisibility).toBe(false)
      expect(state2?.triggeredVisibility).toBe(true)
      expect(state2?.finalVisibility).toBe(true)
    })
  })

  describe('isAnimating state', () => {
    it('should be false when not visible', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      const state = manager.getState('test-element')
      expect(state?.isAnimating).toBe(false)
    })

    it('should be true when visible and opacity < 1', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', true)

      const state = manager.getState('test-element')
      // opacity starts at 0, so should be animating
      expect(state?.isAnimating).toBe(true)
    })

    it('should be true when visible and translateY > 0', () => {
      const config: MotionElement = document.createElement('div') as MotionElement
      manager.initializeElement('test-element', config)

      manager.setInternalVisibility('test-element', true)
      manager.updateMotionValues('test-element', { opacity: 1 })

      const state = manager.getState('test-element')
      // translateY starts at 20, so should be animating
      expect(state?.isAnimating).toBe(true)
    })
  })
})
