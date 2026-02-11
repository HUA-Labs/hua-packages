import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Slider } from '../Slider';

describe('Slider', () => {
  it('should render slider element', () => {
    render(<Slider aria-label="Volume" />);

    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toBeInTheDocument();
  });

  it('should have correct min, max, and value attributes', () => {
    render(<Slider min={0} max={100} value={50} aria-label="Progress" />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
    expect(slider).toHaveAttribute('value', '50');
  });

  it('should respect min and max props', () => {
    render(<Slider min={10} max={90} aria-label="Range" />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '90');
  });

  it('should respect step prop', () => {
    render(<Slider step={5} aria-label="Step slider" />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('step', '5');
  });

  it('should display value when showValue is true', () => {
    render(<Slider value={75} showValue aria-label="Value slider" />);

    const valueDisplay = screen.getByText('75');
    expect(valueDisplay).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Slider disabled aria-label="Disabled slider" />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  it('should call onValueChange when value changes', () => {
    const handleChange = vi.fn();

    render(<Slider value={50} onValueChange={handleChange} aria-label="Interactive slider" />);

    const slider = screen.getByRole('slider');

    // Simulate range input change
    fireEvent.change(slider, { target: { value: '75' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should render with label when showLabel is true', () => {
    render(<Slider showLabel label="Brightness" aria-label="Brightness" />);

    const label = screen.getByText('Brightness');
    expect(label).toBeInTheDocument();
  });
});
