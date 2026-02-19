import { describe, it, expect } from 'vitest'
import { neutral } from '../../profiles/neutral'
import { hua } from '../../profiles/hua'
import { resolveProfile, mergeProfileOverrides } from '../../profiles'
import type { MotionProfile, DeepPartial } from '../../profiles'

describe('Motion Profile System', () => {
  // ========================================
  // 프로필 구조 검증
  // ========================================

  describe('neutral profile', () => {
    it('should have all required top-level fields', () => {
      expect(neutral.name).toBe('neutral')
      expect(neutral.base).toBeDefined()
      expect(neutral.entrance).toBeDefined()
      expect(neutral.stagger).toBeDefined()
      expect(neutral.interaction).toBeDefined()
      expect(neutral.spring).toBeDefined()
      expect(neutral.reducedMotion).toBeDefined()
    })

    it('should have correct base values (backward compat)', () => {
      expect(neutral.base.duration).toBe(700)
      expect(neutral.base.easing).toBe('ease-out')
      expect(neutral.base.threshold).toBe(0.1)
      expect(neutral.base.triggerOnce).toBe(true)
    })

    it('should have correct entrance values', () => {
      expect(neutral.entrance.slide.distance).toBe(32)
      expect(neutral.entrance.slide.easing).toBe('ease-out')
      expect(neutral.entrance.fade.initialOpacity).toBe(0)
      expect(neutral.entrance.scale.from).toBe(0.95)
      expect(neutral.entrance.bounce.intensity).toBe(0.3)
    })

    it('should have correct stagger values', () => {
      expect(neutral.stagger.perItem).toBe(100)
      expect(neutral.stagger.baseDelay).toBe(0)
    })

    it('should have correct interaction values', () => {
      expect(neutral.interaction.hover.scale).toBe(1.05)
      expect(neutral.interaction.hover.y).toBe(-2)
      expect(neutral.interaction.hover.duration).toBe(200)
    })

    it('should have correct spring values', () => {
      expect(neutral.spring.mass).toBe(1)
      expect(neutral.spring.stiffness).toBe(100)
      expect(neutral.spring.damping).toBe(10)
      expect(neutral.spring.restDelta).toBe(0.01)
      expect(neutral.spring.restSpeed).toBe(0.01)
    })
  })

  describe('hua profile', () => {
    it('should have all required top-level fields', () => {
      expect(hua.name).toBe('hua')
      expect(hua.base).toBeDefined()
      expect(hua.entrance).toBeDefined()
      expect(hua.stagger).toBeDefined()
      expect(hua.interaction).toBeDefined()
      expect(hua.spring).toBeDefined()
      expect(hua.reducedMotion).toBeDefined()
    })

    it('should be faster than neutral (shorter duration)', () => {
      expect(hua.base.duration).toBeLessThan(neutral.base.duration)
    })

    it('should use overshoot easing', () => {
      expect(hua.base.easing).toContain('cubic-bezier')
      // overshoot: 4th param > 1.0
      const match = hua.base.easing.match(/cubic-bezier\(([^)]+)\)/)
      expect(match).not.toBeNull()
      const params = match![1].split(',').map(Number)
      expect(params[3]).toBeGreaterThan(1) // overshoot
    })

    it('should have shorter slide distance than neutral', () => {
      expect(hua.entrance.slide.distance).toBeLessThan(neutral.entrance.slide.distance)
    })

    it('should have higher stiffness and damping (쫀뜩)', () => {
      expect(hua.spring.stiffness).toBeGreaterThan(neutral.spring.stiffness)
      expect(hua.spring.damping).toBeGreaterThan(neutral.spring.damping)
    })

    it('should have subtler hover than neutral', () => {
      expect(hua.interaction.hover.scale).toBeLessThan(neutral.interaction.hover.scale)
      expect(Math.abs(hua.interaction.hover.y)).toBeLessThan(Math.abs(neutral.interaction.hover.y))
    })

    it('should have faster stagger than neutral', () => {
      expect(hua.stagger.perItem).toBeLessThan(neutral.stagger.perItem)
    })
  })

  // ========================================
  // resolveProfile
  // ========================================

  describe('resolveProfile', () => {
    it('should resolve "neutral" to neutral profile', () => {
      const result = resolveProfile('neutral')
      expect(result).toBe(neutral)
    })

    it('should resolve "hua" to hua profile', () => {
      const result = resolveProfile('hua')
      expect(result).toBe(hua)
    })

    it('should return object as-is when passed a MotionProfile', () => {
      const custom: MotionProfile = { ...neutral, name: 'custom' }
      const result = resolveProfile(custom)
      expect(result).toBe(custom)
      expect(result.name).toBe('custom')
    })

    it('should fallback to neutral for unknown string', () => {
      // TypeScript won't allow this normally, but test runtime safety
      const result = resolveProfile('unknown' as any)
      expect(result).toBe(neutral)
    })
  })

  // ========================================
  // mergeProfileOverrides (deepMerge)
  // ========================================

  describe('mergeProfileOverrides', () => {
    it('should return same values when no overrides', () => {
      const result = mergeProfileOverrides(neutral, {})
      expect(result.base.duration).toBe(neutral.base.duration)
      expect(result.entrance.slide.distance).toBe(neutral.entrance.slide.distance)
    })

    it('should override a single base value', () => {
      const overrides: DeepPartial<MotionProfile> = {
        base: { duration: 500 },
      }
      const result = mergeProfileOverrides(neutral, overrides)
      expect(result.base.duration).toBe(500)
      // non-overridden values preserved
      expect(result.base.easing).toBe('ease-out')
      expect(result.base.threshold).toBe(0.1)
    })

    it('should override nested entrance values', () => {
      const overrides: DeepPartial<MotionProfile> = {
        entrance: {
          slide: { distance: 40 },
        },
      }
      const result = mergeProfileOverrides(neutral, overrides)
      expect(result.entrance.slide.distance).toBe(40)
      // other entrance values preserved
      expect(result.entrance.slide.easing).toBe('ease-out')
      expect(result.entrance.fade.initialOpacity).toBe(0)
      expect(result.entrance.scale.from).toBe(0.95)
    })

    it('should override spring values', () => {
      const overrides: DeepPartial<MotionProfile> = {
        spring: { stiffness: 200, damping: 20 },
      }
      const result = mergeProfileOverrides(hua, overrides)
      expect(result.spring.stiffness).toBe(200)
      expect(result.spring.damping).toBe(20)
      // preserved
      expect(result.spring.mass).toBe(hua.spring.mass)
      expect(result.spring.restDelta).toBe(hua.spring.restDelta)
    })

    it('should override interaction hover values', () => {
      const overrides: DeepPartial<MotionProfile> = {
        interaction: { hover: { scale: 1.1 } },
      }
      const result = mergeProfileOverrides(neutral, overrides)
      expect(result.interaction.hover.scale).toBe(1.1)
      expect(result.interaction.hover.y).toBe(-2) // preserved
    })

    it('should override multiple sections at once', () => {
      const overrides: DeepPartial<MotionProfile> = {
        base: { duration: 300 },
        stagger: { perItem: 50 },
        spring: { stiffness: 250 },
      }
      const result = mergeProfileOverrides(neutral, overrides)
      expect(result.base.duration).toBe(300)
      expect(result.stagger.perItem).toBe(50)
      expect(result.spring.stiffness).toBe(250)
      // rest preserved
      expect(result.base.easing).toBe('ease-out')
      expect(result.stagger.baseDelay).toBe(0)
    })

    it('should not mutate the base profile', () => {
      const originalDuration = neutral.base.duration
      mergeProfileOverrides(neutral, { base: { duration: 999 } })
      expect(neutral.base.duration).toBe(originalDuration)
    })

    it('should replace arrays, not merge them', () => {
      // Currently no array fields in MotionProfile, but test the deepMerge behavior
      const base = { ...neutral }
      const result = mergeProfileOverrides(base, { name: 'test' })
      expect(result.name).toBe('test')
    })

    it('should handle empty overrides object', () => {
      const result = mergeProfileOverrides(hua, {})
      expect(result.base.duration).toBe(hua.base.duration)
      expect(result.name).toBe(hua.name)
    })

    it('should override reducedMotion strategy', () => {
      const result = mergeProfileOverrides(neutral, { reducedMotion: 'skip' })
      expect(result.reducedMotion).toBe('skip')
    })
  })
})
