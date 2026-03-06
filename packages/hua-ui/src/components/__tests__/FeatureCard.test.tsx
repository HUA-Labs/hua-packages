import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureCard } from '../FeatureCard';

describe('FeatureCard', () => {
  it('should render title and description', () => {
    render(<FeatureCard title="Fast" description="Lightning fast performance" />);

    expect(screen.getByText('Fast')).toBeInTheDocument();
    expect(screen.getByText('Lightning fast performance')).toBeInTheDocument();
  });

  it('should render title as h3', () => {
    render(<FeatureCard title="Feature" description="Description" />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Feature');
  });

  it('should render with icon wrapper div', () => {
    const { container } = render(
      <FeatureCard icon="star" title="Starred" description="A starred feature" />
    );

    // Icon wrapper is the first child div of the card
    const card = container.firstChild as HTMLElement;
    expect(card.querySelector('div')).toBeInTheDocument();
  });

  it('should render image URL as icon', () => {
    render(
      <FeatureCard icon="https://example.com/icon.png" title="Image" description="With image" />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/icon.png');
  });

  it('should apply size sm padding via inline style', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" size="sm" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.padding).toBe('1rem');
  });

  it('should apply size lg padding via inline style', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" size="lg" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.padding).toBe('2rem');
  });

  it('should apply default variant background via inline style', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" />
    );

    const card = container.firstChild as HTMLElement;
    // default variant uses CSS variable for background
    expect(card.style.backgroundColor).toContain('var(--color-background');
  });

  it('should apply gradient variant background via inline style', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" variant="gradient" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.background).toContain('linear-gradient');
  });

  it('should apply neon variant border via inline style', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" variant="neon" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain('rgba(34, 211, 238');
  });

  it('should apply hover scale effect on mouse enter', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" hover="scale" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.transform).toBe('');

    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('scale(1.05)');

    fireEvent.mouseLeave(card);
    expect(card.style.transform).toBe('');
  });

  it('should not apply hover transform when hover="none"', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" hover="none" />
    );
    const card = container.firstChild as HTMLElement;

    fireEvent.mouseEnter(card);
    expect(card.style.transform).toBe('');
  });

  it('should forward additional props', () => {
    const onClick = vi.fn();
    render(<FeatureCard title="T" description="D" onClick={onClick} data-testid="fc" />);

    fireEvent.click(screen.getByTestId('fc'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should apply dot prop styles', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" dot="opacity-50" />
    );
    const card = container.firstChild as HTMLElement;
    // dot engine resolves opacity-50 → opacity: 0.5
    expect(card.style.opacity).toBe('0.5');
  });

  it('should apply custom gradient via customGradient prop', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" variant="gradient" customGradient="linear-gradient(90deg, red, blue)" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.background).toBe('linear-gradient(90deg, red, blue)');
  });
});
