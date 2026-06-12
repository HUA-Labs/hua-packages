import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Panel } from '../Panel';

describe('Panel', () => {
  const getPanelCard = (container: HTMLElement) =>
    (container.firstElementChild as HTMLElement).querySelector(':scope > div') as HTMLElement;

  it('should render children', () => {
    const { container } = render(<Panel>Panel content</Panel>);
    expect(container.textContent).toContain('Panel content');
  });

  it('should apply default style class', () => {
    const { container } = render(<Panel>Content</Panel>);
    expect(getPanelCard(container).style.backgroundColor).toContain('var(--color-card)');
  });

  it('should apply glass style', () => {
    const { container } = render(<Panel style="glass">Content</Panel>);
    expect(getPanelCard(container).style.backdropFilter).toBeTruthy();
  });

  it('should apply neon style', () => {
    const { container } = render(<Panel style="neon">Content</Panel>);
    expect(getPanelCard(container).style.border).toContain('rgba(103, 232, 249, 0.3)');
  });

  it('should apply effect class', () => {
    const { container } = render(<Panel effect="glow">Content</Panel>);
    expect(getPanelCard(container).style.boxShadow).toBeTruthy();
  });

  it('should apply padding variant', () => {
    const { container } = render(<Panel padding="lg">Content</Panel>);
    expect(getPanelCard(container).style.padding).toBe('32px');
  });

  it('should apply rounded variant', () => {
    const { container } = render(<Panel rounded="xl">Content</Panel>);
    expect(getPanelCard(container).style.borderRadius).toBe('12px');
  });

  it('should apply custom padding', () => {
    const { container } = render(<Panel customPadding="40px">Content</Panel>);
    expect(getPanelCard(container).style.padding).toBe('40px');
  });

  it('should apply transparency to style', () => {
    const { container } = render(<Panel transparency={0.5}>Content</Panel>);
    const card = getPanelCard(container);
    expect(card.style.opacity).toBe('0.5');
  });

  it('should apply custom className', () => {
    const { container } = render(<Panel className="my-panel">Content</Panel>);
    expect(container.querySelector('.my-panel')).toBeInTheDocument();
  });
});
