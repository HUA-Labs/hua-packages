import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';

describe('Badge', () => {
  it('should render with text content', () => {
    render(<Badge>New</Badge>);

    const badge = screen.getByText('New');
    expect(badge).toBeInTheDocument();
  });

  it('should apply default variant classes', () => {
    const { container } = render(<Badge>Default</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('bg-[var(--badge-default-bg)]');
    expect(badge).toHaveClass('text-[var(--badge-default-text)]');
  });

  it('should apply secondary variant classes', () => {
    const { container } = render(<Badge variant="secondary">Secondary</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('bg-[var(--badge-secondary-bg)]');
    expect(badge).toHaveClass('text-[var(--badge-secondary-text)]');
  });

  it('should apply destructive variant classes', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('bg-[var(--badge-destructive-bg)]');
  });

  it('should apply error variant classes', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('bg-[var(--badge-destructive-bg)]');
  });

  it('should apply outline variant classes', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('bg-transparent');
    expect(badge).toHaveClass('text-[var(--badge-outline-text)]');
  });

  it('should apply glass variant classes', () => {
    const { container } = render(<Badge variant="glass">Glass</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('bg-[var(--badge-glass-bg)]');
    expect(badge).toHaveClass('backdrop-blur-sm');
  });

  it('should merge custom className', () => {
    const { container } = render(<Badge className="custom-class">Badge</Badge>);

    const badge = container.querySelector('div');
    expect(badge).toHaveClass('custom-class');
    expect(badge).toHaveClass('inline-flex');
  });
});
