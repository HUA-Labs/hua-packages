import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EmotionMeter } from '../EmotionMeter';

describe('EmotionMeter', () => {
  it('should render meter bar', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const track = container.firstChild as HTMLElement;
    expect(track).toBeInTheDocument();
    expect(track.style.borderRadius).toBe('9999px');
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

  it('should apply sm size via inline style', () => {
    const { container } = render(<EmotionMeter value={50} size="sm" />);

    const track = container.firstChild as HTMLElement;
    expect(track.style.height).toBe('0.5rem');
  });

  it('should apply md size by default via inline style', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const track = container.firstChild as HTMLElement;
    expect(track.style.height).toBe('0.75rem');
  });

  it('should apply lg size via inline style', () => {
    const { container } = render(<EmotionMeter value={50} size="lg" />);

    const track = container.firstChild as HTMLElement;
    expect(track.style.height).toBe('1rem');
  });

  it('should apply blue color by default via inline style', () => {
    const { container } = render(<EmotionMeter value={50} />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('rgb(99 102 241)');
  });

  it('should apply green color via inline style', () => {
    const { container } = render(<EmotionMeter value={50} color="green" />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('rgb(34 197 94)');
  });

  it('should apply red color via inline style', () => {
    const { container } = render(<EmotionMeter value={50} color="red" />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('rgb(239 68 68)');
  });

  it('should apply yellow color via inline style', () => {
    const { container } = render(<EmotionMeter value={50} color="yellow" />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.backgroundColor).toBe('rgb(234 179 8)');
  });

  it('should apply custom style via style prop', () => {
    const { container } = render(<EmotionMeter value={50} style={{ flex: 1 }} />);

    const track = container.firstChild as HTMLElement;
    expect(track.style.flex).toBe('1');
  });

  it('should calculate percentage with custom max', () => {
    const { container } = render(<EmotionMeter value={3} max={10} />);

    const fill = (container.firstChild as HTMLElement).firstChild as HTMLElement;
    expect(fill.style.width).toBe('30%');
  });
});
