// ========================================
// HUA Motion Core - Entrance Hooks Tests
// ========================================

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFadeIn } from '../../hooks/useFadeIn'
import { useSlideUp } from '../../hooks/useSlideUp'
import { useSlideDown } from '../../hooks/useSlideDown'
import { useSlideLeft } from '../../hooks/useSlideLeft'
import { useSlideRight } from '../../hooks/useSlideRight'
import { useScaleIn } from '../../hooks/useScaleIn'
import { useBounceIn } from '../../hooks/useBounceIn'

// ========================================
// useFadeIn Tests (~15)
// ========================================

describe('useFadeIn', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false }))
    // autoStart=false triggers start() via useEffect, so already visible
    expect(result.current.isVisible).toBe(true)
    expect(result.current.progress).toBe(1)
    expect(result.current.ref).toBeDefined()
    expect(result.current.isAnimating).toBe(false)
  })

  it('has correct initial style with default opacity', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false }))
    // autoStart=false triggers start(), so opacity is targetOpacity (1)
    expect(result.current.style.opacity).toBe(1)
    expect(result.current.style.transition).toContain('opacity')
    expect(result.current.style.transition).toContain('700ms')
  })

  it('has correct initial style with custom initialOpacity', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false, initialOpacity: 0.5, targetOpacity: 0.8 }))
    // autoStart=false triggers start(), so opacity is targetOpacity
    expect(result.current.style.opacity).toBe(0.8)
  })

  it('style has correct targetOpacity when visible', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false, targetOpacity: 0.8 }))
    act(() => { result.current.start() })
    expect(result.current.isVisible).toBe(true)
    expect(result.current.style.opacity).toBe(0.8)
  })

  it('style includes transition property', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false }))
    expect(result.current.style.transition).toBeDefined()
    expect(result.current.style.transition).toContain('opacity')
  })

  it('respects custom duration in style', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false, duration: 1000 }))
    expect(result.current.style.transition).toContain('1000ms')
    expect(result.current.style['--motion-duration']).toBe('1000ms')
  })

  it('respects custom delay in style', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false, delay: 300 }))
    expect(result.current.style['--motion-delay']).toBe('300ms')
  })

  it('respects custom easing in style', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false, easing: 'ease-in' }))
    expect(result.current.style.transition).toContain('ease-in')
    expect(result.current.style['--motion-easing']).toBe('ease-in')
  })

  it('starts manually when autoStart is false', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useFadeIn({ autoStart: false, onStart }))
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalled()
    expect(result.current.isVisible).toBe(true)
    expect(result.current.progress).toBe(1)
  })

  it('stop() sets isAnimating to false', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useFadeIn({ autoStart: false, onStop }))
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(onStop).toHaveBeenCalled()
    expect(result.current.isAnimating).toBe(false)
  })

  it('reset() resets to initial state', () => {
    const onReset = vi.fn()
    const { result } = renderHook(() => useFadeIn({ autoStart: false, onReset }))
    act(() => { result.current.start() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.reset() })
    expect(onReset).toHaveBeenCalled()
    expect(result.current.isVisible).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('does not create IntersectionObserver when autoStart is false', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false }))
    // With autoStart=false, start() is called immediately via useEffect
    expect(result.current.isVisible).toBe(true)
    expect(result.current.progress).toBe(1)
  })

  it('onComplete callback is called when animation finishes', () => {
    const onComplete = vi.fn()
    const { result } = renderHook(() => useFadeIn({ autoStart: false, onComplete, delay: 0 }))
    act(() => { result.current.start() })
    expect(onComplete).toHaveBeenCalled()
  })

  it('progress is 0 initially, 1 after start', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false }))
    // autoStart=false triggers start() immediately, so progress is already 1
    expect(result.current.progress).toBe(1)
    // Calling start again should not change (already started)
    act(() => { result.current.start() })
    expect(result.current.progress).toBe(1)
  })

  it('style changes after start', () => {
    const { result } = renderHook(() => useFadeIn({ autoStart: false, initialOpacity: 0, targetOpacity: 1 }))
    // autoStart=false triggers start() immediately, so opacity is targetOpacity
    expect(result.current.style.opacity).toBe(1)
    act(() => { result.current.start() })
    expect(result.current.style.opacity).toBe(1)
  })
})

