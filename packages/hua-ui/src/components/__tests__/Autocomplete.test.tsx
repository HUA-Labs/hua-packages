import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from '../Autocomplete';
import type { AutocompleteOption } from '../Autocomplete';

const defaultOptions: AutocompleteOption[] = [
  { value: '1', label: 'Apple' },
  { value: '2', label: 'Banana' },
  { value: '3', label: 'Cherry' },
];

const optionsWithMeta: AutocompleteOption[] = [
  { value: '1', label: 'React', description: 'A JavaScript library', icon: <span data-testid="icon-react">R</span> },
  { value: '2', label: 'Vue', description: 'Progressive framework' },
  { value: '3', label: 'Svelte', description: 'Cybernetically enhanced' },
];

describe('Autocomplete', () => {
  it('should render with default placeholder', () => {
    render(<Autocomplete options={defaultOptions} />);

    expect(screen.getByPlaceholderText('검색하거나 선택하세요')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<Autocomplete options={defaultOptions} placeholder="Search..." />);

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<Autocomplete options={defaultOptions} size="sm" />);

    const input = container.querySelector('input');
    expect(input?.className).toContain('h-8');

    rerender(<Autocomplete options={defaultOptions} size="lg" />);
    const input2 = container.querySelector('input');
    expect(input2?.className).toContain('h-12');
  });

  it('should show option icon and description', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<Autocomplete options={optionsWithMeta} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);

    expect(screen.getByTestId('icon-react')).toBeInTheDocument();
    expect(screen.getByText('A JavaScript library')).toBeInTheDocument();
  });

  it('should open dropdown on focus', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('should close dropdown on Escape', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should select option on click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);

    // Use fireEvent.click to avoid blur closing dropdown before click
    fireEvent.click(screen.getByText('Banana'));

    expect(handleChange).toHaveBeenCalledWith('2', expect.objectContaining({ value: '2', label: 'Banana' }));
  });

  it('should display selected option label in input', async () => {
    const user = userEvent.setup();

    const { rerender } = render(<Autocomplete options={defaultOptions} value="2" />);

    expect(screen.getByDisplayValue('Banana')).toBeInTheDocument();

    rerender(<Autocomplete options={defaultOptions} value="3" />);
    expect(screen.getByDisplayValue('Cherry')).toBeInTheDocument();
  });

  it('should select option with Enter key', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} onChange={handleChange} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);

    // Navigate to first option (index 0) and press Enter
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith('1', expect.objectContaining({ label: 'Apple' }));
  });

  it('should filter options by input text', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);
    await user.type(input, 'ban');

    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    expect(screen.queryByText('Cherry')).not.toBeInTheDocument();
  });

  it('should not filter when filterable is false', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} filterable={false} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);
    await user.type(input, 'ban');

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should show empty text when no results', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} emptyText="No results" />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);
    await user.type(input, 'xyz');

    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('should call onSearch for async search', async () => {
    const handleSearch = vi.fn().mockReturnValue([
      { value: 'r1', label: 'Result 1' },
    ]);
    const user = userEvent.setup();

    render(<Autocomplete options={[]} onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);
    await user.type(input, 'test');

    expect(handleSearch).toHaveBeenCalled();
  });

  it('should handle async Promise search', async () => {
    const handleSearch = vi.fn().mockResolvedValue([
      { value: 'r1', label: 'Async Result' },
    ]);
    const user = userEvent.setup();

    render(<Autocomplete options={[]} onSearch={handleSearch} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);
    await user.type(input, 'async');

    expect(handleSearch).toHaveBeenCalled();
  });

  it('should navigate with ArrowDown/Up keys', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);

    await user.keyboard('{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(options[0].className).toContain('bg-primary/10');

    await user.keyboard('{ArrowDown}');
    expect(options[1].className).toContain('bg-primary/10');

    await user.keyboard('{ArrowUp}');
    expect(options[0].className).toContain('bg-primary/10');
  });

  it('should not go below last option with ArrowDown', async () => {
    const user = userEvent.setup();
    const twoOptions = [
      { value: '1', label: 'First' },
      { value: '2', label: 'Second' },
    ];

    render(<Autocomplete options={twoOptions} />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    await user.click(input);

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');

    const options = screen.getAllByRole('option');
    expect(options[1].className).toContain('bg-primary/10');
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} value="1" />);

    expect(screen.getByRole('button', { name: '지우기' })).toBeInTheDocument();
  });

  it('should clear value on clear button click', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Autocomplete options={defaultOptions} value="1" onChange={handleChange} />);

    await user.click(screen.getByRole('button', { name: '지우기' }));

    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('should show loading state', () => {
    const { container } = render(<Autocomplete options={defaultOptions} loading />);

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should be disabled', () => {
    render(<Autocomplete options={defaultOptions} disabled />);

    const input = screen.getByPlaceholderText('검색하거나 선택하세요');
    expect(input).toBeDisabled();
  });
});
