import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<LoadingSpinner size="sm" />);
    expect(container.querySelector('.w-6')).toBeInTheDocument();

    rerender(<LoadingSpinner size="lg" />);
    expect(container.querySelector('.w-12')).toBeInTheDocument();

    rerender(<LoadingSpinner size="xl" />);
    expect(container.querySelector('.w-16')).toBeInTheDocument();
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

    const dots = container.querySelectorAll('.rounded-full.bg-current');
    expect(dots.length).toBe(3);
  });

  it('should render bars variant', () => {
    const { container } = render(<LoadingSpinner variant="bars" />);

    const bars = container.querySelectorAll('.bg-current.rounded-sm');
    expect(bars.length).toBe(5);
  });

  it('should render ring variant', () => {
    const { container } = render(<LoadingSpinner variant="ring" />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render ripple variant', () => {
    const { container } = render(<LoadingSpinner variant="ripple" />);

    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('should apply color variants', () => {
    const { container, rerender } = render(<LoadingSpinner color="primary" />);
    expect(container.querySelector('.border-primary\\/30')).toBeInTheDocument();

    rerender(<LoadingSpinner color="success" />);
    expect(container.querySelector('.border-green-300')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="my-spinner" />);

    expect(container.querySelector('.my-spinner')).toBeInTheDocument();
  });
});
