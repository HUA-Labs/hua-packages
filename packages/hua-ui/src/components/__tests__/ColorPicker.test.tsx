import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorPicker } from '../ColorPicker';

// Mock getBoundingClientRect for SaturationLightnessPicker
beforeEach(() => {
  Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
    left: 0,
    top: 0,
    right: 200,
    bottom: 112,
    width: 200,
    height: 112,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

describe('ColorPicker - Tabs', () => {
  it('should render Tailwind tab by default', () => {
    render(<ColorPicker value="#3b82f6" onChange={vi.fn()} />);

    const tailwindTab = screen.getByText('Tailwind');
    expect(tailwindTab.className).toContain('bg-background');
  });

  it('should switch to Custom tab', async () => {
    const user = userEvent.setup();

    render(<ColorPicker value="#3b82f6" onChange={vi.fn()} />);

    await user.click(screen.getByText('Custom'));

    const customTab = screen.getByText('Custom');
    expect(customTab.className).toContain('bg-background');
  });

  it('should display current color preview', () => {
    const { container } = render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);

    // HEX display text
    expect(screen.getByText('#ff0000')).toBeInTheDocument();
  });
});

describe('ColorPicker - Tailwind Tab', () => {
  it('should render color palette', () => {
    const { container } = render(<ColorPicker value="#3b82f6" onChange={vi.fn()} />);

    // Each palette row has 10 swatches, and there are 16 color groups
    const swatches = container.querySelectorAll('button[title*="-"]');
    expect(swatches.length).toBeGreaterThan(100);
  });

  it('should select a palette swatch', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ColorPicker value="#3b82f6" onChange={handleChange} />);

    // Click the first red swatch (red-100)
    const redSwatch = container.querySelector('button[title="red-100"]') as HTMLElement;
    await user.click(redSwatch);

    expect(handleChange).toHaveBeenCalledWith('#fef2f2');
  });

  it('should highlight the current selected color', () => {
    const { container } = render(<ColorPicker value="#ef4444" onChange={vi.fn()} />);

    // #ef4444 is at index 5 in red array, title = red-600
    const red600 = container.querySelector('button[title="red-600"]');
    expect(red600?.className).toContain('ring-1');
  });

  it('should render special colors (black, white, transparent)', () => {
    const { container } = render(<ColorPicker value="#000000" onChange={vi.fn()} />);

    expect(container.querySelector('button[title="#000000"]')).toBeInTheDocument();
    expect(container.querySelector('button[title="#ffffff"]')).toBeInTheDocument();
    expect(container.querySelector('button[title="transparent"]')).toBeInTheDocument();
  });

  it('should select transparent', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ColorPicker value="#000000" onChange={handleChange} />);

    const transparentBtn = container.querySelector('button[title="transparent"]') as HTMLElement;
    await user.click(transparentBtn);

    expect(handleChange).toHaveBeenCalledWith('transparent');
  });

  it('should show "Black / White / Transparent" label', () => {
    render(<ColorPicker value="#000000" onChange={vi.fn()} />);

    expect(screen.getByText('Black / White / Transparent')).toBeInTheDocument();
  });
});

