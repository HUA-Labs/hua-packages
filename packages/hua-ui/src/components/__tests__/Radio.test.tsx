import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Radio } from '../Radio';

describe('Radio', () => {
  it('should render radio input', () => {
    render(<Radio label="Option 1" value="1" name="group" />);

    const radio = screen.getByRole('radio', { name: 'Option 1' });
    expect(radio).toBeInTheDocument();
  });

  it('should render label text', () => {
    render(<Radio label="Select this option" value="1" name="group" />);

    const label = screen.getByText('Select this option');
    expect(label).toBeInTheDocument();
  });

  it('should work as a group with same name', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Radio label="Option 1" value="1" name="options" />
        <Radio label="Option 2" value="2" name="options" />
        <Radio label="Option 3" value="3" name="options" />
      </div>
    );

    const radio1 = screen.getByRole('radio', { name: 'Option 1' });
    const radio2 = screen.getByRole('radio', { name: 'Option 2' });

    await user.click(radio1);
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();

    await user.click(radio2);
    expect(radio1).not.toBeChecked();
    expect(radio2).toBeChecked();
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Radio label="Disabled" value="1" name="group" disabled />);

    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
  });

  it('should have aria-invalid when error prop is set', () => {
    render(<Radio label="Error radio" value="1" name="group" error />);

    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('aria-invalid', 'true');
  });

  it('should fire onChange handler', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Radio label="Click me" value="1" name="group" onChange={handleChange} />);

    const radio = screen.getByRole('radio');
    await user.click(radio);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should render description text', () => {
    render(
      <Radio
        label="Option"
        value="1"
        name="group"
        description="Additional info"
      />
    );

    const description = screen.getByText('Additional info');
    expect(description).toBeInTheDocument();
  });
});
