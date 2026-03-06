import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InfoCard } from '../InfoCard';

describe('InfoCard', () => {
  it('should render title', () => {
    render(<InfoCard icon="info" title="Information">Content here</InfoCard>);

    expect(screen.getByText('Information')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(<InfoCard icon="info" title="Info">This is the body</InfoCard>);

    expect(screen.getByText('This is the body')).toBeInTheDocument();
  });

  it('should apply blue tone styles by default', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info">Content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain('var(--ic-blue-border)');
    expect(card.style.borderRadius).toBe('0.5rem');
  });

  it('should apply green tone styles', () => {
    const { container } = render(
      <InfoCard icon="check" title="Success" tone="green">Done</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain('var(--ic-green-border)');
  });

  it('should apply purple tone styles', () => {
    const { container } = render(
      <InfoCard icon="info" title="Note" tone="purple">Note content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain('var(--ic-purple-border)');
  });

  it('should apply orange tone styles', () => {
    const { container } = render(
      <InfoCard icon="info" title="Warning" tone="orange">Be careful</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain('var(--ic-orange-border)');
  });

  it('should accept dot prop for extra spacing', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info" dot="mt-4">Content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    // dot prop is resolved to inline style — card should still render
    expect(card).toBeTruthy();
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('should accept style prop', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info" style={{ marginTop: '2rem' }}>Content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.marginTop).toBe('2rem');
  });

  it('should have rounded border styling', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info">Content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.style.borderRadius).toBe('0.5rem');
    expect(card.style.border).toBeTruthy();
  });
});
