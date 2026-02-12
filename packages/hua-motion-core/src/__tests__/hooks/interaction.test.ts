// ========================================
// HUA Motion Core - Interaction Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHoverMotion } from '../../hooks/useHoverMotion'
import { useClickToggle } from '../../hooks/useClickToggle'
import { useFocusToggle } from '../../hooks/useFocusToggle'
import { useToggleMotion } from '../../hooks/useToggleMotion'
import { useVisibilityToggle } from '../../hooks/useVisibilityToggle'

// ========================================
// useHoverMotion Tests (~12)
// ========================================

describe('useHoverMotion', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useHoverMotion())
    expect(result.current.isVisible).toBe(true) // always visible for hover effect
    expect(result.current.isHovered).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.ref).toBeDefined()
  })

  it('style without hover: scale(1) translateY(0px)', () => {
    const { result } = renderHook(() => useHoverMotion())
    expect(result.current.style.transform).toBe('scale(1) translateY(0px)')
    expect(result.current.style.opacity).toBe(1)
  })

  it('default hoverScale is 1.05', () => {
    const { result } = renderHook(() => useHoverMotion())
    act(() => { result.current.start() }) // start() sets isHovered=true
    expect(result.current.style.transform).toBe('scale(1.05) translateY(-2px)')
  })

  it('default hoverY is -2', () => {
    const { result } = renderHook(() => useHoverMotion())
    act(() => { result.current.start() })
    expect(result.current.style.transform).toBe('scale(1.05) translateY(-2px)')
  })

  it('custom hoverScale option', () => {
    const { result } = renderHook(() => useHoverMotion({ hoverScale: 1.1 }))
    act(() => { result.current.start() })
    expect(result.current.style.transform).toBe('scale(1.1) translateY(-2px)')
  })

  it('custom hoverY option', () => {
    const { result } = renderHook(() => useHoverMotion({ hoverY: -5 }))
    act(() => { result.current.start() })
    expect(result.current.style.transform).toBe('scale(1.05) translateY(-5px)')
  })

  it('custom hoverOpacity option', () => {
    const { result } = renderHook(() => useHoverMotion({ hoverOpacity: 0.8 }))
    act(() => { result.current.start() })
    expect(result.current.style.opacity).toBe(0.8)
  })

  it('start() sets isHovered=true', () => {
    const { result } = renderHook(() => useHoverMotion())
    act(() => { result.current.start() })
    expect(result.current.isHovered).toBe(true)
    expect(result.current.isAnimating).toBe(true)
  })

  it('reset() sets isHovered=false', () => {
    const { result } = renderHook(() => useHoverMotion())
    act(() => { result.current.start() })
    expect(result.current.isHovered).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.isHovered).toBe(false)
    expect(result.current.isAnimating).toBe(false)
  })

  it('progress is 1 when hovered, 0 when not', () => {
    const { result } = renderHook(() => useHoverMotion())
    expect(result.current.progress).toBe(0)
    act(() => { result.current.start() })
    expect(result.current.progress).toBe(1)
    act(() => { result.current.reset() })
    expect(result.current.progress).toBe(0)
  })

  it('includes transition CSS', () => {
    const { result } = renderHook(() => useHoverMotion({ duration: 200 }))
    expect(result.current.style.transition).toContain('200ms')
    expect(result.current.style.transition).toContain('transform')
    expect(result.current.style.transition).toContain('opacity')
  })

  it('stop() sets isAnimating to false', () => {
    const { result } = renderHook(() => useHoverMotion())
    act(() => { result.current.start() })
    act(() => { result.current.stop() })
    expect(result.current.isAnimating).toBe(false)
  })
})

// ========================================
// useClickToggle Tests (~15)
// ========================================

