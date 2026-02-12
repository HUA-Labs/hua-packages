import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Timeline } from '../Timeline';

const items = [
  { id: '1', title: 'Task started', status: 'completed' as const },
  { id: '2', title: 'In review', status: 'active' as const },
  { id: '3', title: 'Deploy', status: 'pending' as const },
];

describe('Timeline', () => {
  it('should render timeline items', () => {
    render(<Timeline items={items} />);
    expect(screen.getByText('Task started')).toBeInTheDocument();
    expect(screen.getByText('In review')).toBeInTheDocument();
    expect(screen.getByText('Deploy')).toBeInTheDocument();
  });

  it('should render empty state when no items', () => {
    render(<Timeline items={[]} />);
    expect(screen.getByText('타임라인이 비어 있습니다')).toBeInTheDocument();
  });

  it('should render custom empty state', () => {
    render(<Timeline items={[]} emptyState={<div>No events</div>} />);
    expect(screen.getByText('No events')).toBeInTheDocument();
  });

  it('should render status labels', () => {
    render(<Timeline items={items} />);
    expect(screen.getByText('완료')).toBeInTheDocument();
    expect(screen.getByText('진행 중')).toBeInTheDocument();
    expect(screen.getByText('대기')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(
      <Timeline items={[{ id: '1', title: 'T', description: 'A detailed description' }]} />
    );
    expect(screen.getByText('A detailed description')).toBeInTheDocument();
  });

  it('should render meta information', () => {
    render(
      <Timeline items={[{ id: '1', title: 'T', meta: 'v1.0.0' }]} />
    );
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('should render custom content', () => {
    render(
      <Timeline items={[{ id: '1', title: 'T', content: <span data-testid="custom">Extra</span> }]} />
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('should render horizontal orientation', () => {
    const { container } = render(
      <Timeline items={items} orientation="horizontal" />
    );
    expect(container.querySelector('.overflow-x-auto')).toBeInTheDocument();
  });

  it('should format dates', () => {
    render(
      <Timeline
        items={[{ id: '1', title: 'T', date: '2026-01-15T10:30:00' }]}
        locale="en-US"
      />
    );
    // Time element should be present
    const timeEl = document.querySelector('time');
    expect(timeEl).toBeInTheDocument();
  });

  it('should highlight specific item', () => {
    const { container } = render(
      <Timeline items={items} highlightedId="2" />
    );
    expect(container.querySelector('.shadow-md')).toBeInTheDocument();
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<Timeline items={items} size="sm" />);
    expect(container.querySelector('.gap-3')).toBeInTheDocument();

    rerender(<Timeline items={items} size="lg" />);
    expect(container.querySelector('.gap-5')).toBeInTheDocument();
  });

  it('should hide connector when showConnector is false', () => {
    const { container } = render(
      <Timeline items={items} showConnector={false} />
    );
    // No connector line
    expect(container.querySelectorAll('.bg-border.mt-1').length).toBe(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<Timeline items={items} className="my-timeline" />);
    expect(container.querySelector('.my-timeline')).toBeInTheDocument();
  });
});
