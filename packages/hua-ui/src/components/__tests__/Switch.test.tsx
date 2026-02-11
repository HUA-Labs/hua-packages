import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('should render switch element', () => {
    render(<Switch label="Enable notifications" />);

    const switchElement = screen.getByRole('switch', { name: 'Enable notifications' });
    expect(switchElement).toBeInTheDocument();
  });

  it('should have role="switch"', () => {
    render(<Switch aria-label="Toggle" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('role', 'switch');
  });

  it('should have aria-checked attribute', () => {
    render(<Switch aria-label="Toggle" checked={false} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-checked', 'false');
  });

  it('should toggle on user click', async () => {
    const user = userEvent.setup();
    render(<Switch label="Toggle me" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();

    await user.click(switchElement);
    expect(switchElement).toBeChecked();

    await user.click(switchElement);
    expect(switchElement).not.toBeChecked();
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Switch label="Disabled" disabled />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('should fire onChange handler', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Switch label="Click me" onChange={handleChange} />);

    const switchElement = screen.getByRole('switch');
    await user.click(switchElement);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should have aria-invalid when error prop is set', () => {
    render(<Switch label="Error switch" error />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('aria-invalid', 'true');
  });

  it('should render label if provided', () => {
    render(<Switch label="Dark mode" />);

    const label = screen.getByText('Dark mode');
    expect(label).toBeInTheDocument();
  });
});
