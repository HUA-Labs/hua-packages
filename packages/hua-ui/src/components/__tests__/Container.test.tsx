import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '../Container';

describe('Container', () => {
  it('should render children', () => {
    render(<Container>Container content</Container>);

    const content = screen.getByText('Container content');
    expect(content).toBeInTheDocument();
  });

  it('should apply full width by default', () => {
    const { container } = render(<Container>Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('w-full');
  });

  it('should apply default max-width (lg)', () => {
    const { container } = render(<Container>Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('max-w-6xl');
  });

  it('should apply small max-width', () => {
    const { container } = render(<Container size="sm">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('max-w-2xl');
  });

  it('should apply medium max-width', () => {
    const { container } = render(<Container size="md">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('max-w-4xl');
  });

  it('should apply extra large max-width', () => {
    const { container } = render(<Container size="xl">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('max-w-7xl');
  });

  it('should apply full size', () => {
    const { container } = render(<Container size="full">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('max-w-full');
  });

  it('should apply default padding (md)', () => {
    const { container } = render(<Container>Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('px-4');
    expect(containerEl).toHaveClass('sm:px-6');
  });

  it('should apply no padding', () => {
    const { container } = render(<Container padding="none">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).not.toHaveClass('px-4');
  });

  it('should apply large padding', () => {
    const { container } = render(<Container padding="lg">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('px-4');
    expect(containerEl).toHaveClass('lg:px-8');
  });

  it('should center by default', () => {
    const { container } = render(<Container>Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('mx-auto');
  });

  it('should not center when centered is false', () => {
    const { container } = render(<Container centered={false}>Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).not.toHaveClass('mx-auto');
  });

  it('should apply fluid mode', () => {
    const { container } = render(<Container fluid>Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('max-w-full');
  });

  it('should merge custom className', () => {
    const { container } = render(<Container className="custom-class">Content</Container>);

    const containerEl = container.querySelector('div');
    expect(containerEl).toHaveClass('custom-class');
    expect(containerEl).toHaveClass('w-full');
  });
});
