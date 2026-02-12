// ========================================
// HUA Motion Core - Easing Functions Tests
// ========================================

import { describe, it, expect } from 'vitest'
import {
  type EasingFunction,
  linear,
  easeIn,
  easeOut,
  easeInOut,
  easeInQuad,
  easeOutQuad,
  easeInOutQuad,
  easeInCubic,
  easeOutCubic,
  easeInOutCubic,
  easeInQuart,
  easeOutQuart,
  easeInOutQuart,
  easeInQuint,
  easeOutQuint,
  easeInOutQuint,
  easeInSine,
  easeOutSine,
  easeInOutSine,
  easeInExpo,
  easeOutExpo,
  easeInOutExpo,
  easeInCirc,
  easeOutCirc,
  easeInOutCirc,
  easeInBounce,
  easeOutBounce,
  easeInOutBounce,
  easeInBack,
  easeOutBack,
  easeInOutBack,
  easeInElastic,
  easeOutElastic,
  easeInOutElastic,
  pulse,
  pulseSmooth,
  skeletonWave,
  blink,
  easing,
  isValidEasing,
  getEasing,
  applyEasing,
  safeApplyEasing,
  getAvailableEasings,
  isEasingFunction,
  easingPresets,
  getPresetEasing
} from '../../utils/easing'

// ========================================
// Individual Easing Functions
// ========================================

