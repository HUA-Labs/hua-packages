import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '../SectionHeader';

describe('SectionHeader', () => {
  it('should render title', () => {
    render(<SectionHeader title="Settings" />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should render title as h3', () => {
    render(<SectionHeader title="Settings" />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Settings');
  });

  it('should render description', () => {
    render(<SectionHeader title="Settings" description="Manage your preferences" />);

    expect(screen.getByText('Manage your preferences')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { container } = render(<SectionHeader title="Settings" />);

    const desc = container.querySelector('.text-muted-foreground');
    expect(desc).not.toBeInTheDocument();
  });

  it('should render action element', () => {
    render(
      <SectionHeader
        title="Notifications"
        action={<button>Mark all read</button>}
      />
    );

    expect(screen.getByText('Mark all read')).toBeInTheDocument();
  });

  it('should not render action when not provided', () => {
    const { container } = render(<SectionHeader title="Settings" />);

    const actionArea = container.querySelector('.flex-shrink-0.ml-4');
    expect(actionArea).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SectionHeader title="Settings" className="custom-header" />
    );

    expect(container.querySelector('.custom-header')).toBeInTheDocument();
  });

  it('should have border-b styling', () => {
    const { container } = render(<SectionHeader title="Settings" />);

    const header = container.firstChild as HTMLElement;
    expect(header.className).toContain('border-b');
  });
});
