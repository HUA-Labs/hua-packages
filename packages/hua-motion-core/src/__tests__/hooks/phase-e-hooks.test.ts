// ========================================
// HUA Motion Core - Phase E Hooks Tests
// ========================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTypewriter } from '../../hooks/useTypewriter'
import { useCustomCursor } from '../../hooks/useCustomCursor'
import { useMagneticCursor } from '../../hooks/useMagneticCursor'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { useElementProgress } from '../../hooks/useElementProgress'

// ========================================
// useTypewriter Tests (~6)
// ========================================

describe('useTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty string initially', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'Hello' }))
    expect(result.current.displayText).toBe('')
    expect(result.current.isTyping).toBe(false)
  })

  it('types text character by character', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'Hi', speed: 50, delay: 0 }))

    // Initial state
    expect(result.current.displayText).toBe('')

    // After delay (0ms), typing starts
    act(() => {
      vi.advanceTimersByTime(0)
    })

    // First character after speed (50ms)
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.displayText).toBe('H')
    expect(result.current.isTyping).toBe(true)

    // Second character
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.displayText).toBe('Hi')
    expect(result.current.isTyping).toBe(false)
  })

  it('respects speed option', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'AB', speed: 100, delay: 0 }))

    act(() => {
      vi.advanceTimersByTime(0)
    })

    // After 100ms, first character
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.displayText).toBe('A')

    // After another 100ms, second character
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.displayText).toBe('AB')
  })

  it('calls onComplete when done', () => {
    const onComplete = vi.fn()
    renderHook(() => useTypewriter({ text: 'A', speed: 50, delay: 0, onComplete }))

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(onComplete).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(50)
    })

    // After typing the last character, onComplete is called
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('restart resets typing', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'Hello', speed: 50, delay: 0 }))

    // Start typing
    act(() => {
      vi.advanceTimersByTime(0)
    })

    // Type first character
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.displayText).toBe('H')
    expect(result.current.isTyping).toBe(true)

    // Restart
    act(() => {
      result.current.restart()
    })

    // After restart, state should be reset
    expect(result.current.displayText).toBe('')
    expect(result.current.progress).toBe(0)
    expect(result.current.isTyping).toBe(false)
  })

  it('progress goes from 0 to 1', () => {
    const { result } = renderHook(() => useTypewriter({ text: 'AB', speed: 50, delay: 0 }))

    expect(result.current.progress).toBe(0)

    act(() => {
      vi.advanceTimersByTime(0)
    })

    // First character (1/2 = 0.5)
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.progress).toBe(0.5)

    // Second character (2/2 = 1)
    act(() => {
      vi.advanceTimersByTime(50)
    })
    expect(result.current.progress).toBe(1)
  })
})

// ========================================
// useCustomCursor Tests (~4)
// ========================================

describe('useCustomCursor', () => {
  it('returns initial state (x=0, y=0, isVisible=false)', () => {
    const { result } = renderHook(() => useCustomCursor())
    expect(result.current.x).toBe(0)
    expect(result.current.y).toBe(0)
    expect(result.current.isVisible).toBe(false)
  })

  it('isHovering defaults to false', () => {
    const { result } = renderHook(() => useCustomCursor())
    expect(result.current.isHovering).toBe(false)
  })

  it('label defaults to null', () => {
    const { result } = renderHook(() => useCustomCursor())
    expect(result.current.label).toBe(null)
  })

  it('style contains position fixed', () => {
    const { result } = renderHook(() => useCustomCursor())
    expect(result.current.style.position).toBe('fixed')
    expect(result.current.style.pointerEvents).toBe('none')
    expect(result.current.style.zIndex).toBe(9999)
  })
})

// ========================================
// useMagneticCursor Tests (~3)
// ========================================

describe('useMagneticCursor', () => {
  it('returns ref and handlers', () => {
    const { result } = renderHook(() => useMagneticCursor<HTMLButtonElement>())
    expect(result.current.ref).toBeDefined()
    expect(result.current.handlers).toBeDefined()
    expect(result.current.style).toBeDefined()
  })

  it('handlers has onMouseMove and onMouseLeave', () => {
    const { result } = renderHook(() => useMagneticCursor())
    expect(typeof result.current.handlers.onMouseMove).toBe('function')
    expect(typeof result.current.handlers.onMouseLeave).toBe('function')
  })

  it('style has transition property', () => {
    const { result } = renderHook(() => useMagneticCursor())
    expect(result.current.style.transition).toBeDefined()
    expect(result.current.style.transition).toContain('transform')
    expect(result.current.style.transition).toContain('0.3s')
    expect(result.current.style.transition).toContain('cubic-bezier')
  })
})

// ========================================
// useSmoothScroll Tests (~3)
// ========================================

describe('useSmoothScroll', () => {
  it('returns initial scroll=0', () => {
    const { result } = renderHook(() => useSmoothScroll({ enabled: false }))
    expect(result.current.scroll).toBe(0)
  })

  it('returns progress=0 initially', () => {
    const { result } = renderHook(() => useSmoothScroll({ enabled: false }))
    expect(result.current.progress).toBe(0)
  })

  it('scrollTo function exists', () => {
    const { result } = renderHook(() => useSmoothScroll({ enabled: false }))
    expect(typeof result.current.scrollTo).toBe('function')
    expect(typeof result.current.stop).toBe('function')
    expect(typeof result.current.targetScroll).toBe('number')
  })
})

// ========================================
// useElementProgress Tests (~3)
// ========================================

describe('useElementProgress', () => {
  it('returns ref and progress', () => {
    const { result } = renderHook(() => useElementProgress<HTMLDivElement>())
    expect(result.current.ref).toBeDefined()
    expect(typeof result.current.progress).toBe('number')
  })

  it('progress defaults to 0', () => {
    const { result } = renderHook(() => useElementProgress())
    expect(result.current.progress).toBe(0)
  })

  it('isInView defaults to false', () => {
    const { result } = renderHook(() => useElementProgress())
    expect(result.current.isInView).toBe(false)
  })
})