describe('useClickToggle', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useClickToggle())
    expect(result.current.isActive).toBe(false)
    // renderHook runs effects synchronously, so mounted is already true
    expect(result.current.mounted).toBe(true)
  })

  it('clickHandlers.onClick exists when toggleOnClick=true', () => {
    const { result } = renderHook(() => useClickToggle({ toggleOnClick: true }))
    expect(result.current.clickHandlers.onClick).toBeDefined()
  })

  it('toggle() flips isActive', () => {
    const { result } = renderHook(() => useClickToggle())
    expect(result.current.isActive).toBe(false)
    act(() => { result.current.toggle() })
    expect(result.current.isActive).toBe(true)
    act(() => { result.current.toggle() })
    expect(result.current.isActive).toBe(false)
  })

  it('activate() sets isActive=true', () => {
    const { result } = renderHook(() => useClickToggle())
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
  })

  it('deactivate() sets isActive=false', () => {
    const { result } = renderHook(() => useClickToggle())
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
    act(() => { result.current.deactivate() })
    expect(result.current.isActive).toBe(false)
  })

  it('reset() resets to initialState', () => {
    const { result } = renderHook(() => useClickToggle({ initialState: false }))
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.isActive).toBe(false)
  })

  it('with initialState=true, starts active', () => {
    const { result } = renderHook(() => useClickToggle({ initialState: true, showOnMount: true }))
    expect(result.current.isActive).toBe(true)
  })

  it('with showOnMount=true, shows initial state on mount', () => {
    const { result } = renderHook(() => useClickToggle({ initialState: true, showOnMount: true }))
    expect(result.current.isActive).toBe(true)
  })

  it('with toggleOnDoubleClick=true, clickHandlers has onDoubleClick', () => {
    const { result } = renderHook(() => useClickToggle({ toggleOnDoubleClick: true }))
    expect(result.current.clickHandlers.onDoubleClick).toBeDefined()
  })

  it('with toggleOnRightClick=true, clickHandlers has onContextMenu', () => {
    const { result } = renderHook(() => useClickToggle({ toggleOnRightClick: true }))
    expect(result.current.clickHandlers.onContextMenu).toBeDefined()
  })

  it('with toggleOnEnter=true, clickHandlers has onKeyDown', () => {
    const { result } = renderHook(() => useClickToggle({ toggleOnEnter: true }))
    expect(result.current.clickHandlers.onKeyDown).toBeDefined()
  })

  it('with toggleOnSpace=true, clickHandlers has onKeyDown', () => {
    const { result } = renderHook(() => useClickToggle({ toggleOnSpace: true }))
    expect(result.current.clickHandlers.onKeyDown).toBeDefined()
  })

  it('autoReset: after activation, auto-deactivates after resetDelay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useClickToggle({ autoReset: true, resetDelay: 1000 }))
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.isActive).toBe(false)
    vi.useRealTimers()
  })

  it('toggleOnClick=false means no onClick handler', () => {
    const { result } = renderHook(() => useClickToggle({ toggleOnClick: false }))
    expect(result.current.clickHandlers.onClick).toBeUndefined()
  })

  it('mounted becomes true after mount effect', () => {
    const { result } = renderHook(() => useClickToggle())
    // renderHook runs effects synchronously
    expect(result.current.mounted).toBe(true)
  })
})

// ========================================
// useFocusToggle Tests (~12)
// ========================================

describe('useFocusToggle', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useFocusToggle())
    expect(result.current.isActive).toBe(false)
    // renderHook runs effects synchronously
    expect(result.current.mounted).toBe(true)
  })

  it('focusHandlers.onFocus exists when toggleOnFocus=true', () => {
    const { result } = renderHook(() => useFocusToggle({ toggleOnFocus: true }))
    expect(result.current.focusHandlers.onFocus).toBeDefined()
  })

  it('activate() on focus', () => {
    const { result } = renderHook(() => useFocusToggle())
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
  })

  it('deactivate() on blur', () => {
    const { result } = renderHook(() => useFocusToggle())
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
    act(() => { result.current.deactivate() })
    expect(result.current.isActive).toBe(false)
  })

  it('with toggleOnBlur=true, focusHandlers has onBlur', () => {
    const { result } = renderHook(() => useFocusToggle({ toggleOnBlur: true }))
    expect(result.current.focusHandlers.onBlur).toBeDefined()
  })

  it('toggle() flips isActive', () => {
    const { result } = renderHook(() => useFocusToggle())
    act(() => { result.current.toggle() })
    expect(result.current.isActive).toBe(true)
    act(() => { result.current.toggle() })
    expect(result.current.isActive).toBe(false)
  })

  it('reset() resets to initialState', () => {
    const { result } = renderHook(() => useFocusToggle({ initialState: false }))
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.isActive).toBe(false)
  })

  it('has ref defined', () => {
    const { result } = renderHook(() => useFocusToggle())
    expect(result.current.ref).toBeDefined()
  })

  it('with toggleOnFocusIn=true, focusHandlers has onFocusIn', () => {
    const { result } = renderHook(() => useFocusToggle({ toggleOnFocusIn: true }))
    expect(result.current.focusHandlers.onFocusIn).toBeDefined()
  })

  it('with toggleOnFocusOut=true, focusHandlers has onFocusOut', () => {
    const { result } = renderHook(() => useFocusToggle({ toggleOnFocusOut: true }))
    expect(result.current.focusHandlers.onFocusOut).toBeDefined()
  })

  it('autoReset option works', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useFocusToggle({ autoReset: true, resetDelay: 1000 }))
    act(() => { result.current.activate() })
    expect(result.current.isActive).toBe(true)
    act(() => { vi.advanceTimersByTime(1000) })
    expect(result.current.isActive).toBe(false)
    vi.useRealTimers()
  })

  it('mounted becomes true after mount', () => {
    const { result } = renderHook(() => useFocusToggle())
    // renderHook runs effects synchronously
    expect(result.current.mounted).toBe(true)
  })
})

