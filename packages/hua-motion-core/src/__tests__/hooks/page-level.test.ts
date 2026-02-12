/**
 * hua-motion-core - Page-Level Motion Hooks Tests
 * Tests for: useSimplePageMotion, useCustomPageMotion, usePageMotions, useSmartMotion, useUnifiedMotion
 */

import { renderHook, act } from '@testing-library/react'
import { useSimplePageMotion, useCustomPageMotion } from '../../hooks/useSimplePageMotion'
import { usePageMotions } from '../../hooks/usePageMotions'
import { useSmartMotion } from '../../hooks/useSmartMotion'
import { useUnifiedMotion } from '../../hooks/useUnifiedMotion'

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(private callback: IntersectionObserverCallback) {}
  observe() {}
  disconnect() {}
  unobserve() {}
}

global.IntersectionObserver = MockIntersectionObserver as any

// Mock document.querySelector
const originalQuerySelector = document.querySelector
beforeAll(() => {
  document.querySelector = vi.fn().mockReturnValue(null)
})

afterAll(() => {
  document.querySelector = originalQuerySelector
})

describe('useSimplePageMotion', () => {
  it('should return object with correct keys for home page', () => {
    const { result } = renderHook(() => useSimplePageMotion('home'))

    expect(result.current).toHaveProperty('hero')
    expect(result.current).toHaveProperty('title')
    expect(result.current).toHaveProperty('description')
    expect(result.current).toHaveProperty('cta')
    expect(result.current).toHaveProperty('feature1')
    expect(result.current).toHaveProperty('feature2')
    expect(result.current).toHaveProperty('feature3')
  })

  it('should return object with correct keys for dashboard page', () => {
    const { result } = renderHook(() => useSimplePageMotion('dashboard'))

    expect(result.current).toHaveProperty('header')
    expect(result.current).toHaveProperty('sidebar')
    expect(result.current).toHaveProperty('main')
    expect(result.current).toHaveProperty('card1')
    expect(result.current).toHaveProperty('card2')
    expect(result.current).toHaveProperty('card3')
    expect(result.current).toHaveProperty('chart')
  })

  it('should provide style property for each element', () => {
    const { result } = renderHook(() => useSimplePageMotion('home'))

    expect(result.current.hero).toHaveProperty('style')
    expect(result.current.title).toHaveProperty('style')
    expect(typeof result.current.hero.style).toBe('object')
  })

  it('should have isVisible false initially for all elements', () => {
    const { result } = renderHook(() => useSimplePageMotion('home'))

    expect(result.current.hero.isVisible).toBe(false)
    expect(result.current.title.isVisible).toBe(false)
    expect(result.current.description.isVisible).toBe(false)
  })

  it('should provide ref property for each element', () => {
    const { result } = renderHook(() => useSimplePageMotion('home'))

    expect(result.current.hero).toHaveProperty('ref')
    expect(result.current.title).toHaveProperty('ref')
    expect(typeof result.current.hero.ref).toBe('object')
  })

  it('should return correct structure for product page', () => {
    const { result } = renderHook(() => useSimplePageMotion('product'))

    expect(result.current).toBeDefined()
    expect(Object.keys(result.current).length).toBeGreaterThan(0)
  })

  it('should return correct structure for blog page', () => {
    const { result } = renderHook(() => useSimplePageMotion('blog'))

    expect(result.current).toBeDefined()
    expect(Object.keys(result.current).length).toBeGreaterThan(0)
  })

  it('should have correct element properties', () => {
    const { result } = renderHook(() => useSimplePageMotion('home'))

    const element = result.current.hero
    expect(element).toHaveProperty('ref')
    expect(element).toHaveProperty('style')
    expect(element).toHaveProperty('isVisible')
    expect(element).toHaveProperty('isHovered')
    expect(element).toHaveProperty('isClicked')
  })
})

