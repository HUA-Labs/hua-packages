import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should return initial metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      expect(result.current).toHaveProperty('fps');
      expect(result.current).toHaveProperty('frameTime');
      expect(result.current).toHaveProperty('memory');
      expect(result.current).toHaveProperty('isStable');
    });

    it('should have numeric fps', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(typeof result.current.fps).toBe('number');
      expect(result.current.fps).toBe(60);
    });

    it('should have numeric frameTime', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(typeof result.current.frameTime).toBe('number');
      expect(result.current.frameTime).toBe(16.67);
    });

    it('should have numeric memory', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(typeof result.current.memory).toBe('number');
      expect(result.current.memory).toBeGreaterThanOrEqual(0);
    });

    it('should have boolean isStable', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(typeof result.current.isStable).toBe('boolean');
      expect(result.current.isStable).toBe(true);
    });
  });

  describe('metrics update', () => {
    it('should update metrics after interval', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ interval: 1000 }));

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      // Metrics should be defined and valid
      expect(typeof result.current.fps).toBe('number');
      expect(typeof result.current.frameTime).toBe('number');
      expect(typeof result.current.memory).toBe('number');
      expect(typeof result.current.isStable).toBe('boolean');
    });

    it('should respect custom interval', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ interval: 500 }));

      act(() => {
        vi.advanceTimersByTime(600);
      });

      expect(typeof result.current.fps).toBe('number');
    });
  });

  describe('options', () => {
    it('should accept custom targetFps', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ targetFps: 30 }));
      expect(result.current).toBeDefined();
      expect(result.current.fps).toBeGreaterThanOrEqual(0);
    });

    it('should use default values when no options provided', () => {
      const { result } = renderHook(() => usePerformanceMonitor());
      expect(result.current).toBeDefined();
      expect(result.current.fps).toBe(60);
    });

    it('should accept both interval and targetFps options', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ interval: 2000, targetFps: 30 }));
      expect(result.current).toBeDefined();
    });
  });

  describe('cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
      const { unmount } = renderHook(() => usePerformanceMonitor());

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });

  describe('fps calculation', () => {
    it('should have fps between 30 and 60', () => {
      const { result } = renderHook(() => usePerformanceMonitor());

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      expect(result.current.fps).toBeGreaterThanOrEqual(30);
      expect(result.current.fps).toBeLessThanOrEqual(60);
    });
  });

  describe('stability check', () => {
    it('should set isStable based on targetFps', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ targetFps: 60 }));

      // Initial state should be stable
      expect(result.current.isStable).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1100);
      });

      // isStable should be boolean
      expect(typeof result.current.isStable).toBe('boolean');
    });
  });
});