// ========================================
// useToggleMotion Tests (~10)
// ========================================

describe('useToggleMotion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct initial state', () => {
    const { result } = renderHook(() => useToggleMotion())
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.ref).toBeDefined()
  })

  it('show() sets isVisible=true', () => {
    const { result } = renderHook(() => useToggleMotion())
    act(() => { result.current.show() })
    expect(result.current.isVisible).toBe(true)
    expect(result.current.isAnimating).toBe(true)
  })

  it('hide() sets isVisible=false', () => {
    const { result } = renderHook(() => useToggleMotion())
    act(() => { result.current.show() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.hide() })
    expect(result.current.isVisible).toBe(false)
  })

  it('toggle() flips state', () => {
    const { result } = renderHook(() => useToggleMotion())
    expect(result.current.isVisible).toBe(false)
    act(() => { result.current.toggle() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.toggle() })
    expect(result.current.isVisible).toBe(false)
  })

  it('style reflects visibility (opacity 0/1)', () => {
    const { result } = renderHook(() => useToggleMotion())
    expect(result.current.style.opacity).toBe(0)
    act(() => { result.current.show() })
    expect(result.current.style.opacity).toBe(1)
  })

  it('style reflects visibility (transform)', () => {
    const { result } = renderHook(() => useToggleMotion())
    expect(result.current.style.transform).toBe('translateY(10px) scale(0.95)')
    act(() => { result.current.show() })
    expect(result.current.style.transform).toBe('translateY(0) scale(1)')
  })

  it('progress is 0 when hidden, 1 when visible', () => {
    const { result } = renderHook(() => useToggleMotion())
    expect(result.current.progress).toBe(0)
    act(() => { result.current.show() })
    expect(result.current.progress).toBe(1)
  })

  it('start() calls show()', () => {
    const { result } = renderHook(() => useToggleMotion())
    act(() => { result.current.start() })
    expect(result.current.isVisible).toBe(true)
  })

  it('reset() resets to hidden state', () => {
    const { result } = renderHook(() => useToggleMotion())
    act(() => { result.current.show() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.reset() })
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
  })

  it('includes transition CSS', () => {
    const { result } = renderHook(() => useToggleMotion({ duration: 300 }))
    expect(result.current.style.transition).toContain('300ms')
  })
})

// ========================================
// useVisibilityToggle Tests (~10)
// ========================================

describe('useVisibilityToggle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns correct initial state', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    expect(result.current.isVisible).toBe(false)
    expect(result.current.isAnimating).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('show() when hidden → isVisible becomes true', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    act(() => { result.current.show() })
    expect(result.current.isVisible).toBe(true)
  })

  it('hide() when visible → isVisible becomes false', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    act(() => { result.current.show() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.hide() })
    expect(result.current.isVisible).toBe(false)
  })

  it('toggle() flips visibility', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    expect(result.current.isVisible).toBe(false)
    act(() => { result.current.toggle() })
    expect(result.current.isVisible).toBe(true)
    act(() => { result.current.toggle() })
    expect(result.current.isVisible).toBe(false)
  })

  it('style includes default hideScale=0.8', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    expect(result.current.style.transform).toContain('scale(0.8)')
  })

  it('style includes default hideOpacity=0', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    expect(result.current.style.opacity).toBe(0)
  })

  it('custom showScale option', () => {
    const { result } = renderHook(() => useVisibilityToggle({ showScale: 1.2 }))
    act(() => { result.current.show() })
    expect(result.current.style.transform).toContain('scale(1.2)')
  })

  it('custom hideTranslateY option', () => {
    const { result } = renderHook(() => useVisibilityToggle({ hideTranslateY: 30 }))
    expect(result.current.style.transform).toContain('30px')
  })

  it('pause() and resume() exist', () => {
    const { result } = renderHook(() => useVisibilityToggle())
    expect(result.current.pause).toBeDefined()
    expect(result.current.resume).toBeDefined()
    act(() => { result.current.pause() })
    expect(result.current.isAnimating).toBe(false)
  })

  it('includes transition CSS', () => {
    const { result } = renderHook(() => useVisibilityToggle({ duration: 300 }))
    expect(result.current.style.transition).toContain('300ms')
  })
})
