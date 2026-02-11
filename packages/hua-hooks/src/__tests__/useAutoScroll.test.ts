import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoScroll } from '../useAutoScroll';

describe('useAutoScroll', () => {
  describe('initial state', () => {
    it('should return containerRef', () => {
      const { result } = renderHook(() => useAutoScroll());
      expect(result.current.containerRef).toBeDefined();
      expect(result.current.containerRef.current).toBeNull();
    });

    it('should start with isAtBottom true', () => {
      const { result } = renderHook(() => useAutoScroll());
      expect(result.current.isAtBottom).toBe(true);
    });

    it('should provide setIsAtBottom function', () => {
      const { result } = renderHook(() => useAutoScroll());
      expect(typeof result.current.setIsAtBottom).toBe('function');
    });

    it('should provide scrollToBottom function', () => {
      const { result } = renderHook(() => useAutoScroll());
      expect(typeof result.current.scrollToBottom).toBe('function');
    });
  });

  describe('setIsAtBottom', () => {
    it('should update isAtBottom state', () => {
      const { result } = renderHook(() => useAutoScroll());

      act(() => {
        result.current.setIsAtBottom(false);
      });
      expect(result.current.isAtBottom).toBe(false);

      act(() => {
        result.current.setIsAtBottom(true);
      });
      expect(result.current.isAtBottom).toBe(true);
    });
  });

  describe('scrollToBottom', () => {
    it('should not throw when containerRef is null', () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(() => {
        act(() => {
          result.current.scrollToBottom();
        });
      }).not.toThrow();
    });
  });

  describe('options', () => {
    it('should accept custom threshold', () => {
      const { result } = renderHook(() => useAutoScroll([], { threshold: 50 }));
      expect(result.current).toBeDefined();
      expect(result.current.containerRef).toBeDefined();
    });

    it('should accept smooth option', () => {
      const { result } = renderHook(() => useAutoScroll([], { smooth: false }));
      expect(result.current).toBeDefined();
      expect(result.current.containerRef).toBeDefined();
    });

    it('should accept both threshold and smooth options', () => {
      const { result } = renderHook(() => useAutoScroll([], { threshold: 20, smooth: true }));
      expect(result.current).toBeDefined();
    });
  });

  describe('deps', () => {
    it('should accept deps array', () => {
      const { result, rerender } = renderHook(
        ({ deps }) => useAutoScroll(deps),
        { initialProps: { deps: [1] } }
      );

      expect(result.current).toBeDefined();

      // Re-render with new deps
      rerender({ deps: [2] });
      expect(result.current).toBeDefined();
    });

    it('should work without deps', () => {
      const { result } = renderHook(() => useAutoScroll());
      expect(result.current).toBeDefined();
    });

    it('should work with empty deps array', () => {
      const { result } = renderHook(() => useAutoScroll([]));
      expect(result.current).toBeDefined();
    });
  });

  describe('return value', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(result.current).toHaveProperty('containerRef');
      expect(result.current).toHaveProperty('isAtBottom');
      expect(result.current).toHaveProperty('setIsAtBottom');
      expect(result.current).toHaveProperty('scrollToBottom');
    });

    it('should have correct types', () => {
      const { result } = renderHook(() => useAutoScroll());

      expect(typeof result.current.containerRef).toBe('object');
      expect(typeof result.current.isAtBottom).toBe('boolean');
      expect(typeof result.current.setIsAtBottom).toBe('function');
      expect(typeof result.current.scrollToBottom).toBe('function');
    });
  });
});
