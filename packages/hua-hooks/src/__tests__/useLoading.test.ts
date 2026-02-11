import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLoading } from '../useLoading';

describe('useLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('should start with loading false by default', () => {
      const { result } = renderHook(() => useLoading());
      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
    });

    it('should start with loading true when initialLoading is true', () => {
      const { result } = renderHook(() => useLoading({ initialLoading: true }));
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('startLoading / stopLoading', () => {
    it('should set loading to true without delay', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.startLoading();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading message', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.startLoading('Loading data...');
      });

      expect(result.current.loadingMessage).toBe('Loading data...');
    });

    it('should stop loading', () => {
      const { result } = renderHook(() => useLoading());

      act(() => {
        result.current.startLoading('test');
      });

      act(() => {
        result.current.stopLoading();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
    });

    it('should respect delay option', () => {
      const { result } = renderHook(() => useLoading({ delay: 500 }));

      act(() => {
        result.current.startLoading('Loading...');
      });

      // Before delay, loading should still be false
      expect(result.current.isLoading).toBe(false);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // After delay, loading should be true
      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBe('Loading...');
    });
  });

  describe('withLoading', () => {
    it('should wrap async function with loading state', async () => {
      const { result } = renderHook(() => useLoading());

      let resolvePromise: (value: string) => void;
      const asyncFn = () => new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      let promise: Promise<string>;
      act(() => {
        promise = result.current.withLoading(asyncFn, 'Processing...');
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.loadingMessage).toBe('Processing...');

      await act(async () => {
        resolvePromise!('done');
        await promise!;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should return the result of async function', async () => {
      const { result } = renderHook(() => useLoading());

      let returnValue: string;
      await act(async () => {
        returnValue = await result.current.withLoading(
          async () => 'result-value'
        );
      });

      expect(returnValue!).toBe('result-value');
    });

    it('should stop loading even if async function throws', async () => {
      const { result } = renderHook(() => useLoading());

      await act(async () => {
        try {
          await result.current.withLoading(async () => {
            throw new Error('test error');
          });
        } catch (e) {
          // expected
        }
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should work without message parameter', async () => {
      const { result } = renderHook(() => useLoading());

      await act(async () => {
        await result.current.withLoading(async () => 'result');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.loadingMessage).toBe('');
    });
  });
});
