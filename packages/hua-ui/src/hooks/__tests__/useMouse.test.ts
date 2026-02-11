import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMouse } from '../useMouse';

describe('useMouse', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: 0,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useMouse());

    expect(result.current.ref).toBeDefined();
    expect(result.current.x).toBe(0);
    expect(result.current.y).toBe(0);
    expect(result.current.elementX).toBe(0);
    expect(result.current.elementY).toBe(0);
    expect(result.current.elementPositionX).toBe(0);
    expect(result.current.elementPositionY).toBe(0);
    expect(result.current.isInside).toBe(false);
    expect(result.current.isMoving).toBe(false);
  });

  it('tracks page coordinates correctly', async () => {
    const { result } = renderHook(() => useMouse({ type: 'page' }));

    Object.defineProperty(window, 'scrollX', { writable: true, value: 100 });
    Object.defineProperty(window, 'scrollY', { writable: true, value: 200 });

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 250,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    await waitFor(() => {
      expect(result.current.x).toBe(250); // 150 + 100
    });

    expect(result.current.y).toBe(450); // 250 + 200
  });

  it('tracks viewport coordinates correctly', async () => {
    const { result } = renderHook(() => useMouse({ type: 'viewport' }));

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 150,
      clientY: 250,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    await waitFor(() => {
      expect(result.current.x).toBe(150);
    });

    expect(result.current.y).toBe(250);
  });

  it('calculates element-relative coordinates', async () => {
    const { result } = renderHook(() => useMouse({ type: 'element' }));

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    // Mock getBoundingClientRect
    mockElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 150,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    await waitFor(() => {
      expect(result.current.elementX).toBe(100); // 200 - 100
    });

    expect(result.current.elementY).toBe(50); // 150 - 100
    expect(result.current.elementPositionX).toBe(0.5); // 100 / 200
    expect(result.current.elementPositionY).toBe(0.25); // 50 / 200
  });

  it('detects when mouse is inside element', async () => {
    const { result } = renderHook(() => useMouse());

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    mockElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 200,
      clientY: 200,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    await waitFor(() => {
      expect(result.current.isInside).toBe(true);
    });
  });

  it('detects when mouse is outside element', async () => {
    const { result } = renderHook(() => useMouse());

    const mockElement = document.createElement('div');
    (result.current.ref as any).current = mockElement;

    mockElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      top: 100,
      right: 300,
      bottom: 300,
      width: 200,
      height: 200,
      x: 100,
      y: 100,
      toJSON: () => {},
    }));

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 50,
      clientY: 50,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    await waitFor(() => {
      expect(result.current.isInside).toBe(false);
    });
  });

  it('sets isMoving to true on mouse move', async () => {
    const { result } = renderHook(() => useMouse());

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    await waitFor(() => {
      expect(result.current.isMoving).toBe(true);
    });
  });

  it('sets isMoving flag correctly', () => {
    const { result } = renderHook(() => useMouse());

    const mouseEvent = new MouseEvent('mousemove', {
      clientX: 100,
      clientY: 100,
    });

    act(() => {
      window.dispatchEvent(mouseEvent);
    });

    // isMoving should be true immediately after movement
    expect(result.current.isMoving).toBe(true);
  });

  it('registers touch event listener when enabled', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');

    renderHook(() => useMouse({ touch: true }));

    expect(addEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function), { passive: true });
  });

  it('applies throttle option', () => {
    // Just verify hook accepts throttle option without errors
    const { result } = renderHook(() => useMouse({ throttle: 50 }));

    expect(result.current).toBeDefined();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMouse());

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
  });

  it('cleans up touch event listeners when enabled', () => {
    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useMouse({ touch: true }));

    unmount();

    expect(removeEventListener).toHaveBeenCalledWith('touchmove', expect.any(Function));
  });
});
