import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EmotionMeter } from '../EmotionMeter';

describe('EmotionMeter', () => {
  it('should render meter bar', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const track = container.firstChild as HTMLElement;
    expect(track.className).toContain('rounded-full');
  });

  it('should set width based on value', () => {
    const { container } = render(<EmotionMeter value={75} max={100} />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.width).toBe('75%');
  });

  it('should use default max of 100', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.width).toBe('50%');
  });

  it('should clamp value to 0-100 range', () => {
    const { container, rerender } = render(<EmotionMeter value={150} />);

    let fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.width).toBe('100%');

    rerender(<EmotionMeter value={-10} />);
    fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.width).toBe('0%');
  });

  it('should apply sm size', () => {
    const { container } = render(<EmotionMeter value={50} size="sm" />);

    const track = container.firstChild as HTMLElement;
    expect(track.className).toContain('h-2');
  });

  it('should apply md size by default', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const track = container.firstChild as HTMLElement;
    expect(track.className).toContain('h-3');
  });

  it('should apply lg size', () => {
    const { container } = render(<EmotionMeter value={50} size="lg" />);

    const track = container.firstChild as HTMLElement;
    expect(track.className).toContain('h-4');
  });

  it('should apply blue color by default', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.className).toContain('bg-indigo-500');
  });

  it('should apply green color', () => {
    const { container } = render(<EmotionMeter value={50} color="green" />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.className).toContain('bg-green-500');
  });

  it('should apply red color', () => {
    const { container } = render(<EmotionMeter value={50} color="red" />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.className).toContain('bg-red-500');
  });

  it('should apply yellow color', () => {
    const { container } = render(<EmotionMeter value={50} color="yellow" />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.className).toContain('bg-yellow-500');
  });

  it('should apply custom className', () => {
    const { container } = render(<EmotionMeter value={50} className="custom-meter" />);

    expect(container.querySelector('.custom-meter')).toBeInTheDocument();
  });

  it('should calculate percentage with custom max', () => {
    const { container } = render(<EmotionMeter value={3} max={10} />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.width).toBe('30%');
  });
});
