import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('should render with icon', () => {
    const { container } = render(
      <FeatureCard icon="star" title="Starred" description="A starred feature" />
    );

    // Icon renders inside a div with mb-4 class
    expect(container.querySelector('.mb-4')).toBeInTheDocument();
  });

  it('should render image URL as icon', () => {
    render(
      <FeatureCard icon="https://example.com/icon.png" title="Image" description="With image" />
    );

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/icon.png');
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(
      <FeatureCard title="T" description="D" size="sm" />
    );
    expect(container.querySelector('.p-4')).toBeInTheDocument();

    rerender(<FeatureCard title="T" description="D" size="lg" />);
    expect(container.querySelector('.p-8')).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-background');
  });

  it('should apply gradient variant', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" variant="gradient" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-gradient-to-br');
  });

  it('should apply neon variant', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" variant="neon" />
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-cyan-400');
  });

  it('should apply hover effects', () => {
    const { container, rerender } = render(
      <FeatureCard title="T" description="D" hover="scale" />
    );
    expect((container.firstChild as HTMLElement).className).toContain('hover:scale-105');

    rerender(<FeatureCard title="T" description="D" hover="none" />);
    expect((container.firstChild as HTMLElement).className).not.toContain('hover:scale-105');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FeatureCard title="T" description="D" className="my-card" />
    );

    expect(container.querySelector('.my-card')).toBeInTheDocument();
  });
});
