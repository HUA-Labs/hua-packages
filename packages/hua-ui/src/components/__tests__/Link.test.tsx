import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from '../Link';

describe('Link', () => {
  it('should render with href and children', () => {
    render(<Link href="/about">About</Link>);

    const link = screen.getByText('About');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/about');
  });

  it('should apply default variant and size', () => {
    const { container } = render(<Link href="/">Home</Link>);

    const link = container.querySelector('a');
    expect(link).toHaveDotStyle('text-foreground');
    expect(link).toHaveDotStyle('text-base');
  });

  it('should apply primary variant', () => {
    const { container } = render(<Link href="/" variant="primary">Link</Link>);

    const link = container.querySelector('a');
    expect(link).toHaveDotStyle('text-primary');
  });

  it('should apply underline variant', () => {
    const { container } = render(<Link href="/" variant="underline">Link</Link>);

    const link = container.querySelector('a');
    expect(link).toHaveDotStyle('underline');
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<Link href="/" size="sm">Link</Link>);

    const smallLink = container.querySelector('a');
    expect(smallLink).toHaveDotStyle('text-sm');

    rerender(<Link href="/" size="lg">Link</Link>);
    const largeLink = container.querySelector('a');
    expect(largeLink).toHaveDotStyle('text-lg');
  });

  it('should set target and rel for external links', () => {
    render(<Link href="https://example.com" external>External</Link>);

    const link = screen.getByText('External');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not set target for internal links', () => {
    render(<Link href="/page">Internal</Link>);

    const link = screen.getByText('Internal');
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('should call onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Link href="/" onClick={handleClick}>Clickable</Link>);

    await user.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(<Link href="/" className="custom-link">Link</Link>);

    expect(container.querySelector('.custom-link')).toBeInTheDocument();
  });
});
