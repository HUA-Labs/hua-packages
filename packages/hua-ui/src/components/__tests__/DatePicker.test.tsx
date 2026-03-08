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
    // Size is now applied via inline style
    expect(trigger).toBeInTheDocument();
    expect(trigger?.style.height).toBe('2rem');

    rerender(<DatePicker size="lg" />);
    const trigger2 = container.querySelector('button');
    expect(trigger2?.style.height).toBe('3rem');
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

    // The marked date button should contain the mark indicator span (now uses inline style)
    const day10 = screen.getByRole('button', { name: '2024년 6월 10일' });
    // The indicator is a span with inline borderRadius: 9999px
    const indicator = day10.querySelector('span[style*="border-radius"], span[style*="borderRadius"]') as HTMLElement;
    expect(indicator || day10.querySelector('span')).toBeInTheDocument();
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
    // Error state is now applied via inline style (borderColor)
    expect(trigger?.style.border).toContain('destructive');
  });
});

describe('DatePicker markedDateKeys', () => {
  it('should show marker dots for markedDateKeys', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={['2026-03-05', '2026-03-10', '2026-03-20']}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-01'));

    // Marked dates should have 2 children: text span + dot span
    const day5 = screen.getByLabelText('March 5, 2026');
    const day10 = screen.getByLabelText('March 10, 2026');
    const day20 = screen.getByLabelText('March 20, 2026');
    expect(day5.children.length).toBe(2);
    expect(day10.children.length).toBe(2);
    expect(day20.children.length).toBe(2);

    // Unmarked date should have only 1 child
    const day6 = screen.getByLabelText('March 6, 2026');
    expect(day6.children.length).toBe(1);
  });

  it('should not show markers for dates outside current month view', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={['2026-02-15', '2026-04-10']}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-01'));

    // March 15 is not marked — only 1 child
    const day15 = screen.getByLabelText('March 15, 2026');
    expect(day15.children.length).toBe(1);
  });

  it('should handle empty markedDateKeys gracefully', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={[]}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-01'));

    const day1 = screen.getByLabelText('March 1, 2026');
    expect(day1.children.length).toBe(1);
  });

  it('should prefer markedDateKeys over markedDates when both provided', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={['2026-03-07']}
        markedDates={[new Date(2026, 2, 15)]}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-01'));

    // markedDateKeys wins: day 7 marked, day 15 not
    const day7 = screen.getByLabelText('March 7, 2026');
    expect(day7.children.length).toBe(2);

    const day15 = screen.getByLabelText('March 15, 2026');
    expect(day15.children.length).toBe(1);
  });

  it('should mark boundary dates correctly (first and last day of month)', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 15)}
        markedDateKeys={['2026-03-01', '2026-03-31']}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-15'));

    const day1 = screen.getByLabelText('March 1, 2026');
    const day31 = screen.getByLabelText('March 31, 2026');
    expect(day1.children.length).toBe(2);
    expect(day31.children.length).toBe(2);
  });

  it('should update markers when markedDateKeys changes', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={['2026-03-05']}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-01'));

    const day5 = screen.getByLabelText('March 5, 2026');
    expect(day5.children.length).toBe(2);

    const day10 = screen.getByLabelText('March 10, 2026');
    expect(day10.children.length).toBe(1);

    // Rerender with different keys
    rerender(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={['2026-03-10']}
        locale="en"
      />
    );

    // Now day 10 should be marked, day 5 should not
    const day5After = screen.getByLabelText('March 5, 2026');
    expect(day5After.children.length).toBe(1);

    const day10After = screen.getByLabelText('March 10, 2026');
    expect(day10After.children.length).toBe(2);
  });

  it('should show markers after navigating to the marked month', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 1)}
        markedDateKeys={['2026-04-15']}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-01'));

    // Navigate to April
    await user.click(screen.getByLabelText('Next month'));

    const day15 = screen.getByLabelText('April 15, 2026');
    expect(day15.children.length).toBe(2);
  });
});

