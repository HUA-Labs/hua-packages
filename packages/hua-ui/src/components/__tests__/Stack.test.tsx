import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stack } from '../Stack';

describe('Stack', () => {
  it('should render children', () => {
    render(
      <Stack>
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render vertical by default', () => {
    const { container } = render(<Stack>Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('flex');
    expect(stack).toHaveClass('flex-col');
  });

  it('should render horizontal direction', () => {
    const { container } = render(<Stack direction="horizontal">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('flex');
    expect(stack).toHaveClass('flex-row');
  });

  it('should apply vertical spacing', () => {
    const { container } = render(<Stack spacing="md">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('space-y-6');
  });

  it('should apply horizontal spacing', () => {
    const { container } = render(<Stack direction="horizontal" spacing="lg">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('space-x-8');
  });

  it('should apply align center', () => {
    const { container } = render(<Stack align="center">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('items-center');
  });

  it('should apply align end', () => {
    const { container } = render(<Stack align="end">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('items-end');
  });

  it('should apply align stretch', () => {
    const { container } = render(<Stack align="stretch">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('items-stretch');
  });

  it('should apply justify center', () => {
    const { container } = render(<Stack justify="center">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('justify-center');
  });

  it('should apply justify between', () => {
    const { container } = render(<Stack justify="between">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('justify-between');
  });

  it('should apply wrap when enabled', () => {
    const { container } = render(<Stack wrap>Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('flex-wrap');
  });

  it('should merge custom className', () => {
    const { container } = render(<Stack className="custom-class">Content</Stack>);

    const stack = container.querySelector('div');
    expect(stack).toHaveClass('custom-class');
    expect(stack).toHaveClass('flex');
  });
});
