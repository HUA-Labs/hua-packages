import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from '../Skeleton';

describe('Skeleton', () => {
  it('should render with animation class', () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.querySelector('div') as HTMLElement;
    expect(skeleton.style.animation).toContain('pulse');
  });

  it('should apply text variant by default', () => {
    const { container } = render(<Skeleton />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveDotStyle('w-full');
    expect(skeleton).toHaveDotStyle('h-4');
  });

  it('should apply circular variant', () => {
    const { container } = render(<Skeleton variant="circular" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveDotStyle('rounded-full');
    expect(skeleton).toHaveDotStyle('w-10');
    expect(skeleton).toHaveDotStyle('h-10');
  });

  it('should apply rectangular variant', () => {
    const { container } = render(<Skeleton variant="rectangular" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveDotStyle('rounded-none');
    expect(skeleton).toHaveDotStyle('h-[200px]');
  });

  it('should apply rounded variant', () => {
    const { container } = render(<Skeleton variant="rounded" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveDotStyle('rounded-lg');
    expect(skeleton).toHaveDotStyle('h-[200px]');
  });

  it('should apply custom width as number', () => {
    const { container } = render(<Skeleton width={100} />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveStyle({ width: '100px' });
  });

  it('should apply custom width as string', () => {
    const { container } = render(<Skeleton width="50%" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveStyle({ width: '50%' });
  });

  it('should apply custom height as number', () => {
    const { container } = render(<Skeleton height={50} />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('should apply custom height as string', () => {
    const { container } = render(<Skeleton height="100px" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveStyle({ height: '100px' });
  });

  it('should apply pulse animation by default', () => {
    const { container } = render(<Skeleton animation="pulse" />);

    const skeleton = container.querySelector('div') as HTMLElement;
    expect(skeleton.style.animation).toContain('pulse');
  });

  it('should apply wave animation styles', () => {
    const { container } = render(<Skeleton animation="wave" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveStyle({ backgroundSize: '200% 100%' });
  });

  it('should apply shimmer animation styles', () => {
    const { container } = render(<Skeleton animation="shimmer" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveStyle({ backgroundSize: '200% 100%' });
  });

  it('should merge custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);

    const skeleton = container.querySelector('div');
    expect(skeleton).toHaveDotStyle('custom-class');
    expect(skeleton).toHaveDotStyle('bg-muted');
  });
});
