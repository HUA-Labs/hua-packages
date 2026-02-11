import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Select } from '../Select';

describe('Select', () => {
  it('should render select element with options', () => {
    render(
      <Select aria-label="Choose option">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </Select>
    );

    const select = screen.getByRole('combobox', { name: 'Choose option' });
    expect(select).toBeInTheDocument();
    expect(select.querySelectorAll('option')).toHaveLength(3);
  });

  it('should render with placeholder', () => {
    render(
      <Select placeholder="Select an option">
        <option value="1">Option 1</option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    const placeholderOption = select.querySelector('option[value=""]');
    expect(placeholderOption).toBeInTheDocument();
    expect(placeholderOption).toHaveTextContent('Select an option');
    expect(placeholderOption).toHaveAttribute('disabled');
  });

  it('should fire onChange with selected value', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Select onChange={handleChange} aria-label="Select">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, '2');

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(select).toHaveValue('2');
  });

  it('should be disabled when disabled prop is set', () => {
    render(
      <Select disabled aria-label="Disabled select">
        <option value="1">Option 1</option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeDisabled();
  });

  it('should apply size variants', () => {
    const { container } = render(
      <Select size="lg" aria-label="Large select">
        <option value="1">Option 1</option>
      </Select>
    );

    const select = container.querySelector('select');
    expect(select).toHaveClass('h-12');
  });

  it('should have error state with aria-invalid', () => {
    render(
      <Select error aria-label="Error select">
        <option value="1">Option 1</option>
      </Select>
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-invalid', 'true');
  });

  it('should apply success state styles', () => {
    const { container } = render(
      <Select success aria-label="Success select">
        <option value="1">Option 1</option>
      </Select>
    );

    const select = container.querySelector('select');
    expect(select).toHaveClass('border-green-500');
  });
});