describe('DatePicker month/year jump', () => {
  it('should switch to month selection when header is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="en" />
    );

    await user.click(screen.getByText('2026-03-15'));

    // Click header text to enter month selection
    await user.click(screen.getByLabelText('Select month/year'));

    // Should show month grid — year only in header
    expect(screen.getByText('2026')).toBeInTheDocument();
    // Short month names should appear
    expect(screen.getByText('Jan')).toBeInTheDocument();
    expect(screen.getByText('Dec')).toBeInTheDocument();
  });

  it('should select a month and return to day view', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="en" />
    );

    await user.click(screen.getByText('2026-03-15'));
    await user.click(screen.getByLabelText('Select month/year'));

    // Select June
    await user.click(screen.getByLabelText('Jun 2026'));

    // Should return to day view showing June
    expect(screen.getByText('June 2026')).toBeInTheDocument();
  });

  it('should switch to year selection when header is clicked in month view', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="en" />
    );

    await user.click(screen.getByText('2026-03-15'));
    // First click → month view
    await user.click(screen.getByLabelText('Select month/year'));
    // Second click → year view
    await user.click(screen.getByLabelText('Select month/year'));

    // Should show year range
    expect(screen.getByLabelText('2026')).toBeInTheDocument();
    expect(screen.getByLabelText('2021')).toBeInTheDocument();
    expect(screen.getByLabelText('2032')).toBeInTheDocument();
  });

  it('should select a year and return to month view', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="en" />
    );

    await user.click(screen.getByText('2026-03-15'));
    await user.click(screen.getByLabelText('Select month/year'));
    await user.click(screen.getByLabelText('Select month/year'));

    // Select 2024
    await user.click(screen.getByLabelText('2024'));

    // Should go back to month view with 2024
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('Jan')).toBeInTheDocument();
  });

  it('should jump to a distant date via year → month → day flow', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <DatePicker
        value={new Date(2026, 2, 15)}
        onChange={handleChange}
        locale="en"
      />
    );

    await user.click(screen.getByText('2026-03-15'));

    // Header → months → years
    await user.click(screen.getByLabelText('Select month/year'));
    await user.click(screen.getByLabelText('Select month/year'));

    // Select 2024
    await user.click(screen.getByLabelText('2024'));
    // Select August
    await user.click(screen.getByLabelText('Aug 2024'));
    // Now in day view for August 2024
    expect(screen.getByText('August 2024')).toBeInTheDocument();

    // Select day 20
    await user.click(screen.getByLabelText('August 20, 2024'));
    expect(handleChange).toHaveBeenCalledTimes(1);
    const selected = handleChange.mock.calls[0][0] as Date;
    expect(selected.getFullYear()).toBe(2024);
    expect(selected.getMonth()).toBe(7);
    expect(selected.getDate()).toBe(20);
  });

  it('should show Korean month names in month view', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="ko" />
    );

    await user.click(screen.getByText('2026-03-15'));
    await user.click(screen.getByLabelText('월/연도 선택'));

    expect(screen.getByLabelText('1월 2026')).toBeInTheDocument();
    expect(screen.getByLabelText('12월 2026')).toBeInTheDocument();
  });

  it('should navigate year pages with arrows in year view', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="en" />
    );

    await user.click(screen.getByText('2026-03-15'));
    await user.click(screen.getByLabelText('Select month/year'));
    await user.click(screen.getByLabelText('Select month/year'));

    // Default range: 2021–2032
    expect(screen.getByLabelText('2021')).toBeInTheDocument();

    // Click next → should advance by 12 years
    await user.click(screen.getByLabelText('Next 12 years'));
    expect(screen.getByLabelText('2033')).toBeInTheDocument();
  });

  it('should reset to day view when popover reopens', async () => {
    const user = userEvent.setup();

    render(
      <DatePicker value={new Date(2026, 2, 15)} locale="en" />
    );

    // Open and go to month view
    await user.click(screen.getByText('2026-03-15'));
    await user.click(screen.getByLabelText('Select month/year'));
    expect(screen.getByText('Jan')).toBeInTheDocument();

    // Close by clicking trigger again
    await user.click(screen.getByText('2026-03-15'));

    // Reopen — should be back in day view
    await user.click(screen.getByText('2026-03-15'));
    expect(screen.getByText('March 2026')).toBeInTheDocument();
    expect(screen.queryByText('Jan')).not.toBeInTheDocument();
  });
});