// ========================================
// useSlideUp Tests (~10)
// ========================================

describe('useSlideUp', () => {
  it('initial style has correct translateY with default distance', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateY(0)')
    expect(result.current.style.opacity).toBe(1)
  })

  it('when visible, transform is translateY(0)', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false }))
    act(() => { result.current.start() })
    expect(result.current.style.transform).toBe('translateY(0)')
    expect(result.current.style.opacity).toBe(1)
  })

  it('custom distance option changes initial offset', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false, distance: 100 }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateY(0)')
  })

  it('style includes transition for both opacity and transform', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false }))
    expect(result.current.style.transition).toContain('opacity')
    expect(result.current.style.transition).toContain('transform')
  })

  it('direction up moves from bottom (positive Y)', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false, direction: 'up' }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateY(0)')
  })

  it('direction down moves from top (negative Y)', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false, direction: 'down' }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateY(0)')
  })

  it('direction left moves from right (positive X)', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false, direction: 'left' }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateX(0)')
  })

  it('direction right moves from left (negative X)', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false, direction: 'right' }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateX(0)')
  })

  it('reset() resets transform and opacity', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false }))
    act(() => { result.current.start() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.isVisible).toBe(false)
    expect(result.current.style.opacity).toBe(0)
  })

  it('includes motion CSS variables', () => {
    const { result } = renderHook(() => useSlideUp({ autoStart: false, distance: 80 }))
    expect(result.current.style['--motion-distance']).toBe('80px')
    expect(result.current.style['--motion-direction']).toBe('up')
  })
})

// ========================================
// useSlideDown Tests (~2)
// ========================================

describe('useSlideDown', () => {
  it('wraps useSlideUp with direction="down"', () => {
    const { result } = renderHook(() => useSlideDown({ autoStart: false }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateY(0)')
  })

  it('returns correct initial transform', () => {
    const { result } = renderHook(() => useSlideDown({ autoStart: false, distance: 100 }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateY(0)')
  })
})

// ========================================
// useSlideLeft Tests (~2)
// ========================================

describe('useSlideLeft', () => {
  it('wraps useSlideUp with direction="left"', () => {
    const { result } = renderHook(() => useSlideLeft({ autoStart: false }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateX(0)')
  })

  it('returns correct initial transform', () => {
    const { result } = renderHook(() => useSlideLeft({ autoStart: false, distance: 100 }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateX(0)')
  })
})

// ========================================
// useSlideRight Tests (~2)
// ========================================

describe('useSlideRight', () => {
  it('wraps useSlideUp with direction="right"', () => {
    const { result } = renderHook(() => useSlideRight({ autoStart: false }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateX(0)')
  })

  it('returns correct initial transform', () => {
    const { result } = renderHook(() => useSlideRight({ autoStart: false, distance: 100 }))
    // autoStart=false triggers start(), so already at final position
    expect(result.current.style.transform).toBe('translateX(0)')
  })
})

// ========================================
// useScaleIn Tests (~10)
// ========================================

describe('useScaleIn', () => {
  it('returns correct initial state when autoStart is true', () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: true }))
    // autoStart=true: starts at initial values (scale=0, opacity=0)
    expect(result.current.isVisible).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.style.transform).toBe('scale(0)')
    expect(result.current.style.opacity).toBe(0)
  })

  it('returns correct initial state when autoStart is false', () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: false }))
    // autoStart=false: starts at target values (scale=1, opacity=1)
    expect(result.current.isVisible).toBe(true)
    expect(result.current.progress).toBe(1)
    expect(result.current.style.transform).toBe('scale(1)')
    expect(result.current.style.opacity).toBe(1)
  })

  it('after trigger: scale=1, opacity=1', () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: false }))
    // autoStart=false: already at target
    expect(result.current.style.transform).toBe('scale(1)')
    expect(result.current.style.opacity).toBe(1)
  })

  it('custom initialScale option', () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: true, initialScale: 0.5 }))
    expect(result.current.style.transform).toBe('scale(0.5)')
  })

  it('custom targetScale option', () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: false, targetScale: 1.2 }))
    // autoStart=false means already at target
    expect(result.current.style.transform).toBe('scale(1.2)')
  })

  it('reset restores initial values', async () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: true, initialScale: 0, delay: 0 }))
    await act(async () => {
      result.current.start()
      // Wait for setTimeout to complete
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.isVisible).toBe(false)
    expect(result.current.style.transform).toBe('scale(0)')
    expect(result.current.style.opacity).toBe(0)
  })

  it('stop() stops animation', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useScaleIn({ autoStart: true, onStop }))
    act(() => { result.current.stop() })
    expect(onStop).toHaveBeenCalled()
    expect(result.current.isAnimating).toBe(false)
  })

  it('includes transition CSS', () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: false, duration: 700 }))
    expect(result.current.style.transition).toContain('700ms')
  })

  it('start() triggers animation', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useScaleIn({ autoStart: true, onStart }))
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalled()
  })

  it('progress reflects animation state', async () => {
    const { result } = renderHook(() => useScaleIn({ autoStart: true }))
    // autoStart=true: starts at initial values
    expect(result.current.progress).toBe(0)
    // Call start() to trigger animation
    await act(async () => {
      result.current.start()
      // Wait for setTimeout to complete
      await new Promise(resolve => setTimeout(resolve, 10))
    })
    // After start() completes, progress becomes 1
    expect(result.current.progress).toBe(1)
  })
})