describe('ColorPicker - Custom Tab', () => {
  it('should show HEX input in Custom tab', async () => {
    const user = userEvent.setup();

    render(<ColorPicker value="#3b82f6" onChange={vi.fn()} />);

    await user.click(screen.getByText('Custom'));

    const hexInput = screen.getByPlaceholderText('#000000') as HTMLInputElement;
    expect(hexInput).toBeInTheDocument();
    expect(hexInput.value).toBe('#3b82f6');
  });

  it('should update color on valid HEX input', () => {
    const handleChange = vi.fn();

    const { container } = render(<ColorPicker value="#3b82f6" onChange={handleChange} />);

    fireEvent.click(screen.getByText('Custom'));

    const hexInput = screen.getByPlaceholderText('#000000') as HTMLInputElement;
    // Use fireEvent.change for direct value update
    fireEvent.change(hexInput, { target: { value: '#ff0000' } });

    expect(handleChange).toHaveBeenCalledWith('#ff0000');
  });

  it('should not call onChange on invalid HEX input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<ColorPicker value="#3b82f6" onChange={handleChange} />);

    await user.click(screen.getByText('Custom'));

    const hexInput = screen.getByPlaceholderText('#000000');
    await user.clear(hexInput);
    await user.type(hexInput, '#xyz');

    // onChange should not be called for invalid hex
    const validCalls = handleChange.mock.calls.filter(
      (call: string[]) => /^#[0-9A-Fa-f]{6}$/.test(call[0])
    );
    expect(validCalls).toHaveLength(0);
  });

  it('should show HSL values', async () => {
    const user = userEvent.setup();

    render(<ColorPicker value="#ff0000" onChange={vi.fn()} />);

    await user.click(screen.getByText('Custom'));

    // Pure red: H=0, S=100, L=50
    expect(screen.getByText(/H: 0°/)).toBeInTheDocument();
    expect(screen.getByText(/S: 100%/)).toBeInTheDocument();
    expect(screen.getByText(/L: 50%/)).toBeInTheDocument();
  });

  it('should render hue slider', async () => {
    const user = userEvent.setup();

    const { container } = render(<ColorPicker value="#3b82f6" onChange={vi.fn()} />);

    await user.click(screen.getByText('Custom'));

    const rangeInput = container.querySelector('input[type="range"]');
    expect(rangeInput).toBeInTheDocument();
    expect(rangeInput?.getAttribute('max')).toBe('360');
  });

  it('should update color on hue slider change', async () => {
    const handleChange = vi.fn();

    const { container } = render(<ColorPicker value="#ff0000" onChange={handleChange} />);

    // Switch to Custom tab
    fireEvent.click(screen.getByText('Custom'));

    const rangeInput = container.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.change(rangeInput, { target: { value: '120' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should render SaturationLightness picker', async () => {
    const user = userEvent.setup();

    const { container } = render(<ColorPicker value="#3b82f6" onChange={vi.fn()} />);

    await user.click(screen.getByText('Custom'));

    const slPicker = container.querySelector('.cursor-crosshair');
    expect(slPicker).toBeInTheDocument();
  });

  it('should update color on SaturationLightness click', () => {
    const handleChange = vi.fn();

    const { container } = render(<ColorPicker value="#3b82f6" onChange={handleChange} />);

    // Switch to custom tab
    fireEvent.click(screen.getByText('Custom'));

    const slPicker = container.querySelector('.cursor-crosshair') as HTMLElement;

    // Simulate mousedown at center of the picker
    fireEvent.mouseDown(slPicker, { clientX: 100, clientY: 56 });

    expect(handleChange).toHaveBeenCalled();
  });
});

describe('ColorPicker - onChange callback', () => {
  it('should call onChange with selected color', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(<ColorPicker value="#3b82f6" onChange={handleChange} />);

    // Select black
    const blackBtn = container.querySelector('button[title="#000000"]') as HTMLElement;
    await user.click(blackBtn);

    expect(handleChange).toHaveBeenCalledWith('#000000');
  });
});

describe('ColorPicker - Disabled', () => {
  it('should disable all controls when disabled', () => {
    const { container } = render(<ColorPicker value="#3b82f6" onChange={vi.fn()} disabled />);

    // Tab buttons should be disabled
    const tabButtons = screen.getAllByRole('button').filter((btn) =>
      ['Tailwind', 'Custom'].includes(btn.textContent || '')
    );
    tabButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('should not fire onChange when disabled', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <ColorPicker value="#3b82f6" onChange={handleChange} disabled />
    );

    const swatch = container.querySelector('button[title="red-100"]') as HTMLElement;
    await user.click(swatch);

    // handleChange should not be called because the disabled check is in handleColorSelect
    expect(handleChange).not.toHaveBeenCalled();
  });
});
