import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '../Progress';

describe('Progress', () => {
  it('should render progress bar', () => {
    const { container } = render(<Progress value={50} />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toBeInTheDocument();
  });

  it('should set correct width percentage', () => {
    const { container } = render(<Progress value={50} max={100} />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toHaveStyle({ width: '50%' });
  });

  it('should handle value greater than max', () => {
    const { container } = render(<Progress value={150} max={100} />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('should handle negative value', () => {
    const { container } = render(<Progress value={-50} max={100} />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toHaveStyle({ width: '0%' });
  });

  it('should show label when provided', () => {
    render(<Progress value={50} label="Upload" />);

    const label = screen.getByText('Upload');
    expect(label).toBeInTheDocument();
  });

  it('should show percentage when showValue is true', () => {
    render(<Progress value={75} showValue />);

    const percentage = screen.getByText('75%');
    expect(percentage).toBeInTheDocument();
  });

  it('should show description when provided', () => {
    render(<Progress value={50} description="Loading data..." />);

    const description = screen.getByText('Loading data...');
    expect(description).toBeInTheDocument();
  });

  it('should apply success variant classes', () => {
    const { container } = render(<Progress value={50} variant="success" />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toHaveClass('bg-[var(--progress-success)]');
  });

  it('should apply warning variant classes', () => {
    const { container } = render(<Progress value={50} variant="warning" />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toHaveClass('bg-[var(--progress-warning)]');
  });

  it('should apply error variant classes', () => {
    const { container } = render(<Progress value={50} variant="error" />);

    const progressBar = container.querySelector('.h-full');
    expect(progressBar).toHaveClass('bg-[var(--progress-error)]');
  });

  it('should apply small size variant', () => {
    const { container } = render(<Progress value={50} size="sm" />);

    const track = container.querySelector('.h-2');
    expect(track).toBeInTheDocument();
  });

  it('should apply medium size variant', () => {
    const { container } = render(<Progress value={50} size="md" />);

    const track = container.querySelector('.h-3');
    expect(track).toBeInTheDocument();
  });

  it('should apply large size variant', () => {
    const { container } = render(<Progress value={50} size="lg" />);

    const track = container.querySelector('.h-4');
    expect(track).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />);

    const wrapper = container.querySelector('.w-full');
    expect(wrapper).toHaveClass('custom-class');
  });

  describe('autoVariant', () => {
    it('should use success variant when value > 50%', () => {
      const { container } = render(<Progress value={60} autoVariant />);
      const progressBar = container.querySelector('.h-full');
      expect(progressBar).toHaveClass('bg-[var(--progress-success)]');
    });

    it('should use warning variant when value > 25% and <= 50%', () => {
      const { container } = render(<Progress value={30} autoVariant />);
      const progressBar = container.querySelector('.h-full');
      expect(progressBar).toHaveClass('bg-[var(--progress-warning)]');
    });

    it('should use error variant when value <= 25%', () => {
      const { container } = render(<Progress value={20} autoVariant />);
      const progressBar = container.querySelector('.h-full');
      expect(progressBar).toHaveClass('bg-[var(--progress-error)]');
    });

    it('should respect explicit variant when autoVariant is false', () => {
      const { container } = render(<Progress value={10} variant="success" />);
      const progressBar = container.querySelector('.h-full');
      expect(progressBar).toHaveClass('bg-[var(--progress-success)]');
    });

    it('should handle custom max with autoVariant', () => {
      // 60/200 = 0.3 → > 0.25 → warning
      const { container } = render(<Progress value={60} max={200} autoVariant />);
      const progressBar = container.querySelector('.h-full');
      expect(progressBar).toHaveClass('bg-[var(--progress-warning)]');
    });
  });
});