describe('easing functions - boundary values', () => {
  it('linear: t=0 should return 0, t=1 should return 1', () => {
    expect(linear(0)).toBe(0)
    expect(linear(1)).toBe(1)
    expect(linear(0.5)).toBe(0.5)
  })

  it('easeIn: t=0 should return 0, t=1 should return 1', () => {
    expect(easeIn(0)).toBe(0)
    expect(easeIn(1)).toBe(1)
    expect(easeIn(0.5)).toBeGreaterThan(0)
    expect(easeIn(0.5)).toBeLessThan(1)
  })

  it('easeOut: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOut(0)).toBe(0)
    expect(easeOut(1)).toBe(1)
    expect(easeOut(0.5)).toBeGreaterThan(0)
    expect(easeOut(0.5)).toBeLessThan(1)
  })

  it('easeInOut: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOut(0)).toBe(0)
    expect(easeInOut(1)).toBe(1)
    expect(easeInOut(0.5)).toBeGreaterThan(0)
    expect(easeInOut(0.5)).toBeLessThan(1)
  })

  it('easeInQuad: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInQuad(0)).toBe(0)
    expect(easeInQuad(1)).toBe(1)
    expect(easeInQuad(0.5)).toBeCloseTo(0.25)
  })

  it('easeOutQuad: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutQuad(0)).toBe(0)
    expect(easeOutQuad(1)).toBe(1)
    expect(easeOutQuad(0.5)).toBeCloseTo(0.75)
  })

  it('easeInOutQuad: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutQuad(0)).toBe(0)
    expect(easeInOutQuad(1)).toBe(1)
    expect(easeInOutQuad(0.5)).toBeGreaterThan(0)
    expect(easeInOutQuad(0.5)).toBeLessThan(1)
  })

  it('easeInCubic: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInCubic(0)).toBe(0)
    expect(easeInCubic(1)).toBe(1)
    expect(easeInCubic(0.5)).toBeCloseTo(0.125)
  })

  it('easeOutCubic: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(0.5)).toBeCloseTo(0.875)
  })

  it('easeInOutCubic: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutCubic(0)).toBe(0)
    expect(easeInOutCubic(1)).toBe(1)
    expect(easeInOutCubic(0.5)).toBeGreaterThan(0)
    expect(easeInOutCubic(0.5)).toBeLessThan(1)
  })

  it('easeInQuart: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInQuart(0)).toBe(0)
    expect(easeInQuart(1)).toBe(1)
    expect(easeInQuart(0.5)).toBeCloseTo(0.0625)
  })

  it('easeOutQuart: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutQuart(0)).toBe(0)
    expect(easeOutQuart(1)).toBe(1)
    expect(easeOutQuart(0.5)).toBeCloseTo(0.9375)
  })

  it('easeInOutQuart: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutQuart(0)).toBe(0)
    expect(easeInOutQuart(1)).toBe(1)
    expect(easeInOutQuart(0.5)).toBeGreaterThan(0)
    expect(easeInOutQuart(0.5)).toBeLessThan(1)
  })

  it('easeInQuint: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInQuint(0)).toBe(0)
    expect(easeInQuint(1)).toBe(1)
    expect(easeInQuint(0.5)).toBeCloseTo(0.03125)
  })

  it('easeOutQuint: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutQuint(0)).toBe(0)
    expect(easeOutQuint(1)).toBe(1)
    expect(easeOutQuint(0.5)).toBeCloseTo(0.96875)
  })

  it('easeInOutQuint: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutQuint(0)).toBe(0)
    expect(easeInOutQuint(1)).toBe(1)
    expect(easeInOutQuint(0.5)).toBeGreaterThan(0)
    expect(easeInOutQuint(0.5)).toBeLessThan(1)
  })

  it('easeInSine: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInSine(0)).toBeCloseTo(0)
    expect(easeInSine(1)).toBeCloseTo(1)
    expect(easeInSine(0.5)).toBeGreaterThan(0)
    expect(easeInSine(0.5)).toBeLessThan(1)
  })

  it('easeOutSine: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutSine(0)).toBeCloseTo(0)
    expect(easeOutSine(1)).toBeCloseTo(1)
    expect(easeOutSine(0.5)).toBeGreaterThan(0)
    expect(easeOutSine(0.5)).toBeLessThan(1)
  })

  it('easeInOutSine: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutSine(0)).toBeCloseTo(0)
    expect(easeInOutSine(1)).toBeCloseTo(1)
    expect(easeInOutSine(0.5)).toBeGreaterThan(0)
    expect(easeInOutSine(0.5)).toBeLessThan(1)
  })

  it('easeInExpo: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInExpo(0)).toBe(0)
    expect(easeInExpo(1)).toBe(1)
    expect(easeInExpo(0.5)).toBeGreaterThan(0)
    expect(easeInExpo(0.5)).toBeLessThan(1)
  })

  it('easeOutExpo: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutExpo(0)).toBeCloseTo(0)
    expect(easeOutExpo(1)).toBe(1)
    expect(easeOutExpo(0.5)).toBeGreaterThan(0)
    expect(easeOutExpo(0.5)).toBeLessThan(1)
  })

  it('easeInOutExpo: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutExpo(0)).toBe(0)
    expect(easeInOutExpo(1)).toBe(1)
    expect(easeInOutExpo(0.5)).toBeGreaterThan(0)
    expect(easeInOutExpo(0.5)).toBeLessThan(1)
  })

  it('easeInCirc: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInCirc(0)).toBe(0)
    expect(easeInCirc(1)).toBeCloseTo(1)
    expect(easeInCirc(0.5)).toBeGreaterThan(0)
    expect(easeInCirc(0.5)).toBeLessThan(1)
  })

  it('easeOutCirc: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutCirc(0)).toBeCloseTo(0)
    expect(easeOutCirc(1)).toBeCloseTo(1)
    expect(easeOutCirc(0.5)).toBeGreaterThan(0)
    expect(easeOutCirc(0.5)).toBeLessThan(1)
  })

  it('easeInOutCirc: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutCirc(0)).toBeCloseTo(0)
    expect(easeInOutCirc(1)).toBeCloseTo(1)
    expect(easeInOutCirc(0.5)).toBeGreaterThan(0)
    expect(easeInOutCirc(0.5)).toBeLessThan(1)
  })

  it('easeInBounce: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInBounce(0)).toBeCloseTo(0)
    expect(easeInBounce(1)).toBeCloseTo(1)
    expect(easeInBounce(0.5)).toBeGreaterThan(0)
    expect(easeInBounce(0.5)).toBeLessThan(1)
  })

  it('easeOutBounce: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutBounce(0)).toBeCloseTo(0)
    expect(easeOutBounce(1)).toBeCloseTo(1)
    expect(easeOutBounce(0.5)).toBeGreaterThan(0)
    expect(easeOutBounce(0.5)).toBeLessThan(1)
  })

  it('easeInOutBounce: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutBounce(0)).toBeCloseTo(0)
    expect(easeInOutBounce(1)).toBeCloseTo(1)
    expect(easeInOutBounce(0.5)).toBeGreaterThan(0)
    expect(easeInOutBounce(0.5)).toBeLessThan(1)
  })

  it('easeInBack: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInBack(0)).toBe(0)
    expect(easeInBack(1)).toBeCloseTo(1)
    expect(easeInBack(0.5)).not.toBe(NaN)
  })

  it('easeOutBack: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutBack(0)).toBeCloseTo(0)
    expect(easeOutBack(1)).toBeCloseTo(1)
    expect(easeOutBack(0.5)).not.toBe(NaN)
  })

  it('easeInOutBack: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutBack(0)).toBeCloseTo(0)
    expect(easeInOutBack(1)).toBeCloseTo(1)
    expect(easeInOutBack(0.5)).not.toBe(NaN)
  })

  it('easeInElastic: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInElastic(0)).toBe(0)
    expect(easeInElastic(1)).toBe(1)
    expect(easeInElastic(0.5)).not.toBe(NaN)
  })

  it('easeOutElastic: t=0 should return 0, t=1 should return 1', () => {
    expect(easeOutElastic(0)).toBe(0)
    expect(easeOutElastic(1)).toBe(1)
    expect(easeOutElastic(0.5)).not.toBe(NaN)
  })

  it('easeInOutElastic: t=0 should return 0, t=1 should return 1', () => {
    expect(easeInOutElastic(0)).toBe(0)
    expect(easeInOutElastic(1)).toBe(1)
    expect(easeInOutElastic(0.5)).not.toBe(NaN)
  })
})

