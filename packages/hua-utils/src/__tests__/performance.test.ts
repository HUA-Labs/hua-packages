import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, memoize, delay, retry } from '../performance';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should only call function once for multiple rapid calls', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should reset timer on each call', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced(); // reset timer
    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50); // now total 100ms from last call
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should pass arguments to debounced function', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call function immediately on first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should ignore calls within throttle period', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should allow calls after throttle period', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to throttled function', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled('arg1', 'arg2');
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

describe('memoize', () => {
  it('should cache function results', () => {
    const fn = vi.fn((x: number) => x * 2);
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(5)).toBe(10);
    expect(fn).toHaveBeenCalledOnce(); // cached second call
  });

  it('should call function for different arguments', () => {
    const fn = vi.fn((x: number) => x * 2);
    const memoized = memoize(fn);

    expect(memoized(5)).toBe(10);
    expect(memoized(10)).toBe(20);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should use custom resolver', () => {
    const fn = vi.fn((a: number, b: number) => a + b);
    const memoized = memoize(fn, (a, b) => `${a}-${b}`);

    expect(memoized(1, 2)).toBe(3);
    expect(memoized(1, 2)).toBe(3);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should handle multiple arguments', () => {
    const fn = vi.fn((a: number, b: number, c: number) => a + b + c);
    const memoized = memoize(fn);

    expect(memoized(1, 2, 3)).toBe(6);
    expect(memoized(1, 2, 3)).toBe(6);
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should resolve after specified time', async () => {
    const promise = delay(1000);
    const callback = vi.fn();
    promise.then(callback);

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    await promise;
    expect(callback).toHaveBeenCalled();
  });

  it('should resolve with undefined', async () => {
    const promise = delay(100);
    vi.advanceTimersByTime(100);
    const result = await promise;
    expect(result).toBeUndefined();
  });
});

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return result on first success', async () => {
    const fn = vi.fn(async () => 'success');
    const promise = retry(fn);

    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should retry on failure', async () => {
    let attempt = 0;
    const fn = vi.fn(async () => {
      attempt++;
      if (attempt < 3) throw new Error('fail');
      return 'success';
    });

    const promise = retry(fn, 3, 100);
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw error after max attempts', async () => {
    const fn = vi.fn(async () => {
      throw new Error('always fails');
    });

    // Create promise with immediate error handler to prevent unhandled rejection
    const promise = retry(fn, 3, 100).catch(err => err);
    await vi.runAllTimersAsync();

    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should use exponential backoff', async () => {
    let attempt = 0;
    const fn = vi.fn(async () => {
      attempt++;
      throw new Error('fail');
    });

    // Create promise and attach error handler immediately
    const promise = retry(fn, 3, 100).catch(err => err);

    // First attempt: immediate
    expect(fn).toHaveBeenCalledTimes(1);

    // Wait for first backoff (100ms * 1)
    await vi.advanceTimersByTimeAsync(100);
    expect(fn).toHaveBeenCalledTimes(2);

    // Wait for second backoff (100ms * 2)
    await vi.advanceTimersByTimeAsync(200);
    expect(fn).toHaveBeenCalledTimes(3);

    // Verify the error was thrown
    const error = await promise;
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('fail');
  });
});
