import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Divider } from '../Divider';

describe('Divider', () => {
  it('should render horizontal by default', () => {
    const { container } = render(<Divider />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('w-full');
  });

  it('should render vertical orientation', () => {
    const { container } = render(<Divider orientation="vertical" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('h-full');
  });

  it('should apply solid variant by default', () => {
    const { container } = render(<Divider />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('bg-border');
  });

  it('should apply dashed variant', () => {
    const { container } = render(<Divider variant="dashed" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('border-dashed');
  });

  it('should apply dotted variant', () => {
    const { container } = render(<Divider variant="dotted" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('border-dotted');
  });

  it('should apply gradient variant for horizontal', () => {
    const { container } = render(<Divider variant="gradient" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('bg-gradient-to-r');
  });

  it('should apply gradient variant for vertical', () => {
    const { container } = render(<Divider variant="gradient" orientation="vertical" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('bg-gradient-to-b');
  });

  it('should apply glass variant', () => {
    const { container } = render(<Divider variant="glass" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('via-white/30');
  });

  it('should apply small size', () => {
    const { container } = render(<Divider size="sm" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('h-px');
  });

  it('should apply medium size', () => {
    const { container } = render(<Divider size="md" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('h-0.5');
  });

  it('should apply large size', () => {
    const { container } = render(<Divider size="lg" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('h-1');
  });

  it('should apply default color', () => {
    const { container } = render(<Divider color="default" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('bg-border');
  });

  it('should apply primary color', () => {
    const { container } = render(<Divider color="primary" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('bg-primary/30');
  });

  it('should apply spacing for horizontal', () => {
    const { container } = render(<Divider spacing="lg" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('my-8');
  });

  it('should apply spacing for vertical', () => {
    const { container } = render(<Divider orientation="vertical" spacing="lg" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('mx-8');
  });

  it('should merge custom className', () => {
    const { container } = render(<Divider className="custom-class" />);

    const divider = container.querySelector('div');
    expect(divider).toHaveClass('custom-class');
    expect(divider).toHaveClass('flex-shrink-0');
  });
});
