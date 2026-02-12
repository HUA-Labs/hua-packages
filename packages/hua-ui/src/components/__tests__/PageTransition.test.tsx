import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { PageTransition } from '../PageTransition';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('PageTransition', () => {
  it('should show loading state initially', () => {
    render(<PageTransition>Content</PageTransition>);

    expect(screen.getByText('페이지 로딩 중...')).toBeInTheDocument();
  });

  it('should show custom loading text', () => {
    render(<PageTransition loadingText="Please wait...">Content</PageTransition>);

    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('should show content after duration', () => {
    render(<PageTransition duration={300}>Page Content</PageTransition>);

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should not show loading when showLoading is false', () => {
    render(
      <PageTransition showLoading={false}>
        Immediate Content
      </PageTransition>
    );

    // Content should be visible even during loading phase
    expect(screen.queryByText('페이지 로딩 중...')).not.toBeInTheDocument();
  });

  it('should call onTransitionStart', () => {
    const handleStart = vi.fn();

    render(
      <PageTransition onTransitionStart={handleStart}>
        Content
      </PageTransition>
    );

    expect(handleStart).toHaveBeenCalledTimes(1);
  });

  it('should call onTransitionEnd after duration', () => {
    const handleEnd = vi.fn();

    render(
      <PageTransition duration={200} onTransitionEnd={handleEnd}>
        Content
      </PageTransition>
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(handleEnd).toHaveBeenCalledTimes(1);
  });

  it('should apply fade variant classes', () => {
    const { container } = render(
      <PageTransition variant="fade" showLoading={false}>
        Content
      </PageTransition>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('transition-opacity');
  });

  it('should apply slide variant classes', () => {
    const { container } = render(
      <PageTransition variant="slide" showLoading={false}>
        Content
      </PageTransition>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('transition-transform');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PageTransition className="my-transition" showLoading={false}>
        Content
      </PageTransition>
    );

    expect(container.querySelector('.my-transition')).toBeInTheDocument();
  });

  it('should set transition duration style', () => {
    const { container } = render(
      <PageTransition duration={500} showLoading={false}>
        Content
      </PageTransition>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transitionDuration).toBe('500ms');
  });
});
