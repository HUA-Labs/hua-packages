/**
 * @hua-labs/hua-ux/framework - ErrorBoundary Component Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// 에러를 발생시키는 컴포넌트
function ThrowError({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // console.error를 모킹하여 테스트 중 에러 로그 방지
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render default fallback when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/오류가 발생했습니다|An error occurred/)).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should support function fallback with error and reset', () => {
    const fallbackFn = vi.fn((error, reset) => (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={reset}>Reset</button>
      </div>
    ));

    render(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(fallbackFn).toHaveBeenCalled();
    expect(fallbackFn).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Function)
    );
  });

  it('should reset error state when reset is called', () => {
    const fallbackFn = (error: Error, reset: () => void) => (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={reset}>Reset</button>
      </div>
    );

    const { rerender } = render(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    // Reset 버튼 클릭 시뮬레이션
    const resetButton = screen.getByText('Reset');
    resetButton.click();

    // 에러가 리셋되어 children이 다시 렌더링되어야 함
    rerender(
      <ErrorBoundary fallback={fallbackFn}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should call onReset callback when reset is called', () => {
    const onReset = vi.fn();
    const fallbackFn = (error: Error, reset: () => void) => (
      <button onClick={reset}>Reset</button>
    );

    render(
      <ErrorBoundary fallback={fallbackFn} onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByText('Reset');
    resetButton.click();

    expect(onReset).toHaveBeenCalled();
  });
});
