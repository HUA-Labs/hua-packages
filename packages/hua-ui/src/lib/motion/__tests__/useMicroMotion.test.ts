import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMicroMotion, getMicroMotionClasses } from '../useMicroMotion';

describe('getMicroMotionClasses (pure function)', () => {
  it('returns base classes for all presets', () => {
    const presets = ['subtle', 'soft', 'springy', 'bouncy', 'snappy'] as const;

    presets.forEach((preset) => {
      const classes = getMicroMotionClasses(preset);

      expect(classes).toContain('transform-gpu');
      expect(classes).toContain('transition-transform');
    });
  });

  it('maps presets to correct duration classes', () => {
    expect(getMicroMotionClasses('subtle')).toContain('duration-150');
    expect(getMicroMotionClasses('soft')).toContain('duration-250');
    expect(getMicroMotionClasses('springy')).toContain('duration-200');
    expect(getMicroMotionClasses('bouncy')).toContain('duration-300');
    expect(getMicroMotionClasses('snappy')).toContain('duration-150');
  });

  it('includes hover classes by default', () => {
    const classes = getMicroMotionClasses('springy');

    expect(classes).toContain('hover:scale-[1.02]');
    expect(classes).toContain('hover:-translate-y-0.5');
  });

  it('excludes hover classes when enableHover is false', () => {
    const classes = getMicroMotionClasses('springy', { enableHover: false });

    expect(classes).not.toContain('hover:scale-[1.02]');
    expect(classes).not.toContain('hover:-translate-y-0.5');
  });

  it('includes active classes by default', () => {
    const classes = getMicroMotionClasses('springy');

    expect(classes).toContain('active:scale-[0.98]');
    expect(classes).toContain('active:translate-y-0');
  });

  it('excludes active classes when enableActive is false', () => {
    const classes = getMicroMotionClasses('springy', { enableActive: false });

    expect(classes).not.toContain('active:scale-[0.98]');
    expect(classes).not.toContain('active:translate-y-0');
  });

  it('excludes focus classes by default', () => {
    const classes = getMicroMotionClasses('springy');

    expect(classes).not.toContain('focus:scale-[1.01]');
  });

  it('includes focus classes when enableFocus is true', () => {
    const classes = getMicroMotionClasses('springy', { enableFocus: true });

    expect(classes).toContain('focus:scale-[1.01]');
  });

  it('handles all options combined', () => {
    const classes = getMicroMotionClasses('bouncy', {
      enableHover: false,
      enableActive: false,
      enableFocus: true,
    });

    expect(classes).toContain('transform-gpu');
    expect(classes).toContain('transition-transform');
    expect(classes).toContain('duration-300');
    expect(classes).not.toContain('hover:scale-[1.02]');
    expect(classes).not.toContain('active:scale-[0.98]');
    expect(classes).toContain('focus:scale-[1.01]');
  });
});