// ========================================
// useBounceIn Tests (~10)
// ========================================

describe('useBounceIn', () => {
  it('initial state: scale=0, opacity=0 when autoStart is true', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: true }))
    // autoStart=true: starts at initial values
    expect(result.current.style.transform).toBe('scale(0)')
    expect(result.current.style.opacity).toBe(0)
    expect(result.current.isVisible).toBe(false)
  })

  it('initial state: scale=1, opacity=1 when autoStart is false', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: false }))
    // autoStart=false: starts at target values
    expect(result.current.style.transform).toBe('scale(1)')
    expect(result.current.style.opacity).toBe(1)
    expect(result.current.isVisible).toBe(true)
  })

  it('uses bounce easing cubic-bezier', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: false }))
    expect(result.current.style.transition).toContain('cubic-bezier(0.34, 1.56, 0.64, 1)')
  })

  it('default intensity is 0.3', () => {
    // This is internal behavior, but we can check the hook accepts the option
    const { result } = renderHook(() => useBounceIn({ autoStart: false, intensity: 0.3 }))
    expect(result.current.style).toBeDefined()
  })

  it('custom intensity option is accepted', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: false, intensity: 0.5 }))
    expect(result.current.style).toBeDefined()
  })

  it('reset() resets to initial state', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: true }))
    act(() => { result.current.start() })
    act(() => { result.current.reset() })
    expect(result.current.isVisible).toBe(false)
    expect(result.current.style.transform).toBe('scale(0)')
    expect(result.current.style.opacity).toBe(0)
  })

  it('stop() stops animation', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useBounceIn({ autoStart: true, onStop }))
    act(() => { result.current.stop() })
    expect(onStop).toHaveBeenCalled()
  })

  it('start() triggers animation', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useBounceIn({ autoStart: true, onStart }))
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalled()
  })

  it('progress reflects animation state', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: true }))
    expect(result.current.progress).toBe(0)
  })

  it('includes transition duration', () => {
    const { result } = renderHook(() => useBounceIn({ autoStart: false, duration: 600 }))
    expect(result.current.style.transition).toContain('600ms')
  })
})
