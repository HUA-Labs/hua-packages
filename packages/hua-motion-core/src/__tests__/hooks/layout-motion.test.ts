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
})
