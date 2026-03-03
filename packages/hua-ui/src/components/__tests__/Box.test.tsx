import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Box } from '../Box';

vi.mock('@hua-labs/dot', () => ({
  dot: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      'p-4': { padding: '1rem' },
      'flex': { display: 'flex' },
    };
    const result: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      Object.assign(result, styles[token] ?? {});
    }
    return result;
  },
}));

describe('Box', () => {
  it('should render children', () => {
    render(<Box>Hello Box</Box>);
    expect(screen.getByText('Hello Box')).toBeInTheDocument();
  });

  it('should render div by default', () => {
    const { container } = render(<Box>Content</Box>);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('should render as different element via as prop', () => {
    const { container } = render(<Box as="section">Content</Box>);
    expect(container.querySelector('section')).toBeInTheDocument();
    expect(container.querySelector('div')).toBeNull();
  });

  it('should apply dot styles', () => {
    const { container } = render(<Box dot="p-4">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.padding).toBe('1rem');
  });

  it('should merge style override', () => {
    const { container } = render(
      <Box dot="p-4" style={{ color: 'red' }}>Content</Box>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.padding).toBe('1rem');
    expect(el.style.color).toBe('red');
  });

  it('should forward ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Box ref={ref}>Content</Box>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('DIV');
  });

  it('should pass through HTML attributes', () => {
    render(<Box data-testid="my-box" aria-label="box">Content</Box>);
    const el = screen.getByTestId('my-box');
    expect(el).toHaveAttribute('aria-label', 'box');
  });
});
