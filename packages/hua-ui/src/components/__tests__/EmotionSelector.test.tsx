import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmotionSelector } from '../EmotionSelector';

describe('EmotionSelector', () => {
  it('should render default emotions', () => {
    render(<EmotionSelector />);
    // EmotionButton renders the emotion key, not label
    expect(screen.getByText('joy')).toBeInTheDocument();
    expect(screen.getByText('sadness')).toBeInTheDocument();
    expect(screen.getByText('anger')).toBeInTheDocument();
    expect(screen.getByText('calm')).toBeInTheDocument();
  });

  it('should render custom emotions', () => {
    const emotions = [
      { key: 'happy', label: 'Happy' },
      { key: 'sad', label: 'Sad' },
    ];
    render(<EmotionSelector emotions={emotions} />);
    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.getByText('sad')).toBeInTheDocument();
  });

  it('should call onEmotionSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(<EmotionSelector onEmotionSelect={handleSelect} />);
    fireEvent.click(screen.getByText('joy'));
    expect(handleSelect).toHaveBeenCalledWith('joy');
  });

  it('should show selected state', () => {
    const { container } = render(<EmotionSelector selectedEmotion="joy" />);
    expect(container.querySelector('.ring-1')).toBeInTheDocument();
  });

  it('should render card variant', () => {
    const { container } = render(
      <EmotionSelector variant="card" />
    );
    expect(container.querySelector('.cursor-pointer')).toBeInTheDocument();
  });

  it('should render chip variant', () => {
    const { container } = render(
      <EmotionSelector variant="chip" />
    );
    expect(container.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('should apply grid layout by default', () => {
    const { container } = render(<EmotionSelector />);
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('should apply compact layout', () => {
    const { container } = render(<EmotionSelector layout="compact" />);
    expect(container.querySelector('.flex.flex-wrap')).toBeInTheDocument();
  });

  it('should show intensity slider when showIntensity and selectedEmotion', () => {
    render(<EmotionSelector showIntensity selectedEmotion="joy" intensity={75} />);
    expect(screen.getByText('감정 강도')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should call onIntensityChange', () => {
    const handleChange = vi.fn();
    render(
      <EmotionSelector
        showIntensity
        selectedEmotion="joy"
        intensity={50}
        onIntensityChange={handleChange}
      />
    );
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '80' } });
    expect(handleChange).toHaveBeenCalledWith(80);
  });

  it('should not show intensity when no emotion selected', () => {
    render(<EmotionSelector showIntensity />);
    expect(screen.queryByText('감정 강도')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<EmotionSelector className="my-selector" />);
    expect(container.querySelector('.my-selector')).toBeInTheDocument();
  });
});
