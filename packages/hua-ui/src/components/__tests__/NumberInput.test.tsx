import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NumberInput } from '../NumberInput';

describe('NumberInput', () => {
  it('should render number input', () => {
    render(<NumberInput aria-label="Quantity" />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should render increment and decrement buttons', () => {
    render(<NumberInput aria-label="Count" />);

    const increaseButton = screen.getByRole('button', { name: 'Increase' });
    const decreaseButton = screen.getByRole('button', { name: 'Decrease' });

    expect(increaseButton).toBeInTheDocument();
    expect(decreaseButton).toBeInTheDocument();
  });

  it('should increment value when increase button is clicked', async () => {
    const user = userEvent.setup();
    render(<NumberInput defaultValue={0} aria-label="Count" />);

    const input = screen.getByRole('textbox');
    const increaseButton = screen.getByRole('button', { name: 'Increase' });

    await user.click(increaseButton);
    expect(input).toHaveValue('1');

    await user.click(increaseButton);
    expect(input).toHaveValue('2');
  });

  it('should decrement value when decrease button is clicked', async () => {
    const user = userEvent.setup();
    render(<NumberInput defaultValue={5} aria-label="Count" />);

    const input = screen.getByRole('textbox');
    const decreaseButton = screen.getByRole('button', { name: 'Decrease' });

    await user.click(decreaseButton);
    expect(input).toHaveValue('4');
  });

  it('should respect min constraint', async () => {
    const user = userEvent.setup();
    render(<NumberInput defaultValue={0} min={0} aria-label="Count" />);

    const input = screen.getByRole('textbox');
    const decreaseButton = screen.getByRole('button', { name: 'Decrease' });

    await user.click(decreaseButton);
    expect(input).toHaveValue('0');
  });

  it('should respect max constraint', async () => {
    const user = userEvent.setup();
    render(<NumberInput defaultValue={10} max={10} aria-label="Count" />);

    const input = screen.getByRole('textbox');
    const increaseButton = screen.getByRole('button', { name: 'Increase' });

    await user.click(increaseButton);
    expect(input).toHaveValue('10');
  });

  it('should respect step prop', async () => {
    const user = userEvent.setup();
    render(<NumberInput defaultValue={0} step={5} aria-label="Count" />);

    const input = screen.getByRole('textbox');
    const increaseButton = screen.getByRole('button', { name: 'Increase' });

    await user.click(increaseButton);
    expect(input).toHaveValue('5');
  });

  it('should allow direct number input', async () => {
    const user = userEvent.setup();
    render(<NumberInput defaultValue={0} aria-label="Count" />);

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, '42');

    expect(input).toHaveValue('42');
  });

  it('should be disabled when disabled prop is set', () => {
    render(<NumberInput disabled aria-label="Disabled input" />);

    const input = screen.getByRole('textbox');
    const increaseButton = screen.getByRole('button', { name: 'Increase' });
    const decreaseButton = screen.getByRole('button', { name: 'Decrease' });

    expect(input).toBeDisabled();
    expect(increaseButton).toBeDisabled();
    expect(decreaseButton).toBeDisabled();
  });

  it('should call onChange when value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<NumberInput defaultValue={0} onChange={handleChange} aria-label="Count" />);

    const increaseButton = screen.getByRole('button', { name: 'Increase' });
    await user.click(increaseButton);

    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
