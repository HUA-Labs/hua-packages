import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { Pressable } from '../Pressable';

vi.mock('@hua-labs/dot', () => ({
  dot: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      'px-3': { paddingLeft: '0.75rem', paddingRight: '0.75rem' },
      'py-1': { paddingTop: '0.25rem', paddingBottom: '0.25rem' },
    };
    const result: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      Object.assign(result, styles[token] ?? {});
    }
    return result;
  },
  dotMap: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      'px-3': { paddingLeft: '0.75rem', paddingRight: '0.75rem' },
      'py-1': { paddingTop: '0.25rem', paddingBottom: '0.25rem' },
    };
    const base: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      if (!token.includes(':')) {
        Object.assign(base, styles[token] ?? {});
      }
    }
    return { base };
  },
}));

describe('Pressable', () => {
  it('should render button element', () => {
    render(<Pressable>Click me</Pressable>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should have type="button" by default', () => {
    render(<Pressable>Click</Pressable>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Pressable onClick={handleClick}>Click</Pressable>);
    await user.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Pressable disabled>Disabled</Pressable>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-disabled', 'true');
  });

  it('should apply dot styles', () => {
    render(<Pressable dot="px-3 py-1">Click</Pressable>);
    const btn = screen.getByRole('button');
    expect(btn.style.paddingLeft).toBe('0.75rem');
  });

  it('should merge style override', () => {
    render(<Pressable dot="px-3" style={{ color: 'green' }}>Click</Pressable>);
    const btn = screen.getByRole('button');
    expect(btn.style.paddingLeft).toBe('0.75rem');
    expect(btn.style.color).toBe('green');
  });

  it('should render as child element with asChild', () => {
    render(
      <Pressable asChild dot="px-3">
        <a href="/test">Link</a>
      </Pressable>
    );
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test');
  });

  it('should forward ref', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Pressable ref={ref}>Click</Pressable>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