describe('useCustomPageMotion', () => {
  it('should work with custom config', () => {
    const customConfig = {
      hero: { type: 'hero' as const },
      title: { type: 'title' as const }
    }

    const { result } = renderHook(() => useCustomPageMotion(customConfig))

    expect(result.current).toHaveProperty('hero')
    expect(result.current).toHaveProperty('title')
  })

  it('should return correct keys matching input config', () => {
    const customConfig = {
      customElement1: { type: 'text' as const },
      customElement2: { type: 'button' as const }
    }

    const { result } = renderHook(() => useCustomPageMotion(customConfig))

    expect(result.current).toHaveProperty('customElement1')
    expect(result.current).toHaveProperty('customElement2')
  })

  it('should provide style for custom elements', () => {
    const customConfig = {
      myElement: { type: 'card' as const }
    }

    const { result } = renderHook(() => useCustomPageMotion(customConfig))

    expect(result.current.myElement).toHaveProperty('style')
    expect(result.current.myElement.style).toHaveProperty('opacity')
  })

  it('should start with isVisible false', () => {
    const customConfig = {
      myElement: { type: 'card' as const }
    }

    const { result } = renderHook(() => useCustomPageMotion(customConfig))

    expect(result.current.myElement.isVisible).toBe(false)
  })
})

