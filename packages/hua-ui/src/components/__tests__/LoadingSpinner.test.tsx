import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);

    const spinner = container.firstElementChild?.firstElementChild?.firstElementChild as HTMLElement;
    expect(spinner?.style.animation).toContain('spin');
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    expect((container.firstElementChild?.firstElementChild as HTMLElement).style.width).toBe('24px');

    rerender(<LoadingSpinner size="lg" />);
    expect((container.firstElementChild?.firstElementChild as HTMLElement).style.width).toBe('48px');

    rerender(<LoadingSpinner size="xl" />);
    expect((container.firstElementChild?.firstElementChild as HTMLElement).style.width).toBe('64px');
  });

  it('should display text', () => {
    render(<LoadingSpinner text="Loading..." />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should not display text by default', () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('should render dots variant', () => {
    const { container } = render(<LoadingSpinner variant="dots" />);

    const dots = container.querySelectorAll('div[style*="animation-delay"]');
    expect(dots.length).toBe(3);
  });

  it('should render bars variant', () => {
    const { container } = render(<LoadingSpinner variant="bars" />);

    const bars = container.querySelectorAll('div[style*="barWave"]');
    expect(bars.length).toBe(5);
  });

  it('should render ring variant', () => {
    const { container } = render(<LoadingSpinner variant="ring" />);

    const spinner = container.firstElementChild?.firstElementChild?.firstElementChild as HTMLElement;
    expect(spinner?.style.animation).toContain('spin');
  });

  it('should render ripple variant', () => {
    const { container } = render(<LoadingSpinner variant="ripple" />);

    const ping = container.querySelector('div[style*="ping"]');
    expect(ping).toBeInTheDocument();
  });

  it('should apply color variants', () => {
    const { container, rerender } = render(<LoadingSpinner color="primary" />);
    let spinner = container.firstElementChild?.firstElementChild?.firstElementChild as HTMLElement;
    expect(spinner.style.borderTopColor).toContain('var(--color-primary)');

    rerender(<LoadingSpinner color="success" />);
    spinner = container.firstElementChild?.firstElementChild?.firstElementChild as HTMLElement;
    expect(spinner.style.borderColor).toContain('rgb(95, 190, 131)');
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="my-spinner" />);

    expect(container.querySelector('.my-spinner')).toBeInTheDocument();
  });
});
