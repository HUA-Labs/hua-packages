/**
 * @hua-labs/hua-ux/framework - useMotion Hook Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMotion } from '../../hooks/useMotion';

// motion-core의 useUnifiedMotion 모킹
const mockMotionResult = {
  ref: { current: null },
  style: { opacity: 0 },
  isVisible: false,
  isAnimating: false,
  progress: 0,
  start: vi.fn(),
  reset: vi.fn(),
  stop: vi.fn(),
};

vi.mock('@hua-labs/motion-core', () => ({
  useUnifiedMotion: vi.fn(() => mockMotionResult),
}));

describe('useMotion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call useUnifiedMotion with correct options', async () => {
    const { useUnifiedMotion } = await import('@hua-labs/motion-core');

    renderHook(() =>
      useMotion({
        type: 'fadeIn',
        duration: 600,
        delay: 100,
        easing: 'ease-in-out',
      })
    );

    expect(useUnifiedMotion).toHaveBeenCalledWith({
      type: 'fadeIn',
      duration: 600,
      delay: 100,
      easing: 'ease-in-out',
      autoStart: undefined,
    });
  });

  it('should return motion result', () => {
    const { result } = renderHook(() =>
      useMotion({
        type: 'fadeIn',
        duration: 600,
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.ref).toBeDefined();
    expect(result.current.start).toBeDefined();
    expect(result.current.reset).toBeDefined();
    expect(result.current.stop).toBeDefined();
  });

  it('should pass all motion types to useUnifiedMotion', async () => {
    const { useUnifiedMotion } = await import('@hua-labs/motion-core');

    const types = ['fadeIn', 'slideUp', 'slideLeft', 'slideRight', 'scaleIn', 'bounceIn'] as const;

    for (const type of types) {
      vi.clearAllMocks();
      renderHook(() =>
        useMotion({
          type,
          duration: 600,
        })
      );

      expect(useUnifiedMotion).toHaveBeenCalledWith(
        expect.objectContaining({
          type,
        })
      );
    }
  });

  it('should handle autoStart option', async () => {
    const { useUnifiedMotion } = await import('@hua-labs/motion-core');

    renderHook(() =>
      useMotion({
        type: 'fadeIn',
        duration: 600,
        autoStart: true,
      })
    );

    expect(useUnifiedMotion).toHaveBeenCalledWith(
      expect.objectContaining({
        autoStart: true,
      })
    );
  });
});
