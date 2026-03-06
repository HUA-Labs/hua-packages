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

  it('should apply size variants via inline style', () => {
    const { container, rerender } = render(<EmptyState title="T" size="sm" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.paddingTop).toBe('2rem');

    rerender(<EmptyState title="T" size="lg" />);
    const el2 = container.firstElementChild as HTMLElement;
    expect(el2.style.paddingTop).toBe('4rem');
  });

  it('should apply variant container style via CSS variable', () => {
    const { container } = render(<EmptyState title="T" variant="error" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toContain('var(--empty-state-error-bg)');
  });

  it('should show border when bordered', () => {
    const { container } = render(<EmptyState title="T" bordered />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.border).toContain('1px solid');
  });

  it('should render custom icon as ReactNode', () => {
    render(<EmptyState title="T" icon={<span data-testid="custom-icon">target</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should apply dot prop as inline style', () => {
    const { container } = render(<EmptyState title="T" dot="p-8" />);
    const el = container.firstElementChild as HTMLElement;
    // dot prop produces inline style — element should have inline style set
    expect(el).toHaveAttribute('style');
  });

  it('should merge explicit style prop', () => {
    const { container } = render(<EmptyState title="T" style={{ opacity: 0.5 }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.opacity).toBe('0.5');
  });
});
