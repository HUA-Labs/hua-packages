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

  it('should apply blue tone by default', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info">Content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-indigo-50');
  });

  it('should apply green tone', () => {
    const { container } = render(
      <InfoCard icon="check" title="Success" tone="green">Done</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-green-50');
  });

  it('should apply purple tone', () => {
    const { container } = render(
      <InfoCard icon="info" title="Note" tone="purple">Note content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-purple-50');
  });

  it('should apply orange tone', () => {
    const { container } = render(
      <InfoCard icon="info" title="Warning" tone="orange">Be careful</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('from-orange-50');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info" className="my-card">Content</InfoCard>
    );

    expect(container.querySelector('.my-card')).toBeInTheDocument();
  });

  it('should have rounded border styling', () => {
    const { container } = render(
      <InfoCard icon="info" title="Info">Content</InfoCard>
    );

    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('rounded-lg');
    expect(card.className).toContain('border');
  });
});
