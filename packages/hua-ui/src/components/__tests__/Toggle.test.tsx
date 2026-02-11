import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  it('should render toggle button', () => {
    render(<Toggle label="Favorite" />);

    const toggle = screen.getByRole('button', { name: 'Favorite' });
    expect(toggle).toBeInTheDocument();
  });

  it('should have aria-pressed attribute', () => {
    render(<Toggle label="Toggle" pressed={false} />);

    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('should toggle pressed state on click', async () => {
    const user = userEvent.setup();
    render(<Toggle label="Toggle me" />);

    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it('should be controlled by pressed prop', async () => {
    const handlePressedChange = vi.fn();
    const user = userEvent.setup();

    render(<Toggle label="Controlled" pressed={false} onPressedChange={handlePressedChange} />);

    const toggle = screen.getByRole('button');
    await user.click(toggle);

    expect(handlePressedChange).toHaveBeenCalledWith(true);
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Toggle label="Disabled" disabled />);

    const toggle = screen.getByRole('button');
    expect(toggle).toBeDisabled();
  });

  it('should apply variant styles', () => {
    const { container } = render(<Toggle label="Ghost" variant="ghost" />);

    const toggle = container.querySelector('button');
    expect(toggle).toHaveClass('bg-transparent');
  });

  it('should render icon if provided', () => {
    render(<Toggle label="With Icon" icon={<span>🌙</span>} />);

    const icon = screen.getByText('🌙');
    expect(icon).toBeInTheDocument();
  });

  it('should fire onClick handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Toggle label="Click me" onClick={handleClick} />);

    const toggle = screen.getByRole('button');
    await user.click(toggle);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
