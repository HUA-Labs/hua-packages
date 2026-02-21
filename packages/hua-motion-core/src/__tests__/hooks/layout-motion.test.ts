// ========================================
// HUA Motion Core - Layout Motion Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCardList } from '../../hooks/useCardList'
import { useLoadingSpinner } from '../../hooks/useLoadingSpinner'
import { useNavigation } from '../../hooks/useNavigation'
import { useSkeleton } from '../../hooks/useSkeleton'

// ========================================
// useCardList Tests (~8)
// ========================================

describe('useCardList', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useCardList())
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.ref).toBeDefined()
  })

  it('gridColumns defaults to 3', () => {
    const { result } = renderHook(() => useCardList())
    expect(result.current.gridColumns).toBe(3)
  })

  it('gridGap defaults to 20', () => {
    const { result } = renderHook(() => useCardList())
    expect(result.current.gridGap).toBe(20)
  })

  it('custom gridColumns reflected in style', () => {
    const { result } = renderHook(() => useCardList({ gridColumns: 4 }))
    expect(result.current.gridColumns).toBe(4)
    expect(result.current.style.gridTemplateColumns).toBe('repeat(4, 1fr)')
  })

  it('custom gridGap reflected in style', () => {
    const { result } = renderHook(() => useCardList({ gridGap: 16 }))
    expect(result.current.gridGap).toBe(16)
    expect(result.current.style.gap).toBe('16px')
  })

  it('staggerDelay defaults to 100', () => {
    const { result } = renderHook(() => useCardList())
    expect(result.current.staggerDelay).toBe(100)
  })

  it('custom staggerDelay option', () => {
    const { result } = renderHook(() => useCardList({ staggerDelay: 200 }))
    expect(result.current.staggerDelay).toBe(200)
  })

  it('style has display grid', () => {
    const { result } = renderHook(() => useCardList())
    expect(result.current.style.display).toBe('grid')
    expect(result.current.style.width).toBe('100%')
  })

  it('reset() restores initial state', () => {
    const { result } = renderHook(() => useCardList())
    act(() => { result.current.start() })
    act(() => { result.current.reset() })
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('stop() sets isAnimating to false', () => {
    const { result } = renderHook(() => useCardList())
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(result.current.isAnimating).toBe(false)
  })

  it('onStart callback called on start', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useCardList({ onStart }))
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('onStop callback called on stop', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useCardList({ onStop }))
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('onReset callback called on reset', () => {
    const onReset = vi.fn()
    const { result } = renderHook(() => useCardList({ onReset }))
    act(() => { result.current.reset() })
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('calling start twice does not restart if already animating', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useCardList({ onStart }))
    act(() => { result.current.start() })
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })
})

// ========================================
// useLoadingSpinner Tests (~10)
// ========================================

describe('useLoadingSpinner', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct initial state with autoStart=false', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    expect(result.current.isLoading).toBe(false)
    expect(result.current.ref).toBeDefined()
  })

  it('autoStart=true starts loading immediately', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: true }))
    expect(result.current.isLoading).toBe(true)
  })

  it('spinnerType defaults to rotate', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    expect(result.current.spinnerType).toBe('rotate')
  })

  it('custom type option', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'pulse', autoStart: false }))
    expect(result.current.spinnerType).toBe('pulse')
  })

  it('startLoading() sets isLoading to true', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    act(() => { result.current.startLoading() })
    expect(result.current.isLoading).toBe(true)
  })

  it('stopLoading() sets isLoading to false', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    act(() => { result.current.startLoading() })
    expect(result.current.isLoading).toBe(true)
    act(() => { result.current.stopLoading() })
    expect(result.current.isLoading).toBe(false)
  })

  it('setLoadingState(true) starts loading', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    act(() => { result.current.setLoadingState(true) })
    expect(result.current.isLoading).toBe(true)
  })

  it('setLoadingState(false) stops loading', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    act(() => { result.current.startLoading() })
    act(() => { result.current.setLoadingState(false) })
    expect(result.current.isLoading).toBe(false)
  })

  it('custom size reflected in style', () => {
    const { result } = renderHook(() => useLoadingSpinner({ size: 60, autoStart: false }))
    expect(result.current.style.width).toBe(60)
    expect(result.current.style.height).toBe(60)
  })

  it('reset() restores all values', () => {
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false }))
    act(() => { result.current.startLoading() })
    act(() => { result.current.reset() })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isVisible).toBe(false)
    expect(result.current.progress).toBe(0)
    expect(result.current.rotationAngle).toBe(0)
    expect(result.current.pulseScale).toBe(1)
    expect(result.current.bounceOffset).toBe(0)
  })

  it('onStart callback called on startLoading', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false, onStart }))
    act(() => { result.current.startLoading() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('onStop callback called on stopLoading', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false, onStop }))
    act(() => { result.current.startLoading() })
    act(() => { result.current.stopLoading() })
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('onReset callback called on reset', () => {
    const onReset = vi.fn()
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false, onReset }))
    act(() => { result.current.reset() })
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('startLoading twice does not restart if already loading', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useLoadingSpinner({ autoStart: false, onStart }))
    act(() => { result.current.startLoading() })
    act(() => { result.current.startLoading() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('rotate type: style has border and borderRadius', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'rotate', autoStart: false }))
    expect(result.current.style.borderRadius).toBe('50%')
  })

  it('pulse type: style has backgroundColor and borderRadius', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'pulse', autoStart: false }))
    expect(result.current.style.borderRadius).toBe('50%')
    expect(result.current.style.backgroundColor).toBe('#3b82f6')
  })

  it('bounce type: style has backgroundColor', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'bounce', autoStart: false }))
    expect(result.current.style.backgroundColor).toBe('#3b82f6')
  })

  it('wave type: style has display flex', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'wave', autoStart: false }))
    expect(result.current.style.display).toBe('flex')
  })

  it('dots type: style has display flex', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'dots', autoStart: false }))
    expect(result.current.style.display).toBe('flex')
  })

  it('bars type: style has display flex', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'bars', autoStart: false }))
    expect(result.current.style.display).toBe('flex')
  })

  it('custom color reflected in rotate style', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'rotate', color: '#ff0000', autoStart: false }))
    expect(result.current.style.borderTop).toContain('#ff0000')
  })

  it('custom thickness reflected in style', () => {
    const { result } = renderHook(() => useLoadingSpinner({ type: 'rotate', thickness: 8, autoStart: false }))
    expect(result.current.style.borderTop).toContain('8px')
  })
})