describe('useMicroMotion (hook)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns state, style, handlers, and className', () => {
    const { result } = renderHook(() => useMicroMotion());

    expect(result.current.state).toBeDefined();
    expect(result.current.style).toBeDefined();
    expect(result.current.handlers).toBeDefined();
    expect(result.current.className).toBeDefined();
  });

  it('has initial state with all flags false', () => {
    const { result } = renderHook(() => useMicroMotion());

    expect(result.current.state.isHovered).toBe(false);
    expect(result.current.state.isPressed).toBe(false);
    expect(result.current.state.isFocused).toBe(false);
    expect(result.current.state.isAnimating).toBe(false);
  });

  it('sets isHovered to true on mouse enter', () => {
    const { result } = renderHook(() => useMicroMotion({ enableHover: true }));

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.state.isHovered).toBe(true);
    expect(result.current.state.isAnimating).toBe(true);
  });

  it('sets isHovered to false on mouse leave', () => {
    const { result } = renderHook(() => useMicroMotion({ enableHover: true }));

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.state.isHovered).toBe(true);

    act(() => {
      result.current.handlers.onMouseLeave();
    });

    expect(result.current.state.isHovered).toBe(false);
  });

  it('sets isPressed to true on mouse down', () => {
    const { result } = renderHook(() => useMicroMotion({ enablePress: true }));

    act(() => {
      result.current.handlers.onMouseDown();
    });

    expect(result.current.state.isPressed).toBe(true);
    expect(result.current.state.isAnimating).toBe(true);
  });

  it('sets isPressed to false on mouse up', () => {
    const { result } = renderHook(() => useMicroMotion({ enablePress: true }));

    act(() => {
      result.current.handlers.onMouseDown();
    });

    expect(result.current.state.isPressed).toBe(true);

    act(() => {
      result.current.handlers.onMouseUp();
    });

    expect(result.current.state.isPressed).toBe(false);
  });

  it('sets isFocused to true on focus', () => {
    const { result } = renderHook(() => useMicroMotion({ enableFocus: true }));

    act(() => {
      result.current.handlers.onFocus();
    });

    expect(result.current.state.isFocused).toBe(true);
    expect(result.current.state.isAnimating).toBe(true);
  });

  it('sets isFocused to false on blur', () => {
    const { result } = renderHook(() => useMicroMotion({ enableFocus: true }));

    act(() => {
      result.current.handlers.onFocus();
    });

    expect(result.current.state.isFocused).toBe(true);

    act(() => {
      result.current.handlers.onBlur();
    });

    expect(result.current.state.isFocused).toBe(false);
  });

  it('does not respond to hover when enableHover is false', () => {
    const { result } = renderHook(() => useMicroMotion({ enableHover: false }));

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.state.isHovered).toBe(false);
  });

  it('does not respond to press when enablePress is false', () => {
    const { result } = renderHook(() => useMicroMotion({ enablePress: false }));

    act(() => {
      result.current.handlers.onMouseDown();
    });

    expect(result.current.state.isPressed).toBe(false);
  });

  it('does not respond to focus when enableFocus is false', () => {
    const { result } = renderHook(() => useMicroMotion({ enableFocus: false }));

    act(() => {
      result.current.handlers.onFocus();
    });

    expect(result.current.state.isFocused).toBe(false);
  });

  it('applies transform on hover', () => {
    const { result } = renderHook(() =>
      useMicroMotion({ enableHover: true, scale: 0.02, translateY: -2 })
    );

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.style.transform).toContain('scale(1.02)');
    expect(result.current.style.transform).toContain('translateY(-2px)');
  });

  it('applies transform on press', () => {
    const { result } = renderHook(() =>
      useMicroMotion({ enablePress: true, scale: 0.02 })
    );

    act(() => {
      result.current.handlers.onMouseDown();
    });

    expect(result.current.style.transform).toContain('scale(0.99)'); // 1 - 0.02 * 0.5
  });

  it('applies no transform when disabled', () => {
    const { result } = renderHook(() => useMicroMotion({ disabled: true }));

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.style.transform).toBe('none');
    expect(result.current.style.transition).toBe('none');
  });

  it('uses custom duration', () => {
    const { result } = renderHook(() => useMicroMotion({ duration: 500 }));

    expect(result.current.style.transition).toContain('500ms');
  });

  it('uses custom delay', () => {
    const { result } = renderHook(() => useMicroMotion({ delay: 100 }));

    expect(result.current.style.transition).toContain('100ms');
  });

  it('uses preset easing function', () => {
    const { result } = renderHook(() => useMicroMotion({ preset: 'springy' }));

    expect(result.current.style.transition).toContain('cubic-bezier');
  });

  it('applies translateX when specified', () => {
    const { result } = renderHook(() =>
      useMicroMotion({ enableHover: true, translateX: 5 })
    );

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.style.transform).toContain('translateX(5px)');
  });

  it('applies rotate when specified', () => {
    const { result } = renderHook(() =>
      useMicroMotion({ enableHover: true, rotate: 10 })
    );

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.style.transform).toContain('rotate(10deg)');
  });

  it('sets willChange to transform when animating', () => {
    const { result } = renderHook(() => useMicroMotion({ enableHover: true }));

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    expect(result.current.state.isAnimating).toBe(true);
    expect(result.current.style.willChange).toBe('transform');
  });

  it('returns transform-gpu className when not disabled', () => {
    const { result } = renderHook(() => useMicroMotion());

    expect(result.current.className).toContain('transform-gpu');
  });

  it('returns empty className when disabled', () => {
    const { result } = renderHook(() => useMicroMotion({ disabled: true }));

    expect(result.current.className).toBe('');
  });

  it('clears isPressed on mouse leave', () => {
    const { result } = renderHook(() =>
      useMicroMotion({ enableHover: true, enablePress: true })
    );

    act(() => {
      result.current.handlers.onMouseEnter();
      result.current.handlers.onMouseDown();
    });

    expect(result.current.state.isPressed).toBe(true);

    act(() => {
      result.current.handlers.onMouseLeave();
    });

    expect(result.current.state.isPressed).toBe(false);
    expect(result.current.state.isHovered).toBe(false);
  });

  it('handles all presets', () => {
    const presets = ['subtle', 'soft', 'springy', 'bouncy', 'snappy'] as const;

    presets.forEach((preset) => {
      const { result } = renderHook(() => useMicroMotion({ preset }));

      expect(result.current.style.transition).toBeDefined();
    });
  });

  it('cleans up timeout on unmount', () => {
    vi.useFakeTimers();

    const { result, unmount } = renderHook(() => useMicroMotion({ enableHover: true }));

    act(() => {
      result.current.handlers.onMouseEnter();
    });

    unmount();

    // Should not throw
    act(() => {
      vi.runAllTimers();
    });

    vi.useRealTimers();
  });
});