describe('easing functions - special effects', () => {
  it('pulse: should return values between 0 and 1', () => {
    const result0 = pulse(0)
    const result05 = pulse(0.5)
    const result1 = pulse(1)
    expect(result0).toBeGreaterThanOrEqual(0)
    expect(result0).toBeLessThanOrEqual(1)
    expect(result05).toBeGreaterThanOrEqual(0)
    expect(result05).toBeLessThanOrEqual(1)
    expect(result1).toBeGreaterThanOrEqual(0)
    expect(result1).toBeLessThanOrEqual(1)
  })

  it('pulseSmooth: should return values between 0.4 and 1', () => {
    const result0 = pulseSmooth(0)
    const result05 = pulseSmooth(0.5)
    const result1 = pulseSmooth(1)
    expect(result0).toBeGreaterThanOrEqual(0.4)
    expect(result0).toBeLessThanOrEqual(1)
    expect(result05).toBeGreaterThanOrEqual(0.4)
    expect(result05).toBeLessThanOrEqual(1)
    expect(result1).toBeGreaterThanOrEqual(0.4)
    expect(result1).toBeLessThanOrEqual(1)
  })

  it('skeletonWave: should return values between 0 and 1', () => {
    const result0 = skeletonWave(0)
    const result05 = skeletonWave(0.5)
    const result1 = skeletonWave(1)
    expect(result0).toBeGreaterThanOrEqual(0)
    expect(result0).toBeLessThanOrEqual(1)
    expect(result05).toBeGreaterThanOrEqual(0)
    expect(result05).toBeLessThanOrEqual(1)
    expect(result1).toBeGreaterThanOrEqual(0)
    expect(result1).toBeLessThanOrEqual(1)
  })

  it('blink: t < 0.5 should return 1, t >= 0.5 should return 0', () => {
    expect(blink(0)).toBe(1)
    expect(blink(0.3)).toBe(1)
    expect(blink(0.5)).toBe(0)
    expect(blink(0.7)).toBe(0)
    expect(blink(1)).toBe(0)
  })
})

// ========================================
// Easing Object
// ========================================

