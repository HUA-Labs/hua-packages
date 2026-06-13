import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollProgress } from '../ScrollProgress';

describe('ScrollProgress', () => {
  it('should render progress bar', () => {
    const { container } = render(<ScrollProgress />);

    expect((container.firstChild as HTMLElement).style.position).toBe('fixed');
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
    expect(bar.style.top).toBe('0px');
  });

  it('should position at bottom', () => {
    const { container } = render(<ScrollProgress position="bottom" />);

    const bar = container.firstChild as HTMLElement;
    expect(bar.style.bottom).toBe('0px');
  });

  it('should apply gradient color by default', () => {
    const { container } = render(<ScrollProgress />);

    const fill = (container.firstChild as HTMLElement).children[1] as HTMLElement;
    expect(fill.style.backgroundImage).toContain('linear-gradient');
  });

  it('should apply primary color', () => {
    const { container } = render(<ScrollProgress color="primary" />);

    const fill = (container.firstChild as HTMLElement).children[1] as HTMLElement;
    expect(fill.style.backgroundColor).toBe('var(--color-primary)');
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
    expect(bar).toHaveDotStyle('z-50');
  });
});
