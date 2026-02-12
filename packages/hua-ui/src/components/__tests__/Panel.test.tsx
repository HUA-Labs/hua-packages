import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Panel } from '../Panel';

describe('Panel', () => {
  it('should render children', () => {
    const { container } = render(<Panel>Panel content</Panel>);
    expect(container.textContent).toContain('Panel content');
  });

  it('should apply default style class', () => {
    const { container } = render(<Panel>Content</Panel>);
    expect(container.querySelector('.panel-default')).toBeInTheDocument();
  });

  it('should apply glass style', () => {
    const { container } = render(<Panel style="glass">Content</Panel>);
    expect(container.querySelector('.panel-glass')).toBeInTheDocument();
  });

  it('should apply neon style', () => {
    const { container } = render(<Panel style="neon">Content</Panel>);
    expect(container.querySelector('.panel-neon')).toBeInTheDocument();
  });

  it('should apply effect class', () => {
    const { container } = render(<Panel effect="glow">Content</Panel>);
    expect(container.querySelector('.panel-effect-glow')).toBeInTheDocument();
  });

  it('should apply padding variant', () => {
    const { container } = render(<Panel padding="lg">Content</Panel>);
    expect(container.querySelector('.p-8')).toBeInTheDocument();
  });

  it('should apply rounded variant', () => {
    const { container } = render(<Panel rounded="xl">Content</Panel>);
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument();
  });

  it('should apply custom padding', () => {
    const { container } = render(<Panel customPadding="p-10">Content</Panel>);
    expect(container.querySelector('.p-10')).toBeInTheDocument();
  });

  it('should apply transparency to style', () => {
    const { container } = render(<Panel transparency={0.5}>Content</Panel>);
    const card = container.querySelector('.panel-component') as HTMLElement;
    expect(card.style.opacity).toBe('0.5');
  });

  it('should apply custom className', () => {
    const { container } = render(<Panel className="my-panel">Content</Panel>);
    expect(container.querySelector('.my-panel')).toBeInTheDocument();
  });
});