describe('easing object', () => {
  it('should contain all 38 easing functions', () => {
    const keys = Object.keys(easing)
    expect(keys).toHaveLength(38)
  })

  it('should have linear function', () => {
    expect(easing.linear).toBeDefined()
    expect(easing.linear(0.5)).toBe(0.5)
  })

  it('should have easeIn function', () => {
    expect(easing.easeIn).toBeDefined()
    expect(easing.easeIn(0)).toBe(0)
    expect(easing.easeIn(1)).toBe(1)
  })

  it('should have all quad functions', () => {
    expect(easing.easeInQuad).toBeDefined()
    expect(easing.easeOutQuad).toBeDefined()
    expect(easing.easeInOutQuad).toBeDefined()
  })

  it('should have all special effect functions', () => {
    expect(easing.pulse).toBeDefined()
    expect(easing.pulseSmooth).toBeDefined()
    expect(easing.skeletonWave).toBeDefined()
    expect(easing.blink).toBeDefined()
  })
})

// ========================================
// Utility Functions
// ========================================

describe('isValidEasing', () => {
  it('should return true for valid easing names', () => {
    expect(isValidEasing('linear')).toBe(true)
    expect(isValidEasing('easeIn')).toBe(true)
    expect(isValidEasing('easeOut')).toBe(true)
    expect(isValidEasing('easeInOutBounce')).toBe(true)
    expect(isValidEasing('pulse')).toBe(true)
  })

  it('should return false for invalid easing names', () => {
    expect(isValidEasing('nonexistent')).toBe(false)
    expect(isValidEasing('bounce')).toBe(false) // 'bounce' is an alias, not in easing object
    expect(isValidEasing('invalid')).toBe(false)
    expect(isValidEasing('')).toBe(false)
  })
})

describe('getEasing', () => {
  it('should return the correct function for valid string names', () => {
    const fn = getEasing('easeIn')
    expect(fn).toBe(easeIn)
    expect(fn(0.5)).toBe(easeIn(0.5))
  })

  it('should return the function if a function is passed', () => {
    const customFn: EasingFunction = (t) => t * t * t
    const result = getEasing(customFn)
    expect(result).toBe(customFn)
    expect(result(0.5)).toBe(0.125)
  })

  it('should map "bounce" to easeOutBounce', () => {
    const fn = getEasing('bounce')
    expect(fn).toBe(easeOutBounce)
  })

  it('should return easeOut for unknown string', () => {
    const fn = getEasing('unknown')
    expect(fn).toBe(easeOut)
  })

  it('should return easeOut for non-string, non-function input', () => {
    const fn1 = getEasing(123 as any)
    const fn2 = getEasing(null as any)
    const fn3 = getEasing({} as any)
    expect(fn1).toBe(easeOut)
    expect(fn2).toBe(easeOut)
    expect(fn3).toBe(easeOut)
  })
})

describe('applyEasing', () => {
  it('should apply the easing function by name', () => {
    const result = applyEasing(0.5, 'easeIn')
    expect(result).toBe(easeIn(0.5))
  })

  it('should apply a custom easing function', () => {
    const customFn: EasingFunction = (t) => t * t * t
    const result = applyEasing(0.5, customFn)
    expect(result).toBe(0.125)
  })

  it('should handle linear easing', () => {
    const result = applyEasing(0.5, 'linear')
    expect(result).toBe(0.5)
  })
})

describe('safeApplyEasing', () => {
  it('should apply the easing function by name', () => {
    const result = safeApplyEasing(0.5, 'easeIn')
    expect(result).toBe(easeIn(0.5))
  })

  it('should return easeOut result for null input without throwing', () => {
    const result = safeApplyEasing(0.5, null)
    expect(result).toBe(easeOut(0.5))
  })

  it('should return easeOut result for invalid input without throwing', () => {
    const result = safeApplyEasing(0.5, 'nonexistent')
    expect(result).toBe(easeOut(0.5))
  })

  it('should handle numeric input gracefully', () => {
    const result = safeApplyEasing(0.5, 123 as any)
    expect(result).toBe(easeOut(0.5))
  })
})

