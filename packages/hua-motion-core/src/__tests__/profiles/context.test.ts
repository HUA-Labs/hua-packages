import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createElement } from 'react'
import { MotionProfileProvider, useMotionProfile } from '../../profiles/MotionProfileContext'
import { neutral } from '../../profiles/neutral'
import { hua } from '../../profiles/hua'
import { useFadeIn } from '../../hooks/useFadeIn'
import { useSlideUp } from '../../hooks/useSlideUp'
import { useHoverMotion } from '../../hooks/useHoverMotion'
import type { MotionProfile } from '../../profiles/types'

// IntersectionObserver mock
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [0],
    takeRecords: () => [],
  }))
})

function createWrapper(props: Omit<React.ComponentProps<typeof MotionProfileProvider>, 'children'>) {
  return ({ children }: { children: React.ReactNode }) =>
    createElement(MotionProfileProvider, { ...props, children })
}

describe('MotionProfileContext', () => {
  // ========================================
  // useMotionProfile — 기본 동작
  // ========================================

  describe('useMotionProfile', () => {
    it('should return neutral profile when no Provider', () => {
      const { result } = renderHook(() => useMotionProfile())
      expect(result.current.name).toBe('neutral')
      expect(result.current.base.duration).toBe(700)
    })

    it('should return hua profile when wrapped in hua Provider', () => {
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({ profile: 'hua' }),
      })
      expect(result.current.name).toBe('hua')
      expect(result.current.base.duration).toBe(640)
    })

    it('should return neutral profile when wrapped in neutral Provider', () => {
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({ profile: 'neutral' }),
      })
      expect(result.current.name).toBe('neutral')
    })

    it('should accept custom profile object', () => {
      const custom: MotionProfile = {
        ...neutral,
        name: 'custom',
        base: { ...neutral.base, duration: 999 },
      }
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({ profile: custom }),
      })
      expect(result.current.name).toBe('custom')
      expect(result.current.base.duration).toBe(999)
    })

    it('should apply overrides on top of profile', () => {
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({
          profile: 'hua',
          overrides: { base: { duration: 400 } },
        }),
      })
      // duration overridden
      expect(result.current.base.duration).toBe(400)
      // rest of hua preserved
      expect(result.current.base.easing).toBe(hua.base.easing)
      expect(result.current.entrance.slide.distance).toBe(hua.entrance.slide.distance)
    })

    it('should apply nested overrides', () => {
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({
          profile: 'neutral',
          overrides: {
            entrance: { slide: { distance: 50 } },
            spring: { stiffness: 300 },
          },
        }),
      })
      expect(result.current.entrance.slide.distance).toBe(50)
      expect(result.current.entrance.slide.easing).toBe('ease-out') // preserved
      expect(result.current.spring.stiffness).toBe(300)
      expect(result.current.spring.damping).toBe(10) // preserved
    })
  })

  // ========================================
  // 훅 → 프로필 연동 검증
  // ========================================

  describe('hook integration with profiles', () => {
    describe('useFadeIn', () => {
      it('should use neutral defaults without Provider', () => {
        const { result } = renderHook(() => useFadeIn({ autoStart: false }))
        const transition = result.current.style.transition as string
        expect(transition).toContain('700ms')
        expect(transition).toContain('ease-out')
      })

      it('should use hua defaults with hua Provider', () => {
        const { result } = renderHook(() => useFadeIn({ autoStart: false }), {
          wrapper: createWrapper({ profile: 'hua' }),
        })
        const transition = result.current.style.transition as string
        expect(transition).toContain('640ms')
        expect(transition).toContain('cubic-bezier')
      })

      it('should respect explicit options over profile', () => {
        const { result } = renderHook(
          () => useFadeIn({ autoStart: false, duration: 300 }),
          { wrapper: createWrapper({ profile: 'hua' }) },
        )
        const transition = result.current.style.transition as string
        expect(transition).toContain('300ms')
      })
    })

    describe('useSlideUp', () => {
      // Note: useSlideUp calls start() immediately when autoStart=false,
      // so isVisible=true and transform=translateY(0).
      // We verify profile values via CSS custom properties and transition string.

      it('should use neutral slide distance without Provider', () => {
        const { result } = renderHook(() => useSlideUp({ autoStart: false }))
        const style = result.current.style as Record<string, string>
        expect(style['--motion-distance']).toBe('32px')
      })

      it('should use hua slide distance with hua Provider', () => {
        const { result } = renderHook(() => useSlideUp({ autoStart: false }), {
          wrapper: createWrapper({ profile: 'hua' }),
        })
        const style = result.current.style as Record<string, string>
        expect(style['--motion-distance']).toBe('28px')
      })

      it('should use hua slide easing', () => {
        const { result } = renderHook(() => useSlideUp({ autoStart: false }), {
          wrapper: createWrapper({ profile: 'hua' }),
        })
        const transition = result.current.style.transition as string
        expect(transition).toContain('1.14')
      })

      it('should respect explicit distance over profile', () => {
        const { result } = renderHook(
          () => useSlideUp({ autoStart: false, distance: 60 }),
          { wrapper: createWrapper({ profile: 'hua' }) },
        )
        const style = result.current.style as Record<string, string>
        expect(style['--motion-distance']).toBe('60px')
      })
    })

    describe('useHoverMotion', () => {
      it('should use neutral hover defaults without Provider', () => {
        const { result } = renderHook(() => useHoverMotion())
        // Non-hovered: scale(1) translateY(0px) — check transition for profile duration
        const transition = result.current.style.transition as string
        expect(transition).toContain('200ms') // neutral hover duration
        expect(transition).toContain('ease-out')
      })

      it('should use hua hover defaults with hua Provider', () => {
        const { result } = renderHook(() => useHoverMotion(), {
          wrapper: createWrapper({ profile: 'hua' }),
        })
        const transition = result.current.style.transition as string
        expect(transition).toContain('180ms') // hua hover duration
        expect(transition).toContain('cubic-bezier')
      })

      it('should apply hua hover transform on start', () => {
        const { result } = renderHook(() => useHoverMotion(), {
          wrapper: createWrapper({ profile: 'hua' }),
        })
        // Simulate hover via start()
        act(() => { result.current.start() })
        const transform = result.current.style.transform as string
        expect(transform).toContain('1.008')
        expect(transform).toContain('-1px')
      })
    })
  })

  // ========================================
  // Provider 기본값 동작
  // ========================================

  describe('Provider defaults', () => {
    it('should default to neutral when profile prop is omitted', () => {
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({}),
      })
      expect(result.current.name).toBe('neutral')
    })

    it('should work without overrides prop', () => {
      const { result } = renderHook(() => useMotionProfile(), {
        wrapper: createWrapper({ profile: 'hua' }),
      })
      expect(result.current.name).toBe('hua')
      expect(result.current.base.duration).toBe(640)
    })
  })
})
