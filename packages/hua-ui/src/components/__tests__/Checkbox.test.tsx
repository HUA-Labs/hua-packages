import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from '../Checkbox';

describe('Checkbox', () => {
  it('should render checkbox input', () => {
    render(<Checkbox label="Accept terms" />);

    const checkbox = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(checkbox).toBeInTheDocument();
  });

  it('should render with label text', () => {
    render(<Checkbox label="Subscribe to newsletter" />);

    const label = screen.getByText('Subscribe to newsletter');
    expect(label).toBeInTheDocument();
  });

  it('should toggle on user click', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    render(<Checkbox label="Toggle me" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('should have checked state initially', () => {
    render(<Checkbox label="Checked" defaultChecked />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Checkbox label="Disabled" disabled />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should fire onChange handler', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Checkbox label="Click me" onChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should have aria-invalid when error prop is set', () => {
    render(<Checkbox label="Error checkbox" error />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
  });

  it('should render description text', () => {
    render(<Checkbox label="Option" description="This is a description" />);

    const description = screen.getByText('This is a description');
    expect(description).toBeInTheDocument();
  });
});
