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

  it('should show selected state via ring box-shadow', () => {
    render(<EmotionSelector selectedEmotion="joy" />);
    // In dot-based approach, selected button has boxShadow set
    const joyButton = screen.getByText('joy').closest('button') as HTMLElement;
    expect(joyButton).toBeInTheDocument();
    expect(joyButton.style.borderColor).toBe('rgb(99 102 241)');
  });

  it('should render card variant with cursor-pointer style', () => {
    const { container } = render(
      <EmotionSelector variant="card" />
    );
    // card items have cursor: pointer via resolveDot
    const items = container.querySelectorAll('[style*="cursor: pointer"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should render chip variant with rounded-full style', () => {
    const { container } = render(
      <EmotionSelector variant="chip" />
    );
    // chip items have borderRadius: 9999px
    const items = container.querySelectorAll('[style*="9999px"]');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should apply grid layout by default via inline style', () => {
    const { container } = render(<EmotionSelector />);
    const gridDiv = container.querySelector('[style*="grid"]') as HTMLElement;
    expect(gridDiv).toBeInTheDocument();
    expect(gridDiv.style.display).toBe('grid');
  });

  it('should apply compact layout via inline style', () => {
    const { container } = render(<EmotionSelector layout="compact" />);
    const flexDiv = container.querySelector('[style*="wrap"]') as HTMLElement;
    expect(flexDiv).toBeInTheDocument();
    expect(flexDiv.style.flexWrap).toBe('wrap');
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

  it('should apply custom style via style prop', () => {
    const { container } = render(<EmotionSelector style={{ opacity: 0.8 }} />);
    const root = container.firstChild as HTMLElement;
    expect(root.style.opacity).toBe('0.8');
  });
});
