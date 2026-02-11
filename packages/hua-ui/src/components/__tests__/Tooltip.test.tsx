import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Tooltip, TooltipLight, TooltipDark } from '../Tooltip';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render children', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument();
  });

  it('should not show tooltip initially', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should show tooltip on mouse enter after delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={300}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Advance timers and run effects
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text" delay={100}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();

    fireEvent.mouseLeave(button);

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should not show tooltip when disabled', () => {
    render(
      <Tooltip content="Tooltip text" disabled={true}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should render with default variant', () => {
    const { container } = render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = container.querySelector('.bg-gray-800');
    expect(tooltip).toBeInTheDocument();
  });

  it('should render with light variant', () => {
    const { container } = render(
      <Tooltip content="Tooltip text" variant="light" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = container.querySelector('.bg-popover');
    expect(tooltip).toBeInTheDocument();
  });

  it('should render with dark variant', () => {
    const { container } = render(
      <Tooltip content="Tooltip text" variant="dark" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = container.querySelector('.bg-gray-900');
    expect(tooltip).toBeInTheDocument();
  });

  it('should render with custom delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    // Should not show before delay
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();

    // Should show after delay
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should cancel tooltip show if mouse leaves before delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    fireEvent.mouseLeave(button);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Tooltip content="Tooltip text" className="custom-tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const tooltipContainer = container.querySelector('.custom-tooltip');
    expect(tooltipContainer).toBeInTheDocument();
  });
});

describe('TooltipLight', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render with light variant', () => {
    const { container } = render(
      <TooltipLight content="Light tooltip" delay={0}>
        <button>Hover me</button>
      </TooltipLight>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = container.querySelector('.bg-popover');
    expect(tooltip).toBeInTheDocument();
  });
});

describe('TooltipDark', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should render with dark variant', () => {
    const { container } = render(
      <TooltipDark content="Dark tooltip" delay={0}>
        <button>Hover me</button>
      </TooltipDark>
    );

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    act(() => {
      vi.advanceTimersByTime(0);
    });

    const tooltip = container.querySelector('.bg-gray-900');
    expect(tooltip).toBeInTheDocument();
  });
});
