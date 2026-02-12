import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollProgress } from '../ScrollProgress';

describe('ScrollProgress', () => {
  it('should render progress bar', () => {
    const { container } = render(<ScrollProgress />);

    expect(container.querySelector('.fixed')).toBeInTheDocument();
  });

  it('should use default height of 2px', () => {
    const { container } = render(<ScrollProgress />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.style.height).toBe('2px');
  });

  it('should apply custom height', () => {
    const { container } = render(<ScrollProgress height={4} />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.style.height).toBe('4px');
  });

  it('should position at top by default', () => {
    const { container } = render(<ScrollProgress />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('top-0');
  });

  it('should position at bottom', () => {
    const { container } = render(<ScrollProgress position="bottom" />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('bottom-0');
  });

  it('should apply gradient color by default', () => {
    const { container } = render(<ScrollProgress />);

    const fill = container.querySelector('.bg-gradient-to-r');
    expect(fill).toBeInTheDocument();
  });

  it('should apply primary color', () => {
    const { container } = render(<ScrollProgress color="primary" />);

    const fill = container.querySelector('.bg-primary');
    expect(fill).toBeInTheDocument();
  });

  it('should show percentage when showPercentage is true', () => {
    render(<ScrollProgress showPercentage />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should not show percentage by default', () => {
    render(<ScrollProgress />);

    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ScrollProgress className="my-progress" />);

    expect(container.querySelector('.my-progress')).toBeInTheDocument();
  });

  it('should have fixed z-50 positioning', () => {
    const { container } = render(<ScrollProgress />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain('z-50');
  });
});
