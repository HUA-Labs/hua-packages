import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Text } from '../Text';

vi.mock('@hua-labs/dot', () => ({
  dot: (input: string) => {
    const styles: Record<string, Record<string, string>> = {
      'text-lg': { fontSize: '1.125rem' },
      'font-bold': { fontWeight: '700' },
    };
    const result: Record<string, string> = {};
    for (const token of input.split(/\s+/)) {
      Object.assign(result, styles[token] ?? {});
    }
    return result;
  },
}));

describe('Text', () => {
  it('should render children', () => {
    render(<Text>Hello Text</Text>);
    expect(screen.getByText('Hello Text')).toBeInTheDocument();
  });

  it('should render span by default', () => {
    const { container } = render(<Text>Content</Text>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });

  it('should render as heading via as prop', () => {
    render(<Text as="h1">Title</Text>);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should render as paragraph', () => {
    const { container } = render(<Text as="p">Paragraph</Text>);
    expect(container.querySelector('p')).toBeInTheDocument();
    expect(container.querySelector('span')).toBeNull();
  });

  it('should apply dot styles', () => {
    const { container } = render(<Text dot="text-lg font-bold">Content</Text>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontSize).toBe('1.125rem');
    expect(el.style.fontWeight).toBe('700');
  });

  it('should merge style override', () => {
    const { container } = render(
      <Text dot="text-lg" style={{ color: 'blue' }}>Content</Text>
    );
    const el = container.firstChild as HTMLElement;
    expect(el.style.fontSize).toBe('1.125rem');
    expect(el.style.color).toBe('blue');
  });

  it('should forward ref', () => {
    const ref = createRef<HTMLElement>();
    render(<Text ref={ref}>Content</Text>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('SPAN');
  });
});
