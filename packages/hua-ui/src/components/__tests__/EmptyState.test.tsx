import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';

describe('EmptyState', () => {
  it('should render title', () => {
    render(<EmptyState title="No data" />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('should render description', () => {
    render(<EmptyState title="T" description="Try adding some data" />);
    expect(screen.getByText('Try adding some data')).toBeInTheDocument();
  });

  it('should render action button with onClick', () => {
    const handleAction = vi.fn();
    render(<EmptyState title="T" actionText="Add item" onAction={handleAction} />);
    fireEvent.click(screen.getByText('Add item'));
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('should render action button with href', () => {
    render(<EmptyState title="T" actionText="Go home" actionHref="/home" />);
    const link = document.querySelector('a[href="/home"]');
    expect(link).toBeInTheDocument();
  });

  it('should render secondary action', () => {
    const handleSecondary = vi.fn();
    render(
      <EmptyState
        title="T"
        secondaryActionText="Cancel"
        onSecondaryAction={handleSecondary}
      />
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleSecondary).toHaveBeenCalledTimes(1);
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<EmptyState title="T" size="sm" />);
    expect(container.querySelector('.py-8')).toBeInTheDocument();

    rerender(<EmptyState title="T" size="lg" />);
    expect(container.querySelector('.py-16')).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { container } = render(<EmptyState title="T" variant="error" />);
    expect(container.querySelector('.bg-destructive\\/5')).toBeInTheDocument();
  });

  it('should show border when bordered', () => {
    const { container } = render(<EmptyState title="T" bordered />);
    expect(container.querySelector('.border')).toBeInTheDocument();
  });

  it('should render custom icon as ReactNode', () => {
    render(<EmptyState title="T" icon={<span data-testid="custom-icon">🎯</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<EmptyState title="T" className="my-empty" />);
    expect(container.querySelector('.my-empty')).toBeInTheDocument();
  });
});