describe('usePageMotions', () => {
  it('should return object with correct keys', () => {
    const config = {
      hero: { type: 'hero' as const },
      title: { type: 'title' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current).toHaveProperty('hero')
    expect(result.current).toHaveProperty('title')
  })

  it('should have reset function', () => {
    const config = {
      hero: { type: 'hero' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current).toHaveProperty('reset')
    expect(typeof result.current.reset).toBe('function')
  })

  it('should start with isVisible false for all elements', () => {
    const config = {
      hero: { type: 'hero' as const },
      title: { type: 'title' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current.hero.isVisible).toBe(false)
    expect(result.current.title.isVisible).toBe(false)
  })

  it('should have style with opacity and transform for each element', () => {
    const config = {
      hero: { type: 'hero' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current.hero.style).toHaveProperty('opacity')
    expect(result.current.hero.style).toHaveProperty('transform')
  })

  it('should allow reset to be called without error', () => {
    const config = {
      hero: { type: 'hero' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(() => {
      act(() => {
        result.current.reset()
      })
    }).not.toThrow()
  })

  it('should accept config with different element types', () => {
    const config = {
      hero: { type: 'hero' as const },
      button: { type: 'button' as const, hover: true },
      text: { type: 'text' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current.hero).toBeDefined()
    expect(result.current.button).toBeDefined()
    expect(result.current.text).toBeDefined()
  })

  it('should provide ref for each element', () => {
    const config = {
      hero: { type: 'hero' as const }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current.hero).toHaveProperty('ref')
  })

  it('should handle hover config', () => {
    const config = {
      button: { type: 'button' as const, hover: true }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current.button.isHovered).toBe(false)
  })

  it('should handle click config', () => {
    const config = {
      button: { type: 'button' as const, click: true }
    }

    const { result } = renderHook(() => usePageMotions(config))

    expect(result.current.button.isClicked).toBe(false)
  })

  it('should cleanup on unmount', () => {
    const config = {
      hero: { type: 'hero' as const }
    }

    const { unmount } = renderHook(() => usePageMotions(config))

    expect(() => unmount()).not.toThrow()
  })
})

describe('useSmartMotion', () => {
  it('should return initial state with default type', () => {
    const { result } = renderHook(() => useSmartMotion())

    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('style')
    expect(result.current).toHaveProperty('isVisible')
    expect(result.current).toHaveProperty('isHovered')
    expect(result.current).toHaveProperty('isClicked')
  })

  it('should use hero preset when type is hero', () => {
    const { result } = renderHook(() => useSmartMotion({ type: 'hero' }))

    expect(result.current.style).toBeDefined()
    expect(result.current.isVisible).toBe(false)
  })

  it('should use button preset with hover and click', () => {
    const { result } = renderHook(() => useSmartMotion({ type: 'button' }))

    expect(result.current.isHovered).toBe(false)
    expect(result.current.isClicked).toBe(false)
  })

  it('should be immediately visible when threshold is 0', () => {
    const { result } = renderHook(() =>
      useSmartMotion({ threshold: 0 })
    )

    expect(result.current.isVisible).toBe(true)
    expect(result.current.style.opacity).toBe(1)
  })

  it('should have correct transform structure in style', () => {
    const { result } = renderHook(() => useSmartMotion())

    expect(result.current.style).toHaveProperty('transform')
    expect(typeof result.current.style.transform).toBe('string')
  })

  it('should start with isHovered false', () => {
    const { result } = renderHook(() => useSmartMotion({ hover: true }))

    expect(result.current.isHovered).toBe(false)
  })

  it('should start with isClicked false', () => {
    const { result } = renderHook(() => useSmartMotion({ click: true }))

    expect(result.current.isClicked).toBe(false)
  })

  it('should provide ref', () => {
    const { result } = renderHook(() => useSmartMotion())

    expect(result.current.ref).toBeDefined()
    expect(typeof result.current.ref).toBe('object')
  })

  it('should accept custom delay', () => {
    const { result } = renderHook(() =>
      useSmartMotion({ delay: 500 })
    )

    expect(result.current).toBeDefined()
  })

  it('should accept custom duration', () => {
    const { result } = renderHook(() =>
      useSmartMotion({ duration: 1000 })
    )

    expect(result.current.style).toHaveProperty('transition')
    expect(result.current.style.transition).toContain('1000ms')
  })
})

describe('useUnifiedMotion', () => {
  it('should have correct initial style for fadeIn type', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn' })
    )

    expect(result.current.style.opacity).toBe(0)
    expect(result.current.style.transform).toBe('none')
  })

  it('should have correct initial style for slideUp type', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'slideUp' })
    )

    expect(result.current.style.opacity).toBe(0)
    expect(result.current.style.transform).toContain('translateY')
  })

  it('should have correct initial style for scaleIn type', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'scaleIn' })
    )

    expect(result.current.style.opacity).toBe(0)
    expect(result.current.style.transform).toContain('scale(0)')
  })

  it('should use bounce easing for bounceIn type', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'bounceIn' })
    )

    expect(result.current.style.transition).toContain('cubic-bezier')
  })

  it('should call stop callback when stop is invoked', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', onStop })
    )

    act(() => {
      result.current.stop()
    })

    expect(onStop).toHaveBeenCalled()
  })

  it('should call reset callback and clear state when reset is invoked', () => {
    const onReset = vi.fn()
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', onReset })
    )

    act(() => {
      result.current.reset()
    })

    expect(onReset).toHaveBeenCalled()
    expect(result.current.isVisible).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('should apply custom duration to transition', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', duration: 1200 })
    )

    expect(result.current.style.transition).toContain('1200ms')
  })

  it('should apply custom distance to slide transforms', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'slideUp', distance: 100 })
    )

    expect(result.current.style.transform).toContain('100px')
  })

  it('should have CSS custom properties in style', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', duration: 600, delay: 200 })
    )

    expect(result.current.style).toHaveProperty('--motion-delay')
    expect(result.current.style).toHaveProperty('--motion-duration')
    expect(result.current.style).toHaveProperty('--motion-easing')
    expect(result.current.style).toHaveProperty('--motion-progress')
  })

  it('should provide all required return properties', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn' })
    )

    expect(result.current).toHaveProperty('ref')
    expect(result.current).toHaveProperty('isVisible')
    expect(result.current).toHaveProperty('isAnimating')
    expect(result.current).toHaveProperty('style')
    expect(result.current).toHaveProperty('progress')
    expect(result.current).toHaveProperty('start')
    expect(result.current).toHaveProperty('stop')
    expect(result.current).toHaveProperty('reset')
  })

  it('should handle slideLeft type correctly', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'slideLeft', distance: 50 })
    )

    expect(result.current.style.transform).toContain('translateX(50px)')
  })

  it('should handle slideRight type correctly', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'slideRight', distance: 50 })
    )

    expect(result.current.style.transform).toContain('translateX(-50px)')
  })

  it('should start with isAnimating false', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', autoStart: false })
    )

    expect(result.current.isAnimating).toBe(false)
  })

  it('should start with progress 0', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', autoStart: false })
    )

    expect(result.current.progress).toBe(0)
  })

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn' })
    )

    expect(() => unmount()).not.toThrow()
  })

  it('should accept custom easing', () => {
    const { result } = renderHook(() =>
      useUnifiedMotion({ type: 'fadeIn', easing: 'ease-in' })
    )

    expect(result.current.style.transition).toContain('ease-in')
  })
})