// ========================================
// useNavigation Tests (~8)
// ========================================

describe('useNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct initial state', () => {
    const { result } = renderHook(() => useNavigation())
    expect(result.current.isOpen).toBe(false)
    expect(result.current.activeIndex).toBe(0)
    expect(result.current.isVisible).toBe(false)
    expect(result.current.ref).toBeDefined()
  })

  it('openMenu() opens the menu', () => {
    const { result } = renderHook(() => useNavigation())
    act(() => { result.current.openMenu() })
    expect(result.current.isOpen).toBe(true)
    expect(result.current.isAnimating).toBe(true)
  })

  it('closeMenu() closes the menu', () => {
    const { result } = renderHook(() => useNavigation())
    act(() => { result.current.openMenu() })
    expect(result.current.isOpen).toBe(true)
    act(() => { result.current.closeMenu() })
    expect(result.current.isOpen).toBe(false)
  })

  it('toggleMenu() flips open state', () => {
    const { result } = renderHook(() => useNavigation())
    act(() => { result.current.toggleMenu() })
    expect(result.current.isOpen).toBe(true)
    act(() => { result.current.toggleMenu() })
    expect(result.current.isOpen).toBe(false)
  })

  it('setActiveItem(index) changes activeIndex', () => {
    const { result } = renderHook(() => useNavigation({ itemCount: 5 }))
    act(() => { result.current.setActiveItem(3) })
    expect(result.current.activeIndex).toBe(3)
  })

  it('goToNext() increments activeIndex with wrap', () => {
    const { result } = renderHook(() => useNavigation({ itemCount: 3 }))
    act(() => { result.current.goToNext() })
    expect(result.current.activeIndex).toBe(1)
    act(() => { result.current.goToNext() })
    expect(result.current.activeIndex).toBe(2)
    act(() => { result.current.goToNext() })
    expect(result.current.activeIndex).toBe(0) // wraps
  })

  it('goToPrevious() decrements activeIndex with wrap', () => {
    const { result } = renderHook(() => useNavigation({ itemCount: 3 }))
    act(() => { result.current.goToPrevious() })
    expect(result.current.activeIndex).toBe(2) // wraps from 0
  })

  it('itemStyles length equals itemCount', () => {
    const { result } = renderHook(() => useNavigation({ itemCount: 4 }))
    expect(result.current.itemStyles).toHaveLength(4)
  })

  it('slide type: style has translateX when closed', () => {
    const { result } = renderHook(() => useNavigation({ type: 'slide', slideDirection: 'left' }))
    expect(result.current.style.transform).toContain('translateX(-100%)')
  })

  it('fade type: style has opacity 0 when closed', () => {
    const { result } = renderHook(() => useNavigation({ type: 'fade' }))
    expect(result.current.style.opacity).toBe(0)
  })

  it('scale type: style has scale(0) when closed', () => {
    const { result } = renderHook(() => useNavigation({ type: 'scale' }))
    expect(result.current.style.transform).toBe('scale(0)')
  })

  it('reset() restores initial state', () => {
    const { result } = renderHook(() => useNavigation())
    act(() => { result.current.openMenu() })
    act(() => { result.current.setActiveItem(2) })
    act(() => { result.current.reset() })
    expect(result.current.isOpen).toBe(false)
    expect(result.current.activeIndex).toBe(0)
    expect(result.current.isVisible).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('onStart callback called on openMenu', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useNavigation({ onStart }))
    act(() => { result.current.openMenu() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('onStop callback called on stop', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useNavigation({ onStop }))
    act(() => { result.current.stop() })
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('onReset callback called on reset', () => {
    const onReset = vi.fn()
    const { result } = renderHook(() => useNavigation({ onReset }))
    act(() => { result.current.reset() })
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('openMenu twice does not restart if already open', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useNavigation({ onStart }))
    act(() => { result.current.openMenu() })
    act(() => { result.current.openMenu() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('closeMenu when not open does nothing', () => {
    const { result } = renderHook(() => useNavigation())
    act(() => { result.current.closeMenu() })
    expect(result.current.isOpen).toBe(false)
  })

  it('setActiveItem with out-of-bounds index does nothing', () => {
    const { result } = renderHook(() => useNavigation({ itemCount: 3 }))
    act(() => { result.current.setActiveItem(5) })
    expect(result.current.activeIndex).toBe(0) // unchanged
  })

  it('setActiveItem with negative index does nothing', () => {
    const { result } = renderHook(() => useNavigation({ itemCount: 3 }))
    act(() => { result.current.setActiveItem(-1) })
    expect(result.current.activeIndex).toBe(0) // unchanged
  })

  it('rotate type: style has rotate transform when closed', () => {
    const { result } = renderHook(() => useNavigation({ type: 'rotate' }))
    expect(result.current.style.transform).toBe('rotate(180deg)')
  })

  it('custom staggerDelay affects item transition', () => {
    const { result } = renderHook(() => useNavigation({ staggerDelay: 100, itemCount: 3 }))
    act(() => { result.current.openMenu() })
    // Each item should have different transition delay
    const delays = result.current.itemStyles.map(s => s.transition)
    expect(delays[0]).not.toBe(delays[1])
  })
})

// ========================================
// useSkeleton Tests (~6)
// ========================================

describe('useSkeleton', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct initial state with autoStart=false', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: false }))
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.ref).toBeDefined()
  })

  it('autoStart=true makes visible immediately', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: true }))
    expect(result.current.isVisible).toBe(true)
  })

  it('custom height/width reflected in style', () => {
    const { result } = renderHook(() => useSkeleton({ height: 40, width: 200, autoStart: false }))
    expect(result.current.style.height).toBe('40px')
    expect(result.current.style.width).toBe('200px')
  })

  it('width accepts string value', () => {
    const { result } = renderHook(() => useSkeleton({ width: '50%', autoStart: false }))
    expect(result.current.style.width).toBe('50%')
  })

  it('custom borderRadius reflected in style', () => {
    const { result } = renderHook(() => useSkeleton({ borderRadius: 8, autoStart: false }))
    expect(result.current.style.borderRadius).toBe('8px')
  })

  it('custom backgroundColor reflected in style', () => {
    const { result } = renderHook(() => useSkeleton({ backgroundColor: '#ccc', autoStart: false }))
    expect(result.current.style.backgroundColor).toBe('#ccc')
  })

  it('stop() sets isAnimating to false', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: false }))
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(result.current.isAnimating).toBe(false)
  })

  it('reset() restores initial state', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: false }))
    act(() => { result.current.start() })
    act(() => { result.current.reset() })
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('onStart callback called on start', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useSkeleton({ autoStart: false, onStart }))
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('onStop callback called on stop', () => {
    const onStop = vi.fn()
    const { result } = renderHook(() => useSkeleton({ autoStart: false, onStop }))
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  it('onReset callback called on reset', () => {
    const onReset = vi.fn()
    const { result } = renderHook(() => useSkeleton({ autoStart: false, onReset }))
    act(() => { result.current.start() })
    act(() => { result.current.reset() })
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('start twice does not restart if already animating', () => {
    const onStart = vi.fn()
    const { result } = renderHook(() => useSkeleton({ autoStart: false, onStart }))
    act(() => { result.current.start() })
    act(() => { result.current.start() })
    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('default wave=true sets background gradient when animating', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: true, wave: true }))
    expect(result.current.style.background).toContain('linear-gradient')
  })

  it('pulse=true sets animation when animating', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: true, wave: false, pulse: true }))
    expect(result.current.style.animation).toContain('skeleton-pulse')
  })

  it('style has position relative and overflow hidden', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: false }))
    expect(result.current.style.position).toBe('relative')
    expect(result.current.style.overflow).toBe('hidden')
  })

  it('default height is 20px', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: false }))
    expect(result.current.style.height).toBe('20px')
  })

  it('default width is 100%', () => {
    const { result } = renderHook(() => useSkeleton({ autoStart: false }))
    expect(result.current.style.width).toBe('100%')
  })
})