describe('getAvailableEasings', () => {
  it('should return an array of all easing names', () => {
    const easings = getAvailableEasings()
    expect(Array.isArray(easings)).toBe(true)
    expect(easings.length).toBe(38)
  })

  it('should include common easing names', () => {
    const easings = getAvailableEasings()
    expect(easings).toContain('linear')
    expect(easings).toContain('easeIn')
    expect(easings).toContain('easeOut')
    expect(easings).toContain('easeInOut')
  })

  it('should include special effects', () => {
    const easings = getAvailableEasings()
    expect(easings).toContain('pulse')
    expect(easings).toContain('pulseSmooth')
    expect(easings).toContain('skeletonWave')
    expect(easings).toContain('blink')
  })
})

describe('isEasingFunction', () => {
  it('should return true for functions', () => {
    const fn: EasingFunction = (t) => t
    expect(isEasingFunction(fn)).toBe(true)
    expect(isEasingFunction(easeIn)).toBe(true)
    expect(isEasingFunction(() => 0)).toBe(true)
  })

  it('should return false for non-functions', () => {
    expect(isEasingFunction('string')).toBe(false)
    expect(isEasingFunction(123)).toBe(false)
    expect(isEasingFunction(null)).toBe(false)
    expect(isEasingFunction(undefined)).toBe(false)
    expect(isEasingFunction({})).toBe(false)
    expect(isEasingFunction([])).toBe(false)
  })
})

// ========================================
// Easing Presets
// ========================================

describe('easingPresets', () => {
  it('should have correct mapping for default', () => {
    expect(easingPresets.default).toBe('easeOut')
  })

  it('should have correct mapping for smooth', () => {
    expect(easingPresets.smooth).toBe('easeInOutCubic')
  })

  it('should have correct mapping for fast', () => {
    expect(easingPresets.fast).toBe('easeOutQuad')
  })

  it('should have correct mapping for slow', () => {
    expect(easingPresets.slow).toBe('easeInOutSine')
  })

  it('should have correct mapping for bouncy', () => {
    expect(easingPresets.bouncy).toBe('easeOutBounce')
  })

  it('should have correct mapping for elastic', () => {
    expect(easingPresets.elastic).toBe('easeOutElastic')
  })

  it('should have correct mapping for fade', () => {
    expect(easingPresets.fade).toBe('easeInOut')
  })

  it('should have correct mapping for scale', () => {
    expect(easingPresets.scale).toBe('easeOutBack')
  })

  it('should have 8 preset keys', () => {
    const keys = Object.keys(easingPresets)
    expect(keys).toHaveLength(8)
  })
})

describe('getPresetEasing', () => {
  it('should return easeOut function for "default" preset', () => {
    const fn = getPresetEasing('default')
    expect(fn).toBe(easeOut)
  })

  it('should return easeInOutCubic function for "smooth" preset', () => {
    const fn = getPresetEasing('smooth')
    expect(fn).toBe(easeInOutCubic)
  })

  it('should return easeOutQuad function for "fast" preset', () => {
    const fn = getPresetEasing('fast')
    expect(fn).toBe(easeOutQuad)
  })

  it('should return easeInOutSine function for "slow" preset', () => {
    const fn = getPresetEasing('slow')
    expect(fn).toBe(easeInOutSine)
  })

  it('should return easeOutBounce function for "bouncy" preset', () => {
    const fn = getPresetEasing('bouncy')
    expect(fn).toBe(easeOutBounce)
  })

  it('should return easeOutElastic function for "elastic" preset', () => {
    const fn = getPresetEasing('elastic')
    expect(fn).toBe(easeOutElastic)
  })

  it('should return easeInOut function for "fade" preset', () => {
    const fn = getPresetEasing('fade')
    expect(fn).toBe(easeInOut)
  })

  it('should return easeOutBack function for "scale" preset', () => {
    const fn = getPresetEasing('scale')
    expect(fn).toBe(easeOutBack)
  })

  it('should return working easing functions', () => {
    const fn = getPresetEasing('default')
    expect(fn(0)).toBe(0)
    expect(fn(1)).toBe(1)
    expect(fn(0.5)).toBeGreaterThan(0)
    expect(fn(0.5)).toBeLessThan(1)
  })
})
