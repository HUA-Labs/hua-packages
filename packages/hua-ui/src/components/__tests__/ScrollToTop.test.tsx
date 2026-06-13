import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollToTop } from '../ScrollToTop';

describe('ScrollToTop', () => {
  it('should render a button', () => {
    render(<ScrollToTop />);
    expect(screen.getByRole('button', { name: 'Scroll to top' })).toBeInTheDocument();
  });

  it('should have aria-label', () => {
    render(<ScrollToTop />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Scroll to top');
  });

  it('should apply size variants', () => {
    const { rerender } = render(<ScrollToTop size="sm" />);
    expect(screen.getByRole('button')).toHaveDotStyle('w-8');

    rerender(<ScrollToTop size="lg" />);
    expect(screen.getByRole('button')).toHaveDotStyle('w-12');
  });

  it('should apply variant styles', () => {
    const { rerender } = render(<ScrollToTop variant="primary" />);
    expect(screen.getByRole('button').style.backgroundColor).toContain('color-mix');

    rerender(<ScrollToTop variant="ghost" />);
    expect(screen.getByRole('button').style.backgroundColor).toBe('transparent');
  });

  it('should be hidden by default (not scrolled)', () => {
    render(<ScrollToTop />);
    expect(screen.getByRole('button')).toHaveDotStyle('opacity-0');
  });

  it('should apply custom className', () => {
    render(<ScrollToTop className="custom-scroll" />);
    expect(screen.getByRole('button')).toHaveDotStyle('custom-scroll');
  });

  it('should have fixed positioning', () => {
    render(<ScrollToTop />);
    expect(screen.getByRole('button')).toHaveDotStyle('fixed');
  });
});
