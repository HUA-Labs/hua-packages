import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from '../DatePicker';

describe('DatePicker', () => {
  it('should render with default placeholder', () => {
    render(<DatePicker />);

    expect(screen.getByText('날짜를 선택하세요')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<DatePicker placeholder="Pick a date" />);

    expect(screen.getByText('Pick a date')).toBeInTheDocument();
  });

  it('should display formatted date when value is set', () => {
    const date = new Date(2024, 5, 15); // June 15, 2024

    render(<DatePicker value={date} />);

    expect(screen.getByText('2024-06-15')).toBeInTheDocument();
  });

  it('should display date with custom format', () => {
    const date = new Date(2024, 0, 1); // Jan 1, 2024

    render(<DatePicker value={date} dateFormat="DD/MM/YYYY" />);

    expect(screen.getByText('01/01/2024')).toBeInTheDocument();
  });

  it('should apply size variants', () => {
    const { container, rerender } = render(<DatePicker size="sm" />);

    const trigger = container.querySelector('button');
    expect(trigger?.className).toContain('h-8');

    rerender(<DatePicker size="lg" />);
    const trigger2 = container.querySelector('button');
    expect(trigger2?.className).toContain('h-12');
  });

  it('should open calendar on trigger click', async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<DatePicker />);

    await user.click(screen.getByText('날짜를 선택하세요'));

    // Weekday headers should appear
    expect(screen.getByText('일')).toBeInTheDocument();
    expect(screen.getByText('월')).toBeInTheDocument();
  });

  it('should display month header', async () => {
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 5, 15)} />);

    await user.click(screen.getByText('2024-06-15'));

    expect(screen.getByText('2024년 6월')).toBeInTheDocument();
  });

  it('should navigate to previous month', async () => {
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 5, 15)} />);

    await user.click(screen.getByText('2024-06-15'));
    expect(screen.getByText('2024년 6월')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '이전 달' }));
    expect(screen.getByText('2024년 5월')).toBeInTheDocument();
  });

  it('should navigate to next month', async () => {
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 5, 15)} />);

    await user.click(screen.getByText('2024-06-15'));

    await user.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByText('2024년 7월')).toBeInTheDocument();
  });

  it('should select a date and call onChange', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 5, 15)} onChange={handleChange} />);

    await user.click(screen.getByText('2024-06-15'));

    // Click day 20
    await user.click(screen.getByRole('button', { name: '2024년 6월 20일' }));

    expect(handleChange).toHaveBeenCalledTimes(1);
    const selectedDate = handleChange.mock.calls[0][0] as Date;
    expect(selectedDate.getDate()).toBe(20);
    expect(selectedDate.getMonth()).toBe(5);
  });

  it('should not allow selecting dates before minDate', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const minDate = new Date(2024, 5, 10);
    minDate.setHours(0, 0, 0, 0);

    render(
      <DatePicker
        value={new Date(2024, 5, 15)}
        onChange={handleChange}
        minDate={minDate}
      />
    );

    await user.click(screen.getByText('2024-06-15'));

    // Try to click day 5 (before minDate)
    const day5 = screen.getByRole('button', { name: '2024년 6월 5일' });
    await user.click(day5);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should not allow selecting dates after maxDate', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    const maxDate = new Date(2024, 5, 20);
    maxDate.setHours(23, 59, 59, 999);

    render(
      <DatePicker
        value={new Date(2024, 5, 15)}
        onChange={handleChange}
        maxDate={maxDate}
      />
    );

    await user.click(screen.getByText('2024-06-15'));

    // Try to click day 25 (after maxDate)
    const day25 = screen.getByRole('button', { name: '2024년 6월 25일' });
    await user.click(day25);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it('should visually disable dates outside range', async () => {
    const user = userEvent.setup();
    const minDate = new Date(2024, 5, 10);
    minDate.setHours(0, 0, 0, 0);

    render(
      <DatePicker
        value={new Date(2024, 5, 15)}
        minDate={minDate}
      />
    );

    await user.click(screen.getByText('2024-06-15'));

    const day5 = screen.getByRole('button', { name: '2024년 6월 5일' });
    expect(day5).toBeDisabled();
  });

  it('should show markedDates indicator', async () => {
    const user = userEvent.setup();
    const markedDates = [new Date(2024, 5, 10), new Date(2024, 5, 20)];

    const { container } = render(
      <DatePicker value={new Date(2024, 5, 15)} markedDates={markedDates} />
    );

    await user.click(screen.getByText('2024-06-15'));

    // The marked date button should contain the mark indicator span
    const day10 = screen.getByRole('button', { name: '2024년 6월 10일' });
    expect(day10.querySelector('.rounded-full')).toBeInTheDocument();
  });

  it('should support en-US locale', async () => {
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 0, 15)} locale="en-US" />);

    await user.click(screen.getByText('2024-01-15'));

    expect(screen.getByText('January 2024')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('should support ja-JP locale', async () => {
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 0, 15)} locale="ja-JP" />);

    await user.click(screen.getByText('2024-01-15'));

    expect(screen.getByText('2024年 1月')).toBeInTheDocument();
    expect(screen.getByText('日')).toBeInTheDocument();
    expect(screen.getByText('今日')).toBeInTheDocument();
  });

  it('should show "오늘" button for ko-KR locale', async () => {
    const user = userEvent.setup();

    render(<DatePicker value={new Date(2024, 5, 15)} />);

    await user.click(screen.getByText('2024-06-15'));

    expect(screen.getByText('오늘')).toBeInTheDocument();
  });

  it('should select today when today button is clicked', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<DatePicker onChange={handleChange} />);

    await user.click(screen.getByText('날짜를 선택하세요'));
    await user.click(screen.getByText('오늘'));

    expect(handleChange).toHaveBeenCalledTimes(1);
    const selected = handleChange.mock.calls[0][0] as Date;
    const today = new Date();
    expect(selected.getDate()).toBe(today.getDate());
    expect(selected.getMonth()).toBe(today.getMonth());
  });

  it('should be disabled', () => {
    render(<DatePicker disabled />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeDisabled();
  });

  it('should show error state', () => {
    const { container } = render(<DatePicker error />);

    const trigger = container.querySelector('button');
    expect(trigger?.className).toContain('border-destructive');
  });
});
